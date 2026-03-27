"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";

const USD_TO_INR = 83;

interface CheckoutItem {
    productId: number;
    title: string;
    price: number;
    image?: string;
    quantity: number;
    vendorName: string;
}

interface Address {
    id: string;
    name: string;
    type: "HOME" | "WORK" | "OTHER";
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
}

const DEFAULT_ADDRESSES: Address[] = [
    {
        id: "addr1",
        name: "Home Address",
        type: "HOME",
        line1: "123 Main Street, 2nd Floor",
        line2: "Near Central Park",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        mobile: "9876543210",
    },
];

const CheckoutSteps = ({ current }: { current: "bag" | "address" | "payment" }) => (
    <div style={{ background: "white", borderBottom: "1px solid #e5e5e5", padding: "0.8rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {(["bag", "address", "payment"] as const).map((step, i) => {
                const labels = ["BAG", "ADDRESS", "PAYMENT"];
                const isCurrent = step === current;
                const isDone = ["bag", "address", "payment"].indexOf(current) > i;
                return (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {i > 0 && <span style={{ width: 60, height: 1, background: isDone ? "#ff3f6c" : "#d4d5d9", display: "block" }} />}
                        <span style={{ color: isCurrent ? "#ff3f6c" : isDone ? "#ff3f6c" : "#94969f" }}>{labels[i]}</span>
                    </div>
                );
            })}
        </div>
    </div>
);

