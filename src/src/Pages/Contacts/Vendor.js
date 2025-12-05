import React, { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Vendor({ userRoles }) {
  const [vendors, setVendors] = useState([]); // State to store vendor data

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
  });

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate(); // Initialize navigate

  // Fetch vendors data from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          `https://fusionmastertech.com:8443/business-details/getall`
        );
        setVendors(response.data); // Update state with fetched data

        // Add external script directly
        const script = document.createElement("script");
        script.src = "js/JqueryContent.js";
        script.async = true;

        document.body.appendChild(script);

        // Cleanup function to remove the script element when the component is unmounted
        return () => {
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  const exportCSV = () => {
    const csvData = vendors.map((vendor) => ({
      FirmName: vendor.firmName,
      "Vendord Id": vendor.vendorId,
      Email: vendor.email,
      "Mobile Number": vendor.mobileNumber,
      Address: vendor.permanentAddress,
      City: vendor.city,
      State: vendor.state,
      Country: vendor.country,
      "Tax Number": vendor.taxNumber,
      "Zip Code": vendor.zipCode,
      "Is Active": vendor.isActive ? "Yes" : "No",
    }));

    const csv = [
      [
        "Firm Name",
        "Authority Person",
        "Email",
        "Mobile Number",
        "Address",
        "City",
        "State",
        "Country",
        "Tax Number",
        "Zip Code",
        "Is Active",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "vendors.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(vendors);
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
          "Authority Person",
          "Email",
          "Mobile Number",
          "Address",
          "City",
          "State",
          "Country",
          "Tax Number",
          "Zip Code",
          "Is Active",
        ],
      ],
      body: vendors.map((vendor) => [
        vendor.name,
        vendor.vendorId,
        vendor.email,
        vendor.mobileNumber,
        vendor.permanentAddress,
        vendor.city,
        vendor.state,
        vendor.country,
        vendor.taxNumber,
        vendor.zipCode,
        vendor.isActive ? "Yes" : "No",
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
    setCurrentPage(1); // Reset to the first page when entries per page changes
  };

  const handleEdit = (id) => {
    navigate(`/EditVendor/${id}`); // Navigate to the edit page with the vendor ID
  };

  const handleView = (id) => {
    navigate(`/ViewVendor/${id}`); // Navigate to the view page with the vendor ID
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
  const displayedVendors = vendors.slice(startIndex, endIndex);

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };
  return (
    <div className="wrapper " style={{ maxHeight: "", overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading m-0 ">Vendors</h1>
                <span className="display-inline sub-heading ">
                  Manage Vendors
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              {/* <div className="text-right">
                <Link to="/AddVendor" className="btn btn-add">
                  <i className="fas fa-plus"></i> Add
                </Link>
              </div> */}
              <div className="card-body">
                <div className="row mb-3 d-flex align-items-center">
                  <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold mt-2 mb-2 mr-2">
                    <label htmlFor="entriesPerPage" className="mb-0  mr-2">
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

                <div id="table-container " style={{ overflowX: "auto" }}>
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
                      </tr>
                    </thead>

                    <tbody>
                      {displayedVendors.map((vendor) => (
                        <tr key={vendor.id}>
                          {/* Dropdown inside Actions Column */}
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

                                {/* <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleEdit(vendor.id)}
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
                                    onClick={() => handleDelete(vendor.id)}
                                  >
                                    <div className="d-inline-block w-75 btn-delete justify-content-center text-danger">
                                      <i className="fa fa-trash me-3"></i>
                                      <span>Delete</span>
                                    </div>
                                  </button>
                                </li> */}
                              </ul>
                            </div>
                          </td>

                          {columnsVisibility.name && <td>{vendor.name}</td>}
                          {columnsVisibility.address && (
                            <td>{vendor.address}</td>
                          )}
                          {columnsVisibility.email && <td>{vendor.email}</td>}
                          {columnsVisibility.phoneNumber && (
                            <td>{vendor.phoneNumber}</td>
                          )}
                          {columnsVisibility.website && (
                            <td>{vendor.website}</td>
                          )}

                          {columnsVisibility.taxOrGstNumber && (
                            <td>{vendor.taxOrGstNumber}</td>
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
                        </tr>
                      ))}
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
}

export default Vendor;
