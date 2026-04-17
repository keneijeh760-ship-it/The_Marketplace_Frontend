import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "../api/Cart";
import { getProducts, type Product } from "../api/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartData, productsData] = await Promise.all([getCart(), getProducts()]);
      setCartItems(cartData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductImage = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.imageUrl;
  };

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemQuantity(cartItemId, { quantity: newQuantity });
      fetchData();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      fetchData();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Remove all items from cart?")) return;
    try {
      await clearCart();
      fetchData();
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-neutral-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
              <p className="text-sm text-neutral-500">Wallet-backed checkout for your selected items.</p>
            </div>
            {!loading && cartItems.length > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          {cartItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearCart} className="text-red-400 hover:text-red-300">
              <Trash2 className="mr-1 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-white/8 bg-[#141414] p-4">
                <div className="skeleton h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-1/3 rounded" />
                  <div className="skeleton h-4 w-1/4 rounded" />
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

        {!loading && !error && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#141414] py-20">
            <ShoppingBag className="h-16 w-16 text-neutral-700" />
            <h2 className="mt-4 text-xl font-semibold text-white">Your cart is empty</h2>
            <p className="mt-2 text-neutral-500">Browse products and add items to your cart</p>
            <Button variant="buy" className="mt-6" onClick={() => navigate("/products")}>
              Start Shopping
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {cartItems.map((item) => {
                const imageUrl = getProductImage(item.product.id);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-white/8 bg-[#141414] p-4 transition-colors hover:border-white/15"
                  >
                    <Link to="/products" className="shrink-0">
                      <div className="h-24 w-24 overflow-hidden rounded-lg bg-neutral-900">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-neutral-700" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-white line-clamp-2">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500">${item.product.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-neutral-900/50">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="rounded-l-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[3rem] text-center text-sm font-medium text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="rounded-r-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-sm text-red-400 transition-colors hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <span className="price-tag">${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
                <h2 className="text-lg font-semibold text-white">Order Summary</h2>

                <div className="mt-4 space-y-3 border-b border-white/10 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Subtotal ({cartItems.length} items)</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Estimated Tax</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-white">${grandTotal.toFixed(2)}</span>
                </div>

                <Button variant="buy" size="lg" className="mt-6 w-full" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>

                <p className="mt-4 text-center text-xs text-neutral-500">
                  Secure checkout powered by our escrow system
                </p>
              </div>

              <Link
                to="/products"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
