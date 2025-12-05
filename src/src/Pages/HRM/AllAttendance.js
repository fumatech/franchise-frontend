import React, { useState, useEffect } from "react";

const AllAttendance = () => {
  // State for columns visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    name: true,
    shiftType: true,
    startTime: true,
    endTime: true,
    holiday: true,
  });

  // State to handle modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for employee and shift data (this will be dynamically fetched)
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([
    { id: "morning", name: "Morning Shift" },
    { id: "evening", name: "Evening Shift" },
    { id: "night", name: "Night Shift" },
  ]);
  const [attendanceData, setAttendanceData] = useState([]);

  // State for handling the form data
  const [formData, setFormData] = useState({
    employee: "",
    clockInTime: "",
    clockOutTime: "",
    shift: "",
    ipAddress: "",
    clockInNote: "",
    clockOutNote: "",
  });

  // Fetch employees data dynamically (replace with API call)
  useEffect(() => {
    // Sample dynamic fetching of employees (replace with an actual API call)
    const fetchEmployees = async () => {
      const employeesFromAPI = [
        { id: 1, name: "Mr Admin" },
        { id: 2, name: "Mr Demo Cashier" },
        { id: 3, name: "Mr. Demo Admin" },
        { id: 4, name: "Mr. Super Admin" },
        { id: 5, name: "Mr WooCommerce User" },
      ];
      setEmployees(employeesFromAPI);
    };
    fetchEmployees();
  }, []);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add new attendance data to the list
  const handleAddAttendance = () => {
    setAttendanceData((prevData) => [
      ...prevData,
      { ...formData, id: prevData.length + 1 },
    ]);
    closeModal();
  };

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="card cardHover rounded-4 border-0">
          <div className="text-right p-3">
            <button
              className="btn btn-add"
              onClick={openModal} // Open modal when clicked
            >
              <i className="fas fa-plus"></i> Add Attendance
            </button>
            <div className="table-responsive">
              <div className="card-body">
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
                            onChange={() => {
                              setColumnsVisibility((prev) => ({
                                ...prev,
                                [col]: !prev[col],
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="btn border-0 bg-transparent p-0 m-0">
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
                      {columnsVisibility.name && <th>Name</th>}
                      {columnsVisibility.shiftType && <th>Shift Type</th>}
                      {columnsVisibility.startTime && <th>Start time</th>}
                      {columnsVisibility.endTime && <th>End time</th>}
                      {columnsVisibility.holiday && <th>Holiday</th>}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((attendance) => (
                      <tr key={attendance.id}>
                        {columnsVisibility.name && (
                          <td>{attendance.employee}</td>
                        )}
                        {columnsVisibility.shiftType && (
                          <td>{attendance.shift}</td>
                        )}
                        {columnsVisibility.startTime && (
                          <td>{attendance.clockInTime}</td>
                        )}
                        {columnsVisibility.endTime && (
                          <td>{attendance.clockOutTime}</td>
                        )}
                        {columnsVisibility.holiday && (
                          <td>{attendance.holiday}</td>
                        )}
                        <td>
                          <button className="btn btn-edit">
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding Attendance */}
      {isModalOpen && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            paddingTop: "50px",
            position: "fixed", // Ensure it's fixed in the viewport
            top: "50%", // Center vertically
            left: "50%", // Center horizontally
            transform: "translate(-50%, -50%)", // Center modal properly
            zIndex: "1050", // Ensure modal is on top
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="attendanceModalTitle"
          onClick={(e) => {
            // Close modal only when clicking on backdrop
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="modal-dialog modal-xl"
            role="document"
            style={{
              maxWidth: "1000px", // Increase width
              width: "85%", // Larger width
              height: "auto",
            }}
          >
            <div className="modal-content">
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#0c4166",
                  color: "white",
                  padding: "20px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <h5 className="modal-title" id="attendanceModalTitle">
                  Add Latest Attendance
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
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
                  maxHeight: "calc(100vh - 200px)", // Limit the height for scroll
                }}
              >
                {/* Employee Selection */}
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label
                        htmlFor="select_employee"
                        className="font-weight-bold"
                      >
                        Select Employee:
                      </label>
                      <select
                        className="form-control select2"
                        style={{ width: "100%", height: "46px" }}
                        id="select_employee"
                        name="employee"
                        required
                        value={formData.employee}
                        onChange={handleInputChange}
                      >
                        <option value="">Select employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="table-responsive">
                  <table
                    className="table table-bordered table-hover"
                    id="employee_attendance_table"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th className="align-middle" width="15%">
                          Employee
                        </th>
                        <th className="align-middle" width="15%">
                          Clock In Time
                        </th>
                        <th className="align-middle" width="15%">
                          Clock Out Time
                        </th>
                        <th className="align-middle" width="15%">
                          Shift
                        </th>
                        <th className="align-middle" width="12%">
                          IP Address
                        </th>
                        <th className="align-middle" width="15%">
                          Clock In Note
                        </th>
                        <th className="align-middle" width="15%">
                          Clock Out Note
                        </th>
                        <th className="align-middle" width="3%">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="align-middle">{formData.employee}</td>
                        <td className="align-middle">
                          <input
                            type="datetime-local"
                            className="form-control form-control-sm"
                            name="clockInTime"
                            value={formData.clockInTime}
                            onChange={handleInputChange}
                            required
                          />
                        </td>
                        <td className="align-middle">
                          <input
                            type="datetime-local"
                            className="form-control form-control-sm"
                            name="clockOutTime"
                            value={formData.clockOutTime}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td className="align-middle">
                          <select
                            className="form-control form-control-sm"
                            name="shift"
                            value={formData.shift}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Shift</option>
                            {shifts.map((shift) => (
                              <option key={shift.id} value={shift.id}>
                                {shift.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            name="ipAddress"
                            value={formData.ipAddress}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td className="align-middle">
                          <textarea
                            className="form-control form-control-sm"
                            rows="1"
                            name="clockInNote"
                            value={formData.clockInNote}
                            onChange={handleInputChange}
                          ></textarea>
                        </td>
                        <td className="align-middle">
                          <textarea
                            className="form-control form-control-sm"
                            rows="1"
                            name="clockOutNote"
                            value={formData.clockOutNote}
                            onChange={handleInputChange}
                          ></textarea>
                        </td>
                        <td className="align-middle">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={handleAddAttendance}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{ padding: "20px", borderTop: "1px solid #ddd" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={closeModal}
                  style={{ padding: "10px 20px", backgroundColor: "#6c757d" }}
                >
                  <i className="fas fa-times mr-2"></i> Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ padding: "10px 20px", backgroundColor: "#007bff" }}
                  onClick={handleAddAttendance}
                >
                  <i className="fas fa-save mr-2"></i> Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAttendance;
