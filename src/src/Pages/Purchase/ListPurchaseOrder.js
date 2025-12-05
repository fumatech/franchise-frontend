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

const ListPurchaseOrder = () => {
  const [purchases, setPurchases] = useState([]);
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
  const [filterValues, setFilterValues] = useState({
    locations: [],
    vendors: [],
    statuses: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    location: "",
    vendor: "",
    status: "",
    dateRange: "",
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
        return;
      }

      const response = await axios.get(
        `https://fusionmastertech.com:8443/franchisepurchaseorder/getall`
      );

      if (Array.isArray(response.data)) {
        // Filter orders by franchiseId
        const filteredData = response.data.filter(
          (order) => order.franchiseId === franchiseId
        );

        // Sort by ID in descending order to show newest first
        const sortedData = filteredData.sort((a, b) => b.id - a.id);

        setPurchases(sortedData);
      } else {
        console.error("Fetched data is not an array:", response.data);
        setPurchases([]);
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
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (purchases.length > 0) {
      const locations = [
        ...new Set(purchases.map((item) => item.location)),
      ].filter(Boolean);
      const vendors = [...new Set(purchases.map((item) => item.vendor))].filter(
        Boolean
      );
      const statuses = [
        ...new Set(
          purchases.map((item) => {
            switch (item.status) {
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
                return null;
            }
          })
        ),
      ].filter(Boolean);

      setFilterValues({ locations, vendors, statuses });
    }
  }, [purchases]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    return (
      (activeFilters.location === "" ||
        purchase.location === activeFilters.location) &&
      (activeFilters.vendor === "" ||
        purchase.vendor === activeFilters.vendor) &&
      (activeFilters.status === "" ||
        (activeFilters.status === "Ordered" && purchase.status === 0) ||
        (activeFilters.status === "Accepted" && purchase.status === 1) ||
        (activeFilters.status === "Rejected" && purchase.status === 2) ||
        (activeFilters.status === "Shipped" && purchase.status === 3) ||
        (activeFilters.status === "Delivered" && purchase.status === 4) ||
        (activeFilters.status === "Received" && purchase.status === 5))
    );
  });

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
          `https://fusionmastertech.com:8443/franchisepurchaseorder/delete/${id}`
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
    const csvData = purchases.map((purchase) => ({
      "Order ID": purchase.franchisePurchaseOrderId,
      "Order Date": purchase.orderDate,
      "Reference No": purchase.referenceNumber,
      Location: purchase.location,
      Vendor: purchase.vendor,
      "Total Items": purchase.totalItems,
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
                  : "Received",
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
      purchases.map((purchase) => ({
        "Order ID": purchase.franchisePurchaseOrderId,
        "Order Date": purchase.orderDate,
        "Reference No": purchase.referenceNumber,
        Location: purchase.location,
        Vendor: purchase.vendor,
        "Total Items": purchase.totalItems,
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
                    : "Received",
        "Added By": purchase.addedBy,
      }))
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
          "Location",
          "Vendor",
          "Status",
          "Total Items",
        ],
      ],
      body: purchases.map((purchase) => [
        purchase.franchisePurchaseOrderId,
        purchase.orderDate,
        purchase.referenceNumber,
        purchase.location,
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
                  : "Received",
        purchase.totalItems,
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
                ${columnsVisibility.location ? "<th>Location</th>" : ""}
                ${columnsVisibility.vendor ? "<th>Vendor</th>" : ""}
                ${columnsVisibility.status ? "<th>Status</th>" : ""}
                ${columnsVisibility.totalItems ? "<th>Total Items</th>" : ""}
                ${columnsVisibility.addedBy ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${purchases
                .map(
                  (purchase) => `
                <tr>
                  ${columnsVisibility.purchaseOrderId ? `<td>${purchase.franchisePurchaseOrderId}</td>` : ""}
                  ${columnsVisibility.date ? `<td>${purchase.orderDate}</td>` : ""}
                  ${columnsVisibility.referenceNumber ? `<td>${purchase.referenceNumber}</td>` : ""}
                  ${columnsVisibility.location ? `<td>${purchase.location}</td>` : ""}
                  ${columnsVisibility.vendor ? `<td>${purchase.vendor}</td>` : ""}
                  ${
                    columnsVisibility.status
                      ? `<td>${
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
                                    : "Received"
                        }</td>`
                      : ""
                  }
                  ${columnsVisibility.totalItems ? `<td>${purchase.totalItems}</td>` : ""}
                  ${columnsVisibility.addedBy ? `<td>${purchase.addedBy}</td>` : ""}
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
                            {col
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
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
                        {columnsVisibility.purchaseOrderId && <th>Order Id</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.date && <th>Ordered Date</th>}
                        {columnsVisibility.expectedDate && (
                          <th>Expected Delivery Date</th>
                        )}
                        {columnsVisibility.referenceNumber && (
                          <th>Reference No</th>
                        )}
                        {columnsVisibility.location && <th>Location</th>}
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
                              {purchase.status === 0
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
                                          : "Unknown"}
                            </td>
                          )}
                          {columnsVisibility.date && (
                            <td>{purchase.orderDate}</td>
                          )}
                          {columnsVisibility.expectedDate && (
                            <td>{purchase.expectedDate || "Not specified"}</td>
                          )}
                          {columnsVisibility.referenceNumber && (
                            <td>{purchase.referenceNumber}</td>
                          )}
                          {columnsVisibility.location && (
                            <td>{purchase.location}</td>
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
