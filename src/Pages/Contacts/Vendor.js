import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";

function Vendor({ userRoles }) {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  
  const [columnsVisibility, setColumnsVisibility] = useState({
    name: true,
    address: true,
    email: true,
    phoneNumber: true,
    website: true,
    logo: true,
    taxOrGstNumber: true,
    shopActNumber: true,
    cinNumber: true,
    panNumber: true,
    status: true,
  });

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [filterValues, setFilterValues] = useState({
    statuses: ["Active", "Inactive"],
    cities: [],
    states: [],
    countries: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    status: "",
    city: "",
    state: "",
    country: "",
    search: "",
  });

  // Fetch vendors data from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          `https://fusionmastertech.com:8443/business-details/getall`
        );
        const vendorsData = response.data;
        setVendors(vendorsData);
        setFilteredVendors(vendorsData);

        // Extract filter values
        const cities = [...new Set(vendorsData.map((item) => item.city))].filter(Boolean);
        const states = [...new Set(vendorsData.map((item) => item.state))].filter(Boolean);
        const countries = [...new Set(vendorsData.map((item) => item.country))].filter(Boolean);

        setFilterValues({
          statuses: ["Active", "Inactive"],
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
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  // Apply filters whenever activeFilters or vendors change
  useEffect(() => {
    let result = vendors;

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter((vendor) =>
        Object.values(vendor).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply other filters
    if (activeFilters.status) {
      const isActive = activeFilters.status === "Active";
      result = result.filter((vendor) => vendor.isActive === isActive);
    }

    if (activeFilters.city) {
      result = result.filter((vendor) => vendor.city === activeFilters.city);
    }

    if (activeFilters.state) {
      result = result.filter((vendor) => vendor.state === activeFilters.state);
    }

    if (activeFilters.country) {
      result = result.filter((vendor) => vendor.country === activeFilters.country);
    }

    setFilteredVendors(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilters, vendors]);

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
      city: "",
      state: "",
      country: "",
      search: "",
    });
  };

  const exportCSV = () => {
    const csvData = filteredVendors.map((vendor) => ({
      FirmName: vendor.firmName || vendor.name,
      "Vendor Id": vendor.vendorId,
      Email: vendor.email,
      "Mobile Number": vendor.mobileNumber || vendor.phoneNumber,
      Address: vendor.permanentAddress || vendor.address,
      City: vendor.city,
      State: vendor.state,
      Country: vendor.country,
      "Tax Number": vendor.taxNumber || vendor.taxOrGstNumber,
      "Zip Code": vendor.zipCode,
      Status: vendor.isActive ? "Active" : "Inactive",
    }));

    const csv = [
      [
        "Firm Name",
        "Vendor Id",
        "Email",
        "Mobile Number",
        "Address",
        "City",
        "State",
        "Country",
        "Tax Number",
        "Zip Code",
        "Status",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "vendors.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredVendors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, "vendors.xlsx");
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
          "Firm Name",
          "Email",
          "Mobile Number",
          "Address",
          "City",
          "State",
          "Country",
          "Tax Number",
          "Zip Code",
          "Status",
        ],
      ],
      body: filteredVendors.map((vendor) => [
        vendor.name || vendor.firmName,
        vendor.email,
        vendor.mobileNumber || vendor.phoneNumber,
        vendor.address || vendor.permanentAddress,
        vendor.city,
        vendor.state,
        vendor.country,
        vendor.taxNumber || vendor.taxOrGstNumber,
        vendor.zipCode,
        vendor.isActive ? "Active" : "Inactive",
      ]),
    });
    doc.save("vendors.pdf");
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
    navigate(`/EditVendor/${id}`);
  };

  const handleView = (id) => {
    navigate(`/ViewVendor/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      fetch(`${process.env.REACT_APP_BASE_URL}/vendor/delete/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 204) {
            setVendors(vendors.filter((vendor) => vendor.id !== id));
            alert("Vendor deleted successfully!");
          } else {
            alert("Failed to delete vendor.");
          }
        })
        .catch((error) => console.error("Error deleting vendor:", error));
    }
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedVendors = filteredVendors.slice(startIndex, endIndex);

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
                <h1 className="all-heading m-0">Vendors</h1>
                <span className="display-inline sub-heading">
                  Manage Vendors
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
                              {col
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
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
                  >
                    <thead>
                      <tr>
                        <th>Actions</th>
                        {columnsVisibility.name && <th>Name</th>}
                        {columnsVisibility.address && <th>Address</th>}
                        {columnsVisibility.email && <th>Email</th>}
                        {columnsVisibility.phoneNumber && <th>Phone Number</th>}
                        {columnsVisibility.website && <th>Website</th>}
                        {columnsVisibility.taxOrGstNumber && (
                          <th>GST Number</th>
                        )}
                        {columnsVisibility.shopActNumber && (
                          <th>Shop Act Number</th>
                        )}
                        {columnsVisibility.cinNumber && <th>CIN Number</th>}
                        {columnsVisibility.panNumber && <th>PAN Number</th>}
                        {columnsVisibility.status && <th>Status</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {displayedVendors.map((vendor) => (
                        <tr key={vendor.id}>
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
                                    onClick={() => handleView(vendor.id)}
                                  >
                                    <div className="d-inline-block w-75 btn-view justify-content-center text-secondary">
                                      <i className="dropdown_hover fa fa-eye me-3"></i>
                                      <span>View</span>
                                    </div>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>

                          {columnsVisibility.name && <td>{vendor.name || vendor.firmName}</td>}
                          {columnsVisibility.address && (
                            <td>{vendor.address || vendor.permanentAddress}</td>
                          )}
                          {columnsVisibility.email && <td>{vendor.email}</td>}
                          {columnsVisibility.phoneNumber && (
                            <td>{vendor.phoneNumber || vendor.mobileNumber}</td>
                          )}
                          {columnsVisibility.website && (
                            <td>{vendor.website}</td>
                          )}
                          {columnsVisibility.taxOrGstNumber && (
                            <td>{vendor.taxOrGstNumber || vendor.taxNumber}</td>
                          )}
                          {columnsVisibility.shopActNumber && (
                            <td>{vendor.shopActNumber}</td>
                          )}
                          {columnsVisibility.cinNumber && (
                            <td>{vendor.cinNumber}</td>
                          )}
                          {columnsVisibility.panNumber && (
                            <td>{vendor.panNumber}</td>
                          )}
                          {columnsVisibility.status && (
                            <td>
                              <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {vendor.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Info */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredVendors.length)} of{" "}
                      {filteredVendors.length} entries
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
                        Page {currentPage} of {Math.ceil(filteredVendors.length / entriesPerPage)}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredVendors.length / entriesPerPage)))}
                        disabled={currentPage === Math.ceil(filteredVendors.length / entriesPerPage)}
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

export default Vendor;