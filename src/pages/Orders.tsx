import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getMyOrders, type Order } from "../api/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

function getStatusConfig(status: string) {
  const s = status?.toUpperCase() || "";
  switch (s) {
    case "DELIVERED":
    case "COMPLETED":
      return { variant: "delivered" as const, icon: CheckCircle, label: "Delivered" };
    case "SHIPPED":
      return { variant: "shipped" as const, icon: Truck, label: "Shipped" };
    case "PROCESSING":
      return { variant: "processing" as const, icon: Package, label: "Processing" };
    case "CANCELLED":
      return { variant: "cancelled" as const, icon: XCircle, label: "Cancelled" };
    default:
      return { variant: "pending" as const, icon: Clock, label: "Pending" };
  }
}

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

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-6 flex items-center gap-3">
          <Package className="h-6 w-6 text-neutral-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            <p className="text-sm text-neutral-500">Track fulfillment and payout-safe order progress.</p>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-[#141414] p-5">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="skeleton h-5 w-32 rounded" />
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                  <div className="skeleton h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#141414] py-20">
            <ShoppingBag className="h-16 w-16 text-neutral-700" />
            <h2 className="mt-4 text-xl font-semibold text-white">No orders yet</h2>
            <p className="mt-2 text-neutral-500">When you make a purchase, it will appear here</p>
            <Button variant="buy" className="mt-6" onClick={() => navigate("/products")}>
              Start Shopping
            </Button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isOpen = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-white/8 bg-[#141414] transition-colors hover:border-white/15"
                >
                  <button
                    type="button"
                    onClick={() => toggleOrderDetails(order.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        statusConfig.variant === "delivered" && "bg-green-500/15",
                        statusConfig.variant === "shipped" && "bg-purple-500/15",
                        statusConfig.variant === "processing" && "bg-blue-500/15",
                        statusConfig.variant === "pending" && "bg-yellow-500/15",
                        statusConfig.variant === "cancelled" && "bg-red-500/15"
                      )}>
                        <StatusIcon className={cn(
                          "h-5 w-5",
                          statusConfig.variant === "delivered" && "text-green-400",
                          statusConfig.variant === "shipped" && "text-purple-400",
                          statusConfig.variant === "processing" && "text-blue-400",
                          statusConfig.variant === "pending" && "text-yellow-400",
                          statusConfig.variant === "cancelled" && "text-red-400"
                        )} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Order #{order.id}</span>
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">{order.orderItems.length} items</p>
                        <p className="text-lg font-bold text-white">${order.total.toFixed(2)}</p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/8 bg-neutral-900/30 p-5">
                      <div className="mb-4">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          Items Ordered
                        </h3>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-lg bg-neutral-900/50 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800">
                                  <ShoppingBag className="h-5 w-5 text-neutral-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{item.product.name}</p>
                                  <p className="text-xs text-neutral-500">
                                    ${item.priceAtPurchase.toFixed(2)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-medium text-white">${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-neutral-900/50 p-4">
                          <div className="flex items-center gap-2 text-neutral-500">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Shipping</span>
                          </div>
                          <p className="mt-2 text-sm text-neutral-300">{order.shippingAddress || "Not provided"}</p>
                        </div>

                        <div className="rounded-lg bg-neutral-900/50 p-4">
                          <div className="flex items-center gap-2 text-neutral-500">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Payment</span>
                          </div>
                          <p className="mt-2 text-sm text-neutral-300 capitalize">
                            {order.paymentMethod?.replace("_", " ") || "Not provided"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-neutral-900/50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Summary</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Subtotal</span>
                              <span className="text-neutral-300">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Tax</span>
                              <span className="text-neutral-300">${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-1 font-semibold">
                              <span className="text-white">Total</span>
                              <span className="text-white">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
