import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";
import "../../assets/plugins/icheck-bootstrap/icheck-bootstrap.min.css";
import "../../assets/plugins/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css";
import "../../assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css";
import "../../assets/plugins/select2/css/select2.min.css";
import "../../assets/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css";
import "../../assets/plugins/bootstrap4-duallistbox/bootstrap-duallistbox.min.css";
import "../../assets/plugins/bs-stepper/css/bs-stepper.min.css";
import "../../assets/plugins/dropzone/min/dropzone.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../AddUser.css";
import api from "../utils/api";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic Information
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  const [taxNumber, setTaxNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [payTerm, setPayTerm] = useState("");
  const [payTermType, setPayTermType] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  // Personal Information
  const [language, setLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [occupation, setOccupation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateContactNumber, setAlternateContactNumber] = useState("");

  const [customField1, setCustomField1] = useState("");
  const [customField2, setCustomField2] = useState("");
  const [customField3, setCustomField3] = useState("");
  const [customField4, setCustomField4] = useState("");
  const [idProofName, setIdProofName] = useState("");
  const [idProofNumber, setIdProofNumber] = useState("");

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [streetName, setStreetName] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customer/${id}`);
        const data = response.data;

        // Set all the state values from the fetched data
        setPrefix(data.prefix || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setTaxNumber(data.taxNumber || "");
        setOpeningBalance(data.openingBalance || "");
        setPayTerm(data.payTerm || "");
        setPayTermType(data.payTermType || "");
        setCreditLimit(data.creditLimit || "");
        setLanguage(data.language || "");
        setDateOfBirth(data.dateOfBirth || "");
        setGender(data.gender || "");
        setMaritalStatus(data.maritalStatus || "");
        setBloodGroup(data.bloodGroup || "");
        setOccupation(data.occupation || "");

        setMobileNumber(data.mobileNumber || "");
        setAlternateContactNumber(data.alternateContactNumber || "");
        setCustomField1(data.customField1 || "");
        setCustomField2(data.customField2 || "");
        setCustomField3(data.customField3 || "");
        setCustomField4(data.customField4 || "");
        setIdProofName(data.idProofName || "");
        setIdProofNumber(data.idProofNumber || "");
        setCountry(data.country || "");
        setState(data.state || "");
        setCity(data.city || "");
        setZipCode(data.zipCode || "");
        setLandmark(data.landmark || "");
        setStreetName(data.streetName || "");
        setBuildingNumber(data.buildingNumber || "");
        setPermanentAddress(data.permanentAddress || "");
      } catch (error) {
        console.error("Error fetching customer:", error);
        alert("Failed to load customer data.");
        navigate("/customer");
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/customer/check-email?email=${email}&id=${id}`
      );
      const data = await response.json();
      setEmailExists(data.exists);
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    checkEmailExists(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailExists) {
      alert("Email already exists. Please use a different email.");
      return;
    }

    const customerData = {
      id,
      prefix,
      firstName,
      lastName,
      email,
      taxNumber,
      openingBalance,
      payTerm,
      payTermType,
      creditLimit,
      language,
      dateOfBirth,
      gender,
      maritalStatus,
      bloodGroup,
      occupation,
      mobileNumber,
      alternateContactNumber,
      customField1,
      customField2,
      customField3,
      customField4,
      idProofName,
      idProofNumber,
      country,
      state,
      city,
      zipCode,
      landmark,
      streetName,
      buildingNumber,
      permanentAddress,
    };

    try {
      const response = await api.put(`/customer/update/${id}`, customerData);
      alert("Customer updated successfully!");
      navigate("/customer");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    }
  };

  return (
    <>
      <div className="wrapper ">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading ">Edit Customer</h1>
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
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="prefix">
                            Prefix<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="prefix"
                            name="prefix"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                            placeholder="Enter Prefix"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="firstName">
                            First Name<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter First Name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="lastName">
                            Last Name<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter Last Name"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="email">
                            Email<span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Enter Email"
                            required
                          />
                          {emailExists && (
                            <small className="form-text text-danger">
                              Email already exists.
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="taxNumber">Tax Number:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="taxNumber"
                            name="taxNumber"
                            value={taxNumber}
                            onChange={(e) => setTaxNumber(e.target.value)}
                            placeholder="Tax Number "
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="OpeningBalance">
                            Opening Balance:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="OpeningBalance"
                            name="OpeningBalance"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            placeholder="Opening Balance "
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
                              value={payTerm}
                              onChange={(e) => setPayTerm(e.target.value)}
                            />
                            <select
                              className="form-select border rounded-start-0  rounded-end-1 p-1 "
                              value={payTermType}
                              onChange={(e) => setPayTermType(e.target.value)}
                            >
                              <option value="">Please Select</option>
                              <option value="Months">Months</option>
                              <option value="Days">Days</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="creditLimit">Credit Limit:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="creditLimit"
                            name="creditLimit"
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            placeholder="Credit Limit"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Personal Information Card */}
                <div className="card card-default rounded-4 border-0 cardHover mt-3">
                  <div className="card-body">
                    <div className="mb-4">
                      <h3 className="h4 font-weight-bold">More Information</h3>
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="language">Language:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="language"
                            name="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            placeholder="Type language"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="dateOfBirth">Date of Birth:</label>
                          <input
                            type="date"
                            className="form-control"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="gender">Gender:</label>
                          <select
                            className="form-control"
                            id="gender"
                            name="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="maritalStatus">Marital Status:</label>
                          <select
                            className="form-control"
                            id="maritalStatus"
                            name="maritalStatus"
                            value={maritalStatus}
                            onChange={(e) => setMaritalStatus(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="bloodGroup">Blood Group:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="bloodGroup"
                            name="bloodGroup"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            placeholder="Blood Group"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="Occupation"> Occupation:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="Occupation"
                            name="Occupation"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            placeholder="Occupation"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="mobileNumber">Mobile Number:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Mobile Number"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="alternateContactNumber">
                            Alternate Contact Number:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="alternateContactNumber"
                            name="alternateContactNumber"
                            value={alternateContactNumber}
                            onChange={(e) =>
                              setAlternateContactNumber(e.target.value)
                            }
                            placeholder="Alternate Contact"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="customField1">Custom Field 1:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField1"
                            name="customField1"
                            value={customField1}
                            onChange={(e) => setCustomField1(e.target.value)}
                            placeholder="Custom Field 1"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="customField2">Custom Field 2:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField2"
                            name="customField2"
                            value={customField2}
                            onChange={(e) => setCustomField2(e.target.value)}
                            placeholder="Custom Field 2"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="customField3">Custom Field 3:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField3"
                            name="customField3"
                            value={customField3}
                            onChange={(e) => setCustomField3(e.target.value)}
                            placeholder="Custom Field 3"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="customField4">Custom Field 4:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="customField4"
                            name="customField4"
                            value={customField4}
                            onChange={(e) => setCustomField4(e.target.value)}
                            placeholder="Custom Field 4"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="idProofName">ID Proof Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="idProofName"
                            name="idProofName"
                            value={idProofName}
                            onChange={(e) => setIdProofName(e.target.value)}
                            placeholder="ID Proof Name"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="idProofNumber">
                            ID Proof Number:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="idProofNumber"
                            name="idProofNumber"
                            value={idProofNumber}
                            onChange={(e) => setIdProofNumber(e.target.value)}
                            placeholder="ID Proof Number"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="country">Country :</label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="country"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="state">State:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="state"
                            name="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="city">City:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="zipCode">Zip Code:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="zipCode"
                            name="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="permanentAddress">
                            Permanent Address:
                          </label>
                          <textarea
                            className="form-control"
                            id="permanentAddress"
                            name="permanentAddress"
                            value={permanentAddress}
                            onChange={(e) =>
                              setPermanentAddress(e.target.value)
                            }
                            rows="1"
                            placeholder="Permanent Address"
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="currentAddress">
                            Current Address:
                          </label>
                          <textarea
                            className="form-control"
                            id="CurrentAddress"
                            name="CurrentAddress"
                            // value={CurrentAddress}
                            // onChange={(e) =>
                            //   setCurrentAddress(e.target.value)
                            // }
                            rows="1"
                            placeholder="Current Address"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-save btn-lg px-4 py-2 m-2"
                    onClick={() => navigate("/customer")}
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
};

export default EditCustomer;
