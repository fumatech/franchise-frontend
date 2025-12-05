import React, { useState, useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import axios from "axios";

const Campaigns = () => {
  // Table data state
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    campaignType: "Email",
    createdBy: "",
    createdAt: new Date().toLocaleDateString(),
  });

  // Table configuration
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Columns visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    Action: true,
    "Campaign Name": true,
    "Campaign Type": true,
    "Created By": true,
    "Created At": true,
  });

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/campaigns/getall`
        );
        setCampaigns(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCampaigns();
  }, []);

  // Open modal for adding new campaign
  const openAddModal = () => {
    setCurrentCampaign(null);
    setFormData({
      campaignName: "",
      campaignType: "Email",
      createdBy: "",
      createdAt: new Date().toLocaleDateString(),
    });
    setIsModalOpen(true);
  };

  // Open modal for editing campaign
  const openEditModal = (campaign) => {
    setCurrentCampaign(campaign);
    setFormData({
      campaignName: campaign.campaignName,
      campaignType: campaign.campaignType,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt,
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
      if (currentCampaign) {
        // Update existing campaign
        const response = await axios.put(
          `${process.env.REACT_APP_BASE_URL}/campaigns/update/${currentCampaign.id}`,
          formData
        );
        const updatedCampaigns = campaigns.map((campaign) =>
          campaign.id === currentCampaign.id ? response.data : campaign
        );
        setCampaigns(updatedCampaigns);
      } else {
        // Add new campaign
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/campaigns/add`,
          formData
        );
        setCampaigns([...campaigns, response.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving campaign:", err);
      alert("Error saving campaign. Please try again.");
    }
  };

  // Delete campaign
  const deleteCampaign = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/campaigns/delete/${id}`
        );
        setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
      } catch (err) {
        console.error("Error deleting campaign:", err);
        alert("Error deleting campaign. Please try again.");
      }
    }
  };

  // Send notification
  const sendNotification = async (id) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/campaigns/notify/${id}`
      );
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Error sending notification. Please try again.");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(campaigns.length / entriesPerPage);
  const filteredCampaigns = campaigns.filter((campaign) =>
    Object.values(campaign).some(
      (val) =>
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const paginatedCampaigns = filteredCampaigns.slice(
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
      ...campaigns.map((campaign) =>
        headers
          .map((header) => {
            const key = header.toLowerCase().replace(/\s+/g, "");
            return `"${campaign[key] || ""}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campaigns.csv";
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
              <h1 className="all-heading m-0">All Campaigns</h1>
              <span className="sub-heading">Manage campaigns</span>
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
                        {columnsVisibility["Campaign Name"] && (
                          <th>Campaign Name</th>
                        )}
                        {columnsVisibility["Campaign Type"] && (
                          <th>Campaign Type</th>
                        )}
                        {columnsVisibility["Created By"] && <th>Created By</th>}
                        {columnsVisibility["Created At"] && <th>Created At</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCampaigns.length > 0 ? (
                        paginatedCampaigns.map((campaign) => (
                          <tr key={campaign.id}>
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
                                    onClick={() => openEditModal(campaign)}
                                  >
                                    <div className="d-inline-block w-100 btn-edit justify-content-center text-secondary">
                                      <i className="dropdown_hover fa-solid fa-pen-to-square me-3"></i>
                                      <span>Edit</span>
                                    </div>
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    as="button"
                                    onClick={() => deleteCampaign(campaign.id)}
                                  >
                                    <div className="d-inline-block w-100 btn-delete justify-content-center text-secondary">
                                      <i className="fa fa-trash me-3"></i>
                                      <span>Delete</span>
                                    </div>
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    as="button"
                                    onClick={() =>
                                      sendNotification(campaign.id)
                                    }
                                  >
                                    <div className="d-inline-block w-100 btn-notification justify-content-center text-secondary">
                                      <i className="fa fa-bell me-3"></i>
                                      <span>Send Notification</span>
                                    </div>
                                  </Dropdown.Item>
                                </DropdownButton>
                              </td>
                            )}
                            {columnsVisibility["Campaign Name"] && (
                              <td>{campaign.campaignName}</td>
                            )}
                            {columnsVisibility["Campaign Type"] && (
                              <td>{campaign.campaignType}</td>
                            )}
                            {columnsVisibility["Created By"] && (
                              <td>{campaign.createdBy}</td>
                            )}
                            {columnsVisibility["Created At"] && (
                              <td>{campaign.createdAt}</td>
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

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="dataTables_info">
                      Showing {paginatedCampaigns.length > 0 ? 1 : 0} to{" "}
                      {paginatedCampaigns.length} of {campaigns.length} entries
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination">
                        <li
                          className={`paginate_button page-item previous ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        <li className="paginate_button page-item active">
                          <button className="page-link">{currentPage}</button>
                        </li>
                        <li
                          className={`paginate_button page-item next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
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

      {/* Modal for Add/Edit Campaign */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentCampaign ? "Edit Campaign" : "Add New Campaign"}
                  </h5>
                  <button type="button" className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="campaignName">Campaign Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="campaignName"
                        name="campaignName"
                        value={formData.campaignName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="campaignType">Campaign Type</label>
                      <select
                        className="form-control"
                        id="campaignType"
                        name="campaignType"
                        value={formData.campaignType}
                        onChange={handleInputChange}
                      >
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Direct Mail">Direct Mail</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="createdBy">Created By</label>
                      <input
                        type="text"
                        className="form-control"
                        id="createdBy"
                        name="createdBy"
                        value={formData.createdBy}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="createdAt">Created At</label>
                      <input
                        type="text"
                        className="form-control"
                        id="createdAt"
                        name="createdAt"
                        value={formData.createdAt}
                        onChange={handleInputChange}
                      />
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
                        {currentCampaign ? "Update" : "Save"}
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

export default Campaigns;
