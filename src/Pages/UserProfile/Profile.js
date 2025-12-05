import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState({
    id: "",
    prefix: "Mr",
    firstname: "",
    lastname: "",
    email: "",
    language: "en",
    dateOfBirth: "",
    gender: "",
    isActive: "",
    maritalStatus: "",
    bloodGroup: "",
    mobileNumber: "",
    alternateContactNumber: "",
    familyContactNumber: "",
    facebookLink: "",
    twitterLink: "",
    socialMedia1: "",
    socialMedia2: "",
    customField1: "",
    customField2: "",
    customField3: "",
    customField4: "",
    guardianName: "",
    idProofName: "",
    idProofNumber: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    permanentAddress: "",
    currentAddress: "",
    roles: [],
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    branch: "",
    taxPayerId: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        const userType = sessionStorage.getItem("userType"); // 'admin' or 'user'

        if (!email) {
          navigate("/login");
          return;
        }

        // Determine which endpoint to use based on user type
        const endpoint =
          userType === "admin"
            ? `https://fusionmastertech.com:8443/customer/email/${email}`
            : `${process.env.REACT_APP_BASE_URL}/user/email/${email}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();

        // Parse bank fields from the backend format
        const parsedBankFields = {};
        if (data.bankFields && data.bankFields.length > 0) {
          data.bankFields.forEach((field) => {
            const [key, value] = field.split(":");
            parsedBankFields[key] = value;
          });
        }

        setUserData({
          ...userData,
          id: data.id,
          prefix: data.prefix || "Mr",
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          username: data.username || "",
          password: data.password || "",
          language: data.language || "en",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          isActive: data.isActive || "",
          maritalStatus: data.maritalStatus || "",
          bloodGroup: data.bloodGroup || "",
          mobileNumber: data.mobileNumber || "",
          alternateContactNumber: data.alternateContactNumber || "",
          familyContactNumber: data.familyContactNumber || "",
          facebookLink: data.facebookLink || "",
          twitterLink: data.twitterLink || "",
          socialMedia1: data.socialMedia1 || "",
          socialMedia2: data.socialMedia2 || "",
          customField1: data.customField1 || "",
          customField2: data.customField2 || "",
          customField3: data.customField3 || "",
          customField4: data.customField4 || "",
          guardianName: data.guardianName || "",
          idProofName: data.idProofName || "",
          idProofNumber: data.idProofNumber || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          zipCode: data.zipCode || "",
          permanentAddress: data.permanentAddress || "",
          currentAddress: data.currentAddress || "",
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          ifsc: data.ifsc,
          branch: data.branch,
          taxPayerId: data.taxPayerId,
          roles: data.roles || [],
          enableServiceStaffPin: data.enableServiceStaffPin,
          staffPin: data.staffPin,
          allowLogin: data.allowLogin,
          location: data.location,
          salesCommissionPercentage: data.salesCommissionPercentage,
          commisionPercent: data.commisionPercent,
          allowContacts: data.allowContacts,
          selectedContacts: data.selectedContacts || [],
          departmentId: data.departmentId,
          designationId: data.designationId,
          primaryWorkLocation: data.primaryWorkLocation,
          basicSalary: data.basicSalary,
          salaryIn: data.salaryIn,
          payComponentId: data.payComponentId,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ text: "Failed to load user data", type: "error" });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const userType = sessionStorage.getItem("userType");

      // Prepare bank fields in the required format
      const bankFields = [];
      if (userData.bankFields && userData.bankFields.length > 0) {
        if (
          typeof userData.bankFields[0] === "string" &&
          userData.bankFields[0].includes(":")
        ) {
          bankFields.push(...userData.bankFields);
        } else {
          const accountHolderName =
            userData.bankFields[0]?.accountHolderName || "";
          const accountNumber = userData.bankFields[0]?.accountNumber || "";
          const bankName = userData.bankFields[0]?.bankName || "";
          const bankIdentifierCode =
            userData.bankFields[0]?.bankIdentifierCode || "";
          const branch = userData.bankFields[0]?.branch || "";
          const taxPayerId = userData.bankFields[0]?.taxPayerId || "";

          bankFields.push(
            `AccountHolderName:${accountHolderName}`,
            `AccountNumber:${accountNumber}`,
            `BankName:${bankName}`,
            `IFSC:${bankIdentifierCode}`,
            `Branch:${branch}`,
            `TaxPayerId:${taxPayerId}`
          );
        }
      }

      const updatedUserData = {
        ...userData,
        bankFields: bankFields,
      };

      // Determine which endpoint to use based on user type
      const endpoint =
        userType === "admin"
          ? `https://fusionmastertech.com:8443/customer/update/${userData.id}`
          : `${process.env.REACT_APP_BASE_URL}/user/update/${userData.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        setMessage({ text: "Profile updated successfully", type: "success" });
        alert("Profile Updated Successfully...!!!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: error.message || "Failed to update profile",
        type: "error",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const userType = sessionStorage.getItem("userType");

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords don't match");
      setMessage({ text: "New passwords don't match", type: "error" });
      return;
    }

    try {
      // First verify current password
      const authEndpoint =
        userType === "admin"
          ? "https://fusionmastertech.com:8443/customer/login"
          : "${process.env.REACT_APP_BASE_URL}/user/login";

      const authResponse = await fetch(authEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: passwordData.current_password,
        }),
      });

      if (!authResponse.ok) {
        alert("Current password is incorrect");
        throw new Error("Current password is incorrect");
      }

      // Update password
      const updateEndpoint =
        userType === "admin"
          ? `https://fusionmastertech.com:8443/customer/update/${userData.id}`
          : `${process.env.REACT_APP_BASE_URL}/user/update/${userData.id}`;

      const updateResponse = await fetch(updateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          password: passwordData.new_password,
        }),
      });

      if (updateResponse.ok) {
        alert("Password changed successfully");
        setMessage({ text: "Password changed successfully", type: "success" });
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        alert("Failed to update password");
        throw new Error("Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        text: error.message || "Failed to change password",
        type: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankFieldChange = (index, field, value) => {
    let currentBankFields = [...userData.bankFields];
    let bankFieldsObj = {};

    if (
      currentBankFields.length > 0 &&
      typeof currentBankFields[0] === "string"
    ) {
      currentBankFields.forEach((fieldStr) => {
        const [key, val] = fieldStr.split(":");
        bankFieldsObj[key] = val;
      });
      currentBankFields = [bankFieldsObj];
    }

    const updatedBankFields = [...currentBankFields];
    if (!updatedBankFields[index]) {
      updatedBankFields[index] = {};
    }
    updatedBankFields[index] = {
      ...updatedBankFields[index],
      [field]: value,
    };

    setUserData((prev) => ({
      ...prev,
      bankFields: updatedBankFields,
    }));
  };

  const getBankFieldValue = (fieldName) => {
    if (!userData.bankFields || userData.bankFields.length === 0) return "";

    if (typeof userData.bankFields[0] === "string") {
      const field = userData.bankFields.find((f) => f.startsWith(fieldName));
      return field ? field.split(":")[1] : "";
    }

    return userData.bankFields[0]?.[fieldName] || "";
  };

  // Check if the logged-in user is an admin
  const isAdmin = sessionStorage.getItem("userType") === "admin";

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-md-6">
                <h1 className="all-heading">My Profile</h1>
              </div>
              {isAdmin && (
                <div className="col-md-6 text-right">
                  <span className="badge badge-primary">Administrator</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="box-header">
                      <h3 className="box-title">Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-group row mb-3">
                        <label
                          htmlFor="current_password"
                          className="col-sm-3 col-form-label"
                        >
                          Current password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="Current password"
                              required
                              name="current_password"
                              type="password"
                              id="current_password"
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label
                          htmlFor="new_password"
                          className="col-sm-3 col-form-label"
                        >
                          New password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="New password"
                              required
                              name="new_password"
                              type="text"
                              id="new_password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group row mb-4">
                        <label
                          htmlFor="confirm_password"
                          className="col-sm-3 col-form-label"
                        >
                          Confirm new password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="Confirm new password"
                              required
                              name="confirm_password"
                              type="password"
                              id="confirm_password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-save float-end">
                        Update
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body row">
                    <div className="box-header">
                      <h3 className="box-title">Edit Profile</h3>
                    </div>
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row">
                        <div className="col-12 col-sm-6 col-md-2 mb-3">
                          <label htmlFor="prefix" className="form-label">
                            Prefix:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <select
                              className="form-select"
                              id="prefix"
                              name="prefix"
                              value={userData.prefix}
                              onChange={handleInputChange}
                              disabled
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Miss">Miss</option>
                              <option value="Dr">Dr</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mb-3">
                          <label htmlFor="firstname" className="form-label">
                            First Name:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              placeholder="First Name"
                              name="firstname"
                              type="text"
                              value={userData.firstname}
                              onChange={handleInputChange}
                              id="firstname"
                              required
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mb-3">
                          <label htmlFor="lastname" className="form-label">
                            Last Name:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              placeholder="Last Name"
                              name="lastname"
                              type="text"
                              value={userData.lastname}
                              onChange={handleInputChange}
                              id="lastname"
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">
                            Email:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              placeholder="Email"
                              name="email"
                              type="email"
                              value={userData.email}
                              onChange={handleInputChange}
                              id="email"
                              disabled
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="language" className="form-label">
                            Language:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <select
                              className="form-select"
                              id="language"
                              name="language"
                              value={userData.language}
                              onChange={handleInputChange}
                              readOnly
                              disabled
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish - Español</option>
                              <option value="sq">Albanian - Shqip</option>
                              <option value="hi">Hindi - हिंदी</option>
                              <option value="nl">Dutch</option>
                              <option value="fr">French - Français</option>
                              <option value="de">German - Deutsch</option>
                              <option value="ar">Arabic - العَرَبِيَّة</option>
                              <option value="tr">Turkish - Türkçe</option>
                              <option value="id">Indonesian</option>
                              <option value="ps">Pashto</option>
                              <option value="pt">Portuguese</option>
                              <option value="vi">Vietnamese</option>
                              <option value="ce">Chinese</option>
                              <option value="ro">Romanian</option>
                              <option value="lo">Lao</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* More Informations Section */}
                      <div className="row mt-4">
                        <div className="col-md-12">
                          <div className="box-header">
                            <h3 className="box-title">More Informations</h3>
                          </div>

                          <div className="tw-flow-root tw-border-gray-200">
                            <div className="tw-py-2 tw-align-middle sm:tw-px-5 row">
                              {/* Basic Details */}
                              <div className="form-group col-md-3">
                                <label>Date of birth:</label>
                                <input
                                  className="form-control"
                                  type="date"
                                  name="dateOfBirth"
                                  value={userData.dateOfBirth}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Gender:</label>
                                <select
                                  className="form-control"
                                  name="gender"
                                  value={userData.gender}
                                  onChange={handleInputChange}
                                  readOnly
                                >
                                  <option value="">Please Select</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="others">Others</option>
                                </select>
                              </div>
                              <div className="form-group col-md-3">
                                <label>Marital Status:</label>
                                <select
                                  className="form-control"
                                  name="maritalStatus"
                                  value={userData.maritalStatus}
                                  onChange={handleInputChange}
                                  readOnly
                                >
                                  <option value="">Marital Status</option>
                                  <option value="married">Married</option>
                                  <option value="unmarried">Unmarried</option>
                                  <option value="divorced">Divorced</option>
                                </select>
                              </div>
                              <div className="form-group col-md-3">
                                <label>Blood Group:</label>
                                <input
                                  className="form-control"
                                  placeholder="Blood Group"
                                  name="bloodGroup"
                                  value={userData.bloodGroup}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>

                              {/* Contact Details */}
                              <div className="form-group col-md-3">
                                <label>Mobile Number:</label>
                                <input
                                  className="form-control"
                                  placeholder="Mobile Number"
                                  name="mobileNumber"
                                  value={userData.mobileNumber}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Alternate contact number:</label>
                                <input
                                  className="form-control"
                                  placeholder="Alternate contact number"
                                  name="alternateContactNumber"
                                  value={userData.alternateContactNumber}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Family contact number:</label>
                                <input
                                  className="form-control"
                                  placeholder="Family contact number"
                                  name="familyContactNumber"
                                  value={userData.familyContactNumber}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>

                              {/* Social Media */}
                              <div className="form-group col-md-3">
                                <label>Facebook Link:</label>
                                <input
                                  className="form-control"
                                  placeholder="Facebook Link"
                                  name="facebookLink"
                                  value={userData.facebookLink}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Twitter Link:</label>
                                <input
                                  className="form-control"
                                  placeholder="Twitter Link"
                                  name="twitterLink"
                                  value={userData.twitterLink}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Social Media 1:</label>
                                <input
                                  className="form-control"
                                  placeholder="Social Media 1"
                                  name="socialMedia1"
                                  value={userData.socialMedia1}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Social Media 2:</label>
                                <input
                                  className="form-control"
                                  placeholder="Social Media 2"
                                  name="socialMedia2"
                                  value={userData.socialMedia2}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>

                              {/* Custom Fields */}
                              <div className="form-group col-md-3">
                                <label>Custom field 1:</label>
                                <input
                                  className="form-control"
                                  placeholder="Custom field 1"
                                  name="customField1"
                                  value={userData.customField1}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 2:</label>
                                <input
                                  className="form-control"
                                  placeholder="Custom field 2"
                                  name="customField2"
                                  value={userData.customField2}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 3:</label>
                                <input
                                  className="form-control"
                                  placeholder="Custom field 3"
                                  name="customField3"
                                  value={userData.customField3}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 4:</label>
                                <input
                                  className="form-control"
                                  placeholder="Custom field 4"
                                  name="customField4"
                                  value={userData.customField4}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>

                              {/* Identity */}
                              <div className="form-group col-md-3">
                                <label>Guardian Name:</label>
                                <input
                                  className="form-control"
                                  placeholder="Guardian Name"
                                  name="guardianName"
                                  value={userData.guardianName}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>ID proof name:</label>
                                <input
                                  className="form-control"
                                  placeholder="ID proof name"
                                  name="idProofName"
                                  value={userData.idProofName}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>ID proof number:</label>
                                <input
                                  className="form-control"
                                  placeholder="ID proof number"
                                  name="idProofNumber"
                                  value={userData.idProofNumber}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>City</label>
                                <input
                                  className="form-control"
                                  placeholder="City"
                                  name="city"
                                  value={userData.city}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>State</label>
                                <input
                                  className="form-control"
                                  placeholder="State"
                                  name="state"
                                  value={userData.state}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Country</label>
                                <input
                                  className="form-control"
                                  placeholder="Country"
                                  name="country"
                                  value={userData.country}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Zip Code</label>
                                <input
                                  className="form-control"
                                  placeholder="Zip Code"
                                  name="zipCode"
                                  value={userData.zipCode}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>

                              {/* Addresses */}
                              <div className="form-group col-md-6">
                                <label>Permanent Address:</label>
                                <textarea
                                  className="form-control"
                                  placeholder="Permanent Address"
                                  rows="2"
                                  name="permanentAddress"
                                  value={userData.permanentAddress}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label>Current Address:</label>
                                <textarea
                                  className="form-control"
                                  placeholder="Current Address"
                                  rows="2"
                                  name="currentAddress"
                                  value={userData.currentAddress}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              {/* Bank Details */}
                              <div className="col-md-12 mt-3">
                                <hr />
                                <h4>Bank Details:</h4>
                              </div>
                              {/* Bank Details */}
                              <div className="form-group col-md-3">
                                <label>Account Holder's Name:</label>
                                <input
                                  className="form-control"
                                  name="accountHolderName"
                                  placeholder="Account Holder's Name"
                                  value={userData.accountHolderName}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Account Number:</label>
                                <input
                                  className="form-control"
                                  placeholder="Account Number"
                                  name="accountNumber"
                                  value={userData.accountNumber}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Bank Name:</label>
                                <input
                                  className="form-control"
                                  placeholder="Bank Name"
                                  name="bankName"
                                  value={userData.bankName}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>
                                  Bank Identifier Code:{" "}
                                  <i
                                    className="fa fa-info-circle text-info"
                                    title="A unique code to identify the bank in your country, for example: IFSC code"
                                  ></i>
                                </label>
                                <input
                                  className="form-control"
                                  placeholder="Bank Identifier Code"
                                  name="ifsc"
                                  value={userData.ifsc}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Branch:</label>
                                <input
                                  className="form-control"
                                  placeholder="Branch"
                                  name="branch"
                                  value={userData.branch}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>
                                  Tax Payer ID:{" "}
                                  <i
                                    className="fa fa-info-circle text-info"
                                    title="Tax number id of the employee, for example, PAN card in India"
                                  ></i>
                                </label>
                                <input
                                  className="form-control"
                                  placeholder="Tax Payer ID"
                                  name="taxPayerId"
                                  value={userData.taxPayerId}
                                  onChange={handleInputChange}
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
