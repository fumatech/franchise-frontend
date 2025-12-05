import React, { useState, useEffect } from "react";
import Select from "react-select"; // Import react-select for searchable dropdown
import "./POSInterface.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dropdown, Table } from "react-bootstrap"; // Assuming you are using react-bootstrap for modal and dropdown components.
import { FaUserPlus } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { Modal, Button, Row, Col } from "react-bootstrap";

const POSInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [view, setView] = useState(null); // "category" or "brand"
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Set to null to represent no category selected
  const [selectedBrand, setSelectedBrand] = useState(null); // Set to null to represent no brand selected
  const [showModal, setShowModal] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderTaxType, setOrderTaxType] = useState(""); // Add this line
  const [customers, setCustomers] = useState([]); // State to store fetched customers
  // In your state declarations, keep just:
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(""); // Can be "discount", "orderTax", etc.
  const [editFieldData, setEditFieldData] = useState({});
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState([
    { amount: 0, method: "Cash", account: "None" },
  ]);
  const [purchaseNote, setPurchaseNote] = useState("");
  const [employeeNote, setEmployeeNote] = useState("");
  const [totalDue, setTotalDue] = useState(100);
  const [totalPaid, setTotalPaid] = useState(0);
  const [changeDue, setChangeDue] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(100);
  const [totalItems, setTotalItems] = useState(0); // Initialize with proper value
  const customerOptions = [
    { value: "Walk-in Customer", label: "Walk-in Customer" },
    ...customers.map((customer) => ({
      value: `${customer.firstName} ${customer.lastName}`, // Use name as value
      label: `${customer.firstName} ${customer.lastName}`,
    })),
  ];
  const [totals, setTotals] = useState({
    discount: 0,
    orderTax: 0,
    shipping: 0,
    total: 0,
  });

  const [orderTax, setOrderTax] = useState(totals.orderTax);
  const [shipping, setShipping] = useState(totals.shipping);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  const [chequeNumber, setChequeNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [customTransactionNo, setCustomTransactionNo] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    cardTransactionNumber: "",
    cardType: "",
    cardMonth: "",
    cardYear: "",
    cardSecurity: "",
  });
  // Fetching categories and products dynamically
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const [showTModal, setShowTModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [transactionsData, setTransactionsData] = useState([]); // State to store transactions data
  const [activeTab, setActiveTab] = useState(0); // Tab state (if needed)
  const handleOverlayOpen = () => {
    setShowOverlay(true);
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };
  const toggleCustomerModal = () =>
    setIsCustomerModalVisible(!isCustomerModalVisible);
  const toggleEditModal = () => setIsEditModalVisible(!isEditModalVisible);

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

  useEffect(() => {
    axios
      .get("${process.env.REACT_APP_BASE_URL}/payment-method/active-names")
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
      .get("${process.env.REACT_APP_BASE_URL}/payment-account/getall")
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
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          "${process.env.REACT_APP_BASE_URL}/customer/getall"
        ); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json(); // Assuming the response is in JSON format
        setCustomers(data); // Set the customer data to state
      } catch (error) {
        console.error("Error fetching customers:", error); // Handle errors
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchAllSell = async () => {
      try {
        const response = await fetch(
          "${process.env.REACT_APP_BASE_URL}/sale/getall"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data);

        // Assuming the data is an array, update the state accordingly
        if (Array.isArray(data)) {
          setTransactionsData(data);
          setActiveTab(0); // Set the first element as the active tab by default
        } else {
          console.error("Fetched data is not an array");
          setTransactionsData([]);
        }
      } catch (error) {
        console.error("Error fetching sell:", error);
        setTransactionsData([]);
      }
    };

    fetchAllSell();
  }, []);
  const toggleModal = () => setIsModalVisible(!isModalVisible); // Function to toggle modal visibility

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "${process.env.REACT_APP_BASE_URL}/categories/getall"
      );
      const data = await response.json();
      console.log(data);
      setCategories(data);
      console.log(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const response = await fetch(
        "${process.env.REACT_APP_BASE_URL}/brands/getall"
      );
      const data = await response.json();
      console.log(data);
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleAddedProduct = (product) => {
    // Check if the product is already in the selectedProducts list
    const existingProduct = selectedProducts.find(
      (p) => p.sku === product.sku && p.variationId === product.variationId
    );

    if (existingProduct) {
      alert("This product is already added.");
      return;
    }

    // Create new product object
    const newProduct = {
      id: product.id,
      productName: product.productName,
      sku: product.sku,
      productSellingPrice: product.sellingPrice || 0,
      variationId: product.variationId || null,
      variationName: product.variationName || "",
      variationValue: product.variationValue || "",
      quantity: 1,
      subtotal: product.sellingPrice || 0,
    };

    // Update the selected products list
    setSelectedProducts((prev) => [...prev, newProduct]);

    // Clear search input and results
    setSearchTerm("");
    setSearchResults([]);
  };

  // useEffect to fetch customers when the component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          "${process.env.REACT_APP_BASE_URL}/customers/getall"
        ); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json(); // Assuming the response is in JSON format
        setCustomers(data); // Set the customer data to state
      } catch (error) {
        console.error("Error fetching customers:", error); // Handle errors
      }
    };

    fetchCustomers();
  }, []); // Empty dependency array means it runs once when the component mounts

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "${process.env.REACT_APP_BASE_URL}/product/getall"
        );
        if (Array.isArray(response.data)) {
          const sortedData = response.data.sort((a, b) => b.id - a.id);

          // Filter products based on selected category and brand
          const filtered = sortedData.filter((product) => {
            const isCategoryMatch = selectedCategory
              ? String(product.category) === String(selectedCategory.id)
              : true;
            const isBrandMatch = selectedBrand
              ? String(product.brand) === String(selectedBrand.id)
              : true;
            return isCategoryMatch && isBrandMatch;
          });

          setFilteredProducts(filtered);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedBrand]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      await searchProducts(value);
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    updateTotals(selectedProducts);
  }, [selectedProducts]);

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/product/search?query=${query}`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        setSearchResults([]);
        return;
      }

      const updatedProducts = data.map((product) => {
        // Extract the default selling price from the first variation
        const sellingPrice = product.productVariations[0]?.defaultSellingPrice;
        return {
          ...product,
          sellingPrice: sellingPrice || "Price not available",
        };
      });

      setSearchResults(updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddProduct = (product) => {
    // Determine if product has variations
    const hasVariations =
      product.productVariations && product.productVariations.length > 0;

    // Extract variation details if available
    const variation = hasVariations ? product.productVariations[0] : {};
    const price = hasVariations
      ? variation.defaultSellingPrice || 0 // Use defaultSellingPrice if available
      : product.defaultSellingPrice || 0; // Use defaultSellingPrice if no variation

    // Check if product (with variation) is already in cart
    const existingProduct = selectedProducts.find(
      (p) => p.sku === product.sku && p.variationId === (variation.id || null)
    );

    if (existingProduct) {
      alert("This product is already added.");
      return;
    }

    // Create new product object (matching `handleAddedProduct`)
    const newProduct = {
      id: product.id,
      productName: product.productName,
      sku: product.sku,
      productSellingPrice: price, // Ensure selling price is set correctly
      variationId: variation.id || null,
      variationName: variation.name || "",
      variationValue: variation.variationValue || "",
      quantity: 1,
      subtotal: price, // Ensure subtotal is calculated correctly
    };

    // Update selected products list
    setSelectedProducts((prev) => [...prev, newProduct]);

    // Clear search input and results
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveFromCart = (product) => {
    setSelectedProducts((prev) =>
      prev.filter(
        (p) => !(p.sku === product.sku && p.variationId === product.variationId)
      )
    );
  };

  const handleQuantityChange = (product, value) => {
    const updatedQuantity = Math.max(value, 1); // Ensure quantity is at least 1
    setSelectedProducts((prev) => {
      const updatedProducts = prev.map((cartItem) =>
        cartItem.sku === product.sku &&
        cartItem.variationId === product.variationId
          ? {
              ...cartItem,
              quantity: updatedQuantity,
              subtotal: updatedQuantity * (cartItem.productSellingPrice || 0), // Ensure price is valid
            }
          : cartItem
      );
      // Recalculate the totals after the quantity is updated
      updateTotals(updatedProducts);
      return updatedProducts;
    });
  };

  const updateTotals = (updatedProducts) => {
    // Calculate the total items and subtotal (before discount)
    const totalItems = updatedProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const subtotal = updatedProducts.reduce(
      (sum, product) => sum + product.subtotal,
      0
    );

    // Apply discount (ensure it's valid)
    let discountAmount = 0;
    if (discountType === "Percentage" && totals.discount > 0) {
      discountAmount = (subtotal * totals.discount) / 100;
    } else if (discountType === "Fixed" && totals.discount > 0) {
      discountAmount = Math.min(totals.discount, subtotal);
    }

    // Apply tax (if any), ensuring it's a percentage
    let taxAmount = 0;
    if (orderTaxType === "VAT") {
      taxAmount = (subtotal - discountAmount) * 0.1; // 10% VAT
    } else if (orderTaxType === "GST") {
      taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST
    } else if (orderTaxType === "CGST") {
      taxAmount = (subtotal - discountAmount) * 0.1; // 10% CGST
    } else if (orderTaxType === "SGST") {
      taxAmount = (subtotal - discountAmount) * 0.08; // 8% SGST
    }

    // Ensure taxAmount is valid
    if (isNaN(taxAmount)) {
      return; // Exit early if taxAmount is invalid
    }

    // Ensure shipping is valid
    const shipping = totals.shipping > 0 ? totals.shipping : 0;

    // Calculate total after discount and tax
    const totalPrice = subtotal - discountAmount + taxAmount + shipping;

    // Ensure totalPrice is valid
    if (isNaN(totalPrice)) {
      return; // Exit early if totalPrice is invalid
    }

    // Update the totals state with the new values
    setTotals((prev) => ({
      ...prev,
      products: totalItems,
      total: totalPrice,
    }));
  };

  const handleTotalsChange = (key, value) => {
    const updatedValue = parseFloat(value) || 0; // Ensure the value is a valid number
    setTotals((prev) => {
      const updatedTotals = { ...prev, [key]: updatedValue };
      // Recalculate totals when discount or tax is changed
      updateTotals(selectedProducts); // Pass selected products to recalculate the totals
      return updatedTotals;
    });
  };
  const handleBackClick = () => {
    navigate(`/Dashboard`);
  };
  const handleAdExpence = () => {
    navigate(`/AddExpence`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null); // Clear selected brand when category is selected
    setShowCategoryModal(false); // Close the category modal after selection
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(null); // Clear selected category when brand is selected
    setShowBrandModal(false); // Close the brand modal after selection
  };

  // Add the cancel handler function
  const handleCancel = () => {
    setSelectedProducts([]); // Clears the selected products
    setTotals({
      products: 0,
      total: 0,
      discount: 0,
      orderTax: 0,
      shipping: 0,
    }); // Optionally reset the totals as well
  };

  const handleEditClick = (field) => {
    setFieldToEdit(field); // Set the field to edit
    setIsEditModalVisible(true); // Open the edit modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = () => {
    // Save changes
    if (fieldToEdit === "discount") {
      setTotals({ ...totals, discount: editFieldData.discountAmount });
    } else if (fieldToEdit === "orderTax") {
      setTotals({ ...totals, orderTax: editFieldData.orderTax });
    } else if (fieldToEdit === "shipping") {
      setTotals({ ...totals, shipping: editFieldData.shipping });
    }

    // Close the modal after saving changes
    toggleEditModal();
  };

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    altContactNumber: "",
    landline: "",
    dateOfBirth: "",
    assignedTo: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();

    // Here you would submit the form data, for example:
    fetch("${process.env.REACT_APP_BASE_URL}/customer/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerFormData), // Send the customer form data
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save customer");
        }
        return response.json();
      })
      .then(() => {
        alert("Customer added successfully!");
        toggleCustomerModal(); // Close the modal after successful submission
      })
      .catch((error) => console.error("Error saving customer:", error));
  };
  const openPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
  };

  const addPaymentDetail = () => {
    setPaymentDetails([
      ...paymentDetails,
      { amount: 0, method: "Cash", account: "None" },
    ]);
  };

  const updatePaymentDetail = (index, field, value) => {
    const updatedDetails = [...paymentDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setPaymentDetails(updatedDetails);
  };

  const finalizePayment = () => {
    // Handle payment finalization logic here
    console.log("Payment finalized");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert("Please add products to the sale");
      return;
    }

    // Convert payment method strings to enum values
    const paymentMethodMap = {
      Cash: "CASH",
      Card: "CARD",
      Cheque: "CHEQUE",
      "Bank Transfer": "BANK_TRANSFER",
    };

    // Create payload matching backend entities
    const payload = {
      customer: customer || "Walk-in Customer",
      saleDate: new Date().toISOString().split("T")[0],
      status: "completed",
      discountType: discountType,
      discountAmount: totals.discount,
      orderTax: totals.orderTax,
      shippingCharges: totals.shipping,
      saleAmount: totals.total,
      location: "Fuma", // Add location if required by your business logic
      saleItems: selectedProducts.map((product) => ({
        productId: product.id,
        productName: product.productName,
        productSku: product.sku,
        productVariationId: product.variationId || null,
        quantity: product.quantity,
        unitCostBeforeDiscount: product.productSellingPrice,
        lineTotal: product.subtotal,
        // These fields might need calculation if not available in frontend
        discountPercent: 0, // Set default or calculate
        unitCostAfterDiscount: product.productSellingPrice, // Same as before discount if no discount
        profitMargin: 0, // Calculate if available
        unitSellingPrice: product.productSellingPrice,
      })),
      salePaymentMethod: paymentDetails.map((detail) => {
        const basePayment = {
          methodName: paymentMethodMap[detail.method] || "CASH",
          amount: detail.amount,
          paymentAccount: detail.account,
          paidOn: new Date().toISOString().split("T")[0],
        };

        // Add payment method specific fields
        if (detail.method === "Card") {
          return {
            ...basePayment,
            cardType: cardDetails.cardType,
            cardNumber: cardDetails.cardNumber,
            cardHolderName: cardDetails.cardHolderName,
            cardTransactionNumber: cardDetails.cardTransactionNumber,
            cardMonth: cardDetails.cardMonth,
            cardYear: cardDetails.cardYear,
            cardSecurity: cardDetails.cardSecurity,
          };
        }

        if (detail.method === "Cheque") {
          return {
            ...basePayment,
            chequeNumber: chequeNumber,
          };
        }

        if (detail.method === "Bank Transfer") {
          return {
            ...basePayment,
            bankAccountNumber: bankAccountNumber,
          };
        }

        return basePayment;
      }),
      saleNotes: purchaseNote,
      //shippingDetails: shippingDetails,
      employeeNote: employeeNote,
    };

    try {
      const response = await axios.post(
        "${process.env.REACT_APP_BASE_URL}/sale/save",
        payload
      );

      if (response.status === 200) {
        alert("Sale completed successfully!");
        // Reset all states
        setSelectedProducts([]);
        setTotals({
          discount: 0,
          orderTax: 0,
          shipping: 0,
          total: 0,
        });
        setCustomer("");
        setPurchaseNote("");
        setEmployeeNote("");
        setPaymentDetails([{ amount: 0, method: "Cash", account: "None" }]);
        setCardDetails({
          cardNumber: "",
          cardHolderName: "",
          cardTransactionNumber: "",
          cardType: "",
          cardMonth: "",
          cardYear: "",
          cardSecurity: "",
        });
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      alert(
        `Error saving sale: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="card cardHover rounded-4 border-0">
          <div className="card-body">
            <header className="pos-header row justify-content-between">
              <div className="col-4 header-left">
                <input type="text" placeholder="Location" defaultValue="Fuma" />
              </div>
              <div className="col-6 header-right">
                <button className="icon-btn me-4 " onClick={handleBackClick}>
                  <i class=" text-primary fa-solid fa-backward"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-danger fa-regular fa-rectangle-xmark"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-success fa-solid fa-briefcase"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-success fa-solid fa-calculator"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-danger fa-solid fa-rotate-left"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-primary fa-regular fa-circle-pause"></i>
                </button>
              </div>
              <div className="col-2">
                <button className=" p-2 rounded-4 " onClick={handleAdExpence}>
                  {" "}
                  Add Expence
                </button>
              </div>
            </header>
          </div>
        </div>
        <div className="card cardHover rounded-4 border-0">
          <div className="card-body">
            <div className="row mb-3 d-flex align-products-center">
              <div className="pos-container">
                <div className="row pos-body">
                  {/* Left Section */}
                  <div className="col-6 pos-left">
                    <div
                      className="search-section mb-3"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {/* Dropdown for Walk-in Customer */}
                      <div
                        className="d-flex align-items-center walk-in-customer"
                        style={{ flex: "0 0 33%" }}
                      >
                        <div style={{ flex: 1 }}>
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
                            // ... rest of your styles
                          />
                        </div>
                        <button
                          className="btn btn-primary d-flex align-items-center justify-content-center"
                          style={{
                            height: "38px",
                            width: "38px",
                            borderRadius: "0 5px 5px 0",
                            border: "1px solid #0d6efd",
                            backgroundColor: "#0d6efd",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={toggleCustomerModal}
                        >
                          <FaUserPlus />
                        </button>
                      </div>

                      {/* Search input */}
                      <div
                        className="search-input"
                        style={{ flex: "1", minWidth: "0", width: "100%" }}
                      >
                        <input
                          type="text"
                          className="form-control rounded-5 p-3"
                          placeholder="Enter Product name / SKU / Scan bar code"
                          value={searchTerm}
                          onChange={handleSearch}
                          style={{ width: "100%" }}
                        />
                      </div>

                      {/* Product search dropdown */}
                      {searchTerm && searchResults.length > 0 && (
                        <div
                          className="search-dropdown"
                          style={{
                            position: "absolute",
                            top: "100%", // Ensures dropdown appears just below the input
                            left: 0,
                            width: "100%",
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000, // Ensures dropdown appears above other elements
                          }}
                        >
                          {searchResults.map((product) => (
                            <div
                              className="product-card"
                              key={product.sku}
                              onClick={() => handleAddedProduct(product)}
                              style={{
                                cursor: "pointer",
                                padding: "10px",
                                display: "flex",
                                alignItems: "center",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <div
                                className="product-image-container"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  marginRight: "10px",
                                }}
                              >
                                <img
                                  src={`${process.env.REACT_APP_BASE_URL}${product.productImage}`}
                                  alt={product.productName}
                                  className="product-image"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <div
                                className="product-info"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                {product.productName}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Products Table */}
                    <div
                      style={{
                        flexGrow: 1,
                        maxHeight: "320px",
                        overflowY: "auto",
                      }}
                    >
                      <table className="cart-table table table-borderless">
                        <thead className="border-bottom">
                          <tr>
                            <th className="w-40">Product</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-center">Price inc. tax</th>
                            <th className="text-center">Subtotal</th>
                            <th className="text-center">Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product) => (
                            <tr
                              key={`${product.sku}-${product.variationId}`}
                              className="align-middle"
                            >
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">
                                    {product.productName}
                                  </span>
                                  <div className="text-muted small">
                                    <span>{product.sku}</span>
                                    {product.variationName && (
                                      <span>
                                        {" "}
                                        - {product.variationName} (
                                        {product.variationValue})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-success small">
                                    50.00 Pc(s) in stock
                                  </span>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-products-center justify-content-center">
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-0 d-flex align-products-center justify-content-center"
                                    style={{ width: "28px", height: "28px" }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        product,
                                        product.quantity - 1
                                      )
                                    }
                                    disabled={product.quantity === 1}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    className="form-control text-center mx-2"
                                    style={{ width: "60px" }}
                                    value={product.quantity}
                                    min="1"
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        parseInt(e.target.value) || 1
                                      );
                                      handleQuantityChange(product, value);
                                    }}
                                  />
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-0 d-flex align-products-center justify-content-center"
                                    style={{ width: "28px", height: "28px" }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        product,
                                        product.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="text-center">
                                $
                                {product.productSellingPrice
                                  ? product.productSellingPrice.toFixed(2)
                                  : "0.00"}{" "}
                                <br />
                              </td>
                              <td className="text-center">
                                ${(product.subtotal || 0).toFixed(2)}
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-link text-danger p-0"
                                  onClick={() => handleRemoveFromCart(product)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Section */}
                    <div className="totals-section row mt-4 g-3">
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Items:</span>
                          <span className="fw-bold">{totals.products}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Total:</span>
                          <span className="fw-bold">
                            ${totals.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Discount Section */}
                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Discount</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.discount}
                            onChange={(e) =>
                              handleTotalsChange(
                                "discount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("discount")}
                          >
                            <i className="bi bi-pencil"></i> {/* Pencil icon */}
                          </button>
                        </div>
                      </div>

                      {/* Order Tax Section */}
                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Order Tax</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.orderTax}
                            onChange={(e) =>
                              handleTotalsChange(
                                "orderTax",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("orderTax")}
                          >
                            <i className="bi bi-pencil"></i> {/* Pencil icon */}
                          </button>
                        </div>
                      </div>

                      {/* Shipping Section */}
                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Shipping</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.shipping}
                            onChange={(e) =>
                              handleTotalsChange(
                                "shipping",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("shipping")}
                          >
                            <i className="bi bi-pencil"></i> {/* Pencil icon */}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="col-6 pos-right">
                    <div className="container mx-auto p-4">
                      <div className="row mb-4">
                        <div className="col-6">
                          <Button
                            variant="primary"
                            onClick={() => setShowCategoryModal(true)}
                            className="custom-btn"
                          >
                            <i className="fas fa-th mr-2"></i> Categories
                          </Button>
                        </div>
                        <div className="col-6">
                          <Button
                            variant="primary"
                            onClick={() => setShowBrandModal(true)}
                            className="custom-btn"
                          >
                            <i className="fas fa-tag mr-2"></i> Brands
                          </Button>
                        </div>
                      </div>

                      {/* Category Modal */}
                      {showCategoryModal && (
                        <div className="modal-overlay">
                          <div className="modal-content-right">
                            <div className="modal-header">
                              <h3 className="modal-title">Categories</h3>
                              <button
                                className="close-btn"
                                onClick={() => setShowCategoryModal(false)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="modal-body">
                              <div className="category-grid-container">
                                {/* All Categories button */}
                                <button
                                  className="category-item all-categories"
                                  onClick={() => handleCategorySelect(null)}
                                >
                                  All Categories
                                </button>
                                {/* Loop over categories and display them in a grid */}
                                {categories.length > 0 ? (
                                  categories.map((category) => (
                                    <button
                                      key={category.id}
                                      className="category-item"
                                      onClick={() =>
                                        handleCategorySelect(category)
                                      }
                                    >
                                      {category.categoryName}
                                    </button>
                                  ))
                                ) : (
                                  <p className="no-data">
                                    No categories available
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Brand Modal */}
                      {showBrandModal && (
                        <div className="modal-overlay">
                          <div className="modal-content-right">
                            <div className="modal-header">
                              <h3 className="modal-title">Brands</h3>
                              <button
                                className="close-btn"
                                onClick={() => setShowBrandModal(false)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="modal-body">
                              <div className="grid-container">
                                {/* All Brands button */}
                                <button
                                  className="brand-item all-brands"
                                  onClick={() => handleBrandSelect(null)}
                                >
                                  All Brands
                                </button>
                                {/* Loop over brands and display them in a grid */}
                                {brands.length > 0 ? (
                                  brands.map((brand) => (
                                    <button
                                      key={brand.id}
                                      className="brand-item"
                                      onClick={() => handleBrandSelect(brand)}
                                    >
                                      {brand.brandName}
                                    </button>
                                  ))
                                ) : (
                                  <p className="no-data">No brands available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Grid */}
                      <div className="product-grid">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <div
                              className="product-card"
                              key={product.sku}
                              onClick={() => handleAddProduct(product)}
                            >
                              <div className="product-image-container">
                                <img
                                  src={`${process.env.REACT_APP_BASE_URL}${product.productImage}`}
                                  alt={product.productName}
                                  className="product-image"
                                />
                              </div>
                              <div className="product-info">
                                <div>{product.productName}</div>
                                <div>
                                  Stock: {product.productVariations.length}
                                </div>
                                <div>
                                  Price:{" "}
                                  {(
                                    product.productVariations[0]
                                      ?.defaultSellingPrice || 0
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>
                            No products available for this category or brand
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card cardHover rounded-4 border-0 ">
          <div className="card-body">
            {/* Footer Section */}
            <footer className="pos-footer row justify-content-between align-items-center p-3">
              <div className="footer-left col-2 d-flex flex-column">
                <div className="footer-left col-3 d-flex flex-column">
                  <div className="footer-buttons d-flex gap-3 mb-2">
                    <button
                      className="footer-btn d-flex align-items-center"
                      style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                      <i
                        className="text-info fa-solid fa-briefcase"
                        style={{ fontSize: "16px" }}
                      ></i>
                      <span className="ms-2">Credit Sale</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 col-3">
                <Button
                  className="bg-dark text-light px-4"
                  onClick={openPaymentModal}
                >
                  <i className="fa-solid fa-money-check me-2"></i> Multiple Pay
                </Button>
                <Button
                  className="bg-success text-light px-4"
                  onClick={handleSubmit}
                >
                  <i className="fa-solid fa-money-bill me-2"></i> Submit
                </Button>
                <Button
                  className="bg-danger text-light px-4"
                  onClick={handleCancel}
                >
                  <i className="fa-solid fa-xmark me-2"></i> Cancel
                </Button>
              </div>

              <div className="footer-right col-2 text-end">
                <div className="total-payable">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fs-4 text-success ms-2">
                    {(
                      (totals?.total || 0) -
                      (totals?.discount || 0) +
                      (totals?.orderTax || 0) +
                      (totals?.shipping || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="col-2 text-end">
                <div>
                  {/* Open Modal Button */}
                  <Button
                    className="bg-primary text-light px-4"
                    onClick={toggleModal}
                  >
                    <i className="fa-solid fa-clock me-2"></i> Recent
                    Transactions
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {isModalVisible && (
        <div className="transaction-modal-wrapper">
          <div
            className="transaction-overlay-background"
            onClick={toggleModal}
          ></div>
          <div className="transaction-modal-box">
            <div className="transaction-modal-header">
              <h5>Recent Transactions</h5>
              <Button
                variant="link"
                className="transaction-close-btn"
                onClick={toggleModal}
              >
                &times;
              </Button>
            </div>
            <div className="modal-body">
              <div className="transaction-table-responsive mt-3">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsData.length > 0 ? (
                      transactionsData.map((txn, index) => (
                        <tr key={txn.id}>
                          <td>{index + 1}</td>
                          <td>{txn.customer || "N/A"}</td>
                          <td>${txn.saleAmount}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              <i className="fa-solid fa-pen"></i> Edit
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                            >
                              <i className="fa-solid fa-print"></i> Print
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <i className="fa-solid fa-trash"></i> Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to add customer */}
      {isCustomerModalVisible && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Add a New Contact
                </h5>
                <Button
                  variant="link"
                  className="transaction-close-btn"
                  onClick={toggleCustomerModal}
                >
                  &times;
                </Button>
              </div>
              <div className="modal-body">
                <Form onSubmit={handleCustomerSubmit}>
                  {/* Contact Type Radio Buttons */}
                  <div className="mb-3">
                    <Form.Check
                      inline
                      label="Individual"
                      type="radio"
                      name="contactType"
                      value="individual"
                      onChange={handleCustomerFormChange}
                    />
                    <Form.Check
                      inline
                      label="Business"
                      type="radio"
                      name="contactType"
                      value="business"
                      onChange={handleCustomerFormChange}
                    />
                  </div>

                  {/* Form Fields */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact ID:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Leave empty to autogenerate"
                          name="contactId"
                          value={customerFormData.contactId}
                          onChange={handleCustomerFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Customer Group:</Form.Label>
                        <Form.Select
                          name="customerGroup"
                          value={customerFormData.customerGroup}
                          onChange={handleCustomerFormChange}
                        >
                          <option>None</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Prefix, Name, Mobile, Email */}
                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Prefix:</Form.Label>
                        <Form.Select
                          name="prefix"
                          value={customerFormData.prefix}
                          onChange={handleCustomerFormChange}
                        >
                          <option>Mr</option>
                          <option>Mrs</option>
                          <option>Miss</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={customerFormData.firstName}
                          onChange={handleCustomerFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={customerFormData.lastName}
                          onChange={handleCustomerFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Mobile *</Form.Label>
                        <Form.Control
                          type="text"
                          name="mobileNumber"
                          value={customerFormData.mobileNumber}
                          onChange={handleCustomerFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={customerFormData.email}
                          onChange={handleCustomerFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Assigned to:</Form.Label>
                        <Form.Control
                          type="text"
                          name="assignedTo"
                          value={customerFormData.assignedTo}
                          onChange={handleCustomerFormChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Additional fields and buttons */}
                  <div className="mt-3 d-flex justify-content-end">
                    <Button
                      variant="secondary"
                      onClick={toggleCustomerModal}
                      className="me-2"
                    >
                      Close
                    </Button>
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalVisible && (
        <div className="transaction-modal-wrapper">
          <div
            className="transaction-overlay-background"
            onClick={toggleEditModal}
          ></div>
          <div className="transaction-modal-box">
            <div className="transaction-modal-header">
              <h5>
                Edit{" "}
                {fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}
              </h5>
              <Button
                variant="link"
                className="transaction-close-btn"
                onClick={toggleEditModal}
              >
                &times;
              </Button>
            </div>
            <div className="modal-body">
              {/* Content of the modal */}
              {/* Discount Field */}
              {fieldToEdit === "discount" && (
                <>
                  <div className="mb-3">
                    <label htmlFor="discountType" className="form-label">
                      Discount Type:
                    </label>
                    <Dropdown onSelect={(e) => setDiscountType(e)}>
                      <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {discountType || "Select Type"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="Percentage">
                          Percentage
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="Fixed">
                          Fixed Amount
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  {discountType === "Percentage" && (
                    <div className="mb-3">
                      <label htmlFor="discountAmount" className="form-label">
                        Discount Percentage:
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFieldData.discountAmount}
                        onChange={(e) =>
                          setEditFieldData({
                            ...editFieldData,
                            discountAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}
                  {discountType === "Fixed" && (
                    <div className="mb-3">
                      <label htmlFor="discountAmount" className="form-label">
                        Discount Amount:
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFieldData.discountAmount}
                        onChange={(e) =>
                          setEditFieldData({
                            ...editFieldData,
                            discountAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {/* Order Tax Field */}
              {fieldToEdit === "orderTax" && (
                <div className="mb-3">
                  <label htmlFor="orderTax" className="form-label">
                    Order Tax:
                  </label>
                  <Dropdown onSelect={(e) => setOrderTaxType(e)}>
                    <Dropdown.Toggle variant="success" id="dropdown-tax-type">
                      {orderTaxType || "Select Tax Type"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="VAT">VAT @10%</Dropdown.Item>
                      <Dropdown.Item eventKey="GST">GST @18%</Dropdown.Item>
                      <Dropdown.Item eventKey="CGST">CGST @10%</Dropdown.Item>
                      <Dropdown.Item eventKey="SGST">SGST @8%</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}

              {/* Shipping Field */}
              {fieldToEdit === "shipping" && (
                <div className="mb-3">
                  <label htmlFor="shipping" className="form-label">
                    Shipping:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={editFieldData.shipping}
                    onChange={(e) =>
                      setEditFieldData({
                        ...editFieldData,
                        shipping: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={toggleEditModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`modal fade ${isPaymentModalVisible ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-dark text-light">
              <h5 className="modal-title">Multiple Payment</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closePaymentModal}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Advance Balance:</label> 0.00
                </div>
              </div>
              <div className="row d-flex justify-content-between">
                <div className="col-8">
                  {paymentDetails.map((detail, index) => (
                    <div className="row mb-3" key={index}>
                      <div className="col-md-4">
                        <label>Amount:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={detail.amount}
                          onChange={(e) =>
                            updatePaymentDetail(index, "amount", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Payment Method:</label>

                        <select
                          className="form-control"
                          required
                          id="method"
                          name="method"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="">Select Payment Method</option>
                          {paymentMethods.map((method, index) => (
                            <option key={index} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label>Payment Account:</label>
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
                            <option key={account.id} value={account.id}>
                              {account.accountName} / {account.accountNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      {paymentMethod.toLowerCase().includes("card") && (
                        <>
                          <div className="col-md-4">
                            <div className="form-group">
                              <label htmlFor="cardNumber">Card Number</label>
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
                                Card Holder Name
                              </label>
                              <input
                                className="form-control"
                                id="cardHolderName"
                                name="cardHolderName"
                                placeholder="Card Holder Name"
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
                                value={cardDetails.cardTransactionNumber}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="form-group">
                              <label htmlFor="cardType">Card Type</label>
                              <select
                                className="form-control"
                                id="cardType"
                                name="cardType"
                                value={cardDetails.cardType}
                                onChange={handleInputChange}
                              >
                                <option value="credit">Credit Card</option>
                                <option value="debit">Debit Card</option>
                                <option value="visa">Visa</option>
                                <option value="master">MasterCard</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="form-group">
                              <label htmlFor="cardMonth">Month</label>
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
                      {paymentMethod.includes("cheque") && (
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="chequeNumber">Cheque No.</label>
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
                      {paymentMethod.includes("bank") && (
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
                    </div>
                  ))}

                  <button
                    className="btn btn-link mb-3"
                    onClick={addPaymentDetail}
                  >
                    <i className="fa-solid fa-plus me-2"></i>Add Payment Row
                  </button>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Sell note:</label>
                      <textarea
                        className="form-control"
                        value={purchaseNote}
                        onChange={(e) => setPurchaseNote(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Staff note:</label>
                      <textarea
                        className="form-control"
                        value={employeeNote}
                        onChange={(e) => setEmployeeNote(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="col-md-6 receipt-summary">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Items:</span>
                      <span>{totalItems.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Payable:</span>
                      <span>${totalDue.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Paying:</span>
                      <span>${totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Change Return:</span>
                      <span>${changeDue.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Balance:</span>
                      <span>${remainingBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closePaymentModal}>
                Close
              </button>
              <button className="btn btn-primary" onClick={finalizePayment}>
                Finalize Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
