import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Dropdown, DropdownButton, Modal, Button } from "react-bootstrap";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ListSellReturn = () => {
  const [purchases, setPurchases] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    saleDate: true,
    invoiceNo: true,
    customerName: true,
    paymentStatus: true,
    netTotalAmount: true,
    totalPaid: true,
    returnDue: true,
    totalItems: true,
    addedBy: true,
  });

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Add these new states for filters
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [filterValues, setFilterValues] = useState({
    customers: [],
    paymentStatuses: ["Paid", "Pending", "Partial"],
  });
  const [activeFilters, setActiveFilters] = useState({
    customer: "",
    paymentStatus: "",
    dateRange: "",
  });

  // Extract filter values when purchases data changes
  useEffect(() => {
    if (purchases.length > 0) {
      const customers = [
        ...new Set(purchases.map((item) => item.customerName)),
      ].filter(Boolean);

      setFilterValues({
        customers,
        paymentStatuses: ["Paid", "Pending", "Partial"],
      });
    }
  }, [purchases]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveFilters({
      customer: "",
      paymentStatus: "",
      dateRange: "",
    });
  };

  // Filter the purchases based on active filters
  const filteredPurchases = purchases.filter((purchase) => {
    // Customer filter
    if (
      activeFilters.customer &&
      purchase.customerName !== activeFilters.customer
    ) {
      return false;
    }

    // Payment Status filter
    if (
      activeFilters.paymentStatus &&
      purchase.paymentStatus !== activeFilters.paymentStatus
    ) {
      return false;
    }

    // Date range filter
    if (activeFilters.dateRange) {
      // Implement date range filtering based on your data structure
    }

    return true;
  });

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/saleReturn/getall`
        );

        const data = response.data;
        console.log(data);

        if (Array.isArray(data)) {
          const sortedData = data.sort(
            (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
          );
          setPurchases(sortedData); // Update state with fetched data
        } else {
          console.error("Fetched data is not an array");
          setPurchases([]);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setPurchases([]);
      }

      // Dynamically load the script
      const script = document.createElement("script");
      script.src = "js/JqueryContent.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    fetchPurchases();
  }, []);

  const handleEditClick = (id) => {
    navigate(`/EditSaleReturn/${id}`);
  };
  const handleViewClick = (id) => {
    navigate(`/ViewSaleReturn/${id}`);
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this return? This will update the stock."
      )
    ) {
      try {
        const response = await api.delete(
          `${process.env.REACT_APP_BASE_URL}/saleReturn/delete/${id}`
        );

        if (response.status === 204) {
          // Update stock and account here if needed
          setPurchases((prevPurchases) =>
            prevPurchases.filter((purchase) => purchase.id !== id)
          );
          alert("Return deleted successfully and stock updated!");
        } else {
          alert("Failed to delete return.");
        }
      } catch (error) {
        console.error("Error deleting return:", error);
      }
    }
  };

  // Payment related functions
  const handlePaymentStatusClick = async (returnItem) => {
    setSelectedReturn(returnItem);

    try {
      // Fetch payment history for this return
      const response = await api.get(
        `${process.env.REACT_APP_BASE_URL}/payments/getByReturn/${returnItem.id}`
      );
      setPaymentHistory(response.data || []);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentHistory([]);
      setShowPaymentModal(true);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedReturn || paymentAmount <= 0) return;

    try {
      const paymentData = {
        returnId: selectedReturn.id,
        amount: paymentAmount,
        date: paymentDate.toISOString().split("T")[0],
        method: paymentMethod,
        notes: `Payment for return ${selectedReturn.invoiceNo}`,
      };

      const response = await api.post(
        `${process.env.REACT_APP_BASE_URL}/payments/add`,
        paymentData
      );

      if (response.status === 201) {
        // Update the payment history
        setPaymentHistory([...paymentHistory, response.data]);

        // Update the return's payment status
        const updatedReturns = purchases.map((returnItem) => {
          if (returnItem.id === selectedReturn.id) {
            const newPaidAmount = (returnItem.totalPaid || 0) + paymentAmount;
            let newStatus = "Pending";

            if (newPaidAmount >= returnItem.netTotalAmount) {
              newStatus = "Paid";
            } else if (newPaidAmount > 0) {
              newStatus = "Partial";
            }

            return {
              ...returnItem,
              totalPaid: newPaidAmount,
              paymentStatus: newStatus,
              returnDue: returnItem.netTotalAmount - newPaidAmount,
            };
          }
          return returnItem;
        });

        setPurchases(updatedReturns);
        setPaymentAmount(0);
        alert("Payment added successfully!");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment.");
    }
  };

  const exportCSV = () => {
    const csvData = purchases.map((purchase) => ({
      "Return Date": purchase.saleDate,
      "Invoice No": purchase.invoiceNo,
      "Customer Name": purchase.customerName,
      "Payment Status": purchase.paymentStatus,
      "Total Amount": purchase.netTotalAmount,
      "Total Paid": purchase.totalPaid || 0,
      "Return Due":
        purchase.returnDue ||
        purchase.netTotalAmount - (purchase.totalPaid || 0),
      "Total Items": purchase.totalItems,
      "Added By": purchase.addedBy,
    }));

    const csv = [
      Object.keys(csvData[0]),
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "sell_returns.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      purchases.map((purchase) => ({
        "Return Date": purchase.saleDate,
        "Invoice No": purchase.invoiceNo,
        "Customer Name": purchase.customerName,
        "Payment Status": purchase.paymentStatus,
        "Total Amount": purchase.netTotalAmount,
        "Total Paid": purchase.totalPaid || 0,
        "Return Due":
          purchase.returnDue ||
          purchase.netTotalAmount - (purchase.totalPaid || 0),
        "Total Items": purchase.totalItems,
        "Added By": purchase.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sell Returns");
    XLSX.writeFile(wb, "sell_returns.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Define the column headers
    const headers = [
      "Return Date",
      "Invoice No",
      "Customer",
      "Payment Status",
      "Total Amount",
      "Paid",
      "Due",
      "Items",
      "Added By",
    ];

    // Map through the return data and prepare the body
    const body = purchases.map((p) => [
      p.saleDate,
      p.invoiceNo,
      p.customerName,
      p.paymentStatus,
      p.netTotalAmount,
      p.totalPaid || 0,
      p.returnDue || p.netTotalAmount - (p.totalPaid || 0),
      p.totalItems,
      p.addedBy,
    ]);

    // Add some space before the table
    doc.text("Sell Return List", 14, 20);
    doc.setFontSize(12);
    doc.text("Below is the list of sell returns with their details:", 14, 30);

    // Generate the PDF table with custom styles
    doc.autoTable({
      head: [headers],
      body: body,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [22, 160, 133], // Bootstrap success color
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray for alternate rows
      },
      margin: { top: 50 },
    });

    // Save the PDF
    doc.save("SellReturnList.pdf");
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const printData = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    const tableContent = `
      <html>
        <head>
          <title>Print Sell Returns</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Sell Return Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.saleDate ? "<th>Return Date</th>" : ""}
                ${columnsVisibility.invoiceNo ? "<th>Invoice No</th>" : ""}
                ${columnsVisibility.customerName ? "<th>Customer</th>" : ""}
                ${columnsVisibility.paymentStatus ? "<th>Payment Status</th>" : ""}
                ${columnsVisibility.netTotalAmount ? "<th>Total Amount</th>" : ""}
                ${columnsVisibility.totalPaid ? "<th>Paid</th>" : ""}
                ${columnsVisibility.returnDue ? "<th>Due</th>" : ""}
                ${columnsVisibility.totalItems ? "<th>Items</th>" : ""}
                ${columnsVisibility.addedBy ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${purchases
                .map(
                  (purchase) => `
                <tr>
                  ${
                    columnsVisibility.saleDate
                      ? `<td>${purchase.saleDate}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.invoiceNo
                      ? `<td>${purchase.invoiceNo}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.customerName
                      ? `<td>${purchase.customerName}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.paymentStatus
                      ? `<td>${purchase.paymentStatus}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.netTotalAmount
                      ? `<td>${purchase.netTotalAmount}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.totalPaid
                      ? `<td>${purchase.totalPaid || 0}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.returnDue
                      ? `<td>${purchase.returnDue || purchase.netTotalAmount - (purchase.totalPaid || 0)}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.totalItems
                      ? `<td>${purchase.totalItems}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.addedBy
                      ? `<td>${purchase.addedBy}</td>`
                      : ""
                  }
                </tr>
              `
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
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentReturns = filteredPurchases.slice(startIndex, endIndex);

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List Sale Return</h1>
                <span className="d-inline d-md-block sub-heading">
                  Manage Sale Return
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div
                className="card-her"
                style={{ cursor: "pointer" }}
                data-bs-toggle="collapse"
                data-bs-target="#collapseFilter"
                aria-expanded="false"
                aria-controls="collapseFilter"
              >
                <h5 className="m-0 p-2 d-flex align-items-center">
                  <i className="fa fa-filter p-2" aria-hidden="true"></i>
                  Filters
                  {Object.values(activeFilters).filter((v) => v).length > 0 && (
                    <span className="badge bg-primary ms-2">
                      {Object.values(activeFilters).filter((v) => v).length}
                    </span>
                  )}
                </h5>
              </div>

              <div
                className={`collapse ${filterCollapsed ? "" : "show"}`}
                id="collapseFilter"
              >
                <div className="card-body">
                  <div className="row">
                    {/* Customer Filter */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="customer">Customer:</label>
                        <select
                          id="customer"
                          className="form-select"
                          name="customer"
                          value={activeFilters.customer}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Customers</option>
                          {filterValues.customers.map((customer, index) => (
                            <option key={index} value={customer}>
                              {customer}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="paymentStatus">Payment Status:</label>
                        <select
                          id="paymentStatus"
                          className="form-select"
                          name="paymentStatus"
                          value={activeFilters.paymentStatus}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Statuses</option>
                          {filterValues.paymentStatuses.map((status, index) => (
                            <option key={index} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="dateRange">Date Range:</label>
                        <DatePicker
                          selectsRange={true}
                          startDate={activeFilters.startDate}
                          endDate={activeFilters.endDate}
                          onChange={(update) => {
                            setActiveFilters((prev) => ({
                              ...prev,
                              startDate: update[0],
                              endDate: update[1],
                            }));
                          }}
                          isClearable={true}
                          placeholderText="Select date range"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-end mt-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={resetFilters}
                    >
                      <i className="fa fa-times me-1"></i> Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddSaleReturn" className="btn btn-add">
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
                      onClick={printData}
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
                    className="table table-bordered table-hover"
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.action && <th>Action</th>}
                        {columnsVisibility.saleDate && <th>Return Date</th>}
                        {columnsVisibility.invoiceNo && <th>Invoice No</th>}
                        {columnsVisibility.customerName && <th>Customer</th>}
                        {columnsVisibility.paymentStatus && (
                          <th>Payment Status</th>
                        )}
                        {columnsVisibility.netTotalAmount && (
                          <th>Total Amount</th>
                        )}
                        {columnsVisibility.totalPaid && <th>Total Paid</th>}
                        {columnsVisibility.returnDue && <th>Return Due</th>}
                        {columnsVisibility.totalItems && <th>Total Items</th>}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentReturns.map((returnItem) => (
                        <tr key={returnItem.id}>
                          {columnsVisibility.action && (
                            <td>
                              <DropdownButton
                                id="dropdown-basic-button"
                                title="Actions"
                                variant="outline-success rounded-5 fs-6 fw-light border-1"
                                className="custom-outline-dropdown p-2"
                              >
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleViewClick(returnItem.id)}
                                >
                                  <div className="d-inline-block w-75 btn-edit justify-content-center text-secondary">
                                    <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                    <span>View</span>
                                  </div>
                                </Dropdown.Item>
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleEditClick(returnItem.id)}
                                >
                                  <div className="d-inline-block w-75 btn-edit justify-content-center text-secondary">
                                    <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                    <span>Edit</span>
                                  </div>
                                </Dropdown.Item>

                                <Dropdown.Item
                                  as="button"
                                  onClick={() =>
                                    handleDeleteClick(returnItem.id)
                                  }
                                >
                                  <div className="d-inline-block w-75 btn-delete justify-content-center text-secondary">
                                    <i className="fa fa-trash me-3"></i>
                                    <span>Delete</span>
                                  </div>
                                </Dropdown.Item>
                              </DropdownButton>
                            </td>
                          )}
                          {columnsVisibility.saleDate && (
                            <td>{returnItem.saleDate}</td>
                          )}
                          {columnsVisibility.invoiceNo && (
                            <td>{returnItem.invoiceNo}</td>
                          )}
                          {columnsVisibility.customerName && (
                            <td>{returnItem.customerName}</td>
                          )}
                          {columnsVisibility.paymentStatus && (
                            <td>
                              <button
                                className="btn btn-link p-0"
                                onClick={() =>
                                  handlePaymentStatusClick(returnItem)
                                }
                              >
                                {returnItem.paymentStatus}
                              </button>
                            </td>
                          )}
                          {columnsVisibility.netTotalAmount && (
                            <td>{returnItem.netTotalAmount}</td>
                          )}
                          {columnsVisibility.totalPaid && (
                            <td>{returnItem.totalPaid || 0}</td>
                          )}
                          {columnsVisibility.returnDue && (
                            <td>
                              {returnItem.returnDue ||
                                returnItem.netTotalAmount -
                                  (returnItem.totalPaid || 0)}
                            </td>
                          )}
                          {columnsVisibility.totalItems && (
                            <td>{returnItem.totalItems}</td>
                          )}
                          {columnsVisibility.addedBy && (
                            <td>{returnItem.addedBy}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="row ">
                  <div className="col-sm-12 col-md-5">
                    <div className="dataTables_info">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredPurchases.length)} of{" "}
                      {filteredPurchases.length} entries
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Payment Details - {selectedReturn?.invoiceNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row mb-4">
            <div className="col-md-4">
              <h6>Total Amount: {selectedReturn?.netTotalAmount}</h6>
            </div>
            <div className="col-md-4">
              <h6>Total Paid: {selectedReturn?.totalPaid || 0}</h6>
            </div>
            <div className="col-md-4">
              <h6>
                Due Amount:{" "}
                {selectedReturn?.returnDue ||
                  selectedReturn?.netTotalAmount -
                    (selectedReturn?.totalPaid || 0)}
              </h6>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="form-group">
                <label>Payment Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  max={
                    selectedReturn?.returnDue ||
                    selectedReturn?.netTotalAmount -
                      (selectedReturn?.totalPaid || 0)
                  }
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Payment Date</label>
                <DatePicker
                  selected={paymentDate}
                  onChange={(date) => setPaymentDate(date)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAddPayment}
            disabled={
              paymentAmount <= 0 ||
              paymentAmount >
                (selectedReturn?.returnDue ||
                  selectedReturn?.netTotalAmount -
                    (selectedReturn?.totalPaid || 0))
            }
          >
            Add Payment
          </button>

          <h5 className="mt-4 mb-3">Payment History</h5>
          {paymentHistory.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.date}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.method}</td>
                    <td>{payment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payment history found</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListSellReturn;
