import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getCart, type CartItem } from "../api/Cart";
import { checkout } from "../api/orders";

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        if (data.length === 0) {
          navigate("/cart");
          return;
        }
        setCartItems(data);
      } catch (err) {
        setError("Failed to load cart");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const finalBillingAddress = sameAsShipping ? shippingAddress : billingAddress;
      
      await checkout({
        shippingAddress,
        billingAddress: finalBillingAddress,
        paymentMethod,
      });

      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <p className="loading">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Checkout</h1>

        <div className="checkout-container">
          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <span className="checkout-item-name">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="checkout-item-price">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Tax (10%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="checkout-total-row final">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkout-form-section">
            <h2>Shipping & Payment</h2>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Shipping Address */}
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  placeholder="123 Main St, City, State, ZIP"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Billing Address */}
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                  />
                  Billing address same as shipping
                </label>
              </div>

              {!sameAsShipping && (
                <div className="form-group">
                  <label>Billing Address</label>
                  <textarea
                    placeholder="123 Main St, City, State, ZIP"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    required
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;