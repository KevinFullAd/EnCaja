"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    Home,
    LayoutGrid,
    Bookmark,
    ShoppingCart,
    MessageSquare,
    Settings,
    HelpCircle,
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

interface CartItem extends Product {
    quantity: number;
}

// ============================================
// HELPERS
// ============================================
const money = (value: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

const safeUnsplash = (base: string) =>
    `${base}&auto=format&fit=crop&q=80`;

const FALLBACK_IMG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="100%" height="100%" fill="#F3F4F6"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      fill="#9CA3AF" font-family="Arial" font-size="18">No image</text>
  </svg>`);

// ============================================
// DATA
// ============================================
const categories = ["Cakes", "Pastry", "Ice Cream", "Pancakes", "Vegan"] as const;

const products: Product[] = [
    {
        id: 1,
        name: "Raspberry Tart",
        price: 8.12,
        image: safeUnsplash("https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600"),
        category: "Pastry",
    },
    {
        id: 2,
        name: "Lemon Tart",
        price: 2.86,
        image: safeUnsplash("https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?w=600&h=600"),
        category: "Pastry",
    },
    {
        id: 3,
        name: "Chocolate Tart",
        price: 6.12,
        image: safeUnsplash("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=600"),
        category: "Cakes",
    },
    {
        id: 4,
        name: "Fruit Tart",
        price: 6.12,
        image: safeUnsplash("https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&h=600"),
        category: "Pastry",
    },
    {
        id: 5,
        name: "Chocolate Cake",
        price: 24.86,
        image: safeUnsplash("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600"),
        category: "Cakes",
    },
    {
        id: 6,
        name: "Mini Chocolate Cake",
        price: 6.12,
        image: safeUnsplash("https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=600"),
        category: "Cakes",
    },
    {
        id: 7,
        name: "Vanilla Ice Cream",
        price: 3.5,
        image: safeUnsplash("https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&h=600"),
        category: "Ice Cream",
    },
    {
        id: 8,
        name: "Berry Pancakes",
        price: 7.9,
        image: safeUnsplash("https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=600"),
        category: "Pancakes",
    },
    {
        id: 9,
        name: "Vegan Brownie",
        price: 4.75,
        image: safeUnsplash("https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=600"),
        category: "Vegan",
    },
];

// ============================================
// UI PIECES
// ============================================
function Avatar({ initials }: { initials: string }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
            <span className="text-sm font-medium text-violet-600">{initials}</span>
        </div>
    );
}

function Img({
    src,
    alt,
    className,
}: {
    src: string;
    alt: string;
    className?: string;
}) {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onError={(e) => {
                const el = e.currentTarget;
                if (el.src !== FALLBACK_IMG) el.src = FALLBACK_IMG;
            }}
        />
    );
}

// ============================================
// SIDEBAR
// ============================================
interface SidebarProps {
    activeItem: string;
    onItemClick: (item: string) => void;
}

function Sidebar({ activeItem, onItemClick }: SidebarProps) {
    const topItems = [
        { id: "home", icon: Home },
        { id: "grid", icon: LayoutGrid },
        { id: "bookmark", icon: Bookmark },
        { id: "cart", icon: ShoppingCart },
        { id: "messages", icon: MessageSquare },
    ];

    const bottomItems = [
        { id: "settings", icon: Settings },
        { id: "help", icon: HelpCircle },
    ];

    return (
        <aside className="flex w-16 flex-col items-center justify-between bg-white py-6 shadow-[1px_0_0_0] shadow-gray-100">
            <div className="mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                    <span className="text-lg font-bold text-white">C</span>
                </div>
            </div>

            <nav className="flex flex-1 flex-col items-center gap-2">
                {topItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            aria-label={item.id}
                            className={[
                                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                isActive
                                    ? "bg-violet-600 text-white"
                                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
                            ].join(" ")}
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    );
                })}
            </nav>

            <nav className="flex flex-col items-center gap-2">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            aria-label={item.id}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

// ============================================
// CATEGORY TABS
// ============================================
interface CategoryTabsProps {
    categories: readonly string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={[
                            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-gray-900 text-white"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                        ].join(" ")}
                    >
                        {category}
                    </button>
                );
            })}
            <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                aria-label="More categories"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

// ============================================
// PRODUCT CARD/GRID
// ============================================
interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <div className="flex flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-50">
                <Img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>

            <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-900">{product.name}</h3>

            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{money(product.price)}</span>

                <button
                    onClick={() => onAddToCart(product)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800"
                    aria-label={`Add ${product.name}`}
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function ProductGrid({
    products,
    onAddToCart,
}: {
    products: Product[];
    onAddToCart: (product: Product) => void;
}) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    );
}

// ============================================
// CART
// ============================================
function CartItemRow({
    item,
    onIncrease,
    onDecrease,
}: {
    item: CartItem;
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
}) {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                <Img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-gray-900">{item.name}</h4>
                <span className="text-sm font-semibold text-violet-600">{money(item.price)}</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onDecrease(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-violet-600 hover:bg-violet-50"
                    aria-label={`Decrease ${item.name}`}
                >
                    <Minus className="h-4 w-4" />
                </button>

                <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>

                <button
                    onClick={() => onIncrease(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700"
                    aria-label={`Increase ${item.name}`}
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

function OrderSummary({
    subtotal,
    discount,
    serviceChargePct,
    tax,
}: {
    subtotal: number;
    discount: number;
    serviceChargePct: number;
    tax: number;
}) {
    const serviceCharge = subtotal * (serviceChargePct / 100);
    const total = subtotal - discount + serviceCharge + tax;

    return (
        <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{money(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-gray-900">{money(discount)}</span>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service Charge</span>
                <span className="text-gray-900">{serviceChargePct}%</span>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">{money(tax)}</span>
            </div>

            <div className="flex justify-between pt-2 text-base font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{money(total)}</span>
            </div>
        </div>
    );
}

function CurrentOrderPanel({
    cartItems,
    onIncrease,
    onDecrease,
}: {
    cartItems: CartItem[];
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
}) {
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems]
    );

    const discount = 0;
    const serviceChargePct = 20;
    const tax = 0.5;

    const hasItems = cartItems.length > 0;

    return (
        <aside className="flex w-80 flex-col bg-white p-6 shadow-[-1px_0_0_0] shadow-gray-100">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Order</h2>

            <div className="mb-4 flex items-center gap-3">
                <Avatar initials="EW" />
                <span className="font-medium text-gray-900">Emma Wang</span>
            </div>

            <div className="flex-1 overflow-auto">
                {!hasItems ? (
                    <p className="py-8 text-center text-sm text-gray-400">No items in cart</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {cartItems.map((item) => (
                            <CartItemRow key={item.id} item={item} onIncrease={onIncrease} onDecrease={onDecrease} />
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4">
                {hasItems && (
                    <>
                        <OrderSummary
                            subtotal={subtotal}
                            discount={discount}
                            serviceChargePct={serviceChargePct}
                            tax={tax}
                        />
                        <button
                            className="mt-4 w-full rounded-full bg-violet-600 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!hasItems}
                        >
                            Continue
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}

// ============================================
// MAIN CONTENT
// ============================================
function MainContent({
    activeCategory,
    onCategoryChange,
    products,
    onAddToCart,
    searchQuery,
    onSearchChange,
}: {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    products: Product[];
    onAddToCart: (product: Product) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}) {
    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return products.filter((p) => {
            const matchesCategory = p.category === activeCategory;
            const matchesQuery = q.length === 0 || p.name.toLowerCase().includes(q);
            return matchesCategory && matchesQuery;
        });
    }, [products, activeCategory, searchQuery]);

    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
            <div className="mb-6">
                <span className="text-sm font-medium text-violet-600">Items</span>

                <div className="mt-1 flex items-center justify-between gap-4">
                    <button className="flex items-center gap-1 text-2xl font-semibold text-gray-900">
                        Desserts
                        <ChevronDown className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-48 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                            />
                        </div>

                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
                            aria-label="Filters"
                        >
                            <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
            </div>

            {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    No products found.
                </div>
            ) : (
                <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} />
            )}
        </main>
    );
}

// ============================================
// PAGE
// ============================================
export default function POSPageTest() {
    const [activeNavItem, setActiveNavItem] = useState("grid");
    const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>(categories[0]);
    const [searchQuery, setSearchQuery] = useState("");

    // Inicializa el carrito con productos existentes (evita inconsistencias y “broken images”)
    const [cartItems, setCartItems] = useState<CartItem[]>([
        { ...products[0], quantity: 1 },
        { ...products[1], quantity: 1 },
    ]);

    const handleAddToCart = useCallback((product: Product) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const handleIncrease = useCallback((id: number) => {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));
    }, []);

    const handleDecrease = useCallback((id: number) => {
        setCartItems((prev) =>
            prev
                .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
                .filter((item) => item.quantity > 0)
        );
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeItem={activeNavItem} onItemClick={setActiveNavItem} />

            <MainContent
                activeCategory={activeCategory}
                onCategoryChange={(c) => setActiveCategory(c as (typeof categories)[number])}
                products={products}
                onAddToCart={handleAddToCart}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <CurrentOrderPanel cartItems={cartItems} onIncrease={handleIncrease} onDecrease={handleDecrease} />
        </div>
    );
}
