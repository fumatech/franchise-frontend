import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function BusinessDetails() {
  const navigate = useNavigate();

  const [vendorData, setVendorData] = useState({
    vendorId: "",
    firmName: "",
    shopActNumber: "",
    cinNumber: "",
    taxOrGstNumber: "",
    panNumber: "",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        if (email) {
          const response = await axios.get(
            `https://fusionmastertech.com:8443/customer/email/${email}`
          );
          if (response.data) {
            setVendorData({
              franchiseId: response.data.franchiseId,
              franchiseName: response.data.franchiseName,
              shopActNumber: response.data.shopActNumber,
              cinNumber: response.data.cinNumber,
              taxOrGstNumber: response.data.taxOrGstNumber,
              panNumber: response.data.panNumber,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching business details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading business details...</div>;
  }

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
        <section className="content">
          <div className="container-fluid">
            <div className="card rounded-4 border-0 cardHover">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Franchise ID</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.franchiseId}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Franchise Name</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.franchiseName}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Shop Act Number</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.shopActNumber}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>CIN Number</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.cinNumber}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Tax/GST Number</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.taxOrGstNumber}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>PAN Number</label>
                      <div className="form-control-plaintext p-2 border rounded bg-light">
                        {vendorData.panNumber}
                      </div>
                    </div>
                  </div>
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
