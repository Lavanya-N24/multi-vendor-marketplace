"use client";

import { useAuth } from "../../lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import React from "react";

interface SavedCard { id: number; last4: string; type: string; name: string; exp: string; }
interface SavedAddress { id: number; name: string; address: string; city: string; pin: string; mobile: string; isDefault: boolean; }
interface Coupon { code: string; desc: string; valid: string; }

function ProfileContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "overview";
    const [mounted, setMounted] = useState(false);

    // ── State for interactive sections ──
    const [cards, setCards] = useState<SavedCard[]>([
        { id: 1, last4: "3456", type: "VISA", name: "", exp: "12/28" },
    ]);
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({ number: "", exp: "", cvv: "", name: "" });

    const [addresses, setAddresses] = useState<SavedAddress[]>([
        { id: 1, name: "", address: "123 Fashion Street, Sector 4", city: "Bangalore, Karnataka", pin: "560001", mobile: "9876543210", isDefault: true },
    ]);
    const [showAddAddr, setShowAddAddr] = useState(false);
    const [editAddrId, setEditAddrId] = useState<number | null>(null);
    const [addrForm, setAddrForm] = useState({ name: "", address: "", city: "", pin: "", mobile: "" });

    const [coupons] = useState<Coupon[]>([
        { code: "WELCOME20", desc: "Flat 20% off on your first order. Max discount ₹500.", valid: "Dec 31, 2026" },
        { code: "FASHION10", desc: "Get 10% off on premium fashion brands.", valid: "Sep 30, 2026" },
        { code: "BEAUTY15", desc: "15% off on all beauty & skincare products.", valid: "Nov 30, 2026" },
    ]);
    const [couponInput, setCouponInput] = useState("");
    const [couponMsg, setCouponMsg] = useState("");
    const [copiedCode, setCopiedCode] = useState("");

    const [giftCardNum, setGiftCardNum] = useState("");
    const [giftCardPin, setGiftCardPin] = useState("");
    const [giftBalance, setGiftBalance] = useState(0);
    const [giftMsg, setGiftMsg] = useState("");

    const [creditBalance] = useState(0);
    const [contactIssue, setContactIssue] = useState("Where is my order?");
    const [contactMsg, setContactMsg] = useState("");
    const [contactSent, setContactSent] = useState(false);

    const [insiderJoined, setInsiderJoined] = useState(false);

    useEffect(() => {
        if (!user) router.push("/login");
        setMounted(true);
    }, [user, router]);

    // Set user name on addresses/cards after mount
    useEffect(() => {
        if (user) {
            setCards(prev => prev.map(c => ({ ...c, name: c.name || user.name })));
            setAddresses(prev => prev.map(a => ({ ...a, name: a.name || user.name })));
        }
    }, [user]);

    if (!mounted || !user) return null;

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "edit", label: "Edit Profile" },
        { id: "orders", label: "Orders", isLink: "/orders" },
        { id: "wishlist", label: "Wishlist", isLink: "/wishlist" },
        { id: "cards", label: "Saved Cards" },
        { id: "addresses", label: "Saved Addresses" },
        { id: "coupons", label: "Coupons" },
        { id: "credit", label: "VendorVerse Credit" },
        { id: "giftcards", label: "Gift Cards" },
        { id: "insider", label: "VendorVerse Insider", isNew: true },
        { id: "contact", label: "Contact Us" },
    ];

    // ── Helper styles ──
    const btnPrimary: React.CSSProperties = { padding: "0.8rem 2rem", background: "#ff3f6c", color: "white", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" };
    const btnOutline: React.CSSProperties = { fontSize: "0.85rem", fontWeight: 700, color: "#14958f", background: "none", border: "1px solid #14958f", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" };
    const btnText: React.CSSProperties = { fontSize: "0.85rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 };
    const inputStyle: React.CSSProperties = { width: "100%", padding: "0.8rem", border: "1px solid #d4d5d9", borderRadius: "4px", fontSize: "0.9rem" };
    const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.75rem", color: "#696e79", marginBottom: "0.3rem" };
    const successBox: React.CSSProperties = { background: "#e8f5e9", color: "#2e7d32", padding: "0.8rem 1rem", borderRadius: "4px", fontSize: "0.9rem", marginTop: "1rem" };
    const errorBox: React.CSSProperties = { background: "#fce4ec", color: "#c62828", padding: "0.8rem 1rem", borderRadius: "4px", fontSize: "0.9rem", marginTop: "1rem" };

    // ── Handlers ──
    const handleCopyCoupon = (code: string) => {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(""), 2000);
    };
    const handleCheckCoupon = () => {
        const found = coupons.find(c => c.code.toLowerCase() === couponInput.trim().toLowerCase());
        setCouponMsg(found ? `✅ "${found.code}" is valid! ${found.desc}` : `❌ Invalid coupon code.`);
    };
    const handleRemoveCard = (id: number) => { setCards(prev => prev.filter(c => c.id !== id)); };
    const handleAddCard = () => {
        if (!newCard.number || !newCard.exp || !newCard.cvv || !newCard.name) return;
        const last4 = newCard.number.replace(/\s/g, "").slice(-4);
        const type = newCard.number.startsWith("4") ? "VISA" : newCard.number.startsWith("5") ? "MC" : "CARD";
        setCards(prev => [...prev, { id: Date.now(), last4, type, name: newCard.name, exp: newCard.exp }]);
        setNewCard({ number: "", exp: "", cvv: "", name: "" });
        setShowAddCard(false);
    };
    const handleRemoveAddr = (id: number) => { setAddresses(prev => prev.filter(a => a.id !== id)); };
    const handleSetDefault = (id: number) => { setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id }))); };
    const handleStartEditAddr = (a: SavedAddress) => { setEditAddrId(a.id); setAddrForm({ name: a.name, address: a.address, city: a.city, pin: a.pin, mobile: a.mobile }); };
    const handleSaveAddr = () => {
        if (!addrForm.name || !addrForm.address || !addrForm.city || !addrForm.pin || !addrForm.mobile) return;
        if (editAddrId) {
            setAddresses(prev => prev.map(a => a.id === editAddrId ? { ...a, ...addrForm } : a));
            setEditAddrId(null);
        } else {
            setAddresses(prev => [...prev, { id: Date.now(), ...addrForm, isDefault: prev.length === 0 }]);
            setShowAddAddr(false);
        }
        setAddrForm({ name: "", address: "", city: "", pin: "", mobile: "" });
    };
    const handleAddGiftCard = () => {
        if (!giftCardNum || !giftCardPin) { setGiftMsg("❌ Please enter both Gift Card Number and PIN."); return; }
        if (giftCardPin.length < 4) { setGiftMsg("❌ Invalid PIN."); return; }
        const amt = Math.floor(Math.random() * 2000) + 500;
        setGiftBalance(prev => prev + amt);
        setGiftMsg(`✅ Gift card added! ₹${amt} added to your balance.`);
        setGiftCardNum(""); setGiftCardPin("");
    };
    const handleContactSubmit = () => {
        if (!contactMsg.trim()) return;
        setContactSent(true);
        setContactMsg("");
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case "overview":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Profile Details</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div><div style={labelStyle}>Full Name</div><div style={{ fontSize: "1rem", color: "#282c3f", fontWeight: 500 }}>{user.name}</div></div>
                            <div><div style={labelStyle}>Mobile Number</div><div style={{ fontSize: "1rem", color: "#282c3f", fontWeight: 500 }}>+91-9876543210</div></div>
                            <div><div style={labelStyle}>Email ID</div><div style={{ fontSize: "1rem", color: "#282c3f", fontWeight: 500 }}>{user.email}</div></div>
                            <div><div style={labelStyle}>Account Type</div><div style={{ fontSize: "1rem", color: "#282c3f", fontWeight: 500 }}>{user.isVendor ? <span style={{ color: "#14958f", fontWeight: 700 }}>Vendor</span> : "Customer"}</div></div>
                        </div>
                        <div style={{ marginTop: "2rem" }}><Link href="/profile?tab=edit"><button style={btnPrimary}>EDIT</button></Link></div>
                    </div>
                );

            case "edit":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: "450px" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Edit Details</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div><label style={labelStyle}>Mobile Number</label><input type="text" defaultValue="9876543210" style={inputStyle} /></div>
                            <div><label style={labelStyle}>Full Name</label><input type="text" defaultValue={user.name} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Email</label><input type="email" defaultValue={user.email} style={inputStyle} readOnly /><div style={{ fontSize: "0.7rem", color: "#94969f", marginTop: "0.3rem" }}>Email cannot be changed.</div></div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Gender</label><select style={{ ...inputStyle, background: "white" }}><option>Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Date of Birth</label><input type="date" style={inputStyle} /></div>
                            </div>
                        </div>
                        <div style={{ marginTop: "2rem" }}><button style={{ ...btnPrimary, width: "100%" }} onClick={() => { alert("Profile saved successfully!"); router.push("/profile"); }}>SAVE DETAILS</button></div>
                    </div>
                );

            case "cards":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Saved Cards</h2>
                        {cards.length === 0 && <div style={{ textAlign: "center", padding: "3rem", background: "#f5f5f6", borderRadius: "8px", color: "#696e79" }}>No saved cards. Add one below.</div>}
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {cards.map(c => (
                                <div key={c.id} style={{ border: "1px solid #eaeaec", borderRadius: "8px", padding: "1.5rem", background: "white", maxWidth: "380px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #14958f, #2fc2b0)" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#282c3f", letterSpacing: "1px" }}>•••• •••• •••• {c.last4}</div>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 700, padding: "0.2rem 0.5rem", border: "1px solid #eaeaec", borderRadius: "4px", color: "#535766" }}>{c.type}</div>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "#535766", textTransform: "uppercase", marginBottom: "0.4rem" }}>{c.name}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                        <div style={{ fontSize: "0.85rem", color: "#696e79" }}>Exp: {c.exp}</div>
                                        <button style={{ ...btnText, color: "#ff3f6c" }} onClick={() => handleRemoveCard(c.id)}>REMOVE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!showAddCard ? (
                            <button style={{ ...btnText, color: "#14958f", marginTop: "1.5rem" }} onClick={() => setShowAddCard(true)}>+ ADD NEW CARD</button>
                        ) : (
                            <div style={{ marginTop: "1.5rem", border: "1px solid #eaeaec", borderRadius: "8px", padding: "1.5rem", maxWidth: "380px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Add New Card</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div><label style={labelStyle}>Card Number</label><input style={inputStyle} placeholder="1234 5678 9012 3456" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} maxLength={19} /></div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}><label style={labelStyle}>Expiry</label><input style={inputStyle} placeholder="MM/YY" value={newCard.exp} onChange={e => setNewCard({ ...newCard, exp: e.target.value })} maxLength={5} /></div>
                                        <div style={{ flex: 1 }}><label style={labelStyle}>CVV</label><input type="password" style={inputStyle} placeholder="•••" value={newCard.cvv} onChange={e => setNewCard({ ...newCard, cvv: e.target.value })} maxLength={4} /></div>
                                    </div>
                                    <div><label style={labelStyle}>Name on Card</label><input style={inputStyle} placeholder="Full name" value={newCard.name} onChange={e => setNewCard({ ...newCard, name: e.target.value })} /></div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button style={btnPrimary} onClick={handleAddCard}>SAVE CARD</button>
                                        <button style={{ ...btnText, color: "#696e79" }} onClick={() => { setShowAddCard(false); setNewCard({ number: "", exp: "", cvv: "", name: "" }); }}>CANCEL</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "addresses":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            Saved Addresses
                            <button style={btnOutline} onClick={() => { setShowAddAddr(true); setEditAddrId(null); setAddrForm({ name: "", address: "", city: "", pin: "", mobile: "" }); }}>+ ADD NEW ADDRESS</button>
                        </h2>
                        {addresses.length === 0 && <div style={{ textAlign: "center", padding: "3rem", background: "#f5f5f6", borderRadius: "8px", color: "#696e79" }}>No saved addresses.</div>}
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {addresses.map(a => (
                                editAddrId === a.id ? (
                                    <div key={a.id} style={{ border: "1px solid #14958f", borderRadius: "4px", padding: "1.5rem" }}>
                                        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Edit Address</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div><label style={labelStyle}>Name</label><input style={inputStyle} value={addrForm.name} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} /></div>
                                            <div><label style={labelStyle}>Address</label><input style={inputStyle} value={addrForm.address} onChange={e => setAddrForm({ ...addrForm, address: e.target.value })} /></div>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <div style={{ flex: 1 }}><label style={labelStyle}>City, State</label><input style={inputStyle} value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                                                <div style={{ flex: 1 }}><label style={labelStyle}>PIN Code</label><input style={inputStyle} value={addrForm.pin} onChange={e => setAddrForm({ ...addrForm, pin: e.target.value })} /></div>
                                            </div>
                                            <div><label style={labelStyle}>Mobile</label><input style={inputStyle} value={addrForm.mobile} onChange={e => setAddrForm({ ...addrForm, mobile: e.target.value })} /></div>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <button style={btnPrimary} onClick={handleSaveAddr}>SAVE</button>
                                                <button style={{ ...btnText, color: "#696e79" }} onClick={() => setEditAddrId(null)}>CANCEL</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={a.id} style={{ border: "1px solid #eaeaec", borderRadius: "4px", padding: "1.5rem", position: "relative" }}>
                                        {a.isDefault && <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.7rem", fontWeight: 700, color: "#696e79", background: "#f5f5f6", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>DEFAULT</div>}
                                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.5rem" }}>{a.name}</h3>
                                        <div style={{ fontSize: "0.9rem", color: "#535766", lineHeight: 1.5, marginBottom: "1rem" }}>
                                            {a.address}<br />{a.city} {a.pin}<br />Mobile: <span style={{ fontWeight: 600 }}>{a.mobile}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid #eaeaec", paddingTop: "1rem" }}>
                                            <button style={{ ...btnText, color: "#ff3f6c" }} onClick={() => handleStartEditAddr(a)}>EDIT</button>
                                            <button style={{ ...btnText, color: "#696e79" }} onClick={() => handleRemoveAddr(a.id)}>REMOVE</button>
                                            {!a.isDefault && <button style={{ ...btnText, color: "#14958f" }} onClick={() => handleSetDefault(a.id)}>SET AS DEFAULT</button>}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                        {showAddAddr && !editAddrId && (
                            <div style={{ marginTop: "1.5rem", border: "1px solid #14958f", borderRadius: "4px", padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Add New Address</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="Full name" value={addrForm.name} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Address</label><input style={inputStyle} placeholder="House No, Street, Area" value={addrForm.address} onChange={e => setAddrForm({ ...addrForm, address: e.target.value })} /></div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}><label style={labelStyle}>City, State</label><input style={inputStyle} placeholder="City, State" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                                        <div style={{ flex: 1 }}><label style={labelStyle}>PIN Code</label><input style={inputStyle} placeholder="560001" value={addrForm.pin} onChange={e => setAddrForm({ ...addrForm, pin: e.target.value })} /></div>
                                    </div>
                                    <div><label style={labelStyle}>Mobile</label><input style={inputStyle} placeholder="10-digit mobile" value={addrForm.mobile} onChange={e => setAddrForm({ ...addrForm, mobile: e.target.value })} /></div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button style={btnPrimary} onClick={handleSaveAddr}>SAVE ADDRESS</button>
                                        <button style={{ ...btnText, color: "#696e79" }} onClick={() => { setShowAddAddr(false); setAddrForm({ name: "", address: "", city: "", pin: "", mobile: "" }); }}>CANCEL</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "coupons":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Coupons</h2>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            <input type="text" placeholder="Enter coupon code" style={{ ...inputStyle, flex: 1 }} value={couponInput} onChange={e => setCouponInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCheckCoupon()} />
                            <button style={btnOutline} onClick={handleCheckCoupon}>CHECK</button>
                        </div>
                        {couponMsg && <div style={couponMsg.startsWith("✅") ? successBox : errorBox}>{couponMsg}</div>}
                        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
                            {coupons.map(c => (
                                <div key={c.code} style={{ border: "1px dashed #d4d5d9", borderRadius: "8px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfcfc" }}>
                                    <div>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.3rem" }}>{c.code}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#535766", marginBottom: "0.3rem" }}>{c.desc}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#ff3f6c" }}>Valid till {c.valid}</div>
                                    </div>
                                    <button style={{ ...btnText, color: copiedCode === c.code ? "#2e7d32" : "#14958f" }} onClick={() => handleCopyCoupon(c.code)}>
                                        {copiedCode === c.code ? "COPIED ✓" : "COPY"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "credit":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>VendorVerse Credit</h2>
                        <div style={{ background: "linear-gradient(135deg, #282c3f, #1e2130)", padding: "2rem", borderRadius: "8px", color: "white", marginBottom: "2rem" }}>
                            <div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.5rem" }}>Total Available Balance</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>₹{creditBalance.toFixed(2)}</div>
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#282c3f", marginBottom: "1rem" }}>Recent Transactions</h3>
                        <div style={{ textAlign: "center", padding: "3rem", background: "#f5f5f6", borderRadius: "8px", color: "#696e79", fontSize: "0.9rem" }}>You have no credit transactions yet.</div>
                    </div>
                );

            case "giftcards":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Gift Cards</h2>
                        {giftBalance > 0 && (
                            <div style={{ background: "linear-gradient(135deg, #ff3f6c, #ff7e33)", padding: "1.5rem", borderRadius: "8px", color: "white", marginBottom: "1.5rem" }}>
                                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Gift Card Balance</div>
                                <div style={{ fontSize: "2rem", fontWeight: 700 }}>₹{giftBalance.toFixed(2)}</div>
                            </div>
                        )}
                        <div style={{ background: "#fff", border: "1px dashed #ff3f6c", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎁</div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#282c3f", marginBottom: "1rem" }}>Add a Gift Card</h3>
                            <div style={{ display: "flex", gap: "0.5rem", maxWidth: "350px", margin: "0 auto" }}>
                                <input type="text" placeholder="Gift Card Number" style={{ ...inputStyle, flex: 1 }} value={giftCardNum} onChange={e => setGiftCardNum(e.target.value)} />
                                <input type="password" placeholder="PIN" style={{ ...inputStyle, width: "80px" }} value={giftCardPin} onChange={e => setGiftCardPin(e.target.value)} />
                            </div>
                            <button style={{ ...btnPrimary, marginTop: "1rem" }} onClick={handleAddGiftCard}>ADD TO BALANCE</button>
                            {giftMsg && <div style={giftMsg.startsWith("✅") ? successBox : errorBox}>{giftMsg}</div>}
                        </div>
                    </div>
                );

            case "insider":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease", textAlign: "center", padding: "2rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👑</div>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: insiderJoined ? "#2e7d32" : "#f3c22b", marginBottom: "0.5rem" }}>
                            {insiderJoined ? "You're an Insider! 🎉" : "VendorVerse Insider"}
                        </h2>
                        <p style={{ fontSize: "1.1rem", color: "#535766", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
                            {insiderJoined ? "Welcome to the VIP club! Enjoy all your exclusive benefits." : "Join the ultimate early access program. Get priority shipping, early sale access, and exclusive discounts."}
                        </p>
                        <div style={{ background: insiderJoined ? "#e8f5e9" : "#fef6df", padding: "1.5rem", borderRadius: "8px", border: `1px solid ${insiderJoined ? "#66bb6a" : "#f3c22b"}`, maxWidth: "400px", margin: "0 auto 2rem", textAlign: "left" }}>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem", color: "#282c3f" }}>
                                <li>{insiderJoined ? "✅" : "✨"} <strong>Free Delivery</strong> on all orders</li>
                                <li>{insiderJoined ? "✅" : "✨"} <strong>VIP Access</strong> to major sales</li>
                                <li>{insiderJoined ? "✅" : "✨"} <strong>2% Extra Cashback</strong> as Insider Points</li>
                            </ul>
                        </div>
                        {!insiderJoined && (
                            <button style={{ padding: "0.9rem 3rem", background: "#282c3f", color: "#f3c22b", border: "none", borderRadius: "4px", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }} onClick={() => setInsiderJoined(true)}>
                                JOIN NOW
                            </button>
                        )}
                    </div>
                );

            case "contact":
                return (
                    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: "500px" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#282c3f", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem" }}>Contact Support</h2>
                        {contactSent ? (
                            <div style={{ textAlign: "center", padding: "3rem" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2e7d32", marginBottom: "0.5rem" }}>Query Submitted!</h3>
                                <p style={{ color: "#535766", marginBottom: "1.5rem" }}>We will get back to you within 24 hours via email.</p>
                                <button style={btnOutline} onClick={() => setContactSent(false)}>SUBMIT ANOTHER QUERY</button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ ...labelStyle, fontWeight: 500 }}>Issue Type</label>
                                    <select style={{ ...inputStyle, background: "white" }} value={contactIssue} onChange={e => setContactIssue(e.target.value)}>
                                        <option>Where is my order?</option><option>Return & Refund Query</option><option>Payment Failure</option><option>Account Help</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, fontWeight: 500 }}>Message</label>
                                    <textarea rows={5} placeholder="Describe your issue in detail..." style={{ ...inputStyle, resize: "vertical" }} value={contactMsg} onChange={e => setContactMsg(e.target.value)}></textarea>
                                </div>
                                <button style={{ ...btnPrimary, background: "#282c3f" }} onClick={handleContactSubmit}>SUBMIT QUERY</button>
                            </div>
                        )}
                        <div style={{ marginTop: "3rem", fontSize: "0.85rem", color: "#535766", padding: "1.5rem", background: "#f5f5f6", borderRadius: "4px" }}>
                            <strong>Call Us:</strong> 1800-123-4567 (Toll Free)<br /><strong>Email:</strong> support@vendorverse.com<br /><br />Available Monday-Saturday, 9 AM to 7 PM.
                        </div>
                    </div>
                );

            default: return <div>Section not found.</div>;
        }
    };

    return (
        <div style={{ background: "#f5f5f6", minHeight: "100vh", padding: "2rem 0" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaec", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.2rem" }}>Account</h1>
                        <div style={{ fontSize: "0.9rem", color: "#535766" }}>{user.name}</div>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>
                    <div style={{ background: "transparent", borderRight: "1px solid #eaeaec", display: "flex", flexDirection: "column", paddingRight: "1.5rem", gap: "0.25rem" }}>
                        {tabs.map((tab) => {
                            const isActive = currentTab === tab.id;
                            if (tab.isLink) return <Link key={tab.id} href={tab.isLink} style={{ display: "block", padding: "0.8rem 1rem", fontSize: "0.95rem", color: "#535766", textDecoration: "none", fontWeight: 500, borderRadius: "4px" }}>{tab.label}</Link>;
                            return (
                                <Link key={tab.id} href={`/profile?tab=${tab.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 1rem", fontSize: "0.95rem", color: isActive ? "#ff3f6c" : "#535766", background: isActive ? "#fdf2f4" : "transparent", fontWeight: isActive ? 700 : 500, textDecoration: "none", borderRadius: "4px", borderLeft: isActive ? "4px solid #ff3f6c" : "4px solid transparent", transition: "all 0.2s" }}>
                                    {tab.label}
                                    {tab.isNew && <span style={{ background: "#ff3f6c", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "3px" }}>NEW</span>}
                                </Link>
                            );
                        })}
                        <div style={{ borderTop: "1px solid #eaeaec", margin: "1rem 0", paddingTop: "0.5rem" }} />
                        <button onClick={() => { logout(); router.push("/"); }} style={{ textAlign: "left", padding: "0.8rem 1rem", fontSize: "0.95rem", color: "#ff3f6c", background: "none", border: "none", fontWeight: 700, cursor: "pointer", width: "100%" }}>Log Out</button>
                    </div>
                    <div style={{ background: "white", padding: "2rem 2.5rem", borderRadius: "8px", border: "1px solid #eaeaec", minHeight: "500px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }` }} />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner"></div></div>}>
            <ProfileContent />
        </Suspense>
    );
}
