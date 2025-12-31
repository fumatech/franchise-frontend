import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "./PurchaseOrder.css";
import axios from "axios";
import api from "../utils/api";

function EditPurchaseReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
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
  const [netTotalAmount, setNetTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  // Helper function to find tax option by ID
  const findTaxOptionById = (taxId) => {
    if (!taxId) return taxOptions[0]; // Return "None" if no tax ID
    return taxOptions.find((option) => option.value === taxId) || taxOptions[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://fusionmastertech.com:8443/franchise-purchase-return/get/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const purchase = await response.json();
        setVendor(purchase.vendor);
        setReferenceNumber(purchase.referenceNumber);
        setInvoiceNumber(purchase.invoiceNumber);
        setAddedBy(purchase.addedBy);
        setOrderDate(new Date(purchase.orderDate));
        setLocation(purchase.location);
        setAdditionalNotes(purchase.additionalNotes);
        setNetTotalAmount(purchase.netTotalAmount);

        // Wait for tax options to be loaded before processing products
        if (taxOptions.length > 0) {
          const selected = purchase.franchisePurchaseReturnItems.map((item) => {
            const taxOption = findTaxOptionById(item.tax);
            const taxRate = taxOption ? taxOption.rate : 0;
            const unitPrice = Number(item.unitPrice) || 0;
            const updatedQty = Number(item.updatedQuantity) || 0;
            const subTotal = updatedQty * unitPrice;
            const taxAmount = (subTotal * taxRate) / 100;
            const totalWithTax = subTotal + taxAmount;

            return {
              id: item.id,
              productId: item.productId,
              productName: item.productName,
              sku: item.productSku,
              quantity: Number(item.quantity) || 0,
              updatedQuantity: updatedQty,
              variationValue: item.productVariationName,
              productVariationId: item.productVariationId,
              unitPrice,
              selectedTax: taxOption,
              taxRate,
              taxRateId: item.tax,
              taxAmount,
              lineTotal: subTotal,
              totalWithTax,
            };
          });

          const selectedVar = {};
          purchase.franchisePurchaseReturnItems.forEach((item) => {
            if (item.productVariationId) {
              selectedVar[item.productVariationId] = true;
            }
          });

          setSelectedProducts(selected);
          setSelectedVariations(selectedVar);
        }
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data when taxOptions are available
    if (taxOptions.length > 0) {
      fetchData();
    }
  }, [id, taxOptions]); // Depend on taxOptions instead of taxRates

  // In your calculation useEffect:
  useEffect(() => {
    let subtotalCalc = 0;
    let totalTaxCalc = 0;

    selectedProducts.forEach((product) => {
      const productSubtotal =
        (product.quantity || 0) * (product.unitPrice || 0);
      subtotalCalc += productSubtotal;

      const taxRate = product.selectedTax ? product.selectedTax.rate : 0;
      const productTax = productSubtotal * (taxRate / 100);
      totalTaxCalc += productTax;
    });

    setSubtotal(subtotalCalc);
    setTotalTax(totalTaxCalc);
    setTotalAmount(subtotalCalc + totalTaxCalc);

    const totalUnitsCalc = selectedProducts.reduce(
      (total, product) => total + (product.quantity || 0),
      0
    );
    setTotalUnits(totalUnitsCalc);
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
              unitPrice: variation.defaultPurchasePriceExcTax || 0,
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
              unitPrice: product.defaultPurchasePriceExcTax || 0,
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
      prev.map((product) => {
        if (product.id === productId && product.variationId === variationId) {
          const unitPrice = parseFloat(value) || 0;
          const quantity = product.quantity || 1;
          const taxRate = product.selectedTax?.rate || 0;

          const subtotal = unitPrice * quantity;
          const taxAmount = subtotal * (taxRate / 100);
          const totalAmount = subtotal + taxAmount;

          return {
            ...product,
            unitPrice,
            subtotal,
            taxAmount,
            totalAmount,
          };
        }
        return product;
      })
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
      productId: product.productId || product.id,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.variationId,
      productVariationName: product.variationValue,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      tax: product.selectedTax ? product.selectedTax.value : null,
      taxAmount:
        (product.unitPrice *
          product.quantity *
          (product.selectedTax ? product.selectedTax.rate : 0)) /
        100,
      subtotal: product.unitPrice * product.quantity,
      total:
        product.unitPrice *
        product.quantity *
        (1 + (product.selectedTax ? product.selectedTax.rate : 0) / 100),
    }));

    const franchiseId =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");

    const payload = {
      id: id, // Include the ID for update
      vendor,
      status: 0,
      paymentStatus: 0,
      invoiceNumber,
      referenceNumber,
      addedBy: userEmail,
      orderDate: formattedOrderDate,
      location,
      totalItems: totalUnits,
      subtotal,
      totalTax,
      netTotalAmount: totalAmount,
      additionalNotes,
      franchiseId,
      franchisePurchaseReturnItems: orderItems,
    };

    console.log("Payload:", payload);

    try {
      const response = await api.put(
        `https://fusionmastertech.com:8443/franchise-purchase-return/update/${id}`,
        payload
      );
      console.log("API Response:", response.data);
      alert("Purchase Return updated successfully");
      navigate("/ReturnPurchaseList");
    } catch (error) {
      console.error("Error updating Purchase Return:", error);
      alert("Failed to update Purchase Return");
    }
  };

  if (isLoading) {
    return (
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content">
            <div className="container-fluid text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p>Loading purchase return data...</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading">Edit Purchase Return</h1>
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
                                          parseFloat(e.target.value) || 0
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
                                      value={product.selectedTax}
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
                          Total Units: <strong>{totalUnits || 0}</strong>
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
                    Update
                  </button>
                  {/* <Link
                    to="/ReturnPurchaseList"
                    className="btn btn-cancel btn-lg px-4 py-2 m-2"
                  >
                    Cancel
                  </Link> */}
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default EditPurchaseReturn;
