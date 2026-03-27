"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { useCart } from "../../../lib/cart";
import { useAuth } from "../../../lib/auth";
import { useWishlist } from "../../../lib/wishlist";

const USD_TO_INR = 83;

interface Review {
    id: number;
    rating: number;
    comment?: string;
    createdAt: string;
    user: { id: number; name: string };
}

interface Product {
    id: number;
    title: string;
    description?: string;
    price: number;
    image?: string;
    category?: string;
    gender?: string;
    size?: string;
    stock: number;
    vendor: { id: number; name: string };
    avgRating: number;
    reviewCount: number;
    reviews: Review[];
    createdAt: string;
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [similar, setSimilar] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [msgType, setMsgType] = useState<"success" | "error">("success");
    const [pincode, setPincode] = useState("");
    const [deliveryInfo, setDeliveryInfo] = useState("");
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const fetchProduct = () => {
        api.get(`products/${id}`).then((res) => {
            setProduct(res.data);
            api.get("products", { params: { category: res.data.category } }).then((r) => {
                setSimilar(r.data.products.filter((p: Product) => p.id !== res.data.id).slice(0, 4));
            });
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchProduct(); }, [id]);

    const showMsg = (text: string, type: "success" | "error" = "success") => {
        setMessage(text);
        setMsgType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleAddToCart = () => {
        if (!user) { router.push("/login?redirect=/products/" + id); return; }
        if (!product) return;

        // Figure out the effective size:
        // - If product has no size, or size is "One Size" or "0-2Y", no selection needed — use it as-is
        // - If product has multiple sizes and the size picker is shown, require a selection
        const sizeList = product.size ? product.size.split(",").map(s => s.trim()).filter(Boolean) : [];
        const sizeVal = product.size?.trim() ?? "";
        const needsSizeSelection = sizeList.length > 1 && sizeVal !== "One Size" && sizeVal !== "0-2Y";

        let effectiveSize = selectedSize;
        if (!effectiveSize && sizeList.length === 1) {
            effectiveSize = sizeList[0]; // auto-select the only available size
        }

        if (needsSizeSelection && !effectiveSize) {
            showMsg("Please select a size first!", "error");
            return;
        }

        for (let i = 0; i < qty; i++) {
            const cartTitle = effectiveSize && effectiveSize !== "One Size" && effectiveSize !== "0-2Y"
                ? `${product.title} (Size: ${effectiveSize})`
                : product.title;
            addToCart({ productId: product.id, title: cartTitle, price: product.price, image: product.image, stock: product.stock, vendorName: product.vendor.name });
        }
        showMsg(`Added ${qty} item${qty > 1 ? "s" : ""} to bag!`);
    };

    const handleBuyNow = () => {
        if (!user) { router.push("/login?redirect=/products/" + id); return; }
        if (product?.size && !selectedSize) {
            showMsg("Please select a size first!", "error");
            return;
        }
        handleAddToCart();
        setTimeout(() => router.push("/cart"), 500);
    };

    const handleWishlist = () => {
        if (!product) return;
        toggleWishlist({ productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, vendorName: product.vendor.name });
    };

    const handleCheckDelivery = () => {
        if (pincode.length >= 5) {
            const days = Math.floor(Math.random() * 4) + 2;
            const date = new Date();
            date.setDate(date.getDate() + days);
            setDeliveryInfo(`Delivery by ${date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} — Free shipping on this item`);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { router.push("/login"); return; }
        setReviewLoading(true);
        try {
            await api.post("/reviews", { productId: product?.id, rating: reviewRating, comment: reviewComment });
            setReviewComment("");
            setReviewRating(5);
            fetchProduct();
            showMsg("Review submitted!");
        } catch (err: any) {
            showMsg(err.response?.data?.error || "Failed to submit review", "error");
        } finally {
            setReviewLoading(false);
        }
    };

    const renderStars = (rating: number) => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

    const getRatingDist = () => {
        if (!product) return [];
        const dist = [0, 0, 0, 0, 0];
        product.reviews.forEach((r) => dist[r.rating - 1]++);
        return dist.reverse();
    };

    const getOriginalPrice = (price: number) => Math.round(price * 1.35);

    if (loading) return <div className="loading-page"><div className="spinner"></div>Loading...</div>;
    if (!product) return <div className="empty-state"><div className="empty-state-icon">❌</div><h2>Product not found</h2></div>;

    const originalPrice = getOriginalPrice(product.price);
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
    const ratingDist = getRatingDist();
    const wishlisted = isInWishlist(product.id);

    return (
        <div style={{ background: "white", minHeight: "100vh" }}>
            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/products">Products</Link>
                <span>/</span>
                <Link href={`/products?category=${product.category}`}>{product.category}</Link>
                <span>/</span>
                <span className="current">{product.title}</span>
            </div>

            {/* Product Detail */}
            <div className="detail-container">
                {/* Left - Image */}
                <div className="detail-left">
                    <div className="detail-image-box">
                        {product.image ? <img src={product.image} alt={product.title} onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/eaeaea/94969f?text=No+Image"; e.currentTarget.onerror = null; }} /> : <span style={{ fontSize: "5rem" }}>📦</span>}
                        {discount > 0 && <div className="detail-discount-badge">{discount}% OFF</div>}
                    </div>
                    {/* Action Buttons */}
                    <div className="detail-actions">
                        <button className="detail-add-btn" onClick={handleAddToCart} disabled={product.stock <= 0}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                            ADD TO BAG
                        </button>
                        <button className={`detail-wishlist-btn ${wishlisted ? "active" : ""}`} onClick={handleWishlist}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#ff3f6c" : "none"} stroke={wishlisted ? "#ff3f6c" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            {wishlisted ? "WISHLISTED" : "WISHLIST"}
                        </button>
                    </div>
                </div>

                {/* Right - Info */}
                <div className="detail-right">
                    <h2 className="detail-brand">{product.vendor.name}</h2>
                    <h1 className="detail-title">{product.title}</h1>

                    {/* Rating */}
                    {product.reviewCount > 0 && (
                        <div className="detail-rating-row">
                            <span className="detail-rating-badge">{product.avgRating.toFixed(1)} ★</span>
                            <span className="detail-rating-text">{product.reviewCount} Ratings</span>
                        </div>
                    )}

                    <div className="detail-divider" />

                    {/* Price - Dual Currency */}
                    <div className="detail-price-section">
                        <span className="detail-price">₹{Math.round(product.price * USD_TO_INR)}</span>
                        <span className="detail-mrp">MRP ₹{Math.round(originalPrice * USD_TO_INR)}</span>
                        <span className="detail-off">({discount}% OFF)</span>
                    </div>
                    <div className="detail-price-usd">${product.price.toFixed(2)} USD</div>
                    <p className="detail-tax">inclusive of all taxes</p>

                    {/* Size Selector */}
                    {product.size && product.size.trim() !== "One Size" && (
                        <div className="detail-size-section">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                                <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                                    SELECT SIZE {product.category === "Fashion" && product.gender === "Kids" ? "(Age Group)" : ""}
                                </span>
                                <span style={{ color: "#ff3f6c", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>SIZE CHART &gt;</span>
                            </div>
                            <div className="size-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.5rem" }}>
                                {product.size.split(",").map(s => s.trim()).map((sz) => (
                                    <button
                                        key={sz}
                                        onClick={() => setSelectedSize(sz)}
                                        style={{
                                            width: sz.length > 3 ? "auto" : "50px",
                                            padding: sz.length > 3 ? "0 15px" : "0",
                                            height: "50px",
                                            borderRadius: "50%",
                                            border: `1px solid ${selectedSize === sz ? "#ff3f6c" : "#eaeaec"}`,
                                            backgroundColor: "white",
                                            color: selectedSize === sz ? "#ff3f6c" : "#282c3f",
                                            fontWeight: selectedSize === sz ? "700" : "500",
                                            fontSize: "0.95rem",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: selectedSize === sz ? "0 0 0 1px #ff3f6c" : "none",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    {product.stock > 0 && (
                        <div className="detail-qty-row">
                            <span className="detail-label">Qty:</span>
                            <div className="quantity-selector">
                                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                <span className="qty-value">{qty}</span>
                                <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                            </div>
                            <span className="detail-stock">
                                {product.stock > 10 ? <span style={{ color: "#0db7af" }}>In Stock</span> : <span style={{ color: "#ff3f6c" }}>Only {product.stock} left!</span>}
                            </span>
                        </div>
                    )}

                    {/* Delivery Check */}
                    <div className="detail-delivery-card">
                        <h4>DELIVERY OPTIONS <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></h4>
                        <div className="detail-pincode-row">
                            <input placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                            <button onClick={handleCheckDelivery}>Check</button>
                        </div>
                        {deliveryInfo && <p className="detail-delivery-info">✓ {deliveryInfo}</p>}
                        <ul className="detail-delivery-features">
                            <li>Get it by {new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</li>
                            <li>Pay on delivery available</li>
                            <li>Easy 30-day returns & exchange</li>
                        </ul>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="detail-description">
                            <h3>PRODUCT DETAILS</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* Seller */}
                    <div className="detail-seller">
                        <span className="detail-label">Sold by:</span>
                        <span className="detail-seller-name">{product.vendor.name}</span>
                    </div>

                    {message && <div className={`alert ${msgType === "success" ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>{message}</div>}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="detail-reviews">
                <h2>RATINGS & REVIEWS <span style={{ fontWeight: 400, color: "#94969f", fontSize: "0.9rem" }}>({product.reviewCount})</span></h2>

                <div className="detail-reviews-grid">
                    {/* Rating Summary */}
                    <div className="detail-rating-summary">
                        <div className="rating-big">{product.avgRating.toFixed(1)}</div>
                        <div className="rating-stars">{renderStars(product.avgRating)}</div>
                        <p>{product.reviewCount} Verified Reviews</p>
                        {/* Rating bars */}
                        <div className="rating-bars">
                            {[5, 4, 3, 2, 1].map((star, i) => (
                                <div key={star} className="rating-bar-row">
                                    <span className="bar-label">{star} ★</span>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{
                                            width: product.reviewCount > 0 ? `${(ratingDist[i] / product.reviewCount) * 100}%` : "0%",
                                            background: star >= 4 ? "#14958f" : star === 3 ? "#f5a623" : "#ff3f6c",
                                        }} />
                                    </div>
                                    <span className="bar-count">{ratingDist[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="detail-reviews-list">
                        {/* Write Review */}
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="write-review-form">
                                <h3>Write a Review</h3>
                                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setReviewRating(star)}
                                            style={{ fontSize: "1.6rem", background: "none", border: "none", cursor: "pointer", color: star <= reviewRating ? "#f5a623" : "#d4d5d9" }}>★</button>
                                    ))}
                                </div>
                                <textarea placeholder="Tell others what you think about this product..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                                <button type="submit" disabled={reviewLoading}>{reviewLoading ? "Submitting..." : "Submit Review"}</button>
                            </form>
                        ) : (
                            <div className="write-review-form" style={{ textAlign: "center" }}>
                                <p style={{ color: "#535766" }}>Login to write a review</p>
                                <Link href="/login" className="nav-auth-btn" style={{ display: "inline-block", marginTop: "0.5rem" }}>LOGIN</Link>
                            </div>
                        )}

                        {/* Review List */}
                        {product.reviews.length === 0 ? (
                            <p style={{ color: "#94969f", padding: "1rem 0" }}>No reviews yet. Be the first!</p>
                        ) : (
                            product.reviews.map((review) => (
                                <div key={review.id} className="review-item">
                                    <div className="review-top">
                                        <span className={`review-rating-badge ${review.rating >= 4 ? "good" : review.rating === 3 ? "avg" : "low"}`}>
                                            {review.rating} ★
                                        </span>
                                        {review.comment && <span className="review-text">{review.comment}</span>}
                                    </div>
                                    <div className="review-bottom">
                                        <span className="review-author">{review.user.name}</span>
                                        <span className="review-sep">|</span>
                                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similar.length > 0 && (
                <div className="detail-similar">
                    <h2>SIMILAR PRODUCTS</h2>
                    <div className="similar-grid">
                        {similar.map((p) => (
                            <Link href={`/products/${p.id}`} key={p.id} className="similar-card">
                                <div className="similar-image">
                                    {p.image ? <img src={p.image} alt={p.title} onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/eaeaea/94969f?text=No+Image"; e.currentTarget.onerror = null; }} /> : "📦"}
                                </div>
                                <div className="similar-info">
                                    <div className="similar-brand">{p.vendor.name}</div>
                                    <div className="similar-title">{p.title}</div>
                                    <div className="similar-price">₹{Math.round(p.price * USD_TO_INR)} <span className="similar-usd">(${p.price.toFixed(2)})</span></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
