import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import api from "../utils/api";

function EditDIPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [status, setStatus] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [payTermNumber, setPayTermNumber] = useState("");
  const [payTermType, setPayTermType] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [purchaseTax, setPurchaseTax] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [shippingDetails, setShippingDetails] = useState("");
  const [shippingCharges, setShippingCharges] = useState("");
  const [additionalExpenses, setAdditionalExpenses] = useState(
    Array(4).fill({ name: "", amount: "0" })
  );
  const [productsData, setProductsData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [vendorlist, setVendorList] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);
  const [subtotalAmount, setSubTotalAmount] = useState(0);
  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
  const [totalLineTotal, setTotalLineTotal] = useState(0);
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/purchase-di-order/get/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        const orderData = response.data;
        setVendor(orderData.vendor || "");
        setReferenceNumber(orderData.referenceNumber || "");
        setStatus(orderData.status || "");
        setAddedBy(orderData.addedBy || "");
        setPurchaseDate(
          orderData.orderDate ? new Date(orderData.orderDate) : new Date()
        );
        setLocation(orderData.location || "");
        setPayTermNumber(orderData.payTermNumber || "");
        setPayTermType(orderData.payTermType || "");
        setDiscountType(orderData.discountType || "");
        setDiscountAmount(orderData.discountAmount || 0);
        setAdditionalNotes(orderData.additionalNotes || "");
        const matchedPurchaseTaxOption = taxOptions.find(
          (opt) => opt.value == orderData.purchaseTax
        );

        if (matchedPurchaseTaxOption) {
          setPurchaseTax(matchedPurchaseTaxOption.value);
          setTaxAmount(matchedPurchaseTaxOption.rate);
        } else {
          setPurchaseTax(taxOptions[0].value);
          setTaxAmount(taxOptions[0].rate);
        }
        if (
          orderData.shippingDIDetails &&
          orderData.shippingDIDetails.length > 0
        ) {
          const shipping = orderData.shippingDIDetails[0];
          setShippingDetails(shipping.shippingDetails || "");
          setShippingCharges(shipping.shippingCharges || "");

          const expenses = (shipping.additionalExpensesName || []).map(
            (name, index) => ({
              name,
              amount: shipping.amount[index] || "0",
            })
          );
          setAdditionalExpenses(expenses);
        }
        if (orderData.purchaseDIItem && orderData.purchaseDIItem.length > 0) {
          const products = orderData.purchaseDIItem.map((item) => {
            const matchedTaxOption = taxOptions.find(
              (opt) => opt.value === item.taxRate
            );

            return {
              id: item.productId,
              productId: item.productId,
              productName: item.productName,
              sku: item.productSku,
              variationId: item.productVariationId,
              productVariationId: item.productVariationId,
              variationName: item.productVariationName,
              variationValue: item.productVariationName,
              quantity: item.quantity,
              discountPercent: item.discountPercent,
              taxRate: matchedTaxOption ? matchedTaxOption.rate : 0,
              taxAmount: item.taxAmount,
              defaultPurchasePriceExcTax: item.unitCostBeforeDiscount,
              profitMargin: item.profitMargin,
              taxRateId: matchedTaxOption ? matchedTaxOption.value : null,
              selectedTax: matchedTaxOption,
            };
          });

          setSelectedProducts(products);
          const variations = {};
          products.forEach((product) => {
            if (product.variationId) {
              variations[product.variationId] = true;
            } else {
              variations[product.id] = true;
            }
          });
          setSelectedVariations(variations);
        }
      } catch (error) {
        console.error("❌ Error fetching purchase order:", error);
      }
    };

    fetchPurchaseOrder();
  }, [id, taxOptions]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          `https://fusionmastertech.com:8443/business-details/getall`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setVendorList(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchTaxRates = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/tax/getall`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setTaxRates(response.data);
      } catch (error) {
        console.error("Error fetching tax rates:", error);
      }
    };
    fetchTaxRates();
  }, []);

  useEffect(() => {
    if (taxRates && taxRates.length > 0) {
      const rateOptions = [
        { value: "", label: "None", rate: 0 },
        ...taxRates.map((rate) => ({
          value: rate.id.toString(),
          label: `${rate.taxName} (${rate.taxValue}%)`,
          rate: rate.taxValue,
        })),
      ];
      setTaxOptions(rateOptions);
    }
  }, [taxRates]);
  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/user/username?email=${email}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        .then((response) => {
          setUserName(response.data || email.split("@")[0]);
        })
        .catch((error) => {
          console.error("Error fetching username:", error);
          setUserName(email.split("@")[0]);
        });
    }
  }, []);

  useEffect(() => {
    let subtotal = 0;
    let totalUnits = 0;
    let totalLineTotal = 0;

    selectedProducts.forEach((product) => {
      const unitCostBeforeDiscount =
        parseFloat(product.defaultPurchasePriceExcTax) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;
      const quantity = parseFloat(product.quantity) || 0;

      const unitCostAfterDiscount =
        unitCostBeforeDiscount * (1 - discountPercent / 100);
      const productSubtotal = unitCostAfterDiscount * quantity;
      const taxRate = parseFloat(product.taxRate) || 0;
      const taxAmount = (productSubtotal * taxRate) / 100;
      const productLineTotal = productSubtotal + taxAmount;

      subtotal += productSubtotal;
      totalLineTotal += productLineTotal;
      totalUnits += quantity;
    });

    setSubTotalAmount(subtotal.toFixed(2));
    setTotalLineTotal(totalLineTotal.toFixed(2));
    setTotalUnits(totalUnits);
    let totalDiscount = 0;
    const discountValue = parseFloat(discountAmount) || 0;

    if (discountType === "Fixed") {
      totalDiscount = Math.min(discountValue, subtotal);
    } else if (discountType === "Percentage") {
      totalDiscount = (subtotal * discountValue) / 100;
    }
    const taxAmountOnSubtotal = ((subtotal - totalDiscount) * taxAmount) / 100;
    setTaxOnsubtotal(taxAmountOnSubtotal);
    const shipping = parseFloat(shippingCharges) || 0;
    const additionalExpensesTotal = additionalExpenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );

    const finalAmount =
      totalLineTotal -
      totalDiscount +
      shipping +
      taxAmountOnSubtotal +
      additionalExpensesTotal;

    setFinalPurchaseAmount(finalAmount.toFixed(2));
  }, [
    selectedProducts,
    discountType,
    discountAmount,
    taxAmount,
    shippingCharges,
    additionalExpenses,
  ]);
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) await searchProducts(value);
    else setSearchResults([]);
    setFocusedIndex(-1);
  };

  const searchProducts = async (query) => {
    try {
      const response = await axios.get(
        `https://fusionmastertech.com:8443/product/search?query=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setSearchResults(response.data);
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

  const handleVariationSelect = (product, variation, e) => {
    e.stopPropagation();
    const newSelectedVariations = {
      ...selectedVariations,
      [variation.id]: !selectedVariations[variation.id],
    };
    setSelectedVariations(newSelectedVariations);
    updateSelectedProducts(product, newSelectedVariations);
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
          productName: product.productName,
          sku: product.sku,
          variationId: variation.id,
          variationValue: variation.variationValue,
          quantity: 1,
          discountPercent: 0,
          taxRate: 0,
          taxAmount: 0,
          productId: product.id,
          productVariationId: variation.id,
          variationName: variation.variationValue,
          defaultPurchasePriceExcTax: variation.defaultPurchasePriceExcTax || 0,
          profitMargin: variation.profitMargin || 0,
          selectedTax: null,
          taxRateId: null,
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
              ...product,
              quantity: 1,
              discountPercent: 0,
              taxRate: 0,
              taxAmount: 0,
              productId: product.id,
              productVariationId: null,
              variationName: null,
              defaultPurchasePriceExcTax:
                product.defaultPurchasePriceExcTax || 0,
              profitMargin: product.profitMargin || 0,
              selectedTax: null,
              taxRateId: null,
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

  const handleQuantityChange = (id, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        if (!product.variationId && product.id === id) {
          return { ...product, quantity: parseInt(value) || 1 };
        }
        if (
          product.variationId &&
          product.id === id &&
          product.variationId === variationId
        ) {
          return { ...product, quantity: parseInt(value) || 1 };
        }
        return product;
      })
    );
  };

  const handleDiscountChange = (productId, variationId, value) => {
    const discountValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId &&
        (!product.variationId || product.variationId === variationId)
          ? { ...product, discountPercent: discountValue }
          : product
      )
    );
  };
  const handleTaxRateChange = (productId, variationId, selectedOption) => {
    const taxRateId = selectedOption ? selectedOption.value : "";
    const taxRate = selectedOption ? selectedOption.rate : 0;

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId &&
        (product.variationId === variationId ||
          (!product.variationId && !variationId))
          ? {
              ...product,
              taxRate,
              taxRateId,
              selectedTax: selectedOption || null,
            }
          : product
      )
    );
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
  const handleTaxIdChange = (selectedOption) => {
    if (selectedOption === null || selectedOption.value === "") {
      setPurchaseTax("");
      setTaxAmount(0);
    } else {
      const selectedTaxId = selectedOption.value;
      const selectedTaxRate = selectedOption.rate;
      setPurchaseTax(selectedTaxId);
      setTaxAmount(selectedTaxRate);
    }
  };

  const handleExpenseChange = (index, field, value) => {
    setAdditionalExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: value,
      };
      return updatedExpenses;
    });
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPurchaseDate = purchaseDate
      ? purchaseDate.toISOString().split("T")[0]
      : null;

    const shippingDIDetails = [
      {
        shippingDetails: shippingDetails || "",
        shippingCharges: parseFloat(shippingCharges) || 0,
        additionalExpensesName: additionalExpenses.map((exp) => exp.name || ""),
        amount: additionalExpenses.map((exp) => parseFloat(exp.amount) || 0),
      },
    ];

    const purchaseDIItem = selectedProducts.map((product) => {
      const unitCostBeforeDiscount =
        parseFloat(product.defaultPurchasePriceExcTax) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;
      const unitCostAfterDiscount =
        unitCostBeforeDiscount * (1 - discountPercent / 100);
      const lineTotal = unitCostAfterDiscount * (product.quantity || 0);
      const taxRate = parseFloat(product.taxRate) || 0;
      const taxAmount =
        (unitCostAfterDiscount * (product.quantity || 0) * taxRate) / 100;
      const profitMargin = parseFloat(product.profitMargin) || 0;
      const unitSellingPrice = (
        unitCostAfterDiscount *
        (1 + taxRate / 100)
      ).toFixed(2);

      return {
        productId: product.productId,
        productName: product.productName,
        productSku: product.sku,
        productVariationId: product.productVariationId,
        productVariationName: product.variationName,
        quantity: product.quantity,
        unitCostBeforeDiscount,
        discountPercent,
        unitCostAfterDiscount,
        lineTotal,
        taxRate,
        taxAmount,
        profitMargin,
        unitSellingPrice,
      };
    });

    const stockTransactions = selectedProducts.map((item) => ({
      productId: item.productId,
      variationId: item.productVariationId,
      quantity: item.quantity,
      price: item.unitSellingPrice,
      transactionType: "di_purchase",
      date: new Date().toISOString().split("T")[0],
      note: "Stock updated after DI purchase",
    }));

    const payload = {
      id: parseInt(id),
      vendor,
      referenceNumber,
      status,
      addedBy: userName,
      orderDate: formattedPurchaseDate,
      payTermNumber,
      payTermType,
      location,
      totalItems: totalUnits,
      netTotalAmount: finalPurchaseAmount,
      discountType,
      discountAmount: parseFloat(discountAmount) || 0,
      purchaseTax,
      taxAmount: taxOnSubtotal || 0,
      additionalNotes,
      purchaseDIItem,
      shippingDIDetails,
      stockTransactions,
    };
    console.log(payload);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/purchase-di-order/update/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert("Purchase DI Order Updated Successfully");
        navigate("/ListDIPurchase");
      } else {
        alert("Failed to update purchase order");
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      alert("An error occurred while updating the purchase order.");
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading">Edit DI Purchase</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Card */}
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="row">
                    {/* Vendor Dropdown */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Vendor</label>
                        <select
                          className="form-select"
                          value={vendor}
                          onChange={(e) => setVendor(e.target.value)}
                          required
                        >
                          <option value="">Please Select</option>
                          {vendorlist.map((vendorItem) => (
                            <option key={vendorItem.id} value={vendorItem.name}>
                              {vendorItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Reference No */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Invoice No*</label>
                        <input
                          type="text"
                          className="form-control rounded"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Added By */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Added By*</label>
                        <input
                          type="text"
                          className="form-control rounded"
                          value={addedBy}
                          onChange={(e) => setAddedBy(e.target.value)}
                          required
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Purchase Date</label>
                        <DatePicker
                          selected={purchaseDate}
                          onChange={(date) => setPurchaseDate(date)}
                          className="form-control"
                          dateFormat="MM/dd/yyyy"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Search and Selection Card */}
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
                          <div className="product-content">
                            <div className="product-main-info">
                              <span className="product-name">
                                {product.productName}
                              </span>
                              <span className="product-sku">{product.sku}</span>
                              <span className="product-type">
                                {product.productType}
                              </span>
                            </div>

                            {product.productType === "VARIABLE" && (
                              <div className="product-variations">
                                {product.productVariations.map((variation) => (
                                  <div
                                    key={variation.id}
                                    className={`variation-item ${
                                      selectedVariations[variation.id]
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={(e) =>
                                      handleVariationSelect(
                                        product,
                                        variation,
                                        e
                                      )
                                    }
                                  >
                                    {variation.variationValue}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="table-responsive mt-3">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Unit Cost</th>
                            <th>Discount %</th>
                            <th>Unit After Discount</th>
                            <th>Subtotal</th>
                            <th>Tax Rate</th>
                            <th>Tax Amount</th>
                            <th>Line Total</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product, index) => {
                            const unitCostBeforeDiscount =
                              parseFloat(product.defaultPurchasePriceExcTax) ||
                              0;
                            const discountPercent =
                              parseFloat(product.discountPercent) || 0;
                            const quantity = parseFloat(product.quantity) || 0;
                            const unitCostAfterDiscount =
                              unitCostBeforeDiscount *
                              (1 - discountPercent / 100);
                            const subtotal = unitCostAfterDiscount * quantity;
                            const taxRate = parseFloat(product.taxRate) || 0;
                            const taxAmount = (subtotal * taxRate) / 100;
                            const lineTotal = subtotal + taxAmount;

                            return (
                              <tr
                                key={
                                  product.variationId
                                    ? `${product.id}-${product.variationId}`
                                    : product.id
                                }
                              >
                                <td>{index + 1}</td>
                                <td>
                                  {product.productName} ({product.sku})
                                  {product.variationValue &&
                                    ` - ${product.variationValue}`}
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control no-spinner"
                                    value={product.quantity}
                                    min="1"
                                    onChange={(e) =>
                                      handleQuantityChange(
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
                                    value={unitCostBeforeDiscount}
                                    min="0"
                                    onChange={(e) => {
                                      const value =
                                        parseFloat(e.target.value) || 0;
                                      setSelectedProducts((prev) =>
                                        prev.map((p) =>
                                          p.id === product.id &&
                                          p.variationId === product.variationId
                                            ? {
                                                ...p,
                                                defaultPurchasePriceExcTax:
                                                  value,
                                              }
                                            : p
                                        )
                                      );
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control no-spinner"
                                    value={product.discountPercent}
                                    onChange={(e) => {
                                      handleDiscountChange(
                                        product.id,
                                        product.variationId,
                                        e.target.value
                                      );
                                    }}
                                  />
                                </td>
                                <td>{unitCostAfterDiscount.toFixed(2)}</td>
                                <td>{subtotal.toFixed(2)}</td>
                                <td style={{ width: "200px" }}>
                                  <Select
                                    options={taxOptions}
                                    value={
                                      product.selectedTax || {
                                        value: "",
                                        label: "None",
                                        rate: 0,
                                      }
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
                                    getOptionValue={(option) => option.value}
                                    getOptionLabel={(option) => option.label}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                      }),
                                    }}
                                  />
                                </td>
                                <td>{taxAmount.toFixed(2)}</td>
                                <td>{lineTotal.toFixed(2)}</td>
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
                      </table>
                      <div className="mt-2">
                        <strong>Total Line Total: ₹{totalLineTotal}</strong>
                        <br />
                        <strong>Total Units: {totalUnits}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Type Section */}
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="row">
                    <table className="table border-0">
                      <tbody>
                        <tr>
                          {/* Discount Type Dropdown */}
                          <td className="col-md-3">
                            <div className="form-group">
                              <label htmlFor="discountType">
                                Discount Type
                              </label>
                              <select
                                className="form-control select2"
                                id="discountType"
                                name="discountType"
                                value={discountType}
                                onChange={handleDiscountTypeChange}
                              >
                                <option value="">None</option>
                                <option value="Fixed">Fixed</option>
                                <option value="Percentage">Percentage</option>
                              </select>
                            </div>
                          </td>

                          {/* Discount Amount Input */}
                          <td className="col-md-3">
                            <div className="form-group">
                              <label htmlFor="discount_amount">
                                {discountType === "Percentage"
                                  ? "Discount Percentage (%)"
                                  : "Discount Amount"}
                              </label>

                              {/* Conditionally render the input field */}
                              <input
                                className="form-control input_number"
                                required
                                name="discount_amount"
                                type="text"
                                value={discountAmount}
                                onChange={handleDiscountAmountChange}
                                id="discount_amount"
                                disabled={discountType === ""}
                                placeholder={
                                  discountType === "Percentage"
                                    ? "Enter percentage (e.g., 10)"
                                    : "Enter fixed amount (e.g., 100)"
                                }
                              />
                            </div>
                          </td>

                          {/* Calculated Discount */}
                          <td className="col-md-3">
                            <b>Discount</b> (-)
                            <span
                              id="discount_calculated_amount"
                              className="display_currency"
                            >
                              {discountType === "Percentage" &&
                              discountAmount &&
                              subtotalAmount
                                ? (
                                    (parseFloat(discountAmount) / 100) *
                                    parseFloat(subtotalAmount)
                                  ).toFixed(2)
                                : discountAmount
                                  ? parseFloat(discountAmount).toFixed(2)
                                  : "0.00"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {/* Tax Selection */}
                            <div className="col-md-auto">
                              <div className="form-group">
                                <label>Purchase Tax</label>
                                <Select
                                  options={taxOptions}
                                  value={
                                    taxOptions.find(
                                      (opt) => opt.value === purchaseTax
                                    ) || taxOptions[0] // Default to "None"
                                  }
                                  onChange={handleTaxIdChange}
                                  isClearable={true}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      width: "100%",
                                    }),
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>&nbsp;</td>

                          {/* Calculated Tax Amount */}
                          <td>
                            <b>Tax Amount</b> (+)
                            <span
                              id="tax_calculated_amount"
                              className="display_currency"
                            >
                              {taxOnSubtotal}
                            </span>
                          </td>
                        </tr>
                        {/* Additional Notes */}
                        <tr>
                          <td colSpan="4">
                            <div className="form-group">
                              <label htmlFor="additional_notes">
                                Additional Notes
                              </label>
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
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Shipping Details Card */}
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Shipping Details*</label>
                        <input
                          type="text"
                          className="form-control"
                          value={shippingDetails}
                          onChange={(e) => setShippingDetails(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Shipping Charges*</label>
                        <input
                          type="number"
                          className="form-control no-spinner"
                          min="0"
                          value={shippingCharges}
                          onChange={(e) => setShippingCharges(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-12 text-center">
                      <button
                        type="button"
                        className="btn"
                        style={{ backgroundColor: "#0c4461", color: "white" }}
                        onClick={toggleVisibility}
                      >
                        <i className="fas fa-plus"></i> Add additional expenses{" "}
                        <i
                          className={`fas ${
                            isVisible ? "fa-chevron-up" : "fa-chevron-down"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {isVisible && (
                      <div className="col-md-12 mt-3">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Expense Name</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {additionalExpenses.map((expense, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    className="form-control"
                                    type="text"
                                    value={expense.name}
                                    onChange={(e) =>
                                      handleExpenseChange(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    value={expense.amount}
                                    onChange={(e) =>
                                      handleExpenseChange(
                                        index,
                                        "amount",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="col-md-12 mt-3">
                      <label>Purchase Total:{finalPurchaseAmount}</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-save btn-lg px-4 py-2 m-2 "
                >
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

export default EditDIPurchase;
