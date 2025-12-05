import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddStockTransfer() {
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [status, setStatus] = useState("");
  const [locationFromId, setLocationFromId] = useState("");
  const [locationToId, setLocationToId] = useState("");
  const [transferDate, setTransferDate] = useState(new Date());

  const [referenceNo, setReferenceNo] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shippingCharges, setShippingCharges] = useState(0);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [totalShippingAmount, setTotalShippingAmount] = useState(0);

  const [searchResults, setSearchResults] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    // Assuming you would set totalAmount based on other dynamic content or API responses
    setTotalShippingAmount(0); // Example static assignment for demonstration
  }, []);

  const handleShippingChargesChange = (e) => {
    setShippingCharges(e.target.value);
    updateTotalAmount();
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const updateTotalAmount = () => {
    // Update total amount logic if needed
    // Example: totalAmount calculation with shipping charges
    const calculatedTotal =
      parseFloat(totalAmount) + parseFloat(shippingCharges || 0);
    setTotalShippingAmount(calculatedTotal.toFixed(2));
  };
  // Update total amount based on shipping charges
  useEffect(() => {
    updateTotalAmount();
  }, [shippingCharges]);

  // Product search functionality
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
        `https://fusionmastertech.com:8443/product/search?query=${query}`
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

  const handleProductSelect = (product) => {
    if (product.productVariations.length > 0) {
      const allVariationsSelected = product.productVariations.every(
        (variation) => selectedVariations[variation.id]
      );

      const newSelectedVariations = { ...selectedVariations };

      product.productVariations.forEach((variation) => {
        newSelectedVariations[variation.id] = !allVariationsSelected;
      });

      setSelectedVariations(newSelectedVariations);
      updateSelectedProducts(product, newSelectedVariations);
    } else {
      const isSelected = selectedVariations[product.id];
      const newSelectedVariations = {
        ...selectedVariations,
        [product.id]: !isSelected,
      };
      setSelectedVariations(newSelectedVariations);
      updateSelectedProducts(product, newSelectedVariations);
    }
  };

  const updateSelectedProducts = (product, variations) => {
    if (product.productVariations.length > 0) {
      const selectedVars = product.productVariations.filter(
        (variation) => variations[variation.id]
      );

      setSelectedProducts((prev) =>
        prev.filter((p) => p.id !== product.id || !p.variationId)
      );

      if (selectedVars.length > 0) {
        const newProducts = selectedVars.map((variation) => ({
          id: product.id,
          productId: product.id,
          productName: product.productName,
          sku: product.sku,
          variationId: variation.id,
          variationValue: variation.variationValue,
          variationName: variation.variationValue,
          productVariationId: variation.id,
          defaultPurchasePriceExcTax: variation.defaultPurchasePriceExcTax,
          defaultSellingPrice: variation.defaultSellingPrice || 0, // Add this line
          quantity: 1,
          discountPercent: 0,
          profitMargin: variation.profitMargin || 0,
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
              productId: product.id,
              productName: product.productName,
              sku: product.sku,
              quantity: 1,
              discountPercent: 0,
              defaultPurchasePriceExcTax:
                product.defaultPurchasePriceExcTax || 0,
              defaultSellingPrice: product.defaultSellingPrice || 0, // Add this line
              profitMargin: product.profitMargin || 0,
            },
          ]);
        }
      } else {
        setSelectedProducts((prev) =>
          prev.filter((p) => !(p.id === product.id && !p.variationId))
        );
      }
    }
  };

  const handleVariationSelect = (product, variation, e) => {
    e.stopPropagation();
    const newSelectedVariations = {
      ...selectedVariations,
      [variation.id]: !selectedVariations[variation.id],
    };
    setSelectedVariations(newSelectedVariations);
    updateSelectedProducts(product, newSelectedVariations);
  };
  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: parseInt(value) } : product
      )
    );
  };
  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => {
      const newProducts = [...prev];
      newProducts.splice(index, 1);
      return newProducts;
    });
  };

  const handleStatusChange = (event) => setStatus(event.target.value);

  const statusTooltip = (
    <Tooltip id="status-tooltip">
      Stock transfer will not be editable if status is completed
    </Tooltip>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calculate total amount
      const totalAmount = selectedProducts.reduce(
        (sum, product) =>
          sum + product.defaultPurchasePriceExcTax * product.quantity,
        0
      );

      // Prepare stock transfer data
      const stockTransferData = {
        referenceNo,
        status,
        locationFromId: parseInt(locationFromId),
        locationToId: parseInt(locationToId),
        transferDate: transferDate.toISOString(),
        shippingCharges: parseFloat(shippingCharges),
        additionalNotes,
        totalAmount: totalAmount + parseFloat(shippingCharges || 0),
        items: selectedProducts.map((product) => ({
          productId: product.productId,
          variationId: product.variationId || null,
          quantity: product.quantity,
          unitPrice: product.defaultPurchasePriceExcTax,
          productName: product.productName,
          sku: product.sku,
          variationName: product.variationName || null,
        })),
      };

      // Save stock transfer
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/stock-transfers/save`,
        stockTransferData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          `Failed to save stock transfer: ${response.statusText}`
        );
      }

      // Success handling
      alert("Stock transfer created successfully!");
      navigate("/ListStockTransfer");
    } catch (error) {
      console.error("Error saving stock transfer:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save stock transfer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-md-6">
                  <h1 className=" all-heading">Add Stock Transfer</h1>
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
                      {/* Date */}
                      <div className="col-md-4 ">
                        <div className="form-group d-flex flex-row  flex-md-column ">
                          <label htmlFor="transaction_date">Sale Date:*</label>
                          <DatePicker
                            selected={transferDate}
                            onChange={(date) => setTransferDate(date)}
                            dateFormat="MM/dd/yyyy"
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                          />
                        </div>
                      </div>

                      {/* Reference No */}
                      <div className="form-group col-md-4">
                        <label htmlFor="referenceNo">Reference No:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="referenceNo"
                          value={referenceNo}
                          onChange={(e) => setReferenceNo(e.target.value)}
                        />
                      </div>

                      {/* Status */}
                      <div className="form-group col-md-4">
                        <label htmlFor="status">
                          Status:*
                          <span>
                            <OverlayTrigger
                              placement="bottom"
                              overlay={statusTooltip}
                            >
                              <i className="fa fa-info-circle text-info mr-2" />
                            </OverlayTrigger>
                          </span>
                        </label>
                        <div className="d-flex align-items-center">
                          <select
                            id="status"
                            name="status"
                            className="form-control"
                            required
                            value={status}
                            onChange={handleStatusChange}
                          >
                            <option value="" disabled>
                              Please Select
                            </option>
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Location (From) */}
                      <div className="form-group col-md-6">
                        <label htmlFor="location_id">Location (From):*</label>
                        <select
                          id="location_id"
                          name="location_id"
                          className="form-control"
                          required
                          value={locationFromId}
                          onChange={(e) => setLocationFromId(e.target.value)}
                        >
                          <option value="" disabled>
                            Please Select
                          </option>
                          {/* Populate dynamically */}
                          <option value="1">FUMA</option>
                        </select>
                      </div>

                      {/* Location (To) */}
                      <div className="form-group col-md-6">
                        <label htmlFor="transfer_location_id">
                          Location (To):*
                        </label>
                        <select
                          id="transfer_location_id"
                          name="transfer_location_id"
                          className="form-control"
                          required
                          value={locationToId}
                          onChange={(e) => setLocationToId(e.target.value)}
                        >
                          <option value="" disabled>
                            Please Select
                          </option>
                          {/* Populate dynamically */}
                          <option value="1">FUMA Franchise,Pune</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dymaic Search */}
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
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
                      <div className="product-list">
                        {searchTerm && searchResults.length > 0 && (
                          <div
                            className="search-results"
                            ref={searchResultsRef}
                          >
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
                                        <span
                                          className={`stock ${
                                            product.stock > 0
                                              ? "in-stock"
                                              : "out-of-stock"
                                          }`}
                                        >
                                          {product.stock > 0
                                            ? `Stock: ${product.stock}`
                                            : "Out of stock"}
                                        </span>
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
                      </div>

                      {selectedProducts.length > 0 && (
                        <div className="table-responsive">
                          <table className="table">
                            <thead>
                              <tr>
                                <th className="text-center">Product</th>
                                <th className="text-center">SKU</th>
                                {selectedProducts.some(
                                  (p) => p.variationName
                                ) && <th className="text-center">Variation</th>}
                                <th className="text-center">Quantity</th>
                                <th className="text-center">Unit Price</th>
                                <th className="text-center">Subtotal</th>
                                <th className="text-center">
                                  <i
                                    className="fa fa-trash"
                                    aria-hidden="true"
                                  />
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProducts.map((product, index) => (
                                <tr key={product.variationId || product.id}>
                                  <td>{product.productName}</td>
                                  <td>{product.sku}</td>
                                  {selectedProducts.some(
                                    (p) => p.variationName
                                  ) && <td>{product.variationName || "-"}</td>}
                                  <td>
                                    <input
                                      type="text"
                                      value={product.quantity}
                                      min="1"
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          product.id,
                                          product.variationId || null,
                                          parseInt(e.target.value, 10)
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </td>
                                  <td>
                                    {product.defaultPurchasePriceExcTax.toFixed(
                                      2
                                    )}
                                  </td>
                                  <td>
                                    {(
                                      product.defaultPurchasePriceExcTax *
                                      product.quantity
                                    ).toFixed(2)}
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleRemoveProduct(index)}
                                    >
                                      <i className="fa fa-trash" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="text-center">
                                <td
                                  colSpan={
                                    selectedProducts.some(
                                      (p) => p.variationName
                                    )
                                      ? 5
                                      : 4
                                  }
                                />
                                <td>
                                  <div className="pull-right">
                                    <b>Total: </b>
                                    <span>
                                      {selectedProducts
                                        .reduce(
                                          (sum, product) =>
                                            sum +
                                            product.defaultPurchasePriceExcTax *
                                              product.quantity,
                                          0
                                        )
                                        .toFixed(2)}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                      {loading && <div>Loading...</div>}
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                      <div className="row">
                        <div className="col-sm-10 col-sm-offset-1">
                          {filteredProducts.length > 0 && (
                            <ul className="list-group">
                              {filteredProducts.map((product) => (
                                <li
                                  key={product.id}
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                  onClick={() => handleProductSelect(product)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {product.name}
                                  <span className="badge badge-primary badge-pill">
                                    {product.price.toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      {/* </div> */}
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      {/* Shipping Charges */}
                      <div className=" col-md-4">
                        <div className="form-group">
                          <label htmlFor="shipping_charges">
                            Shipping Charges:
                          </label>
                          <input
                            className="form-control input_number"
                            placeholder="Shipping Charges"
                            name="shipping_charges"
                            type="number"
                            value={shippingCharges}
                            onChange={handleShippingChargesChange}
                            id="shipping_charges"
                          />
                        </div>
                      </div>

                      {/* Additional Notes: */}
                      <div className=" col-md-4">
                        <div className="form-group">
                          <label htmlFor="additional_notes">
                            Additional Notes:
                          </label>
                          <textarea
                            className="form-control"
                            rows={2}
                            name="additional_notes"
                            id="additional_notes"
                            value={additionalNotes}
                            onChange={handleAdditionalNotesChange}
                          />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="col-md-4 pt-md-5 text-right">
                        <b>Total Amount:</b>{" "}
                        <span id="final_total_text">{totalShippingAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 
                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2 "
                  >
                    Save
                  </button>
                </div> */}
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default AddStockTransfer;
