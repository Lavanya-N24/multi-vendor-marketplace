"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";

const USD_TO_INR = 83;

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, itemCount } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [checkingOut, setCheckingOut] = useState(false);
    const [message, setMessage] = useState("");
    const [msgType, setMsgType] = useState<"success" | "error">("success");

    // All items selected by default — sync when cart loads/changes
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Auto-select any newly added items
    useEffect(() => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            items.forEach(i => next.add(i.productId));
            return next;
        });
    }, [items.map(i => i.productId).join(",")]);

    const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.productId));
    const someSelected = items.some(i => selectedIds.has(i.productId));
    const selectedItems = items.filter(i => selectedIds.has(i.productId));

    const toggleItem = (pid: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(pid)) next.delete(pid);
            else next.add(pid);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(items.map(i => i.productId)));
    };

    const selectedTotal = useMemo(
        () => selectedItems.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedItems.map(i => i.productId + "-" + i.quantity).join(",")]
    );
    const selectedTotalInr = Math.round(selectedTotal * USD_TO_INR);
    const shipping = selectedTotal > 50 ? 0 : selectedTotal > 0 ? 4.99 : 0;
    const shippingInr = Math.round(shipping * USD_TO_INR);
    const platformFee = selectedItems.length > 0 ? 23 : 0;
    const grandTotalInr = selectedTotalInr + shippingInr + platformFee;

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            setMessage("Please select at least one item to order.");
            setMsgType("error");
            return;
        }
        // Save selected items to sessionStorage for checkout flow
        sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
        router.push("/checkout/address");
    };

    if (!user) {
        return (
            <div className="auth-page">
                <div className="auth-card fade-in" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
                    <h1>Login Required</h1>
                    <p>Please sign in to access your shopping cart</p>
                    <Link href="/login?redirect=/cart" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "0.5rem" }}>
                        Sign In
                    </Link>
                    <div className="auth-footer">
                        Don&apos;t have an account? <Link href="/register">Create one</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="empty-state fade-in" style={{ minHeight: "60vh" }}>
                <div className="empty-state-icon">🛒</div>
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven&apos;t added anything yet. Start shopping!</p>
                <Link href="/products" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div style={{ background: "#f5f5f6", minHeight: "100vh", paddingBottom: "3rem" }}>
            {/* Checkout Steps Bar */}
            <div style={{ background: "white", borderBottom: "1px solid #e5e5e5", padding: "0.8rem 2rem" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", color: "#94969f" }}>
                    <span style={{ color: "#ff3f6c" }}>BAG</span>
                    <span style={{ flex: 1, maxWidth: 80, height: 1, background: "#d4d5d9" }} />
                    <span>ADDRESS</span>
                    <span style={{ flex: 1, maxWidth: 80, height: 1, background: "#d4d5d9" }} />
                    <span>PAYMENT</span>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>

                {/* LEFT — Items */}
                <div>
                    {message && (
                        <div className={`alert ${msgType === "success" ? "alert-success" : "alert-error"}`} style={{ marginBottom: "1rem" }}>
                            {message}
                        </div>
                    )}

                    {/* Selection Header Bar */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", color: "#282c3f" }}>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
                                onChange={toggleAll}
                                style={{ width: 18, height: 18, accentColor: "#ff3f6c", cursor: "pointer" }}
                            />
                            {selectedItems.length}/{items.length} ITEMS SELECTED
                        </label>
                        <div style={{ display: "flex", gap: "1.25rem" }}>
                            <button
                                onClick={() => { selectedItems.forEach(i => removeFromCart(i.productId)); setSelectedIds(new Set()); }}
                                style={{ background: "none", border: "none", color: "#535766", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}
                            >
                                REMOVE
                            </button>
                            <button
                                onClick={() => { clearCart(); setSelectedIds(new Set()); }}
                                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}
                            >
                                CLEAR ALL
                            </button>
                        </div>
                    </div>

                    {/* Cart Items */}
                    {items.map(item => {
                        const isSelected = selectedIds.has(item.productId);
                        const origPrice = Math.round((item.price ?? 0) * 1.35 * USD_TO_INR);
                        const currPrice = Math.round((item.price ?? 0) * item.quantity * USD_TO_INR);
                        const discount = Math.round(((origPrice - Math.round((item.price ?? 0) * USD_TO_INR)) / origPrice) * 100);
                        return (
                            <div key={item.productId} style={{
                                background: "white", border: `1.5px solid ${isSelected ? "#ff3f6c" : "#e5e5e5"}`,
                                borderRadius: 8, marginBottom: "0.6rem", padding: "1rem 1rem 0.8rem",
                                transition: "border-color 0.2s", opacity: isSelected ? 1 : 0.55,
                            }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleItem(item.productId)}
                                        style={{ width: 18, height: 18, accentColor: "#ff3f6c", cursor: "pointer", marginTop: 4, flexShrink: 0 }}
                                    />

                                    {/* Image */}
                                    <Link href={`/products/${item.productId}`}>
                                        <div style={{ width: 100, height: 120, borderRadius: 6, overflow: "hidden", background: "#f5f5f6", flexShrink: 0 }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/eaeaea/94969f?text=No+Image"; e.currentTarget.onerror = null; }} />
                                                : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2.5rem" }}>📦</div>
                                            }
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#282c3f", marginBottom: 2 }}>{item.vendorName}</div>
                                        <Link href={`/products/${item.productId}`} style={{ fontSize: "0.88rem", color: "#535766", marginBottom: "0.4rem", display: "block" }}>
                                            {item.title}
                                        </Link>

                                        {/* Price row */}
                                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "0.6rem" }}>
                                            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#282c3f" }}>₹{currPrice}</span>
                                            <span style={{ fontSize: "0.78rem", color: "#94969f", textDecoration: "line-through" }}>₹{origPrice * item.quantity}</span>
                                            {discount > 0 && <span style={{ fontSize: "0.75rem", color: "#ff905a", fontWeight: 600 }}>({discount}% OFF)</span>}
                                        </div>

                                        {/* Quantity */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #d4d5d9", borderRadius: 4, overflow: "hidden" }}>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    style={{ width: 32, height: 32, background: "white", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#282c3f", fontWeight: 700 }}>−</button>
                                                <span style={{ padding: "0 0.75rem", fontWeight: 600, fontSize: "0.9rem", borderLeft: "1px solid #d4d5d9", borderRight: "1px solid #d4d5d9", lineHeight: "32px" }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    style={{ width: 32, height: 32, background: "white", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#282c3f", fontWeight: 700 }}>+</button>
                                            </div>
                                            <button
                                                onClick={() => { removeFromCart(item.productId); setSelectedIds(p => { const n = new Set(p); n.delete(item.productId); return n; }); }}
                                                style={{ background: "none", border: "none", color: "#535766", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}
                                            >
                                                REMOVE
                                            </button>
                                            <button
                                                onClick={() => { removeFromCart(item.productId); setSelectedIds(p => { const n = new Set(p); n.delete(item.productId); return n; }); }}
                                                style={{ background: "none", border: "none", color: "#535766", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}
                                            >
                                                MOVE TO WISHLIST
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT — Price Details */}
                <div>
                    {/* Price Details card */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "1.25rem", marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94969f", letterSpacing: "0.06em", marginBottom: "1rem", textTransform: "uppercase" }}>
                            Price Details ({selectedItems.length} Item{selectedItems.length !== 1 ? "s" : ""})
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Total MRP</span>
                                <span style={{ fontWeight: 500, color: "#282c3f" }}>₹{Math.round(selectedItems.reduce((s, i) => s + (i.price ?? 0) * 1.35 * i.quantity * USD_TO_INR, 0))}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Discount on MRP</span>
                                <span style={{ fontWeight: 600, color: "#14958f" }}>
                                    {selectedTotalInr > 0 ? `−₹${Math.round(selectedItems.reduce((s, i) => s + (i.price ?? 0) * 0.35 * i.quantity * USD_TO_INR, 0))}` : "—"}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Platform Fee</span>
                                <span style={{ fontWeight: 500, color: "#282c3f" }}>{platformFee > 0 ? `₹${platformFee}` : "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Shipping Fee</span>
                                <span style={{ fontWeight: 600, color: shipping === 0 && selectedTotal > 0 ? "#14958f" : "#282c3f" }}>
                                    {selectedTotal === 0 ? "—" : shipping === 0 ? "FREE" : `₹${shippingInr}`}
                                </span>
                            </div>

                            <div style={{ borderTop: "1px dashed #e5e5e5", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: "#282c3f" }}>
                                <span>Total Amount</span>
                                <span>₹{grandTotalInr > 0 ? grandTotalInr : 0}</span>
                            </div>
                        </div>

                        {shipping > 0 && selectedTotal > 0 && (
                            <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "#ff3f6c" }}>
                                Add ₹{Math.round((50 - selectedTotal) * USD_TO_INR)} more to get FREE shipping
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut || selectedItems.length === 0}
                            style={{
                                width: "100%", marginTop: "1.25rem", padding: "0.85rem",
                                background: selectedItems.length === 0 ? "#d4d5d9" : "#ff3f6c",
                                color: "white", border: "none", borderRadius: 6,
                                fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.05em",
                                cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                                transition: "background 0.2s"
                            }}
                        >
                            {checkingOut
                                ? <span className="spinner" />
                                : selectedItems.length === 0
                                    ? "SELECT ITEMS TO ORDER"
                                    : `PLACE ORDER (${selectedItems.length})`
                            }
                        </button>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <Link href="/products" style={{ fontSize: "0.8rem", color: "#ff3f6c", fontWeight: 600 }}>
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
