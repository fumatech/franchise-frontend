import React, { useState, useEffect } from "react";
import axios from "axios";

function PurchaseAndSale() {
  const [purchaseReturn, setPurchaseReturn] = useState(0);
  const [summary, setSummary] = useState({});
  const purchaseIncludingTax = summary.purchaseIncludingTax || 0;
  const saleIncludingTax = summary.saleIncludingTax || 0;
  const purchasePaid = summary.purchaseDue
    ? purchaseIncludingTax - summary.purchaseDue
    : 0;

  // ✅ Apply purchase return
  const netPurchaseIncludingTax = purchaseIncludingTax - purchaseReturn;

  // ✅ Correct purchase due
  const purchaseDue = netPurchaseIncludingTax - purchasePaid;

  const saleDue = summary.saleDue || 0;

  // ✅ Overall
  const finalDueAmount = saleDue - purchaseDue;
  const saleMinusPurchaseIncludingTax =
    saleIncludingTax - netPurchaseIncludingTax;

  const franchiseId =
    localStorage.getItem("tenantDbName") ||
    sessionStorage.getItem("tenantDbName");
  console.log(franchiseId);

  const fetchSummary = async () => {
    try {
      const [summaryRes, returnRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/summary/purchase-sale`),
        axios.get(
          `https://fusionmastertech.com:8443/franchise-purchase-return/franchise/${franchiseId}/total-amount`
        ),
      ]);

      setSummary(summaryRes.data);
      setPurchaseReturn(returnRes.data || 0);
    } catch (error) {
      console.error("Error fetching purchase-sale summary:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-12 col-md-6">
                  <h1 className="all-heading">Purchase And Sale</h1>
                </div>
              </div>
            </div>
          </section>

          <section className="content">
            <div className="container-fluid">
              <div className="row">
                {/* PURCHASE */}
                <div className="col-md-6">
                  <div className="card p-2 cardHover rounded-4 border-0 w-auto">
                    <h3 className="text-muted">Purchases</h3>

                    <table className="table table-striped">
                      <tbody>
                        <tr>
                          <th>Total Purchase:</th>
                          <td>
                            <span className="total_purchase">
                              ₹ {summary.totalPurchase || 0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Purchase Including Tax:</th>
                          <td>
                            <span className="purchase_inc_tax">
                              ₹ {summary.purchaseIncludingTax || 0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Total Purchase Return Including Tax:</th>
                          <td>
                            <span className="purchase_return_inc_tax">
                              ₹ {purchaseReturn}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>
                            Purchase Due:
                            <i className="fa fa-info-circle text-info hover-q no-print responsive-icon" />
                          </th>
                          <td>
                            <span className="purchase_due">
                              ₹ {summary.purchaseDue || 0}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SALES */}
                <div className="col-md-6">
                  <div className="card p-2 cardHover rounded-4 border-0 w-auto">
                    <h3 className="text-muted">Sales</h3>

                    <table className="table table-striped">
                      <tbody>
                        <tr>
                          <th>Total Sale:</th>
                          <td>
                            <span className="total_sell">
                              ₹ {summary.totalSale || 0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Sale Including Tax:</th>
                          <td>
                            <span className="sell_inc_tax">
                              ₹ {summary.saleIncludingTax || 0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Total Sell Return Including Tax:</th>
                          <td>
                            <span className="total_sell_return">
                              ₹ {summary.totalSaleReturnIncludingTax || 0}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>
                            Sale Due:
                            <i className="fa fa-info-circle text-info hover-q no-print responsive-icon" />
                          </th>
                          <td>
                            <span className="sell_due">
                              ₹ {summary.saleDue || 0}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* OVERALL */}
              <div className="row">
                <div className="card p-2 cardHover rounded-4 border-0">
                  <div className="col-12">
                    <h4>
                      Overall (Sale - Purchase)
                      <i className="fa fa-info-circle text-info hover-q no-print" />
                    </h4>

                    <h3 className="text-muted">
                      Sale - Purchase:
                      <span
                        className={`sell_minus_purchase ${
                          saleMinusPurchaseIncludingTax < 0
                            ? "text-danger"
                            : "text-success"
                        }`}
                      >
                        ₹{saleMinusPurchaseIncludingTax.toFixed(2)}
                      </span>
                    </h3>

                    <h3 className="text-muted">
                      Due amount:
                      <span
                        className={`difference_due ${
                          finalDueAmount < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        ₹{finalDueAmount.toFixed(2)}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="text-center py-3">
                  <button
                    className="btn btn-save btn-lg px-4 py-2 m-2"
                    onClick={handlePrint}
                  >
                    <i className="fa fa-print"></i> Print
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default PurchaseAndSale;
