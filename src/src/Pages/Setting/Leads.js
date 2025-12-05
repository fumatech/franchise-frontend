import React, { useState, useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import axios from "axios";

const Leads = () => {
  // Table data state
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    contactId: "",
    name: "",
    email: "",
    source: "Facebook",
    lifeStage: "New",
    assignedTo: "",
    mobile: "",
    taxNumber: "",
    addedOn: new Date().toLocaleDateString(),
    customField1: "",
    customField2: "",
    customField3: "",
  });

  // Table configuration
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Columns visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    Action: true,
    "Contact ID": true,
    Name: true,
    Email: true,
    Source: true,
    "Life Stage": true,
    "Assigned to": true,
    Mobile: true,
    "Tax number": true,
    "Added On": true,
    "Custom Field 1": true,
    "Custom Field 2": true,
    "Custom Field 3": true,
  });

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/leads/getall`
        );
        setLeads(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLeads();
  }, []);

  // Open modal for adding new lead
  const openAddModal = () => {
    setCurrentLead(null);
    setFormData({
      contactId: "",
      name: "",
      email: "",
      source: "Facebook",
      lifeStage: "New",
      assignedTo: "",
      mobile: "",
      taxNumber: "",
      addedOn: new Date().toLocaleDateString(),
      customField1: "",
      customField2: "",
      customField3: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing lead
  const openEditModal = (lead) => {
    setCurrentLead(lead);
    setFormData({
      contactId: lead.contactId,
      name: lead.name,
      email: lead.email,
      source: lead.source,
      lifeStage: lead.lifeStage,
      assignedTo: lead.assignedTo,
      mobile: lead.mobile,
      taxNumber: lead.taxNumber,
      addedOn: lead.addedOn,
      customField1: lead.customField1,
      customField2: lead.customField2,
      customField3: lead.customField3,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentLead) {
        // Update existing lead
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/leads/update/${currentLead.id}`,
          formData
        );
        const updatedLeads = leads.map((lead) =>
          lead.id === currentLead.id ? { ...lead, ...formData } : lead
        );
        setLeads(updatedLeads);
      } else {
        // Add new lead
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/leads/add`,
          formData
        );
        setLeads([...leads, response.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving lead:", err);
      alert("Error saving lead. Please try again.");
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/leads/delete/${id}`
        );
        setLeads(leads.filter((lead) => lead.id !== id));
      } catch (err) {
        console.error("Error deleting lead:", err);
        alert("Error deleting lead. Please try again.");
      }
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(leads.length / entriesPerPage);
  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some(
      (val) =>
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const exportCSV = () => {
    const headers = Object.keys(columnsVisibility).filter(
      (col) => columnsVisibility[col]
    );
    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        headers
          .map((header) => {
            const key = header.toLowerCase().replace(/\s+/g, "");
            return `"${lead[key] || ""}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads.csv";
    link.click();
  };

  const exportExcel = () => alert("Exporting to Excel...");
  const printData = () => window.print();
  const exportPDF = () => alert("Exporting to PDF...");

  const visibleColumnsCount =
    Object.values(columnsVisibility).filter(Boolean).length;

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation();
    toggleColumn(col);
  };

  return (
    <div className="wrapper" style={{ overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="all-heading m-0">All Leads</h1>
              <span className="sub-heading">Manage leads</span>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="text-right p-3">
                <button className="btn btn-add" onClick={openAddModal}>
                  <i className="fas fa-plus"></i> Add
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
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        {columnsVisibility.Action && <th>Action</th>}
                        {columnsVisibility["Contact ID"] && <th>Contact ID</th>}
                        {columnsVisibility.Name && <th>Name</th>}
                        {columnsVisibility.Email && <th>Email</th>}
                        {columnsVisibility.Source && <th>Source</th>}
                        {columnsVisibility["Life Stage"] && <th>Life Stage</th>}
                        {columnsVisibility["Assigned to"] && (
                          <th>Assigned to</th>
                        )}
                        {columnsVisibility.Mobile && <th>Mobile</th>}
                        {columnsVisibility["Tax number"] && <th>Tax number</th>}
                        {columnsVisibility["Added On"] && <th>Added On</th>}
                        {columnsVisibility["Custom Field 1"] && (
                          <th>Custom Field 1</th>
                        )}
                        {columnsVisibility["Custom Field 2"] && (
                          <th>Custom Field 2</th>
                        )}
                        {columnsVisibility["Custom Field 3"] && (
                          <th>Custom Field 3</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeads.length > 0 ? (
                        paginatedLeads.map((lead) => (
                          <tr key={lead.id}>
                            {columnsVisibility.Action && (
                              <td>
                                <DropdownButton
                                  id="dropdown-basic-button"
                                  title="Actions"
                                  variant="outline-success rounded-5 fs-6 fw-light border-1"
                                  className="custom-outline-dropdown p-2"
                                >
                                  <Dropdown.Item as="button">
                                    <div className="d-inline-block w-100 btn-view justify-content-center text-secondary">
                                      <i className="dropdown_hover fa fa-eye me-3"></i>
                                      <span>View</span>
                                    </div>
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    as="button"
                                    onClick={() => openEditModal(lead)}
                                  >
                                    <div className="d-inline-block w-100 btn-edit justify-content-center text-secondary">
                                      <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                      <span>Edit</span>
                                    </div>
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    as="button"
                                    onClick={() => deleteLead(lead.id)}
                                  >
                                    <div className="d-inline-block w-100 btn-delete justify-content-center text-secondary">
                                      <i className="fa fa-trash me-3"></i>
                                      <span>delete</span>
                                    </div>
                                  </Dropdown.Item>
                                </DropdownButton>
                              </td>
                            )}
                            {columnsVisibility["Contact ID"] && (
                              <td>{lead.contactId}</td>
                            )}
                            {columnsVisibility.Name && <td>{lead.name}</td>}
                            {columnsVisibility.Email && <td>{lead.email}</td>}
                            {columnsVisibility.Source && <td>{lead.source}</td>}
                            {columnsVisibility["Life Stage"] && (
                              <td>{lead.lifeStage}</td>
                            )}
                            {columnsVisibility["Assigned to"] && (
                              <td>{lead.assignedTo}</td>
                            )}
                            {columnsVisibility.Mobile && <td>{lead.mobile}</td>}
                            {columnsVisibility["Tax number"] && (
                              <td>{lead.taxNumber}</td>
                            )}
                            {columnsVisibility["Added On"] && (
                              <td>{lead.addedOn}</td>
                            )}
                            {columnsVisibility["Custom Field 1"] && (
                              <td>{lead.customField1}</td>
                            )}
                            {columnsVisibility["Custom Field 2"] && (
                              <td>{lead.customField2}</td>
                            )}
                            {columnsVisibility["Custom Field 3"] && (
                              <td>{lead.customField3}</td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={visibleColumnsCount}
                            className="text-center"
                          >
                            No data available in table
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal for Add/Edit Lead */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentLead ? "Edit Lead" : "Add New Lead"}
                  </h5>
                  <button type="button" className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="name">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="email">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="source">Source</label>
                          <select
                            className="form-control"
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                          >
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Email">Email</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="lifeStage">Life Stage</label>
                          <select
                            className="form-control"
                            id="lifeStage"
                            name="lifeStage"
                            value={formData.lifeStage}
                            onChange={handleInputChange}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Prospect">Prospect</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Customer">Customer</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="assignedTo">Assigned To</label>
                          <input
                            type="text"
                            className="form-control"
                            id="assignedTo"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="mobile">Mobile</label>
                          <input
                            type="text"
                            className="form-control"
                            id="mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="taxNumber">Tax Number</label>
                          <input
                            type="text"
                            className="form-control"
                            id="taxNumber"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="addedOn">Added On</label>
                          <input
                            type="text"
                            className="form-control"
                            id="addedOn"
                            name="addedOn"
                            value={formData.addedOn}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="customField1">Custom Field 1</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField1"
                            name="customField1"
                            value={formData.customField1}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="customField2">Custom Field 2</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField2"
                            name="customField2"
                            value={formData.customField2}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="customField3">Custom Field 3</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField3"
                            name="customField3"
                            value={formData.customField3}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {currentLead ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
