import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../utils/api";
const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  const [columnsVisibility, setColumnsVisibility] = useState({
    accountName: true,
    accountNumber: true,
    accountType: true,
    addedBy: true,
    amount: true,
    action: true,
  });
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [depositFormData, setDepositFormData] = useState({
    amount: "",
    date: "",
    note: "",
  });
  const [addedBy, setAddedBy] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setAddedBy(email);
    }
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Step 1: Fetch all accounts
        const res = await api.get("/payment-account/getall");
        const accountsData = res.data;

        const sortedAccounts = accountsData.sort((a, b) => b.id - a.id);

        // Step 2: For each account, fetch its balance
        const updatedAccounts = await Promise.all(
          sortedAccounts.map(async (account) => {
            try {
              const balanceRes = await api.get(
                `/payment-account/balance/${account.id}`
              );
              return {
                ...account,
                amount: balanceRes.data,
              };
            } catch (error) {
              console.error(
                `Error fetching balance for account ID ${account.id}:`,
                error
              );
              return account;
            }
          })
        );

        // Step 3: Update state
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);

        // // Step 4: Inject external script (if needed)
        // const script = document.createElement("script");
        // script.src = "/js/JqueryContent.js";
        // script.async = true;
        // document.body.appendChild(script);

        // return () => {
        //   document.body.removeChild(script);
        // };
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
      }
    };

    fetchAccounts();
  }, []);

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleDeposit = (id) => {
    setCurrentAccount(id);
    setDepositModalOpen(true);
  };

  const handleDepositFormChange = (e) => {
    const { id, value } = e.target;
    setDepositFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDepositSubmit = async () => {
    const payload = {
      amount: depositFormData.amount,
      paymentMethod: "cash",
      transactionType: "deposit",
      addedBy: addedBy,
      note: depositFormData.note,
      date: depositFormData.date,
      vendor: "",
    };

    try {
      const response = await api.post(
        `/payment-account/${currentAccount}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        alert("Deposit added successfully!");
        setDepositModalOpen(false);
        const updatedAccounts = accounts.map((account) =>
          account.id === currentAccount
            ? {
                ...account,
                balance: account.balance + Number(depositFormData.amount),
              }
            : account
        );
        setAccounts(updatedAccounts);
      } else {
        alert("Failed to add deposit.");
      }
    } catch (error) {
      console.error("Error adding deposit:", error);
      alert("Error adding deposit.");
    }
  };

  const handleModalClose = () => {
    setDepositModalOpen(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const confirmationMessage =
      newStatus === 0
        ? "Are you sure you want to deactivate this account?"
        : "Are you sure you want to activate this account?";

    if (window.confirm(confirmationMessage)) {
      try {
        const response = await api.put(
          `/payment-account/update-status/${id}?status=${newStatus}`
        );

        if (response.status === 200 || response.status === 204) {
          setAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.id === id ? { ...account, status: newStatus } : account
            )
          );

          alert(
            `Account ${
              newStatus === 1 ? "activated" : "deactivated"
            } successfully!`
          );
        } else {
          alert("Failed to update account status.");
        }
      } catch (error) {
        console.error("Error updating account status:", error);
        alert("Error updating account status.");
      }
    }
  };

  const handleAccountBook = (id) => {
    navigate(`/AccountBook/${id}`);
  };
  const calculateAccountBalance = (transactions) => {
    let balance = 0;

    if (!transactions) return 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount);
      const type = t.transactionType;

      if (["deposit", "opening_balance", "sale"].includes(type)) {
        balance += amount;
      } else if (["purchase", "expense", "payment"].includes(type)) {
        balance -= amount;
      }
    });

    return balance.toFixed(2);
  };
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const exportCSV = () => {
    const headers = [
      "Account Name",
      "Account Number",
      "Account Type",
      "Added By",
      "Account Balance",
    ];
    const rows = [
      headers.join(","),
      ...accounts.map((account) =>
        [
          account.accountName,
          account.accountNumber,
          account.accountType,
          account.transactions[0]?.addedBy || "-",
          account.amount,
        ].join(",")
      ),
    ];
    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "accounts.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      accounts.map((account) => ({
        AccountName: account.accountName,
        AccountNumber: account.accountNumber,
        AccountType: account.accountType,
        AddedBy: account.transactions[0]?.addedBy || "-",
        AccountBalance: account.amount,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    XLSX.writeFile(wb, "accounts.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "Account Name",
          "Account Number",
          "Account Type",
          "Added By",
          "Account Balance",
        ],
      ],
      body: accounts.map((account) => [
        account.accountName,
        account.accountNumber,
        account.accountType,
        account.transactions[0]?.addedBy || "-",
        account.amount,
      ]),
    });
    doc.save("accounts.pdf");
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const tableContent = `
      <html>
        <head>
          <title>Accounts List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Accounts List</h2>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Account Number</th>
                <th>Account Type</th>
                <th>Added By</th>
                <th>Account Balance</th>
              </tr>
            </thead>
            <tbody>
              ${accounts
                .map(
                  (account) => `
                    <tr>
                      <td>${account.accountName}</td>
                      <td>${account.accountNumber}</td>
                      <td>${account.accountType}</td>
                      <td>${account.transactions[0]?.addedBy || "-"}</td>
                      <td>${account.amount}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(e.target.value);
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header py-3">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List Account</h1>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddAccount" className="btn btn-add">
                  <i className="fas fa-plus"></i> Add
                </Link>
              </div>

              <div className="card-body">
                <div className="row mb-3 d-flex align-items-center">
                  <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold mt-2 mb-2 mr-2">
                    <label htmlFor="entriesPerPage" className="mb-0 mr-2">
                      Show
                    </label>
                    <select
                      id="entriesPerPage"
                      className="form-control form-control-sm mr-2"
                      value={entriesPerPage}
                      onChange={handleEntriesChange}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={75}>75</option>
                      <option value={100}>100</option>
                    </select>
                    Entries
                  </div>
                  <div className="col d-flex flex-wrap align-items-center">
                    <button
                      onClick={exportCSV}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-csv"></i> Export CSV
                    </button>

                    <button
                      onClick={exportExcel}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-excel"></i> Export Excel
                    </button>

                    <button
                      onClick={printTable}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-print"></i> Print
                    </button>

                    <button
                      onClick={exportPDF}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-pdf"></i> Export PDF
                    </button>

                    <div className="dropdown mt-lg-2 mb-lg-2">
                      <button
                        className="btn Export-Btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fa fa-columns"></i> Column Visibility
                      </button>
                      <div
                        className="dropdown-menu pointer-event"
                        aria-labelledby="dropdownMenuButton"
                      >
                        {Object.keys(columnsVisibility).map((col) => (
                          <div
                            key={col}
                            className="dropdown-item d-flex align-items-center"
                          >
                            <input
                              type="checkbox"
                              checked={columnsVisibility[col]}
                              onChange={() => toggleColumn(col)}
                              className="mr-2"
                            />
                            {col.replace(/([A-Z])/g, " $1").toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table
                    id="example1"
                    className="table table-bordered table-hover shadow"
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.accountName && <th>Account Name</th>}
                        {columnsVisibility.accountNumber && (
                          <th>Account Number</th>
                        )}
                        {columnsVisibility.accountType && <th>Account Type</th>}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                        {columnsVisibility.amount && <th>Account Balance</th>}
                        {columnsVisibility.action && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts
                        .slice(startIndex, endIndex)
                        .map((account) => (
                          <tr key={account.id}>
                            {columnsVisibility.accountName && (
                              <td>{account.accountName}</td>
                            )}
                            {columnsVisibility.accountNumber && (
                              <td>{account.accountNumber}</td>
                            )}
                            {columnsVisibility.accountType && (
                              <td>{account.accountType}</td>
                            )}
                            {columnsVisibility.addedBy && (
                              <td>{account.transactions[0]?.addedBy || "-"}</td>
                            )}
                            {columnsVisibility.amount && (
                              <td>
                                {calculateAccountBalance(account.transactions)}
                              </td>
                            )}

                            {columnsVisibility.action && (
                              <td>
                                <button
                                  className="btn btn-edit btn-sm mr-2 m-auto"
                                  onClick={() => handleAccountBook(account.id)}
                                >
                                  <i className="fas fa-book"></i> Account Book
                                </button>
                                <button
                                  className="btn btn-view btn-sm mr-2 m-auto"
                                  onClick={() => handleDeposit(account.id)}
                                >
                                  <i className="fa-solid fa-money-bill-transfer"></i>{" "}
                                  Deposit
                                </button>
                                {account.status === 1 ? (
                                  <button
                                    className="btn btn-delete btn-sm mr-2 m-auto"
                                    onClick={() =>
                                      handleUpdateStatus(account.id, 0)
                                    }
                                  >
                                    <i className="fas fa-trash"></i> Deactivate
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-edit btn-sm mr-2 m-auto"
                                    onClick={() =>
                                      handleUpdateStatus(account.id, 1)
                                    }
                                  >
                                    <i className="fas fa-check-circle "></i>{" "}
                                    Activate
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isDepositModalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deposit</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleModalClose}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      className="form-control"
                      value={depositFormData.amount}
                      onChange={handleDepositFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      value={depositFormData.date}
                      onChange={handleDepositFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="note">Note</label>
                    <textarea
                      id="note"
                      className="form-control"
                      rows="3"
                      value={depositFormData.note}
                      onChange={handleDepositFormChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDepositSubmit}
                >
                  Save Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
