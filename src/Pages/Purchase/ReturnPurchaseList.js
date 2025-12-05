import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Dropdown } from "react-bootstrap";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ReturnPurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    status: true,
    returnNo: true,
    invoiceNo: true,
    date: true,
    referenceNumber: true,
    vendor: true,
    totalItems: true,
    totalAmount: true,
    paymentStatus: true,
    amountDue: true,
    additionalNotes: true,
    addedBy: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(
          `https://fusionmastertech.com:8443/franchise-purchase-return/getall`
        );
        console.log(response.data);
        const franchiseId =
          localStorage.getItem("tenantDbName") ||
          sessionStorage.getItem("tenantDbName");

        if (Array.isArray(response.data)) {
          const filteredData = response.data
            .filter((item) => item.franchiseId === franchiseId)
            .map((item) => ({
              ...item,
              returnNo:
                item.returnNo || `RTN-${item.id.toString().padStart(6, "0")}`,
              amountDue: ["Pending", "Accepted", "Rejected"].includes(
                item.paymentStatus
              )
                ? item.totalAmount
                : 0,
            }))
            .sort((a, b) => b.id - a.id);

          setPurchases(filteredData);

          // Load additional scripts after data is processed
          const script = document.createElement("script");
          script.src = "js/JqueryContent.js";
          script.async = true;
          document.body.appendChild(script);

          // Cleanup function
          return () => {
            document.body.removeChild(script);
          };
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    fetchPurchases();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const printSingleReturn = (id) => {
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Return Details - ${purchase.returnNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 20px; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Return Details</h2>
            <p><strong>Return No:</strong> ${purchase.returnNo}</p>
            <p><strong>Date:</strong> ${formatDate(purchase.orderDate)}</p>
          </div>
          
          <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Vendor</td><td>${purchase.vendor || "N/A"}</td></tr>
            <tr><td>Reference No</td><td>${purchase.referenceNumber || "N/A"}</td></tr>
            <tr><td>Status</td><td>${purchase.status === 0 ? "Ordered" : purchase.status === 1 ? "Accepted" : purchase.status === 2 ? "Rejected" : purchase.status === 3 ? "Completed" : "Unknown"}</td></tr>
            <tr><td>Total Items</td><td>${purchase.totalItems}</td></tr>
            <tr><td>Total Amount</td><td>$${purchase.totalAmount?.toFixed(2) || "0.00"}</td></tr>
            <tr><td>Payment Status</td><td>${purchase.paymentStatus || "N/A"}</td></tr>
            <tr><td>Amount Due</td><td>$${purchase.amountDue?.toFixed(2) || "0.00"}</td></tr>
            <tr><td>Additional Notes</td><td>${purchase.additionalNotes || "None"}</td></tr>
          </table>
          
          <div class="footer">
            <p>Printed on ${formatDate(new Date().toISOString())}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadReceipt = (id) => {
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase) return;

    const doc = new jsPDF();
    doc.text(`Return Receipt - ${purchase.returnNo}`, 10, 10);
    doc.text(`Date: ${formatDate(purchase.orderDate)}`, 10, 20);
    doc.text(`Vendor: ${purchase.vendor}`, 10, 30);
    doc.text(`Total Amount: $${purchase.netTotalAmount?.toFixed(2)}`, 10, 40);
    doc.text(`Status: ${purchase.paymentStatus}`, 10, 50);
    doc.save(`ReturnReceipt-${purchase.returnNo}.pdf`);
  };

  const handleViewClick = (id) => navigate(`/ViewPurchaseReturn/${id}`);
  const handleEditClick = (id) => navigate(`/EditPurchaseReturn/${id}`);

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to cancel this return?")) {
      axios
        .delete(
          `https://fusionmastertech.com:8443/franchise-purchase-return/delete/${id}`
        )
        .then(() => {
          setPurchases((prev) => prev.filter((p) => p.id !== id));
          alert("Return cancelled successfully!");
        })

        .catch((error) => console.error("Error deleting return:", error));
    }
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const columnDisplayNames = {
    action: "Action",
    status: "Status",
    returnNo: "Return No",
    invoiceNo: "Invoice No",
    date: "Date",
    referenceNumber: "Reference No",
    vendor: "Vendor",
    totalItems: "Total Items",
    totalAmount: "Total Amount",
    paymentStatus: "Payment Status",
    amountDue: "Amount Due",
    additionalNotes: "Additional Notes",
    addedBy: "Added By",
  };

  const exportCSV = () => {
    const csvData = purchases.map((purchase) => ({
      "Return No": purchase.returnNo,
      Date: formatDate(purchase.orderDate),
      "Reference No": purchase.referenceNumber,
      Vendor: purchase.vendor,
      "Total Items": purchase.totalItems,
      "Total Amount": purchase.netTotalAmount?.toFixed(2),
      "Payment Status": purchase.paymentStatus,
      "Amount Due": purchase.amountDue?.toFixed(2),
      "Added By": purchase.addedBy,
    }));

    const csv = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, csv, "Returns");
    XLSX.writeFile(wb, "returns.csv");
  };

  const exportExcel = () => {
    const excelData = purchases.map((purchase) => ({
      "Return No": purchase.returnNo,
      Date: formatDate(purchase.orderDate),
      "Reference No": purchase.referenceNumber,
      Vendor: purchase.vendor,
      "Total Items": purchase.totalItems,
      "Total Amount": purchase.netTotalAmount?.toFixed(2),
      "Payment Status": purchase.paymentStatus,
      "Amount Due": purchase.amountDue?.toFixed(2),
      Status:
        purchase.status === 0
          ? "Ordered"
          : purchase.status === 1
            ? "Accepted"
            : purchase.status === 2
              ? "Rejected"
              : purchase.status === 3
                ? "Completed"
                : "Unknown",
      "Added By": purchase.addedBy,
      Notes: purchase.additionalNotes,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Returns");
    XLSX.writeFile(wb, "returns.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Return Purchase List", 14, 20);

    const headers = [
      "Return No",
      "Date",
      "Reference No",
      "Vendor",
      "Total Items",
      "Total Amount",
      "Payment Status",
      "Amount Due",
    ];

    const data = purchases.map((purchase) => [
      purchase.returnNo,
      formatDate(purchase.orderDate),
      purchase.referenceNumber,
      purchase.vendor,
      purchase.totalItems,
      `$${purchase.totalAmount?.toFixed(2)}`,
      purchase.paymentStatus,
      `$${purchase.amountDue?.toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
    });

    doc.save("returns.pdf");
  };

  const printData = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Return Purchase List</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Return Purchase List</h1>
          <table>
            <thead>
              <tr>
                ${Object.entries(columnsVisibility)
                  .filter(([_, visible]) => visible)
                  .map(([col]) => `<th>${columnDisplayNames[col]}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${purchases
                .map(
                  (purchase) => `
                <tr>
                  ${columnsVisibility.action ? `<td>View/Edit/Delete</td>` : ""}
                  ${columnsVisibility.status ? `<td>${purchase.status === 0 ? "Ordered" : purchase.status === 1 ? "Accepted" : purchase.status === 2 ? "Rejected" : purchase.status === 3 ? "Completed" : "Unknown"}</td>` : ""}
                  ${columnsVisibility.returnNo ? `<td>${purchase.returnNo}</td>` : ""}
                  ${columnsVisibility.invoiceNo ? `<td>${purchase.invoiceNo || "N/A"}</td>` : ""}
                  ${columnsVisibility.date ? `<td>${formatDate(purchase.orderDate)}</td>` : ""}
                  ${columnsVisibility.referenceNumber ? `<td>${purchase.referenceNumber}</td>` : ""}
                  ${columnsVisibility.vendor ? `<td>${purchase.vendor}</td>` : ""}
                  ${columnsVisibility.totalItems ? `<td>${purchase.totalItems}</td>` : ""}
                  ${columnsVisibility.totalAmount ? `<td>$${purchase.totalAmount?.toFixed(2)}</td>` : ""}
                  ${columnsVisibility.paymentStatus ? `<td>${purchase.paymentStatus}</td>` : ""}
                  ${columnsVisibility.amountDue ? `<td>$${purchase.amountDue?.toFixed(2)}</td>` : ""}
                  ${columnsVisibility.additionalNotes ? `<td>${purchase.additionalNotes || "-"}</td>` : ""}
                  ${columnsVisibility.addedBy ? `<td>${purchase.addedBy}</td>` : ""}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchases.length / entriesPerPage);

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Return Purchase List</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddPurchaseReturn" className="btn btn-add">
                  <i className="fas fa-plus"></i> Add Return
                </Link>
              </div>

              <div className="card-body">
                <div className="row mb-3 d-flex align-items-center">
                  <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center">
                    <label htmlFor="entriesPerPage" className="mb-0 mr-2">
                      Show
                    </label>
                    <select
                      id="entriesPerPage"
                      className="form-control form-control-sm mr-2"
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    Entries
                  </div>

                  <div className="col d-flex flex-wrap align-items-center">
                    <button
                      onClick={exportCSV}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-csv mr-2"></i> CSV
                    </button>
                    <button
                      onClick={exportExcel}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-excel mr-2"></i> Excel
                    </button>
                    <button
                      onClick={printData}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-print mr-2"></i> Print
                    </button>
                    <button
                      onClick={exportPDF}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-pdf mr-2"></i> PDF
                    </button>

                    {/* Column Visibility Dropdown - matches your reference */}
                    <div className="dropdown mt-lg-2 mb-lg-2">
                      <button
                        className="btn Export-Btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fa fa-columns mr-2"></i> Columns
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
                            {columnDisplayNames[col]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table
                    className="table table-bordered table-hover"
                    id="example1"
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.action && <th>Action</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.returnNo && <th>Return No</th>}
                        {columnsVisibility.invoiceNo && <th>Invoice No</th>}
                        {columnsVisibility.date && <th>Date</th>}
                        {columnsVisibility.referenceNumber && (
                          <th>Reference No</th>
                        )}
                        {columnsVisibility.vendor && <th>Vendor</th>}
                        {columnsVisibility.totalItems && <th>Total Items</th>}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}
                        {columnsVisibility.paymentStatus && (
                          <th>Payment Status</th>
                        )}
                        {columnsVisibility.amountDue && <th>Amount Due</th>}
                        {columnsVisibility.additionalNotes && <th>Note</th>}
                        {columnsVisibility.addedBy && <th>Added By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((purchase) => (
                        <tr key={purchase.id}>
                          {columnsVisibility.action && (
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="outline-success"
                                  size="sm"
                                  id="dropdown-basic"
                                >
                                  Actions
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => handleViewClick(purchase.id)}
                                  >
                                    <i className="fa fa-eye mr-2"></i> View
                                  </Dropdown.Item>

                                  {purchase.status === 0 && (
                                    <>
                                      <Dropdown.Item
                                        onClick={() =>
                                          handleEditClick(purchase.id)
                                        }
                                      >
                                        <i className="fa fa-edit mr-2"></i> Edit
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        onClick={() =>
                                          handleDeleteClick(purchase.id)
                                        }
                                        className="text-danger"
                                      >
                                        <i className="fa fa-trash mr-2"></i>{" "}
                                        Cancel
                                      </Dropdown.Item>
                                    </>
                                  )}

                                  {["Refunded", "Credit Note Issued"].includes(
                                    purchase.paymentStatus
                                  ) && (
                                    <Dropdown.Item
                                      onClick={() =>
                                        downloadReceipt(purchase.id)
                                      }
                                    >
                                      <i className="fa fa-download mr-2"></i>{" "}
                                      Download
                                    </Dropdown.Item>
                                  )}

                                  <Dropdown.Divider />
                                  <Dropdown.Item
                                    onClick={() =>
                                      printSingleReturn(purchase.id)
                                    }
                                  >
                                    <i className="fa fa-print mr-2"></i> Print
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          )}

                          {columnsVisibility.status && (
                            <td>
                              <span
                                className={`badge ${
                                  purchase.status === 0
                                    ? "bg-warning"
                                    : purchase.status === 1
                                      ? "bg-success"
                                      : purchase.status === 2
                                        ? "bg-danger"
                                        : purchase.status === 3
                                          ? "bg-info"
                                          : "bg-secondary"
                                }`}
                              >
                                {purchase.status === 0
                                  ? "Ordered"
                                  : purchase.status === 1
                                    ? "Accepted"
                                    : purchase.status === 2
                                      ? "Rejected"
                                      : purchase.status === 3
                                        ? "Completed"
                                        : "Unknown"}
                              </span>
                            </td>
                          )}

                          {columnsVisibility.returnNo && (
                            <td>{purchase.franchisePurchaseReturnId}</td>
                          )}
                          {columnsVisibility.invoiceNo && (
                            <td>{purchase.invoiceNumber || "N/A"}</td>
                          )}
                          {columnsVisibility.date && (
                            <td>{formatDate(purchase.orderDate)}</td>
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
                          {columnsVisibility.totalAmount && (
                            <td>₹{purchase.netTotalAmount?.toFixed(2)}</td>
                          )}

                          {columnsVisibility.paymentStatus && (
                            <td>
                              <span
                                className={`badge ${
                                  purchase.paymentStatus === 0
                                    ? "bg-warning"
                                    : purchase.paymentStatus === 1
                                      ? "bg-primary"
                                      : purchase.paymentStatus === 2
                                        ? "bg-danger"
                                        : "bg-secondary"
                                }`}
                              >
                                {purchase.paymentStatus === 0
                                  ? "Pending"
                                  : purchase.paymentStatus === 1
                                    ? "Refund"
                                    : purchase.paymentStatus === 2
                                      ? "Credit Note"
                                      : ""}
                              </span>
                            </td>
                          )}

                          {columnsVisibility.amountDue && (
                            <td
                              className={
                                purchase.paymentStatus === 0 &&
                                purchase.netTotalAmount > 0
                                  ? "text-danger fw-bold"
                                  : "text-success"
                              }
                            >
                              ₹
                              {purchase.paymentStatus === 0
                                ? purchase.netTotalAmount?.toFixed(2)
                                : 0}
                            </td>
                          )}

                          {columnsVisibility.additionalNotes && (
                            <td>
                              <span
                                className="text-truncate d-inline-block"
                                style={{ maxWidth: "150px" }}
                                title={purchase.additionalNotes}
                              >
                                {purchase.additionalNotes || "-"}
                              </span>
                            </td>
                          )}

                          {columnsVisibility.addedBy && (
                            <td>{purchase.addedBy}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {purchases.length > entriesPerPage && (
                  <div className="row mt-3">
                    <div className="col-12 d-flex justify-content-center">
                      <nav>
                        <ul className="pagination">
                          <li
                            className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                            >
                              Previous
                            </button>
                          </li>

                          {Array.from({ length: totalPages }, (_, i) => (
                            <li
                              key={i}
                              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}

                          <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReturnPurchaseList;
