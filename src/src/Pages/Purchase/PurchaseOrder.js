import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./PurchaseOrder.css";
import axios from "axios";
import api from "../utils/api";
import { data } from "jquery";

function PurchaseOrder() {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [expectedDate, setExpectedDate] = useState(null);
  const [location, setLocation] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [vendorlist, setVendorList] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [userName, setUserName] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      fetch(`${process.env.REACT_APP_BASE_URL}/user/username?email=${email}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("User not found");
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            setUserName(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching username:", error);
          // Fallback to using email if username not found
          setUserName(email.split("@")[0]);
        });
    }
  }, []);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `https://fusionmastertech.com:8443/business-details/getall`
        );
        const data = await response.json();

        setVendorList(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const calculatedTotalUnits = selectedProducts.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
    setTotalUnits(calculatedTotalUnits);
  }, [selectedProducts]);

  // Fetch current stock function
  const fetchCurrentStock = async (productId, variationId = null) => {
    try {
      const url = variationId
        ? `${process.env.REACT_APP_BASE_URL}/stock-transactions/current-stock/${productId}/${variationId}`
        : `${process.env.REACT_APP_BASE_URL}/stock-transactions/current-stock/${productId}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching current stock:", error);
      return 0;
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) await searchProducts(value);
    else setSearchResults([]);
    setFocusedIndex(-1);
  };

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `https://fusionmastertech.com:8443/product/search/active?query=${query}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm) {
      if (focusedIndex >= 0) {
        e.preventDefault();
        handleProductSelect(searchResults[focusedIndex]);
        setSearchResults([]);
        setSearchTerm("");
      } else {
        searchProducts(searchTerm);
      }
    } else if (searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        scrollToFocusedItem();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        scrollToFocusedItem();
      }
    }
  };

  const scrollToFocusedItem = () => {
    if (searchResultsRef.current && focusedIndex >= 0) {
      const items = searchResultsRef.current.querySelectorAll(".product-row");
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  };

  const handleProductSelect = async (product) => {
    if (product.productVariations.length > 0) {
      // For variable products
      const allVariationsSelected = product.productVariations.every(
        (variation) => selectedVariations[variation.id]
      );

      const newSelectedVariations = { ...selectedVariations };

      // Fetch stock for each variation
      for (const variation of product.productVariations) {
        newSelectedVariations[variation.id] = !allVariationsSelected;
        if (newSelectedVariations[variation.id]) {
          const stock = await fetchCurrentStock(product.id, variation.id);
          variation.currentStock = stock; // Store stock in variation
        }
      }

      setSelectedVariations(newSelectedVariations);
      updateSelectedProducts(product, newSelectedVariations);
    } else {
      // For single products
      const isSelected = selectedVariations[product.id];
      const newSelectedVariations = {
        ...selectedVariations,
        [product.id]: !isSelected,
      };

      if (newSelectedVariations[product.id]) {
        const stock = await fetchCurrentStock(product.id);
        product.currentStock = stock; // Store stock in product
      }

      setSelectedVariations(newSelectedVariations);
      updateSelectedProducts(product, newSelectedVariations);
    }
  };

  const handleVariationSelect = async (product, variation, e) => {
    e.stopPropagation();
    const newSelectedVariations = {
      ...selectedVariations,
      [variation.id]: !selectedVariations[variation.id],
    };

    if (newSelectedVariations[variation.id]) {
      const stock = await fetchCurrentStock(product.id, variation.id);
      variation.currentStock = stock; // Store stock in variation
    }

    setSelectedVariations(newSelectedVariations);
    updateSelectedProducts(product, newSelectedVariations);
  };

  const updateSelectedProducts = (product, variations) => {
    if (product.productVariations.length > 0) {
      // For variable products
      const selectedVars = product.productVariations.filter(
        (variation) => variations[variation.id]
      );

      // Remove all variations of this product first
      setSelectedProducts((prev) =>
        prev.filter((p) => p.id !== product.id || !p.variationId)
      );

      // Add selected variations
      if (selectedVars.length > 0) {
        const newProducts = selectedVars.map((variation) => ({
          id: product.id,
          productName: product.productName,
          sku: product.sku,
          variationId: variation.id,
          variationValue: variation.variationValue,
          quantity: 1,
          currentStock: variation.currentStock || 0, // Include current stock
        }));
        setSelectedProducts((prev) => [...prev, ...newProducts]);
      }
    } else {
      // For single products
      if (variations[product.id]) {
        // Add product if selected
        if (
          !selectedProducts.some((p) => p.id === product.id && !p.variationId)
        ) {
          setSelectedProducts((prev) => [
            ...prev,
            {
              id: product.id,
              productName: product.productName,
              sku: product.sku,
              quantity: 1,
              currentStock: product.currentStock || 0, // Include current stock
            },
          ]);
        }
      } else {
        // Remove product if deselected
        setSelectedProducts((prev) =>
          prev.filter((p) => !(p.id === product.id && !p.variationId))
        );
      }
    }
  };

  const handleRemoveProduct = (productId, variationId) => {
    setSelectedProducts((prev) =>
      prev.filter(
        (product) =>
          !(product.id === productId && product.variationId === variationId)
      )
    );
    // Also update selectedVariations
    if (variationId) {
      setSelectedVariations((prev) => ({ ...prev, [variationId]: false }));
    } else {
      setSelectedVariations((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleQuantityChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? { ...product, quantity: Math.max(1, parseInt(value) || 1) }
          : product
      )
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedOrderDate = orderDate.toISOString().split("T")[0];

    const orderItems = selectedProducts.map((product) => ({
      productId: product.id,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.variationId,
      productVariationName: product.variationValue,
      quantity: product.quantity,
    }));

    // Get franchiseId by removing 'fuma_' prefix from tenantDbName
    const tenantDbName =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");
    const franchiseId = tenantDbName?.replace(/^fuma_/, "");

    try {
      // 🔄 Step 1: Fetch customer by franchiseId
      const customerRes = await api.get(
        `https://fusionmastertech.com:8443/customer/franchise/${franchiseId}`
      );

      const customer = customerRes.data;

      // 🔄 Step 2: Construct final payload
      const payload = {
        vendor,
        status: 0,
        referenceNumber,
        addedBy: userName,
        orderDate: formattedOrderDate,
        location,
        totalItems: totalUnits,
        additionalNotes,
        franchiseId: customer.franchiseId,
        customerId: customer.id,
        franchiseName: customer.franchiseName,
        franchiseOrderItems: orderItems,
      };

      // 🔄 Step 3: Submit purchase order
      const response = await api.post(
        `https://fusionmastertech.com:8443/franchisepurchaseorder/save`,
        payload
      );

      alert("Purchase Order created successfully");
      navigate("/ListPurchaseOrder");
    } catch (error) {
      console.error("Error saving Franchise Purchase Order:", error);
      alert("Failed to save Franchise Purchase Order");
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading">Purchase Order</h1>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Vendor<span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          value={vendor}
                          onChange={(e) => setVendor(e.target.value)}
                          required
                        >
                          <option value="">Select Vendor</option>
                          {vendorlist.map((vendor) => (
                            <option key={vendor.id} value={vendor.name}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Reference No<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="addedBy">
                          Added By<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded"
                          id="addedBy"
                          name="addedBy"
                          placeholder="Enter here..."
                          value={userEmail}
                          onChange={(e) => setAddedBy(e.target.value)}
                          required
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Order Date<span className="text-danger">*</span>
                        </label>
                        <DatePicker
                          selected={orderDate}
                          onChange={setOrderDate}
                          className="form-control"
                          dateFormat="MM/dd/yyyy"
                          required
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Expected Delivery Date
                          <span className="text-danger">*</span>
                        </label>
                        <DatePicker
                          selected={expectedDate}
                          onChange={(date) => setExpectedDate(date)}
                          className="form-control"
                          dateFormat="MM/dd/yyyy"
                          minDate={new Date()}
                          placeholderText="Select expected date"
                          popperPlacement="top"
                          required
                          showPopperArrow={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="form-group">
                    <label>Search Products</label>
                    <div className="search-container">
                      <input
                        type="text"
                        className="form-control search-input w-100"
                        placeholder="Search by name, SKU or scan barcode"
                        value={searchTerm}
                        onChange={handleSearch}
                        onKeyDown={handleKeyPress}
                        autoComplete="off"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="clear-search"
                          onClick={() => {
                            setSearchTerm("");
                            setSearchResults([]);
                          }}
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  {searchTerm && searchResults.length > 0 && (
                    <div className="search-results" ref={searchResultsRef}>
                      {searchResults.map((product, index) => (
                        <div
                          key={product.id}
                          className={`py-0 product-row ${
                            focusedIndex === index ? "focused" : ""
                          } ${
                            (
                              product.productVariations.length > 0
                                ? product.productVariations.some(
                                    (v) => selectedVariations[v.id]
                                  )
                                : selectedVariations[product.id]
                            )
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="product-content flex justify-between p-0 items-start gap-4">
                            <div className="row d-flex justify-content-between p-0 ">
                              {/* Product Info */}
                              <div className="col-8 product-info p-0">
                                <div className="product-main-info p-0">
                                  <span className="product-name">
                                    {product.productName}
                                  </span>
                                  <span className="product-sku">
                                    {product.sku}
                                  </span>
                                  {/* <span
                                    className={`stock ${
                                      product.stock > 0
                                        ? "in-stock"
                                        : "out-of-stock"
                                    }`}
                                  >
                                    {product.stock > 0
                                      ? `Stock: ${product.stock}`
                                      : "Out of stock"}
                                  </span> */}
                                  <span className=" product-type">
                                    {product.productType}
                                  </span>
                                </div>
                              </div>

                              {/* Product Variations (only if VARIABLE) */}
                              {product.productType === "VARIABLE" && (
                                <div className=" col-4 mt-0 p-1 product-variations flex flex-wrap gap-2">
                                  {product.productVariations.map(
                                    (variation) => (
                                      <div
                                        key={variation.id}
                                        className={` mt-0 p-0 variation-item py-0 border rounded px-2 ${
                                          selectedVariations[variation.id]
                                            ? "selected"
                                            : ""
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents parent onClick
                                          handleVariationSelect(
                                            product,
                                            variation,
                                            e
                                          );
                                        }}
                                      >
                                        <span className="p-0 m-0">
                                          {variation.variationValue}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="selected-products">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Current Stock</th>
                            <th>Qty</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product, index) => (
                            <tr
                              key={`${product.id}-${
                                product.variationId || "base"
                              }`}
                            >
                              <td>{index + 1}</td>
                              <td>
                                {product.productName} ({product.sku})
                              </td>
                              <td>{product.variationValue || "N/A"}</td>
                              <td>{product.currentStock || "N/A"}</td>
                              <td
                                style={{
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                }}
                              >
                                <input
                                  type="number"
                                  className="no-spinner"
                                  value={product.quantity}
                                  min="0"
                                  onChange={(e) => {
                                    const value = Math.max(
                                      0,
                                      parseInt(e.target.value) || 0
                                    );
                                    handleQuantityChange(
                                      product.id,
                                      product.variationId,
                                      value
                                    );
                                  }}
                                  style={{
                                    textAlign: "center",
                                    margin: "auto",
                                    display: "block",
                                  }}
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleRemoveProduct(
                                      product.id,
                                      product.variationId
                                    )
                                  }
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="total-units">
                        <strong>Total Units: {totalUnits}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <button type="submit" className="btn btn-save btn-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PurchaseOrder;
