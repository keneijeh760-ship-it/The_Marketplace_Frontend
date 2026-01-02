import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllProducts, createProduct, deleteProduct, uploadImage, type Product } from "../api/products";
import { addToCart } from "../api/Cart";
import { useAuth } from "../auth/AuthContext";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);  // ✅ NEW
  const [imagePreview, setImagePreview] = useState<string | null>(null);  // ✅ NEW
  const [uploadingImage, setUploadingImage] = useState(false);  // ✅ NEW
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const auth = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
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

  // ✅ NEW: Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image must be less than 10MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setFormError(null);
    }
  };

  // ✅ NEW: Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      let imageUrl = "";

      // ✅ NEW: Upload image first if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (err) {
          setFormError("Failed to upload image");
          setFormLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Create product with image URL
      await createProduct({
        name,
        price: Number(price),
        description,
        imageUrl,
      });

      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      handleRemoveImage();
      setShowForm(false);

      // Refresh products list
      fetchProducts();
    } catch (err: any) {
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
      alert("Product added to cart!");
    } catch (err) {
      alert("Failed to add to cart");
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct(productId);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product. You can only delete your own products.");
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Products</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/cart")}
              className="btn-secondary"
              style={{ padding: "10px 20px" }}
            >
              🛒 View Cart
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ padding: "10px 20px" }}
            >
              {showForm ? "Cancel" : "Sell a Product"}
            </button>
          </div>
        </div>

        {/* Create Product Form */}
        {showForm && (
          <div className="transfer-form-container">
            <h2>List Your Product for Sale</h2>
            <form onSubmit={handleSubmit} className="transfer-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                  required
                />
              </div>

              {/* ✅ NEW: Image Upload Section */}
              <div className="form-group">
                <label>Product Image</label>
                
                {!imagePreview ? (
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    {/* Take Photo Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="btn-secondary"
                      style={{ flex: 1, padding: "12px" }}
                    >
                      📷 Take Photo
                    </button>
                    
                    {/* Choose File Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary"
                      style={{ flex: 1, padding: "12px" }}
                    >
                      📁 Choose File
                    </button>

                    {/* Hidden file inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: "12px" }}>
                    {/* Image Preview */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "300px",
                      margin: "0 auto"
                    }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          border: "2px solid #ddd"
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          cursor: "pointer",
                          fontSize: "18px"
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <p style={{ textAlign: "center", marginTop: "8px", fontSize: "14px", color: "#666" }}>
                      {imageFile?.name}
                    </p>
                  </div>
                )}

                <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  Upload a photo of your product (Max 10MB)
                </small>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={formLoading || uploadingImage}
              >
                {uploadingImage ? "Uploading Image..." : formLoading ? "Listing..." : "List Product"}
              </button>
            </form>

            {formError && <div className="error-message">{formError}</div>}
          </div>
        )}

        {/* Products List */}
        <div className="transactions-section">
          <h2>All Products</h2>

          {loading && <p className="loading">Loading products...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <p className="no-data">No products available.</p>
              ) : (
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product.id} className="product-card">
                      {product.imageUrl && (
                        <div className="product-image-container">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}

                      {product.seller && (
                        <p className="product-seller">
                          Sold by: <strong>{product.seller.name}</strong>
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="btn-primary"
                          disabled={addingToCart === product.id}
                          style={{ flex: 1 }}
                        >
                          {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                        </button>
                        
                        {product.seller && auth.token && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn-remove"
                            style={{ padding: "8px 12px" }}
                            title="Delete this product"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;