import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BusinessDetails.css";

function BusinessDetails() {
  const navigate = useNavigate();
  const [franchiseData, setFranchiseData] = useState({
    franchiseId: "",
    franchiseName: "",
    shopActNumber: "",
    cinNumber: "",
    taxOrGstNumber: "",
    panNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchFranchiseData = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        const userType = sessionStorage.getItem("userType");

        if (!email) {
          navigate("/login");
          return;
        }

        const primaryEndpoint =
          userType === "admin"
            ? `https://fusionmastertech.com:8443/customer/email/${email}`
            : `${process.env.REACT_APP_BASE_URL}/user/email/${email}`;

        let data = null;

        try {
          const response = await axios.get(primaryEndpoint);
          data = response.data;
        } catch (primaryError) {
          if (userType === "admin") {
            const fallbackResponse = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/customer/email/${email}`
            );
            data = fallbackResponse.data;
          } else {
            throw primaryError;
          }
        }

        if (!data) {
          throw new Error("Franchise not found");
        }

        setFranchiseData({
          franchiseId: data.franchiseId || data.vendorId || "N/A",
          franchiseName:
            data.franchiseName || data.firmName || data.firstname || "N/A",
          shopActNumber: data.shopActNumber || "N/A",
          cinNumber: data.cinNumber || "N/A",
          taxOrGstNumber: data.taxOrGstNumber || "N/A",
          panNumber: data.panNumber || "N/A",
        });

        setMessage({ text: "", type: "" });
      } catch (error) {
        console.error("Error fetching franchise data:", error);
        setMessage({ text: "Failed to load business details", type: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchFranchiseData();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-5">Loading business details...</div>;
  }

  const detailRows = [
    { label: "Franchise ID", value: franchiseData.franchiseId },
    { label: "Franchise Name", value: franchiseData.franchiseName },
    { label: "Shop Act Number", value: franchiseData.shopActNumber },
    { label: "CIN Number", value: franchiseData.cinNumber },
    { label: "Tax/GST Number", value: franchiseData.taxOrGstNumber },
    { label: "PAN Number", value: franchiseData.panNumber },
  ];

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading fs-2">Business Details</h1>
              </div>
            </div>
          </div>
        </section>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <section className="content">
          <div className="container-fluid">
            <div className="card rounded-4 border-0 cardHover business-details-card">
              <div className="card-body">
                <div className="business-details-table-wrapper">
                  <table className="table business-details-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Business Field</th>
                        <th scope="col">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map((row) => (
                        <tr key={row.label}>
                          <td data-label="Business Field">{row.label}</td>
                          <td data-label="Details">{row.value || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BusinessDetails;
