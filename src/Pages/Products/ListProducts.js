import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "./ListProducts.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import api from "../utils/api";
import DropdownButton from "react-bootstrap/DropdownButton";
import * as xlsx from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";

const staticListProducts = [
  {},
  // Add more static entries as needed
];

function ListProducts({ userRoles }) {
  const [ListProducts, setListProducts] = useState(staticListProducts); // Use static data
  const [columnsVisibility, setColumnsVisibility] = useState({
    productImage: true,
    productName: true,
    Action: true,
    Products: true,

    UnitPurchasePrice: true,
    SellingPrice: true,
    CurrentStock: true,
    ProductType: true,
    Category: true,
    Brand: true,
    Tax: true,
    sku: true,
    taxNumber: true,
    variation: true,
    SalePrice: true,
    Unit: true,
  });
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const [note, setNote] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [listProduct, setListProduct] = useState([]); // Initialize listProduct state
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [currentStock, setCurrentStock] = useState();

  // Add these state variables at the top of your component
  const [filterValues, setFilterValues] = useState({
    productTypes: [],
    categories: [],
    units: [],
    brands: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    productType: "",
    category: "",
    unit: "",
    brand: "",
  });

  // Update your useEffect to extract filter values
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `https://fusionmastertech.com:8443/product/getallactive`,
          { withCredentials: true }
        );

        if (!Array.isArray(response.data)) {
          console.error("Expected array but got:", response.data);
          setListProducts([]);
          return;
        }

        const sortedData = response.data.sort((a, b) => b.id - a.id);

        // Process stock data for each product & its variations
        const updatedProducts = await Promise.all(
          sortedData.map(async (product) => {
            try {
              // ✅ Product-level stock
              const stockResponse = await axios.get(
                `https://fusionmastertech.com:8444/stock-transactions/current-stock/${product.id}`,
                { withCredentials: true }
              );

              const productStock = stockResponse.data ?? "0";

              // ✅ Variation-level stock
              const updatedVariations = await Promise.all(
                product.productVariations.map(async (variation) => {
                  try {
                    const variationStockResponse = await axios.get(
                      `https://fusionmastertech.com:8444/stock-transactions/current-stock/${product.id}/${variation.id}`,
                      { withCredentials: true }
                    );

                    return {
                      ...variation,
                      currentStock: variationStockResponse.data ?? "0",
                    };
                  } catch (error) {
                    console.error(
                      `Error fetching stock for variation ${variation.id}:`,
                      error
                    );
                    return { ...variation, currentStock: "0" };
                  }
                })
              );

              return {
                ...product,
                currentStock: productStock,
                productVariations: updatedVariations,
              };
            } catch (error) {
              console.error(
                `Error fetching stock for product ${product.id}:`,
                error
              );
              return {
                ...product,
                currentStock: "0",
                productVariations: product.productVariations.map((v) => ({
                  ...v,
                  currentStock: "0",
                })),
              };
            }
          })
        );

        setListProducts(updatedProducts);
        setListProduct(updatedProducts);

        // Extract filter values
        const productTypes = [
          ...new Set(updatedProducts.map((item) => item.productType)),
        ].filter(Boolean);
        const categories = [
          ...new Set(updatedProducts.map((item) => item.category)),
        ].filter(Boolean);
        const units = [
          ...new Set(updatedProducts.map((item) => item.unit)),
        ].filter(Boolean);
        const brands = [
          ...new Set(updatedProducts.map((item) => item.brand)),
        ].filter(Boolean);

        setFilterValues({
          productTypes,
          categories,
          units,
          brands,
        });

        // Load additional scripts after data is processed
        const script = document.createElement("script");
        script.src = "js/JqueryContent.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error("Error in fetchProduct:", error);
        setListProducts([]);
      }
    };

    fetchProduct();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setActiveFilters({
      productType: "",
      category: "",
      unit: "",
      brand: "",
    });
  };
  const [categoryMap, setCategoryMap] = useState({});
  const [brandMap, setBrandMap] = useState({});
  const [unitMap, setUnitMap] = useState({});

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catRes, brandRes, unitRes] = await Promise.all([
          axios.get("https://fusionmastertech.com:8443/categories/getall", {
            withCredentials: true,
          }),
          axios.get("https://fusionmastertech.com:8443/brands/getall", {
            withCredentials: true,
          }),
          axios.get("https://fusionmastertech.com:8443/units/getall", {
            withCredentials: true,
          }),
        ]);

        // Build category map recursively
        const buildCategoryMap = (categories, map = {}) => {
          categories.forEach((cat) => {
            map[cat.id] = cat.categoryName;
            if (cat.subCategories && cat.subCategories.length > 0) {
              buildCategoryMap(cat.subCategories, map);
            }
          });
          return map;
        };

        setCategoryMap(buildCategoryMap(catRes.data));
        setBrandMap(
          brandRes.data.reduce((map, b) => {
            map[b.id] = b.brandName;
            return map;
          }, {})
        );
        setUnitMap(
          unitRes.data.reduce((map, u) => {
            map[u.id] = u.name;
            return map;
          }, {})
        );
      } catch (err) {
        console.error("Error fetching lookups:", err);
      }
    };

    fetchLookups();
  }, []);

  // Update your filteredProducts calculation to handle undefined/null cases

  // Filter products based on active filters
  const filteredProducts =
    ListProducts?.filter((product) => {
      return (
        (activeFilters.productType === "" ||
          product?.productType === activeFilters.productType) &&
        (activeFilters.category === "" ||
          product?.category === activeFilters.category) &&
        (activeFilters.unit === "" || product?.unit === activeFilters.unit) &&
        (activeFilters.brand === "" || product?.brand === activeFilters.brand)
      );
    }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCustomers = filteredProducts.slice(startIndex, endIndex);

  const exportCSV = () => {
    const csvData = ListProducts.map((product) => ({
      Action: product.Action,
      productImage: product.productImage,
      Products: product.Products,
      SellingPrice: product.SellingPrice,
      CurrentStock: product.CurrentStock,
      ProductType: product.ProductType,
      Category: product.Category,
      Brand: product.Brand,
      Tax: product.Tax,
      sku: product.sku,
      "Tax Number": product.taxNumber,
    }));

    const csv = [
      [
        "Action",
        "Products",

        "SellingPrice",
        "CurrentStock",
        "ProductType",
        "Category",
        "Brand",
        "Tax",
        "sku",
        "Is Active",
        "Tax Number",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "ListProducts.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(ListProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ListProducts");
    XLSX.writeFile(wb, "ListProducts.xlsx");
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
          "Action",
          "Products",
          "Mobile Number",
          "SellingPrice",
          "CurrentStock",
          "ProductType",
          "Zip Code",
          "Date of Birth",
          "Tax",
          "sku",
          "Is Active",
          "Tax Number",
        ],
      ],
      body: ListProducts.map((product) => [
        product.Action,
        product.Products,
        product.SellingPrice,
        product.CurrentStock,
        product.ProductType,
        product.Category,
        product.Brand,
        product.Tax,
        product.sku,
        product.taxNumber,
      ]),
    });
    doc.save("ListProducts.pdf");
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };
  const handleEntriesChange = (e) => {
    const newEntriesPerPage = Number(e.target.value);
    setEntriesPerPage(newEntriesPerPage);
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const handleEditClick = (productId) => {
    navigate(`/EditList/${productId}`);
    //  alert("Are you want to sure edit this product??");
  };
  const handleViewClick = (productId) => {
    navigate(`/ViewList/${productId}`);
  };
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`https://fusionmastertech.com:8443/product/delete/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 204) {
            // Filter out the deleted product from the state
            setListProduct((prevProducts) =>
              prevProducts.filter((product) => product.id !== id)
            );
            alert("Product deleted successfully!");
          } else {
            alert("Failed to delete product.");
          }
        })
        .catch((error) => console.error("Error deleting product:", error));
    }
  };

  // const startIndex = (currentPage - 1) * entriesPerPage;
  // const endIndex = startIndex + entriesPerPage;
  // const displayedCustomers = ListProducts.slice(startIndex, endIndex);
  const stockReportData = listProduct.flatMap((product) =>
    product.productVariations.map((variation) => ({
      ...variation,
      productName: product.productName,
      category: product.category,
      brand: product.brand,
      unit: variation.unit || product.unit || "N/A",
    }))
  );

  const stockReportDisplayed = stockReportData.slice(startIndex, endIndex);

  const hasPermission = (permissionName) => {
    return (role) =>
      role.permissions((permission) => permission.name === permissionName);
  };

  // Function to download Excel file
  const downloadExcel = async () => {
    try {
      // Fetch data from an API or other source
      const response = await fetch(
        "https://fusionmastertech.com:8443/product/getall",
        {
          withCredentials: true,
        }
      ); // Replace with your data source URL
      const userRoles = await response.json();

      // Ensure userRoles data is available
      if (!Array.isArray(userRoles) || userRoles.length === 0) {
        alert("No data available for download.");
        return;
      }

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(userRoles);

      // Create a new workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, "data.xlsx");
    } catch (error) {
      console.error("Error fetching or generating Excel file:", error);
      alert(
        "An error occurred while fetching data or generating the Excel file."
      );
    }
  };

  const handleRowSelect = (productId) => {
    setSelectedRows((prevSelectedRows) => {
      const newSelectedRows = new Set(prevSelectedRows);
      if (newSelectedRows.has(productId)) {
        newSelectedRows.delete(productId);
      } else {
        newSelectedRows.add(productId);
      }
      return newSelectedRows;
    });
  };

  const isRowSelected = (productId) => {
    return selectedRows.has(productId);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(displayedCustomers.map((p) => p.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };
  return (
    <div className="wrapper" style={{ maxHeight: "", overflowY: "auto" }}>
      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid py-2">
            {/* filter start */}
            <div className="card card-default rounded-4 border-0 cardHover">
              {/* Clickable header area */}
              <div
                className="my- p-3 d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setOpen(!open)}
              >
                <i className={`fa fa-filter me-3 `}></i>
                <span>Filter</span>
              </div>

              <Collapse in={open}>
                <div className="border-top">
                  <div className="card-body">
                    <div className="row py-2 g-2">
                      {/* Product Type Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Product Type:</label>
                          <select
                            className="form-select"
                            name="productType"
                            value={activeFilters.productType}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.productTypes.map((type, index) => (
                              <option key={`type-${index}`} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Category Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Category:</label>
                          <select
                            className="form-select"
                            name="category"
                            value={activeFilters.category}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.categories.map((category, index) => (
                              <option key={`cat-${index}`} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Unit Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Unit:</label>
                          <select
                            className="form-select"
                            name="unit"
                            value={activeFilters.unit}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.units.map((unit, index) => (
                              <option key={`unit-${index}`} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Brand Dropdown */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label className="me-2">Brand:</label>
                          <select
                            className="form-select"
                            name="brand"
                            value={activeFilters.brand}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            {filterValues.brands.map((brand, index) => (
                              <option key={`brand-${index}`} value={brand}>
                                {brand}
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
            {/* fillter end  */}

            <div className="card cardHover rounded-4 border-0 ">
              <div className="card-body">
                <ul
                  className="nav nav-tabs"
                  id="custom-content-above-tab"
                  role="tablist"
                >
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      id="custom-content-above-home-tab"
                      data-toggle="pill"
                      href="#custom-content-above-home"
                      role="tab"
                      aria-controls="custom-content-above-home"
                      aria-selected="true"
                    >
                      {" "}
                      <i className="fa fa-cubes"></i> All Products
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      id="custom-content-above-profile-tab"
                      data-toggle="pill"
                      href="#custom-content-above-profile"
                      role="tab"
                      aria-controls="custom-content-above-profile"
                      aria-selected="false"
                    >
                      <i className="fa fa-hourglass-half"></i> Stock Report
                    </a>
                  </li>
                </ul>
                <div className="tab-custom-content border-0"></div>
                <div
                  className="tab-content"
                  id="custom-content-above-tabContent"
                >
                  {/* All Products */}
                  <div
                    className="tab-pane fade show active"
                    id="custom-content-above-home"
                    role="tabpanel"
                    aria-labelledby="custom-content-above-home-tab"
                  >
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
                              <i className="fa fa-columns"></i> Column
                              Visibility
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
                                    onClick={(e) =>
                                      handleDropdownItemClick(col, e)
                                    } // Handle click on dropdown item
                                  >
                                    {col
                                      .replace(/([A-Z])/g, " $1")
                                      .toUpperCase()}
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
                              {columnsVisibility.Action && <th>Action</th>}
                              {columnsVisibility.productImage && (
                                <th>Product Image</th>
                              )}
                              {columnsVisibility.Products && (
                                <th>Product Name</th>
                              )}
                              {columnsVisibility.CurrentStock && (
                                <th>Current Stock</th>
                              )}
                              {columnsVisibility.SellingPrice && (
                                <th>Price Inc Tax</th>
                              )}

                              {columnsVisibility.ProductType && (
                                <th>Product Type</th>
                              )}
                              {columnsVisibility.Category && <th>Category</th>}
                              {columnsVisibility.Brand && <th>Brand</th>}
                              {columnsVisibility.Tax && <th>Tax</th>}
                              {columnsVisibility.sku && <th>sku</th>}
                            </tr>
                          </thead>

                          <tbody>
                            {displayedCustomers.map((product) => (
                              <tr
                                key={product.id}
                                style={{
                                  backgroundColor: isRowSelected(product.id)
                                    ? "#d3d3d3"
                                    : "transparent",
                                }}
                              >
                                {columnsVisibility.Action && (
                                  <td>
                                    <DropdownButton
                                      id="dropdown-basic-button"
                                      title="Custom"
                                      variant="outline-success rounded-5 fs-6 fw-light border-1"
                                      className="custom-outline-dropdown p-2"
                                    >
                                      <Dropdown.Item
                                        as="button"
                                        onClick={() =>
                                          handleViewClick(product.id)
                                        }
                                      >
                                        <div className="d-inline-block w-75 btn-view justify-content-center text-secondary">
                                          <i className="dropdown_hover fa fa-eye me-3"></i>
                                          <span>View</span>
                                        </div>
                                      </Dropdown.Item>
                                    </DropdownButton>
                                  </td>
                                )}
                                {columnsVisibility.productImage && (
                                  <td>
                                    <img
                                      src={`https://fusionmastertech.com:8443${product.productImage}`}
                                      alt={product.productName}
                                      style={{
                                        maxHeight: "80px",
                                        maxWidth: "80px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </td>
                                )}
                                {columnsVisibility.Products && (
                                  <td>{product.productName}</td>
                                )}
                                {columnsVisibility.CurrentStock && (
                                  <td>
                                    {product.currentStock !== undefined
                                      ? product.currentStock
                                      : "0"}
                                  </td>
                                )}
                                {columnsVisibility.SellingPrice && (
                                  <td>
                                    {product.productVariations &&
                                    product.productVariations.length > 0
                                      ? product.productVariations[0]
                                          .defaultSellingPrice
                                      : "N/A"}
                                  </td>
                                )}

                                {columnsVisibility.ProductType && (
                                  <td>{product.productType}</td>
                                )}

                                {columnsVisibility.Category && (
                                  <td>
                                    {categoryMap[product.category] || "N/A"}
                                  </td>
                                )}
                                {columnsVisibility.Brand && (
                                  <td>{brandMap[product.brand] || "N/A"}</td>
                                )}
                                {columnsVisibility.Tax && (
                                  <td>{product.sellingPriceTaxType}</td>
                                )}
                                {columnsVisibility.sku && (
                                  <td>{product.sku}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Add this after your table */}
                        <div className="d-flex justify-content-between align-items-center ">
                          <div>
                            Showing {startIndex + 1} to{" "}
                            {Math.min(endIndex, filteredProducts.length)} of{" "}
                            {filteredProducts.length} entries
                          </div>
                        </div>
                      </div>

                      {/* Footer button */}
                      {/* <div className="container my-2">
                        <div className="row">
                          <div className="col-12 col-lg-8   float-left d-flex ">
                            <div className=" mx-2 ">
                              <Button
                                className="select_btn p-lg-1"
                                variant="outline-primary"
                              >
                                Delete Selected
                              </Button>
                            </div>
                            <div className=" mx-2 ">
                              <Button
                                className="select_btn p-lg-1"
                                variant="outline-secondary"
                              >
                                Add to Location
                              </Button>
                            </div>
                            <div className=" mx-2 ">
                              <Button
                                className="select_btn p-lg-1"
                                variant="outline-success"
                              >
                                Remove From Function
                              </Button>
                            </div>
                            <div className=" mx-2 ">
                              <Button
                                className="select_btn p-lg-1"
                                variant="outline-warning"
                              >
                                Deactivate Selected
                              </Button>
                            </div>

                            <div className=" mx-2 ">
                              <Button
                                className="select_btn p-lg-1"
                                variant="outline-danger"
                              >
                                WooCommerce Sync
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* stock Products */}
                  <div
                    className="tab-pane fade"
                    id="custom-content-above-profile"
                    role="tabpanel"
                    aria-labelledby="custom-content-above-profile-tab"
                  >
                    <div
                      className="tab-pane fade show active"
                      id="custom-content-above-home"
                      role="tabpanel"
                      aria-labelledby="custom-content-above-home-tab"
                    >
                      <div className="card-body">
                        {/* Entries and Filter Section */}
                        <div className="row mb-3 d-flex align-items-center">
                          <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold mt-2 mb-2 mr-2">
                            <label
                              htmlFor="entriesPerPage"
                              className="mb-0 mr-2"
                            >
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

                          {/* Export Buttons Section */}
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
                                <i className="fa fa-columns"></i> Column
                                Visibility
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
                                    {col
                                      .replace(/([A-Z])/g, " $1")
                                      .toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Table */}
                        <div id="table-container" style={{ overflowX: "auto" }}>
                          <table
                            id="variationReport"
                            className="table table-bordered table-hover"
                            style={{ minWidth: "1000px" }}
                          >
                            <thead>
                              <tr>
                                {columnsVisibility.Action && (
                                  <th>Stock History</th>
                                )}
                                {columnsVisibility.sku && <th>SKU</th>}
                                {columnsVisibility.productName && (
                                  <th>Product Name</th>
                                )}
                                {columnsVisibility.variation && (
                                  <th>Variation Name</th>
                                )}
                                {columnsVisibility.Category && (
                                  <th>Category</th>
                                )}
                                {columnsVisibility.Brand && <th>Brand</th>}
                                {columnsVisibility.Unit && <th>Unit</th>}
                                {columnsVisibility.CurrentStock && (
                                  <th>Current Stock</th>
                                )}
                                {columnsVisibility.UnitPurchasePrice && (
                                  <th>Purchase Price</th>
                                )}
                                {columnsVisibility.SalePrice && (
                                  <th>Sale Price</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {listProduct.flatMap((product) =>
                                product.productVariations.map((variation) => (
                                  <tr key={variation.id}>
                                    {columnsVisibility.Action && (
                                      <td>
                                        <Link
                                          className="tw-dw-btn tw-dw-btn-xs tw-dw-btn-outline tw-dw-btn-info tw-w-max"
                                          to={`/ProductStockHistory?productId=${product.id}&variationId=${variation.id}`}
                                        >
                                          <i className="fas fa-history"></i>{" "}
                                          Product stock history
                                        </Link>
                                      </td>
                                    )}
                                    {columnsVisibility.sku && (
                                      <td>{variation.subSku || product.sku}</td>
                                    )}
                                    {columnsVisibility.productName && (
                                      <td>{product.productName}</td>
                                    )}
                                    {columnsVisibility.variation && (
                                      <td>{variation.variationValue}</td>
                                    )}

                                    {columnsVisibility.Category && (
                                      <td>
                                        {categoryMap[product.category] || "N/A"}
                                      </td>
                                    )}
                                    {columnsVisibility.Brand && (
                                      <td>
                                        {brandMap[product.brand] || "N/A"}
                                      </td>
                                    )}
                                    {columnsVisibility.Unit && (
                                      <td>
                                        {unitMap[variation.unit] ||
                                          unitMap[product.unit] ||
                                          "N/A"}
                                      </td>
                                    )}
                                    {columnsVisibility.CurrentStock && (
                                      <td>{variation.currentStock}</td>
                                    )}
                                    {columnsVisibility.UnitPurchasePrice && (
                                      <td>
                                        {variation.defaultPurchasePriceExcTax}
                                      </td>
                                    )}
                                    {columnsVisibility.SalePrice && (
                                      <td>
                                        {variation.defaultSellingPrice || "N/A"}
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ListProducts;
