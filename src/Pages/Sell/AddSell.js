import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Select from "react-select";
import "./AddPurchase.css";
import api from "../utils/api";
import { FaUserPlus } from "react-icons/fa";

function AddSell() {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  // State hooks for form fields
  // Add this state for modal visibility
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customer, setCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const customerOptions = [
    { value: "Walk-in Customer", label: "Walk-in Customer" },
    { value: "Customer", label: "Customer" },
    ...customers.map((customer) => ({
      value: `${customer.id}`, // Use name as value
      label: `${customer.firstName} ${customer.lastName}`,
    })),
  ];
  const [payTermNumber, setPayTermNumber] = useState("");
  const [payTermType, setPayTermType] = useState("");
  const [saleDate, setSaleDate] = useState(new Date());
  const [status, setStatus] = useState("");
  const [invoiceScheme, setInvoiceScheme] = useState("1");
  const [invoiceNo, setInvoiceNo] = useState("");
  // const [file, setFile] = useState(null);
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
  const [totalPrice, setTotalPrice] = useState(0); // Assume a default total price

  const [shippingDetails, setShippingDetails] = useState("");
  const [shippingCharges, setShippingCharges] = useState(0);
  const [shippingStatus, setShippingStatus] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  // const [isVisible, setIsVisible] = useState(false);
  // const [shippingDocuments, setShippingDocuments] = useState("");

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
  useState(0);
  const [taxRates, setTaxRates] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotalAmount, setSubTotalAmount] = useState(0);

  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
  const [purchaseTax, setPurchaseTax] = useState("");
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0); // New state for total units
  const [totalUnitSellingPrice, setTotalUnitSellingPrice] = useState(0);
  const [currentStocks, setCurrentStocks] = useState({});
  const [addCustomer, setAddCustomer] = useState({
    prefix: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    language: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    permanentAddress: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/customer/save`,
        addCustomer,
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert("Customer saved successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer");
    }
  };

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

  useEffect(() => {
    // Fetch tax rates
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
      .then((response) => {
        setTaxRates(response.data);
      })
      .catch((error) => console.error("Error fetching tax rates:", error));
  }, []);

  useEffect(() => {
    const rateOptions = [
      { value: "", label: "None", rate: 0 }, // Default "None" option, value is an empty string
      ...taxRates.map((rate) => ({
        value: rate.id,
        label: `${rate.taxName} (${rate.taxValue}%)`,
        rate: rate.taxValue,
      })),
    ];
    setTaxOptions(rateOptions);
    console.log(taxOptions);
  }, [taxRates]);

  // Fetch payment methods
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/payment-method/active-names`)
      .then((response) => {
        setPaymentMethods(response.data); // Store fetched methods
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
        // Filter active accounts (status === 1)
        const activeAccounts = response.data.filter(
          (account) => account.status === 1
        );
        setPaymentAccounts(activeAccounts);
      })
      .catch((error) => {
        console.error("Error fetching payment accounts:", error);
      });
  }, []);

  const handleTaxRateChange = (productId, variationId, selectedOption) => {
    // If no tax selected, set both taxRate and taxRateId to 0 and null respectively
    const taxRateId = selectedOption ? selectedOption.value : null;
    const taxRate = selectedOption ? selectedOption.rate : 0; // Use rate for calculations

    // Update both the taxRate (for calculations) and taxRateId (for backend)
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? {
              ...product,
              taxRate, // Set tax rate for calculations
              taxRateId, // Set taxRateId for backend
              selectedTax: selectedOption || null, // Store the full tax option for display purposes
            }
          : product
      )
    );
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

  // Add this useEffect to update total units whenever selected products change
  useEffect(() => {
    const newTotalUnits = selectedProducts.reduce(
      (total, product) => total + (product.quantity || 0),
      0
    );
    setTotalUnits(newTotalUnits);
  }, [selectedProducts]);

  // Handle tax selection change
  const handleTaxIdChange = (selectedOption) => {
    if (selectedOption === null) {
      // If the user clears the selection, set the state to null or 0
      setPurchaseTax(null); // Clear the tax ID
      setTaxAmount(0); // Reset the tax amount to 0
    } else {
      const selectedTaxId = selectedOption.value;
      const selectedTaxRate = selectedOption.rate;

      setPurchaseTax(selectedTaxId); // Set the selected tax ID

      // Set the tax rate based on the selected tax option, or 0 if not available
      setTaxAmount(selectedTaxRate ? selectedTaxRate : 0);
    }
  };
  // Handle additional notes change
  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };
  // Function to calculate total additional expenses
  const calculateTotalAdditionalExpenses = () => {
    return additionalExpenses.reduce((total, expense) => {
      const expenseAmount = parseFloat(expense.amount) || 0; // Ensure it's a number
      return total + expenseAmount;
    }, 0);
  };

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

  // Handle adding the product variations to the table
  const handleAddProduct = (product) => {
    // Check if any variation is selected
    const variationsToAdd = product.productVariations.filter(
      (variation) => selectedVariations[variation.id] // Only add selected variations
    );

    if (variationsToAdd.length === 0) {
      alert("Please select at least one variation to add.");
      return;
    }

    // Prevent adding duplicate variations
    const newProducts = variationsToAdd
      .map((variation) => {
        // Check if the variation is already in the selected products
        const isDuplicate = selectedProducts.some(
          (p) => p.id === product.id && p.variationId === variation.id
        );

        // Only add if it's not a duplicate
        if (!isDuplicate) {
          return {
            ...product,
            ...variation, // Spread variation properties into product object
          };
        }
        return null; // Return null for duplicates
      })
      .filter(Boolean); // Remove nulls from the array

    // Add only unique products to the selectedProducts state
    setSelectedProducts((prev) => [...prev, ...newProducts]);
    setSelectedVariations({}); // Clear selected variations after adding

    // Clear search results and reset the search term
    setSearchResults([]);
    setSearchTerm("");
  };

  // Auto-generate invoice number using the current timestamp
  useEffect(() => {
    if (!invoiceNo)
      setInvoiceNo(
        `FUMA-${String(Math.floor(new Date().getTime() / 1000)).padStart(
          3,
          "0"
        )}`
      );
  }, [invoiceNo]);

  const handleMethodChange = (e) => {
    setMethod(e.target.value);
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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Check stock levels before submitting
    const outOfStockItems = selectedProducts.filter((product) => {
      const currentStock = currentStocks[product.id] || 0;
      return product.quantity > currentStock;
    });

    if (outOfStockItems.length > 0) {
      alert(`Some items exceed available stock. Please adjust quantities.`);
      return;
    }

    const purchaseItems = selectedProducts.map((product) => {
      const unitCostBeforeDiscount =
        parseFloat(product.defaultPurchasePriceExcTax) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;

      // Unit Cost after Discount
      const unitCostAfterDiscount =
        unitCostBeforeDiscount * (1 - discountPercent / 100);

      // Line Total (After Discount)
      const lineTotal = unitCostAfterDiscount * product.quantity;

      // Tax Calculation (After Discount)
      const taxRate = parseFloat(product.taxRate) || 0;
      const taxAmount =
        (unitCostAfterDiscount * product.quantity * taxRate) / 100;

      // Profit Margin (Added to Line Total)
      const profitMargin = parseFloat(product.profitMargin) || 0;
      const profitAmount =
        unitCostAfterDiscount * product.quantity * (profitMargin / 100);

      // Line Total with Tax and Profit
      const lineTotalWithTaxAndProfit = lineTotal + taxAmount + profitAmount;

      // Unit Selling Price Including Tax and Profit Margin
      const unitSellingPriceIncTax = (
        unitCostAfterDiscount *
        (1 + taxRate / 100) *
        (1 + profitMargin / 100)
      ).toFixed(2);

      return {
        productId: product.productId,
        productName: product.productName,
        productSku: product.sku,
        productVariationId: product.productVariationId,
        productVariationName: product.variationName,
        quantity: product.quantity,
        unitCostBeforeDiscount: unitCostBeforeDiscount,
        discountPercent: discountPercent,
        // discountAmount: discountAmount,
        unitCostAfterDiscount: unitCostAfterDiscount,
        lineTotal: lineTotal,
        taxRate: product.taxRateId,
        taxAmount: taxAmount,
        profitMargin: profitMargin,
        //  profitAmount: profitAmount,
        unitSellingPrice: unitSellingPriceIncTax,
      };
    });

    const stockTransactions = purchaseItems.map((item) => ({
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
      saleItems: purchaseItems,
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

    console.log("Payload:", payload); // Debugging payload

    try {
      const response = await api.post(`/sale/save`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert("sales saved successfully");

        navigate("/AllSell");
      } else {
        console.error("Error saving sales:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [products, setProducts] = useState([]);

  // Update the selectedProducts dynamically
  useEffect(() => {
    setProducts(selectedProducts);
  }, [selectedProducts]);

  const handleQuantityChange = (id, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        // For regular products (no variation)
        if (!product.variationId && product.id === id) {
          return { ...product, quantity: parseInt(value) || 1 };
        }
        // For variable products (with variation)
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

  // Handle discount type change
  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };
  // Handle the changes for Discount Amount
  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
  };

  // Calculate discount based on discount type
  const calculateDiscount = () => {
    let discountedPrice = totalPrice;

    if (discountType === "fixed") {
      // If it's a fixed amount, simply subtract it from the total
      discountedPrice -= discountAmount;
    } else if (discountType === "percentage") {
      // If it's a percentage, apply the percentage to the total price
      discountedPrice -= (totalPrice * discountAmount) / 100;
    }

    return discountedPrice;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/customer/getall`
        ); // Replace with your actual endpoint

        if (response.status !== 200) {
          throw new Error("Failed to fetch customers");
        }

        setCustomers(response.data); // Set the customer data to state
      } catch (error) {
        console.error("Error fetching customers:", error); // Handle errors
      }
    };

    fetchCustomers();
  }, []);

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-md-6">
                  <h1 className=" all-heading">Add sale</h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form onSubmit={handleSubmit} className="invoice-form">
                <div className="card cardHover rounded-4 border-0">
                  <div className="card-body">
                    <div className="row">
                      {/* Customer */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="customer">Customer:*</label>
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1">
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
                            <button
                              type="button"
                              className="btn btn-light border"
                              onClick={() => setShowCustomerModal(true)}
                              title="Add customer"
                            >
                              <i className="fa fa-plus-circle text-primary fa-lg"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pay Term */}
                      <div className="col-md-4">
                        <div className="form-group ">
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
                              className="form-select border rounded-start-0  rounded-end-1 p-1 "
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
                      <div className="col-md-4 ">
                        <div className="form-group d-flex flex-row  flex-md-column ">
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
                            readOnly={!invoiceNo} // readOnly if auto-generated
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)} // Handle manual input
                          />
                          <p className="help-block">
                            Keep blank to auto-generate, or click the button to
                            increment.
                          </p>
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
                                  <label>Sale Tax</label>
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
                            className="form-control py-3 rounded-1 no-spinner"
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
                      <div>
                        <strong>Total sale amount:</strong> ₹
                        {finalPurchaseAmount}
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
      {/* Overlay Modal for Add Customer */}
      {showCustomerModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content-wrapper"
            style={{
              maxWidth: "100%",
              maxHeight: "90%",
              overflow: "auto",
            }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Customer</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCustomerModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <form onSubmit={handleModalSubmit}>
                    {/* Basic Information */}
                    <h6 className="mb-3">Basic Information</h6>
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Prefix</label>
                        <input
                          type="text"
                          className="form-control"
                          name="prefix"
                          value={addCustomer.prefix}
                          onChange={handleChange}
                          placeholder="Mr/Ms"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={addCustomer.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="col-md-5 mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={addCustomer.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={addCustomer.email}
                          onChange={handleChange}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Mobile Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="mobileNumber"
                          value={addCustomer.mobileNumber}
                          onChange={handleChange}
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>

                    {/* Personal Information */}
                    <h6 className="mt-4 mb-3">Personal Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          name="dateOfBirth"
                          value={addCustomer.dateOfBirth}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          name="gender"
                          value={addCustomer.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Occupation</label>
                        <input
                          type="text"
                          className="form-control"
                          name="occupation"
                          value={addCustomer.occupation}
                          onChange={handleChange}
                          placeholder="Enter occupation"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Language</label>
                        <input
                          type="text"
                          className="form-control"
                          name="language"
                          value={addCustomer.language}
                          onChange={handleChange}
                          placeholder="Enter language"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <h6 className="mt-4 mb-3">Address Details</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={addCustomer.country}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={addCustomer.state}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={addCustomer.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Zip Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zipCode"
                          value={addCustomer.zipCode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Permanent Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        name="permanentAddress"
                        value={addCustomer.permanentAddress}
                        onChange={handleChange}
                        placeholder="Enter permanent address"
                      ></textarea>
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="isActive"
                        value={addCustomer.isActive}
                        onChange={handleChange}
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCustomerModal(false)}
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Customer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddSell;
