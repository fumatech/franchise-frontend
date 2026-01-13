import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";

function Customer({ userRoles }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  const [columnsVisibility, setColumnsVisibility] = useState({
    customerName: true,
    firstName: true,
    lastName: true,
    email: true,
    mobileNumber: true,
    address: true,
    city: true,
    state: true,
    country: true,
    zipCode: true,
    dateOfBirth: true,
    gender: true,
    occupation: true,
    taxNumber: true,
    status: true,
  });
  
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [filterValues, setFilterValues] = useState({
    statuses: ["Active", "Inactive"],
    genders: [],
    occupations: [],
    cities: [],
    states: [],
    countries: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    status: "",
    gender: "",
    occupation: "",
    city: "",
    state: "",
    country: "",
    search: "",
  });

  // Fetch customers data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/customer/getall`
        );
        const customersData = response.data;
        setCustomers(customersData);
        setFilteredCustomers(customersData);

        // Extract filter values
        const genders = [...new Set(customersData.map((item) => item.gender))].filter(Boolean);
        const occupations = [...new Set(customersData.map((item) => item.occupation))].filter(Boolean);
        const cities = [...new Set(customersData.map((item) => item.city))].filter(Boolean);
        const states = [...new Set(customersData.map((item) => item.state))].filter(Boolean);
        const countries = [...new Set(customersData.map((item) => item.country))].filter(Boolean);

        setFilterValues({
          statuses: ["Active", "Inactive"],
          genders,
          occupations,
          cities,
          states,
          countries,
        });

        // Add external script directly
        const script = document.createElement("script");
        script.src = "js/JqueryContent.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  // Apply filters whenever activeFilters or customers change
  useEffect(() => {
    let result = customers;

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter((customer) =>
        Object.values(customer).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply status filter
    if (activeFilters.status) {
      const isActive = activeFilters.status === "Active";
      result = result.filter((customer) => customer.isActive === isActive);
    }

    // Apply gender filter
    if (activeFilters.gender) {
      result = result.filter((customer) => customer.gender === activeFilters.gender);
    }

    // Apply occupation filter
    if (activeFilters.occupation) {
      result = result.filter((customer) => customer.occupation === activeFilters.occupation);
    }

    // Apply location filters
    if (activeFilters.city) {
      result = result.filter((customer) => customer.city === activeFilters.city);
    }

    if (activeFilters.state) {
      result = result.filter((customer) => customer.state === activeFilters.state);
    }

    if (activeFilters.country) {
      result = result.filter((customer) => customer.country === activeFilters.country);
    }

    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [activeFilters, customers]);

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
      gender: "",
      occupation: "",
      city: "",
      state: "",
      country: "",
      search: "",
    });
  };

  const exportCSV = () => {
    const csvData = filteredCustomers.map((customer) => ({
      "First Name": customer.firstName,
      "Last Name": customer.lastName,
      Email: customer.email,
      "Mobile Number": customer.mobileNumber,
      Address: customer.permanentAddress || customer.address,
      City: customer.city,
      State: customer.state,
      Country: customer.country,
      "Zip Code": customer.zipCode,
      "Date of Birth": customer.dateOfBirth,
      Gender: customer.gender,
      Occupation: customer.occupation,
      Status: customer.isActive ? "Active" : "Inactive",
      "Tax Number": customer.taxNumber,
    }));

    const csv = [
      [
        "First Name",
        "Last Name",
        "Email",
        "Mobile Number",
        "Address",
        "City",
        "State",
        "Country",
        "Zip Code",
        "Date of Birth",
        "Gender",
        "Occupation",
        "Status",
        "Tax Number",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "customers.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCustomers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customers.xlsx");
  };

  const printData = () => {
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body >");
    printWindow.document.write(
      document.getElementById("table-container").innerHTML
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "First Name",
          "Last Name",
          "Email",
          "Mobile Number",
          "Address",
          "City",
          "State",
          "Country",
          "Zip Code",
          "Date of Birth",
          "Gender",
          "Occupation",
          "Status",
          "Tax Number",
        ],
      ],
      body: filteredCustomers.map((customer) => [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.mobileNumber,
        customer.permanentAddress || customer.address,
        customer.city,
        customer.state,
        customer.country,
        customer.zipCode,
        customer.dateOfBirth,
        customer.gender,
        customer.occupation,
        customer.isActive ? "Active" : "Inactive",
        customer.taxNumber,
      ]),
    });
    doc.save("customers.pdf");
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleEdit = (id) => {
    navigate(`/EditCustomer/${id}`);
  };

  const handleView = (id) => {
    navigate(`/ViewCustomer/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      fetch(`${process.env.REACT_APP_BASE_URL}/customer/delete/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 204) {
            setCustomers(customers.filter((customer) => customer.id !== id));
            alert("Customer deleted successfully!");
          } else {
            alert("Failed to delete customer.");
          }
        })
        .catch((error) => console.error("Error deleting customer:", error));
    }
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation();
    toggleColumn(col);
  };

  return (
    <div className="wrapper" style={{ maxHeight: "", overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading m-0">Customer</h1>
                <span className="display-inline sub-heading">
                  Manage customer
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid py-2">
            {/* Filter Component */}
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
                    {/* Search Input */}
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label className="me-2">Search:</label>
                          <input
                            type="text"
                            className="form-control"
                            name="search"
                            placeholder="Search in all fields..."
                            value={activeFilters.search}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>
                    </div>

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
                            <option value="">All</option>
                            {filterValues.statuses.map((status, index) => (
                              <option key={`status-${index}`} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Gender Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Gender:</label>
                          <select
                            className="form-select"
                            name="gender"
                            value={activeFilters.gender}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.genders.map((gender, index) => (
                              <option key={`gender-${index}`} value={gender}>
                                {gender}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Occupation Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Occupation:</label>
                          <select
                            className="form-select"
                            name="occupation"
                            value={activeFilters.occupation}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.occupations.map((occupation, index) => (
                              <option key={`occupation-${index}`} value={occupation}>
                                {occupation}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* City Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">City:</label>
                          <select
                            className="form-select"
                            name="city"
                            value={activeFilters.city}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.cities.map((city, index) => (
                              <option key={`city-${index}`} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* State Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">State:</label>
                          <select
                            className="form-select"
                            name="state"
                            value={activeFilters.state}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.states.map((state, index) => (
                              <option key={`state-${index}`} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Country Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Country:</label>
                          <select
                            className="form-select"
                            name="country"
                            value={activeFilters.country}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.countries.map((country, index) => (
                              <option key={`country-${index}`} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
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

            <div className="card cardHover rounded-4 border-0">
              <div className="text-right">
                <Link to="/AddCustomer" className="btn btn-add">
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

                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table
                    id="example1"
                    className="table table-bordered table-hover"
                    style={{ minWidth: "1000px" }}
                  >
                    <thead>
                      <tr>
                        <th>Actions</th>
                        {columnsVisibility.firstName && <th>First Name</th>}
                        {columnsVisibility.lastName && <th>Last Name</th>}
                        {columnsVisibility.email && <th>Email</th>}
                        {columnsVisibility.mobileNumber && (
                          <th>Mobile Number</th>
                        )}
                        {columnsVisibility.address && <th>Address</th>}
                        {columnsVisibility.city && <th>City</th>}
                        {columnsVisibility.state && <th>State</th>}
                        {columnsVisibility.country && <th>Country</th>}
                        {columnsVisibility.zipCode && <th>Zip Code</th>}
                        {columnsVisibility.dateOfBirth && (
                          <th>Date of Birth</th>
                        )}
                        {columnsVisibility.gender && <th>Gender</th>}
                        {columnsVisibility.occupation && <th>Occupation</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.taxNumber && <th>Tax Number</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {displayedCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="text-center">
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
                                    onClick={() => handleView(customer.id)}
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
                                    onClick={() => handleEdit(customer.id)}
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
                                    onClick={() => handleDelete(customer.id)}
                                  >
                                    <div className="d-inline-block w-75 btn-delete justify-content-center text-danger">
                                      <i className="fa fa-trash me-3"></i>
                                      <span>Delete</span>
                                    </div>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>

                          {columnsVisibility.firstName && (
                            <td>{customer.firstName}</td>
                          )}
                          {columnsVisibility.lastName && (
                            <td>{customer.lastName}</td>
                          )}
                          {columnsVisibility.email && <td>{customer.email}</td>}
                          {columnsVisibility.mobileNumber && (
                            <td>{customer.mobileNumber}</td>
                          )}
                          {columnsVisibility.address && (
                            <td>{customer.permanentAddress || customer.address}</td>
                          )}
                          {columnsVisibility.city && <td>{customer.city}</td>}
                          {columnsVisibility.state && <td>{customer.state}</td>}
                          {columnsVisibility.country && (
                            <td>{customer.country}</td>
                          )}
                          {columnsVisibility.zipCode && (
                            <td>{customer.zipCode}</td>
                          )}
                          {columnsVisibility.dateOfBirth && (
                            <td>{customer.dateOfBirth}</td>
                          )}
                          {columnsVisibility.gender && (
                            <td>{customer.gender}</td>
                          )}
                          {columnsVisibility.occupation && (
                            <td>{customer.occupation}</td>
                          )}
                          {columnsVisibility.status && (
                            <td>
                              <span className={`badge ${customer.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {customer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          )}
                          {columnsVisibility.taxNumber && (
                            <td>{customer.taxNumber}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Info */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredCustomers.length)} of{" "}
                      {filteredCustomers.length} entries
                    </div>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="mx-2">
                        Page {currentPage} of {Math.ceil(filteredCustomers.length / entriesPerPage)}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCustomers.length / entriesPerPage)))}
                        disabled={currentPage === Math.ceil(filteredCustomers.length / entriesPerPage)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Customer;