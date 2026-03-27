"use client";

import Link from "next/link";
import { useWishlist } from "../../lib/wishlist";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const USD_TO_INR = 83;

export default function WishlistPage() {
    const { items, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [movedIds, setMovedIds] = useState<Set<number>>(new Set());

    const handleMoveToBag = (item: typeof items[0]) => {
        if (!user) { router.push("/login?redirect=/wishlist"); return; }
        addToCart({ productId: item.productId, title: item.title, price: item.price, image: item.image, stock: 99, vendorName: item.vendorName });
        setMovedIds(prev => new Set([...prev, item.productId]));
        setTimeout(() => {
            removeFromWishlist(item.productId);
            setMovedIds(prev => { const n = new Set(prev); n.delete(item.productId); return n; });
        }, 900);
    };

    if (!user) {
        return (
            <div style={{ background: "#f5f5f6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "white", borderRadius: 12, padding: "3rem 2.5rem", textAlign: "center", border: "1px solid #e5e5e5", maxWidth: 380 }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>♡</div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.5rem" }}>Login to view your Wishlist</h2>
                    <p style={{ color: "#535766", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Login to see the items you have saved in your wishlist.</p>
                    <Link href="/login?redirect=/wishlist" style={{ background: "#ff3f6c", color: "white", padding: "0.7rem 2rem", borderRadius: 6, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", display: "inline-block" }}>
                        LOGIN
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ background: "#f5f5f6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "white", borderRadius: 12, padding: "3rem 2.5rem", textAlign: "center", border: "1px solid #e5e5e5", maxWidth: 380 }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>♡</div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.5rem" }}>Your Wishlist is Empty</h2>
                    <p style={{ color: "#535766", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Save items you love to your wishlist and shop them later!</p>
                    <Link href="/products" style={{ background: "#ff3f6c", color: "white", padding: "0.7rem 2rem", borderRadius: 6, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", display: "inline-block" }}>
                        CONTINUE SHOPPING
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f5f5f6", minHeight: "100vh", paddingBottom: "3rem" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>

                {/* Header */}
                <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#282c3f", marginBottom: "1.5rem" }}>
                    My Wishlist{" "}
                    <span style={{ fontWeight: 400, color: "#94969f" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                </h1>

                {/* Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1px",
                    background: "#e5e5e5",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    overflow: "hidden",
                }}>
                    {items.map(item => {
                        const priceInr = Math.round(item.price * USD_TO_INR);
                        const origInr = Math.round(item.price * 1.35 * USD_TO_INR);
                        const discount = Math.round(((origInr - priceInr) / origInr) * 100);
                        const isMoved = movedIds.has(item.productId);

                        return (
                            <div key={item.productId} style={{ background: "white", position: "relative", display: "flex", flexDirection: "column" }}>
                                {/* Remove button */}
                                <button
                                    onClick={() => removeFromWishlist(item.productId)}
                                    style={{
                                        position: "absolute", top: 8, right: 8, zIndex: 1,
                                        width: 22, height: 22, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.9)", border: "1px solid #d4d5d9",
                                        cursor: "pointer", fontSize: "0.75rem", color: "#535766",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        lineHeight: 1, fontWeight: 700
                                    }}
                                    title="Remove"
                                >
                                    ✕
                                </button>

                                {/* Image */}
                                <Link href={`/products/${item.productId}`} style={{ display: "block", textDecoration: "none" }}>
                                    <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f6" }}>
                                        {item.image
                                            ? <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                                                onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/eaeaea/94969f?text=No+Image"; e.currentTarget.onerror = null; }}
                                                onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                                onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
                                            />
                                            : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📦</div>
                                        }
                                    </div>
                                </Link>

                                {/* Info */}
                                <div style={{ padding: "0.6rem 0.75rem 0", flex: 1 }}>
                                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {item.vendorName}
                                    </div>
                                    <Link href={`/products/${item.productId}`} style={{ fontSize: "0.75rem", color: "#535766", textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4, marginBottom: "0.4rem" }}>
                                        {item.title}
                                    </Link>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#282c3f" }}>Rs.{priceInr}</span>
                                        <span style={{ fontSize: "0.72rem", color: "#94969f", textDecoration: "line-through" }}>Rs.{origInr}</span>
                                        {discount > 0 && <span style={{ fontSize: "0.7rem", color: "#ff905a", fontWeight: 600 }}>({discount}% OFF)</span>}
                                    </div>
                                </div>

                                {/* MOVE TO BAG */}
                                <button
                                    onClick={() => handleMoveToBag(item)}
                                    disabled={isMoved}
                                    style={{
                                        margin: "0.6rem 0.75rem 0.75rem",
                                        padding: "0.55rem",
                                        background: isMoved ? "#14958f" : "white",
                                        color: isMoved ? "white" : "#ff3f6c",
                                        border: `1.5px solid ${isMoved ? "#14958f" : "#ff3f6c"}`,
                                        borderRadius: 4, cursor: isMoved ? "default" : "pointer",
                                        fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.04em",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {isMoved ? "✓ MOVED TO BAG" : "MOVE TO BAG"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
