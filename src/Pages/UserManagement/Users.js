import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import "./Users.css";
import "datatables.net";
import "datatables.net-bs4";
import "datatables.net-responsive";
import "datatables.net-responsive-bs4";
import "datatables.net-buttons";
import "datatables.net-buttons-bs4";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";
// import pdfmake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "../utils/api";
// pdfmake.vfs = pdfFonts.pdfMake.vfs;

const Users = ({ userRoles }) => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    isActive: true,
    actions: true,
  });
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const loggedInUserEmail = sessionStorage.getItem("userEmail");

  useEffect(() => {
    const franchiseId =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");

    const fetchUsers = api.get("/user/getall").then((res) =>
      res.data.map((user) => ({
        ...user,
        source: "user",
        role: extractRole(user.roles),
        canEdit: true,
      }))
    );

    const fetchAdmins = api
      .get("https://fusionmastertech.com:8443/customer/getall")
      .then((res) => {
        // Filter only admins where franchiseId matches current franchise
        const matchingAdmin = res.data.find(
          (admin) => admin.dbName === franchiseId
        );

        if (!matchingAdmin) return []; // No admin found for this franchise

        return [
          {
            ...matchingAdmin,
            source: "admin",
            role: "Admin",
            firstname: matchingAdmin.firstName || matchingAdmin.firstname,
            lastname: matchingAdmin.lastName || matchingAdmin.lastname,
            isActive: true,
            canEdit: false, // ❌ Cannot be edited
          },
        ];
      });

    Promise.all([fetchUsers, fetchAdmins])
      .then(([usersData, adminsData]) => {
        setUsers(usersData);
        setAdmins(adminsData);
        setCombinedData([...adminsData, ...usersData]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.message.includes("401")) {
          localStorage.removeItem("tenantDbName");
          sessionStorage.removeItem("tenantDbName");
          navigate("/login");
        }
      });

    const script = document.createElement("script");
    script.src = "js/JqueryContent.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const extractRole = (roles) => (roles?.length ? roles[0].role : "No Role");

  const exportCSV = () => {
    const csvData = combinedData.map((item) => ({
      "First Name": item.firstname,
      "Last Name": item.lastname,
      Email: item.email,
      Role: item.role,
      "Is Active": item.isActive ? "Yes" : "No",
      Source: item.source === "admin" ? "Admin" : "User",
    }));

    const csv = [
      ["First Name", "Last Name", "Email", "Role", "Is Active", "Source"],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "users_and_admins.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      combinedData.map((item) => ({
        "First Name": item.firstname,
        "Last Name": item.lastname,
        Email: item.email,
        Role: item.role,
        "Is Active": item.isActive ? "Yes" : "No",
        Source: item.source === "admin" ? "Admin" : "User",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users and Admins");
    XLSX.writeFile(wb, "users_and_admins.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        ["First Name", "Last Name", "Email", "Role", "Is Active", "Source"],
      ],
      body: combinedData.map((item) => [
        item.firstname,
        item.lastname,
        item.email,
        item.role,
        item.isActive ? "Yes" : "No",
        item.source === "admin" ? "Admin" : "User",
      ]),
    });
    doc.save("users_and_admins.pdf");
  };

  const printData = () => {
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(
      document.getElementById("table-container").innerHTML
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleEdit = (id, source) => {
    if (source === "admin") {
      alert("Admin accounts cannot be modified.");
      return;
    }
    navigate(`/EditUser/${id}`);
  };

  const handleView = (id, source) => {
    if (source === "admin") {
      alert("Admin accounts cannot be viewed from this interface.");
      return;
    }
    navigate(`/ViewUser/${id}`);
  };

  const handleDelete = (id, email, source) => {
    if (source === "admin") {
      alert("Admin accounts cannot be deleted.");
      return;
    }

    if (email === loggedInUserEmail) {
      if (!window.confirm("Are you sure you want to delete your own account?"))
        return;
    } else {
      if (!window.confirm(`Are you sure you want to delete user ${email}?`))
        return;
    }

    api
      .delete(`/user/delete/${id}`)
      .then((res) => {
        if (res.status === 204) {
          setCombinedData((prev) =>
            prev.filter((item) => !(item.id === id && item.source === "user"))
          );
          alert("User deleted successfully!");
        } else {
          alert("Failed to delete user.");
        }
      })
      .catch((err) => {
        console.error("Delete Error:", err);
        alert("An error occurred while deleting the user.");
      });
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedData = combinedData.slice(startIndex, endIndex);

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };
  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading">Users and Admins</h1>
                <span className="display-inline sub-heading">
                  Manage Users and Admins
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="card-body">
                <div className="col6 text-right">
                  <Link to="/AddUser" className="btn btn-add">
                    <i className="fas fa-plus"></i> Add
                  </Link>
                </div>

                <div className="card-body">
                  <div className="row mb-3 d-flex align-items-center">
                    <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold">
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

                    <div className="col-auto d-flex flex-wrap align-items-center">
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
                </div>

                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table
                    id="example1"
                    className="table table-bordered table-hover table_style shadow table-rounded  "
                    style={{ minWidth: "auto" }}
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.firstName && <th>First Name</th>}
                        {columnsVisibility.lastName && <th>Last Name</th>}
                        {columnsVisibility.email && <th>Email</th>}
                        {columnsVisibility.role && <th>Role</th>}
                        {columnsVisibility.isActive && (
                          <th className="text-center">Active</th>
                        )}
                        {columnsVisibility.actions && (
                          <th className="text-center">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((item) => (
                        <tr key={`${item.source}-${item.id}`}>
                          {columnsVisibility.firstName && (
                            <td>{item.firstname}</td>
                          )}
                          {columnsVisibility.lastName && (
                            <td>{item.lastname}</td>
                          )}
                          {columnsVisibility.email && <td>{item.email}</td>}
                          {columnsVisibility.role && <td>{item.role}</td>}
                          {columnsVisibility.isActive && (
                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={item.isActive}
                                style={{
                                  cursor: "default",
                                  accentColor: item.isActive
                                    ? "#78B833"
                                    : "red",
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            </td>
                          )}
                          {columnsVisibility.actions && (
                            <td>
                              {item.source === "user" ? (
                                <div className="btn-group btn-group-sm btn-icon-only">
                                  <button
                                    type="button"
                                    className="btn-edit"
                                    onClick={() =>
                                      handleEdit(item.id, item.source)
                                    }
                                  >
                                    <i className="fas fa-edit btn-icon"></i>{" "}
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-view"
                                    onClick={() =>
                                      handleView(item.id, item.source)
                                    }
                                  >
                                    <i className="fas fa-eye btn-icon"></i> View
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={() =>
                                      handleDelete(item.id, item.source)
                                    }
                                  >
                                    <i className="fas fa-trash btn-icon"></i>{" "}
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted"></span> // Or leave empty if you prefer
                              )}
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
      </div>
    </div>
  );
};

export default Users;
