import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Header from "./Header";
import Footer from "./Footer";

import Menu from "./Menu";
import Dashboard from "./Dashboard";
import LoginPage from "./Pages/LoginPage/LoginPage";
import Users from "./Pages/UserManagement/Users";
import AddUser from "./Pages/UserManagement/AddUser";
import Roles from "./Pages/UserManagement/Roles";
import AddRoles from "./Pages/UserManagement/AddRoles";
import EditRoles from "./Pages/UserManagement/EditRoles";
import ViewRole from "./Pages/UserManagement/ViewRole";
import EditUser from "./Pages/UserManagement/EditUser";
import ViewUser from "./Pages/UserManagement/ViewUser";
import Vendor from "./Pages/Contacts/Vendor";
import AddVendor from "./Pages/Contacts/AddVendor";
import EditVendor from "./Pages/Contacts/EditVendor";
import ViewVendor from "./Pages/Contacts/ViewVendor";
import Customer from "./Pages/Contacts/Customer";
import AddCustomer from "./Pages/Contacts/AddCustomer";
import EditCustomer from "./Pages/Contacts/EditCustomer";
import ViewCustomer from "./Pages/Contacts/ViewCustomer";
import Permission from "./Pages/Extra/Permission";
import ListProducts from "./Pages/Products/ListProducts";
import ProductStockHistory from "./Pages/Products/ProductStockHistory";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import PurchaseOrder from "./Pages/Purchase/PurchaseOrder";
import AddPoPurchase from "./Pages/Purchase/AddPoPurchase";
import ListPoPurchaseOrder from "./Pages/Purchase/ListPoPurchaseOrder";
import ListPurchaseOrder from "./Pages/Purchase/ListPurchaseOrder";
import AllSell from "./Pages/Sell/AllSell";
import AddSell from "./Pages/Sell/AddSell";
import AddPurchaseReturn from "./Pages/Purchase/AddPurchaseReturn";
import AddStockTransfer from "./Pages/StockTransfer/AddStockTransfer";
import ListStockTransfer from "./Pages/StockTransfer/ListStockTransfer";
import AddStockAdjustment from "./Pages/StockAdjustment/AddStockAdjustment";
import AddExpense from "./Pages/Expense/AddExpense";
import EditExpense from "./Pages/Expense/EditExpense";
import ViewExpense from "./Pages/Expense/ViewExpense";
import ListExpense from "./Pages/Expense/ListExpense";
import ListAllElement from "./Pages/Samples/ListAllElement";
import AllFormElements from "./Pages/Samples/AllFormElements";
import PaymentReport from "./Pages/Payment/PaymentReport";
import CashFlow from "./Pages/Payment/CashFlow";
import TrialBalance from "./Pages/Payment/TrialBalance";
import AccountBook from "./Pages/Payment/AccountBook";
import PurchaseAndSale from "./Pages/Report/PurchaseAndSale";
import TaxReport from "./Pages/Report/TaxReport";
import CustomersAndSuppliers from "./Pages/Report/CustomersAndSuppliers";
import StockReport from "./Pages/Report/StockReport";
import ItemReport from "./Pages/Report/ItemReport";
import StockAdjustmentReport from "./Pages/Report/StockAdjustmentReport";
import ProductPurchaseReport from "./Pages/Report/ProductPurchaseReport";
import ProductSellReport from "./Pages/Report/ProductSellReport";
import DetailedPurchase from "./Pages/Report/DetailedPurchase";
import GroupedDate from "./Pages/Report/GroupedDate";
import ByCategory from "./Pages/Report/ByCategory";
import ByBrand from "./Pages/Report/ByBrand";
import PurchasePaymentReport from "./Pages/Report/PurchasePaymentReport";
import SalePaymentReport from "./Pages/Report/SalePaymentReport";
import Detailed from "./Pages/Report/Detailed";
import InputTaxPurchase from "./Pages/Report/InputTaxPurchase";
import OutputTaxSales from "./Pages/Report/OutputTaxSales";
import ExpenseTax from "./Pages/Report/ExpenseTax";
import ListStockAdjustment from "./Pages/StockAdjustment/ListStockAdjustment";
import AddNewItem from "./Pages/Purchase/AddNewItem";
import ViewList from "./Pages/Products/ViewList";
import EditList from "./Pages/Products/EditList";
import ViewPurchaseOrder from "./Pages/Purchase/ViewPurchaseOrder";
import EditPurchaseOrder from "./Pages/Purchase/EditPurchaseOrder";
import ViewPoPurchaseOrder from "./Pages/Purchase/ViewPoPurchaseOrder";
import EditPoPurchaseOrder from "./Pages/Purchase/EditPoPurchaseOrder";
import EditSale from "./Pages/Sell/EditSale";
import ViewSale from "./Pages/Sell/ViewSale";
import ReturnPurchaseList from "./Pages/Purchase/ReturnPurchaseList";
import ViewPurchaseReturn from "./Pages/Purchase/ViewPurchaseReturn";
import EditPurchaseReturn from "./Pages/Purchase/EditPurchaseReturn";
import ListSellReturn from "./Pages/Sell/ListSellReturn";
import AddSaleReturn from "./Pages/Sell/AddSaleReturn";
import EditSaleReturn from "./Pages/Sell/EditSaleReturn";
import ViewSaleReturn from "./Pages/Sell/ViewSaleReturn";
import Accounts from "./Pages/Payment/Accounts";
import AccountTypes from "./Pages/Payment/AccountTypes";
import AddAccount from "./Pages/Payment/AddAccount";
import ListPaymentMethod from "./Pages/Payment/ListPaymentMethod";
import PaymentMethod from "./Pages/Payment/PaymentMethod";
import TaxRate from "./Pages/Setting/TaxRate";
import ImageUpload from "./Pages/Setting/ImageUpload";
import SellInvoice from "./Pages/Sell/SellInvoice";
import SaleInvoice from "./Pages/Sell/SaleInvoice";
import POSInterface from "./POSInterface";
import Holiday from "./Pages/HRM/Holiday";
import Department from "./Pages/HRM/Department";
import Attendance from "./Pages/HRM/Attendance";
import Shifts from "./Pages/HRM/Shifts";
import AllAttendance from "./Pages/HRM/AllAttendance";
import AttendanceShift from "./Pages/HRM/AttendanceShift";
import AttendanceDate from "./Pages/HRM/AttendanceDate";
import Memo from "./Pages/Setting/Memo";
import Document from "./Pages/Setting/Document";
import Leads from "./Pages/Setting/Leads";
import Campaigns from "./Pages/Setting/Campaigns";
import ContactLogin from "./Pages/Setting/ContactLogin";
import FollowUps from "./Pages/Setting/FollowUps";
import AddPayroll from "./Pages/HRM/AddPayroll";
import PayrollGroupPayment from "./Pages/HRM/PayrollGroupPayment";
import EditPayroll from "./Pages/HRM/EditPayroll";
import ViewStockAdjustment from "./Pages/StockAdjustment/ViewStockAdjustment";
import ListWarrantyClaim from "./Pages/StockAdjustment/ListWarrantyClaim";
import AddWarrantyClaim from "./Pages/StockAdjustment/AddWarrantyClaim";
import ViewWarrantyClaim from "./Pages/StockAdjustment/ViewWarrantyClaim";
import ExpenseCategories from "./Pages/Expense/ExpenseCategories";
import Profile from "./Pages/UserProfile/Profile";
import BusinessDetails from "./Pages/Setting/BusinessDetails";
import axios from "axios";
import api from "../src/Pages/utils/api";
import AddDIPurchase from "./Pages/Purchase/AddDIPurchase";
import EditDIPurchase from "./Pages/Purchase/EditDIPurchase";
import ListDIPurchase from "./Pages/Purchase/ListDIPurchase";
import ViewDIPurchase from "./Pages/Purchase/ViewDIPurchase";
// Configure axios defaults in your App.js or main entry point
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const tenantId = sessionStorage.getItem("tenantDbName");
    if (tenantId) {
      config.headers["X-TenantID"] = tenantId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response interceptor to handle session issues
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle session expiration
      sessionStorage.removeItem("tenantDbName");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Optional: Preload default tenant header
const tenantDbName =
  localStorage.getItem("tenantDbName") ||
  sessionStorage.getItem("tenantDbName");

if (tenantDbName) {
  api.defaults.headers.common["X-TenantID"] = tenantDbName;
}
const App = () => {
  return (
    <BrowserRouter basename="/fumaretail">
      <div className="app-background">
        <Routes>
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/Dashboard" element={<Dashboard />} />
                  <Route path="/Profile" element={<Profile />} />

                  <Route path="/POSInterface" element={<POSInterface />} />

                  <Route path="/Users" element={<Users />} />
                  <Route path="/AddUser" element={<AddUser />} />
                  <Route path="/Roles" element={<Roles />} />
                  <Route path="/AddRoles" element={<AddRoles />} />
                  <Route path="/EditRoles" element={<EditRoles />} />
                  <Route path="/ViewRole" element={<ViewRole />} />
                  <Route path="/EditUser/:id" element={<EditUser />} />
                  <Route path="/ViewUser/:id" element={<ViewUser />} />
                  <Route path="/Vendor" element={<Vendor />} />
                  <Route path="/AddVendor" element={<AddVendor />} />
                  <Route path="/EditVendor/:id" element={<EditVendor />} />
                  <Route path="/ViewVendor/:id" element={<ViewVendor />} />
                  <Route path="/Customer" element={<Customer />} />
                  <Route path="/AddCustomer" element={<AddCustomer />} />
                  <Route path="/EditCustomer/:id" element={<EditCustomer />} />
                  <Route path="/ViewCustomer/:id" element={<ViewCustomer />} />
                  <Route path="/Permission" element={<Permission />} />

                  <Route path="/ListProducts" element={<ListProducts />} />
                  <Route path="/EditList/:productId" element={<EditList />} />
                  <Route path="/ViewList/:productId" element={<ViewList />} />

                  <Route
                    path="/ListPurchaseOrder"
                    element={<ListPurchaseOrder />}
                  />
                  <Route path="/AddNewItem" element={<AddNewItem />} />
                  <Route path="/PurchaseOrder" element={<PurchaseOrder />} />
                  <Route path="/AddPoPurchase" element={<AddPoPurchase />} />
                  <Route path="/AddDIPurchase" element={<AddDIPurchase />} />
                  <Route
                    path="/EditDIPurchase/:id"
                    element={<EditDIPurchase />}
                  />
                  <Route
                    path="/ViewDIPurchase/:id"
                    element={<ViewDIPurchase />}
                  />
                  <Route path="/ListDIPurchase" element={<ListDIPurchase />} />

                  <Route
                    path="/ViewPurchaseOrder/:id"
                    element={<ViewPurchaseOrder />}
                  />
                  <Route
                    path="/EditPurchaseOrder/:id"
                    element={<EditPurchaseOrder />}
                  />

                  <Route
                    path="/ViewPoPurchaseOrder/:id"
                    element={<ViewPoPurchaseOrder />}
                  />
                  <Route
                    path="/EditPoPurchaseOrder/:id"
                    element={<EditPoPurchaseOrder />}
                  />

                  <Route
                    path="/ListPoPurchaseOrder"
                    element={<ListPoPurchaseOrder />}
                  />
                  <Route
                    path="/AddPurchaseReturn"
                    element={<AddPurchaseReturn />}
                  />

                  <Route
                    path="/ReturnPurchaseList"
                    element={<ReturnPurchaseList />}
                  />
                  <Route
                    path="/ViewPurchaseReturn/:id"
                    element={<ViewPurchaseReturn />}
                  />
                  <Route
                    path="/EditPurchaseReturn/:id"
                    element={<EditPurchaseReturn />}
                  />

                  <Route path="/AllSell" element={<AllSell />} />
                  <Route path="/SellInvoice/:id" element={<SellInvoice />} />
                  <Route path="/SaleInvoice" element={<SaleInvoice />} />

                  <Route path="/AddSell" element={<AddSell />} />
                  <Route path="/EditSale/:id" element={<EditSale />} />
                  <Route path="/ViewSale/:id" element={<ViewSale />} />

                  <Route path="/AddSaleReturn" element={<AddSaleReturn />} />
                  <Route path="/ListSellReturn" element={<ListSellReturn />} />
                  <Route
                    path="/EditSaleReturn/:id"
                    element={<EditSaleReturn />}
                  />
                  {/* <Route path="/ListSellReturn" element={<ListSellReturn />} /> */}

                  <Route
                    path="/ViewSaleReturn/:id"
                    element={<ViewSaleReturn />}
                  />

                  <Route
                    path="/ListStockTransfer"
                    element={<ListStockTransfer />}
                  />
                  <Route
                    path="/AddStockTransfer"
                    element={<AddStockTransfer />}
                  />
                  <Route
                    path="/AddStockAdjustment"
                    element={<AddStockAdjustment />}
                  />
                  <Route
                    path="/ViewStockAdjustment/:id"
                    element={<ViewStockAdjustment />}
                  />
                  <Route
                    path="/ListStockAdjustment"
                    element={<ListStockAdjustment />}
                  />
                  <Route
                    path="/AddWarrantyClaim"
                    element={<AddWarrantyClaim />}
                  />
                  <Route
                    path="/ListWarrantyClaim"
                    element={<ListWarrantyClaim />}
                  />
                  <Route
                    path="/ViewWarrantyClaim/:id"
                    element={<ViewWarrantyClaim />}
                  />
                  <Route path="/AddExpense" element={<AddExpense />} />
                  <Route path="/EditExpense/:id" element={<EditExpense />} />
                  <Route path="/ViewExpense/:id" element={<ViewExpense />} />

                  <Route path="/ListExpense" element={<ListExpense />} />
                  <Route
                    path="/ExpenseCategories"
                    element={<ExpenseCategories />}
                  />

                  <Route path="/PaymentReport" element={<PaymentReport />} />
                  {/* <Route path="/ListAccounts" element={<ListAccounts />} /> */}
                  <Route path="/Accounts" element={<Accounts />} />
                  <Route path="/AccountBook/:id" element={<AccountBook />} />
                  <Route path="/AddAccount" element={<AddAccount />} />
                  <Route
                    path="/ListPaymentMethod"
                    element={<ListPaymentMethod />}
                  />
                  <Route path="/PaymentMethod" element={<PaymentMethod />} />
                  <Route path="/AccountTypes" element={<AccountTypes />} />
                  <Route path="/CashFlow" element={<CashFlow />} />
                  <Route path="/TrialBalance" element={<TrialBalance />} />

                  <Route path="/ListAllElement" element={<ListAllElement />} />
                  <Route
                    path="/AllFormElements"
                    element={<AllFormElements />}
                  />
                  <Route
                    path="/PurchaseAndSale"
                    element={<PurchaseAndSale />}
                  />
                  <Route path="/TaxReport" element={<TaxReport />} />
                  <Route
                    path="/CustomersAndSuppliers"
                    element={<CustomersAndSuppliers />}
                  />
                  <Route path="/StockReport" element={<StockReport />} />
                  <Route path="/ItemReport" element={<ItemReport />} />
                  <Route
                    path="/StockAdjustmentReport"
                    element={<StockAdjustmentReport />}
                  />
                  <Route
                    path="/ProductPurchaseReport"
                    element={<ProductPurchaseReport />}
                  />
                  <Route
                    path="/ProductSellReport"
                    element={<ProductSellReport />}
                  />
                  <Route path="/Detailed" element={<Detailed />} />
                  <Route
                    path="/DetailedPurchase"
                    element={<DetailedPurchase />}
                  />
                  <Route path="/GroupedDate" element={<GroupedDate />} />
                  <Route path="/ByCategory" element={<ByCategory />} />
                  <Route path="/ByBrand" element={<ByBrand />} />
                  <Route
                    path="/PurchasePaymentReport"
                    element={<PurchasePaymentReport />}
                  />
                  <Route
                    path="/SalePaymentReport"
                    element={<SalePaymentReport />}
                  />
                  <Route
                    path="/ProductStockHistory"
                    element={<ProductStockHistory />}
                  />
                  <Route
                    path="/InputTaxPurchase"
                    element={<InputTaxPurchase />}
                  />
                  <Route path="/OutputTaxSales" element={<OutputTaxSales />} />
                  <Route path="/ExpenseTax" element={<ExpenseTax />} />
                  {/* <Route path="/" element={<div>No Access</div>} /> */}

                  <Route path="/TaxRate" element={<TaxRate />} />
                  <Route path="/ImageUpload" element={<ImageUpload />} />

                  <Route
                    path="/BusinessDetails"
                    element={<BusinessDetails />}
                  />

                  <Route path="/Holiday" element={<Holiday />} />
                  <Route path="/Department" element={<Department />} />
                  <Route path="/Attendance" element={<Attendance />} />
                  <Route path="/Shifts" element={<Shifts />} />
                  <Route path="/AllAttendance" element={<AllAttendance />} />
                  <Route path="/AttendanceDate " element={<AttendanceDate />} />
                  <Route
                    path="/AttendanceShift"
                    element={<AttendanceShift />}
                  />
                  <Route path="/Memo" element={<Memo />} />
                  <Route path="/EditPayroll" element={<EditPayroll />} />
                  <Route path="/AddPayroll" element={<AddPayroll />} />
                  <Route
                    path="/PayrollGroupPayment"
                    element={<PayrollGroupPayment />}
                  />

                  <Route path="/Document" element={<Document />} />
                  <Route path="/Leads" element={<Leads />} />
                  <Route path="/Campaigns" element={<Campaigns />} />
                  <Route path="/ContactLogin" element={<ContactLogin />} />
                  <Route path="/FollowUps" element={<FollowUps />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

// Layout component to conditionally render Header, Menu, and Footer
const Layout = ({ children, userRoles }) => {
  const location = useLocation();

  const isAuthPage = location.pathname === "/" || location.pathname === "/";

  return (
    <>
      {!isAuthPage && (
        <>
          <Header />
          <Menu />
        </>
      )}
      <div className="wrapper">{children}</div>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;
