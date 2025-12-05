import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddPurchase.css";
import axios from "axios";
import api from "../utils/api";

function AddPoPurchase() {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
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
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalAmountIncTaxAndDiscount, setTotalAmountIncTaxAndDiscount] =
    useState(0);
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [taxRates, setTaxRates] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotalAmount, setSubTotalAmount] = useState(0);
  const [totalLineTotal, setTotalLineTotal] = useState(0);
  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
  const [tempId, setTempId] = useState();
  const [userName, setUserName] = useState("");

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

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/tax/getall`)
      .then((response) => {
        setTaxRates(response.data);
      })
      .catch((error) => console.error("Error fetching tax rates:", error));
  }, []);

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

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      axios
        .get(
          `https://fusionmastertech.com:8443/franchisepurchaseorder/getPoDataById/${selectedOrderId.value}`
        )
        .then((response) => {
          const data = response.data;
          setTempId(data.id);
          setVendor(data.vendor);
          setPurchaseReferenceNumber(data.referenceNumber);
          setOrderedBy(data.addedBy);
          setOrderDate(new Date(data.orderDate));
          setLocation(data.location);
          setAdditionalNotes(data.additionalNotes);

          const fetchProductDetails = data.franchiseOrderItems.map((item) => {
            return axios
              .get(`https://fusionmastertech.com:8443/product/details`, {
                params: {
                  productId: item.productId,
                  productVariationId: item.productVariationId,
                },
              })
              .then((response) => {
                const matchedVariation = response.data.productVariations.find(
                  (variation) =>
                    variation.id.toString() === item.productVariationId
                );

                const defaultPurchasePriceExcTax =
                  matchedVariation?.defaultPurchasePriceExcTax || 0;
                const quantity = item.quantity || 1;
                const originalQuantity = quantity;
                const discountPercent = item.discountPercent || 0;
                const taxrate = item.taxRate || 0;
                const lineTotal = (
                  defaultPurchasePriceExcTax *
                  quantity *
                  (1 - discountPercent / 100)
                ).toFixed(2);
                return {
                  ...item,
                  ...matchedVariation,
                  defaultPurchasePriceExcTax,
                  quantity,
                  originalQuantity,
                  discountPercent,
                  profitMargin: matchedVariation?.profitMargin || 0,
                  lineTotal,
                };
              })
              .catch((error) => {
                console.error("Error fetching product details:", error);
                return {
                  ...item,
                  defaultPurchasePriceExcTax: 0,
                  quantity: item.quantity || 1,
                  originalQuantity: item.quantity || 1,
                  discountPercent: 0,
                  profitMargin: 0,
                  lineTotal: 0,
                };
              });
          });

          Promise.all(fetchProductDetails)
            .then((productsWithPrices) => {
              setSelectedProducts(productsWithPrices);
              const totalAmount = productsWithPrices
                .reduce(
                  (total, product) =>
                    total +
                    product.quantity *
                      product.defaultPurchasePriceExcTax *
                      (1 - product.discountPercent / 100),
                  0
                )
                .toFixed(2);
              const totalUnits = productsWithPrices.reduce(
                (total, product) => total + product.quantity,
                0
              );
              setTotalUnits(totalUnits);
            })
            .catch((error) => {
              console.error("Error resolving product details:", error);
            });
        })
        .catch((error) => {
          console.error("Error fetching purchase order data:", error);
        });
    }
  }, [selectedOrderId]);

  useEffect(() => {
    const fetchShipOrders = async () => {
      try {
        // Get the franchise ID from storage
        const tenantDbName =
          localStorage.getItem("tenantDbName") ||
          sessionStorage.getItem("tenantDbName");
        const franchiseId = tenantDbName?.replace(/^fuma_/, "");

        console.log(franchiseId);

        const response = await axios.get(
          `https://fusionmastertech.com:8443/franchisepurchaseorder/getShipOrders`
        );

        if (response.data && Array.isArray(response.data)) {
          // Filter by franchiseId and status
          const filteredOrders = response.data.filter(
            (order) => order.franchiseId === franchiseId && order.status === 3
          );

          const options = filteredOrders.map((order) => ({
            value: order.franchisePurchaseOrderId,
            label: order.franchisePurchaseOrderId,
            ...order,
          }));

          setOrderId(options);
        } else {
          setOrderId([]);
          console.error("No data or data is not an array");
        }
      } catch (error) {
        console.error("Error fetching shipped orders:", error);
        setOrderId([]);
      }
    };

    fetchShipOrders();
  }, []);

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

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        const data = await response.json();
        setVendorList(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchVendors();
  }, []);

  const calculateTotalAdditionalExpenses = () => {
    return additionalExpenses.reduce((total, expense) => {
      const expenseAmount = parseFloat(expense.amount) || 0;
      return total + expenseAmount;
    }, 0);
  };

  useEffect(() => {
    const newTotalUnits = selectedProducts.reduce(
      (total, product) => total + (product.quantity || 0),
      0
    );
    setTotalUnits(newTotalUnits);
  }, [selectedProducts]);

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
  // product search start

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

  // product search end
  const handleTaxRateChange = (productId, variationId, selectedOption) => {
    const taxRateId = selectedOption ? selectedOption.value : null;
    const taxRate = selectedOption ? selectedOption.rate : 0;

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
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

  // const handleQuantityChange = (productId, variationId, value) => {
  //   setSelectedProducts((prev) =>
  //     prev.map((product) =>
  //       product.id === productId && product.variationId === variationId
  //         ? { ...product, quantity: Math.max(1, parseInt(value) || 1) }
  //         : product
  //     )
  //   );
  // };
  const handleQuantityChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId && product.variationId === variationId) {
          let newQty = parseInt(value) || 1;

          // Prevent increasing beyond actual quantity
          if (newQty > product.originalQuantity) {
            newQty = product.originalQuantity;
          }

          return { ...product, quantity: newQty };
        }
        return product;
      })
    );
  };
  const handleProfitMarginChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? { ...product, profitMargin: value }
          : product
      )
    );
  };

  const handleDiscountChange = (productId, variationId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && product.variationId === variationId
          ? { ...product, discountPercent: value }
          : product
      )
    );
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
      const updatedExpenses = [...prevExpenses];
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

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
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

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format dates
    const formattedPurchaseDate = purchaseDate
      ? purchaseDate.toISOString().split("T")[0]
      : null;
    const formattedOrderDate = orderDate
      ? orderDate.toISOString().split("T")[0]
      : null;
    const formattedPaymentDate = paidOn
      ? paidOn.toISOString().split("T")[0]
      : null;

    // 1. Check for duplicate products
    for (const product of selectedProducts) {
      try {
        const checkResponse = await api.get(
          `${process.env.REACT_APP_BASE_URL}/product/check-exists`,
          {
            params: {
              productId: product.productId,
              variationId: product.productVariationId,
              productName: product.productName,
              variationName: String(product.variationName).trim(), // <-- Ensure it's string
            },
          }
        );

        // if (checkResponse.data === "Product already exists.") {
        //   alert(
        //     `Product "${product.productName}" (${product.variationName}) already exists!`
        //   );
        //   return;
        // }
      } catch (error) {
        console.error("Error checking product:", error);
        alert("Failed to validate product. Please try again.");
        return;
      }
    }

    // 2. Prepare shipping details
    const shippingAllDetails = [
      {
        shippingDetails: shippingDetails || "",
        shippingCharges: parseFloat(shippingCharges) || 0,
        additionalExpensesName: additionalExpenses.map(
          (expense) => expense.name
        ),
        amount: additionalExpenses.map(
          (expense) => parseFloat(expense.amount) || 0
        ),
      },
    ];

    // 3. Prepare product items for purchase order
    const purchaseItems = selectedProducts.map((product) => {
      const unitCostBeforeDiscount =
        parseFloat(product.defaultPurchasePriceExcTax) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;
      const unitCostAfterDiscount =
        unitCostBeforeDiscount * (1 - discountPercent / 100);
      const lineTotal = unitCostAfterDiscount * product.quantity;
      const taxRate = parseFloat(product.taxRate) || 0;
      const taxAmount =
        (unitCostAfterDiscount * product.quantity * taxRate) / 100;
      const profitMargin = parseFloat(product.profitMargin) || 0;
      const profitAmount =
        unitCostAfterDiscount * product.quantity * (profitMargin / 100);
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

    // 4. Prepare stock transactions
    const productStocks = selectedProducts.map((item) => ({
      productId: item.productId,
      variationId: item.productVariationId,
      quantity: item.quantity,
      transactionType: "po_purchase",
      date: new Date().toISOString().split("T")[0],
      note: "Stock updated after PO purchase",
    }));

    // 5. Prepare payment transactions
    const transactions = [
      {
        paymentAccountId: paymentAccount,
        paymentMethod: paymentMethod,
        amount: parseFloat(amount) || 0,
        transactionType: "purchase",
        addedBy: userName,
        note: note || "",
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
    ];

    // // 6. Save new products
    // try {
    //   for (const product of selectedProducts) {
    //     await api.post(`${process.env.REACT_APP_BASE_URL}/product/save`, {
    //       productId: product.productId,
    //       variationId: product.productVariationId,
    //       productName: product.productName,
    //       variationName: product.variationName,
    //       price: product.defaultPurchasePriceExcTax,
    //     });
    //   }
    // } catch (error) {
    //   if (error.response?.status === 409) {
    //     alert("A product already exists. Please refresh and try again.");
    //   } else {
    //     alert("Error saving product details.");
    //   }
    //   return;
    // }

    // 7. Prepare and submit purchase order
    const payload = {
      vendor,
      purchasePoOrderId: selectedOrderId?.value || "",
      referenceNumber: referenceNumber,
      purchaseReferenceNumber: purchaseReferenceNumber,
      status,
      orderedBy,
      addedBy: userName,
      orderDate: formattedOrderDate,
      purchaseDate: formattedPurchaseDate,
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
      purchasePoItem: purchaseItems,
      shippingPoDetails: shippingAllDetails,
      stockTransactions: productStocks,
      transaction: transactions,
    };

    try {
      const response = await api.post(
        `${process.env.REACT_APP_BASE_URL}/purchase-po-order/save`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        await updateOrderStatus(tempId);
        alert("Purchase Order Placed Successfully!");
        navigate("/ListPoPurchaseOrder");
      } else {
        alert("Failed to save purchase order.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("An error occurred while saving the purchase order.");
    }
  };

  const updateOrderStatus = async (tempId) => {
    try {
      const response = await fetch(
        `https://fusionmastertech.com:8443/franchisepurchaseorder/updatePurchaseStatus/${tempId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: 4 }),
        }
      );

      if (response.ok) {
        console.log(`Purchase Order ${tempId} status updated to 4`);
      } else {
        console.error(`Failed to update status for Order ID ${tempId}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
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
                  <h1 className="all-heading">Add Po Purchase</h1>
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
                      {/* Order Id */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2 d--inline">Order ID</label>
                          <Select
                            options={orderId}
                            value={selectedOrderId}
                            onChange={(selected) => {
                              setSelectedProducts([]);
                              setSelectedOrderId(selected);
                              // You might want to load the order details here
                            }}
                            placeholder="Select Shipped Order"
                            isSearchable
                            // isLoading={!orderId.length}
                            noOptionsMessage={() =>
                              "No shipped orders available"
                            }
                          />
                        </div>
                      </div>

                      {/* Reference No */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="purchaseReferenceNumber">
                            Order Reference No
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="form-control rounded"
                            id="purchaseReferenceNumber"
                            name="purchaseReferenceNumber"
                            placeholder="Enter here.."
                            value={purchaseReferenceNumber}
                            onChange={(e) =>
                              setPurchaseReferenceNumber(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Reference No */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referenceNumber">
                            Invoice No<span className="text-danger">*</span>
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
                            onChange={(e) => setOrderedBy(e.target.value)}
                            required
                            readOnly
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
                            value={userEmail}
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Order Date */}
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="orderDate">Order Date</label>
                          <DatePicker
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            readOnly
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
                            onChange={(date) => setPurchaseDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            minDate={new Date()} // Prevent past dates
                            popperPlacement="top" // Display the calendar above
                          />
                        </div>
                      </div>
                      {/* 
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="document">Attach Document</label>
                          <div className="file-input file-input-new">
                            <div className="input-group file-caption-main">
                              <div className="form-control file-caption kv-fileinput-caption">
                                <div className="file-caption-name">
                                  {file ? file.name : "No file chosen"}
                                </div>
                              </div>
                              <div className="input-group-btn">
                                <div className="btn">
                                  <i className=""></i>
                                  &nbsp;
                                  <input
                                    id="upload_document"
                                    accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png"
                                    name="document"
                                    type="file"
                                    onChange={handleFileChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="help-block">Max File size: 5MB</p>
                          </div>
                        </div>
                      </div> */}

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
                    {/* <div className="form-group">
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
                    </div> */}

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
                              {/* <th>Actions</th> */}
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
                                      className="no-spinner"
                                      value={product.quantity}
                                      min="1"
                                      max={product.originalQuantity}
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
                                      type="number"
                                      className="no-spinner"
                                      value={unitCostBeforeDiscount}
                                      min="0"
                                      // step="0.01"
                                      style={{
                                        width: "100px",
                                        padding: "5px",
                                        textAlign: "center",
                                      }}
                                      onChange={(e) => {
                                        const value =
                                          parseFloat(e.target.value) || 0;
                                        setSelectedProducts((prev) =>
                                          prev.map((p) =>
                                            p.id === product.id &&
                                            p.variationId ===
                                              product.variationId
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
                                  </td>{" "}
                                  <td>
                                    <input
                                      type="number"
                                      className="no-spinner"
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
                                  <td>{lineTotal.toFixed(2)}</td>
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
                        <div>
                          Subtotal: <strong> ₹{subtotalAmount}</strong>
                          <br />
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

                {/* Shipping details section */}
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      {/* Shipping Details */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingDetails">
                            Shipping Details{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="shippingDetails"
                            name="shippingDetails"
                            placeholder="Enter here.."
                            value={shippingDetails}
                            onChange={(e) => setShippingDetails(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {/* Shipping Charges Input */}
                      <div className="col-md-4">
                        <div className="form-group ">
                          <label htmlFor="shippingCharges">
                            Shipping Charges
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="form-control no-spinner"
                            value={shippingCharges}
                            onChange={(e) => setShippingCharges(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Final Purchase Total */}
                      <div className="col-md-12 text-center">
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
                      <div className="final-amount">
                        <strong>Total Purchase Amount:</strong> ₹
                        {finalPurchaseAmount}
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

export default AddPoPurchase;
