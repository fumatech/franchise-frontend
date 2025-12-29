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
import axios from "axios";

const ListSellReturn = () => {
  const [sale, setSale] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    data: true,
    invoiceNo: true,
    customerName: true,
    location: true,
    paymentStatus: true,
    paymentMethod: true,
    totalAmount: true,
    totalPaid: true,
    sellDue: true,
    totalItem: true,
    addedBy: true,
  });
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    accountId: "",
    note: "",
    paidOn: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate(); // Initialize navigate

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [formData, setFormData] = useState({
    customer: "",
    deliveredTo: "",
    deliveryPerson: "",
    discountAmount: "",
    discountType: "",
    invoiceNo: "",
    invoiceScheme: "",
    orderTax: "",
    payTermNumber: "",
    payTermType: "",
    saleDate: "",
    saleNotes: "",
    salePaymentMethod: "",
    shippingCharges: "",
    shippingDetails: "",
    shippingStatus: "",
    status: "",
    taxAmount: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState({
    transaction: [],
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMap, setCustomerMap] = useState({});

  const [newPayment, setNewPayment] = useState({
    amount: "",
    payment_method: "",
    payment_note: "",
    payment_date: new Date().toISOString().split("T")[0], // Default to today
  });
  const [accountMap, setAccountMap] = useState({});
  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      fetch(
        `https://fusionmastertech.com:8443/customer/username?email=${email}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("User not found");
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            setUserName(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching username:", error);
          // Fallback to using email if username not found
          setUserName(email.split("@")[0]);
        });
    }
  }, []);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);
  useEffect(() => {
    api
      .get(`${process.env.REACT_APP_BASE_URL}/payment-account/getall`)
      .then((res) => {
        const active = res.data.filter((a) => a.status === 1);
        setPaymentAccounts(active);

        const map = {};
        active.forEach((a) => {
          map[a.id] = a;
        });
        setAccountMap(map);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/payment-method/active-names`)
      .then((response) => {
        setPaymentMethods(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payment methods:", error);
      });
  }, []);

  const handleSubmitPayment = async () => {
    if (!paymentData.amount || !paymentData.method || !paymentData.accountId) {
      alert("Amount, Payment Method, and Account are required");
      return;
    }

    const payload = {
      paymentMethod: paymentData.method,
      amount: Number(paymentData.amount),
      transactionType: "sale_return",
      note: paymentData.note || "",
      date: paymentData.paidOn,
      addedBy: userName,
      saleReturnId: selectedSale.id, // ✅ Use transient ID
    };
    console.log(payload);

    try {
      await api.post(
        `${process.env.REACT_APP_BASE_URL}/payment-account/${paymentData.accountId}/sale-transaction`,
        payload
      );

      // 🔥 REFRESH SELECTED SALE
      const updatedSale = await api.get(
        `${process.env.REACT_APP_BASE_URL}/saleReturn/get/${selectedSale.id}`
      );
      setSelectedSale(updatedSale.data);

      // Refresh sales list
      const res = await api.get(
        `${process.env.REACT_APP_BASE_URL}/saleReturn/getall`
      );
      setSale(res.data);

      setPaymentData({
        amount: "",
        method: "",
        accountId: "",
        note: "",
        paidOn: new Date().toISOString().split("T")[0],
      });

      alert("Payment added successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add payment");
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get(
          `${process.env.REACT_APP_BASE_URL}/customer/getall`
        );

        if (Array.isArray(res.data)) {
          setCustomers(res.data);

          // Create ID → customer map
          const map = {};
          res.data.forEach((c) => {
            map[c.id] = c;
          });
          setCustomerMap(map);
        }
      } catch (error) {
        console.error("Error fetching customers", error);
      }
    };

    fetchCustomers();
  }, []);
  const getCustomerName = (customerId) => {
    const customer = customerMap[Number(customerId)];
    if (!customer) return "Unknown Customer";
    return `${customer.firstName} ${customer.lastName}`;
  };

  const getCustomerMobile = (customerId) => {
    const customer = customerMap[Number(customerId)];
    return customer?.mobileNumber || "-";
  };

  const getTotalPaid = (sale) => {
    return Array.isArray(sale.transaction)
      ? sale.transaction.reduce((sum, tx) => sum + (tx.credit || 0), 0)
      : 0;
  };
  const totalPaid =
    selectedSale.transaction?.reduce((sum, tx) => sum + (tx.amount || 0), 0) ||
    0;

  // ================= SALE RETURN HELPERS =================

  // Total refunded amount
  function getTotalRefunded(saleReturn) {
    return Array.isArray(saleReturn?.transaction)
      ? saleReturn.transaction.reduce((sum, tx) => sum + (tx.debit || 0), 0)
      : 0;
  }

  // Due refund amount
  function getRefundDue(saleReturn) {
    const total = saleReturn?.netTotalAmount || 0;
    const refunded = getTotalRefunded(saleReturn);
    return Math.max(total - refunded, 0);
  }

  // Refund payment status
  function getRefundStatus(saleReturn) {
    const refunded = getTotalRefunded(saleReturn);
    const total = saleReturn?.netTotalAmount || 0;

    if (refunded === 0) return "Due";
    if (refunded >= total) return "Paid";
    return "Partial";
  }
  const totalRefunded = getTotalRefunded(selectedSale);
  const due = getRefundDue(selectedSale);

  const getSellDue = (sale) => {
    const netTotal = sale.netTotalAmount || 0;
    const paid = getTotalPaid(sale);
    return Math.max(netTotal - paid, 0);
  };

  const getPaymentStatus = (sale) => {
    const paid =
      sale.transaction?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    if (paid === 0) return "Due";
    if (paid >= sale.netTotalAmount) return "Paid";
    return "Partial";
  };

  const handlePaymentStatusClick = (sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };
  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "success"; // Green badge
      case "Due":
        return "danger"; // Red badge
      case "Partial":
        return "warning text-dark"; // Yellow badge
      default:
        return "primary"; // Blue badge
    }
  };
  // Add these new states for filters

  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [filterValues, setFilterValues] = useState({
    locations: [],
    paymentStatuses: [],
    saleStatuses: [],
    customers: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    location: "",
    saleStatus: "",
    paymentStatus: "",
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (sale.length > 0) {
      const locations = [...new Set(sale.map((i) => i.shippingDetails))].filter(
        Boolean
      );

      const paymentStatuses = [
        ...new Set(
          sale.map((item) => {
            if (item.sellDue === 0) return "Paid";
            if (item.sellDue === item.totalAmount) return "Due";
            if (item.sellDue > 0 && item.sellDue < item.totalAmount)
              return "Partial";
            return null;
          })
        ),
      ].filter(Boolean);

      const customers = [
        ...new Set(sale.map((item) => getCustomerName(item.customer))),
      ].filter(Boolean);

      setFilterValues({
        locations,
        paymentStatuses,
        saleStatuses: [...new Set(sale.map((i) => i.shippingStatus))].filter(
          Boolean
        ),
        customers,
      });
    }
  }, [sale]);

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
      location: "",
      saleStatus: "",
      paymentStatus: "",
      dateRange: "",
    });
  };

  // Filter the sales based on active filters
  const filteredSales = sale.filter((saleItem) => {
    // Location filter
    if (
      activeFilters.location &&
      saleItem.shippingDetails !== activeFilters.location
    ) {
      return false;
    }

    // Sale Status filter
    if (
      activeFilters.saleStatus &&
      saleItem.shippingStatus !== activeFilters.saleStatus
    ) {
      return false;
    }

    // Payment Status filter
    if (activeFilters.paymentStatus) {
      let paymentStatus;
      if (saleItem.sellDue === 0) paymentStatus = "Paid";
      else if (saleItem.sellDue === saleItem.totalAmount) paymentStatus = "Due";
      else if (saleItem.sellDue > 0 && saleItem.sellDue < saleItem.totalAmount)
        paymentStatus = "Partial";
      else paymentStatus = "Unknown";

      if (paymentStatus !== activeFilters.paymentStatus) {
        return false;
      }
    }

    // Date range filter (you'll need to implement this based on your date format)
    if (activeFilters.dateRange) {
      // Add your date range filtering logic here
      // Example: Check if saleItem.saleDate falls within the selected range
    }

    return true;
  });

  useEffect(() => {
    const fetchAllSell = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/saleReturn/getall`
        );

        const data = response.data;
        console.log(data); // Log the fetched data

        if (Array.isArray(data)) {
          setSale(data); // If it's an array, set it as state
        } else {
          console.error("Fetched data is not an array");
          setSale([]); // In case it's not an array, set sale to an empty array
        }
      } catch (error) {
        console.error("Error fetching sale:", error);
        setSale([]); // Handle errors by setting sale to an empty array
      }
    };

    fetchAllSell();
  }, []);
  const exportCSV = () => {
    const csvData = sale.map((purchase) => ({
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
      sale.map((purchase) => ({
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
    const body = sale.map((p) => [
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
              ${sale
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

  // const currentReturns = filteredPurchases.slice(startIndex, endIndex);
  const handleEditClick = (id) => {
    navigate(`/EditSaleReturn/${id}`);
  };
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale return?")) {
      try {
        const response = await api.delete(
          `${process.env.REACT_APP_BASE_URL}/saleReturn/delete/${id}`
        );

        if (response.status === 204) {
          setSale((prevSale) => prevSale.filter((sale) => sale.id !== id));
          alert("Sale Return deleted successfully!");
        } else {
          alert("Failed to delete sale return.");
        }
      } catch (error) {
        console.error("Error deleting sale return:", error);
      }
    }
  };
  const handleViewClick = (id) => {
    navigate(`/ViewSaleReturn/${id}`);
  };
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
                        {columnsVisibility.action && <th>Actions</th>}
                        {columnsVisibility.data && <th>Return Date</th>}
                        {columnsVisibility.invoiceNo && <th>Invoice No</th>}
                        {columnsVisibility.customerName && (
                          <th>Customer Name</th>
                        )}
                        {columnsVisibility.location && <th>Contact Number</th>}
                        {columnsVisibility.paymentStatus && (
                          <th>Payment Status</th>
                        )}
                        {columnsVisibility.paymentMethod && (
                          <th>Payment Method</th>
                        )}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}
                        {columnsVisibility.totalPaid && <th>Total Paid</th>}
                        {columnsVisibility.sellDue && <th>Sell Due</th>}
                        {columnsVisibility.totalItem && <th>Total Item</th>}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(filteredSales) &&
                        filteredSales
                          .slice(startIndex, endIndex)
                          .map((sales) => (
                            <tr key={sales.id || "default-id"}>
                              <td>
                                {/* DropdownButton for Actions */}
                                <DropdownButton
                                  id="dropdown-basic-button" // Unique ID for the dropdown
                                  title="Actions" // Title displayed on the button
                                  variant="outline-success rounded-5 fs-6 fw-light border-1" // Styling for the button
                                  className="custom-outline-dropdown p-2" // Additional custom styling
                                >
                                  {/* Dropdown Items */}
                                  <>
                                    {/* View Action */}
                                    <Dropdown.Item
                                      as="button" // Render as a button
                                      onClick={() => handleViewClick(sales.id)} // Trigger handleViewClick with sales.id
                                    >
                                      <div className="d-inline-block w-100 btn-view justify-content-center text-secondary">
                                        {/* Icon for View */}
                                        <i className="dropdown_hover fa fa-eye me-3"></i>
                                        {/* Text for View */}
                                        <span>View</span>
                                      </div>
                                    </Dropdown.Item>

                                    {/* Edit Action */}
                                    <Dropdown.Item
                                      as="button" // Render as a button
                                      onClick={() => handleEditClick(sales.id)} // Trigger handleEditClick with sales.id
                                    >
                                      <div className="d-inline-block w-100 btn-edit justify-content-center text-secondary">
                                        {/* Icon for Edit */}
                                        <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                        {/* Text for Edit */}
                                        <span>Edit</span>
                                      </div>
                                    </Dropdown.Item>

                                    {/* Delete Action */}
                                    <Dropdown.Item
                                      as="button" // Render as a button
                                      onClick={() =>
                                        handleDeleteClick(sales.id)
                                      } // Trigger handleDeleteClick with sales.id
                                    >
                                      <div className="d-inline-block w-100 btn-delete justify-content-center text-secondary">
                                        {/* Icon for Delete */}
                                        <i className="fa fa-trash me-3"></i>
                                        {/* Text for Delete */}
                                        <span>Delete</span>
                                      </div>
                                    </Dropdown.Item>
                                  </>
                                </DropdownButton>
                              </td>
                              {columnsVisibility.data && (
                                <td>{sales.saleDate || ""}</td>
                              )}
                              {columnsVisibility.invoiceNo && (
                                <td>{sales.referenceNumber || ""}</td>
                              )}
                              {columnsVisibility.customerName && (
                                <td>{getCustomerName(sales.customer)}</td>
                              )}

                              {columnsVisibility.location && (
                                <td>{getCustomerMobile(sales.customer)}</td>
                              )}

                              {columnsVisibility.paymentStatus && (
                                <td
                                  onClick={() =>
                                    handlePaymentStatusClick(sales)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <span
                                    className={`badge bg-${getPaymentStatusBadgeClass(
                                      getPaymentStatus(sales)
                                    )}`}
                                  >
                                    {getPaymentStatus(sales)}
                                  </span>
                                </td>
                              )}
                              {columnsVisibility.paymentMethod && (
                                <td>
                                  {Array.isArray(sales.transaction) &&
                                  sales.transaction.length > 0
                                    ? (() => {
                                        const methods = sales.transaction.map(
                                          (tx) => tx.paymentMethod
                                        );
                                        const uniqueMethods = [
                                          ...new Set(methods),
                                        ]; // remove duplicates
                                        return uniqueMethods.join(", ");
                                      })()
                                    : ""}
                                </td>
                              )}

                              {columnsVisibility.totalAmount && (
                                <td>{sales.netTotalAmount || ""}</td>
                              )}
                              {columnsVisibility.totalPaid && (
                                <td>
                                  {Array.isArray(sales.transaction)
                                    ? sales.transaction.reduce(
                                        (sum, tx) => sum + (tx.amount || 0),
                                        0
                                      )
                                    : 0}
                                </td>
                              )}
                              {columnsVisibility.sellDue && (
                                <td>{getRefundDue(sales).toFixed(2)}</td>
                              )}

                              {columnsVisibility.totalItem && (
                                <td>{sales.totalItems || ""}</td>
                              )}
                              {columnsVisibility.addedBy && (
                                <td>{sales.addedBy || ""}</td>
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

      {/* Payment Details Modal */}
      {showPaymentModal && selectedSale && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title font-weight-bold">
                  Payment Details
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowPaymentModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                {/* Header Section */}
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <h6 className="text-muted">Date</h6>
                    <p className="font-weight-bold">
                      {selectedSale.saleDate || ""}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-muted">Reference No</h6>
                    <p className="font-weight-bold">
                      {selectedSale.referenceNumber || ""}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-muted">Amount</h6>
                    <p className="font-weight-bold">
                      ₹{selectedSale.netTotalAmount}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-muted">Due Amount</h6>
                    <p
                      className={`font-weight-bold ${
                        due > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ₹{due.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Payment Methods Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Payment History</h6>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-bordered mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Account</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(selectedSale.transaction) &&
                        selectedSale.transaction.length > 0 ? (
                          selectedSale.transaction.map((tx, index) => (
                            <tr key={index}>
                              <td>{tx.date}</td>
                              <td>{tx.paymentMethod}</td>
                              <td>
                                {accountMap[tx.paymentAccountId]
                                  ? `${accountMap[tx.paymentAccountId].accountName} / 
       ${accountMap[tx.paymentAccountId].accountNumber}`
                                  : "-"}
                              </td>
                              <td>₹ {tx.amount || 0}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No payment found
                            </td>
                          </tr>
                        )}
                      </tbody>

                      <tfoot>
                        <tr className="font-weight-bold">
                          <td colSpan="3" className="text-right">
                            Total Paid:
                          </td>
                          <td>
                            ₹
                            {Array.isArray(selectedSale.transaction)
                              ? selectedSale.transaction
                                  .reduce(
                                    (sum, tx) => sum + (tx.amount || 0),
                                    0
                                  )
                                  .toFixed(2)
                              : "0.00"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Payment Notes Section */}
                <div className="form-group">
                  <label className="font-weight-bold">Payment Notes</label>
                  <div className="border p-3 bg-light rounded">
                    {Array.isArray(selectedSale.transaction) &&
                    selectedSale.transaction.length > 0 ? (
                      selectedSale.transaction.map((tx, index) => (
                        <div key={index} className="mb-2">
                          <strong>Payment {index + 1}:</strong>{" "}
                          {tx.note || "No note"}
                        </div>
                      ))
                    ) : (
                      <span>No payment notes available</span>
                    )}
                  </div>
                </div>

                {/* Add Payment Section */}
                <div className="mt-4">
                  <h6 className="font-weight-bold mb-3">Add Payment</h6>

                  <div className="row">
                    {/* Amount */}
                    <div className="col-md-3">
                      <label>Amount *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={paymentData.amount}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="col-md-3">
                      <label>Method *</label>
                      <select
                        className="form-control"
                        value={paymentData.method}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            method: e.target.value,
                          })
                        }
                      >
                        <option value="">Select</option>
                        {Array.isArray(paymentMethods) &&
                          paymentMethods.map((m, i) => (
                            <option key={i} value={m}>
                              {m}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Payment Account */}
                    <div className="col-md-4">
                      <label>Account</label>
                      <select
                        className="form-control"
                        value={paymentData.accountId}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            accountId: e.target.value,
                          })
                        }
                      >
                        <option value="">None</option>
                        {Array.isArray(paymentAccounts) &&
                          paymentAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountName} / {a.accountNumber}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mt-3">
                    <label>Note</label>
                    <input
                      type="text"
                      className="form-control"
                      value={paymentData.note}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, note: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary w-80"
                  disabled={due <= 0}
                  onClick={handleSubmitPayment}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSellReturn;
