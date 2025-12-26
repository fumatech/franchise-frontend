import React, { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Link, useNavigate } from "react-router-dom";
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
import $ from "jquery";
import { Dropdown, DropdownButton } from "react-bootstrap"; // Make sure you have react-bootstrap installed
import SellInvoice from "./SellInvoice";
import api from "../utils/api";
import axios from "axios";

const AllSell = () => {
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
      fetch(`https://fusionmastertech.com:8443/user/username?email=${email}`)
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
    if (!paymentData.amount || !paymentData.method) {
      alert("Amount and Payment Method are required");
      return;
    }

    const payload = {
      saleId: selectedSale.id,
      paymentMethod: paymentData.method,
      amount: Number(paymentData.amount),
      paymentAccountId: paymentData.accountId || null,
      note: paymentData.note,
      paidOn: paymentData.paidOn,
      addedBy: userName,
    };

    try {
      await api.post(`${process.env.REACT_APP_BASE_URL}/sale/payment`, payload);

      alert("Payment added successfully");

      // Refresh sales
      const res = await api.get(
        `${process.env.REACT_APP_BASE_URL}/sale/getall`
      );
      setSale(res.data);

      // Reset form
      setPaymentData({
        amount: "",
        method: "",
        accountId: "",
        note: "",
        paidOn: new Date().toISOString().split("T")[0],
      });

      setShowPaymentModal(false);
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

  const due = selectedSale.netTotalAmount - totalPaid;

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
  });
  const [activeFilters, setActiveFilters] = useState({
    location: "",
    saleStatus: "",
    paymentStatus: "",
    dateRange: "",
  });

  // Extract filter values when sales data changes
  useEffect(() => {
    if (sale.length > 0) {
      const locations = [
        ...new Set(sale.map((item) => item.shippingDetails)),
      ].filter(Boolean);
      const paymentStatuses = [
        ...new Set(
          sale.map((item) => {
            if (item.sellDue === 0) return "Paid";
            if (item.sellDue === item.totalAmount) return "Due";
            if (item.sellDue > 0 && item.sellDue < item.totalAmount)
              return "Partial";
            return "Unknown";
          })
        ),
      ].filter(Boolean);
      const saleStatuses = [
        ...new Set(sale.map((item) => item.shippingStatus)),
      ].filter(Boolean);

      setFilterValues({
        locations,
        paymentStatuses,
        saleStatuses,
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
          `${process.env.REACT_APP_BASE_URL}/sale/getall`
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
    const csvData = sale.map((sales) => ({
      Data: sales.saleDate,
      InvoiceNo: sales.invoiceNo,
      CustomerName: sales.customer,
      Location: sales.shippingDetails || "",
      PaymentStatus: sales.shippingStatus,
      PaymentMethod: sales.salePaymentMethod
        .map((pm) => pm.methodName)
        .join(", "),
      TotalAmount: sales.totalAmount,
      TotalPaid: sales.salePaymentMethod.reduce(
        (sum, pm) => sum + pm.amount,
        0
      ), // Sum of all payments
      SellDue: sales.sellDue,
      TotalItem: sales.totalItem,
      AddedBy: sales.addedBy,
    }));

    const csv = [
      [
        "Data",
        "Invoice No",
        "Customer Name",
        "Location",
        "Payment Status",
        "Payment Method",
        "Total Amount",
        "Total Paid",
        "Sell Due",
        "Total Item",
        "Added By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "sell.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      sale.map((sales) => ({
        Data: sales.saleDate,
        InvoiceNo: sales.invoiceNo,
        CustomerName: sales.customer,
        Location: sales.shippingDetails || "",
        PaymentStatus: sales.shippingStatus,
        PaymentMethod: sales.salePaymentMethod
          .map((pm) => pm.methodName)
          .join(", "),
        TotalAmount: sales.totalAmount,
        TotalPaid: sales.salePaymentMethod.reduce(
          (sum, pm) => sum + pm.amount,
          0
        ),
        SellDue: sales.sellDue,
        TotalItem: sales.totalItem,
        AddedBy: sales.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sell");
    XLSX.writeFile(wb, "sell.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Define the column headers
    const headers = [
      "Actions",
      "Data",
      "Invoice No",
      "Customer Name",
      "Location",
      "Payment Status",
      "Payment Method",
      "Total Amount",
      "Total Paid",
      "Sell Due",
      "Total Item",
      "Added By",
    ];

    // Map through the sales data and prepare the body
    const body = sale.slice(startIndex, endIndex).map((s) => [
      "", // Placeholder for actions, we will not include actions in PDF
      s.saleDate,
      s.invoiceNo,
      s.customer,
      s.shippingDetails || "",
      s.shippingStatus,
      s.salePaymentMethod.map((pm) => pm.methodName).join(", "),
      s.totalAmount,
      s.salePaymentMethod.reduce((sum, pm) => sum + pm.amount, 0),
      s.sellDue,
      s.totalItem,
      s.addedBy,
    ]);

    // Add some space before the table
    doc.text("Sales List", 14, 20); // Title with a slight offset
    doc.setFontSize(12);
    doc.text("Below is the list of sales with their details:", 14, 30);

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
      margin: { top: 50 }, // Increase top margin for more space above the table
    });

    // Save the PDF
    doc.save("SalesList.pdf");
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };
  const printData = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    // Define the HTML structure for the table
    const tableContent = `
      <html>
        <head>
          <title>Print Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Sales Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.data ? "<th>Date</th>" : ""}
                ${columnsVisibility.invoiceNo ? "<th>Invoice No</th>" : ""}
                ${
                  columnsVisibility.customerName ? "<th>Customer Name</th>" : ""
                }
                ${columnsVisibility.location ? "<th>Location</th>" : ""}
                ${
                  columnsVisibility.paymentStatus
                    ? "<th>Payment Status</th>"
                    : ""
                }
                ${
                  columnsVisibility.paymentMethod
                    ? "<th>Payment Method</th>"
                    : ""
                }
                ${columnsVisibility.totalAmount ? "<th>Total Amount</th>" : ""}
                ${columnsVisibility.totalPaid ? "<th>Total Paid</th>" : ""}
                ${columnsVisibility.sellDue ? "<th>Sell Due</th>" : ""}
                ${columnsVisibility.totalItem ? "<th>Total Item</th>" : ""}
                ${columnsVisibility.addedBy ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${sale
                .slice(startIndex, endIndex)
                .map(
                  (sales) => `
                <tr>
                  ${columnsVisibility.data ? `<td>${sales.saleDate}</td>` : ""}
                  ${
                    columnsVisibility.invoiceNo
                      ? `<td>${sales.invoiceNo}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.customerName
                      ? `<td>${sales.customer}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.location
                      ? `<td>${sales.shippingDetails || ""}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.paymentStatus
                      ? `<td>${sales.shippingStatus}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.paymentMethod
                      ? `<td>${sales.salePaymentMethod
                          .map((pm) => pm.methodName)
                          .join(", ")}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.totalAmount
                      ? `<td>${sales.totalAmount}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.totalPaid
                      ? `<td>${sales.salePaymentMethod.reduce(
                          (sum, pm) => sum + pm.amount,
                          0
                        )}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.sellDue ? `<td>${sales.sellDue}</td>` : ""
                  }
                  ${
                    columnsVisibility.totalItem
                      ? `<td>${sales.totalItem}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.addedBy ? `<td>${sales.addedBy}</td>` : ""
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

  const handleEditClick = (id) => {
    console.log(id);

    navigate(`/EditSale/${id}`);
  };

  const handleViewClick = (id) => {
    navigate(`/ViewSale/${id}`);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        const response = await api.delete(
          `${process.env.REACT_APP_BASE_URL}/sale/delete/${id}`
        );

        if (response.status === 204) {
          setSale((prevSale) => prevSale.filter((sale) => sale.id !== id));
          alert("Product deleted successfully!");
        } else {
          alert("Failed to delete product.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className=" all-heading">All sales</h1>
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
                    {/* Business Location Filter */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="location">Business Location:</label>
                        <select
                          id="location"
                          className="form-select"
                          name="location"
                          value={activeFilters.location}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Locations</option>
                          {filterValues.locations.map((location, index) => (
                            <option key={index} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sale Status Filter */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="saleStatus">Sale Status:</label>
                        <select
                          id="saleStatus"
                          className="form-select"
                          name="saleStatus"
                          value={activeFilters.saleStatus}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Statuses</option>
                          {filterValues.saleStatuses.map((status, index) => (
                            <option key={index} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="col-md-3">
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
                          <option value="Paid">Paid</option>
                          <option value="Due">Due</option>
                          <option value="Partial">Partial</option>
                        </select>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="dateRange">Date Range:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="dateRange"
                          name="dateRange"
                          placeholder="Select a date range"
                          value={activeFilters.dateRange}
                          onChange={handleFilterChange}
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
                <Link to="/AddSell" className="btn btn-add">
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
                        {columnsVisibility.data && <th>Date</th>}
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
                      {Array.isArray(sale) &&
                        sale.slice(startIndex, endIndex).map((sales) => (
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
                                    onClick={() => handleDeleteClick(sales.id)} // Trigger handleDeleteClick with sales.id
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
                              <td>{sales.invoiceNo || ""}</td>
                            )}
                            {columnsVisibility.customerName && (
                              <td>{getCustomerName(sales.customer)}</td>
                            )}

                            {columnsVisibility.location && (
                              <td>{getCustomerMobile(sales.customer)}</td>
                            )}

                            {columnsVisibility.paymentStatus && (
                              <td
                                onClick={() => handlePaymentStatusClick(sales)}
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
                                {Array.isArray(sales.transaction)
                                  ? sales.transaction
                                      .map((tx) => tx.paymentMethod)
                                      .join(", ")
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
                                      (sum, tx) => sum + (tx.credit || 0),
                                      0
                                    )
                                  : 0}
                              </td>
                            )}
                            {columnsVisibility.sellDue && (
                              <td>{getSellDue(sales).toFixed(2)}</td>
                            )}

                            {columnsVisibility.totalItem && (
                              <td>{sales.netTotalUnit || ""}</td>
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
                      {selectedSale.invoiceNo || ""}
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
                    <p className="font-weight-bold">{due.toFixed(2)}</p>
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
                              <td>{tx.paymentMethod}</td>
                              <td>
                                {accountMap[tx.paymentAccountId]
                                  ? `${accountMap[tx.paymentAccountId].accountName} / 
       ${accountMap[tx.paymentAccountId].accountNumber}`
                                  : "-"}
                              </td>
                              <td>
                                ₹
                                {selectedSale.transaction.reduce(
                                  (sum, tx) => sum + (tx.amount || 0),
                                  0
                                )}
                              </td>
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
                          <td colSpan="2" className="text-right">
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
                        {paymentMethods.map((m, i) => (
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
                        {paymentAccounts.map((a) => (
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

export default AllSell;
