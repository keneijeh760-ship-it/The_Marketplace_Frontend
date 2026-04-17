import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import { getProducts, createProduct, deleteProduct, uploadImage, type Product } from "../api/products";
import { addToCart } from "../api/Cart";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { CreateListingModal } from "@/components/marketplace/CreateListingModal";
import { Plus, Package, Search, SlidersHorizontal } from "lucide-react";

function ProductSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-10 w-full rounded-lg mt-4" />
      </div>
    </div>
  );
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("search") || "").trim();

  const auth = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.seller?.name?.toLowerCase().includes(query);

      const matchesMin = min === null || product.price >= min;
      const matchesMax = max === null || product.price <= max;

      return matchesSearch && matchesMin && matchesMax;
    });

    if (sortBy === "price_asc") {
      return [...result].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price_desc") {
      return [...result].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [products, searchQuery, minPrice, maxPrice, sortBy]);

  const handleCreateListing = async (data: {
    name: string;
    price: number;
    description: string;
    imageFile: File | null;
  }) => {
    setFormError(null);
    setFormLoading(true);

    try {
      let imageUrl = "";

      if (data.imageFile) {
        try {
          imageUrl = await uploadImage(data.imageFile);
        } catch {
          setFormError("Failed to upload image");
          setFormLoading(false);
          return;
        }
      }

      await createProduct({
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl,
      });

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setFormError("Failed to create product");
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await addToCart({ productId, quantity: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      await deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-6">
        <main>
          <div className="mb-6 rounded-2xl border border-white/8 bg-[#141414] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : "Marketplace Search"}
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  {loading ? "Loading..." : `${filteredProducts.length} listings matched`}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setSortBy("relevance");
                }}>
                  Reset filters
                </Button>
                <Button variant="buy" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4" />
                  List Product
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <div className="rounded-lg border border-white/10 bg-neutral-900/50 px-10 py-2.5 text-sm text-neutral-400">
                  {searchQuery || "Use the top search bar to find products by name, description, or seller"}
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm">
                <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-500">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent text-neutral-200 outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-200 outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-200 outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#141414] py-20">
              <Package className="h-12 w-12 text-neutral-600" />
              <p className="mt-4 text-neutral-400">No products found with these filters</p>
              <Button variant="buy" className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                Create a listing
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onDelete={handleDeleteProduct}
                  isAddingToCart={addingToCart === product.id}
                  canDelete={!!auth.token && !!product.seller}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateListingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateListing}
        isLoading={formLoading}
        error={formError}
      />
    </div>
  );
};

export default Products;
