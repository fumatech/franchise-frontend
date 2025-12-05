import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileExport,
  FaPrint,
  FaEye,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const FollowUps = () => {
  // State for filters
  const [filters, setFilters] = useState({
    contact: "All",
    followUpType: "All",
    assigned: "All",
    status: "All",
    dateRange: {
      start: "",
      end: "",
    },
    followUpBy: "All",
    searchQuery: "",
  });

  // State for modal and form
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    customerLead: "",
    status: "",
    startDatetime: "",
    description: "",
    followUpType: "",
    assigned: "",
    sendNotification: false,
  });

  // State for editing follow-up
  const [editingFollowUp, setEditingFollowUp] = useState(null);

  // State for column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    Action: true,
    Contact: true,
    StartDatetime: true,
    EndDatetime: true,
    Status: true,
    FollowUpType: true,
    AssignedToCall: true,
    Description: true,
    AdditionalInfo: true,
    Title: true,
    AddedBy: true,
    AddedOn: true,
  });

  // State for pagination
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  // Sample data
  const allFollowUps = [
    {
      id: 1,
      contact: "Harry",
      startDatetime: "02/02/2021 23:27",
      endDatetime: "02/02/2021 23:27",
      status: "Open",
      followUpType: "Sales",
      assignedToCall: "Call",
      description: "WO",
      additionalInfo: "sd",
      title: "sdsd",
      addedBy: "Mr. Super Admin",
      addedOn: "02/02/2021 23:27",
    },
    {
      id: 2,
      contact: "Walk-In Customer",
      startDatetime: "02/02/2021 23:26",
      endDatetime: "02/02/2021 23:26",
      status: "Completed",
      followUpType: "Payment",
      assignedToCall: "Email",
      description: "AE",
      additionalInfo: "sds",
      title: "Payment Reminder",
      addedBy: "Mr. Super Admin",
      addedOn: "02/02/2021 23:26",
    },
    {
      id: 3,
      contact: "Walk-In Customer",
      startDatetime: "02/02/2021 23:26",
      endDatetime: "02/15/2021 23:26",
      status: "Scheduled",
      followUpType: "Order",
      assignedToCall: "Call",
      description: "AE",
      additionalInfo: "sdsd",
      title: "Order Followup",
      addedBy: "Mr. Super Admin",
      addedOn: "02/02/2021 23:27",
    },
    {
      id: 4,
      contact: "John Doe",
      startDatetime: "03/01/2021 10:00",
      endDatetime: "03/01/2021 10:30",
      status: "Open",
      followUpType: "Sales",
      assignedToCall: "Call",
      description: "New lead",
      additionalInfo: "Interested in product X",
      title: "Sales Followup",
      addedBy: "Sales Rep",
      addedOn: "02/28/2021 15:45",
    },
  ];

  // Get unique values for filter options
  const contacts = [
    "All",
    ...new Set(allFollowUps.map((item) => item.contact)),
  ];
  const followUpTypes = [
    "All",
    ...new Set(allFollowUps.map((item) => item.followUpType)),
  ];
  const assignedToCalls = [
    "All",
    ...new Set(allFollowUps.map((item) => item.assignedToCall)),
  ];
  const statuses = ["All", ...new Set(allFollowUps.map((item) => item.status))];
  const addedBys = [
    "All",
    ...new Set(allFollowUps.map((item) => item.addedBy)),
  ];

  // Filter follow-ups based on selected filters
  const filteredFollowUps = allFollowUps.filter((followUp) => {
    // Contact filter
    if (filters.contact !== "All" && followUp.contact !== filters.contact) {
      return false;
    }

    // Follow Up Type filter
    if (
      filters.followUpType !== "All" &&
      followUp.followUpType !== filters.followUpType
    ) {
      return false;
    }

    // Assigned filter
    if (
      filters.assigned !== "All" &&
      followUp.assignedToCall !== filters.assigned
    ) {
      return false;
    }

    // Status filter
    if (filters.status !== "All" && followUp.status !== filters.status) {
      return false;
    }

    // Follow up by filter
    if (
      filters.followUpBy !== "All" &&
      followUp.addedBy !== filters.followUpBy
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      const followUpDate = new Date(followUp.startDatetime);

      if (followUpDate < startDate || followUpDate > endDate) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const matches =
        followUp.contact.toLowerCase().includes(searchLower) ||
        followUp.description.toLowerCase().includes(searchLower) ||
        followUp.title.toLowerCase().includes(searchLower) ||
        followUp.addedBy.toLowerCase().includes(searchLower);

      if (!matches) {
        return false;
      }
    }

    return true;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFollowUp) {
      console.log("Updating follow-up:", formData);
      // Update logic here
    } else {
      console.log("Adding new follow-up:", formData);
      // Add logic here
    }
    setShowAddModal(false);
    setEditingFollowUp(null);
    setFormData({
      title: "",
      customerLead: "",
      status: "",
      startDatetime: "",
      description: "",
      followUpType: "",
      assigned: "",
      sendNotification: false,
    });
  };

  // Modal toggle functions
  const openAddModal = () => {
    setEditingFollowUp(null);
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingFollowUp(null);
  };

  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
  };

  // Toggle column visibility
  const toggleColumn = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Handle dropdown item click
  const handleDropdownItemClick = (column, e) => {
    e.stopPropagation();
    toggleColumn(column);
  };

  // Action buttons for each row
  const renderActionButtons = (followUp) => {
    return (
      <>
        <div className="dropdown">
          <button
            className="btn btn-outline-success rounded-5 fs-6 fw-light border-1 dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Actions
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleView(followUp)}
              >
                <div className="d-inline-block w-75 btn-view justify-content-center text-secondary">
                  <i className="dropdown_hover fa fa-eye me-3"></i>
                  <span>View</span>
                </div>
              </button>
            </li>

            <li>
              <button
                className="dropdown-item"
                onClick={() => handleEdit(followUp)}
              >
                <div className="d-inline-block w-75 btn-edit justify-content-center text-secondary">
                  <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                  <span>Edit</span>
                </div>
              </button>
            </li>

            <li>
              <button
                className="dropdown-item text-danger"
                onClick={() => handleDelete(followUp.id)}
              >
                <div className="d-inline-block w-75 btn-delete justify-content-center text-danger">
                  <i className="fa fa-trash me-3"></i>
                  <span>Delete</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </>
    );
  };

  // Handle edit action
  const handleEdit = (followUp) => {
    setEditingFollowUp(followUp);
    setShowAddModal(true);
    setFormData({
      title: followUp.title,
      customerLead: followUp.contact,
      status: followUp.status,
      startDatetime: followUp.startDatetime,
      description: followUp.description,
      followUpType: followUp.followUpType,
      assigned: followUp.assignedToCall,
      sendNotification: false,
    });
  };

  // Handle view action
  const handleView = (followUp) => {
    alert(
      `Viewing follow-up:\n\nTitle: ${followUp.title}\nContact: ${followUp.contact}\nStatus: ${followUp.status}\nDescription: ${followUp.description}`
    );
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      console.log(`Deleting follow-up with ID: ${id}`);
      // Delete logic here
    }
  };

  // Implement CSV export with visible columns only
  const exportCSV = () => {
    const visibleColumns = Object.keys(columnVisibility).filter(
      (col) => columnVisibility[col]
    );

    const headers = visibleColumns.map((col) =>
      col.replace(/([A-Z])/g, " $1").trim()
    );

    const data = filteredFollowUps.map((followUp) => {
      return visibleColumns.map((col) => {
        switch (col) {
          case "Action":
            return "Edit/View/Delete";
          case "Contact":
            return followUp.contact;
          case "StartDatetime":
            return followUp.startDatetime;
          case "EndDatetime":
            return followUp.endDatetime;
          case "Status":
            return followUp.status;
          case "FollowUpType":
            return followUp.followUpType;
          case "AssignedToCall":
            return followUp.assignedToCall;
          case "Description":
            return followUp.description;
          case "AdditionalInfo":
            return followUp.additionalInfo;
          case "Title":
            return followUp.title;
          case "AddedBy":
            return followUp.addedBy;
          case "AddedOn":
            return followUp.addedOn;
          default:
            return "";
        }
      });
    });

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      data.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "followups_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Implement Excel export with visible columns only
  const exportExcel = () => {
    const visibleColumns = Object.keys(columnVisibility).filter(
      (col) => columnVisibility[col]
    );

    const data = filteredFollowUps.map((followUp) => {
      const row = {};
      visibleColumns.forEach((col) => {
        const header = col.replace(/([A-Z])/g, " $1").trim();
        switch (col) {
          case "Action":
            row[header] = "Edit/View/Delete";
            break;
          case "Contact":
            row[header] = followUp.contact;
            break;
          case "StartDatetime":
            row[header] = followUp.startDatetime;
            break;
          case "EndDatetime":
            row[header] = followUp.endDatetime;
            break;
          case "Status":
            row[header] = followUp.status;
            break;
          case "FollowUpType":
            row[header] = followUp.followUpType;
            break;
          case "AssignedToCall":
            row[header] = followUp.assignedToCall;
            break;
          case "Description":
            row[header] = followUp.description;
            break;
          case "AdditionalInfo":
            row[header] = followUp.additionalInfo;
            break;
          case "Title":
            row[header] = followUp.title;
            break;
          case "AddedBy":
            row[header] = followUp.addedBy;
            break;
          case "AddedOn":
            row[header] = followUp.addedOn;
            break;
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FollowUps");
    XLSX.writeFile(workbook, "followups_export.xlsx", { compression: true });
  };

  // Implement print with visible columns only
  const printData = () => {
    const visibleColumns = Object.keys(columnVisibility).filter(
      (col) => columnVisibility[col]
    );

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Follow Ups Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              @page { size: landscape; }
            }
          </style>
        </head>
        <body>
          <h2>Follow Ups Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                ${visibleColumns
                  .map(
                    (col) => `<th>${col.replace(/([A-Z])/g, " $1").trim()}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredFollowUps
                .map(
                  (followUp) => `
                <tr>
                  ${visibleColumns
                    .map((col) => {
                      switch (col) {
                        case "Action":
                          return "<td>Edit/View/Delete</td>";
                        case "Contact":
                          return `<td>${followUp.contact}</td>`;
                        case "StartDatetime":
                          return `<td>${followUp.startDatetime}</td>`;
                        case "EndDatetime":
                          return `<td>${followUp.endDatetime}</td>`;
                        case "Status":
                          return `<td>${followUp.status}</td>`;
                        case "FollowUpType":
                          return `<td>${followUp.followUpType}</td>`;
                        case "AssignedToCall":
                          return `<td>${followUp.assignedToCall}</td>`;
                        case "Description":
                          return `<td>${followUp.description}</td>`;
                        case "AdditionalInfo":
                          return `<td>${followUp.additionalInfo}</td>`;
                        case "Title":
                          return `<td>${followUp.title}</td>`;
                        case "AddedBy":
                          return `<td>${followUp.addedBy}</td>`;
                        case "AddedOn":
                          return `<td>${followUp.addedOn}</td>`;
                        default:
                          return "";
                      }
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Implement PDF export with visible columns only
  const exportPDF = () => {
    const visibleColumns = Object.keys(columnVisibility).filter(
      (col) => columnVisibility[col]
    );

    const doc = new jsPDF({
      orientation: "landscape",
    });

    const headers = visibleColumns.map((col) =>
      col.replace(/([A-Z])/g, " $1").trim()
    );

    const data = filteredFollowUps.map((followUp) => {
      return visibleColumns.map((col) => {
        switch (col) {
          case "Action":
            return "Edit/View/Delete";
          case "Contact":
            return followUp.contact;
          case "StartDatetime":
            return followUp.startDatetime;
          case "EndDatetime":
            return followUp.endDatetime;
          case "Status":
            return followUp.status;
          case "FollowUpType":
            return followUp.followUpType;
          case "AssignedToCall":
            return followUp.assignedToCall;
          case "Description":
            return followUp.description;
          case "AdditionalInfo":
            return followUp.additionalInfo;
          case "Title":
            return followUp.title;
          case "AddedBy":
            return followUp.addedBy;
          case "AddedOn":
            return followUp.addedOn;
          default:
            return "";
        }
      });
    });

    doc.autoTable({
      head: [headers],
      body: data,
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
      },
    });

    doc.save("followups_export.pdf");
  };

  // Calculate totals for summary
  const totalCount = filteredFollowUps.length;
  const scheduledCount = filteredFollowUps.filter(
    (f) => f.status === "Scheduled"
  ).length;
  const callCount = filteredFollowUps.filter(
    (f) => f.assignedToCall === "Call"
  ).length;
  const openCount = filteredFollowUps.filter((f) => f.status === "Open").length;

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date range changes
  const handleDateRangeChange = (e, field) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: e.target.value,
      },
    }));
  };

  return (
    <div className="wrapper" style={{ overflowY: "auto" }}>
      <div className="content-wrapper">
        {/* Filters Section */}
        <div className="card cardHover rounded-4 border-0">
          <h5 className="all-heading m-3">Filters</h5>
          <div className="card-body">
            <form>
              <div className="row">
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Contact:</label>
                    <select
                      className="form-select"
                      name="contact"
                      value={filters.contact}
                      onChange={(e) => handleFilterChange(e)}
                    >
                      {contacts.map((contact) => (
                        <option key={contact} value={contact}>
                          {contact}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Follow Up Type:</label>
                    <select
                      className="form-select"
                      name="followUpType"
                      value={filters.followUpType}
                      onChange={(e) => handleFilterChange(e)}
                    >
                      {followUpTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Assigned:</label>
                    <select
                      className="form-select"
                      name="assigned"
                      value={filters.assigned}
                      onChange={(e) => handleFilterChange(e)}
                    >
                      {assignedToCalls.map((assigned) => (
                        <option key={assigned} value={assigned}>
                          {assigned}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Status:</label>
                    <select
                      className="form-select"
                      name="status"
                      value={filters.status}
                      onChange={(e) => handleFilterChange(e)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Date Range:</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="date"
                        className="form-control me-2"
                        value={filters.dateRange.start}
                        onChange={(e) => handleDateRangeChange(e, "start")}
                      />
                      <span className="mx-2">to</span>
                      <input
                        type="date"
                        className="form-control ms-2"
                        value={filters.dateRange.end}
                        onChange={(e) => handleDateRangeChange(e, "end")}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Follow up by:</label>
                    <select
                      className="form-select"
                      name="followUpBy"
                      value={filters.followUpBy}
                      onChange={(e) => handleFilterChange(e)}
                    >
                      {addedBys.map((addedBy) => (
                        <option key={addedBy} value={addedBy}>
                          {addedBy}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Data Table Section */}
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="text-right p-3">
                <button className="btn btn-add" onClick={openAddModal}>
                  <i className="fas fa-plus"></i> Add
                </button>
                <button className="btn btn-add" onClick={openAddModal}>
                  <i className="fas fa-plus"></i> Add advance follow up
                </button>
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
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        {Object.keys(columnVisibility).map((col) => (
                          <div
                            key={col}
                            className="dropdown-item d-flex align-items-center"
                          >
                            <input
                              type="checkbox"
                              checked={columnVisibility[col]}
                              onChange={() => toggleColumn(col)}
                              className="mr-2"
                            />
                            <span
                              className="btn border-0 bg-transparent p-0 m-0"
                              onClick={(e) => handleDropdownItemClick(col, e)}
                            >
                              {col.replace(/([A-Z])/g, " $1").toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover mb-0">
                    <thead>
                      <tr>
                        {columnVisibility.Action && <th>Action</th>}
                        {columnVisibility.Contact && <th>Contact</th>}
                        {columnVisibility.StartDatetime && (
                          <th>Start Datetime</th>
                        )}
                        {columnVisibility.EndDatetime && <th>End Datetime</th>}
                        {columnVisibility.Status && <th>Status</th>}
                        {columnVisibility.FollowUpType && (
                          <th>Follow Up Type</th>
                        )}
                        {columnVisibility.AssignedToCall && (
                          <th>Assigned to Call</th>
                        )}
                        {columnVisibility.Description && <th>Description</th>}
                        {columnVisibility.AdditionalInfo && (
                          <th>Additional info</th>
                        )}
                        {columnVisibility.Title && <th>Title</th>}
                        {columnVisibility.AddedBy && <th>Added By</th>}
                        {columnVisibility.AddedOn && <th>Added On</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFollowUps.length > 0 ? (
                        filteredFollowUps.map((followUp) => (
                          <tr key={followUp.id}>
                            {columnVisibility.Action && (
                              <td>{renderActionButtons(followUp)}</td>
                            )}
                            {columnVisibility.Contact && (
                              <td>{followUp.contact}</td>
                            )}
                            {columnVisibility.StartDatetime && (
                              <td>{followUp.startDatetime}</td>
                            )}
                            {columnVisibility.EndDatetime && (
                              <td>{followUp.endDatetime}</td>
                            )}
                            {columnVisibility.Status && (
                              <td>{followUp.status}</td>
                            )}
                            {columnVisibility.FollowUpType && (
                              <td>{followUp.followUpType}</td>
                            )}
                            {columnVisibility.AssignedToCall && (
                              <td>{followUp.assignedToCall}</td>
                            )}
                            {columnVisibility.Description && (
                              <td>{followUp.description}</td>
                            )}
                            {columnVisibility.AdditionalInfo && (
                              <td>{followUp.additionalInfo}</td>
                            )}
                            {columnVisibility.Title && (
                              <td>{followUp.title}</td>
                            )}
                            {columnVisibility.AddedBy && (
                              <td>{followUp.addedBy}</td>
                            )}
                            {columnVisibility.AddedOn && (
                              <td>{followUp.addedOn}</td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={
                              Object.values(columnVisibility).filter(Boolean)
                                .length
                            }
                            className="text-center"
                          >
                            No follow-ups found matching your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    <div>
                      <strong>Total: {totalCount}</strong>
                    </div>
                    <div>Scheduled: {scheduledCount}</div>
                    <div>- Call: {callCount}</div>
                    <div>Open: {openCount}</div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      Showing 1 to {filteredFollowUps.length} of{" "}
                      {filteredFollowUps.length} entries
                    </div>
                    <button className="btn btn-light btn-sm" disabled>
                      Previous
                    </button>
                    <button className="btn btn-light btn-sm mx-1" disabled>
                      1
                    </button>
                    <button className="btn btn-light btn-sm" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add/Edit Follow Up Modal */}
        {showAddModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div
                className="modal-content"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  // height: "80vh", // Adjust the height as needed
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="modal-header"
                  style={{ backgroundColor: "#0c4166", color: "white" }}
                >
                  <h5 className="modal-title">
                    {editingFollowUp ? "Edit Follow Up" : "Add Follow Up"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={closeAddModal}
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: "#ffffff",
                    }}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{
                    padding: "20px",
                    overflowY: "auto", // Enable scrolling when necessary
                    flex: 1,
                    maxHeight: "calc(100vh - 150px)", // Limit the height so the scroll appears
                    scrollbarWidth: "thin", // For Firefox
                    msOverflowStyle: "none", // For IE and Edge
                  }}
                >
                  <h6>
                    {editingFollowUp
                      ? "Editing followup"
                      : "Adding new followup"}
                  </h6>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Title:*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Customer/Lead:*</label>
                      <select
                        className="form-control"
                        name="customerLead"
                        value={formData.customerLead}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Please Select</option>
                        {contacts
                          .filter((c) => c !== "All")
                          .map((contact) => (
                            <option key={contact} value={contact}>
                              {contact}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Status:*</label>
                          <select
                            className="form-control"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Please Select</option>
                            {statuses
                              .filter((s) => s !== "All")
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Start Datetime:*</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            name="startDatetime"
                            value={formData.startDatetime}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                      />
                      <small className="text-muted">
                        0 WORDS POWERED BY TINY
                      </small>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Follow Up Type:*</label>
                          <select
                            className="form-control"
                            name="followUpType"
                            value={formData.followUpType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Please Select</option>
                            {followUpTypes
                              .filter((t) => t !== "All")
                              .map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Assigned:*</label>
                          <select
                            className="form-control"
                            name="assigned"
                            value={formData.assigned}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Please Select</option>
                            {assignedToCalls
                              .filter((a) => a !== "All")
                              .map((assigned) => (
                                <option key={assigned} value={assigned}>
                                  {assigned}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="sendNotification"
                        checked={formData.sendNotification}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">
                        Send Notification
                      </label>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeAddModal}
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingFollowUp ? "Update" : "Save"}
                      </button>
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

export default FollowUps;
