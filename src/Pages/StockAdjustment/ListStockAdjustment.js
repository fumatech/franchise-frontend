import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";

const ListStockAdjustment = () => {
  const navigate = useNavigate();
  const [ListStockAdjustment, setListStockAdjustment] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    date: true,
    referenceNo: true,
    location: true,
    adjustmentType: true,
    totalAmount: true,
    totalAmountRecovered: true,
    reason: true,
    totalUnits: true,
  });
  const [modalType, setModalType] = useState(null);
  const [currentlistStockAdjustment, setCurrentlistStockAdjustment] =
    useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [formData, setFormData] = useState({
    date: "",
    referenceNo: "",
    location: "",
    adjustmentType: "",
    totalAmount: "",
    totalAmountRecovered: "",
    reason: "",
    totalUnits: "",
  });

  useEffect(() => {
    const fetchListStockAdjustment = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/stock-adjustments/getall`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          // Sort the data in descending order based on `id`
          const sortedData = data.sort((a, b) => b.id - a.id);
          setListStockAdjustment(sortedData);
        } else {
          console.error("Fetched data is not an array");
          setListStockAdjustment([]);
        }
      } catch (error) {
        console.error("Error fetching ListStockAdjustment:", error);
        setListStockAdjustment([]);
      }

      // Add external script directly without setTimeout
      const script = document.createElement("script");
      script.src = "js/JqueryContent.js";
      script.async = true;

      document.body.appendChild(script);

      // Cleanup function to remove the script element when the component is unmounted
      return () => {
        document.body.removeChild(script);
      };
    };

    fetchListStockAdjustment();
  }, []);

  const exportCSV = () => {
    const csvData = ListStockAdjustment.map((listStockAdjustment) => ({
      Action: listStockAdjustment.action,
      Date: listStockAdjustment.date,
      ReferenceNo: listStockAdjustment.referenceNo,
      Location: listStockAdjustment.location,
      AdjustmentType: listStockAdjustment.adjustmentType,
      TotalAmount: listStockAdjustment.totalAmount,
      TotalAmountRecovered: listStockAdjustment.totalAmountRecovered,
      Reason: listStockAdjustment.reason,
      totalUnits: listStockAdjustment.totalUnits,
    }));

    const csv = [
      [
        "Action",
        "Date",
        "Reference No",
        "Location",
        "Adjustment Type",
        "Total Amount",
        "Total Amount Recovered",
        "Reason",
        "Added By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "ListStockAdjustment.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      ListStockAdjustment.map((listStockAdjustment) => ({
        Action: listStockAdjustment.action,
        Date: listStockAdjustment.date,
        ReferenceNo: listStockAdjustment.referenceNo,
        Location: listStockAdjustment.location,
        AdjustmentType: listStockAdjustment.adjustmentType,
        TotalAmount: listStockAdjustment.totalAmount,
        TotalAmountRecovered: listStockAdjustment.totalAmountRecovered,
        Reason: listStockAdjustment.reason,
        totalUnits: listStockAdjustment.totalUnits,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ListStockAdjustment");
    XLSX.writeFile(wb, "ListStockAdjustment.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Define the column headers
    const headers = [
      "Action",
      "Date",
      "Reference No",
      "Location",
      "Adjustment Type",
      "Total Amount",
      "Total Amount Recovered",
      "Reason",
      "Added By",
    ];

    // Map through the stock adjustment data and prepare the body
    const body = ListStockAdjustment.slice(startIndex, endIndex).map(
      (adjustment) => [
        "", // Placeholder for action buttons
        adjustment.date,
        adjustment.referenceNo,
        adjustment.location,
        adjustment.adjustmentType,
        adjustment.totalAmount,
        adjustment.totalAmountRecovered,
        adjustment.reason,
        adjustment.totalUnits,
      ]
    );

    // Add some space before the table
    doc.text("Stock Adjustment List", 14, 20); // Title with a slight offset
    doc.setFontSize(12);
    doc.text(
      "Below is the list of stock adjustments with their details:",
      14,
      30
    );

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
    doc.save("StockAdjustmentList.pdf");
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
          <title>Print Stock Adjustments</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Stock Adjustments Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.date ? "<th>Date</th>" : ""}
                ${columnsVisibility.referenceNo ? "<th>Reference No</th>" : ""}
                ${columnsVisibility.location ? "<th>Location</th>" : ""}
                ${
                  columnsVisibility.adjustmentType
                    ? "<th>Adjustment Type</th>"
                    : ""
                }
                ${columnsVisibility.totalAmount ? "<th>Total Amount</th>" : ""}
                ${
                  columnsVisibility.totalAmountRecovered
                    ? "<th>Total Amount Recovered</th>"
                    : ""
                }
                ${columnsVisibility.reason ? "<th>Reason</th>" : ""}
                ${columnsVisibility.totalUnits ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${ListStockAdjustment.slice(startIndex, endIndex)
                .map(
                  (listStockAdjustment) => `
                    <tr>
                    
                      ${
                        columnsVisibility.date
                          ? `<td>${listStockAdjustment.date}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.referenceNo
                          ? `<td>${listStockAdjustment.referenceNo}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.location
                          ? `<td>${listStockAdjustment.businessLocation}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.adjustmentType
                          ? `<td>${listStockAdjustment.adjustmentType}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmount
                          ? `<td>${listStockAdjustment.totalAmount}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmountRecovered
                          ? `<td>${listStockAdjustment.totalAmountRecovered}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.reason
                          ? `<td>${listStockAdjustment.reason}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalUnits
                          ? `<td>${listStockAdjustment.totalUnits}</td>`
                          : ""
                      }
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

  const handleEdit = (id) => {
    const listStockAdjustmentToEdit = ListStockAdjustment.find(
      (listStockAdjustment) => listStockAdjustment.id === id
    );
    if (listStockAdjustmentToEdit) {
      setCurrentlistStockAdjustment(listStockAdjustmentToEdit);
      setFormData({
        date: listStockAdjustmentToEdit.date,
        referenceNo: listStockAdjustmentToEdit.referenceNo,
        location: listStockAdjustmentToEdit.location,
        adjustmentType: listStockAdjustmentToEdit.adjustmentType,
        totalAmount: listStockAdjustmentToEdit.totalAmount,
        totalAmountRecovered: listStockAdjustmentToEdit.totalAmountRecovered,
        reason: listStockAdjustmentToEdit.reason,
        totalUnits: listStockAdjustmentToEdit.totalUnits,
      });
      setModalType("edit");
    }
  };

  const handleView = (id) => {
    if (window.confirm("Are you want to View this ?")) {
      navigate(`/ViewStockAdjustment/${id}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/stock-adjustments/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.status === 204) {
          setListStockAdjustment((prevListStockAdjustment) =>
            prevListStockAdjustment.filter(
              (listStockAdjustment) => listStockAdjustment.id !== id
            )
          );
          alert(" deleted successfully!");
        } else {
          alert("Failed to delete .");
        }
      } catch (error) {
        console.error("Error deleting :", error);
        alert("Error deleting ");
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
                <h1 className="all-heading">List Stock Adjustment</h1>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddStockAdjustment" className="btn btn-add">
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
                    className="table table-bordered table-hover shadow"
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.action && <th>Action</th>}
                        {columnsVisibility.date && <th>Date</th>}
                        {columnsVisibility.referenceNo && <th>Reference No</th>}
                        {columnsVisibility.location && <th>Location</th>}
                        {columnsVisibility.adjustmentType && (
                          <th>Adjustment Type</th>
                        )}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}
                        {columnsVisibility.totalAmountRecovered && (
                          <th>Total Amount Recovered</th>
                        )}
                        {columnsVisibility.reason && <th>Reason</th>}
                        {columnsVisibility.totalUnits && <th>Total Units</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {ListStockAdjustment.slice(startIndex, endIndex).map(
                        (listStockAdjustment) => (
                          <tr key={listStockAdjustment.id}>
                            {columnsVisibility.action && (
                              <td>
                                <button
                                  className="btn btn-view btn-sm mr-2"
                                  onClick={() =>
                                    handleView(listStockAdjustment.id)
                                  }
                                >
                                  <i className="fas fa-eye"></i> View
                                </button>
                                <button
                                  className="btn btn-delete btn-sm"
                                  onClick={() =>
                                    handleDelete(listStockAdjustment.id)
                                  }
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </td>
                            )}
                            {columnsVisibility.date && (
                              <td>{listStockAdjustment.date}</td>
                            )}
                            {columnsVisibility.referenceNo && (
                              <td>{listStockAdjustment.referenceNumber}</td>
                            )}
                            {columnsVisibility.location && (
                              <td>{listStockAdjustment.businessLocation}</td>
                            )}
                            {columnsVisibility.adjustmentType && (
                              <td>{listStockAdjustment.adjustmentType}</td>
                            )}
                            {columnsVisibility.totalAmount && (
                              <td>{listStockAdjustment.totalAmount}</td>
                            )}
                            {columnsVisibility.totalAmountRecovered && (
                              <td>{listStockAdjustment.amountRecovered}</td>
                            )}
                            {columnsVisibility.reason && (
                              <td>{listStockAdjustment.reason}</td>
                            )}
                            {columnsVisibility.totalUnits && (
                              <td>{listStockAdjustment.totalUnits}</td>
                            )}
                          </tr>
                        )
                      )}
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

export default ListStockAdjustment;
