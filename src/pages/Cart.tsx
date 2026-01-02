import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "../api/Cart";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCartItems(data);
      setError(null);
    } catch (err) {
      setError("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItemQuantity(cartItemId, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await clearCart();
      fetchCart();
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="btn-secondary"
              style={{ background: "#e74c3c" }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {loading && <p className="loading">Loading cart...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p className="no-data">Your cart is empty.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="btn-primary"
                  style={{ width: "auto", padding: "12px 24px", marginTop: "20px" }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <h3>{item.product.name}</h3>
                        <p className="cart-item-price">${item.product.price.toFixed(2)} each</p>
                      </div>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="qty-btn"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="cart-item-subtotal">
                          ${item.subtotal.toFixed(2)}
                        </div>
                        
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span className="summary-value">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (10%):</span>
                    <span className="summary-value">${(calculateTotal() * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="summary-value">${(calculateTotal() * 1.10).toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="btn-primary"
                    style={{ marginTop: "20px" }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;