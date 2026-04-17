import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  seller?: {
    id: number;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onDelete?: (productId: number) => void;
  isAddingToCart: boolean;
  canDelete?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onDelete,
  isAddingToCart,
  canDelete = false,
}: ProductCardProps) {
  return (
    <div className="product-card flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(product.id)}
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-neutral-400 backdrop-blur-sm transition-colors hover:bg-red-600 hover:text-white"
            title="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-white">{product.name}</h3>

        <div className="mt-2">
          <span className="price-tag">${product.price.toFixed(2)}</span>
        </div>

        {product.seller && (
          <p className="mt-1 seller-text">
            Sold by <span className="text-blue-400">{product.seller.name}</span>
          </p>
        )}

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{product.description}</p>
        )}

        <div className="mt-auto pt-3">
          <Button
            variant="buy"
            size="sm"
            className="w-full"
            onClick={() => onAddToCart(product.id)}
            disabled={isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
