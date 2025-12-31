import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "./PurchaseOrder.css";
import axios from "axios";
import api from "../utils/api";

function AddPurchaseReturn() {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [vendorlist, setVendorList] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [productStocks, setProductStocks] = useState({});
  const [taxRates, setTaxRates] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch tax rates from API
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
      .then((response) => {
        setTaxRates(response.data);
      })
      .catch((error) => console.error("Error fetching tax rates:", error));
  }, []);

  // Update tax options when tax rates change
  useEffect(() => {
    const rateOptions = [
      { value: "", label: "None", rate: 0 },
      ...taxRates.map((rate) => ({
        value: rate.id,
        label: `${rate.taxName} (${rate.taxValue}%)`,
        rate: rate.taxValue,
      })),
    ];
    setTaxOptions(rateOptions);
  }, [taxRates]);

  // Calculate totals whenever selectedProducts changes
  useEffect(() => {
    let subtotalCalc = 0;
    let totalTaxCalc = 0;

    selectedProducts.forEach((product) => {
      const productSubtotal = product.quantity * (product.unitPrice || 0);
      subtotalCalc += productSubtotal;

      const taxRate = product.selectedTax ? product.selectedTax.rate : 0;
      const productTax = productSubtotal * (taxRate / 100);
      totalTaxCalc += productTax;
    });

    setSubtotal(subtotalCalc);
    setTotalTax(totalTaxCalc);
    setTotalAmount(subtotalCalc + totalTaxCalc);

    // Calculate total units
    const totalUnitsCalc = selectedProducts.reduce(
      (total, product) => total + product.quantity,
      0
    );
    setTotalUnits(totalUnitsCalc);
  }, [selectedProducts]);

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
      const allVariationsSelected = product.productVariations.every(
        (variation) => selectedVariations[variation.id]
      );

      const newSelectedVariations = { ...selectedVariations };

      product.productVariations.forEach((variation) => {
        newSelectedVariations[variation.id] = !allVariationsSelected;
      });

      setSelectedVariations(newSelectedVariations);
      await updateSelectedProducts(product, newSelectedVariations);
    } else {
      const isSelected = selectedVariations[product.id];
      const newSelectedVariations = {
        ...selectedVariations,
        [product.id]: !isSelected,
      };
      setSelectedVariations(newSelectedVariations);
      await updateSelectedProducts(product, newSelectedVariations);
    }
  };

  const handleVariationSelect = async (product, variation, e) => {
    e.stopPropagation();
    const newSelectedVariations = {
      ...selectedVariations,
      [variation.id]: !selectedVariations[variation.id],
    };
    setSelectedVariations(newSelectedVariations);
    await updateSelectedProducts(product, newSelectedVariations);
  };

  const updateSelectedProducts = async (product, variations) => {
    if (product.productVariations.length > 0) {
      const selectedVars = product.productVariations.filter(
        (variation) => variations[variation.id]
      );

      setSelectedProducts((prev) =>
        prev.filter((p) => p.id !== product.id || !p.variationId)
      );

      if (selectedVars.length > 0) {
        const newProducts = await Promise.all(
          selectedVars.map(async (variation) => {
            const stock = await fetchCurrentStock(product.id, variation.id);
            return {
              id: product.id,
              productName: product.productName,
              sku: product.sku,
              variationId: variation.id,
              variationValue: variation.variationValue,
              quantity: 1,
              unitPrice: variation.defaultPurchasePriceExcTax || 0, // Add this line
              selectedTax: taxOptions[0],
              currentStock: stock,
            };
          })
        );
        setSelectedProducts((prev) => [...prev, ...newProducts]);
      }
    } else {
      if (variations[product.id]) {
        if (
          !selectedProducts.some((p) => p.id === product.id && !p.variationId)
        ) {
          const stock = await fetchCurrentStock(product.id);
          setSelectedProducts((prev) => [
            ...prev,
            {
              id: product.id,
              productName: product.productName,
              sku: product.sku,
              quantity: 1,
              unitPrice: product.defaultPurchasePriceExcTax || 0, // Add this line
              selectedTax: taxOptions[0],
              currentStock: stock,
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

  const handleRemoveProduct = (productId, variationId) => {
    setSelectedProducts((prev) =>
      prev.filter(
        (product) =>
          !(product.id === productId && product.variationId === variationId)
      )
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
          : product
      )
    );
  };

  const handleUnitPriceChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? { ...product, unitPrice: parseFloat(value) || 0 }
          : product
      )
    );
  };

  const handleTaxRateChange = (productId, variationId, selectedOption) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? { ...product, selectedTax: selectedOption }
          : product
      )
    );
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedOrderDate = orderDate
      ? orderDate.toISOString().split("T")[0]
      : null;

    const orderItems = selectedProducts.map((product) => ({
      productId: product.id,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.variationId,
      productVariationName: product.variationValue,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      //  tax: product.selectedTax ? product.selectedTax.rate : 0, // match Java field "tax"
      tax: product.selectedTax ? product.selectedTax.value : null, // send tax ID
      subTotal: product.unitPrice * product.quantity, // FIXED: "subTotal"
    }));

    const franchiseId =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");

    const payload = {
      vendor,
      status: 0,
      paymentStatus: 0,
      referenceNumber,
      addedBy: userEmail,
      orderDate: formattedOrderDate,
      location,
      totalItems: totalUnits,
      netTotalAmount: totalAmount,
      additionalNotes,
      franchiseId,
      franchisePurchaseReturnItems: orderItems,
    };

    console.log("Payload:", payload);

    try {
      const response = await api.post(
        `https://fusionmastertech.com:8443/franchise-purchase-return/save`,
        payload
      );
      console.log("API Response:", response.data);
      alert("Purchase Return created successfully");
      navigate("/ReturnPurchaseList");
    } catch (error) {
      console.error("Error saving Purchase Return:", error);
      alert("Failed to save Purchase Return");
    }
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading">Add Purchase Return</h1>
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
                        <div className="dropdown">
                          <div className="">
                            <label className="me-2 d-md-inline">Vendor</label>
                            <div className="d-flex align-items-center">
                              <select
                                className="form-select me-2"
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
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referenceNumber">
                            Reference No<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="referenceNumber"
                            name="referenceNumber"
                            placeholder="Enter here.."
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
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Date</label>
                          <DatePicker
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            minDate={new Date()}
                            popperPlacement="top"
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
                                <div className="col-8 product-info p-0">
                                  <div className="product-main-info p-0">
                                    <span className="product-name">
                                      {product.productName}
                                    </span>
                                    <span className="product-sku">
                                      {product.sku}
                                    </span>
                                    <span className="product-type">
                                      {product.productType}
                                    </span>
                                  </div>
                                </div>

                                {product.productType === "VARIABLE" && (
                                  <div className="col-4 mt-0 p-1 product-variations flex flex-wrap gap-2">
                                    {product.productVariations.map(
                                      (variation) => (
                                        <div
                                          key={variation.id}
                                          className={`mt-0 p-0 variation-item py-0 border rounded px-2 ${
                                            selectedVariations[variation.id]
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
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
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Product</th>
                              <th>Variant</th>
                              <th>Current Stock</th>
                              <th>Unit Price</th>
                              <th>Qty</th>
                              <th>Subtotal</th>
                              <th>Tax Rate</th>
                              <th>Tax Amount</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProducts.map((product, index) => {
                              const productSubtotal =
                                product.quantity * (product.unitPrice || 0);
                              const taxRate = product.selectedTax
                                ? product.selectedTax.rate
                                : 0;
                              const taxAmount =
                                productSubtotal * (taxRate / 100);
                              const lineTotal = productSubtotal + taxAmount;

                              return (
                                <tr
                                  key={`${product.id}-${product.variationId || "base"}`}
                                >
                                  <td>{index + 1}</td>
                                  <td>
                                    {product.productName} ({product.sku})
                                  </td>
                                  <td>{product.variationValue || "N/A"}</td>
                                  <td>{product.currentStock || "N/A"}</td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control no-spinner"
                                      value={product.unitPrice}
                                      min="0"
                                      step="0.01"
                                      style={{
                                        width: "100px",
                                        padding: "5px",
                                        textAlign: "center",
                                      }}
                                      onChange={(e) =>
                                        handleUnitPriceChange(
                                          product.id,
                                          product.variationId,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control no-spinner"
                                      value={product.quantity}
                                      min="1"
                                      style={{
                                        width: "80px",
                                        padding: "5px",
                                        textAlign: "center",
                                      }}
                                      onChange={(e) => {
                                        const value = Math.max(
                                          1,
                                          parseInt(e.target.value) || 1
                                        );
                                        handleQuantityChange(
                                          product.id,
                                          product.variationId,
                                          value
                                        );
                                      }}
                                    />
                                  </td>
                                  <td>{productSubtotal.toFixed(2)}</td>
                                  <td style={{ width: "200px" }}>
                                    <Select
                                      options={taxOptions}
                                      value={
                                        product.selectedTax || taxOptions[0]
                                      }
                                      onChange={(selected) =>
                                        handleTaxRateChange(
                                          product.id,
                                          product.variationId,
                                          selected
                                        )
                                      }
                                      placeholder="Select Tax"
                                      isSearchable
                                      styles={{
                                        control: (provided) => ({
                                          ...provided,
                                          width: "100%",
                                        }),
                                      }}
                                    />
                                  </td>
                                  <td>{taxAmount.toFixed(2)}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger"
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
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="6" className="text-end">
                                <strong>Subtotal:</strong>
                              </td>
                              <td>{subtotal.toFixed(2)}</td>
                              <td className="text-end">
                                <strong>Total Tax:</strong>
                              </td>
                              <td>{totalTax.toFixed(2)}</td>
                              <td></td>
                            </tr>

                            <tr>
                              <td colSpan="6" className="text-end">
                                <strong>Total Units:</strong>
                              </td>
                              <td colSpan="4">
                                <strong>{totalUnits}</strong>
                              </td>
                            </tr>
                          </tfoot>
                        </table>

                        <div>
                          Total Amount:{" "}
                          <strong>{totalAmount.toFixed(2)}</strong>
                          <br />
                          Total Units: <strong> {totalUnits}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Additional Notes</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="additional_notes"
                            cols="50"
                            id="additional_notes"
                            value={additionalNotes}
                            onChange={handleAdditionalNotesChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default AddPurchaseReturn;
