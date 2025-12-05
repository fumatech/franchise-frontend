import React, { useState } from "react";

const Shifts = () => {
  const [columnsVisibility, setColumnsVisibility] = useState({
    name: true,
    shiftType: true,
    startTime: true,
    endTime: true,
    holiday: true,
    actions: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shiftData, setShiftData] = useState([]); // Remove static data, now dynamic
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    shiftType: "",
    startTime: "",
    endTime: "",
    holiday: "",
    autoClockOut: false,
    autoClockOutTime: "",
  });

  // Toggle column visibility
  const toggleColumn = (col) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };

  // Handle modal open/close
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Open modal with data (edit or add new)
  const openModal = (shift = null) => {
    if (shift) {
      setFormData(shift); // Edit existing shift
    } else {
      setFormData({
        id: null,
        name: "",
        shiftType: "",
        startTime: "",
        endTime: "",
        holiday: "",
        autoClockOut: false,
        autoClockOutTime: "",
      }); // Add new shift
    }
    setIsModalOpen(true);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission (save shift)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      // Edit shift
      setShiftData((prev) =>
        prev.map((shift) =>
          shift.id === formData.id ? { ...shift, ...formData } : shift
        )
      );
    } else {
      // Add new shift
      setShiftData((prev) => [
        ...prev,
        { ...formData, id: Date.now() }, // Using timestamp as a unique ID
      ]);
    }
    setIsModalOpen(false); // Close modal after submission
  };

  // Handle delete shift
  const handleDelete = (id) => {
    const updatedShifts = shiftData.filter((shift) => shift.id !== id);
    setShiftData(updatedShifts);
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="card cardHover rounded-4 border-0">
            <div className="text-right p-3">
              <button className="btn btn-add" onClick={() => openModal()}>
                <i className="fas fa-plus"></i> Add
              </button>
              <div className="card-body">
                {/* Table */}
                <div className="row mb-3 d-flex align-items-center">
                  <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold mt-2 mb-2 mr-2">
                    <label htmlFor="entriesPerPage" className="mb-0 mr-2">
                      Show
                    </label>
                    <select
                      id="entriesPerPage"
                      className="form-control form-control-sm mr-2"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={75}>75</option>
                      <option value={100}>100</option>
                    </select>
                    Entries
                  </div>
                </div>
                <div className="col d-flex flex-wrap align-items-center">
                  <button className="btn Export-Btn mt-2 mb-2 mr-2">
                    <i className="fa fa-file-csv"></i> Export CSV
                  </button>
                  <button className="btn Export-Btn mt-2 mb-2 mr-2">
                    <i className="fa fa-file-excel"></i> Export Excel
                  </button>
                  <button className="btn Export-Btn mt-2 mb-2 mr-2">
                    <i className="fa fa-print"></i> Print
                  </button>
                  <button className="btn Export-Btn mt-2 mb-2 mr-2">
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
                  className="table table-bordered table-hover"
                  id="example1"
                >
                  <thead>
                    <tr role="row">
                      {columnsVisibility.name && (
                        <th className="sorting_asc">Name</th>
                      )}
                      {columnsVisibility.shiftType && (
                        <th className="sorting">Shift Type</th>
                      )}
                      {columnsVisibility.startTime && (
                        <th className="sorting">Start time</th>
                      )}
                      {columnsVisibility.endTime && (
                        <th className="sorting">End time</th>
                      )}
                      {columnsVisibility.holiday && (
                        <th className="sorting_disabled">Holiday</th>
                      )}
                      {columnsVisibility.actions && (
                        <th className="sorting">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {shiftData.map((shift) => (
                      <tr key={shift.id} role="row">
                        {columnsVisibility.name && <td>{shift.name}</td>}
                        {columnsVisibility.shiftType && (
                          <td>{shift.shiftType}</td>
                        )}
                        {columnsVisibility.startTime && (
                          <td>{shift.startTime}</td>
                        )}
                        {columnsVisibility.endTime && <td>{shift.endTime}</td>}
                        {columnsVisibility.holiday && <td>{shift.holiday}</td>}
                        {columnsVisibility.actions && (
                          <td className="text-right">
                            <div className="btn-group btn-group-sm btn-icon-only">
                              <button
                                type="button"
                                className="btn-edit"
                                onClick={() => openModal(shift)}
                              >
                                <i className="fas fa-edit btn-icon"></i> Edit
                              </button>
                              <button
                                type="button"
                                className="btn-view"
                                onClick={() => openModal(shift)}
                              >
                                <i className="fas fa-eye btn-icon"></i> View
                              </button>
                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() => handleDelete(shift.id)}
                              >
                                <i className="fas fa-trash btn-icon"></i> Delete
                              </button>
                            </div>
                          </td>
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

      {/* Modal */}
      {isModalOpen && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div
            className="modal fade show"
            style={{ display: "block", overflowX: "hidden", overflowY: "auto" }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="addShiftModalTitle"
            onClick={(e) => {
              // Close modal only when clicking on backdrop (outside modal-content)
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title" id="addShiftModalTitle">
                      {formData.id ? "Edit Shift" : "Add Shift"}
                    </h5>
                    <button
                      type="button"
                      className="close text-white"
                      aria-label="Close"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="name" className="font-weight-bold">
                            Name:*
                          </label>
                          <input
                            className="form-control"
                            placeholder="Name"
                            required
                            name="name"
                            type="text"
                            id="name"
                            aria-required="true"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label
                            htmlFor="shiftType"
                            className="font-weight-bold"
                          >
                            Shift Type:*
                          </label>
                          <select
                            className="form-control"
                            id="shiftType"
                            name="shiftType"
                            value={formData.shiftType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select shift type</option>
                            <option value="fixed_shift">Fixed shift</option>
                            <option value="flexible_shift">
                              Flexible shift
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label
                            htmlFor="start_time"
                            className="font-weight-bold"
                          >
                            Start time:*
                          </label>
                          <input
                            className="form-control"
                            placeholder="Start time"
                            required
                            id="start_time"
                            name="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label
                            htmlFor="end_time"
                            className="font-weight-bold"
                          >
                            End time:*
                          </label>
                          <input
                            className="form-control"
                            placeholder="End time"
                            required
                            id="end_time"
                            name="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="holidays" className="font-weight-bold">
                        Holiday:
                      </label>
                      <select
                        className="form-control"
                        id="holidays"
                        name="holiday"
                        value={formData.holiday}
                        onChange={handleInputChange}
                      >
                        <option value="">No holiday</option>
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                    </div>

                    <div className="form-group d-flex align-items-center mt-3">
                      <div className="custom-control custom-checkbox">
                        <input
                          className="custom-control-input"
                          id="autoClockOut"
                          name="autoClockOut"
                          type="checkbox"
                          value="1"
                          checked={formData.autoClockOut}
                          onChange={handleInputChange}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="autoClockOut"
                        >
                          Do auto clock out
                        </label>
                      </div>
                    </div>

                    {formData.autoClockOut && (
                      <div className="form-group">
                        <label
                          htmlFor="auto_clockout_time"
                          className="font-weight-bold"
                        >
                          Auto clock out time:
                        </label>
                        <input
                          className="form-control"
                          placeholder="Auto clock out time"
                          name="autoClockOutTime"
                          type="time"
                          id="auto_clockout_time"
                          value={formData.autoClockOutTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      {formData.id ? "Save Changes" : "Submit"}
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
        </>
      )}
    </>
  );
};

export default Shifts;
