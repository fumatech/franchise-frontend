import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./PurchaseOrder.css";
import axios from "axios";
import api from "../utils/api";

function ViewPurchaseOrder() {
  const { id } = useParams();
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
  const [isLoading, setIsLoading] = useState(true);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchProducts(searchTerm);
    }
  };
  // Fetch purchase order data
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          `https://fusionmastertech.com:8443/franchisepurchaseorder/get/${id}`,
        );
        const data = response.data;

        // Set form fields
        setVendor(data.vendor);
        setReferenceNumber(data.referenceNumber);
        setOrderDate(new Date(data.orderDate));
        setExpectedDate(data.deliveryDate ? new Date(data.deliveryDate) : null);
        setLocation(data.location);
        setAdditionalNotes(data.additionalNotes);
        setAddedBy(data.addedBy);
        setTotalUnits(data.totalItems);

        // Process order items
        const items = data.franchiseOrderItems || [];
        const newSelectedProducts = [];
        const newSelectedVariations = {};

        for (const item of items) {
          if (item.productVariationId) {
            // Variable product
            newSelectedVariations[item.productVariationId] = true;
            newSelectedProducts.push({
              id: item.productId,
              productName: item.productName,
              sku: item.productSku,
              variationId: item.productVariationId,
              variationValue: item.productVariationName,
              quantity: item.quantity,
              currentStock: 0, // Will be fetched later
            });
          } else {
            // Simple product
            newSelectedVariations[item.productId] = true;
            newSelectedProducts.push({
              id: item.productId,
              productName: item.productName,
              sku: item.productSku,
              quantity: item.quantity,
              currentStock: 0, // Will be fetched later
            });
          }
        }

        setSelectedProducts(newSelectedProducts);
        setSelectedVariations(newSelectedVariations);

        // Fetch current stock for all selected products
        await fetchStockForSelectedProducts(newSelectedProducts);
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        alert("Failed to load purchase order");
        navigate("/ListPurchaseOrder");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStockForSelectedProducts = async (products) => {
      const updatedProducts = [...products];

      for (let i = 0; i < updatedProducts.length; i++) {
        const product = updatedProducts[i];
        try {
          const stock = product.variationId
            ? await fetchCurrentStock(product.id, product.variationId)
            : await fetchCurrentStock(product.id);

          updatedProducts[i] = {
            ...product,
            currentStock: stock,
          };
        } catch (error) {
          console.error("Error fetching stock for product:", product.id, error);
          updatedProducts[i] = {
            ...product,
            currentStock: 0,
          };
        }
      }

      setSelectedProducts(updatedProducts);
    };

    fetchPurchaseOrder();
  }, [id, navigate]);

  // Fetch vendors list
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `https://fusionmastertech.com:8443/business-details/getall`,
        );
        const data = await response.json();
        setVendorList(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch user info
  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
      fetch(`${process.env.REACT_APP_BASE_URL}/user/username?email=${email}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setUserName(data);
          }
        })
        .catch((error) => console.error("Error fetching username:", error));
    }
  }, []);

  // Calculate total units
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

  // Product search functions (same as in PurchaseOrder)
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
        `https://fusionmastertech.com:8443/product/search/active?query=${query}`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Product selection functions (same as in PurchaseOrder)
  const handleProductSelect = async (product) => {
    if (product.productVariations.length > 0) {
      const allVariationsSelected = product.productVariations.every(
        (variation) => selectedVariations[variation.id],
      );

      const newSelectedVariations = { ...selectedVariations };

      for (const variation of product.productVariations) {
        newSelectedVariations[variation.id] = !allVariationsSelected;
        if (newSelectedVariations[variation.id]) {
          const stock = await fetchCurrentStock(product.id, variation.id);
          variation.currentStock = stock;
        }
      }

      setSelectedVariations(newSelectedVariations);
      updateSelectedProducts(product, newSelectedVariations);
    } else {
      const isSelected = selectedVariations[product.id];
      const newSelectedVariations = {
        ...selectedVariations,
        [product.id]: !isSelected,
      };

      if (newSelectedVariations[product.id]) {
        const stock = await fetchCurrentStock(product.id);
        product.currentStock = stock;
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
      variation.currentStock = stock;
    }

    setSelectedVariations(newSelectedVariations);
    updateSelectedProducts(product, newSelectedVariations);
  };

  const updateSelectedProducts = (product, variations) => {
    if (product.productVariations.length > 0) {
      const selectedVars = product.productVariations.filter(
        (variation) => variations[variation.id],
      );

      setSelectedProducts((prev) =>
        prev.filter((p) => p.id !== product.id || !p.variationId),
      );

      if (selectedVars.length > 0) {
        const newProducts = selectedVars.map((variation) => ({
          id: product.id,
          productName: product.productName,
          sku: product.sku,
          variationId: variation.id,
          variationValue: variation.variationValue,
          quantity: 1,
          currentStock: variation.currentStock || 0,
        }));
        setSelectedProducts((prev) => [...prev, ...newProducts]);
      }
    } else {
      if (variations[product.id]) {
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
              currentStock: product.currentStock || 0,
            },
          ]);
        }
      } else {
        setSelectedProducts((prev) =>
          prev.filter((p) => !(p.id === product.id && !p.variationId)),
        );
      }
    }
  };

  // Other handlers (same as in PurchaseOrder)
  const handleRemoveProduct = (productId, variationId) => {
    setSelectedProducts((prev) =>
      prev.filter(
        (product) =>
          !(product.id === productId && product.variationId === variationId),
      ),
    );
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
          : product,
      ),
    );
  };

  // Submit handler for editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedOrderDate = orderDate.toISOString().split("T")[0];
    const formattedExpectedDate = expectedDate
      ? expectedDate.toISOString().split("T")[0]
      : null;

    const orderItems = selectedProducts.map((product) => ({
      productId: product.id,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.variationId,
      productVariationName: product.variationValue,
      quantity: product.quantity,
    }));

    const franchiseId =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");

    const payload = {
      id: parseInt(id),
      vendor,
      status: 0, // You might want to preserve the original status
      referenceNumber,
      addedBy: userName,
      orderDate: formattedOrderDate,
      expectedDate: formattedExpectedDate,
      location,
      totalItems: totalUnits,
      additionalNotes,
      franchiseId,
      franchiseOrderItems: orderItems,
    };

    try {
      const response = await api.put(
        `https://fusionmastertech.com:8443/franchisepurchaseorder/update`,
        payload,
      );
      alert("Purchase Order updated successfully");
      navigate("/ListPurchaseOrder");
    } catch (error) {
      console.error("Error updating Franchise Purchase Order:", error);
      alert("Failed to update Franchise Purchase Order");
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading">View Purchase Order</h1>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              {/* Form fields (same as in PurchaseOrder) */}
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
                          readOnly
                          disabled
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
                          readOnly
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
                          Location<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
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
                          // placeholderText="Select expected delivery date"
                          popperPlacement="top"
                          required
                          showPopperArrow={false}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product selection and table (same as in PurchaseOrder) */}
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
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
                                    (v) => selectedVariations[v.id],
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
                              <div className="col-8 product-info p-0">
                                <div className="product-main-info p-0">
                                  <span className="product-name">
                                    {product.productName}
                                  </span>
                                  <span className="product-sku">
                                    {product.sku}
                                  </span>
                                  <span className=" product-type">
                                    {product.productType}
                                  </span>
                                </div>
                              </div>

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
                                          e.stopPropagation();
                                          handleVariationSelect(
                                            product,
                                            variation,
                                            e,
                                          );
                                        }}
                                      >
                                        <span className="p-0 m-0">
                                          {variation.variationValue}
                                        </span>
                                      </div>
                                    ),
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
                                  value={product.quantity}
                                  readOnly
                                  min="0"
                                  onChange={(e) => {
                                    const value = Math.max(
                                      0,
                                      parseInt(e.target.value) || 0,
                                    );
                                    handleQuantityChange(
                                      product.id,
                                      product.variationId,
                                      value,
                                    );
                                  }}
                                  style={{
                                    textAlign: "center", // center text inside input
                                    margin: "auto", // center horizontally
                                  }}
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  disabled
                                  onClick={() =>
                                    handleRemoveProduct(
                                      product.id,
                                      product.variationId,
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
                <button
                  type="button"
                  className="btn btn-save btn-lg ml-2"
                  onClick={() => navigate("/ListPurchaseOrder")}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ViewPurchaseOrder;
