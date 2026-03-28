"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useCart } from "../../../lib/cart";
import { useAuth } from "../../../lib/auth";
import { useWishlist } from "../../../lib/wishlist";
import ProductImage from "../../components/ProductImage";

const USD_TO_INR = 83;

interface Product {
    id: number;
    title: string;
    description?: string;
    price: number;
    image?: string;
    category?: string;
    subcategory?: string;
    gender?: string;
    size?: string;
    stock: number;
    vendor: { id: number; name: string };
    avgRating: number;
    reviewCount: number;
}

interface CategoryDef {
    banner: string;
    bannerGrad: string;
    tagline: string;
    bannerImg: string;
    subcategories: string[];
    // Which backend categories to fetch products from
    fetchCategories: string[];
    // Show clothing classifications in sidebar
    clothingTypes?: string[];
}

const CATEGORY_CONFIG: Record<string, CategoryDef> = {
    // ===== GENDER-BASED PAGES (like Myntra) =====
    Men: {
        banner: "MEN'S SHOPPING",
        bannerGrad: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        tagline: "Clothing, Footwear, Accessories & Gadgets for Men",
        bannerImg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=300&fit=crop",
        fetchCategories: ["Fashion", "Electronics", "Sports"],
        subcategories: ["All", "Shirt", "Jacket", "Jeans", "Sneakers", "Watch", "Headphones", "Sunglasses"],
        clothingTypes: ["Topwear", "Bottomwear", "Footwear", "Accessories", "Gadgets", "Sports"],
    },
    Women: {
        banner: "WOMEN'S SHOPPING",
        bannerGrad: "linear-gradient(135deg, #ee5f73 0%, #fb56c1 50%, #f093fb 100%)",
        tagline: "Clothing, Beauty, Footwear & Accessories for Women",
        bannerImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
        fetchCategories: ["Fashion", "Beauty", "Sports"],
        subcategories: ["All", "Dress", "Jacket", "Jeans", "Lipstick", "Serum", "Bag", "Sunglasses"],
        clothingTypes: ["Western Wear", "Ethnic Wear", "Footwear", "Beauty & Makeup", "Accessories", "Sports"],
    },
    Kids: {
        banner: "KIDS' SHOPPING",
        bannerGrad: "linear-gradient(135deg, #f26a10 0%, #ff9f43 50%, #ffd200 100%)",
        tagline: "Clothing, Footwear, Baby Beauty & Books for Kids",
        bannerImg: "https://images.pexels.com/photos/5560019/pexels-photo-5560019.jpeg?auto=compress&w=400&h=300&fit=crop",
        fetchCategories: ["Fashion", "Books", "Beauty"],
        subcategories: ["All", "Boys Topwear", "Boys Bottomwear", "Boys Outerwear", "Boys Ethnic", "Girls Dresses & Tops", "Girls Bottomwear", "Girls Outerwear", "Girls Ethnic", "Baby Clothing (0-2Y)", "Footwear", "Baby Beauty", "Kids Books", "Accessories"],
        clothingTypes: ["Boys Topwear", "Boys Bottomwear", "Boys Outerwear", "Boys Ethnic", "Girls Dresses & Tops", "Girls Bottomwear", "Girls Outerwear", "Girls Ethnic", "Baby Clothing (0-2Y)", "Footwear", "Baby Beauty", "Kids Books", "Accessories"],
    },
    GenZ: {
        banner: "GENZ TRENDS",
        bannerGrad: "linear-gradient(135deg, #7b61ff 0%, #5b3cc4 50%, #f093fb 100%)",
        tagline: "Streetwear, Tech, Sneakers & Trending Picks",
        bannerImg: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&h=300&fit=crop",
        fetchCategories: ["Fashion", "Electronics", "Sports", "Beauty"],
        subcategories: ["All", "Sneakers", "Headphones", "Sunglasses", "Watch", "Jacket", "Bag", "Speaker"],
        clothingTypes: ["Streetwear", "Sneakers & Shoes", "Tech & Gadgets", "Self Care", "Accessories"],
    },
    // ===== PRODUCT CATEGORY PAGES =====
    Electronics: {
        banner: "ELECTRONICS STORE",
        bannerGrad: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        tagline: "Latest Gadgets & Tech Accessories",
        bannerImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        fetchCategories: ["Electronics"],
        subcategories: ["All", "Headphones", "Speaker", "Watch", "Keyboard", "Charger", "Webcam", "Laptop"],
    },
    Fashion: {
        banner: "FASHION STORE",
        bannerGrad: "linear-gradient(135deg, #ee5f73 0%, #ff3f6c 50%, #ff7e33 100%)",
        tagline: "Trending Styles & Latest Collections",
        bannerImg: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop",
        fetchCategories: ["Fashion"],
        subcategories: ["All", "Shirt", "Jacket", "Jeans", "Sneakers", "Sunglasses", "Bag", "Scarf"],
    },
    Home: {
        banner: "HOME & LIVING",
        bannerGrad: "linear-gradient(135deg, #0db7af 0%, #14958f 50%, #0a6c5f 100%)",
        tagline: "Transform Your Space with Premium Decor",
        bannerImg: "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=300&fit=crop",
        fetchCategories: ["Home"],
        subcategories: ["All", "Plant", "Candle", "Blanket", "Organizer", "Skillet", "Coffee", "Art"],
    },
    Beauty: {
        banner: "BEAUTY & PERSONAL CARE",
        bannerGrad: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ee5f73 100%)",
        tagline: "Premium Skincare, Makeup, Baby Care & Self-Care",
        bannerImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
        fetchCategories: ["Beauty"],
        subcategories: ["All", "Serums", "Moisturizers", "Sunscreen", "Makeup", "Hair Care", "Body Care", "Fragrance", "Tools", "Skincare", "Baby Soap", "Baby Shampoo", "Baby Hair Oil", "Baby Lotion", "Baby Powder", "Baby Oil", "Baby Cream", "Baby Wash", "Baby Wipes", "Baby Nail Care", "Baby Oral Care"],
    },
    Sports: {
        banner: "SPORTS & FITNESS",
        bannerGrad: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        tagline: "Gear Up for Your Best Performance",
        bannerImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        fetchCategories: ["Sports"],
        subcategories: ["All", "Yoga", "Dumbbell", "Resistance", "Running", "Bottle", "Jump", "Foam"],
    },
    Books: {
        banner: "BOOKS & STATIONERY",
        bannerGrad: "linear-gradient(135deg, #f5a623 0%, #f7971e 50%, #ffd200 100%)",
        tagline: "Bestsellers, New Releases & Hidden Gems",
        bannerImg: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
        fetchCategories: ["Books"],
        subcategories: ["All", "Programming", "Photography", "Psychology", "Cookbook", "Atlas", "Art", "Journal"],
    },
};

const SORT_OPTIONS = [
    { value: "popular", label: "Recommended" },
    { value: "newest", label: "What's New" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "discount", label: "Better Discount" },
];

// Men sidebar labels -> seed subcategories + keywords so CATEGORIES filter and counts work
// Includes both legacy Prisma subcategories and current seed labels (Shirt, Jeans, Sneakers, etc.)
const MEN_SUBCAT_MAP: Record<string, { subcategories: string[]; keywords: string[] }> = {
    Shirt: { subcategories: ["Topwear", "Shirt", "Casual Shirt"], keywords: ["shirt", "tee", "t-shirt", "polo", "henley", "oxford"] },
    Jacket: { subcategories: ["Western Wear", "Jacket"], keywords: ["jacket", "blazer", "bomber", "puffer", "windbreaker"] },
    Jeans: { subcategories: ["Bottomwear", "Jeans"], keywords: ["jeans", "denim"] },
    Sneakers: { subcategories: ["Footwear", "Sneakers"], keywords: ["sneaker", "sneakers", "canvas", "running shoes"] },
    Watch: { subcategories: ["Accessories", "Watch"], keywords: ["watch"] },
    Headphones: { subcategories: ["Accessories", "Headphones"], keywords: ["headphone", "earbuds", "headset", "neckband"] },
    Sunglasses: { subcategories: ["Accessories", "Sunglasses"], keywords: ["sunglasses", "aviator", "wayfarer"] },
};

function matchesMenSub(sidebarLabel: string, p: Product): boolean {
    const map = MEN_SUBCAT_MAP[sidebarLabel];
    if (!map) return false;
    const sub = (p.subcategory || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const subMatch = map.subcategories.some((sc) => sc.toLowerCase() === sub);
    const keywordMatch = map.keywords.some((kw) => title.includes(kw) || desc.includes(kw));
    return subMatch || keywordMatch;
}

function menSubCount(products: Product[], sidebarLabel: string): number {
    return products.filter((p) => matchesMenSub(sidebarLabel, p)).length;
}

function CategoryContent() {
    const { name } = useParams();
    const categoryName = decodeURIComponent(name as string);
    const config = CATEGORY_CONFIG[categoryName];
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [activeSub, setActiveSub] = useState("All");
    const [activeClothing, setActiveClothing] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("popular");
    const [addedId, setAddedId] = useState<number | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [activeProductCat, setActiveProductCat] = useState<string | null>(null);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [activeSize, setActiveSize] = useState<string | null>(null);

    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();

    // Is this a gender-based page (Men, Women, Kids, GenZ)?
    const isGenderPage = ["Men", "Women", "Kids", "GenZ"].includes(categoryName);
    const genderMap: Record<string, string> = { Men: "Men", Women: "Women", Kids: "Kids" };

    // Fetch products
    const fetchProducts = (p: number, append = false) => {
        if (!config) return;
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const limit = 40; // Fetch 40 at a time for category pages

        if (isGenderPage && genderMap[categoryName]) {
            const params: any = { genderExact: genderMap[categoryName], page: p, limit, sortBy };
            if (categoryName === "Men") params.category = "Fashion";
            
            api.get("products", { params })
                .then((res) => {
                    const allowed = config.fetchCategories;
                    const items = Array.isArray(res.data?.products) ? res.data.products : [];
                    const data = allowed ? items.filter((p: Product) => allowed.includes(p.category || "")) : items;
                    
                    if (append) setProducts(prev => [...prev, ...data]);
                    else setProducts(data);
                    
                    setHasMore(Boolean(res.data?.hasMore));
                })
                .catch(console.error)
                .finally(() => { setLoading(false); setLoadingMore(false); });
        } else if (categoryName === "GenZ") {
            const fetches = config.fetchCategories.map((cat) =>
                api.get("products", { params: { category: cat, limit: 10 } }).then((r) =>
                    Array.isArray(r.data?.products) ? r.data.products : []
                )
            );
            Promise.all(fetches)
                .then((results) => { 
                    const all = results.flat(); 
                    setProducts(all); 
                    setHasMore(false); // No easy pagination for mixed multi-fetches
                })
                .catch(console.error)
                .finally(() => { setLoading(false); setLoadingMore(false); });
        } else {
            api.get("products", { params: { category: categoryName, page: p, limit, sortBy } })
                .then((res) => {
                    const list = Array.isArray(res.data?.products) ? res.data.products : [];
                    if (append) setProducts(prev => [...prev, ...list]);
                    else setProducts(list);
                    setHasMore(Boolean(res.data?.hasMore));
                })
                .catch(console.error)
                .finally(() => { setLoading(false); setLoadingMore(false); });
        }
    };

    useEffect(() => { 
        setPage(1);
        fetchProducts(1, false); 
    }, [categoryName, sortBy]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchProducts(next, true);
    };

    // Get unique brands and product categories
    const allBrands = [...new Set(products.map((p) => p.vendor.name))];
    const brandsToShow = showAllBrands ? allBrands : allBrands.slice(0, 8);
    const productCategories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
    const subcategories = [...new Set(products.map((p) => p.subcategory).filter(Boolean))] as string[];
    const availableSizes = [...new Set(products.flatMap((p) => p.size?.split(",") || []).map(s => s.trim()).filter(Boolean))] as string[];

    // Filter + Sort
    useEffect(() => {
        let result = [...products];

        // Product category filter (for gender pages that fetch multiple categories)
        if (activeProductCat) {
            result = result.filter((p) => p.category === activeProductCat);
        }

        // Clothing type / subcategory filter
        if (activeClothing) {
            result = result.filter((p) => p.subcategory === activeClothing);
        }

        // Brand filter
        if (activeBrand) {
            result = result.filter((p) => p.vendor.name === activeBrand);
        }

        // Subcategory filter (check subcategory field first, then title/description)
        if (activeSub !== "All") {
            // Men page: use sidebar -> subcategory/keyword mapping so Shirt, Jeans, Sneakers, etc. work
            if (categoryName === "Men" && MEN_SUBCAT_MAP[activeSub]) {
                result = result.filter((p) => matchesMenSub(activeSub, p));
            } else {
                // "Baby Beauty" groups all baby beauty subcategories
                const babyBeautySubs = ["Baby Soap", "Baby Shampoo", "Baby Hair Oil", "Baby Lotion", "Baby Powder", "Baby Oil", "Baby Cream", "Baby Wash", "Baby Wipes", "Baby Nail Care", "Baby Oral Care"];
                if (activeSub === "Baby Beauty") {
                    result = result.filter(
                        (p) => babyBeautySubs.some(bs => p.subcategory?.toLowerCase() === bs.toLowerCase()) ||
                            (p.category === "Beauty" && p.gender === "Kids")
                    );
                } else if (activeSub === "Kids Books") {
                    result = result.filter(
                        (p) => p.subcategory?.toLowerCase() === "kids books" ||
                            (p.category === "Books" && p.gender === "Kids")
                    );
                } else {
                    result = result.filter(
                        (p) =>
                            p.subcategory?.toLowerCase() === activeSub.toLowerCase() ||
                            p.title.toLowerCase().includes(activeSub.toLowerCase()) ||
                            p.description?.toLowerCase().includes(activeSub.toLowerCase())
                    );
                }
            }
        }

        // Price filter
        result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Size filter
        if (activeSize) {
            result = result.filter((p) => p.size?.split(",").map(s => s.trim()).includes(activeSize));
        }

        // Sort
        switch (sortBy) {
            case "price-low": result.sort((a, b) => a.price - b.price); break;
            case "price-high": result.sort((a, b) => b.price - a.price); break;
            case "rating": result.sort((a, b) => b.avgRating - a.avgRating); break;
            case "popular": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
            case "newest": break;
            case "discount": result.sort((a, b) => b.price - a.price); break;
        }
        setFiltered(result);
    }, [products, activeSub, sortBy, priceRange, activeBrand, activeProductCat, activeClothing, activeSize]);

    const getOriginalPrice = (price: number) => Math.round(price * 1.35);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { router.push(`/login?redirect=/category/${categoryName}`); return; }
        addToCart({ productId: product.id, title: product.title, price: product.price, image: product.image, stock: product.stock, vendorName: product.vendor.name });
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const handleWishlist = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist({ productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, vendorName: product.vendor.name });
    };

    const clearAllFilters = () => {
        setActiveSub("All");
        setPriceRange([0, 99999]);
        setActiveBrand(null);
        setActiveProductCat(null);
        setActiveClothing(null);
        setActiveSize(null);
    };

    const hasActiveFilters = activeBrand || activeSub !== "All" || priceRange[0] !== 0 || priceRange[1] !== 99999 || activeProductCat || activeClothing || activeSize;

    if (!config) {
        return (
            <div className="empty-state" style={{ minHeight: "60vh" }}>
                <div className="empty-state-icon">🔍</div>
                <h2>Category Not Found</h2>
                <p>The category &quot;{categoryName}&quot; doesn&apos;t exist.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Go Home</Link>
            </div>
        );
    }

    return (
        <div style={{ background: "white", minHeight: "100vh" }}>
            {/* Category Banner */}
            <div className="cat-banner" style={{ background: config.bannerGrad }}>
                <div className="cat-banner-inner">
                    <div className="cat-banner-text">
                        <h1>{config.banner}</h1>
                        <p>{config.tagline}</p>
                        <div className="cat-banner-stats">
                            <span>{products.length} Products</span>
                            <span>•</span>
                            <span>{allBrands.length} Brands</span>
                            {productCategories.length > 1 && (
                                <>
                                    <span>•</span>
                                    <span>{productCategories.length} Categories</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="cat-banner-img">
                        <img src={config.bannerImg} alt={categoryName} />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="cat-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <span className="current">{config.banner}</span>
            </div>

            {/* Subcategory tags bar */}
            {subcategories.length > 1 && (
                <div className="cat-tags-bar">
                    {subcategories.map((type) => (
                        <button
                            key={type}
                            className={`cat-tag ${activeClothing === type ? "active" : ""}`}
                            onClick={() => { setActiveClothing(activeClothing === type ? null : type); setActiveProductCat(null); }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Layout */}
            <div className="cat-layout">
                {/* Sidebar Filters */}
                <aside className="cat-sidebar">
                    <div className="cat-sidebar-title-row">
                        <h3 className="cat-sidebar-title">FILTERS</h3>
                        {hasActiveFilters && (
                            <button className="cat-clear-all" onClick={clearAllFilters}>CLEAR ALL</button>
                        )}
                    </div>

                    {/* Product Category Filter (for gender pages showing multiple categories) */}
                    {productCategories.length > 1 && (
                        <>
                            <div className="cat-filter-group">
                                <h4 className="cat-filter-heading">DEPARTMENT</h4>
                                {productCategories.map((cat) => {
                                    const count = products.filter((p) => p.category === cat).length;
                                    return (
                                        <label key={cat} className="cat-filter-option">
                                            <input
                                                type="radio"
                                                name="department"
                                                checked={activeProductCat === cat}
                                                onChange={() => setActiveProductCat(activeProductCat === cat ? null : cat)}
                                            />
                                            <span className="cat-filter-text">{cat}</span>
                                            <span className="cat-filter-count">({count})</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="cat-filter-divider" />
                        </>
                    )}

                    {/* Subcategory Filter */}
                    <div className="cat-filter-group">
                        <h4 className="cat-filter-heading">CATEGORIES</h4>
                        {config.subcategories.map((sub) => {
                            const babyBeautySubs = ["Baby Soap", "Baby Shampoo", "Baby Hair Oil", "Baby Lotion", "Baby Powder", "Baby Oil", "Baby Cream", "Baby Wash", "Baby Wipes", "Baby Nail Care", "Baby Oral Care"];
                            const count = sub === "All"
                                ? products.length
                                : categoryName === "Men" && MEN_SUBCAT_MAP[sub]
                                    ? menSubCount(products, sub)
                                    : sub === "Baby Beauty"
                                        ? products.filter((p) => babyBeautySubs.some(bs => p.subcategory?.toLowerCase() === bs.toLowerCase()) || (p.category === "Beauty" && p.gender === "Kids")).length
                                        : sub === "Kids Books"
                                            ? products.filter((p) => p.subcategory?.toLowerCase() === "kids books" || (p.category === "Books" && p.gender === "Kids")).length
                                            : products.filter((p) => p.subcategory?.toLowerCase() === sub.toLowerCase() || p.title.toLowerCase().includes(sub.toLowerCase()) || p.description?.toLowerCase().includes(sub.toLowerCase())).length;
                            return (
                                <label key={sub} className="cat-filter-option">
                                    <input
                                        type="checkbox"
                                        checked={activeSub === sub}
                                        onChange={() => setActiveSub(activeSub === sub ? "All" : sub)}
                                    />
                                    <span className="cat-filter-text">{sub}</span>
                                    <span className="cat-filter-count">({count})</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="cat-filter-divider" />

                    {/* Brand Filter */}
                    <div className="cat-filter-group">
                        <h4 className="cat-filter-heading">BRAND</h4>
                        {brandsToShow.map((brand) => {
                            const count = products.filter((p) => p.vendor.name === brand).length;
                            return (
                                <label key={brand} className="cat-filter-option">
                                    <input
                                        type="checkbox"
                                        checked={activeBrand === brand}
                                        onChange={() => setActiveBrand(activeBrand === brand ? null : brand)}
                                    />
                                    <span className="cat-filter-text">{brand}</span>
                                    <span className="cat-filter-count">({count})</span>
                                </label>
                            );
                        })}
                        {allBrands.length > 8 && (
                            <button className="cat-show-more" onClick={() => setShowAllBrands(!showAllBrands)}>
                                {showAllBrands ? "- Show Less" : `+ ${allBrands.length - 8} more`}
                            </button>
                        )}
                    </div>

                    <div className="cat-filter-divider" />

                    {/* Price Filter */}
                    <div className="cat-filter-group">
                        <h4 className="cat-filter-heading">PRICE</h4>
                        {[
                            { label: "Rs. 0 to Rs. 2000", range: [0, 25] as [number, number] },
                            { label: "Rs. 2000 to Rs. 5000", range: [25, 60] as [number, number] },
                            { label: "Rs. 5000 to Rs. 10000", range: [60, 120] as [number, number] },
                            { label: "Rs. 10000+", range: [120, 99999] as [number, number] },
                        ].map((opt) => (
                            <label key={opt.label} className="cat-filter-option">
                                <input
                                    type="radio"
                                    name="price"
                                    checked={priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1]}
                                    onChange={() => setPriceRange(priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1] ? [0, 99999] : opt.range)}
                                />
                                <span className="cat-filter-text">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    {availableSizes.length > 0 && <div className="cat-filter-divider" />}

                    {/* Size Filter */}
                    {availableSizes.length > 0 && (
                        <div className="cat-filter-group">
                            <h4 className="cat-filter-heading">SIZE</h4>
                            <div className="cat-size-grid">
                                {availableSizes.map((size) => {
                                    // Count products that contain this size in their comma-separated list
                                    const count = products.filter((p) => p.size?.split(",").map(s => s.trim()).includes(size)).length;
                                    return (
                                        <label key={size} className="cat-filter-option">
                                            <input
                                                type="checkbox"
                                                checked={activeSize === size}
                                                onChange={() => setActiveSize(activeSize === size ? null : size)}
                                            />
                                            <span className="cat-filter-text" style={{ textTransform: "uppercase" }}>{size}</span>
                                            <span className="cat-filter-count">({count})</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Product Grid */}
                <main className="cat-main">
                    {/* Toolbar */}
                    <div className="cat-toolbar">
                        <span className="cat-result-text">
                            <strong>{config.banner}</strong> - <strong>{filtered.length}</strong> items
                        </span>
                        <div className="cat-toolbar-right">
                            <div className="cat-sort-wrap">
                                <span className="cat-sort-label">Sort by :</span>
                                <select className="cat-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="loading-page"><div className="spinner"></div>Loading products...</div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h2>No products found</h2>
                            <p>Try a different filter or subcategory</p>
                            <button className="cat-clear-btn" style={{ marginTop: "0.5rem" }} onClick={clearAllFilters}>
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="cat-product-grid">
                            {filtered.map((product) => {
                                const orig = getOriginalPrice(product.price);
                                const discount = Math.round(((orig - product.price) / orig) * 100);
                                const wishlisted = isInWishlist(product.id);

                                return (
                                    <Link href={`/products/${product.id}`} key={product.id} className="cat-card">
                                        <div className="cat-card-image">
                                            <ProductImage src={product.image} alt={product.title} />
                                            <button className={`wishlist-heart ${wishlisted ? "active" : ""}`} onClick={(e) => handleWishlist(e, product)}>
                                                {wishlisted ? "❤️" : "🤍"}
                                            </button>
                                        </div>
                                        <div className="cat-card-info">
                                            {/* Rating - Myntra style */}
                                            {product.reviewCount > 0 && (
                                                <div className="cat-card-rating">
                                                    <span className={`cat-rating-badge ${product.avgRating >= 4 ? "good" : product.avgRating >= 3 ? "avg" : "low"}`}>
                                                        {product.avgRating.toFixed(1)} ★
                                                    </span>
                                                    <span className="cat-rating-separator">|</span>
                                                    <span className="cat-rating-reviews">{product.reviewCount >= 1000 ? (product.reviewCount / 1000).toFixed(1) + "k" : product.reviewCount}</span>
                                                </div>
                                            )}

                                            <div className="cat-card-brand">{product.vendor.name}</div>
                                            <div className="cat-card-title">{product.title}</div>
                                            {product.category && <div className="cat-card-dept">{product.category}</div>}

                                            {/* Price - Myntra style */}
                                            <div className="cat-card-price-row">
                                                <span className="cat-price-main">Rs. {Math.round(product.price * USD_TO_INR)}</span>
                                                <span className="cat-price-mrp">Rs. {Math.round(orig * USD_TO_INR)}</span>
                                                {discount > 10 && <span className="cat-price-off">({discount}% OFF)</span>}
                                            </div>
                                            <div className="cat-price-usd">${product.price.toFixed(2)}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && (
                        <div className="load-more-container" style={{ textAlign: "center", margin: "3rem 0" }}>
                            <button 
                                className="load-more-btn" 
                                onClick={handleLoadMore} 
                                disabled={loadingMore}
                                style={{
                                    padding: "0.8rem 2.5rem",
                                    background: "none",
                                    border: "1px solid #d4d5d9",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                    fontSize: "0.9rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {loadingMore ? "LOADING..." : "LOAD MORE"}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function CategoryPage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner"></div></div>}>
            <CategoryContent />
        </Suspense>
    );
}
