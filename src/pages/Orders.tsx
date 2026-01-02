import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getMyOrders, type Order } from "../api/orders";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "#f39c12",
      PROCESSING: "#3498db",
      SHIPPED: "#9b59b6",
      DELIVERED: "#27ae60",
      CANCELLED: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>My Orders</h1>

        {loading && <p className="loading">Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="empty-orders">
                <p className="no-data">You haven't placed any orders yet.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="btn-primary"
                  style={{ width: "auto", padding: "12px 24px", marginTop: "20px" }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div
                      className="order-header"
                      onClick={() => toggleOrderDetails(order.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="order-header-left">
                        <div>
                          <span className="order-label">Order #</span>
                          <span className="order-id">{order.id}</span>
                        </div>
                        <div>
                          <span className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-header-right">
                        <span
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                        <span className="order-total">${order.total.toFixed(2)}</span>
                        <span className="expand-icon">
                          {expandedOrder === order.id ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="order-details">
                        <div className="order-items-section">
                          <h3>Items</h3>
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="order-item">
                              <div className="order-item-info">
                                <span className="order-item-name">{item.product.name}</span>
                                <span className="order-item-quantity">Qty: {item.quantity}</span>
                              </div>
                              <span className="order-item-price">
                                ${item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary-section">
                          <div className="order-summary-row">
                            <span>Subtotal:</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="order-summary-row">
                            <span>Tax:</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="order-summary-row total">
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="order-addresses">
                          <div className="address-block">
                            <h4>Shipping Address</h4>
                            <p>{order.shippingAddress}</p>
                          </div>
                          <div className="address-block">
                            <h4>Payment Method</h4>
                            <p>{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;