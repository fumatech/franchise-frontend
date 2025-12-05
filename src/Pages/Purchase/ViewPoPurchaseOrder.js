import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddPurchase.css"; // Ensure this file contains the appropriate styles
import api from "../utils/api";

function ViewPoPurchaseOrder() {
  const { id } = useParams();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const navigate = useNavigate();

  const [vendor, setVendor] = useState("");
  const [orderId, setOrderId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [referenceNumber, setReferenceNumber] = useState("");
  const [purchaseReferenceNumber, setPurchaseReferenceNumber] = useState("");

  const [status, setStatus] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [orderedBy, setOrderedBy] = useState("");

  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [orderDate, setOrderDate] = useState(new Date());

  const [location, setLocation] = useState("");
  const [payTermNumber, setPayTermNumber] = useState("");
  const [payTermType, setPayTermType] = useState("");
  const [file, setFile] = useState(null);
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

  const [chequeNumber, setChequeNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [customTransactionNo, setCustomTransactionNo] = useState("");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactionId, setTransactionId] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    cardTransactionNumber: "",
    cardType: "",
    cardMonth: "",
    cardYear: "",
    cardSecurity: "",
  });

  // Payment method mapping
  const paymentMethodEnum = {
    card: "CARD",
    cheque: "CHEQUE",
    cash: "CASH",
    bank_transfer: "BANK_TRANSFER",
  };

  const [productsData, setProductsData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});

  const [vendorlist, setVendorList] = useState([]);

  const [unitCostBeforeDiscount, setUnitCostBeforeDiscount] = useState("");
  const [unitCostAfterDiscount, setUnitCostAfterDiscount] = useState("");
  const [lineTotal, setLineTotal] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [defaultUnitSellingPrice, setDefaultUitSellingPrice] = useState("");
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0); // New state for total units

  const [totalAmountIncTaxAndDiscount, setTotalAmountIncTaxAndDiscount] =
    useState(0);
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);

  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [taxRates, setTaxRates] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotalAmount, setSubTotalAmount] = useState(0);
  const [totalLineTotal, setTotalLineTotal] = useState(0);
  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
  const [tempTax, setTempTax] = useState("");

  const handleTaxIdChange = (selectedOption) => {
    if (selectedOption === null || selectedOption.value === "") {
      setPurchaseTax(null);
      setTaxAmount(0);
    } else {
      const selectedTaxId = selectedOption.value;
      const selectedTaxRate = selectedOption.rate;

      setPurchaseTax(selectedTaxId);
      setTaxAmount(selectedTaxRate);
    }
  };

  const handleTaxRateChange = (productId, selectedOption) => {
    const taxRateId = selectedOption ? selectedOption.value : null;
    const taxRate = selectedOption ? selectedOption.rate : 0;

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              taxRate, // Update tax rate for calculations
              taxRateId, // Update taxRateId for backend
              selectedTax: selectedOption || null, // Store the full tax option for display purposes
            }
          : product
      )
    );
  };

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

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await api.get(`/purchase-po-order/get/${id}`);
        const purchase = response.data;
        console.log(purchase);

        setVendor(purchase.vendor || "");
        setOrderId(purchase.purchasePoOrderId || "");
        setReferenceNumber(purchase.referenceNumber || "");
        setPurchaseReferenceNumber(purchase.purchaseReferenceNumber || "");
        setStatus(purchase.status || "");
        setOrderedBy(purchase.orderedBy || "");
        setAddedBy(purchase.addedBy || "");
        setOrderDate(purchase.orderDate ? new Date(purchase.orderDate) : null);
        setPurchaseDate(
          purchase.purchaseDate ? new Date(purchase.purchaseDate) : null
        );
        setLocation(purchase.location || "");
        setPayTermNumber(purchase.payTermNumber || 0);
        setPayTermType(purchase.payTermType || "");
        setDiscountType(purchase.discountType || "");
        setDiscountAmount(purchase.discountAmount || 0);

        const matchedPurchaseTaxOption = taxOptions.find(
          (opt) => opt.value == purchase.purchaseTax
        );

        if (matchedPurchaseTaxOption) {
          setPurchaseTax(matchedPurchaseTaxOption.value);
          setTaxAmount(matchedPurchaseTaxOption.rate);
        } else {
          setPurchaseTax(taxOptions[0].value);
          setTaxAmount(taxOptions[0].rate);
        }

        setAdditionalNotes(purchase.additionalNotes);
        setTotalUnits(purchase.totalItems);
        setFinalPurchaseAmount(purchase.netTotalAmount);

        const selectedProducts = purchase.purchasePoItem.map((item) => {
          const matchedTaxOption = taxOptions.find(
            (opt) => opt.value === item.taxRate
          );

          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.productSku,
            quantity: item.quantity,
            defaultPurchasePriceExcTax: item.unitCostBeforeDiscount,
            discountPercent: item.discountPercent,
            taxRate: matchedTaxOption ? matchedTaxOption.rate : 0,
            taxAmount: item.taxAmount,
            profitMargin: item.profitMargin,
            productVariationId: item.productVariationId,
            variationName: item.productVariationName,
            taxRateId: matchedTaxOption ? matchedTaxOption.value : null,
          };
        });

        setSelectedProducts(selectedProducts);
        setSelectedVariations({});
        setProductsData(purchase.purchasePoItem);

        if (
          purchase.shippingPoDetails &&
          purchase.shippingPoDetails.length > 0
        ) {
          const shippingDetail = purchase.shippingPoDetails[0];
          setShippingDetails(shippingDetail.shippingDetails);
          setShippingCharges(shippingDetail.shippingCharges);

          setAdditionalExpenses(
            shippingDetail.additionalExpensesName.map((name, index) => ({
              name,
              amount: shippingDetail.amount[index],
            }))
          );
        }

        if (purchase.transaction && purchase.transaction.length > 0) {
          const transaction = purchase.transaction[0];
          setPaymentMethod(transaction.paymentMethod);
          setPaidOn(new Date(transaction.date));
          setAmount(transaction.amount);
          setSelectedAccount(transaction.paymentAccountId);
          setNote(transaction.note);
        }
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      }
    };

    fetchPurchaseData();
  }, [id, taxOptions]);

  // Function to calculate total additional expenses
  const calculateTotalAdditionalExpenses = () => {
    return additionalExpenses.reduce((total, expense) => {
      const expenseAmount = parseFloat(expense.amount) || 0; // Ensure it's a number
      return total + expenseAmount;
    }, 0);
  };

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

      const profitMargin = parseFloat(product.profitMargin) || 0;
      const profitAmount = productSubtotal * (profitMargin / 100);

      subtotal += productSubtotal;
      totalLineTotal += productLineTotal;
      totalUnits += quantity;
    });

    setSubTotalAmount(subtotal.toFixed(2));
    setTotalLineTotal(totalLineTotal.toFixed(2)); // Add this state if not already defined
    setTotalUnits(totalUnits);

    // Rest of your calculation logic...
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
    taxOptions,
  ]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        const data = await response.json();
        //console.log(data);

        setVendorList(data); // Set the search results
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    // Fetch tax rates
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
      .then((response) => {
        setTaxRates(response.data);

        // Generate tax options
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

  useEffect(() => {
    // Calculate total amount
    const calculatedTotalAmount = selectedProducts
      .reduce((total, product) => {
        const unitCostBeforeDiscount = product.defaultPurchasePriceExcTax || 0;
        const unitCostAfterDiscount =
          unitCostBeforeDiscount * (1 - (product.discountPercent || 0) / 100);
        const defaultSellingPrice =
          unitCostAfterDiscount * (1 + (product.profitMargin || 0) / 100);
        return total + product.quantity * defaultSellingPrice;
      }, 0)
      .toFixed(2);

    // Calculate total units (sum of quantities only)
    const calculatedTotalUnits = selectedProducts.reduce((total, product) => {
      return total + product.quantity;
    }, 0);

    // Update state with calculated values
    setTotalAmount(calculatedTotalAmount);
    setTotalUnits(calculatedTotalUnits); // Set the total units amount
  }, [selectedProducts]);
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

  // Handle quantity change
  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: parseInt(value) } : product
      )
    );
  };

  const handleProfitMarginChange = (productId, newMargin) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, profitMargin: parseFloat(newMargin) }
          : product
      )
    );
  };

  // Handle discount change
  const handleDiscountChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, discountPercent: parseFloat(value) }
          : product
      )
    );
  };

  // Handle removing product from the table
  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("card")) {
      setCardDetails((prev) => ({ ...prev, [name]: value }));
    } else {
      switch (name) {
        case "chequeNumber":
          setChequeNumber(value);
          break;
        case "bankAccountNumber":
          setBankAccountNumber(value);
          break;
        case "customTransactionNo":
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

  const handleExpenseChange = (index, field, value) => {
    setAdditionalExpenses((prevExpenses) => {
      // Create a new array to avoid mutating the original state
      const updatedExpenses = [...prevExpenses];
      // Update the specific field for the given index
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: value,
      };
      return updatedExpenses;
    });
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  // Handle discount type change
  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  // Handle discount amount change
  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
  };

  // Handle additional notes change
  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formattedPurchaseDate = purchaseDate
      ? purchaseDate.toISOString().split("T")[0]
      : null;

    const formattedPaymentDate = paidOn
      ? paidOn.toISOString().split("T")[0]
      : null;

    const paymentMethodEnum = {
      card: "CARD",
      cheque: "CHEQUE",
      cash: "CASH",
      bank_transfer: "BANK_TRANSFER",
    };

    const shippingAllDetails = [
      {
        id: shippingDetails.id, // Include the existing ID for shipping
        shippingDetails: shippingDetails,
        shippingCharges: parseFloat(shippingCharges) || 0,
        additionalExpensesName: additionalExpenses.map(
          (expense) => expense.name
        ),
        amount: additionalExpenses.map(
          (expense) => parseFloat(expense.amount) || 0
        ),
      },
    ];

    const productStocks = selectedProducts.map((item) => ({
      productId: item.productId,
      variationId: item.productVariationId,
      quantity: item.quantity,
      // unitCostBeforeTax: item.unitCostBeforeDiscount,
      // subTotalBeforeTax: item.lineTotal,
      transactionType: "po_purchase",
      date: new Date().toISOString().split("T")[0], // Current date
      note: "Stock updated after PO Purchase", // Optional note
    }));
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
        discountAmount: discountAmount,
        unitCostAfterDiscount: unitCostAfterDiscount,
        lineTotal: lineTotal,
        taxRate: product.taxRateId,
        taxAmount: taxAmount,
        profitMargin: profitMargin,
        profitAmount: profitAmount,
        unitSellingPrice: unitSellingPriceIncTax,
      };
    });

    const payload = {
      id: id,
      purchasePoOrderId: orderId,
      status: status,
      vendor: vendor,
      addedBy: addedBy,
      referenceNumber,
      purchaseReferenceNumber, // Make sure this is set correctly
      orderDate: orderDate,
      purchaseDate: formattedPurchaseDate,
      payTermNumber: payTermNumber,
      payTermType: payTermType,
      location: location,
      totalItems: totalUnits,
      netTotalAmount: parseFloat(finalPurchaseAmount) || 0,
      discountType: discountType,
      discountAmount: parseFloat(discountAmount) || 0,
      purchaseTax: purchaseTax,
      taxAmount: taxOnSubtotal,
      additionalNotes: additionalNotes,
      purchasePoItem: purchaseItems, // Include purchase items here
      stockTransactions: productStocks,
      // Prepare transactions inside purchase order payload
      transaction: [
        {
          // id: transactionId,
          paymentAccountId: selectedAccount, // Ensure correct PaymentAccount ID is passed
          paymentMethod: paymentMethod,
          amount: parseFloat(amount) || 0,
          transactionType: "purchase",
          addedBy: userName,
          note: note || "",
          //  date: formattedPaymentDate,
          vendor: vendor || "",
          chequeNumber: chequeNumber || null,
          cardType: cardDetails.cardType || null,
          cardNumber: cardDetails.cardNumber || null,
          cardHolderName: cardDetails.cardHolderName || null,
          cardTransactionNumber: cardDetails.cardTransactionNumber,
          cardMonth: cardDetails.cardMonth,
          cardYear: cardDetails.cardYear,
          cardSecurity: cardDetails.cardSecurity,
        },
      ],
      shippingPoDetails: [
        {
          id: shippingAllDetails.id, // Ensure ID is correct
          shippingDetails: shippingAllDetails.shippingDetails,
          shippingCharges: shippingAllDetails.shippingCharges,
          additionalExpensesName: shippingAllDetails.additionalExpensesName,
          amount: shippingAllDetails.amount,
        },
      ],
    };

    console.log("Payload:", payload); // Debug the payload
    try {
      const response = await api.put(
        `/purchase-po-order/update/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        alert("Purchase PO Order updated Successfully");
        // navigate("/ListPoPurchaseOrder");
      } else {
        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
        alert("Purchase PO Order Not Saved");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the purchase order.");
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
                  <h1 className="all-heading">View Po Purchase</h1>
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
                      {/* Order ID */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2 d-md-inline">Order ID</label>
                          <input
                            type="text"
                            className="form-control"
                            value={orderId || ""}
                            readOnly
                            placeholder="Order ID"
                          />
                        </div>
                      </div>

                      {/* Reference No */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referenceNumber">
                            Reference No
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="referenceNumber"
                            name="referenceNumber"
                            placeholder="Enter here.."
                            value={referenceNumber}
                            readOnly
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Reference No */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="purchaseReferenceNumber">
                            Invocie No
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="purchaseReferenceNumber"
                            name="purchaseReferenceNumber"
                            placeholder="Enter here.."
                            value={purchaseReferenceNumber}
                            readOnly
                            onChange={(e) =>
                              setPurchaseReferenceNumber(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Order By */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="orderedBy">
                            Ordered By<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="orderedBy"
                            name="orderedBy"
                            value={orderedBy}
                            readOnly
                            onChange={(e) => setOrderedBy(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Added By */}
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
                            value={addedBy}
                            readOnly
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Order Date */}
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="orderDate">Order Date</label>
                          <DatePicker
                            selected={orderDate}
                            readOnly
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            minDate={new Date()} // Prevent past dates
                            popperPlacement="top" // Display the calendar above
                          />
                        </div>
                      </div>

                      {/* Purchase Date */}
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">
                            Purchase Date
                          </label>
                          <DatePicker
                            selected={purchaseDate}
                            readOnly
                            onChange={(date) => setPurchaseDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            minDate={new Date()} // Prevent past dates
                            popperPlacement="top" // Display the calendar above
                          />
                        </div>
                      </div>

                      {/* <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="document">Attach Document:</label>
                          <div className="form-control file-caption kv-fileinput-caption">
                            <div className="file-caption-name">
                              {"Sample Document: predefined_document.pdf"}
                            </div>
                          </div>
                          <p className="help-block">Max File size: 5MB</p>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>

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

                    {selectedProducts.length > 0 && (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Product Name</th>
                              <th>Purchase Quantity</th>
                              <th>Unit Cost (Before Discount)</th>
                              <th>Discount Percent</th>
                              <th>Unit Cost (After Discount)</th>
                              <th>Subtotal</th>
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
                              const discountPercent =
                                parseFloat(product.discountPercent) || 0;
                              const unitCostAfterDiscount =
                                unitCostBeforeDiscount *
                                (1 - discountPercent / 100);
                              const subtotal =
                                unitCostAfterDiscount * product.quantity;
                              const taxRate = parseFloat(product.taxRate) || 0;
                              const taxAmount =
                                (unitCostAfterDiscount *
                                  product.quantity *
                                  taxRate) /
                                100;
                              const lineTotal = subtotal + taxAmount;
                              const profitMargin =
                                parseFloat(product.profitMargin) || 0;
                              const unitSellingPriceIncTax = (
                                unitCostAfterDiscount *
                                (1 + taxRate / 100) *
                                (1 + profitMargin / 100)
                              ).toFixed(2);

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
                                      readOnly
                                      className="no-spinner"
                                      value={product.quantity}
                                      min="1"
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
                                  <td>{unitCostBeforeDiscount.toFixed(2)}</td>
                                  <td>
                                    <input
                                      type="number"
                                      className="no-spinner"
                                      readOnly
                                      min={0}
                                      max={100}
                                      style={{
                                        width: "80px",
                                        padding: "5px",
                                        textAlign: "center",
                                      }}
                                      value={product.discountPercent}
                                      onChange={(e) => {
                                        const value = Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            parseFloat(e.target.value) || 0
                                          )
                                        );
                                        handleDiscountChange(
                                          product.id,
                                          product.variationId,
                                          value
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
                                      isDisabled
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
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div>
                          {/* Subtotal: <strong> ₹{subtotalAmount}</strong>
                          <br /> */}
                          Total Line Total: <strong> ₹{totalLineTotal}</strong>
                          <br />
                          Total Units: <strong> {totalUnits}</strong>
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
                                  readOnly
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
                                  readOnly
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
                                {discountAmount
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
                                    readOnly
                                    onChange={handleTaxIdChange}
                                    isDisabled={true}
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
                                  readOnly
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

                {/* shipping details */}
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
                            className="form-control rounded"
                            id="shippingDetails"
                            name="shippingDetails"
                            placeholder="Enter here.."
                            value={shippingDetails}
                            readOnly
                            onChange={(e) => setShippingDetails(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingCharges">
                            Additional Shipping Charges
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control rounded"
                            id="shippingCharges"
                            name="shippingCharges"
                            placeholder="0"
                            value={shippingCharges}
                            readOnly
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
                          readOnly
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
                          <table className="table table-bordered add-product-price-table table-condensed ">
                            <thead>
                              <tr>
                                <th>Additional Expense Name</th>
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
                                      readOnly
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
                                      className="form-control input_number"
                                      type="text"
                                      value={expense.amount}
                                      readOnly
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

                      <label>Purchase Total:{finalPurchaseAmount}</label>
                    </div>
                  </div>
                </div>

                <div className="container-fluid text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-save btn-lg px-4 py-2 m-2 "
                    onClick={() => navigate("/ListPoPurchaseOrder")} // Update this path to your actual route
                  >
                    Back
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

export default ViewPoPurchaseOrder;