export default function CheckoutAddressPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
    const [selectedAddr, setSelectedAddr] = useState("addr1");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddr, setNewAddr] = useState({ name: "", line1: "", line2: "", city: "", state: "", pincode: "", mobile: "", type: "HOME" as Address["type"] });

    const totalInr = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity * USD_TO_INR, 0);
    const origInr = items.reduce((s, i) => s + (i.price ?? 0) * 1.35 * i.quantity * USD_TO_INR, 0);
    const discountInr = origInr - totalInr;
    const platformFee = items.length > 0 ? 23 : 0;
    const grandTotal = Math.round(totalInr + platformFee);

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    useEffect(() => {
        if (!user) { router.push("/login"); return; }
        const saved = sessionStorage.getItem("checkoutItems");
        if (!saved) { router.push("/cart"); return; }
        setItems(JSON.parse(saved));
    }, [user]);

    const handleAddAddress = () => {
        if (!newAddr.name || !newAddr.line1 || !newAddr.pincode || !newAddr.mobile) return;
        const addr: Address = { ...newAddr, id: `addr${Date.now()}` } as Address;
        setAddresses(prev => [...prev, addr]);
        setSelectedAddr(addr.id);
        setShowAddForm(false);
        setNewAddr({ name: "", line1: "", line2: "", city: "", state: "", pincode: "", mobile: "", type: "HOME" });
    };

    const handleContinue = () => {
        const addr = addresses.find(a => a.id === selectedAddr);
        if (addr) sessionStorage.setItem("checkoutAddress", JSON.stringify(addr));
        router.push("/checkout/payment");
    };

    return (
        <div style={{ background: "#f5f5f6", minHeight: "100vh", paddingBottom: "3rem" }}>
            <CheckoutSteps current="address" />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>

                {/* Left — Address Selection */}
                <div>
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "1.25rem", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#282c3f" }}>Select Delivery Address</h2>
                            <button
                                onClick={() => setShowAddForm(v => !v)}
                                style={{ border: "2px solid #ff3f6c", color: "#ff3f6c", background: "white", padding: "0.4rem 1rem", borderRadius: 4, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}
                            >
                                + ADD NEW ADDRESS
                            </button>
                        </div>

                        {/* Add Address Form */}
                        {showAddForm && (
                            <div style={{ background: "#fff4f6", border: "1px solid #ffd6e0", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
                                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.75rem" }}>Add New Address</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
                                    <input placeholder="Full Name*" value={newAddr.name} onChange={e => setNewAddr(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                                    <input placeholder="Mobile Number*" value={newAddr.mobile} onChange={e => setNewAddr(p => ({ ...p, mobile: e.target.value }))} style={inputStyle} />
                                </div>
                                <input placeholder="Address Line 1 (house/flat/street)*" value={newAddr.line1} onChange={e => setNewAddr(p => ({ ...p, line1: e.target.value }))} style={{ ...inputStyle, width: "100%", marginBottom: "0.6rem" }} />
                                <input placeholder="Address Line 2 (area/landmark)" value={newAddr.line2} onChange={e => setNewAddr(p => ({ ...p, line2: e.target.value }))} style={{ ...inputStyle, width: "100%", marginBottom: "0.6rem" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", marginBottom: "0.75rem" }}>
                                    <input placeholder="City*" value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} style={inputStyle} />
                                    <input placeholder="State*" value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} style={inputStyle} />
                                    <input placeholder="Pincode*" value={newAddr.pincode} onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))} style={inputStyle} />
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                    {(["HOME", "WORK", "OTHER"] as const).map(t => (
                                        <button key={t} onClick={() => setNewAddr(p => ({ ...p, type: t }))}
                                            style={{ padding: "0.3rem 0.8rem", borderRadius: 4, border: `1px solid ${newAddr.type === t ? "#ff3f6c" : "#d4d5d9"}`, background: newAddr.type === t ? "#fff4f6" : "white", color: newAddr.type === t ? "#ff3f6c" : "#535766", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleAddAddress} style={{ background: "#ff3f6c", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: 4, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                                    SAVE ADDRESS
                                </button>
                            </div>
                        )}

                        {/* Existing Addresses */}
                        <div style={{ fontSize: "0.75rem", color: "#94969f", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
                            {addresses.length > 1 ? "SAVED ADDRESSES" : "DEFAULT ADDRESS"}
                        </div>
                        {addresses.map(addr => (
                            <label key={addr.id} style={{
                                display: "flex", gap: "0.75rem", padding: "1rem",
                                border: `1.5px solid ${selectedAddr === addr.id ? "#ff3f6c" : "#e5e5e5"}`,
                                borderRadius: 6, marginBottom: "0.6rem", cursor: "pointer",
                                background: selectedAddr === addr.id ? "#fff9fa" : "white"
                            }}>
                                <input type="radio" name="address" value={addr.id} checked={selectedAddr === addr.id}
                                    onChange={() => setSelectedAddr(addr.id)}
                                    style={{ accentColor: "#ff3f6c", marginTop: 2, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#282c3f" }}>{addr.name}</span>
                                        <span style={{ background: "#f5f5f6", border: "1px solid #d4d5d9", borderRadius: 3, padding: "0.05rem 0.4rem", fontSize: "0.68rem", fontWeight: 700, color: "#535766" }}>{addr.type}</span>
                                    </div>
                                    <div style={{ fontSize: "0.83rem", color: "#535766", lineHeight: 1.5 }}>
                                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                                        <br />{addr.city}, {addr.state} - {addr.pincode}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#535766", marginTop: "0.3rem" }}>Mobile: {addr.mobile}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#14958f", marginTop: "0.3rem" }}>✓ Pay on Delivery available</div>

                                    {selectedAddr === addr.id && (
                                        <button onClick={handleContinue}
                                            style={{ marginTop: "0.75rem", background: "#ff3f6c", color: "white", border: "none", padding: "0.6rem 2rem", borderRadius: 4, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.04em" }}>
                                            DELIVER HERE
                                        </button>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Right — Delivery Estimates + Price Details */}
                <div>
                    {/* Delivery Estimates */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94969f", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>DELIVERY ESTIMATES</div>
                        {items.slice(0, 3).map(item => (
                            <div key={item.productId} style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "0.6rem", fontSize: "0.8rem" }}>
                                {item.image && <img src={item.image} alt={item.title} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/eaeaea/94969f?text=No+Image"; e.currentTarget.onerror = null; }} />}
                                <span style={{ color: "#282c3f" }}>Estimated delivery by <strong>{deliveryStr}</strong></span>
                            </div>
                        ))}
                    </div>

                    {/* Price Details */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94969f", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                            PRICE DETAILS ({items.length} Item{items.length !== 1 ? "s" : ""})
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Total MRP</span><span style={{ color: "#282c3f", fontWeight: 500 }}>₹{Math.round(origInr)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Discount on MRP</span><span style={{ color: "#14958f", fontWeight: 600 }}>−₹{Math.round(discountInr)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Platform Fee</span><span style={{ color: "#282c3f", fontWeight: 500 }}>₹{platformFee}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#535766" }}>
                                <span>Shipping Fee</span><span style={{ color: "#14958f", fontWeight: 600 }}>FREE</span>
                            </div>
                            <div style={{ borderTop: "1px dashed #e5e5e5", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: "#282c3f" }}>
                                <span>Total Amount</span><span>₹{grandTotal}</span>
                            </div>
                        </div>
                        <button onClick={handleContinue}
                            style={{ width: "100%", marginTop: "1.25rem", padding: "0.85rem", background: "#ff3f6c", color: "white", border: "none", borderRadius: 6, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer" }}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d4d5d9", borderRadius: 4,
    fontSize: "0.85rem", color: "#282c3f", background: "white", outline: "none",
};
