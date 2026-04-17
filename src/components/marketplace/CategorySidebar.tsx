import {
  Laptop,
  Shirt,
  Home,
  Car,
  Gamepad2,
  Book,
  Camera,
  Watch,
  Dumbbell,
  Music,
  Sparkles,
  Grid3X3,
} from "lucide-react";

const categories = [
  { id: "all", name: "All Categories", icon: Grid3X3 },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "fashion", name: "Fashion", icon: Shirt },
  { id: "home", name: "Home & Garden", icon: Home },
  { id: "motors", name: "Motors", icon: Car },
  { id: "gaming", name: "Video Games", icon: Gamepad2 },
  { id: "books", name: "Books", icon: Book },
  { id: "cameras", name: "Cameras & Photo", icon: Camera },
  { id: "watches", name: "Watches", icon: Watch },
  { id: "sports", name: "Sporting Goods", icon: Dumbbell },
  { id: "music", name: "Musical Instruments", icon: Music },
  { id: "collectibles", name: "Collectibles", icon: Sparkles },
];

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-20">
        <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Shop by Category
        </h3>
        <nav className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`category-item w-full text-left ${isActive ? "active" : ""}`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
