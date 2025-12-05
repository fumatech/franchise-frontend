import React from "react";

function SellInvoice({ sellInvoice }) {
  if (!sellInvoice || !Array.isArray(sellInvoice.salePaymentMethod)) {
    // Handle case where sellInvoice or salePaymentMethod is missing
    return <div>No sale data available</div>;
  }

  const totalPaid = sellInvoice.salePaymentMethod.reduce(
    (sum, pm) => sum + pm.amount,
    0
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Invoice</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "8px" }}>Date</th>
            <th style={{ border: "1px solid #000", padding: "8px" }}>
              Invoice No
            </th>
            <th style={{ border: "1px solid #000", padding: "8px" }}>
              Customer Name
            </th>
            <th style={{ border: "1px solid #000", padding: "8px" }}>
              Total Amount
            </th>
            <th style={{ border: "1px solid #000", padding: "8px" }}>
              Total Paid
            </th>
            <th style={{ border: "1px solid #000", padding: "8px" }}>
              Sell Due
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {sellInvoice.saleDate}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {sellInvoice.invoiceNo}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {sellInvoice.customer}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {sellInvoice.totalAmount}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {totalPaid}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {sellInvoice.sellDue}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SellInvoice;
