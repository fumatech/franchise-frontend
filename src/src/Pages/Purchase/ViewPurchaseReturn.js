import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./PurchaseOrder.css";

function ViewPurchaseReturn() {
  const { id } = useParams();
  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [orderDate, setOrderDate] = useState();
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [vendorlist, setVendorList] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://fusionmastertech.com:8443/franchise-purchase-return/get/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch purchase data");
        }

        const purchase = await response.json();

        setVendor(purchase.vendor);
        setReferenceNumber(purchase.referenceNumber);
        setAddedBy(purchase.addedBy);
        setOrderDate(new Date(purchase.orderDate));
        setLocation(purchase.location);
        setAdditionalNotes(purchase.additionalNotes);

        // Fetch stock for each product variation and map it to selectedProducts
        const selectedProducts = await Promise.all(
          purchase.franchisePurchaseReturnItems.map(async (item) => {
            try {
              // Fetch stock data for the product variation
              const stockResponse = await fetch(
                `${process.env.REACT_APP_BASE_URL}/product-stock/getstock/${item.productVariationId}`
              );
              const stockData = await stockResponse.json();
              console.log(
                "Stock Data for",
                item.productVariationId,
                ":",
                stockData
              );

              // Extract the actual stock value from the response
              // Adjust this based on your actual API response structure
              const stockValue =
                stockData.stock ||
                stockData.quantity ||
                stockData.stockQuantity ||
                0;

              return {
                id: item.id,
                productName: item.productName,
                sku: item.productSku,
                quantity: item.quantity,
                variationValue: item.productVariationName,
                productVariationId: item.productVariationId,
                stock: stockValue, // Use the extracted numeric value instead of the entire object
              };
            } catch (error) {
              console.error(
                `Error fetching stock for variation ${item.productVariationId}:`,
                error
              );
              return {
                id: item.id,
                productName: item.productName,
                sku: item.productSku,
                quantity: item.quantity,
                variationValue: item.productVariationName,
                productVariationId: item.productVariationId,
                stock: 0, // Default to 0 if there's an error
              };
            }
          })
        );

        // Set selectedVariations to be based on purchase items for editing
        const selectedVariations = {};
        purchase.franchisePurchaseReturnItems.forEach((item) => {
          selectedVariations[item.productVariationId] = true;
        });

        setSelectedProducts(selectedProducts);
        setSelectedVariations(selectedVariations);
        setProductsData(purchase.franchisePurchaseReturnItems);
        setTotalUnits(purchase.totalItems);
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [id]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        const data = await response.json();
        setVendorList(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const calculatedTotalUnits = selectedProducts.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
    setTotalUnits(calculatedTotalUnits);
  }, [selectedProducts]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      await searchProducts(value);
    } else {
      setSearchResults([]);
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `https://fusionmastertech.com:8443/product/search?query=${query}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchProducts(searchTerm);
    }
  };

  const handleAddProduct = async (product) => {
    const variationsToAdd = product.productVariations.filter(
      (variation) => selectedVariations[variation.id]
    );

    if (variationsToAdd.length === 0) {
      alert("Please select at least one variation to add.");
      return;
    }

    let duplicateFound = false;

    const newProducts = await Promise.all(
      variationsToAdd.map(async (variation) => {
        const existingProduct = selectedProducts.find(
          (p) => p.id === product.id && p.variationId === variation.id
        );

        if (existingProduct) {
          duplicateFound = true;
          return null;
        } else {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_BASE_URL}/product-stock/getstock/${variation.id}`
            );
            const stockData = await response.json();

            // Extract the actual stock value
            const stockValue =
              stockData.stock ||
              stockData.quantity ||
              stockData.stockQuantity ||
              0;

            console.log("Stock Data:", stockValue);
            return {
              id: product.id,
              productName: product.productName,
              sku: product.sku,
              variationId: variation.id,
              variationName: variation.name,
              variationValue: variation.variationValue,
              quantity: 1,
              stock: stockValue, // Use the extracted numeric value
            };
          } catch (error) {
            console.error(
              `Error fetching stock for variation ${variation.id}:`,
              error
            );
            return {
              id: product.id,
              productName: product.productName,
              sku: product.sku,
              variationId: variation.id,
              variationName: variation.name,
              variationValue: variation.variationValue,
              quantity: 1,
              stock: 0, // Default to 0 on error
            };
          }
        }
      })
    );

    const filteredProducts = newProducts.filter(Boolean);

    if (duplicateFound) {
      alert(
        "This product with variation is already added. Please increase the quantity."
      );
    } else if (filteredProducts.length > 0) {
      setSelectedProducts((prev) => [...prev, ...filteredProducts]);
    }

    setSelectedVariations({});
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleVariationSelect = (variationId, isSelected) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationId]: isSelected,
    }));
  };

  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: parseInt(value) } : product
      )
    );
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedOrderDate = orderDate
      ? orderDate.toISOString().split("T")[0]
      : null;

    const orderItems = selectedProducts.map((product) => ({
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.id,
      productVariationName: product.variationValue,
      quantity: product.quantity,
    }));

    const payload = {
      id: id,
      vendor,
      referenceNumber,
      addedBy,
      orderDate: formattedOrderDate,
      location,
      file,
      totalItems: totalUnits,
      additionalNotes,
      orderItems,
    };

    console.log("Payload:", payload);
    try {
      const response = await fetch(
        `https://fusionmastertech.com:8443/franchise-purchase-return/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading">view Purchase return</h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form onSubmit={handleSubmit}>
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="dropdown">
                          <div className="">
                            <label className="me-2 d-md-inline">Vendor</label>
                            <div className="d-flex align-items-center">
                              <select
                                className="form-select me-2"
                                id="vendor"
                                name="vendor"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                required
                                disabled
                              >
                                <option>Fuma</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referenceNumber">
                            Reference No<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="referenceNumber"
                            name="referenceNumber"
                            placeholder="Enter here.."
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="addedBy">
                            Added By<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="addedBy"
                            name="addedBy"
                            placeholder="Enter here..."
                            value={addedBy}
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Order Date</label>
                          <DatePicker
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            readOnly
                            minDate={new Date()}
                            popperPlacement="top"
                          />
                        </div>
                      </div>
                      {/* <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="location">
                            Location<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="location"
                            name="location"
                            placeholder="Enter here.."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            readOnly
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        {/* <div className="search-bar">
                          <div className="search-input w-100">
                            <i className="fa fa-search search-icon"></i>
                            <input
                              type="text"
                              placeholder="Enter Product name / SKU / Scan bar code"
                              value={searchTerm}
                              onChange={handleSearch}
                              onKeyPress={handleKeyPress}
                            />
                          </div>
                        </div> */}

                        <div className="product-list">
                          {searchTerm && searchResults.length > 0 ? (
                            searchResults.map((product) => (
                              <div key={product.id} className="product-item">
                                <span className="product-name">
                                  {product.productName} ({product.sku}) - Stock:{" "}
                                  {product.stock}
                                </span>
                                {product.productVariations.length > 0 && (
                                  <div className="variations">
                                    <ul>
                                      {product.productVariations.map(
                                        (variation) => (
                                          <li key={variation.id}>
                                            <label>
                                              <input
                                                type="checkbox"
                                                checked={
                                                  selectedVariations[
                                                    variation.id
                                                  ] || false
                                                }
                                                onChange={(e) =>
                                                  handleVariationSelect(
                                                    variation.id,
                                                    e.target.checked
                                                  )
                                                }
                                              />
                                              {variation.name}{" "}
                                              {variation.variationValue}
                                            </label>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleAddProduct(product)}
                                  className="btn btn-add-variation btn-success"
                                >
                                  Add Selected Variations
                                </button>
                              </div>
                            ))
                          ) : searchTerm && searchResults.length === 0 ? (
                            <div className="no-results highlight-message">
                              No products found or the search term is invalid.
                            </div>
                          ) : null}
                        </div>

                        {loading ? (
                          <p>Loading products...</p>
                        ) : selectedProducts.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Product Name</th>
                                  <th>Purchase Return Quantity</th>
                                  <th>Product Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducts.map((product, index) => (
                                  <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {product.productName} ({product.sku}){" "}
                                      {product.variationName}{" "}
                                      {product.variationValue}
                                    </td>
                                    <td>
                                      <div className="d-flex justify-content-center align-items-center">
                                        <input
                                          type="number"
                                          value={product.quantity}
                                          min="1"
                                          max={product.stock}
                                          className="form-control w-50 text-center"
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              product.id,
                                              e.target.value
                                            )
                                          }
                                          readOnly
                                        />
                                      </div>
                                    </td>
                                    <td>
                                      <span>{product.stock}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div>Total units: {totalUnits}</div>
                          </div>
                        ) : (
                          <p>No products found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Additional Notes</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="additional_notes"
                            cols="50"
                            id="additional_notes"
                            value={additionalNotes}
                            onChange={handleAdditionalNotesChange}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2 "
                    disabled
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default ViewPurchaseReturn;
