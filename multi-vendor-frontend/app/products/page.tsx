"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../../lib/api";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { useWishlist } from "../../lib/wishlist";
import ProductImage from "../components/ProductImage";

const USD_TO_INR = 83;

interface Product {
    id: number;
    title: string;
    description?: string;
    price: number;
    image?: string;
    category?: string;
    stock: number;
    vendor: { id: number; name: string };
    avgRating: number;
    reviewCount: number;
}

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Books", "Beauty"];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Best Rating" },
    { value: "popular", label: "Most Popular" },
];

function ProductsContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [addedId, setAddedId] = useState<number | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();

    // Step 1: Read URL params on mount/change
    useEffect(() => {
        const cat = searchParams.get("category");
        const q = searchParams.get("search") || searchParams.get("q") || "";
        if (cat) setActiveCategory(cat);
        setSearch(q);
        setDebouncedSearch(q);
        setInitialized(true);
        setPage(1); // Reset page when filters change
    }, [searchParams]);

    // Step 2: Debounce the on-page search input (300ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page when search changes
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when category or sortBy changes
    useEffect(() => {
        setPage(1);
    }, [activeCategory, sortBy]);

    // Step 3: Fetch products only after initialization, using debounced search
    useEffect(() => {
        if (!initialized) return;
        setLoading(true);
        const params: Record<string, any> = {
            page,
            limit: 20,
            sortBy
        };
        if (activeCategory !== "All") params.category = activeCategory;
        if (debouncedSearch) params.search = debouncedSearch;

        api.get("products", { params }).then((res) => {
            const { products: newProducts, hasMore: more, total } = res.data;
            if (page === 1) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }
            setHasMore(more);
            setTotalResults(total);
        }).catch(console.error).finally(() => setLoading(false));
    }, [activeCategory, debouncedSearch, sortBy, page, initialized]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const renderStars = (rating: number) => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    const getOriginalPrice = (price: number) => Math.round(price * 1.35);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { router.push("/login?redirect=/products"); return; }
        addToCart({ productId: product.id, title: product.title, price: product.price, image: product.image, stock: product.stock, vendorName: product.vendor.name });
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const handleWishlist = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist({ productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, vendorName: product.vendor.name });
    };

    return (
        <div className="products-page fade-in">
            <div className="products-header">
                <h1>
                    {activeCategory === "All" ? "All Products" : activeCategory}
                    <span className="results-count">({totalResults} results)</span>
                </h1>
            </div>

            {/* Search + Sort Bar */}
            <div className="products-toolbar">
                <input
                    className="search-input"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, margin: 0 }}
                />
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Category Filter */}
            <div className="category-pills">
                {CATEGORIES.map((cat) => (
                    <button key={cat} className={`category-pill ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="product-grid">
                {products.map((product) => {
                    const orig = getOriginalPrice(product.price);
                    const discount = Math.round(((orig - product.price) / orig) * 100);
                    const inWishlist = isInWishlist(product.id);
                    return (
                        <Link href={`/products/${product.id}`} key={product.id} className="product-card fade-in">
                            <div className="product-image">
                                <ProductImage src={product.image} alt={product.title} />

                                {/* Wishlist Heart */}
                                <button className={`wishlist-heart ${inWishlist ? "active" : ""}`} onClick={(e) => handleWishlist(e, product)} title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
                                    {inWishlist ? "❤️" : "🤍"}
                                </button>

                                {discount > 15 && (
                                    <div className="discount-badge">{discount}% OFF</div>
                                )}
                            </div>
                            <div className="product-info">
                                <div className="product-brand">{product.vendor.name}</div>
                                <div className="product-title">{product.title}</div>

                                {/* Rating */}
                                {product.reviewCount > 0 && (
                                    <div className="product-rating-row">
                                        <span className={`rating-badge ${product.avgRating >= 4 ? "good" : product.avgRating >= 3 ? "avg" : "low"}`}>
                                            {product.avgRating.toFixed(1)} ★
                                        </span>
                                        <span className="rating-count">({product.reviewCount})</span>
                                    </div>
                                )}

                                {/* Dual Currency Price */}
                                <div className="product-price-row">
                                    <span className="price-inr">₹{Math.round(product.price * USD_TO_INR)}</span>
                                    <span className="price-original">₹{Math.round(orig * USD_TO_INR)}</span>
                                    {discount > 15 && <span className="price-discount">({discount}% off)</span>}
                                </div>
                                <div className="price-usd">${product.price.toFixed(2)}</div>

                                <button
                                    className="add-to-bag-btn"
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock <= 0 ? "OUT OF STOCK" : addedId === product.id ? "✓ ADDED!" : "ADD TO BAG"}
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {loading && <div className="loading-indicator"><div className="spinner"></div></div>}

            {!loading && products.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h2>No products found</h2>
                    <p>Try a different search or category</p>
                    <button className="btn btn-secondary" style={{ marginTop: "0.5rem" }} onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {hasMore && (
                <div className="load-more-container" style={{ textAlign: "center", marginTop: "3rem" }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleLoadMore}
                        disabled={loading}
                        style={{ padding: '0.8rem 3rem', borderRadius: '4px', background: '#ff3f6c', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                        {loading ? "LOADING..." : "LOAD MORE PRODUCTS"}
                    </button>
                    <p style={{ marginTop: '1rem', color: '#94969f', fontSize: '0.85rem' }}>
                        Showing {products.length} of {totalResults} products
                    </p>
                </div>
            )}

            <style jsx>{`
                .loading-indicator {
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                }
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #ff3f6c;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner"></div>Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
