import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./AddPurchase.css"; // Ensure this file contains the appropriate styles
import axios from "axios";

function EditSaleReturn() {
  const { id: paramId } = useParams(); // Extract `id` from URL
  const [id, setId] = useState(paramId || null); // Initialize `id` with `paramId` or null
  const searchResultsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigate = useNavigate();

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
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    cardTransactionNumber: "",
    cardType: "",
    cardMonth: "",
    cardYear: "",
    cardSecurity: "",
  });

  const [productsData, setProductsData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});

  const [unitCostBeforeDiscount, setUnitCostBeforeDiscount] = useState("");
  const [unitCostAfterDiscount, setUnitCostAfterDiscount] = useState("");
  const [lineTotal, setLineTotal] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [defaultUnitSellingPrice, setDefaultUitSellingPrice] = useState("");
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0); // New state for total units
  const [totalSaleUnits, setTotalSaleUnits] = useState(0); // New state for total units

  const [totalAmountIncTaxAndDiscount, setTotalAmountIncTaxAndDiscount] =
    useState(0);
  const [finalPurchaseAmount, setFinalPurchaseAmount] = useState(0);

  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  const [taxRates, setTaxRates] = useState([]);
  const [taxGroups, setTaxGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [subtotalAmount, setSubTotalAmount] = useState(0);
  const [taxOnSubtotal, setTaxOnsubtotal] = useState(0);
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

  // Handle tax selection change
  // const handleTaxIdChange = (selectedOption) => {
  //   if (selectedOption === null) {
  //     // If the user clears the selection, set the state to null or 0
  //     setPurchaseTax(0); // Clear the tax ID
  //     setTaxAmount(0); // Reset the tax amount to 0
  //   } else {
  //     const selectedTaxRate = selectedOption.rate;
  //     setPurchaseTax(selectedTaxRate); // Set the selected tax ID
  //   }
  // };

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
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              taxRate: selectedOption ? selectedOption.rate : 0,
              selectedTax: selectedOption,
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

      const taxRate = parseFloat(product.taxRate) || 0;
      const taxAmount = (unitCostAfterDiscount * quantity * taxRate) / 100;

      const profitMargin = parseFloat(product.profitMargin) || 0;
      const profitAmount =
        unitCostAfterDiscount * quantity * (profitMargin / 100);

      subtotal += lineTotal + taxAmount + profitAmount;
      totalUnits += quantity;
    });

    setSubTotalAmount(subtotal.toFixed(2));

    // Calculate total discount
    let totalDiscount = 0;
    const discountValue = parseFloat(discountAmount) || 0;

    if (discountType === "Fixed") {
      totalDiscount = Math.min(discountValue, subtotal);
    } else if (discountType === "Percentage") {
      totalDiscount = (subtotal * discountValue) / 100;
    }

    // Tax Calculation (apply tax rate to subtotal after discount)
    const taxAmountOnSubtotal = ((subtotal - totalDiscount) * taxAmount) / 100;
    setTaxOnsubtotal(taxAmountOnSubtotal);

    // Final Amount Calculation (including discount)
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

    setFinalPurchaseAmount(finalAmount.toFixed(2));
  }, [
    selectedProducts,
    discountType,
    discountAmount,
    taxAmount,
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

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/saleReturn/get/${id} `)
      .then((response) => {
        const data = response.data;
        console.log(data);
        // Set header-level details
        // setVendor(data.vendor);
        setOrderId(data.orderId);
        setReferenceNumber(data.referenceNumber);
        setOrderedBy(data.orderedBy);
        setAddedBy(data.addedBy);
        // setOrderDate(new Date(data.orderDate));
        setLocation(data.location);
        setAdditionalNotes(data.additionalNotes);
        setPurchaseReferenceNumber(data.orderRefernceNumber);
        // setOrderDate(new Date(data.orderDate));
        setLocation(data.location);
        setAdditionalNotes(data.additionalNotes);
        setPayTermNumber(data.payTermNumber);
        setPayTermType(data.payTermType || "");
        setShippingCharges(data.shippingCharges);
        setPurchaseDate(data.saleDate);
        setOrderDate(data.orderDate);
        setDiscountType(data.discountType);
        setDiscountAmount(data.discountAmount);
        setPurchaseTax(data.orderTax);
        setTaxAmount(data.taxAmount);

        // Transaction details instead of payment method
        if (data.transaction && data.transaction.length > 0) {
          const transaction = data.transaction[0];
          setPaymentMethod(transaction.paymentMethod);
          setPaidOn(new Date(transaction.date));
          setAmount(transaction.amount);
          // setPaymentAccount(transaction.paymentAccountId);
          setSelectedAccount(transaction.paymentAccountId);

          setNote(transaction.note);
        }

        // Compare using loose equality (==) instead of strict equality (===)
        const matchedPurchaseTaxOption = taxOptions.find(
          (opt) => opt.value == data.saleTax // Loose equality to handle type mismatch
        );

        if (matchedPurchaseTaxOption) {
          // Check if rate is available

          // Set purchaseTax and its rate
          setPurchaseTax(matchedPurchaseTaxOption.value); // Set the selected tax ID
          setTaxAmount(matchedPurchaseTaxOption.rate); // Set the associated tax rate (as taxAmount)
        } else {
          // Default to "None" if no match is found
          setPurchaseTax(taxOptions[0].value); // Default to first option (None)
          setTaxAmount(taxOptions[0].rate); // Default to the rate of "None" (0 rate)
        }

        // Shipping Details
        if (
          data.shippingSaleReturnDetails &&
          data.shippingSaleReturnDetails.length > 0
        ) {
          const shippingDetail = data.shippingSaleReturnDetails[0];
          setShippingDetails(shippingDetail.shippingDetails);
          setShippingCharges(shippingDetail.shippingCharges);

          setAdditionalExpenses(
            shippingDetail.additionalExpensesName.map((name, index) => ({
              name,
              amount: shippingDetail.amount[index],
            }))
          );
        }

        const fetchProductDetails = data.saleReturnItem.map((item) => {
          const matchedTaxOption = taxOptions.find(
            (opt) => opt.value == item.taxRate
          );
          return axios
            .get(`${process.env.REACT_APP_BASE_URL}/product/details`, {
              params: {
                productName: item.productName,
                productVariationId: item.productVariationId,
              },
            })
            .then((response) => {
              const matchedVariation = response.data.productVariations.find(
                (variation) =>
                  variation.id.toString() === item.productVariationId
              );

              const defaultPurchasePriceExcTax =
                item.unitCostBeforeDiscount || 0;
              const quantity = item.quantity || 1; // Default quantity
              const discountPercent = item.discountPercent || 0; // Default discount
              const updatedQuantity = item.quantity || 1;
              const lineTotal = (
                defaultPurchasePriceExcTax *
                updatedQuantity *
                (1 - discountPercent / 100)
              ).toFixed(2); // Line total calculation

              return {
                ...item,
                ...matchedVariation, // Include variation details
                defaultPurchasePriceExcTax,
                quantity,
                updatedQuantity,
                taxRate: matchedTaxOption ? matchedTaxOption.rate : 0,

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
                discountPercent: 0,
                profitMargin: 0,
                lineTotal: 0,
              };
            });
        });
        Promise.all(fetchProductDetails)
          .then((productsWithPrices) => {
            setSelectedProducts(productsWithPrices); // Pre-fill selected products

            // setTotalSaleUnits(totalShippedUnits);
          })
          .catch((error) => {
            console.error("Error resolving product details:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching purchase order data:", error);
      });
  }, [id, taxOptions]);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);

      // Call the API to get the username based on the email
      fetch(`${process.env.REACT_APP_BASE_URL}/user/username?email=${email}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setUserName(data); // Set the username in state
          }
        })
        .catch((error) => console.error("Error fetching username:", error));
    }
  }, []);

  // Function to calculate total additional expenses
  const calculateTotalAdditionalExpenses = () => {
    return additionalExpenses.reduce((total, expense) => {
      const expenseAmount = parseFloat(expense.amount) || 0; // Ensure it's a number
      return total + expenseAmount;
    }, 0);
  };

  useEffect(() => {
    // Calculate total purchase amount
    const calculatedFinalPurchaseAmount = selectedProducts.reduce(
      (total, product) => {
        const unitCostBeforeDiscount =
          parseFloat(product.defaultPurchasePriceExcTax) || 0;
        const discountPercent = parseFloat(product.discountPercent) || 0;
        const profitMargin = parseFloat(product.profitMargin) || 0;

        // Apply discount
        const unitCostAfterDiscount =
          unitCostBeforeDiscount * (1 - discountPercent / 100);

        // Apply profit margin
        const defaultSellingPrice =
          unitCostAfterDiscount * (1 + profitMargin / 100);

        // Multiply by quantity and add to total
        return total + defaultSellingPrice * product.updatedQuantity;
      },
      0
    );

    // Include additional expenses and shipping charges
    const totalAdditionalExpenses = calculateTotalAdditionalExpenses();
    const parsedShippingCharges = parseFloat(shippingCharges) || 0;

    const updatedFinalPurchaseAmount =
      calculatedFinalPurchaseAmount +
      totalAdditionalExpenses +
      parsedShippingCharges;

    // Update state with new final purchase amount
    setFinalPurchaseAmount((prevPurchaseAmount) => {
      const newPurchaseAmount = updatedFinalPurchaseAmount.toFixed(2);
      return prevPurchaseAmount !== newPurchaseAmount
        ? newPurchaseAmount
        : prevPurchaseAmount;
    });
  }, [selectedProducts, shippingCharges, additionalExpenses]);

  useEffect(() => {
    // Calculate total purchase amount
    const calculatedFinalPurchaseAmount = selectedProducts.reduce(
      (total, product) => {
        const unitCostBeforeDiscount =
          parseFloat(product.defaultPurchasePriceExcTax) || 0;
        const discountPercent = parseFloat(product.discountPercent) || 0;
        const profitMargin = parseFloat(product.profitMargin) || 0;

        // Apply discount
        const unitCostAfterDiscount =
          unitCostBeforeDiscount * (1 - discountPercent / 100);

        // Apply profit margin
        const defaultSellingPrice =
          unitCostAfterDiscount * (1 + profitMargin / 100);

        // Multiply by quantity and add to total
        return total + defaultSellingPrice * product.updatedQuantity;
      },
      0
    );

    // Include additional expenses and shipping charges
    const totalAdditionalExpenses = calculateTotalAdditionalExpenses();
    const parsedShippingCharges = parseFloat(shippingCharges) || 0;

    // Apply tax rate to the subtotal
    const taxRate = parseFloat(purchaseTax) || 0;
    const taxAmountOnSubtotal = (calculatedFinalPurchaseAmount * taxRate) / 100;

    const updatedFinalPurchaseAmount =
      calculatedFinalPurchaseAmount +
      totalAdditionalExpenses +
      parsedShippingCharges +
      taxAmountOnSubtotal;

    // Update state with new final purchase amount
    setFinalPurchaseAmount(updatedFinalPurchaseAmount.toFixed(2));
  }, [selectedProducts, shippingCharges, additionalExpenses, purchaseTax]);
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
            updatedQuantity: 1, // Set default quantity
            discountPercent: 0, // Set default discount percent
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

  // Handle quantity change
  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, updatedQuantity: parseInt(value) }
          : product
      )
    );
  };

  // Handle removing product from the table
  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
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

  // Handle tax selection change
  // const handleTaxIdChange = (e) => {
  //   const selectedTaxId = e.target.value;
  //   const taxOptions = e.target.options;
  //   const selectedTaxOption = Array.from(taxOptions).find(
  //     (option) => option.value === selectedTaxId
  //   );
  //   setPurchaseTax(selectedTaxId);
  //   setTaxAmount(selectedTaxOption ? selectedTaxOption.dataset.taxAmount : "0");
  // };

  // Handle additional notes change
  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fallback to current date if purchaseDate is invalid
    const validPurchaseDate =
      purchaseDate instanceof Date && !isNaN(purchaseDate)
        ? purchaseDate
        : new Date();

    // Format dates to ISO string
    const formattedPurchaseDate = validPurchaseDate.toISOString().split("T")[0];
    const formattedPaymentDate = paidOn
      ? paidOn.toISOString().split("T")[0]
      : null;

    // Prepare the shipping details as a list
    const shippingAllDetails = [
      {
        shippingDetails: shippingDetails || "", // Customize if necessary
        shippingCharges: parseFloat(shippingCharges) || 0,
        additionalExpensesName: additionalExpenses.map(
          (expense) => expense.name
        ),
        amount: additionalExpenses.map(
          (expense) => parseFloat(expense.amount) || 0
        ),
      },
    ];

    // Prepare purchase items as a list
    const purchaseItems = selectedProducts.map((product) => ({
      productId: product.id,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.id,
      productVariationName: product.variationName,
      quantity: product.quantity,
      updatedQuantity: product.updatedQuantity,
      unitCostBeforeDiscount: product.defaultPurchasePriceExcTax,
      discountPercent: product.discountPercent,
      unitCostAfterDiscount:
        product.defaultPurchasePriceExcTax -
        (product.defaultPurchasePriceExcTax * product.discountPercent) / 100,
      lineTotal:
        (product.defaultPurchasePriceExcTax -
          (product.defaultPurchasePriceExcTax * product.discountPercent) /
            100) *
        product.updatedQuantity,
      profitMargin: product.profitMargin || 0,
      unitSellingPrice:
        ((product.defaultPurchasePriceExcTax * product.discountPercent) / 100) *
        (1 + product.profitMargin / 100),
    }));

    // Prepare payment methods as a list
    const purchasePoPaymentMethods = [
      {
        paymentMethod: paymentMethod,
        amount: parseFloat(amount) || 0,
        date: paidOn,
        paymentAccountId: paymentAccount || null,
        note: note || null,
        transactionType: "saleReturn",
        cardType: cardDetails.cardType || null,
        cardNumber: cardDetails.cardNumber || null,
        cardHolderName: cardDetails.cardHolderName || null,
        cardExpiryDate:
          cardDetails.cardMonth && cardDetails.cardYear
            ? `${cardDetails.cardMonth}/${cardDetails.cardYear}`
            : null,
      },
    ];

    // Prepare payload with lists
    const payload = {
      orderId: selectedOrderId?.value || "", // Extract the `value` property
      referenceNumber: referenceNumber,
      orderRefernceNumber: purchaseReferenceNumber,
      orderedBy,
      addedBy: userName,
      orderDate,
      saleDate: formattedPurchaseDate,
      payTermNumber,
      payTermType,
      location,
      totalItems: totalUnits,
      totalSaleItems: totalSaleUnits,
      netTotalAmount: finalPurchaseAmount,
      discountType,
      discountAmount: parseFloat(discountAmount) || 0,
      saleTax: purchaseTax,
      taxAmount: taxOnSubtotal,
      additionalNotes,
      saleSoItem: purchaseItems,
      saleSoPaymentMethod: purchasePoPaymentMethods,
      shippingSaleReturnDetails: shippingAllDetails,
      transaction: [
        {
          // id: transactionId,
          paymentAccountId: selectedAccount, // Ensure correct PaymentAccount ID is passed
          paymentMethod: paymentMethod,
          amount: parseFloat(amount) || 0,
          transactionType: "salereturn",

          note: note || "",
          //  date: formattedPaymentDate,
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
    };

    console.log("Payload:", payload); // Debug payload before submitting

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/saleReturn/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const status = 3;

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/updateStatus/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );

        alert("Sale return  Placed Successfully");

        // navigate("/ListSellReturn");
      } else {
        alert("Sale SO Order Not Saved");
      }
    } catch (error) {
      console.error("Error:", error);
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
                  <h1 className="all-heading">Edit Sale return</h1>
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
                        <div>
                          <label className="me-2 d-md-inline">Order Id</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="text"
                              className="form-control rounded"
                              id="orderId"
                              name="orderId"
                              placeholder="Enter here.."
                              value={orderId || ""}
                              readOnly
                            />
                          </div>
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
                            value={userName}
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Order Date */}
                      {/* <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="orderDate">Order Date</label>
                          <DatePicker
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            minDate={new Date()} // Prevent past dates
                            popperPlacement="top" // Display the calendar above
                          />
                        </div>
                      </div> */}

                      {/* Purchase Date */}
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Sale Date</label>
                          <DatePicker
                            selected={purchaseDate}
                            onChange={(date) => setPurchaseDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="dd/MM/yyyy"
                            required
                            minDate={new Date()} // Prevent past dates
                            popperPlacement="top" // Display the calendar above
                          />
                        </div>
                      </div>

                      {/* Pay Term */}
                      <div className="col-md-4">
                        <div className="form-group ">
                          <label htmlFor="pay_term_number">Pay term</label>
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

                      {/* Location */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="location">
                            Location<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="location"
                            name="location"
                            placeholder="Enter here.."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                          />
                        </div>
                      </div>

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
                    <div className="row">
                      <div className="col-md-12">
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
                                  <th>Sale Quantity</th>
                                  <th>Unit Cost</th>
                                  <th>Tax Rate</th>
                                  <th>Tax Amount</th>
                                  <th>Price (Inc. Tax)</th>
                                  <th>Line Total</th>
                                  <th>Line Total (Inc. Tax)</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducts.map((product, index) => {
                                  const unitCostBeforeDiscount =
                                    parseFloat(
                                      product.defaultPurchasePriceExcTax
                                    ) || 0;
                                  const quantity = product.quantity || 1;

                                  // Line Total (After Quantity and Unit Cost)
                                  const lineTotal =
                                    unitCostBeforeDiscount * quantity;

                                  // Tax Calculation (Based on Line Total)
                                  const taxRate = product.taxRate || 0; // Ensure taxRate defaults to 0 if not provided
                                  const taxAmount =
                                    lineTotal * (taxRate / 100) || 0;

                                  // Unit Selling Price Including Tax
                                  const unitSellingPriceIncTax =
                                    unitCostBeforeDiscount *
                                      (1 + taxRate / 100) || 0;

                                  // Line Total with Tax
                                  const lineTotalWithTax =
                                    parseFloat(lineTotal) +
                                      parseFloat(taxAmount) || 0;

                                  return (
                                    <tr key={product.id}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {product.productName} ({product.sku}) (
                                        {product.productVariationId}){" "}
                                        {product.name} {product.variationValue}
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          value={product.quantity}
                                          min="1"
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              product.id,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        {unitCostBeforeDiscount.toFixed(2)}
                                      </td>
                                      <td>
                                        <Select
                                          options={taxOptions}
                                          value={taxOptions.find(
                                            (opt) =>
                                              opt.rate === product.taxRate
                                          )}
                                          onChange={(selected) =>
                                            handleTaxRateChange(
                                              product.id,
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
                                        {unitSellingPriceIncTax.toFixed(2)}
                                      </td>
                                      <td>{lineTotal.toFixed(2)}</td>
                                      <td>{lineTotalWithTax.toFixed(2)}</td>
                                      <td>
                                        <button
                                          type="button"
                                          className="btn btn-danger"
                                          onClick={() =>
                                            handleRemoveProduct(product.id)
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

                            {/* Total Amount Calculation */}
                            <div>Total Amount: ₹{subtotalAmount}</div>

                            {/* Total Units Calculation */}
                            <div className="total-units">
                              <strong>Total Units:</strong> {totalUnits}
                            </div>
                          </div>
                        )}

                        {/* Form submission and other components can go here */}
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
                                  {discountType === "percentage"
                                    ? "Discount Percentage (%)"
                                    : "Discount Amount"}
                                </label>

                                {/* Conditionally render the input field */}
                                <input
                                  className="form-control input_number"
                                  required
                                  name="discount_amount"
                                  type="text" // Ensure numeric input for better accuracy
                                  value={discountAmount}
                                  onChange={handleDiscountAmountChange}
                                  id="discount_amount"
                                  disabled={discountType === ""} // Disable if no discount type is selected
                                  placeholder={
                                    discountType === "percentage"
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
                            {/* Purchase Tax Dropdown */}
                            <td>
                              <div className="col-md-auto">
                                <div>
                                  <label>sale Tax</label>
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
                          {/* Total Purchase Amount 
                          <tr>
                            <b>Total Purchase Amount</b> (+)
                            <span
                              id="total_purchase_amount"
                              className="display_currency"
                            >
                              {totalAmountIncTaxAndDiscount
                                ? parseFloat(
                                    totalAmountIncTaxAndDiscount
                                  ).toFixed(2)
                                : "0.00"}
                            </span>
                          </tr>
                          
                          */}
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

                      <label>Purchase Total:{finalPurchaseAmount}</label>
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
                                      <label htmlFor="amount">Amount</label>
                                      <div className="input-group">
                                        <span className="input-group-text bg-transparent">
                                          <i className="fas fa-money-bill-alt"></i>
                                        </span>
                                        <input
                                          className="form-control"
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
                                  {paymentMethod === "card" && (
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
                                  {paymentMethod === "cheque" && (
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
                                  {paymentMethod === "t" && (
                                    <div className="col-md-12">
                                      <div className="form-group">
                                        <label htmlFor="bankAccountNumber">
                                          Bank Account Number
                                        </label>
                                        <input
                                          className="form-control"
                                          id="bankAccountNumber"
                                          name="bankAccountNumber"
                                          placeholder="Bank Account Number"
                                          type="text"
                                          value={bankAccountNumber}
                                          onChange={handleInputChange}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Custom Payment Details */}
                                  {paymentMethod.startsWith("custom_pay") && (
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
                                      <label htmlFor="note">Payment Note</label>
                                      <textarea
                                        className="form-control"
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
export default EditSaleReturn;
