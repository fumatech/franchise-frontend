import React, { useState } from "react";
import { Link } from "react-router-dom";

const Memo = () => {
  // Form state
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [memos, setMemos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Table configuration
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Columns visibility
  const [columnsVisibility, setColumnsVisibility] = useState({
    Heading: true,
    Description: true,
    "Created Date": true,
    Action: true,
  });

  // UI states
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(memos.length / entriesPerPage);
  const paginatedMemos = memos.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Heading is required");
      return;
    }

    if (editingId) {
      // Update existing memo
      setMemos(
        memos.map((memo) =>
          memo.id === editingId
            ? {
                ...formData,
                id: editingId,
                createdDate: memo.createdDate,
              }
            : memo
        )
      );
      setEditingId(null);
    } else {
      // Add new memo
      const newMemo = {
        ...formData,
        createdDate: new Date().toLocaleDateString(),
        id: Date.now(),
      };
      setMemos([...memos, newMemo]);
    }

    setFormData({ name: "", description: "" });
    setIsFormVisible(false);
  };

  const editMemo = (id) => {
    const memoToEdit = memos.find((memo) => memo.id === id);
    if (memoToEdit) {
      setFormData({
        name: memoToEdit.name,
        description: memoToEdit.description,
      });
      setEditingId(id);
      setIsFormVisible(true);
    }
  };

  const deleteMemo = (id) => {
    if (window.confirm("Are you sure you want to delete this memo?")) {
      setMemos(memos.filter((memo) => memo.id !== id));
    }
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Export functions (placeholder implementations)
  const exportCSV = () => {
    const headers = Object.keys(columnsVisibility).filter(
      (col) => columnsVisibility[col]
    );
    const csvContent = [
      headers.join(","),
      ...memos.map((memo) =>
        headers
          .map((header) => {
            if (header === "Heading") return `"${memo.name}"`;
            if (header === "Description") return `"${memo.description}"`;
            if (header === "Created Date") return `"${memo.createdDate}"`;
            return "";
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memos.csv";
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
              <h1 className="all-heading m-0">All Memo</h1>
              <span className="sub-heading">Manage Memo</span>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card cardHover rounded-4 border-0">
              <div className="text-right p-3">
                <button
                  className="btn btn-add"
                  onClick={() => {
                    setFormData({ name: "", description: "" });
                    setIsFormVisible(true);
                    setEditingId(null);
                  }}
                  //   disabled={isFormVisible}
                >
                  <i className="fas fa-plus"></i> Add
                </button>
              </div>

              <div className="card-body">
                {isFormVisible && (
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name">Heading:*</label>
                        <input
                          className="form-control"
                          required
                          name="name"
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter memo heading"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="description">Description:</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          name="description"
                          id="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Enter memo description"
                        ></textarea>
                      </div>

                      <div className="col-md-4">
                        <button
                          type="submit"
                          className="btn btn-submit btn-sm w-100"
                        >
                          {editingId ? "Update" : "Submit"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm w-100 mt-2"
                          onClick={() => {
                            setIsFormVisible(false);
                            setEditingId(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <hr className="my-3" />

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
                        {columnsVisibility.Heading && <th>Heading</th>}
                        {columnsVisibility.Description && <th>Description</th>}
                        {columnsVisibility["Created Date"] && (
                          <th>Created Date</th>
                        )}
                        {columnsVisibility.Action && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMemos.length > 0 ? (
                        paginatedMemos.map((memo) => (
                          <tr key={memo.id}>
                            {columnsVisibility.Heading && <td>{memo.name}</td>}
                            {columnsVisibility.Description && (
                              <td>{memo.description}</td>
                            )}
                            {columnsVisibility["Created Date"] && (
                              <td>{memo.createdDate}</td>
                            )}
                            {columnsVisibility.Action && (
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => editMemo(memo.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger ml-2"
                                  onClick={() => deleteMemo(memo.id)}
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

export default Memo;
