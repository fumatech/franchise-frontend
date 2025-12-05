import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink } from "react-router-dom";

const Menu = () => {
  const location = useLocation();
  const [sideBarCollapsed, setSideBarCollapsed] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");

  const [openDropdowns, setOpenDropdowns] = useState({
    userManagement: false,
    contact: false,
    product: false,
    purchase: false,
    sell: false,
    stockTransfer: false,
    stockAdjustment: false,
    expenses: false,
    payment: false,
    report: false,
    setting: false,
  });

  useEffect(() => {
    const path = location.pathname;

    // Set dropdown states based on the current path
    setOpenDropdowns({
      userManagement: path.startsWith("/Users") || path.startsWith("/Roles"),
      contact: path.startsWith("/Vendor") || path.startsWith("/Customer"),
      product: path.startsWith("/ListProducts"),
      purchase:
        path.startsWith("/PurchaseOrder") ||
        path.startsWith("/AddPurchaseReturn") ||
        path.startsWith("/ListPurchaseOrder") ||
        path.startsWith("/ReturnPurchase") ||
        path.startsWith("/AddPoPurchase") ||
        path.startsWith("/ListPoPurchaseOrder") ||
        path.startsWith("/AddDIPurchase") ||
        path.startsWith("/ListDIPurchase") ||
        path.startsWith("/ReturnPurchaseList"),
      sell:
        path.startsWith("/AddSell") ||
        path.startsWith("/AllSell") ||
        path.startsWith("/AddSaleReturn") ||
        path.startsWith("/ListSellReturn"),
      stockTransfer:
        path.startsWith("/AddStockTransfer") ||
        path.startsWith("/ListStockTransfer"),
      stockAdjustment:
        path.startsWith("/AddStockAdjustment") ||
        path.startsWith("/ListStockAdjustment") ||
        path.startsWith("/AddWarrantyClaim") ||
        path.startsWith("/ListWarrantyClaim"),
      expenses:
        path.startsWith("/AddExpense") || path.startsWith("/ListExpense"),
      payment:
        path.startsWith("/AccountBook") ||
        path.startsWith("/CashFlow") ||
        path.startsWith("/PaymentAccount") ||
        path.startsWith("/Accounts") ||
        path.startsWith("/PaymentReport") ||
        path.startsWith("/ListPaymentMethod") ||
        path.startsWith("/TrialBalance"),
      report:
        path.startsWith("/PurchaseAndSale") ||
        path.startsWith("/CustomersAndSuppliers") ||
        path.startsWith("/ItemReport") ||
        path.startsWith("/ProductPurchaseReport") ||
        path.startsWith("/ProductSellReport") ||
        path.startsWith("/PurchasePaymentReport") ||
        path.startsWith("/StockAdjustmentReport") ||
        path.startsWith("/StockReport") ||
        path.startsWith("/TaxReport"),
      setting:
        path.startsWith("/taxRate") ||
        path.startsWith("/BusinessDetails") ||
        path.startsWith("/permission"),
    });

    // Set active menu based on current path
    if (path.startsWith("/Users") || path.startsWith("/Roles")) {
      setActiveMenu("userManagement");
    } else if (path.startsWith("/Vendor") || path.startsWith("/Customer")) {
      setActiveMenu("contact");
    } else if (path.startsWith("/ListProducts")) {
      setActiveMenu("product");
    } else if (
      path.startsWith("/PurchaseOrder") ||
      path.startsWith("/AddPurchaseReturn") ||
      path.startsWith("/ListPurchaseOrder") ||
      path.startsWith("/ReturnPurchase") ||
      path.startsWith("/AddPoPurchase") ||
      path.startsWith("/ListPoPurchaseOrder") ||
      path.startsWith("/AddDIPurchase") ||
      path.startsWith("/ListDIPurchase") ||
      path.startsWith("/ReturnPurchaseList")
    ) {
      setActiveMenu("purchase");
    } else if (
      path.startsWith("/AddSell") ||
      path.startsWith("/AllSell") ||
      path.startsWith("/AddSaleReturn") ||
      path.startsWith("/ListSellReturn")
    ) {
      setActiveMenu("sell");
    } else if (
      path.startsWith("/AddStockTransfer") ||
      path.startsWith("/ListStockTransfer")
    ) {
      setActiveMenu("stockTransfer");
    } else if (
      path.startsWith("/AddStockAdjustment") ||
      path.startsWith("/ListStockAdjustment") ||
      path.startsWith("/AddWarrantyClaim") ||
      path.startsWith("/ListWarrantyClaim")
    ) {
      setActiveMenu("stockAdjustment");
    } else if (
      path.startsWith("/AddExpense") ||
      path.startsWith("/ListExpense")
    ) {
      setActiveMenu("expenses");
    } else if (
      path.startsWith("/AccountBook") ||
      path.startsWith("/CashFlow") ||
      path.startsWith("/PaymentAccount") ||
      path.startsWith("/Accounts") ||
      path.startsWith("/PaymentReport") ||
      path.startsWith("/ListPaymentMethod") ||
      path.startsWith("/TrialBalance")
    ) {
      setActiveMenu("payment");
    } else if (
      path.startsWith("/PurchaseAndSale") ||
      path.startsWith("/CustomersAndSuppliers") ||
      path.startsWith("/ItemReport") ||
      path.startsWith("/ProductPurchaseReport") ||
      path.startsWith("/ProductSellReport") ||
      path.startsWith("/PurchasePaymentReport") ||
      path.startsWith("/StockAdjustmentReport") ||
      path.startsWith("/StockReport") ||
      path.startsWith("/TaxReport")
    ) {
      setActiveMenu("report");
    } else if (
      path.startsWith("/taxRate") ||
      path.startsWith("/BusinessDetails") ||
      path.startsWith("/permission")
    ) {
      setActiveMenu("setting");
    } else {
      setActiveMenu("");
    }

    // Set active submenu based on current path
    if (path === "/Users") {
      setActiveSubMenu("Users");
    } else if (path === "/Roles") {
      setActiveSubMenu("Roles");
    } else if (path === "/Vendor") {
      setActiveSubMenu("Vendor");
    } else if (path === "/Customer") {
      setActiveSubMenu("Customer");
    } else if (path === "/ListProducts") {
      setActiveSubMenu("ListProducts");
    } else if (path === "/PurchaseOrder") {
      setActiveSubMenu("PurchaseOrder");
    } else if (path === "/ListPurchaseOrder") {
      setActiveSubMenu("ListPurchaseOrder");
    } else if (path === "/AddPoPurchase") {
      setActiveSubMenu("AddPoPurchase");
    } else if (path === "/ListPoPurchaseOrder") {
      setActiveSubMenu("ListPoPurchaseOrder");
    } else if (path === "/AddDIPurchase") {
      setActiveSubMenu("AddDIPurchase");
    } else if (path === "/ListDIPurchase") {
      setActiveSubMenu("ListDIPurchase");
    } else if (path === "/AddPurchaseReturn") {
      setActiveSubMenu("AddPurchaseReturn");
    } else if (path === "/ReturnPurchaseList") {
      setActiveSubMenu("ReturnPurchaseList");
    } else if (path === "/AddSell") {
      setActiveSubMenu("AddSell");
    } else if (path === "/AllSell") {
      setActiveSubMenu("AllSell");
    } else if (path === "/AddSaleReturn") {
      setActiveSubMenu("AddSaleReturn");
    } else if (path === "/ListSellReturn") {
      setActiveSubMenu("ListSellReturn");
    } else if (path === "/AddStockTransfer") {
      setActiveSubMenu("AddStockTransfer");
    } else if (path === "/ListStockTransfer") {
      setActiveSubMenu("ListStockTransfer");
    } else if (path === "/AddStockAdjustment") {
      setActiveSubMenu("AddStockAdjustment");
    } else if (path === "/ListStockAdjustment") {
      setActiveSubMenu("ListStockAdjustment");
    } else if (path === "/AddWarrantyClaim") {
      setActiveSubMenu("AddWarrantyClaim");
    } else if (path === "/ListWarrantyClaim") {
      setActiveSubMenu("ListWarrantyClaim");
    } else if (path === "/AddExpense") {
      setActiveSubMenu("AddExpense");
    } else if (path === "/ListExpense") {
      setActiveSubMenu("ListExpense");
    } else if (path === "/Accounts") {
      setActiveSubMenu("Accounts");
    } else if (path === "/TrialBalance") {
      setActiveSubMenu("TrialBalance");
    } else if (path === "/CashFlow") {
      setActiveSubMenu("CashFlow");
    } else if (path === "/PaymentReport") {
      setActiveSubMenu("PaymentReport");
    } else if (path === "/ListPaymentMethod") {
      setActiveSubMenu("ListPaymentMethod");
    } else if (path === "/PurchaseAndSale") {
      setActiveSubMenu("PurchaseAndSale");
    } else if (path === "/TaxReport") {
      setActiveSubMenu("TaxReport");
    } else if (path === "/CustomersAndSuppliers") {
      setActiveSubMenu("CustomersAndSuppliers");
    } else if (path === "/StockReport") {
      setActiveSubMenu("StockReport");
    } else if (path === "/StockAdjustmentReport") {
      setActiveSubMenu("StockAdjustmentReport");
    } else if (path === "/ItemReport") {
      setActiveSubMenu("ItemReport");
    } else if (path === "/ProductPurchaseReport") {
      setActiveSubMenu("ProductPurchaseReport");
    } else if (path === "/ProductSellReport") {
      setActiveSubMenu("ProductSellReport");
    } else if (path === "/PurchasePaymentReport") {
      setActiveSubMenu("PurchasePaymentReport");
    } else if (path === "/taxRate") {
      setActiveSubMenu("taxRate");
    } else if (path === "/BusinessDetails") {
      setActiveSubMenu("BusinessDetails");
    } else if (path === "/permission") {
      setActiveSubMenu("permission");
    } else {
      setActiveSubMenu("");
    }
  }, [location]);

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === dropdown ? !prev[key] : false;
        return acc;
      }, {}),
    }));
    setActiveMenu(dropdown);
  };

  const handleSidebarCollapse = () => {
    setSideBarCollapsed((prev) => !prev);
  };

  const getMenuItemClass = (menuName) => {
    return `nav-link p-2 ${activeMenu === menuName ? "active" : ""}`;
  };

  const getSubMenuItemClass = (subMenuName) => {
    return `nav-link ${activeSubMenu === subMenuName ? "active" : ""}`;
  };

  return (
    <div>
      <aside
        className={`main-sidebar sidebar-elevation-1 ${
          sideBarCollapsed ? "sidebar-collapse" : ""
        }`}
      >
        <div className="sidebar p-0">
          <div className="user-panel pt-2 mb-3 d-flex align-content-center justify-content-center">
            <div className="info text-light">
              {/* <Link to="/Dashboard" className="d-block"> */}
              <h4>Franchise</h4>
              {/* </Link> */}
            </div>
          </div>

          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column">
              {/* Samples */}
              {/* <li className="nav-item">
                <a
                  href="#"
                  className="nav-link p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("samples");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                >
                  <i className="fa-brands fa-sellsy me-2 ms-1"></i>
                  <p className="menu-name">
                    Samples
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.samples ? "down" : "right"
                      } right`}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.samples ? "d-block" : "d-none"
                  }`}
                >
                  <li className="nav-item">
                    <Link to="/ListAllElement" className="nav-link">
                      
                      <p>List All Elements</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/AllFormElements" className="nav-link">
                      
                      <p>All Form Elements</p>
                    </Link>
                  </li>
                </ul>
              </li> */}

              {/*  User Management */}
              <li
                className={`nav-item ${
                  activeMenu === "userManagement" ? "menu-open" : ""
                } mb-2`}
              >
                {" "}
                <a
                  href="#"
                  className={getMenuItemClass("userManagement")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("userManagement");
                    if (window.innerWidth < 768) {
                      handleSidebarCollapse();
                    }
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "userManagement"
                        ? "3px solid #0040C1"
                        : "none",
                    backgroundColor:
                      activeMenu === "userManagement"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-user me-2"
                    style={{
                      color:
                        activeMenu === "userManagement" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color:
                        activeMenu === "userManagement" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    User Management
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.userManagement ? "down" : "right"
                      } right`}
                      style={{
                        color:
                          activeMenu === "userManagement"
                            ? "#0040C1"
                            : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.userManagement ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "userManagement"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/Users"
                      className={getSubMenuItemClass("Users")}
                      style={{
                        color:
                          activeSubMenu === "Users" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "Users"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p> User</p>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/Roles"
                      className={getSubMenuItemClass("Roles")}
                      style={{
                        color:
                          activeSubMenu === "Roles" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "Roles"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Roles</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Contacts */}
              <li
                className={`nav-item ${
                  activeMenu === "contact" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("contact")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("contact");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "contact" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "contact"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-address-book me-2"
                    style={{
                      color: activeMenu === "contact" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "contact" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Contact
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.contact ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "contact" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.contact ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "contact"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/Vendor"
                      className={getSubMenuItemClass("Vendor")}
                      style={{
                        color:
                          activeSubMenu === "Vendor" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "Vendor"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Vendor</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/Customer"
                      className={getSubMenuItemClass("Customer")}
                      style={{
                        color:
                          activeSubMenu === "Customer" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "Customer"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Customer</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Product */}
              <li
                className={`nav-item ${
                  activeMenu === "product" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("product")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("product");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "product" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "product"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-box me-2"
                    style={{
                      color: activeMenu === "product" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "product" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Product
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.product ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "product" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.product ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "product"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/ListProducts"
                      className={getSubMenuItemClass("ListProducts")}
                      style={{
                        color:
                          activeSubMenu === "ListProducts"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListProducts"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Products</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Purchase */}
              <li
                className={`nav-item ${
                  activeMenu === "purchase" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("purchase")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("purchase");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "purchase" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "purchase"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-shopping-cart me-2"
                    style={{
                      color: activeMenu === "purchase" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "purchase" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Purchase
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.purchase ? "down" : "right"
                      } right`}
                      style={{
                        color:
                          activeMenu === "purchase" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.purchase ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "purchase"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/PurchaseOrder"
                      className={getSubMenuItemClass("PurchaseOrder")}
                      style={{
                        color:
                          activeSubMenu === "PurchaseOrder"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "PurchaseOrder"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Purchase Order</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListPurchaseOrder"
                      className={getSubMenuItemClass("ListPurchaseOrder")}
                      style={{
                        color:
                          activeSubMenu === "ListPurchaseOrder"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListPurchaseOrder"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Purchase order </p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/AddPoPurchase"
                      className={getSubMenuItemClass("AddPoPurchase")}
                      style={{
                        color:
                          activeSubMenu === "AddPoPurchase"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddPoPurchase"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Po Purchase </p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListPoPurchaseOrder"
                      className={getSubMenuItemClass("ListPoPurchaseOrder")}
                      style={{
                        color:
                          activeSubMenu === "ListPoPurchaseOrder"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListPoPurchaseOrder"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Purchase List </p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/AddDIPurchase"
                      className={getSubMenuItemClass("AddDIPurchase")}
                      style={{
                        color:
                          activeSubMenu === "AddDIPurchase"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddDIPurchase"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p> Add DI Purchase </p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListDIPurchase"
                      className={getSubMenuItemClass("ListDIPurchase")}
                      style={{
                        color:
                          activeSubMenu === "ListDIPurchase"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListDIPurchase"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p> List DI Purchase </p>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/AddPurchaseReturn"
                      className={getSubMenuItemClass("AddPurchaseReturn")}
                      style={{
                        color:
                          activeSubMenu === "AddPurchaseReturn"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddPurchaseReturn"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Add Purchase Return</p>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/ReturnPurchaseList"
                      className={getSubMenuItemClass("ReturnPurchaseList")}
                      style={{
                        color:
                          activeSubMenu === "ReturnPurchaseList"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ReturnPurchaseList"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p> Purchas Return List</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Sell */}
              <li
                className={`nav-item ${
                  activeMenu === "sell" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("sell")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("sell");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "sell" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "sell"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-shopping-bag me-2"
                    style={{
                      color: activeMenu === "sell" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "sell" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Sell
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.sell ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "sell" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.sell ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "sell"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/AddSell"
                      className={getSubMenuItemClass("AddSell")}
                      style={{
                        color:
                          activeSubMenu === "AddSell" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddSell"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Add Sale</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/AllSell"
                      className={getSubMenuItemClass("AllSell")}
                      style={{
                        color:
                          activeSubMenu === "AllSell" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AllSell"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>All sale</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/AddSaleReturn"
                      className={getSubMenuItemClass("AddSaleReturn")}
                      style={{
                        color:
                          activeSubMenu === "AddSaleReturn"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddSaleReturn"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p> Sale Return</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListSellReturn"
                      className={getSubMenuItemClass("ListSellReturn")}
                      style={{
                        color:
                          activeSubMenu === "ListSellReturn"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListSellReturn"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Sale Return List</p>
                    </Link>{" "}
                  </li>
                </ul>
              </li>

              {/* Stock Transfer */}
              <li
                className={`nav-item ${
                  activeMenu === "stockTransfer" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("stockTransfer")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("stockTransfer");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "stockTransfer"
                        ? "3px solid #0040C1"
                        : "none",
                    backgroundColor:
                      activeMenu === "stockTransfer"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="nav-icon fas fa-exchange-alt me-2"
                    style={{
                      color:
                        activeMenu === "stockTransfer" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color:
                        activeMenu === "stockTransfer" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Stock Transfer
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.stockTransfer ? "down" : "right"
                      } right`}
                      style={{
                        color:
                          activeMenu === "stockTransfer"
                            ? "#0040C1"
                            : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.stockTransfer ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "stockTransfer"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/AddStockTransfer"
                      className={getSubMenuItemClass("AddStockTransfer")}
                      style={{
                        color:
                          activeSubMenu === "AddStockTransfer"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddStockTransfer"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Add Stock Transfer</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListStockTransfer"
                      className={getSubMenuItemClass("ListStockTransfer")}
                      style={{
                        color:
                          activeSubMenu === "ListStockTransfer"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListStockTransfer"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Stock Transfer</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Stock Adjustment */}
              <li
                className={`nav-item ${
                  activeMenu === "stockAdjustment" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("stockAdjustment")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("stockAdjustment");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "stockAdjustment"
                        ? "3px solid #0040C1"
                        : "none",
                    backgroundColor:
                      activeMenu === "stockAdjustment"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="fa-solid fa-cubes-stacked me-2 ms-2"
                    style={{
                      color:
                        activeMenu === "stockAdjustment"
                          ? "#0040C1"
                          : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color:
                        activeMenu === "stockAdjustment"
                          ? "#0040C1"
                          : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Stock Adjustment
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.stockAdjustment ? "down" : "right"
                      } right`}
                      style={{
                        color:
                          activeMenu === "stockAdjustment"
                            ? "#0040C1"
                            : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.stockAdjustment ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "stockAdjustment"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/AddStockAdjustment"
                      className={getSubMenuItemClass("AddStockAdjustment")}
                      style={{
                        color:
                          activeSubMenu === "AddStockAdjustment"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddStockAdjustment"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Add Stock</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListStockAdjustment"
                      className={getSubMenuItemClass("ListStockAdjustment")}
                      style={{
                        color:
                          activeSubMenu === "ListStockAdjustment"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListStockAdjustment"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Stock Adjustment</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/AddWarrantyClaim"
                      className={getSubMenuItemClass("AddWarrantyClaim")}
                      style={{
                        color:
                          activeSubMenu === "AddWarrantyClaim"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddWarrantyClaim"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>add warranty Adjustment</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListWarrantyClaim"
                      className={getSubMenuItemClass("ListWarrantyClaim")}
                      style={{
                        color:
                          activeSubMenu === "ListWarrantyClaim"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListWarrantyClaim"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List warranty Adjustment</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Expenses */}
              <li
                className={`nav-item ${
                  activeMenu === "expenses" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("expenses")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("expenses");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "expenses" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "expenses"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="fa-solid fa-sack-dollar me-2 ms-2"
                    style={{
                      color: activeMenu === "expenses" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "expenses" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Expenses
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.expenses ? "down" : "right"
                      } right`}
                      style={{
                        color:
                          activeMenu === "expenses" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.expenses ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "expenses"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/AddExpense"
                      className={getSubMenuItemClass("AddExpense")}
                      style={{
                        color:
                          activeSubMenu === "AddExpense"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "AddExpense"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Add Expense</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ListExpense"
                      className={getSubMenuItemClass("ListExpense")}
                      style={{
                        color:
                          activeSubMenu === "ListExpense"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListExpense"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Expenses</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ExpenseCategories"
                      className={getSubMenuItemClass("ExpenseCategories")}
                      style={{
                        color:
                          activeSubMenu === "ExpenseCategories"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ExpenseCategories"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Expense Categories</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Payment */}
              <li
                className={`nav-item ${
                  activeMenu === "payment" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("payment")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("payment");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "payment" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "payment"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="fa-solid fa-circle-dollar-to-slot me-2 ms-2"
                    style={{
                      color: activeMenu === "payment" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "payment" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Payment
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.payment ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "payment" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.payment ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "payment"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/Accounts"
                      className={getSubMenuItemClass("Accounts")}
                      style={{
                        color:
                          activeSubMenu === "Accounts" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "Accounts"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Accounts</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/TrialBalance"
                      className={getSubMenuItemClass("TrialBalance")}
                      style={{
                        color:
                          activeSubMenu === "TrialBalance"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "TrialBalance"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Trial Balance</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/CashFlow"
                      className={getSubMenuItemClass("CashFlow")}
                      style={{
                        color:
                          activeSubMenu === "CashFlow" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "CashFlow"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Cash Flow</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/PaymentReport"
                      className={getSubMenuItemClass("PaymentReport")}
                      style={{
                        color:
                          activeSubMenu === "PaymentReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "PaymentReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Payment Report</p>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/ListPaymentMethod"
                      className={getSubMenuItemClass("ListPaymentMethod")}
                      style={{
                        color:
                          activeSubMenu === "ListPaymentMethod"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ListPaymentMethod"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>List Payment Method </p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Report */}
              <li
                className={`nav-item ${
                  activeMenu === "report" ? "menu-open" : ""
                } mb-2`}
              >
                <a
                  href="#"
                  className={getMenuItemClass("report")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("report");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "report" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "report"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="fa-solid fa-chart-pie me-2 ms-2"
                    style={{
                      color: activeMenu === "report" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "report" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Report
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.report ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "report" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.report ? "d-block" : "d-none"
                  }`}
                  style={{
                    backgroundColor:
                      activeMenu === "report"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/PurchaseAndSale"
                      className={getSubMenuItemClass("PurchaseAndSale")}
                      style={{
                        color:
                          activeSubMenu === "PurchaseAndSale"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "PurchaseAndSale"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Purchase And Sale</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/TaxReport"
                      className={getSubMenuItemClass("TaxReport")}
                      style={{
                        color:
                          activeSubMenu === "TaxReport" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "TaxReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Tax Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/CustomersAndSuppliers"
                      className={getSubMenuItemClass("CustomersAndSuppliers")}
                      style={{
                        color:
                          activeSubMenu === "CustomersAndSuppliers"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "CustomersAndSuppliers"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Customers And Suppliers</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/StockReport"
                      className={getSubMenuItemClass("StockReport")}
                      style={{
                        color:
                          activeSubMenu === "StockReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "StockReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Stock Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/StockAdjustmentReport"
                      className={getSubMenuItemClass("StockAdjustmentReport")}
                      style={{
                        color:
                          activeSubMenu === "StockAdjustmentReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "StockAdjustmentReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Stock Adjustment Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ItemReport"
                      className={getSubMenuItemClass("ItemReport")}
                      style={{
                        color:
                          activeSubMenu === "ItemReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ItemReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Item Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ProductPurchaseReport"
                      className={getSubMenuItemClass("ProductPurchaseReport")}
                      style={{
                        color:
                          activeSubMenu === "ProductPurchaseReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ProductPurchaseReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Product Purchase Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/ProductSellReport"
                      className={getSubMenuItemClass("ProductSellReport")}
                      style={{
                        color:
                          activeSubMenu === "ProductSellReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "ProductSellReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Product Sell Report</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/PurchasePaymentReport"
                      className={getSubMenuItemClass("PurchasePaymentReport")}
                      style={{
                        color:
                          activeSubMenu === "PurchasePaymentReport"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "PurchasePaymentReport"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Purchase Payment Report</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Setting */}
              <li
                className={`nav-item ${
                  activeMenu === "setting" ? "menu-open" : ""
                } mb-2`}
              >
                {" "}
                <a
                  href="#"
                  className={getMenuItemClass("setting")}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("setting");
                    if (window.innerWidth < 768) handleSidebarCollapse();
                  }}
                  style={{
                    borderLeft:
                      activeMenu === "setting" ? "3px solid #0040C1" : "none",
                    backgroundColor:
                      activeMenu === "setting"
                        ? "rgba(0, 64, 193, 0.05)"
                        : "transparent",
                  }}
                >
                  <i
                    className="fa-solid fa-gear me-2 ms-2"
                    style={{
                      color: activeMenu === "setting" ? "#0040C1" : "#4b5565",
                    }}
                  />
                  <p
                    style={{
                      color: activeMenu === "setting" ? "#0040C1" : "#4b5565",
                    }}
                    className="menu-name"
                  >
                    Setting
                    <i
                      className={`fas fa-angle-${
                        openDropdowns.setting ? "down" : "right"
                      } right`}
                      style={{
                        color: activeMenu === "setting" ? "#0040C1" : "#4b5565",
                      }}
                    />
                  </p>
                </a>
                <ul
                  className={`nav nav-treeview menu-options ${
                    openDropdowns.setting ? "d-block" : "d-none"
                  }`}
                  style={{
                    color: activeMenu === "setting" ? "#0040C1" : "#4b5565",
                  }}
                >
                  <li className="nav-item">
                    <Link
                      to="/BusinessDetails"
                      className={getSubMenuItemClass("BusinessDetails")}
                      style={{
                        color:
                          activeSubMenu === "BusinessDetails"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "BusinessDetails"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Business Details</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/taxRate"
                      className={getSubMenuItemClass("taxRate")}
                      style={{
                        color:
                          activeSubMenu === "taxRate" ? "#0040C1" : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "taxRate"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>Tax Rate</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/permission"
                      className={getSubMenuItemClass("permission")}
                      style={{
                        color:
                          activeSubMenu === "permission"
                            ? "#0040C1"
                            : "#4b5565",
                        backgroundColor:
                          activeSubMenu === "permission"
                            ? "rgba(0, 64, 193, 0.08)"
                            : "transparent",
                        paddingLeft: "52px",
                      }}
                    >
                      <p>permission</p>
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <div className="overlay" onClick={() => handleSidebarCollapse()} />
    </div>
  );
};

export default Menu;
