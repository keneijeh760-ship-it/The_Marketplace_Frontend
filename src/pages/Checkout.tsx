import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { getCart, type CartItem } from "../api/Cart";
import { getProducts, type Product } from "../api/products";
import { checkout } from "../api/orders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  CheckCircle,
  ChevronLeft,
  Lock,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Cart", icon: ShoppingCart },
  { id: 2, name: "Shipping", icon: Truck },
  { id: 3, name: "Payment", icon: CreditCard },
  { id: 4, name: "Confirm", icon: CheckCircle },
];

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("account_balance");
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartData, productsData] = await Promise.all([getCart(), getProducts()]);
        if (cartData.length === 0) {
          navigate("/cart");
          return;
        }
        setCartItems(cartData);
        setProducts(productsData);
      } catch (err) {
        setError("Failed to load checkout");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getProductImage = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.imageUrl;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

      navigate("/orders");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-container py-8">
          <div className="flex items-center justify-center py-20">
            <div className="skeleton h-8 w-48 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">Secure Checkout</h1>
          <p className="text-sm text-neutral-500">Review delivery details and pay from your preferred wallet rail.</p>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === 2 || step.id === 3;
              const isCompleted = step.id === 1;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isCompleted && "bg-green-500/15 text-green-400",
                      isActive && "bg-blue-500/15 text-blue-400",
                      !isCompleted && !isActive && "bg-white/5 text-neutral-500"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-2 h-px w-6 bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <Link
              to="/cart"
              className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to cart
            </Link>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping" className="sr-only">
                    Shipping address
                  </Label>
                  <Textarea
                    id="shipping"
                    placeholder="Enter your full address&#10;Street, City, State, ZIP"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="rounded border-white/20 bg-neutral-900"
                  />
                  Billing address same as shipping
                </label>

                {!sameAsShipping && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="billing">Billing Address</Label>
                    <Textarea
                      id="billing"
                      placeholder="Enter billing address"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      required={!sameAsShipping}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                </div>

                <div className="space-y-2">
                  {[
                    { value: "account_balance", label: "Wallet Balance", icon: Wallet, desc: "Pay from your account" },
                    { value: "credit_card", label: "Credit Card", icon: CreditCard, desc: "Visa, Mastercard" },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                          paymentMethod === method.value
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-neutral-900/50 hover:border-white/20"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <Icon className={cn("h-5 w-5", paymentMethod === method.value ? "text-blue-400" : "text-neutral-500")} />
                        <div>
                          <div className="font-medium text-white">{method.label}</div>
                          <div className="text-xs text-neutral-500">{method.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button variant="buy" size="lg" className="w-full" disabled={submitting}>
                <Lock className="mr-1 h-4 w-4" />
                {submitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Order Summary</h2>

              <div className="max-h-64 space-y-3 overflow-y-auto">
                {cartItems.map((item) => {
                  const imageUrl = getProductImage(item.product.id);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-neutral-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-white">${item.subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tax (10%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
