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
import Collapse from "react-bootstrap/Collapse";

const ListPurchaseOrder = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);

  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    status: true,
    date: true,
    expectedDate: true,
    referenceNumber: true,
    location: true,
    vendor: true,
    totalItems: true,
    shippedItems: true,
    additionalNotes: true,
    addedBy: true,
    purchaseOrderId: true,
  });

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [open, setOpen] = useState(false);

  // Filter states
  const [filterValues, setFilterValues] = useState({
    statuses: [
      "Ordered",
      "Accepted",
      "Rejected",
      "Shipped",
      "Delivered",
      "Received",
    ],
    vendors: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    status: "",
    vendor: "",
    startDate: "",
    endDate: "",
  });

  const fetchPurchases = async () => {
    try {
      // Get franchiseId from localStorage or sessionStorage
      const tenantDbName =
        localStorage.getItem("tenantDbName") ||
        sessionStorage.getItem("tenantDbName");
      const franchiseId = tenantDbName?.replace(/^fuma_/, "");

      if (!franchiseId) {
        console.error("No franchiseId found in storage");
        setPurchases([]);
        setFilteredPurchases([]);
        return;
      }

      const response = await axios.get(
        `https://fusionmastertech.com:8443/franchisepurchaseorder/getall`,
      );

      if (Array.isArray(response.data)) {
        // Filter orders by franchiseId
        const filteredData = response.data.filter(
          (order) => order.franchiseId === franchiseId,
        );

        // Sort by ID in descending order to show newest first
        const sortedData = filteredData.sort((a, b) => b.id - a.id);

        setPurchases(sortedData);
        setFilteredPurchases(sortedData);

        // Extract filter values
        const vendors = [
          ...new Set(sortedData.map((item) => item.vendor)),
        ].filter(Boolean);

        setFilterValues({
          statuses: [
            "Ordered",
            "Accepted",
            "Rejected",
            "Shipped",
            "Delivered",
            "Received",
          ],
          vendors,
        });
      } else {
        console.error("Fetched data is not an array:", response.data);
        setPurchases([]);
        setFilteredPurchases([]);
      }

      // Load additional scripts after data is processed
      const script = document.createElement("script");
      script.src = "js/JqueryContent.js";
      script.async = true;
      document.body.appendChild(script);

      // Cleanup function
      return () => {
        document.body.removeChild(script);
      };
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setPurchases([]);
      setFilteredPurchases([]);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Apply filters whenever activeFilters or purchases change
  useEffect(() => {
    let result = purchases;

    // Apply status filter
    if (activeFilters.status) {
      const statusMap = {
        Ordered: 0,
        Accepted: 1,
        Rejected: 2,
        Shipped: 3,
        Delivered: 4,
        Received: 5,
      };

      const statusValue = statusMap[activeFilters.status];
      result = result.filter((purchase) => purchase.status === statusValue);
    }

    // Apply vendor filter
    if (activeFilters.vendor) {
      result = result.filter(
        (purchase) => purchase.vendor === activeFilters.vendor,
      );
    }

    // Apply start date filter
    if (activeFilters.startDate) {
      result = result.filter((purchase) => {
        const orderDate = new Date(purchase.orderDate);
        const startDate = new Date(activeFilters.startDate);
        return orderDate >= startDate;
      });
    }

    // Apply end date filter
    if (activeFilters.endDate) {
      result = result.filter((purchase) => {
        const orderDate = new Date(purchase.orderDate);
        const endDate = new Date(activeFilters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        return orderDate <= endDate;
      });
    }

    setFilteredPurchases(result);
    setCurrentPage(1);
  }, [activeFilters, purchases]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: "",
      vendor: "",
      startDate: "",
      endDate: "",
    });
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

  const handleEditClick = (id) => {
    navigate(`/EditPurchaseOrder/${id}`);
  };

  const handleViewClick = (id) => {
    navigate(`/ViewPurchaseOrder/${id}`);
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      try {
        const response = await axios.delete(
          `https://fusionmastertech.com:8443/franchisepurchaseorder/delete/${id}`,
        );

        if (response.status === 204) {
          setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
          alert("Purchase order deleted successfully!");
        } else {
          alert("Failed to delete purchase order.");
        }
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        alert("Error deleting purchase order");
      }
    }
  };

  const exportCSV = () => {
    const csvData = filteredPurchases.map((purchase) => ({
      "Order ID": purchase.franchisePurchaseOrderId,
      "Order Date": purchase.orderDate,
      "Reference No": purchase.referenceNumber,
      Location: purchase.location,
      Vendor: purchase.vendor,
      "Total Items": purchase.totalItems,
      "Shipped Items": purchase.totalShippedItems || 0,
      Status:
        purchase.status === 0
          ? "Ordered"
          : purchase.status === 1
            ? "Accepted"
            : purchase.status === 2
              ? "Rejected"
              : purchase.status === 3
                ? "Shipped"
                : purchase.status === 4
                  ? "Delivered"
                  : purchase.status === 5
                    ? "Received"
                    : "Unknown",
      "Additional Notes": purchase.additionalNotes,
      "Added By": purchase.addedBy,
    }));

    const csv = [
      Object.keys(csvData[0]),
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "purchase_orders.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredPurchases.map((purchase) => ({
        "Order ID": purchase.franchisePurchaseOrderId,
        "Order Date": purchase.orderDate,
        "Reference No": purchase.referenceNumber,
        Location: purchase.location,
        Vendor: purchase.vendor,
        "Total Items": purchase.totalItems,
        "Shipped Items": purchase.totalShippedItems || 0,
        Status:
          purchase.status === 0
            ? "Ordered"
            : purchase.status === 1
              ? "Accepted"
              : purchase.status === 2
                ? "Rejected"
                : purchase.status === 3
                  ? "Shipped"
                  : purchase.status === 4
                    ? "Delivered"
                    : purchase.status === 5
                      ? "Received"
                      : "Unknown",
        "Additional Notes": purchase.additionalNotes,
        "Added By": purchase.addedBy,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
    XLSX.writeFile(wb, "purchase_orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Purchase Orders Report", 14, 20);
    doc.setFontSize(12);
    doc.text("Below is the list of purchase orders:", 14, 30);

    doc.autoTable({
      head: [
        [
          "Order ID",
          "Date",
          "Reference",
          "Vendor",
          "Status",
          "Total Items",
          "Shipped Items",
          "Added By",
        ],
      ],
      body: filteredPurchases.map((purchase) => [
        purchase.franchisePurchaseOrderId,
        purchase.orderDate,
        purchase.referenceNumber,
        purchase.vendor,
        purchase.status === 0
          ? "Ordered"
          : purchase.status === 1
            ? "Accepted"
            : purchase.status === 2
              ? "Rejected"
              : purchase.status === 3
                ? "Shipped"
                : purchase.status === 4
                  ? "Delivered"
                  : purchase.status === 5
                    ? "Received"
                    : "Unknown",
        purchase.totalItems,
        purchase.totalShippedItems || 0,
        purchase.addedBy,
      ]),
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      margin: { top: 50 },
    });

    doc.save("PurchaseOrders.pdf");
  };

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
            .status-ordered { color: #ff9800; }
            .status-accepted { color: #4caf50; }
            .status-rejected { color: #f44336; }
            .status-shipped { color: #2196f3; }
            .status-delivered { color: #673ab7; }
            .status-received { color: #009688; }
          </style>
        </head>
        <body>
          <h2>Purchase Orders Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.purchaseOrderId ? "<th>Order ID</th>" : ""}
                ${columnsVisibility.date ? "<th>Date</th>" : ""}
                ${columnsVisibility.referenceNumber ? "<th>Reference No</th>" : ""}
                ${columnsVisibility.vendor ? "<th>Vendor</th>" : ""}
                ${columnsVisibility.status ? "<th>Status</th>" : ""}
                ${columnsVisibility.totalItems ? "<th>Total Items</th>" : ""}
                ${columnsVisibility.shippedItems ? "<th>Shipped Items</th>" : ""}
                ${columnsVisibility.addedBy ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${filteredPurchases
                .slice(startIndex, endIndex)
                .map((purchase) => {
                  const getStatusClass = (status) => {
                    switch (status) {
                      case 0:
                        return "status-ordered";
                      case 1:
                        return "status-accepted";
                      case 2:
                        return "status-rejected";
                      case 3:
                        return "status-shipped";
                      case 4:
                        return "status-delivered";
                      case 5:
                        return "status-received";
                      default:
                        return "";
                    }
                  };

                  const getStatusText = (status) => {
                    switch (status) {
                      case 0:
                        return "Ordered";
                      case 1:
                        return "Accepted";
                      case 2:
                        return "Rejected";
                      case 3:
                        return "Shipped";
                      case 4:
                        return "Delivered";
                      case 5:
                        return "Received";
                      default:
                        return "Unknown";
                    }
                  };

                  return `
                    <tr>
                      ${columnsVisibility.purchaseOrderId ? `<td>${purchase.franchisePurchaseOrderId}</td>` : ""}
                      ${columnsVisibility.date ? `<td>${purchase.orderDate}</td>` : ""}
                      ${columnsVisibility.referenceNumber ? `<td>${purchase.referenceNumber}</td>` : ""}
                      ${columnsVisibility.vendor ? `<td>${purchase.vendor}</td>` : ""}
                      ${
                        columnsVisibility.status
                          ? `<td class="${getStatusClass(purchase.status)}">${getStatusText(purchase.status)}</td>`
                          : ""
                      }
                      ${columnsVisibility.totalItems ? `<td>${purchase.totalItems}</td>` : ""}
                      ${columnsVisibility.shippedItems ? `<td>${purchase.totalShippedItems || 0}</td>` : ""}
                      ${columnsVisibility.addedBy ? `<td>${purchase.addedBy}</td>` : ""}
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPurchases.length / entriesPerPage);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 0:
        return "badge-warning"; // Ordered
      case 1:
        return "badge-success"; // Accepted
      case 2:
        return "badge-danger"; // Rejected
      case 3:
        return "badge-info"; // Shipped
      case 4:
        return "badge-primary"; // Delivered
      case 5:
        return "badge-secondary"; // Received
      default:
        return "badge-secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Ordered";
      case 1:
        return "Accepted";
      case 2:
        return "Rejected";
      case 3:
        return "Shipped";
      case 4:
        return "Delivered";
      case 5:
        return "Received";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List Purchase Order</h1>
                <span className="d-inline d-md-block sub-heading">
                  Manage Purchase Orders
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* 
        <section className="content">
          <div className="container-fluid py-2">
            <div className="card card-default rounded-4 border-0 cardHover">
              <div
                className="my- p-3 d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setOpen(!open)}
              >
                <i className={`fa fa-filter me-3`}></i>
                <span>Filter</span>
              </div>

              <Collapse in={open}>
                <div className="border-top">
                  <div className="card-body">
                    <div className="row py-2 g-2">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Status:</label>
                          <select
                            className="form-select"
                            name="status"
                            value={activeFilters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Status</option>
                            {filterValues.statuses.map((status, index) => (
                              <option key={`status-${index}`} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Vendor:</label>
                          <select
                            className="form-select"
                            name="vendor"
                            value={activeFilters.vendor}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Vendors</option>
                            {filterValues.vendors.map((vendor, index) => (
                              <option key={`vendor-${index}`} value={vendor}>
                                {vendor}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Start Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={activeFilters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">End Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={activeFilters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>

                      <div className="col-12 mt-3">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilters();
                          }}
                          disabled={!Object.values(activeFilters).some(Boolean)}
                        >
                          <i className="fa fa-times me-1"></i> Reset All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>
        </section> */}

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/PurchaseOrder" className="btn btn-add">
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
                          purchaseOrderId: "Order ID",
                          status: "Status",
                          date: "Ordered Date",
                          expectedDate: "Expected Delivery Date",
                          referenceNumber: "Reference No",
                          vendor: "Vendor",
                          totalItems: "Total Items",
                          shippedItems: "Shipped Items",
                          additionalNotes: "Additional Notes",
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
                        {columnsVisibility.purchaseOrderId && <th>Order ID</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.date && <th>Ordered Date</th>}
                        {columnsVisibility.expectedDate && (
                          <th>Expected Delivery Date</th>
                        )}
                        {columnsVisibility.referenceNumber && (
                          <th>Reference No</th>
                        )}
                        {columnsVisibility.vendor && <th>Vendor</th>}
                        {columnsVisibility.totalItems && <th>Total Items</th>}
                        {columnsVisibility.shippedItems && (
                          <th>Shipped Items</th>
                        )}
                        {columnsVisibility.additionalNotes && (
                          <th>Additional Notes</th>
                        )}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          {columnsVisibility.action && (
                            <td>
                              <DropdownButton
                                id={`dropdown-${purchase.id}`}
                                title="Actions"
                                variant="outline-success rounded-5 fs-6 fw-light border-1"
                                className="custom-outline-dropdown p-2"
                              >
                                {/* Always show View */}
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleViewClick(purchase.id)}
                                >
                                  <div className="d-inline-block w-100 btn-view justify-content-center text-secondary">
                                    <i className="dropdown_hover fa fa-eye me-3"></i>
                                    <span>View</span>
                                  </div>
                                </Dropdown.Item>

                                {/* Show Edit and Delete for Ordered status (0) */}
                                {purchase.status === 0 && (
                                  <>
                                    <Dropdown.Item
                                      as="button"
                                      onClick={() =>
                                        handleEditClick(purchase.id)
                                      }
                                    >
                                      <div className="d-inline-block w-100 btn-edit justify-content-center text-secondary">
                                        <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                        <span>Edit</span>
                                      </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      as="button"
                                      onClick={() =>
                                        handleDeleteClick(purchase.id)
                                      }
                                    >
                                      <div className="d-inline-block w-100 btn-delete justify-content-center text-secondary">
                                        <i className="fa fa-trash me-3"></i>
                                        <span>Delete</span>
                                      </div>
                                    </Dropdown.Item>
                                  </>
                                )}

                                {/* Show Delete for Rejected status (2) */}
                                {purchase.status === 2 && (
                                  <Dropdown.Item
                                    as="button"
                                    onClick={() =>
                                      handleDeleteClick(purchase.id)
                                    }
                                  >
                                    <div className="d-inline-block w-100 btn-delete justify-content-center text-secondary">
                                      <i className="fa fa-trash me-3"></i>
                                      <span>Delete</span>
                                    </div>
                                  </Dropdown.Item>
                                )}
                              </DropdownButton>
                            </td>
                          )}
                          {columnsVisibility.purchaseOrderId && (
                            <td>{purchase.franchisePurchaseOrderId}</td>
                          )}
                          {columnsVisibility.status && (
                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(purchase.status)}`}
                              >
                                {getStatusText(purchase.status)}
                              </span>
                            </td>
                          )}
                          {columnsVisibility.date && (
                            <td>{purchase.orderDate}</td>
                          )}
                          {columnsVisibility.expectedDate && (
                            <td>{purchase.deliveryDate || ""}</td>
                          )}
                          {columnsVisibility.referenceNumber && (
                            <td>{purchase.referenceNumber}</td>
                          )}
                          {columnsVisibility.vendor && (
                            <td>{purchase.vendor}</td>
                          )}
                          {columnsVisibility.totalItems && (
                            <td>{purchase.totalItems}</td>
                          )}
                          {columnsVisibility.shippedItems && (
                            <td>{purchase.totalShippedItems || 0}</td>
                          )}
                          {columnsVisibility.additionalNotes && (
                            <td>{purchase.additionalNotes}</td>
                          )}
                          {columnsVisibility.addedBy && (
                            <td>{purchase.addedBy}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Info */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredPurchases.length)} of{" "}
                      {filteredPurchases.length} entries
                    </div>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
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

export default ListPurchaseOrder;
