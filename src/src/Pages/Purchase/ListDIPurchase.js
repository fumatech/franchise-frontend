import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Dropdown, DropdownButton } from "react-bootstrap";
import axios from "axios";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ListDIPurchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    orderId: true,
    invoiceNumber: true,
    purchaseDate: true,
    vendor: true,
    totalQuantity: true,
    totalAmount: true,
    addedBy: true,
  });
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
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

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/purchase-di-order/getall`
        );

        if (Array.isArray(response.data)) {
          const sortedData = response.data.sort((a, b) => b.id - a.id);
          setPurchases(sortedData);

          // Extract filter values
          const vendors = [
            ...new Set(response.data.map((item) => item.vendor)),
          ].filter(Boolean);

          setFilterValues((prev) => ({
            ...prev,
            vendors,
          }));
        }
      } catch (error) {
        console.error("Error fetching DI purchases:", error);
        setPurchases([]);
      }
    };

    fetchPurchases();
  }, []);

  // Filter handling
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
      activeFilters.vendor === "" || purchase.vendor === activeFilters.vendor
    );
  });

  // Action handlers
  const handleEditClick = (id) => {
    navigate(`/EditDIPurchase/${id}`);
  };

  const handleViewClick = (id) => {
    navigate(`/ViewDIPurchase/${id}`);
  };
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this DI purchase?")) {
      try {
        const response = await api.delete(
          `${process.env.REACT_APP_BASE_URL}/purchase-di-order/delete/${id}`
        );
        if (response.status === 204) {
          setPurchases((prev) => prev.filter((p) => p.id !== id));
          alert("DI purchase deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting DI purchase:", error);
        alert("Error occurred while deleting DI purchase.");
      }
    }
  };

  // Export functions
  const exportCSV = () => {
    const csvData = purchases.map((purchase) => ({
      "Order ID": `FUMAFDI${purchase.id}`,
      "Invoice Number": purchase.referenceNumber,
      "Purchase Date": purchase.orderDate,
      Vendor: purchase.vendor,
      "Total Quantity": purchase.totalItems,
      "Total Amount": purchase.netTotalAmount,
      "Added By": purchase.addedBy,
    }));

    const csv = [
      Object.keys(csvData[0]),
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "di_purchases.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      purchases.map((purchase) => ({
        "Order ID": `FUMAFDI${purchase.id}`,
        "Invoice Number": purchase.referenceNumber,
        "Purchase Date": purchase.orderDate,
        Vendor: purchase.vendor,
        "Total Quantity": purchase.totalItems,
        "Total Amount": purchase.netTotalAmount,
        "Added By": purchase.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DI Purchases");
    XLSX.writeFile(wb, "di_purchases.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

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
      `FUMAFDI${p.id}`,
      p.referenceNumber,
      p.orderDate,
      p.vendor,
      p.totalItems,
      p.netTotalAmount,
      p.addedBy,
    ]);

    doc.text("DI Purchase Order List", 14, 20);
    doc.setFontSize(12);
    doc.text("Below is the list of DI purchase orders:", 14, 30);

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

    doc.save("DIPurchaseOrderList.pdf");
  };

  // Column visibility toggle
  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Print function
  const printData = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    const tableContent = `
      <html>
        <head>
          <title>Print DI Purchase Orders</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>DI Purchase Order Report</h2>
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
                  ${columnsVisibility.orderId ? `<td>FUMAFDI${purchase.id}</td>` : ""}
                  ${columnsVisibility.invoiceNumber ? `<td>${purchase.referenceNumber || "-"}</td>` : ""}
                  ${columnsVisibility.purchaseDate ? `<td>${purchase.orderDate || "-"}</td>` : ""}
                  ${columnsVisibility.vendor ? `<td>${purchase.vendor || "-"}</td>` : ""}
                  ${columnsVisibility.totalQuantity ? `<td>${purchase.totalItems || "-"}</td>` : ""}
                  ${columnsVisibility.totalAmount ? `<td>${purchase.netTotalAmount || "-"}</td>` : ""}
                  ${columnsVisibility.addedBy ? `<td>${purchase.addedBy || "-"} </td>` : ""}
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

  // Pagination
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredPurchases.length / entriesPerPage);

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List DI Purchases</h1>
                <span className="d-inline d-md-block sub-heading">
                  Manage DI Purchase Orders
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters section */}
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

        {/* Main table section */}
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddDIPurchase" className="btn btn-add">
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
                                  onClick={() => handleDeleteClick(purchase.id)}
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
                            <td>FUMAFDI{purchase.id}</td>
                          )}
                          {columnsVisibility.invoiceNumber && (
                            <td>{purchase.referenceNumber || "-"}</td>
                          )}
                          {columnsVisibility.purchaseDate && (
                            <td>{purchase.orderDate || "-"}</td>
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

                {/* Pagination controls */}
                <div className="row mt-3">
                  <div className="col-sm-12 col-md-5">
                    <div className="dataTables_info">
                      Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * entriesPerPage,
                        filteredPurchases.length
                      )}{" "}
                      of {filteredPurchases.length} entries
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-7">
                    <div className="dataTables_paginate paging_simple_numbers">
                      <ul className="pagination">
                        <li
                          className={`paginate_button page-item previous ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <li
                            key={page}
                            className={`paginate_button page-item ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`paginate_button page-item next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ListDIPurchase;
