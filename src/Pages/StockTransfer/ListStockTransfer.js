import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import Collapse from "react-bootstrap/Collapse";

const ListStockTransfer = () => {
  const [ListStockTransfer, setListStockTransfer] = useState([]);
  const [filteredStockTransfer, setFilteredStockTransfer] = useState([]);
  
  const [columnsVisibility, setColumnsVisibility] = useState({
    data: true,
    referenceNo: true,
    locationFrom: true,
    locationTo: true,
    status: true,
    shippingCharges: true,
    totalAmount: true,
    additionalNotes: true,
    action: true,
  });
  
  const [modalType, setModalType] = useState(null);
  const [currentListStock, setCurrentListStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: "",
    referenceNo: "",
    locationFrom: "",
    locationTo: "",
    status: "",
    shippingCharges: "",
    totalAmount: "",
    additionalNotes: "",
  });

  // Filter states
  const [filterValues, setFilterValues] = useState({
    statuses: [],
    locationsFrom: [],
    locationsTo: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    status: "",
    locationFrom: "",
    locationTo: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchStockTransfer = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/ListStockTransfer/getall`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          const processedData = data.map(item => ({
            ...item,
            // Ensure date is in proper format
            transferDate: item.data || item.transferDate || new Date().toISOString().split('T')[0],
            statusText: getStatusText(item.status)
          }));
          
          setListStockTransfer(processedData);
          setFilteredStockTransfer(processedData);

          // Extract filter values
          const statuses = [...new Set(processedData.map((item) => item.statusText))].filter(Boolean);
          const locationsFrom = [...new Set(processedData.map((item) => item.locationFrom))].filter(Boolean);
          const locationsTo = [...new Set(processedData.map((item) => item.locationTo))].filter(Boolean);

          setFilterValues({
            statuses,
            locationsFrom,
            locationsTo,
          });
        } else {
          console.error("Fetched data is not an array");
          setListStockTransfer([]);
          setFilteredStockTransfer([]);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setListStockTransfer([]);
        setFilteredStockTransfer([]);
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

    fetchStockTransfer();
  }, []);

  // Apply filters whenever activeFilters or data changes
  useEffect(() => {
    let result = ListStockTransfer;

    // Apply status filter
    if (activeFilters.status) {
      result = result.filter((item) => item.statusText === activeFilters.status);
    }

    // Apply location from filter
    if (activeFilters.locationFrom) {
      result = result.filter((item) => item.locationFrom === activeFilters.locationFrom);
    }

    // Apply location to filter
    if (activeFilters.locationTo) {
      result = result.filter((item) => item.locationTo === activeFilters.locationTo);
    }

    // Apply start date filter
    if (activeFilters.startDate) {
      result = result.filter((item) => {
        const transferDate = new Date(item.transferDate || item.data);
        const startDate = new Date(activeFilters.startDate);
        return transferDate >= startDate;
      });
    }

    // Apply end date filter
    if (activeFilters.endDate) {
      result = result.filter((item) => {
        const transferDate = new Date(item.transferDate || item.data);
        const endDate = new Date(activeFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return transferDate <= endDate;
      });
    }

    setFilteredStockTransfer(result);
    setCurrentPage(1);
  }, [activeFilters, ListStockTransfer]);

  const getStatusText = (status) => {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'pending':
        case '0': return 'Pending';
        case 'sent':
        case '1': return 'Sent';
        case 'received':
        case '2': return 'Received';
        case 'completed':
        case '3': return 'Completed';
        case 'cancelled':
        case '4': return 'Cancelled';
        default: return status;
      }
    }
    return status;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: "",
      locationFrom: "",
      locationTo: "",
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
    const csvData = filteredStockTransfer.map((StockTransfer) => ({
      Date: formatDate(StockTransfer.data || StockTransfer.transferDate),
      "Reference No": StockTransfer.referenceNo,
      "Location (From)": StockTransfer.locationFrom,
      "Location (To)": StockTransfer.locationTo,
      Status: StockTransfer.statusText,
      "Shipping Charges": StockTransfer.shippingCharges,
      "Total Amount": StockTransfer.totalAmount,
      "Additional Notes": StockTransfer.additionalNotes,
    }));

    const csv = [
      [
        "Date",
        "Reference No",
        "Location (From)",
        "Location (To)",
        "Status",
        "Shipping Charges",
        "Total Amount",
        "Additional Notes",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "StockTransfers.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredStockTransfer.map((StockTransfer) => ({
        Date: formatDate(StockTransfer.data || StockTransfer.transferDate),
        "Reference No": StockTransfer.referenceNo,
        "Location (From)": StockTransfer.locationFrom,
        "Location (To)": StockTransfer.locationTo,
        Status: StockTransfer.statusText,
        "Shipping Charges": StockTransfer.shippingCharges,
        "Total Amount": StockTransfer.totalAmount,
        "Additional Notes": StockTransfer.additionalNotes,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockTransfers");
    XLSX.writeFile(wb, "StockTransfers.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    const headers = [
      "Date",
      "Reference No",
      "Location (From)",
      "Location (To)",
      "Status",
      "Shipping Charges",
      "Total Amount",
      "Additional Notes",
    ];

    const body = filteredStockTransfer.slice(startIndex, endIndex).map(
      (transfer) => [
        formatDate(transfer.data || transfer.transferDate),
        transfer.referenceNo,
        transfer.locationFrom,
        transfer.locationTo,
        transfer.statusText,
        transfer.shippingCharges,
        transfer.totalAmount,
        transfer.additionalNotes || "None",
      ]
    );

    doc.text("Stock Transfer List", 14, 20);
    doc.setFontSize(12);
    doc.text(
      "Below is the list of stock transfers with their details:",
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

    doc.save("StockTransferList.pdf");
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
          <title>Print Stock Transfer Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
            .status-pending { color: #ff9800; }
            .status-sent { color: #2196f3; }
            .status-received { color: #4caf50; }
            .status-completed { color: #673ab7; }
            .status-cancelled { color: #f44336; }
          </style>
        </head>
        <body>
          <h2>Stock Transfer Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.data ? "<th>Date</th>" : ""}
                ${columnsVisibility.referenceNo ? "<th>Reference No</th>" : ""}
                ${
                  columnsVisibility.locationFrom
                    ? "<th>Location (From)</th>"
                    : ""
                }
                ${columnsVisibility.locationTo ? "<th>Location (To)</th>" : ""}
                ${columnsVisibility.status ? "<th>Status</th>" : ""}
                ${
                  columnsVisibility.shippingCharges
                    ? "<th>Shipping Charges</th>"
                    : ""
                }
                ${columnsVisibility.totalAmount ? "<th>Total Amount</th>" : ""}
                ${
                  columnsVisibility.additionalNotes
                    ? "<th>Additional Notes</th>"
                    : ""
                }
              </tr>
            </thead>
            <tbody>
              ${filteredStockTransfer.slice(startIndex, endIndex)
                .map((StockTransfer) => {
                  const getStatusClass = (status) => {
                    const statusText = StockTransfer.statusText?.toLowerCase();
                    switch (statusText) {
                      case 'pending': return 'status-pending';
                      case 'sent': return 'status-sent';
                      case 'received': return 'status-received';
                      case 'completed': return 'status-completed';
                      case 'cancelled': return 'status-cancelled';
                      default: return '';
                    }
                  };
                  
                  return `
                    <tr>
                      ${
                        columnsVisibility.data
                          ? `<td>${formatDate(StockTransfer.data || StockTransfer.transferDate)}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.referenceNo
                          ? `<td>${StockTransfer.referenceNo}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.locationFrom
                          ? `<td>${StockTransfer.locationFrom}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.locationTo
                          ? `<td>${StockTransfer.locationTo}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.status
                          ? `<td class="${getStatusClass(StockTransfer.status)}">${StockTransfer.statusText}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.shippingCharges
                          ? `<td>${StockTransfer.shippingCharges}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmount
                          ? `<td>${StockTransfer.totalAmount}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.additionalNotes
                          ? `<td>${StockTransfer.additionalNotes || "None"}</td>`
                          : ""
                      }
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

  const handleSaveUnit = async () => {
    try {
      if (modalType === "edit" && currentListStock) {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/ListStockTransfer/update/${currentListStock.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData, id: currentListStock.id }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update unit");
        }

        const updatedUnit = await response.json();
        setListStockTransfer((prevUnits) =>
          prevUnits.map((unit) =>
            unit.id === updatedUnit.id ? updatedUnit : unit
          )
        );
        closeModal();
        alert("Stock transfer updated successfully!");
      } else if (modalType === "add") {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/ListStockTransfer/save`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.status !== 201) {
          throw new Error("Failed to add stock transfer");
        }

        const newUnit = await response.json();
        setListStockTransfer((prevUnits) => [...prevUnits, newUnit]);
        closeModal();
        alert("Stock transfer added successfully!");
      }
    } catch (error) {
      console.error("Error saving stock transfer:", error);
      alert("Error saving stock transfer");
    }
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentListStock(null);
    setFormData({
      data: "",
      referenceNo: "",
      locationFrom: "",
      locationTo: "",
      status: "",
      shippingCharges: "",
      totalAmount: "",
      additionalNotes: "",
    });
  };

  const handleEdit = (id) => {
    const StockTransferToEdit = ListStockTransfer.find(
      (StockTransfer) => StockTransfer.id === id
    );
    if (StockTransferToEdit) {
      setCurrentListStock(StockTransferToEdit);
      setFormData({
        data: StockTransferToEdit.data,
        referenceNo: StockTransferToEdit.referenceNo,
        locationFrom: StockTransferToEdit.locationFrom,
        locationTo: StockTransferToEdit.locationTo,
        status: StockTransferToEdit.status,
        shippingCharges: StockTransferToEdit.shippingCharges,
        totalAmount: StockTransferToEdit.totalAmount,
        additionalNotes: StockTransferToEdit.additionalNotes,
      });
      setModalType("edit");
    }
  };

  const handleView = (id) => {
    const StockTransferToView = ListStockTransfer.find(
      (StockTransfer) => StockTransfer.id === id
    );
    if (StockTransferToView) {
      setCurrentListStock(StockTransferToView);
      setModalType("view");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock transfer?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/ListStockTransfer/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.status === 204) {
          setListStockTransfer((prevUnits) =>
            prevUnits.filter((unit) => unit.id !== id)
          );
          alert("Stock transfer deleted successfully!");
        } else {
          alert("Failed to delete stock transfer.");
        }
      } catch (error) {
        console.error("Error deleting stock transfer:", error);
        alert("Error deleting stock transfer");
      }
    }
  };

  const totalPages = Math.ceil(filteredStockTransfer.length / entriesPerPage);

  const getStatusBadgeClass = (statusText) => {
    if (!statusText) return 'badge-secondary';
    
    const status = statusText.toLowerCase();
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'sent': return 'badge-info';
      case 'received': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Stock Transfer</h1>
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
                      {/* Status Dropdown */}
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

                      {/* Location From Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Location From:</label>
                          <select
                            className="form-select"
                            name="locationFrom"
                            value={activeFilters.locationFrom}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Locations</option>
                            {filterValues.locationsFrom.map((location, index) => (
                              <option key={`from-${index}`} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Location To Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Location To:</label>
                          <select
                            className="form-select"
                            name="locationTo"
                            value={activeFilters.locationTo}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Locations</option>
                            {filterValues.locationsTo.map((location, index) => (
                              <option key={`to-${index}`} value={location}>
                                {location}
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
                <Link to="/AddStockTransfer" className="btn btn-add">
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
                          data: "Date",
                          referenceNo: "Reference No",
                          locationFrom: "Location From",
                          locationTo: "Location To",
                          status: "Status",
                          shippingCharges: "Shipping Charges",
                          totalAmount: "Total Amount",
                          additionalNotes: "Additional Notes",
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
                        {columnsVisibility.data && <th>Date</th>}
                        {columnsVisibility.referenceNo && <th>Reference No</th>}
                        {columnsVisibility.locationFrom && (
                          <th>Location (From)</th>
                        )}
                        {columnsVisibility.locationTo && <th>Location (To)</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.shippingCharges && (
                          <th>Shipping Charges</th>
                        )}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}
                        {columnsVisibility.additionalNotes && (
                          <th>Additional Notes</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStockTransfer.slice(startIndex, endIndex).map(
                        (StockTransfer) => (
                          <tr key={StockTransfer.id}>
                            {columnsVisibility.action && (
                              <td>
                                <button
                                  className="btn btn-edit btn-sm mr-2"
                                  onClick={() => handleEdit(StockTransfer.id)}
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button
                                  className="btn btn-view btn-sm mr-2"
                                  onClick={() => handleView(StockTransfer.id)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </button>
                                <button
                                  className="btn btn-delete btn-sm"
                                  onClick={() => handleDelete(StockTransfer.id)}
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </td>
                            )}
                            {columnsVisibility.data && (
                              <td>{formatDate(StockTransfer.data || StockTransfer.transferDate)}</td>
                            )}
                            {columnsVisibility.referenceNo && (
                              <td>{StockTransfer.referenceNo}</td>
                            )}
                            {columnsVisibility.locationFrom && (
                              <td>{StockTransfer.locationFrom}</td>
                            )}
                            {columnsVisibility.locationTo && (
                              <td>{StockTransfer.locationTo}</td>
                            )}
                            {columnsVisibility.status && (
                              <td>
                                <span className={`badge ${getStatusBadgeClass(StockTransfer.statusText)}`}>
                                  {StockTransfer.statusText}
                                </span>
                              </td>
                            )}
                            {columnsVisibility.shippingCharges && (
                              <td>{StockTransfer.shippingCharges}</td>
                            )}
                            {columnsVisibility.totalAmount && (
                              <td>{StockTransfer.totalAmount}</td>
                            )}
                            {columnsVisibility.additionalNotes && (
                              <td>{StockTransfer.additionalNotes || "None"}</td>
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

        {/* Modal */}
        {modalType && (
          <div
            className="modal fade show"
            id="unitModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="unitModalLabel"
            aria-hidden={!modalType}
            style={{ display: modalType ? "block" : "none" }}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="unitModalLabel">
                    {modalType === "add"
                      ? "Add Stock Transfer"
                      : modalType === "edit"
                        ? "Edit Stock Transfer"
                        : "View Stock Transfer"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveUnit();
                    }}
                  >
                    {modalType === "edit" && (
                      <div>
                        <div className="form-group">
                          <label htmlFor="data">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="data"
                            value={formData.data}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="referenceNo">Reference No</label>
                          <input
                            type="text"
                            className="form-control"
                            id="referenceNo"
                            value={formData.referenceNo}
                            onChange={handleFormChange}
                            placeholder="Enter reference number"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="locationFrom">Location (From)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="locationFrom"
                            value={formData.locationFrom}
                            onChange={handleFormChange}
                            placeholder="Enter location from"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="locationTo">Location (To)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="locationTo"
                            value={formData.locationTo}
                            onChange={handleFormChange}
                            placeholder="Enter location to"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="status">Status</label>
                          <select
                            className="form-control"
                            id="status"
                            value={formData.status}
                            onChange={handleFormChange}
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Sent">Sent</option>
                            <option value="Received">Received</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="shippingCharges">
                            Shipping Charges
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="shippingCharges"
                            value={formData.shippingCharges}
                            onChange={handleFormChange}
                            placeholder="Enter shipping charges"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="totalAmount">Total Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            id="totalAmount"
                            value={formData.totalAmount}
                            onChange={handleFormChange}
                            placeholder="Enter total amount"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="additionalNotes">
                            Additional Notes
                          </label>
                          <textarea
                            className="form-control"
                            id="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleFormChange}
                            placeholder="Enter additional notes"
                          />
                        </div>
                      </div>
                    )}

                    {modalType === "view" && currentListStock && (
                      <div>
                        <p>
                          <strong>Date:</strong> {formatDate(currentListStock.data)}
                        </p>
                        <p>
                          <strong>Reference No:</strong>{" "}
                          {currentListStock.referenceNo}
                        </p>
                        <p>
                          <strong>Location (From):</strong>{" "}
                          {currentListStock.locationFrom}
                        </p>
                        <p>
                          <strong>Location (To):</strong>{" "}
                          {currentListStock.locationTo}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`badge ${getStatusBadgeClass(currentListStock.statusText)}`}>
                            {currentListStock.statusText}
                          </span>
                        </p>
                        <p>
                          <strong>Shipping Charges:</strong>{" "}
                          {currentListStock.shippingCharges}
                        </p>
                        <p>
                          <strong>Total Amount:</strong>{" "}
                          {currentListStock.totalAmount}
                        </p>
                        <p>
                          <strong>Additional Notes:</strong>{" "}
                          {currentListStock.additionalNotes || "None"}
                        </p>
                      </div>
                    )}
                    <div className="modal-footer">
                      {modalType === "add" || modalType === "edit" ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeModal}
                          >
                            Close
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Save
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListStockTransfer;