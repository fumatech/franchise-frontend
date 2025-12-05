import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Dropdown, DropdownButton } from "react-bootstrap";

import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ListPoPurchaseOrder = () => {
  const [purchases, setPurchases] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    orderId: true, // Changed from 'date'
    invoiceNumber: true, // Changed from 'referenceNumber'
    purchaseDate: true, // New column
    vendor: true, // Kept same
    totalQuantity: true, // Changed from 'totalItems'
    totalAmount: true, // New column
    addedBy: true, // Kept same
  });
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  // Filter states (unchanged)
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [filterValues, setFilterValues] = useState({
    locations: [],
    vendors: [],
  });
  const [activeFilters, setActiveFilters] = useState({
    location: "",
    vendor: "",
    dateRange: "",
  });

  // Data fetching (unchanged)
  useEffect(() => {
    if (purchases.length > 0) {
      const locations = [
        ...new Set(purchases.map((item) => item.location)),
      ].filter(Boolean);
      const vendors = [...new Set(purchases.map((item) => item.vendor))].filter(
        Boolean
      );

      setFilterValues({
        locations,
        vendors,
      });
    }
  }, [purchases]);

  // Filter handling (unchanged)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      location: "",
      vendor: "",
      dateRange: "",
    });
  };

  const filteredPurchases = purchases.filter((purchase) => {
    return (
      (activeFilters.location === "" ||
        purchase.location === activeFilters.location) &&
      (activeFilters.vendor === "" || purchase.vendor === activeFilters.vendor)
    );
  });

  // Data fetching (unchanged)
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get("/purchase-po-order/getall");
        const data = response.data;

        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => b.id - a.id);
          setPurchases(sortedData);
        } else {
          console.error("Fetched data is not an array");
          setPurchases([]);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setPurchases([]);
      }

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

  // Action handlers (unchanged)
  const handleEditClick = (id) => {
    navigate(`/EditPoPurchaseOrder/${id}`);
  };

  const handleViewClick = (id) => {
    navigate(`/ViewPoPurchaseOrder/${id}`);
  };

  const handleDeleteClick = async (orderId, purchasePoOrderId) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      try {
        // Update status using productId
        const updateResponse = await api.put(
          `https://fusionmastertech.com:8443/franchisepurchaseorder/updateStatusByOrderId/${purchasePoOrderId}`,
          { status: 3 }
        );

        if (updateResponse.status === 200) {
          // Proceed with deletion using orderId
          const deleteResponse = await api.delete(
            `${process.env.REACT_APP_BASE_URL}/purchase-po-order/delete/${orderId}`
          );

          if (deleteResponse.status === 204) {
            setPurchases((prevPurchases) =>
              prevPurchases.filter(
                (purchase) => purchase.purchasePoOrderId !== orderId
              )
            );
            alert("Purchase status updated and record deleted successfully!");
          } else {
            alert("Failed to delete purchase.");
          }
        } else {
          alert("Failed to update purchase status.");
        }
      } catch (error) {
        console.error("Error in delete/update process:", error);
        alert("Error occurred while processing purchase.");
      }
    }
  };

  // Export functions with renamed columns but same data mapping
  const exportCSV = () => {
    const csvData = purchases.map((purchase) => ({
      "Order ID": purchase.id, // Using existing id field
      "Invoice Number": purchase.referenceNumber, // Using existing referenceNumber field
      "Purchase Date": purchase.date, // Using existing date field
      Vendor: purchase.vendor, // Unchanged
      "Total Quantity": purchase.totalItems, // Using existing totalItems field
      "Total Amount": purchase.netTotalAmount, // Using existing netTotalAmount field
      "Added By": purchase.addedBy, // Unchanged
    }));

    const csv = [
      [
        "Order ID",
        "Invoice Number",
        "Purchase Date",
        "Vendor",
        "Total Quantity",
        "Total Amount",
        "Added By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "purchase_orders.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      purchases.map((purchase) => ({
        "Order ID": purchase.id,
        "Invoice Number": purchase.referenceNumber,
        "Purchase Date": purchase.date,
        Vendor: purchase.vendor,
        "Total Quantity": purchase.totalItems,
        "Total Amount": purchase.netTotalAmount,
        "Added By": purchase.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
    XLSX.writeFile(wb, "purchase_orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Column headers with new names but same data mapping
    const headers = [
      "Order ID",
      "Invoice Number",
      "Purchase Date",
      "Vendor",
      "Total Quantity",
      "Total Amount",
      "Added By",
    ];

    const body = purchases.map((p) => [
      p.id, // Existing id field
      p.referenceNumber, // Existing referenceNumber field
      p.date, // Existing date field
      p.vendor, // Existing vendor field
      p.totalItems, // Existing totalItems field
      p.netTotalAmount, // Existing netTotalAmount field
      p.addedBy, // Existing addedBy field
    ]);

    doc.text("Purchase Order List", 14, 20);
    doc.setFontSize(12);
    doc.text("Below is the list of purchase orders:", 14, 30);

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
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { top: 50 },
    });

    doc.save("PurchaseOrderList.pdf");
  };

  // Column visibility toggle (unchanged logic, just with new names)
  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Print function with renamed columns but same data mapping
  const printData = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    const tableContent = `
      <html>
        <head>
          <title>Print Purchase Orders</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Purchase Order Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.action ? "<th>Action</th>" : ""}
                ${columnsVisibility.orderId ? "<th>Order ID</th>" : ""}
                ${columnsVisibility.invoiceNumber ? "<th>Invoice Number</th>" : ""}
                ${columnsVisibility.purchaseDate ? "<th>Purchase Date</th>" : ""}
                ${columnsVisibility.vendor ? "<th>Vendor</th>" : ""}
                ${columnsVisibility.totalQuantity ? "<th>Total Quantity</th>" : ""}
                ${columnsVisibility.totalAmount ? "<th>Total Amount</th>" : ""}
                ${columnsVisibility.addedBy ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${filteredPurchases
                .slice(
                  (currentPage - 1) * entriesPerPage,
                  currentPage * entriesPerPage
                )
                .map(
                  (purchase) => `
                <tr>
                  ${
                    columnsVisibility.action
                      ? `
                    <td>
                      <button onclick="window.opener.handleViewClick(${purchase.id})">View</button>
                      <button onclick="window.opener.handleEditClick(${purchase.id})">Edit</button>
                      <button onclick="window.opener.handleDeleteClick(${purchase.id})">Delete</button>
                    </td>
                  `
                      : ""
                  }
                  ${columnsVisibility.orderId ? `<td>${purchase.id}</td>` : ""}
                  ${columnsVisibility.invoiceNumber ? `<td>${purchase.referenceNumber || "-"}</td>` : ""}
                  ${columnsVisibility.purchaseDate ? `<td>${purchase.date || "-"}</td>` : ""}
                  ${columnsVisibility.vendor ? `<td>${purchase.vendor || "-"}</td>` : ""}
                  ${columnsVisibility.totalQuantity ? `<td>${purchase.totalItems || "-"}</td>` : ""}
                  ${columnsVisibility.totalAmount ? `<td>${purchase.netTotalAmount || "-"}</td>` : ""}
                  ${columnsVisibility.addedBy ? `<td>${purchase.addedBy || "-"}</td>` : ""}
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
  };

  // Pagination (unchanged)
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List PO Purchases</h1>
                <span className="d-inline d-md-block sub-heading">
                  Manage Purchase Orders
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters section (unchanged) */}
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
                </h5>
              </div>

              <div
                className={`collapse ${filterCollapsed ? "" : "show"}`}
                id="collapseFilter"
              >
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
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

                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="vendor">Vendor:</label>
                        <select
                          id="vendor"
                          className="form-select"
                          name="vendor"
                          value={activeFilters.vendor}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Vendors</option>
                          {filterValues.vendors.map((vendor, index) => (
                            <option key={index} value={vendor}>
                              {vendor}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-4">
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

        {/* Main table section with renamed columns */}
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddPoPurchase" className="btn btn-add">
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
                        {Object.entries({
                          action: "Action",
                          orderId: "Order ID",
                          invoiceNumber: "Invoice Number",
                          purchaseDate: "Purchase Date",
                          vendor: "Vendor",
                          totalQuantity: "Total Quantity",
                          totalAmount: "Total Amount",
                          addedBy: "Added By",
                        }).map(([key, label]) => (
                          <div
                            key={key}
                            className="dropdown-item d-flex align-items-center"
                          >
                            <input
                              type="checkbox"
                              checked={columnsVisibility[key]}
                              onChange={() => toggleColumn(key)}
                              className="mr-2"
                            />
                            {label}
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
                        {columnsVisibility.orderId && <th>Order ID</th>}
                        {columnsVisibility.invoiceNumber && (
                          <th>Invoice Number</th>
                        )}
                        {columnsVisibility.purchaseDate && (
                          <th>Purchase Date</th>
                        )}
                        {columnsVisibility.vendor && <th>Vendor</th>}
                        {columnsVisibility.totalQuantity && (
                          <th>Total Quantity</th>
                        )}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPurchases.map((purchase) => (
                        <tr key={purchase.id}>
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
                                  onClick={() => handleViewClick(purchase.id)}
                                >
                                  <div className="d-inline-block w-75 btn-view justify-content-center text-secondary">
                                    <i className="dropdown_hover fa fa-eye me-3"></i>
                                    <span>View</span>
                                  </div>
                                </Dropdown.Item>

                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleEditClick(purchase.id)}
                                >
                                  <div className="d-inline-block w-75 btn-edit justify-content-center text-secondary">
                                    <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                    <span>Edit</span>
                                  </div>
                                </Dropdown.Item>
                                <Dropdown.Item
                                  as="button"
                                  onClick={() =>
                                    handleDeleteClick(
                                      purchase.id,
                                      purchase.purchasePoOrderId
                                    )
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
                          {columnsVisibility.orderId && (
                            <td>{purchase.purchasePoOrderId}</td>
                          )}
                          {columnsVisibility.invoiceNumber && (
                            <td>{purchase.referenceNumber || "-"}</td>
                          )}
                          {columnsVisibility.purchaseDate && (
                            <td>{purchase.date || "-"}</td>
                          )}
                          {columnsVisibility.vendor && (
                            <td>{purchase.vendor || "-"}</td>
                          )}
                          {columnsVisibility.totalQuantity && (
                            <td>{purchase.totalItems || "-"}</td>
                          )}
                          {columnsVisibility.totalAmount && (
                            <td>{purchase.netTotalAmount || "-"}</td>
                          )}
                          {columnsVisibility.addedBy && (
                            <td>{purchase.addedBy || "-"}</td>
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
    </div>
  );
};

export default ListPoPurchaseOrder;
