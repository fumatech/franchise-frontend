import React, { useState } from "react";

const Document = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: null,
    description: "",
  });
  const [documents, setDocuments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Table configuration
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Columns visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    Name: true,
    Description: true,
    "Uploaded Date": true,
    Action: true,
  });

  // UI states
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(documents.length / entriesPerPage);
  const paginatedDocuments = documents.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Document is required");
      return;
    }

    if (editingId) {
      // Update existing document
      setDocuments(
        documents.map((doc) =>
          doc.id === editingId
            ? {
                ...formData,
                id: editingId,
                uploadedDate: doc.uploadedDate,
              }
            : doc
        )
      );
      setEditingId(null);
    } else {
      // Add new document
      const newDocument = {
        ...formData,
        uploadedDate: new Date().toLocaleDateString(),
        id: Date.now(),
      };
      setDocuments([...documents, newDocument]);
    }

    setFormData({ name: null, description: "" });
    setIsFormVisible(false);
  };

  const editDocument = (id) => {
    const docToEdit = documents.find((doc) => doc.id === id);
    if (docToEdit) {
      setFormData({
        name: docToEdit.name,
        description: docToEdit.description,
      });
      setEditingId(id);
      setIsFormVisible(true);
    }
  };

  const deleteDocument = (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

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
      ...documents.map((doc) =>
        headers
          .map((header) => {
            if (header === "Name") return `"${doc.name?.name || doc.name}"`;
            if (header === "Description") return `"${doc.description}"`;
            if (header === "Uploaded Date") return `"${doc.uploadedDate}"`;
            return "";
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documents.csv";
    link.click();
  };

  const exportExcel = () => alert("Exporting to Excel...");
  const printData = () => window.print();
  const exportPDF = () => alert("Exporting to PDF...");

  const visibleColumnsCount =
    Object.values(columnsVisibility).filter(Boolean).length;

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };

  return (
    <div className="wrapper" style={{ overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="all-heading m-0 "> All Document</h1>
              <span className="display-inline sub-heading">
                Manage Document
              </span>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="text-right p-3">
                <button
                  type="button"
                  className="btn btn-add"
                  onClick={() => {
                    setFormData({ name: null, description: "" });
                    setEditingId(null);
                    setIsFormVisible(true);
                  }}
                  //   disabled={isFormVisible}
                >
                  <i className="fas fa-plus mr-1"></i> Add
                </button>
              </div>

              <div className="card-body">
                {isFormVisible && (
                  <div className="row">
                    <div className="col-md-12">
                      <form
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                      >
                        <div className="row">
                          <div className="col-sm-12">
                            <div className="col-sm-6">
                              <div className="form-group">
                                <label>Document:*</label>
                                <input
                                  required
                                  accept="application/pdf,text/csv,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png"
                                  name="name"
                                  type="file"
                                  className="form-control-file"
                                  onChange={handleChange}
                                />
                                {/* <small className="form-text text-muted">
                                  Allowed File: .pdf, .csv, .zip, .doc, .docx,
                                  .jpeg, .jpg, .png
                                </small> */}
                              </div>
                            </div>
                            <div className="col-sm-6 col-12">
                              <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                  className="form-control"
                                  rows="1"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                ></textarea>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <button type="submit" className="btn btn-submit">
                                Submit
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger ml-2"
                                onClick={() => {
                                  setIsFormVisible(false);
                                  setEditingId(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                        <hr />
                      </form>
                    </div>
                  </div>
                )}

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
                    className="table table-bordered table-hover"
                    id="example1"
                    style={{ minWidth: "1000px" }}
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.Name && <th>Name</th>}
                        {columnsVisibility.Description && <th>Description</th>}
                        {columnsVisibility["Uploaded Date"] && (
                          <th>Uploaded Date</th>
                        )}
                        {columnsVisibility.Action && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDocuments.length > 0 ? (
                        paginatedDocuments.map((doc) => (
                          <tr key={doc.id}>
                            {columnsVisibility.Name && (
                              <td>
                                {doc.name?.name || doc.name || "No file name"}
                              </td>
                            )}
                            {columnsVisibility.Description && (
                              <td>{doc.description}</td>
                            )}
                            {columnsVisibility["Uploaded Date"] && (
                              <td>{doc.uploadedDate}</td>
                            )}
                            {columnsVisibility.Action && (
                              <td>
                                <button
                                  className="btn btn-sm btn-primary mr-1"
                                  onClick={() => editDocument(doc.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={visibleColumnsCount}
                            className="text-center"
                          >
                            {isLoading
                              ? "Loading..."
                              : "No data available in table"}
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
    </div>
  );
};

export default Document;
