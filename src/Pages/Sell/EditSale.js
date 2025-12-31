import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Select from "react-select";
import api from "../utils/api";

function EditSale() {
  const navigate = useNavigate();
  const { id } = useParams();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // State hooks for form fields (same as AddSell)
  const [customer, setCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const customerOptions = [
    { value: "Walk-in Customer", label: "Walk-in Customer" },
    { value: "Customer", label: "Customer" },
    ...customers.map((customer) => ({
      value: `${customer.id}`,
      label: `${customer.firstName} ${customer.lastName}`,
    })),
  ];
  const [payTermNumber, setPayTermNumber] = useState("");
  const [payTermType, setPayTermType] = useState("");
  const [saleDate, setSaleDate] = useState(new Date());
  const [status, setStatus] = useState("");
  const [invoiceScheme, setInvoiceScheme] = useState("1");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleTax, setSaleTax] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");

  const [discountType, setDiscountType] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [orderTax, setOrderTax] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  const [shippingDetails, setShippingDetails] = useState("");
  const [shippingCharges, setShippingCharges] = useState(0);
  const [shippingStatus, setShippingStatus] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");

  const [amount, setAmount] = useState("0.00");
  const [paidOn, setPaidOn] = useState("");
  const [method, setMethod] = useState("");
  const [account, setAccount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    cardTransactionNumber: "",
    cardType: "",
    cardMonth: "",
    cardYear: "",
    cardSecurity: "",
  });

  const [chequeNumber, setChequeNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [customTransactionNo, setCustomTransactionNo] = useState("");
  const [note, setNote] = useState("");

  const [additionalExpenses, setAdditionalExpenses] = useState(
    Array(1).fill({ name: "", amount: "0" })
  );
  const [taxRates, setTaxRates] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotalAmount, setSubTotalAmount] = useState(0);
  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
  const [purchaseTax, setPurchaseTax] = useState("");
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalUnitSellingPrice, setTotalUnitSellingPrice] = useState(0);
  const [currentStocks, setCurrentStocks] = useState({});

  // ✅ Fetch sale data on component mount
  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        const response = await api.get(`/sale/get/${id}`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        const saleData = response.data;

        // 🧾 Set basic sale information
        setCustomer(saleData.customer || "");
        setPayTermNumber(saleData.payTermNumber || "");
        setPayTermType(saleData.payTermType || "");
        setSaleDate(
          saleData.saleDate ? new Date(saleData.saleDate) : new Date()
        );
        setStatus(saleData.status || "");
        setInvoiceNo(saleData.invoiceNo || "");
        setDiscountType(saleData.discountType || "");
        setDiscountAmount(saleData.discountAmount || 0);
        setShippingDetails(saleData.shippingDetails || "");
        setShippingCharges(saleData.shippingCharges || "");
        setShippingStatus(saleData.shippingStatus || "");
        setDeliveredTo(saleData.deliveredTo || "");
        setDeliveryPerson(saleData.deliveryPerson || "");
        setFinalPurchaseAmount(saleData.netTotalAmount || 0);
        setTotalUnits(saleData.netTotalUnit || 0);

        // 🧮 Set tax information for main sale
        const matchedSaleTaxOption = taxOptions.find(
          (opt) => opt.value == saleData.saleTax || opt.rate == saleData.saleTax
        );
        if (matchedSaleTaxOption) {
          setPurchaseTax(matchedSaleTaxOption.value);
          setTaxAmount(matchedSaleTaxOption.rate);
        }

        // 📦 Set sale items with automatic tax mapping
        if (saleData.saleItems && saleData.saleItems.length > 0) {
          const items = saleData.saleItems.map((item) => {
            // 🧾 Try to match tax option either by ID or rate
            const matchedTaxOption =
              taxOptions.find(
                (opt) => opt.value == item.taxRate || opt.rate == item.taxRate
              ) || null;

            return {
              id: item.productId,
              productId: item.productId,
              productName: item.productName,
              sku: item.productSku,
              variationId: item.productVariationId,
              variationName: item.productVariationName,
              quantity: item.quantity,
              defaultPurchasePriceExcTax: item.unitCostBeforeDiscount,
              taxRate: matchedTaxOption ? matchedTaxOption.rate : 0,
              taxAmount: item.taxAmount || 0,
              selectedTax: matchedTaxOption,
            };
          });

          setSelectedProducts(items);

          // ✅ Track selected variations
          const variations = {};
          items.forEach((item) => {
            if (item.variationId) {
              variations[item.variationId] = true;
            } else {
              variations[item.id] = true;
            }
          });
          setSelectedVariations(variations);
        }

        // 💳 Set payment information (if present)
        if (saleData.transaction && saleData.transaction.length > 0) {
          const transaction = saleData.transaction[0];
          setPaymentMethod(transaction.paymentMethod || "");
          //setAmount(transaction.amount || 0);
          // setPaidOn(transaction.date ? new Date(transaction.date) : new Date());
          setSelectedAccount(transaction.paymentAccountId || "");
          //setNote(transaction.note || "");
        }
      } catch (error) {
        console.error("❌ Error fetching sale data:", error);
      }
    };

    fetchSaleData();
  }, [id, taxOptions]);

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

  const updateProductStocks = async () => {
    const stockPromises = selectedProducts.map(async (product) => {
      const stock = await fetchCurrentStock(
        product.productId,
        product.variationId || null
      );
      return { id: product.id, stock };
    });

    const stocks = await Promise.all(stockPromises);
    const newStocks = {};
    stocks.forEach(({ id, stock }) => {
      newStocks[id] = stock;
    });
    setCurrentStocks(newStocks);
  };

  useEffect(() => {
    if (selectedProducts.length > 0) {
      updateProductStocks();
    }
  }, [selectedProducts]);

  // // Fetch tax rates
  // useEffect(() => {
  //   axios
  //     .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
  //     .then((response) => {
  //       setTaxRates(response.data);
  //     })
  //     .catch((error) => console.error("Error fetching tax rates:", error));
  // }, []);

  // useEffect(() => {
  //   const rateOptions = [
  //     { value: "", label: "None", rate: 0 },
  //     ...taxRates.map((rate) => ({
  //       value: rate.id,
  //       label: `${rate.taxName} (${rate.taxValue}%)`,
  //       rate: rate.taxValue,
  //     })),
  //   ];
  //   setTaxOptions(rateOptions);
  // }, [taxRates]);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
      .then((response) => {
        setTaxRates(response.data);
        // Immediately create options when data is received
        const rateOptions = [
          { value: "", label: "None", rate: 0 },
          ...response.data.map((rate) => ({
            value: rate.id,
            label: `${rate.taxName} (${rate.taxValue}%)`,
            rate: rate.taxValue,
          })),
        ];
        setTaxOptions(rateOptions);
      })
      .catch((error) => console.error("Error fetching tax rates:", error));
  }, []);
  // Fetch payment methods
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/payment-method/active-names`)
      .then((response) => {
        setPaymentMethods(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payment methods:", error);
      });
  }, []);

  // Fetch payment accounts
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/payment-account/getall`)
      .then((response) => {
        const activeAccounts = response.data.filter(
          (account) => account.status === 1
        );
        setPaymentAccounts(activeAccounts);
      })
      .catch((error) => {
        console.error("Error fetching payment accounts:", error);
      });
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/customer/getall`
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch customers");
        }
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Handle tax rate change - updated to properly handle variations
  const handleTaxRateChange = (productId, variationId, selectedOption) => {
    const taxRateId = selectedOption ? selectedOption.value : null;
    const taxRate = selectedOption ? selectedOption.rate : 0;

    setSelectedProducts((prev) =>
      prev.map((product) => {
        // For products with variations
        if (variationId) {
          if (
            product.productId === productId &&
            product.variationId === variationId
          ) {
            return {
              ...product,
              taxRate,
              taxRateId,
              selectedTax: selectedOption || null,
            };
          }
        }
        // For products without variations
        else if (product.productId === productId && !product.variationId) {
          return {
            ...product,
            taxRate,
            taxRateId,
            selectedTax: selectedOption || null,
          };
        }
        return product;
      })
    );
  };
  // Handle tax selection change for the entire sale
  const handleTaxIdChange = (selectedOption) => {
    if (selectedOption === null) {
      setPurchaseTax(null);
      setTaxAmount(0);
    } else {
      const selectedTaxId = selectedOption.value;
      const selectedTaxRate = selectedOption.rate;
      setPurchaseTax(selectedTaxId);
      setTaxAmount(selectedTaxRate ? selectedTaxRate : 0);
    }
  };

  useEffect(() => {
    let subtotal = 0;
    let totalUnits = 0;

    selectedProducts.forEach((product) => {
      const unitCostBeforeDiscount =
        parseFloat(product.defaultPurchasePriceExcTax) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;
      const quantity = parseFloat(product.quantity) || 0;

      const unitCostAfterDiscount =
        unitCostBeforeDiscount * (1 - discountPercent / 100);
      const lineTotal = unitCostAfterDiscount * quantity;

      const productTaxRate = parseFloat(product.taxRate) || 0;
      const taxAmountPerProduct =
        (unitCostAfterDiscount * quantity * productTaxRate) / 100;

      const profitMargin = parseFloat(product.profitMargin) || 0;
      const profitAmount =
        unitCostAfterDiscount * quantity * (profitMargin / 100);

      subtotal += lineTotal + taxAmountPerProduct + profitAmount;
      totalUnits += quantity;
    });

    setSubTotalAmount(subtotal.toFixed(2));
    console.log("Subtotal before discount:", subtotal);

    // Total Discount Calculation
    let totalDiscount = 0;
    const discountValue = parseFloat(discountAmount) || 0;

    if (discountType === "Fixed") {
      totalDiscount = Math.min(discountValue, subtotal);
    } else if (discountType === "Percentage") {
      totalDiscount = (subtotal * discountValue) / 100;
    }

    console.log("Total Discount:", totalDiscount);

    // ✅ Use taxAmount from state directly
    const globalTaxRate = parseFloat(taxAmount) || 0;
    const taxAmountOnSubtotal =
      ((subtotal - totalDiscount) * globalTaxRate) / 100;
    setTaxOnsubtotal(taxAmountOnSubtotal.toFixed(2));

    // Final Amount
    const shipping = parseFloat(shippingCharges) || 0;
    const additionalExpensesTotal = additionalExpenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );

    const finalAmount =
      subtotal -
      totalDiscount +
      shipping +
      taxAmountOnSubtotal +
      additionalExpensesTotal;

    console.log("Final Amount:", finalAmount);
    setFinalPurchaseAmount(finalAmount.toFixed(2));
  }, [
    selectedProducts,
    discountType,
    discountAmount,
    taxAmount, // ✅ using taxAmount instead of purchaseTax
    shippingCharges,
    additionalExpenses,
  ]);

  // Product search functionality (same as AddSell)
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
          productId: product.id,
          productName: product.productName,
          sku: product.sku,
          variationId: variation.id,
          variationValue: variation.variationValue,
          variationName: variation.variationValue,
          productVariationId: variation.id,
          defaultPurchasePriceExcTax: variation.defaultPurchasePriceExcTax,
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
  // Handle discount change
  const handleDiscountChange = (id, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        // For regular products (no variation)
        if (!product.variationId && product.id === id) {
          return { ...product, discountPercent: parseFloat(value) || 0 };
        }
        // For variable products (with variation)
        if (
          product.variationId &&
          product.id === id &&
          product.variationId === variationId
        ) {
          return { ...product, discountPercent: parseFloat(value) || 0 };
        }
        return product;
      })
    );
  };
  const handleSalePriceChange = (productId, variationId, newValue) => {
    const updatedProducts = selectedProducts.map((product) => {
      if (product.id === productId && product.variationId === variationId) {
        return {
          ...product,
          defaultPurchasePriceExcTax: newValue,
        };
      }
      return product;
    });
    setSelectedProducts(updatedProducts);
  };
  // Handle quantity change - updated to properly handle variations
  const handleQuantityChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        // For products with variations
        if (variationId) {
          if (
            product.productId === productId &&
            product.variationId === variationId
          ) {
            return { ...product, quantity: parseInt(value) || 0 };
          }
        }
        // For products without variations
        else if (product.productId === productId && !product.variationId) {
          return { ...product, quantity: parseInt(value) || 0 };
        }
        return product;
      })
    );
  };

  // Handle unit cost change - updated to properly handle variations
  const handleUnitCostChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        // For products with variations
        if (variationId) {
          if (
            product.productId === productId &&
            product.variationId === variationId
          ) {
            return {
              ...product,
              defaultPurchasePriceExcTax: parseFloat(value) || 0,
            };
          }
        }
        // For products without variations
        else if (product.productId === productId && !product.variationId) {
          return {
            ...product,
            defaultPurchasePriceExcTax: parseFloat(value) || 0,
          };
        }
        return product;
      })
    );
  };

  //  const handleRemoveProduct = (productId, variationId) => {
  //   setSelectedProducts((prev) =>
  //     prev.filter(
  //       (product) =>
  //         !(product.id === productId && product.variationId === variationId)
  //     )
  //   );
  //   if (variationId) {
  //     setSelectedVariations((prev) => ({ ...prev, [variationId]: false }));
  //   } else {
  //     setSelectedVariations((prev) => ({ ...prev, [productId]: false }));
  //   }
  // };

  // Handle form submission for editing
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check stock levels before submitting
    const outOfStockItems = selectedProducts.filter((product) => {
      const currentStock = currentStocks[product.id] || 0;
      return product.quantity > currentStock;
    });

    if (outOfStockItems.length > 0) {
      alert(`Some items exceed available stock. Please adjust quantities.`);
      return;
    }

    const saleItems = selectedProducts.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.variationId || null,
      productVariationName: product.variationName || null,
      quantity: product.quantity,
      taxRate: product.taxRate || 0,
      taxAmount: product.taxAmount || 0,
      unitCostBeforeDiscount: product.defaultPurchasePriceExcTax,
      lineTotal: product.defaultPurchasePriceExcTax * product.quantity,
      unitSellingPrice: product.defaultPurchasePriceExcTax,
    }));
    const stockTransactions = saleItems.map((item) => ({
      productId: item.productId,
      variationId: item.productVariationId || null,
      price: parseFloat(item.unitSellingPrice), // ✅ CORRECT VALUE
      quantity: item.quantity,
      transactionType: "sale",
      date: new Date().toISOString().split("T")[0],
      note: "Stock updated after sale",
    }));

    const payload = {
      customer,
      payTermNumber,
      payTermType,
      saleDate:
        saleDate instanceof Date ? saleDate.toISOString().split("T")[0] : null,
      status,
      invoiceScheme,
      invoiceNo,
      discountType,
      discountAmount: parseFloat(discountAmount) || 0,
      saleTax: purchaseTax,
      taxAmount: taxOnSubtotal,
      shippingDetails,
      shippingCharges: parseFloat(shippingCharges) || 0,
      shippingStatus,
      deliveredTo,
      netTotalAmount: finalPurchaseAmount,
      netTotalUnit: totalUnits,
      deliveryPerson,
      saleItems,
      stockTransaction: stockTransactions,
      transaction: [
        {
          paymentMethod: paymentMethod,
          amount: parseFloat(amount) || 0,
          date: paidOn,
          paymentAccountId: Number(paymentAccount),
          note: note || null,
          transactionType: "sale",
          cardType: cardDetails.cardType || null,
          cardNumber: cardDetails.cardNumber || null,
          cardHolderName: cardDetails.cardHolderName || null,
          cardExpiryDate:
            cardDetails.cardMonth && cardDetails.cardYear
              ? `${cardDetails.cardMonth}/${cardDetails.cardYear}`
              : null,
        },
      ],
    };

    try {
      const response = await api.put(`/sale/update/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Sale updated successfully");
        navigate("/AllSell");
      } else {
        console.error("Error updating sale:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // The rest of the component (JSX) is identical to AddSell.js
  // Only difference is the form title and submit button text
  // Handle discount type change
  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };
  // Handle the changes for Discount Amount
  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
  };
  // Handle additional notes change
  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("card")) {
      setCardDetails((prev) => ({ ...prev, [name]: value }));
    } else {
      switch (name) {
        case "cheque_number":
          setChequeNumber(value);
          break;
        case "bank_account_number":
          setBankAccountNumber(value);
          break;
        case "custom_transaction_no":
          setCustomTransactionNo(value);
          break;
        case "note":
          setNote(value);
          break;
        default:
          break;
      }
    }
  };
  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-md-6">
                  <h1 className="all-heading">Edit Sale</h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form onSubmit={handleSubmit} className="invoice-form">
                {/* Customer Section */}
                <div className="card cardHover rounded-4 border-0">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="customer">Customer:*</label>
                          <Select
                            id="customer"
                            name="customer"
                            options={customerOptions}
                            value={customerOptions.find(
                              (option) => option.value === customer
                            )}
                            onChange={(selectedOption) =>
                              setCustomer(selectedOption.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Pay Term */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="pay_term_number">Pay term:</label>
                          <div className="d-flex">
                            <input
                              className="form-control rounded-start-1 p-3"
                              placeholder="Pay term"
                              type="number"
                              id="pay_term_number"
                              value={payTermNumber}
                              onChange={(e) => setPayTermNumber(e.target.value)}
                            />
                            <select
                              className="form-select border rounded-start-0 rounded-end-1 p-1"
                              value={payTermType}
                              onChange={(e) => setPayTermType(e.target.value)}
                            >
                              <option value="">Please Select</option>
                              <option value="months">Months</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Sale Date */}
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Sale Date:*</label>
                          <DatePicker
                            selected={saleDate}
                            onChange={(date) => setSaleDate(date)}
                            dateFormat="MM/dd/yyyy"
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                          />
                        </div>
                      </div>

                      {/* Invoice No */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="invoice_no">Invoice No.:</label>
                          <input
                            className="form-control py-3 rounded-1"
                            placeholder="Invoice No."
                            type="text"
                            id="invoice_no"
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="card card-default rounded-4 border-0 cardHover ">
                  <div className="card-body ">
                    <div className="row">
                      <div className="col-12 ">
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
                                                  selectedVariations[
                                                    variation.id
                                                  ]
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
                                  <th>#</th>
                                  <th>Product Name</th>
                                  <th>Current Stock</th>
                                  <th>Sale Qty</th>
                                  <th>Unit Cost (Before Discount)</th>
                                  <th>Discount Percent</th>
                                  <th>Unit Cost (After Discount)</th>
                                  <th>Sub Total</th>
                                  <th>Tax Rate</th>
                                  <th>Tax Amount</th>
                                  <th>Line Total</th>
                                  {/* <th>Actions</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducts.map((product, index) => {
                                  const unitCostBeforeDiscount =
                                    parseFloat(
                                      product.defaultPurchasePriceExcTax
                                    ) || 0;
                                  const currentStock =
                                    currentStocks[product.id] || 0;
                                  const discountPercent =
                                    parseFloat(product.discountPercent) || 0;
                                  const quantity =
                                    parseFloat(product.quantity) || 0;

                                  const unitCostAfterDiscount =
                                    unitCostBeforeDiscount *
                                    (1 - discountPercent / 100);
                                  const lineTotal =
                                    unitCostAfterDiscount * quantity;

                                  const taxRate = product.taxRate || 0;
                                  const taxAmount =
                                    (unitCostAfterDiscount *
                                      quantity *
                                      taxRate) /
                                    100;

                                  const unitSellingPriceIncTax = (
                                    unitCostAfterDiscount *
                                    (1 + taxRate / 100)
                                  ).toFixed(2);

                                  return (
                                    <tr key={product.id}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {product.productName} ({product.sku})
                                      </td>
                                      <td>{currentStock}</td>
                                      <td>
                                        <input
                                          type=""
                                          value={product.quantity}
                                          style={{
                                            width: "80px",
                                            padding: "5px",
                                            textAlign: "center",
                                          }}
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
                                          type=""
                                          value={unitCostBeforeDiscount}
                                          style={{
                                            width: "80px",
                                            padding: "5px",
                                            textAlign: "center",
                                          }}
                                          onChange={(e) =>
                                            handleSalePriceChange(
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
                                          style={{
                                            width: "80px",
                                            padding: "5px",
                                            textAlign: "center",
                                          }}
                                          value={product.discountPercent || 0}
                                          onChange={(e) =>
                                            handleDiscountChange(
                                              product.id,
                                              product.variationId,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>

                                      <td>
                                        {unitCostAfterDiscount.toFixed(2)}
                                      </td>
                                      <td>{lineTotal.toFixed(2)}</td>
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
                                        {(lineTotal + taxAmount).toFixed(2)}
                                      </td>
                                      {/* <td>
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
                                      </td> */}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            {/* Total Amount Calculation */}
                            <div>
                              Total Amount: <strong> ₹{subtotalAmount}</strong>
                            </div>

                            {/* Total Units Calculation */}
                            <div className="total-units">
                              Total Units:<strong> {totalUnits}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Discount and Tax Section */}
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <table className="table border-0">
                        <tbody>
                          <tr>
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
                                  onChange={(e) =>
                                    setDiscountType(e.target.value)
                                  }
                                >
                                  <option value="">None</option>
                                  <option value="Fixed">Fixed</option>
                                  <option value="Percentage">Percentage</option>
                                </select>
                              </div>
                            </td>

                            <td className="col-md-3">
                              <div className="form-group">
                                <label htmlFor="discount_amount">
                                  {discountType === "Percentage"
                                    ? "Discount Percentage (%)"
                                    : "Discount Amount"}
                                </label>
                                <input
                                  className="form-control input_number"
                                  required
                                  name="discount_amount"
                                  type="text"
                                  value={discountAmount}
                                  onChange={(e) =>
                                    setDiscountAmount(e.target.value)
                                  }
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

                            <td className="col-md-3">
                              <b>Discount</b> (-)
                              <span
                                id="discount_calculated_amount"
                                className="display_currency text-danger"
                              >
                                {discountType === "Percentage" &&
                                discountAmount ? (
                                  <span>
                                    ₹
                                    {(
                                      (subtotalAmount * discountAmount) /
                                      100
                                    ).toFixed(2)}
                                  </span>
                                ) : (
                                  <span>₹{discountAmount || "0.00"}</span>
                                )}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="col-md-auto">
                                <div className="form-group">
                                  <label>Sale Tax</label>
                                  <Select
                                    options={taxOptions}
                                    value={taxOptions.find(
                                      (opt) => opt.value === purchaseTax
                                    )}
                                    onChange={handleTaxIdChange}
                                    menuPlacement="auto"
                                    menuPortalTarget={document.body}
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
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/*Shipping details */}
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingDetails">
                            Shipping Details
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control py-3 rounded-1"
                            id="shippingDetails"
                            name="shippingDetails"
                            placeholder="Enter here.."
                            value={shippingDetails}
                            onChange={(e) => setShippingDetails(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingCharges">
                            (+) Additional Shipping Charges:
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control py-3 rounded-1"
                            id="shippingCharges"
                            name="shippingCharges"
                            placeholder="0"
                            value={shippingCharges}
                            onChange={(e) => setShippingCharges(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {/* <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingStatus">
                            Shipping Status
                            <span className="text-danger">*</span>
                          </label>
                          <select
                            id="shippingStatus"
                            name="shippingStatus"
                            className="form-control "
                            value={shippingStatus}
                            onChange={(e) => setShippingStatus(e.target.value)}
                            required
                          >
                            <option value="">Select status...</option>
                            <option value="paid">Paid</option>
                            <option value="delayed">Delayed</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </div> */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="deliveredTo">
                            Delivered To
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control py-3 rounded-1"
                            id="deliveredTo"
                            name="deliveredTo"
                            placeholder="Enter name.."
                            value={deliveredTo}
                            onChange={(e) => setDeliveredTo(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="deliveryPerson">
                            Delivery Person
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control py-3 rounded-1"
                            id="deliveryPerson"
                            name="deliveryPerson"
                            placeholder="Enter name.."
                            value={deliveryPerson}
                            onChange={(e) => setDeliveryPerson(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {/* <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingDocuments">
                            Shipping Documents
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control py-3 rounded-1"
                            id="shippingDocuments"
                            name="shippingDocuments"
                            placeholder="Enter document details.."
                            value={shippingDocuments}
                            onChange={(e) =>
                              setShippingDocuments(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div> */}
                      {/* <div className="col-md-12 text-center">
                        <button
                          type="button"
                          className="btn"
                          style={{ backgroundColor: "#0c4461", color: "white" }}
                          onClick={toggleVisibility}
                        >
                          <i className="fas fa-plus"></i> Add additional
                          expenses{" "}
                          <i
                            className={`fas ${
                              isVisible ? "fa-chevron-up" : "fa-chevron-down"
                            }`}
                          ></i>
                        </button>
                      </div>
                      {isVisible && (
                        <div className="col-md-8 col-md-offset-4">
                          <table className="table table-bordered add-product-price-table table-condensed">
                            <thead>
                              <tr>
                                <th>Additional Expense Name</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4].map((i) => (
                                <tr key={i}>
                                  <td>
                                    <input
                                      className="form-control"
                                      type="text"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="form-control input_number"
                                      type="text"
                                      defaultValue="0"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        )} */}
                      <div className="final-amount">
                        Total Purchase Amount:
                        <strong>₹ {finalPurchaseAmount}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ADD payment */}
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="">
                        <h3 className="">Add payment</h3>

                        <div className="">
                          <div className="">
                            <div className="py-2 ">
                              <div className="">
                                {/* <div className="row">
                                               <div className="col-md-12">
                                                 <strong>Advance Balance:</strong>{" "}
                                                 <span id="">0</span>
                                                 <input
                                                   id="advanceBalance"
                                                   data-error-msg="Required advance balance not available"
                                                   name="advanceBalance"
                                                   type="hidden"
                                                 />
                                               </div>
                                             </div> */}
                                <div className="row">
                                  <input type="hidden" className="" value="0" />
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="amount">Amount:*</label>
                                      <div className="input-group">
                                        <div className="input-group-prepend">
                                          <span className="input-group-text bg-transparent">
                                            <i className="fas fa-money-bill-alt  "></i>
                                          </span>
                                        </div>
                                        <input
                                          className="form-control py-3  rounded-right"
                                          required
                                          id="amount"
                                          placeholder="Amount"
                                          name="amount"
                                          type="text"
                                          value={amount}
                                          onChange={(e) =>
                                            setAmount(e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="paidOn">Paid On</label>
                                      <div className="input-group">
                                        <span className="input-group-text bg-transparent">
                                          <i className="fa fa-calendar"></i>
                                        </span>
                                        <DatePicker
                                          className="form-control py-3"
                                          selected={paidOn} // Ensure `paidOn` is a Date object
                                          onChange={(date) => setPaidOn(date)} // Handle date selection
                                          dateFormat="dd MM yyyy" // Set desired format (day month year)
                                          placeholderText="Select paid on date" // Optional placeholder
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="method">
                                        Payment Method
                                      </label>
                                      <div className="input-group">
                                        <span className="input-group-text bg-transparent">
                                          <i className="fas fa-money-bill-alt"></i>
                                        </span>
                                        <select
                                          className="form-control"
                                          required
                                          id="method"
                                          name="method"
                                          value={paymentMethod}
                                          onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                          }
                                        >
                                          <option value="">
                                            Select Payment Method
                                          </option>
                                          {paymentMethods.map(
                                            (method, index) => (
                                              <option
                                                key={index}
                                                value={method}
                                              >
                                                {method}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="account">
                                        Payment Account
                                      </label>
                                      <div className="input-group">
                                        <div className="input-group-prepend">
                                          <span className="input-group-text bg-transparent">
                                            <i className="fas fa-money-bill-alt"></i>
                                          </span>
                                        </div>
                                        <select
                                          className="form-control"
                                          id="account"
                                          name="account_id"
                                          value={selectedAccount}
                                          onChange={(e) => {
                                            setSelectedAccount(e.target.value);
                                            setPaymentAccount(e.target.value); // Send only the ID
                                          }}
                                        >
                                          <option value="">None</option>
                                          {paymentAccounts.map((account) => (
                                            <option
                                              key={account.id}
                                              value={account.id}
                                            >
                                              {account.accountName} /{" "}
                                              {account.accountNumber}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card Details */}
                                  {method === "card" && (
                                    <>
                                      <div className="col-md-4">
                                        <div className="form-group">
                                          <label htmlFor="cardNumber">
                                            Card Number
                                          </label>
                                          <input
                                            className="form-control"
                                            id="cardNumber"
                                            name="cardNumber"
                                            placeholder="Card Number"
                                            type="text"
                                            value={cardDetails.cardNumber}
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-4">
                                        <div className="form-group">
                                          <label htmlFor="cardHolderName">
                                            Card holder name
                                          </label>
                                          <input
                                            className="form-control"
                                            id="cardHolderName"
                                            name="cardHolderName"
                                            placeholder="Card holder name"
                                            type="text"
                                            value={cardDetails.cardHolderName}
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-4">
                                        <div className="form-group">
                                          <label htmlFor="cardTransactionNumber">
                                            Card Transaction No.
                                          </label>
                                          <input
                                            className="form-control"
                                            id="cardTransactionNumber"
                                            name="cardTransactionNumber"
                                            placeholder="Card Transaction No."
                                            type="text"
                                            value={
                                              cardDetails.cardTransactionNumber
                                            }
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="form-group">
                                          <label htmlFor="cardType">
                                            Card Type
                                          </label>
                                          <select
                                            className="form-control"
                                            id="cardType"
                                            name="cardType"
                                            value={cardDetails.cardType}
                                            onChange={handleInputChange}
                                          >
                                            <option value="credit">
                                              Credit Card
                                            </option>
                                            <option value="debit">
                                              Debit Card
                                            </option>
                                            <option value="visa">Visa</option>
                                            <option value="master">
                                              MasterCard
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="form-group">
                                          <label htmlFor="cardMonth">
                                            Month
                                          </label>
                                          <input
                                            className="form-control"
                                            id="cardMonth"
                                            name="cardMonth"
                                            placeholder="Month"
                                            type="text"
                                            value={cardDetails.cardMonth}
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="form-group">
                                          <label htmlFor="cardYear">Year</label>
                                          <input
                                            className="form-control"
                                            id="cardYear"
                                            name="cardYear"
                                            placeholder="Year"
                                            type="text"
                                            value={cardDetails.cardYear}
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="form-group">
                                          <label htmlFor="cardSecurity">
                                            Security Code
                                          </label>
                                          <input
                                            className="form-control"
                                            id="cardSecurity"
                                            name="cardSecurity"
                                            placeholder="Security Code"
                                            type="text"
                                            value={cardDetails.cardSecurity}
                                            onChange={handleInputChange}
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Cheque Details */}
                                  {method === "cheque" && (
                                    <div className="col-md-12">
                                      <div className="form-group">
                                        <label htmlFor="chequeNumber">
                                          Cheque No.
                                        </label>
                                        <input
                                          className="form-control"
                                          id="chequeNumber"
                                          name="chequeNumber"
                                          placeholder="Cheque No."
                                          type="text"
                                          value={chequeNumber}
                                          onChange={handleInputChange}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Bank Transfer Details */}
                                  {method === "bank_transfer" && (
                                    <div className="col-md-12">
                                      <div className="form-group">
                                        <label htmlFor="bankAccountNumber">
                                          Bank Account No
                                        </label>
                                        <input
                                          className="form-control"
                                          id="bankAccountNumber"
                                          name="bankAccountNumber"
                                          placeholder="Bank Account No"
                                          type="text"
                                          value={bankAccountNumber}
                                          onChange={handleInputChange}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Custom Payment Details */}
                                  {method.startsWith("custom_pay") && (
                                    <div className="col-md-12">
                                      <div className="form-group">
                                        <label htmlFor="customTransactionNo">
                                          Transaction No.
                                        </label>
                                        <input
                                          className="form-control"
                                          id="customTransactionNo"
                                          name="customTransactionNo"
                                          placeholder="Transaction No."
                                          type="text"
                                          value={customTransactionNo}
                                          onChange={handleInputChange}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label htmlFor="note">
                                        Payment note:
                                      </label>
                                      <textarea
                                        className="form-control rounded-1"
                                        rows="3"
                                        id="note"
                                        name="note"
                                        cols="50"
                                        value={note}
                                        onChange={handleInputChange}
                                      ></textarea>
                                    </div>
                                  </div>
                                </div>
                                <hr />
                                <div className="row">
                                  <div className="col-sm-12">
                                    <div className="pull-right">
                                      <strong>Payment due:</strong>{" "}
                                      <span id="payment_due">0.00</span>
                                    </div>
                                  </div>
                                </div>
                                <br />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container-fluid text-center mt-3">
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
    </>
  );
}

export default EditSale;
