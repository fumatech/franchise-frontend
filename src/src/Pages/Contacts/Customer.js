import React, { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Customer({ userRoles }) {
  const [customers, setCustomers] = useState([]); // State to store customer data
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
  });
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate(); // Initialize navigate

  // Fetch customers data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/customer/getall`
        );
        setCustomers(response.data); // Update state with fetched data
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
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const exportCSV = () => {
    const csvData = customers.map((customer) => ({
      "First Name": customer.firstName,
      "Last Name": customer.lastName,
      Email: customer.email,
      "Mobile Number": customer.mobileNumber,
      Address: customer.permanentAddress,
      City: customer.city,
      State: customer.state,
      Country: customer.country,
      "Zip Code": customer.zipCode,
      "Date of Birth": customer.dateOfBirth,
      Gender: customer.gender,
      Occupation: customer.occupation,
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
        "Is Active",
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
    const ws = XLSX.utils.json_to_sheet(customers);
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
          "Is Active",
          "Tax Number",
        ],
      ],
      body: customers.map((customer) => [
        customer.customerName,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.mobileNumber,
        customer.permanentAddress,
        customer.city,
        customer.state,
        customer.country,
        customer.zipCode,
        customer.dateOfBirth,
        customer.gender,
        customer.occupation,
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
    setCurrentPage(1); // Reset to the first page when entries per page changes
  };

  const handleEdit = (id) => {
    navigate(`/EditCustomer/${id}`); // Navigate to the edit page with the customer ID
  };

  const handleView = (id) => {
    navigate(`/ViewCustomer/${id}`); // Navigate to the view page with the customer ID
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
  const displayedCustomers = customers.slice(startIndex, endIndex);

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };
  return (
    <div className="wrapper" style={{ maxHeight: "", overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading m-0 ">Customer</h1>
                <span className="display-inline sub-heading">
                  Manage customer
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
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
                      <tr>
                        <th>Actions</th>{" "}
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
                            <td>{customer.permanentAddress}</td>
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

                          {columnsVisibility.taxNumber && (
                            <td>{customer.taxNumber}</td>
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

export default Customer;
