import React from "react";

const SaleInvoice = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 border border-gray-300">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 ">
        <div>
          <h1 className="text-2xl font-bold">My Company Name</h1>
          <p className="text-sm text-gray-600">My company slogan</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Invoice</h2>
          <div className="space-y-1">
            <p>
              <strong>Date:</strong> September 3, 2013
            </p>

            <p>
              <strong>Invoice #:</strong> INV-00000
            </p>
            <p>
              <strong>Customer ID:</strong> [ABC12345]
            </p>
            <p>
              <strong>Purchase Order #:</strong> 12345678
            </p>
            <p>
              <strong>Payment Due by:</strong> October 3, 2013
            </p>
          </div>
        </div>
      </div>

      {/* Bill To & Shipping Info */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="border rounded">
            <h3 className="font-bold bg-blue-600 text-white p-2">Bill To:</h3>
            <div className="p-2">
              <p>[Name]</p>
              <p>[Company Name]</p>
              <p>[Street Address]</p>
              <p>[City, ST ZIP Code]</p>
              <p>[Phone]</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border rounded">
            <h3 className="font-bold bg-blue-600 text-white p-2">
              Salesperson
            </h3>
            <p className="p-2">[Name]</p>
          </div>
          <div className="border rounded">
            <h3 className="font-bold bg-blue-600 text-white p-2">
              Shipping Method
            </h3>
            <p className="p-2">-</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 grid grid-cols-4 gap-4 border p-2 rounded">
        <div>
          <p>
            <strong>Shipping Terms:</strong>
          </p>
          <p>-</p>
        </div>
        <div>
          <p>
            <strong>Payment Terms:</strong>
          </p>
          <p>-</p>
        </div>
        <div>
          <p>
            <strong>Due Date:</strong>
          </p>
          <p>-</p>
        </div>
        <div>
          <p>
            <strong>Delivery Date:</strong>
          </p>
          <p>-</p>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full mt-4 border-collapse border">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="border p-2">Item #</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Line Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="border p-2">112233</td>
            <td className="border p-2">-</td>
            <td className="border p-2">2</td>
            <td className="border p-2">$35.00</td>
            <td className="border p-2">$70.00</td>
          </tr>
          <tr className="text-center">
            <td className="border p-2">445566</td>
            <td className="border p-2">-</td>
            <td className="border p-2">1</td>
            <td className="border p-2">$35.00</td>
            <td className="border p-2">$35.00</td>
          </tr>
        </tbody>
      </table>

      {/* Total Section */}
      <div className="flex justify-end mt-4">
        <div className="w-1/3 border p-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>$105.00</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax Rate:</span>
            <span>0.00%</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>S&H:</span>
            <span>$ </span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>$ </span>
          </div>
          <div className="flex justify-between border-t mt-2 pt-2 font-bold">
            <span>Total:</span>
            <span>$105.00</span>
          </div>
        </div>
      </div>

      {/* Special Notes */}
      <div className="mt-4 p-2 border rounded">
        <h3 className="font-bold">Special Notes and Instructions</h3>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center space-y-2">
        <p>
          Make all checks payable to <strong>My Company Name</strong>
        </p>
        <p className="font-bold">Thank you for your business!</p>
        <p>
          Should you have any enquiries concerning this invoice, please contact
        </p>
        <p>John Doe on 0-000-000-0000</p>
        <div className="mt-4 text-sm">
          <p>111 Street, Town/City County, ST, 00000</p>
          <p>Tel: 0-000-000-0000 | Fax: 0-000-000-0000</p>
          <p>E-mail: info@yourcompanysite.com | Web: www.yourcompanysite.com</p>
        </div>
      </div>

      {/* Remittance Slip */}
      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-blue-600">My Company Name</h3>
            <p className="text-sm">My company slogan</p>
          </div>
          <h3 className="text-xl font-bold text-blue-600">Remittance Slip</h3>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border p-4 rounded">
          <div className="space-y-2">
            <p>
              <strong>Check No.:</strong> ________________
            </p>
            <p>
              <strong>Date:</strong> ________________
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Customer ID:</strong> [ABC12345]
            </p>
            <p>
              <strong>Total Amount:</strong> $150.00
            </p>
            <p>
              <strong>Invoice #:</strong> INV-00000
            </p>
            <p>
              <strong>Balance to Pay:</strong> $45.00
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm">
          <p>Please return this slip along with your payment</p>
          <p className="mt-2">111 Street, Town/City, County, ST, 00000</p>
          <p>Tel: 0-000-000-0000 | Fax: 0-000-000-0000</p>
          <p>E-mail: info@yourcompanysite.com | Web: www.yourcompanysite.com</p>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoice;
