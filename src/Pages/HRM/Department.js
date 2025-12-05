// department.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported

const Department = () => {
  // State for managing modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for form inputs
  const [formData, setFormData] = useState({
    department: "",
    departmentId: "",
    description: "",
  });

  // State for managing entries per page
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  // State for managing column visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    Department: true,
    DepartmentId: true,
    Description: true,
    Action: true,
  });

  // Sample data for the table (can be fetched from an API or state)
  const [data, setData] = useState([]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData); // Replace with API call or further processing
    setIsModalOpen(false); // Close modal after submission
  };

  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
  };

  // Toggle column visibility
  const toggleColumn = (col) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  // Export functions (placeholders for now)
  const exportCSV = () => alert("Export CSV functionality");
  const exportExcel = () => alert("Export Excel functionality");
  const printData = () => alert("Print functionality");
  const exportPDF = () => alert("Export PDF functionality");

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };
  return (
    <div className="wrapper" style={{ overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading m-0 ">Department</h1>
                <span className="display-inline sub-heading">
                  Manage department
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="text-right">
                <button
                  className="btn btn-add"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add
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
                              onChange={() => toggleColumn(col)} // Toggle column visibility on checkbox change
                              className="mr-2"
                            />
                            <span
                              className="btn border-0 bg-transparent p-0 m-0"
                              onClick={(e) => handleDropdownItemClick(col, e)} // Handle click on dropdown item
                            >
                              {col.replace(/([A-Z])/g, " $1").toUpperCase()}
                            </span>
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
                    style={{ minWidth: "1000px" }}
                  >
                    <thead>
                      <tr role="row">
                        {columnsVisibility.Department && (
                          <th
                            className="sorting_asc"
                            tabIndex="0"
                            aria-controls="category_table"
                            aria-sort="ascending"
                            aria-label="Department: activate to sort column descending"
                          >
                            Department
                          </th>
                        )}
                        {columnsVisibility.DepartmentId && (
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="category_table"
                            aria-label="Department ID: activate to sort column ascending"
                          >
                            Department ID
                          </th>
                        )}
                        {columnsVisibility.Description && (
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="category_table"
                            aria-label="Description: activate to sort column ascending"
                          >
                            Description
                          </th>
                        )}
                        {columnsVisibility.Action && (
                          <th className="sorting_disabled" aria-label="Action">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr className="odd">
                          <td
                            valign="top"
                            colSpan={
                              Object.values(columnsVisibility).filter(Boolean)
                                .length
                            }
                            className="dataTables_empty"
                          >
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        data.map((row, index) => (
                          <tr key={index}>
                            {columnsVisibility.Department && (
                              <td>{row.department}</td>
                            )}
                            {columnsVisibility.DepartmentId && (
                              <td>{row.departmentId}</td>
                            )}
                            {columnsVisibility.Description && (
                              <td>{row.description}</td>
                            )}
                            {columnsVisibility.Action && (
                              <td>
                                <button className="btn btn-sm btn-primary">
                                  Edit
                                </button>
                                <button className="btn btn-sm btn-danger ml-2">
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                      <button
                        type="button"
                        className="close"
                        onClick={() => setIsModalOpen(false)}
                        aria-label="Close"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                      <h4 className="modal-title">Add Department</h4>
                    </div>

                    <div className="modal-body">
                      <div className="row">
                        <div className="form-group col-md-12">
                          <label htmlFor="department">Department:*</label>
                          <input
                            className="form-control"
                            placeholder="Department"
                            required
                            name="department"
                            type="text"
                            id="department"
                            value={formData.department}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group col-md-12">
                          <label htmlFor="departmentId">Department ID:*</label>
                          <input
                            className="form-control"
                            placeholder="Department ID"
                            required
                            name="departmentId"
                            type="text"
                            id="departmentId"
                            value={formData.departmentId}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group col-md-12">
                          <label htmlFor="description">Description:</label>
                          <textarea
                            className="form-control"
                            placeholder="Description"
                            rows="3"
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Department;
