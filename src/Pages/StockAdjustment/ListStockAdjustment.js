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
import Collapse from "react-bootstrap/Collapse";

const ListStockAdjustment = () => {
  const navigate = useNavigate();
  const [ListStockAdjustment, setListStockAdjustment] = useState([]);
  const [filteredStockAdjustment, setFilteredStockAdjustment] = useState([]);
  
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
  const [open, setOpen] = useState(false);
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

  // Filter states
  const [filterValues, setFilterValues] = useState({
    adjustmentTypes: [],
    locations: [],
    reasons: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    adjustmentType: "",
    location: "",
    reason: "",
    startDate: "",
    endDate: "",
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
          setFilteredStockAdjustment(sortedData);

          // Extract filter values
          const adjustmentTypes = [...new Set(sortedData.map((item) => item.adjustmentType))].filter(Boolean);
          const locations = [...new Set(sortedData.map((item) => item.businessLocation))].filter(Boolean);
          const reasons = [...new Set(sortedData.map((item) => item.reason))].filter(Boolean);

          setFilterValues({
            adjustmentTypes,
            locations,
            reasons,
          });
        } else {
          console.error("Fetched data is not an array");
          setListStockAdjustment([]);
          setFilteredStockAdjustment([]);
        }
      } catch (error) {
        console.error("Error fetching ListStockAdjustment:", error);
        setListStockAdjustment([]);
        setFilteredStockAdjustment([]);
      }

      // Add external script
      const script = document.createElement("script");
      script.src = "js/JqueryContent.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    fetchListStockAdjustment();
  }, []);

  // Apply filters whenever activeFilters or data changes
  useEffect(() => {
    let result = ListStockAdjustment;

    // Apply adjustment type filter
    if (activeFilters.adjustmentType) {
      result = result.filter((item) => item.adjustmentType === activeFilters.adjustmentType);
    }

    // Apply location filter
    if (activeFilters.location) {
      result = result.filter((item) => item.businessLocation === activeFilters.location);
    }

    // Apply reason filter
    if (activeFilters.reason) {
      result = result.filter((item) => item.reason === activeFilters.reason);
    }

    // Apply start date filter
    if (activeFilters.startDate) {
      result = result.filter((item) => {
        const adjustmentDate = new Date(item.date);
        const startDate = new Date(activeFilters.startDate);
        return adjustmentDate >= startDate;
      });
    }

    // Apply end date filter
    if (activeFilters.endDate) {
      result = result.filter((item) => {
        const adjustmentDate = new Date(item.date);
        const endDate = new Date(activeFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return adjustmentDate <= endDate;
      });
    }

    setFilteredStockAdjustment(result);
    setCurrentPage(1);
  }, [activeFilters, ListStockAdjustment]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      adjustmentType: "",
      location: "",
      reason: "",
      startDate: "",
      endDate: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const exportCSV = () => {
    const csvData = filteredStockAdjustment.map((listStockAdjustment) => ({
      Date: formatDate(listStockAdjustment.date),
      "Reference No": listStockAdjustment.referenceNumber,
      Location: listStockAdjustment.businessLocation,
      "Adjustment Type": listStockAdjustment.adjustmentType,
      "Total Amount": listStockAdjustment.totalAmount,
      "Amount Recovered": listStockAdjustment.amountRecovered,
      Reason: listStockAdjustment.reason,
      "Total Units": listStockAdjustment.totalUnits,
    }));

    const csv = [
      [
        "Date",
        "Reference No",
        "Location",
        "Adjustment Type",
        "Total Amount",
        "Amount Recovered",
        "Reason",
        "Total Units",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "StockAdjustments.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredStockAdjustment.map((listStockAdjustment) => ({
        Date: formatDate(listStockAdjustment.date),
        "Reference No": listStockAdjustment.referenceNumber,
        Location: listStockAdjustment.businessLocation,
        "Adjustment Type": listStockAdjustment.adjustmentType,
        "Total Amount": listStockAdjustment.totalAmount,
        "Amount Recovered": listStockAdjustment.amountRecovered,
        Reason: listStockAdjustment.reason,
        "Total Units": listStockAdjustment.totalUnits,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockAdjustments");
    XLSX.writeFile(wb, "StockAdjustments.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    const headers = [
      "Date",
      "Reference No",
      "Location",
      "Adjustment Type",
      "Total Amount",
      "Amount Recovered",
      "Reason",
      "Total Units",
    ];

    const body = filteredStockAdjustment.slice(startIndex, endIndex).map(
      (adjustment) => [
        formatDate(adjustment.date),
        adjustment.referenceNumber,
        adjustment.businessLocation,
        adjustment.adjustmentType,
        adjustment.totalAmount,
        adjustment.amountRecovered,
        adjustment.reason,
        adjustment.totalUnits,
      ]
    );

    doc.text("Stock Adjustment List", 14, 20);
    doc.setFontSize(12);
    doc.text(
      "Below is the list of stock adjustments with their details:",
      14,
      30
    );

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
            .type-normal { color: #4caf50; }
            .type-abnormal { color: #f44336; }
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
                    ? "<th>Amount Recovered</th>"
                    : ""
                }
                ${columnsVisibility.reason ? "<th>Reason</th>" : ""}
                ${columnsVisibility.totalUnits ? "<th>Total Units</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${filteredStockAdjustment.slice(startIndex, endIndex)
                .map((listStockAdjustment) => {
                  const getAdjustmentTypeClass = (type) => {
                    if (!type) return '';
                    const typeLower = type.toLowerCase();
                    if (typeLower.includes('normal')) return 'type-normal';
                    if (typeLower.includes('abnormal')) return 'type-abnormal';
                    return '';
                  };
                  
                  return `
                    <tr>
                      ${
                        columnsVisibility.date
                          ? `<td>${formatDate(listStockAdjustment.date)}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.referenceNo
                          ? `<td>${listStockAdjustment.referenceNumber}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.location
                          ? `<td>${listStockAdjustment.businessLocation}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.adjustmentType
                          ? `<td class="${getAdjustmentTypeClass(listStockAdjustment.adjustmentType)}">${listStockAdjustment.adjustmentType}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmount
                          ? `<td>${listStockAdjustment.totalAmount}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmountRecovered
                          ? `<td>${listStockAdjustment.amountRecovered}</td>`
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
                    </tr>`;
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
          setFilteredStockAdjustment((prev) =>
            prev.filter((item) => item.id !== id)
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

  const totalPages = Math.ceil(filteredStockAdjustment.length / entriesPerPage);

  const getAdjustmentTypeBadgeClass = (type) => {
    if (!type) return 'badge-secondary';
    
    const typeLower = type.toLowerCase();
    if (typeLower.includes('normal')) return 'badge-success';
    if (typeLower.includes('abnormal')) return 'badge-danger';
    if (typeLower.includes('partial')) return 'badge-warning';
    if (typeLower.includes('complete')) return 'badge-primary';
    return 'badge-secondary';
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

        {/* Filter Component */}
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
                      {/* Adjustment Type Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Adjustment Type:</label>
                          <select
                            className="form-select"
                            name="adjustmentType"
                            value={activeFilters.adjustmentType}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Types</option>
                            {filterValues.adjustmentTypes.map((type, index) => (
                              <option key={`type-${index}`} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Location Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Location:</label>
                          <select
                            className="form-select"
                            name="location"
                            value={activeFilters.location}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Locations</option>
                            {filterValues.locations.map((location, index) => (
                              <option key={`location-${index}`} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Reason Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Reason:</label>
                          <select
                            className="form-select"
                            name="reason"
                            value={activeFilters.reason}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Reasons</option>
                            {filterValues.reasons.map((reason, index) => (
                              <option key={`reason-${index}`} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Start Date */}
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

                      {/* End Date */}
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

                      {/* Reset Button */}
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
                        {Object.entries({
                          action: "Action",
                          date: "Date",
                          referenceNo: "Reference No",
                          location: "Location",
                          adjustmentType: "Adjustment Type",
                          totalAmount: "Total Amount",
                          totalAmountRecovered: "Amount Recovered",
                          reason: "Reason",
                          totalUnits: "Total Units",
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
                          <th>Amount Recovered</th>
                        )}
                        {columnsVisibility.reason && <th>Reason</th>}
                        {columnsVisibility.totalUnits && <th>Total Units</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStockAdjustment.slice(startIndex, endIndex).map(
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
                              <td>{formatDate(listStockAdjustment.date)}</td>
                            )}
                            {columnsVisibility.referenceNo && (
                              <td>{listStockAdjustment.referenceNumber}</td>
                            )}
                            {columnsVisibility.location && (
                              <td>{listStockAdjustment.businessLocation}</td>
                            )}
                            {columnsVisibility.adjustmentType && (
                              <td>
                                <span className={`badge ${getAdjustmentTypeBadgeClass(listStockAdjustment.adjustmentType)}`}>
                                  {listStockAdjustment.adjustmentType}
                                </span>
                              </td>
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