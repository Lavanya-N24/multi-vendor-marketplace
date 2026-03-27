"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { useCart } from "../../../lib/cart";
import api from "../../../lib/api";

const USD_TO_INR = 83;

interface CheckoutItem {
    productId: number;
    title: string;
    price: number;
    image?: string;
    quantity: number;
    vendorName: string;
}

/* ── checkout stepper ─────────────────────────────── */
const CheckoutSteps = ({ current }: { current: "bag" | "address" | "payment" }) => (
    <div style={{ background: "white", borderBottom: "1px solid #e5e5e5", padding: "0.8rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {(["bag", "address", "payment"] as const).map((step, i) => {
                const labels = ["BAG", "ADDRESS", "PAYMENT"];
                const isCurrent = step === current;
                const isDone = ["bag", "address", "payment"].indexOf(current) > i;
                return (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {i > 0 && <span style={{ width: 60, height: 1, background: isDone || isCurrent ? "#ff3f6c" : "#d4d5d9", display: "block" }} />}
                        <span style={{ color: isCurrent || isDone ? "#ff3f6c" : "#94969f" }}>{labels[i]}</span>
                    </div>
                );
            })}
            <div style={{ position: "absolute", right: 24, display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#14958f" }}>
                <span>🔒</span> 100% SECURE
            </div>
        </div>
    </div>
);

/* ── method sidebar config ─────────────────────────── */
const METHODS = [
    { id: "recommended", label: "Recommended", icon: "⭐", tag: "" },
    { id: "cod", label: "Cash On Delivery\n(Cash/UPI)", icon: "💵", tag: "" },
    { id: "upi", label: "UPI (Pay via any App)", icon: "📱", tag: "" },
    { id: "card", label: "Credit/Debit Card", icon: "💳", tag: "8 Offers" },
    { id: "wallets", label: "Wallets", icon: "👛", tag: "1 Offer" },
    { id: "paylater", label: "Pay Later", icon: "📅", tag: "" },
    { id: "emi", label: "EMI", icon: "🏦", tag: "2 Offers" },
    { id: "netbanking", label: "Net Banking", icon: "🏛️", tag: "" },
];

const NB_BANKS = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Bank of Baroda", "Punjab National Bank", "Canara Bank", "Union Bank of India", "IndusInd Bank",
];

const WALLET_LIST = [
    { name: "Paytm", icon: "📱" },
    { name: "Mobikwik", icon: "💰" },
    { name: "Freecharge", icon: "⚡" },
    { name: "Airtel Money", icon: "📶" },
    { name: "JioMoney", icon: "🔵" },
];

/* ────────────────────────────────────────────────── */
export default function CheckoutPaymentPage() {
    const { user } = useAuth();
    const { removeFromCart } = useCart();
    const router = useRouter();
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [activeMethod, setActiveMethod] = useState("recommended");
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);

    /* card form */
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");

    /* UPI */
    const [upiId, setUpiId] = useState("");

    /* Net Banking */
    const [selectedBank, setSelectedBank] = useState("");

    /* Wallet */
    const [selectedWallet, setSelectedWallet] = useState("");

    /* prices */
    const totalInr = Math.round(items.reduce((s, i) => s + (i.price ?? 0) * i.quantity * USD_TO_INR, 0));
    const origInr = Math.round(items.reduce((s, i) => s + (i.price ?? 0) * 1.35 * i.quantity * USD_TO_INR, 0));
    const discountInr = origInr - totalInr;
    const platformFee = items.length > 0 ? 23 : 0;
    const grandTotal = totalInr + platformFee;

    useEffect(() => {
        if (!user) { router.push("/login"); return; }
        const saved = sessionStorage.getItem("checkoutItems");
        if (!saved) { router.push("/cart"); return; }
        setItems(JSON.parse(saved));
    }, [user]);

    /* ── place order (simulated) ── */
    const handlePlaceOrder = async () => {
        setPlacing(true);
        try {
            for (const item of items) {
                await api.post("/orders", { productId: item.productId, quantity: item.quantity });
            }
            items.forEach(item => removeFromCart(item.productId));
            sessionStorage.removeItem("checkoutItems");
            sessionStorage.removeItem("checkoutAddress");
            setSuccess(true);
            setTimeout(() => router.push("/orders"), 3000);
        } catch (err: any) {
            alert(err.response?.data?.error || "Order failed. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    /* ── success screen ── */
    if (success) {
        return (
            <div style={{ background: "#f5f5f6", minHeight: "100vh" }}>
                <CheckoutSteps current="payment" />
                <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
                    <div style={{ background: "white", borderRadius: 12, padding: "3rem 2rem", border: "1px solid #e5e5e5", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#14958f", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "white", fontSize: "2rem" }}>✓</span>
                        </div>
                        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#282c3f", marginBottom: "0.5rem" }}>Order Confirmed!</h2>
                        <p style={{ color: "#535766", fontSize: "0.88rem", marginBottom: "0.3rem" }}>
                            Your order for {items.length} item{items.length !== 1 ? "s" : ""} has been placed successfully.
                        </p>
                        <p style={{ color: "#535766", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
                            You will receive a confirmation email shortly.
                        </p>
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#166534" }}>
                            📦 Estimated delivery in 4-5 business days
                        </div>
                        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.82rem", color: "#92400e" }}>
                            💰 Amount: ₹{grandTotal} • Payment: {activeMethod === "cod" || activeMethod === "recommended" ? "Cash on Delivery" : "Paid Online"}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#94969f" }}>Redirecting to your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── right-panel content per method ── */
    const renderMethodPanel = () => {
        switch (activeMethod) {
            /* ── Recommended / COD ── */
            case "recommended":
            case "cod":
                return (
                    <div>
                        <div style={sectionTitleStyle}>RECOMMENDED PAYMENT OPTIONS</div>
                        <label style={optionCardStyle(true)}>
                            <input type="radio" name="pay" defaultChecked style={radioStyle} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#282c3f" }}>💵 Cash on Delivery (Cash/UPI)</div>
                                <div style={{ fontSize: "0.75rem", color: "#535766", marginTop: "0.15rem" }}>You can pay via Cash/UPI on delivery.</div>
                            </div>
                        </label>
                        <button onClick={handlePlaceOrder} disabled={placing} style={placeOrderBtnStyle}>
                            {placing ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                );

            /* ── UPI ── */
            case "upi":
                return (
                    <div>
                        <div style={sectionTitleStyle}>UPI OPTIONS</div>
                        <label style={optionCardStyle(true)}>
                            <input type="radio" name="pay" defaultChecked style={radioStyle} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#282c3f" }}>📲 Pay via UPI</div>
                                <div style={{ fontSize: "0.75rem", color: "#535766", marginTop: "0.15rem" }}>Pay using any UPI app — GPay, PhonePe, Paytm, BHIM</div>
                            </div>
                        </label>
                        <div style={{ marginTop: "0.75rem", padding: "0 0.25rem" }}>
                            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#282c3f", marginBottom: "0.4rem", display: "block" }}>Enter UPI ID</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input type="text" placeholder="username@upi" value={upiId} onChange={e => setUpiId(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }} />
                                <button onClick={() => upiId.includes("@") && alert("✓ UPI ID verified!")}
                                    style={{ padding: "0.5rem 1rem", background: upiId.includes("@") ? "#ff3f6c" : "#d4d5d9", color: "white", border: "none", borderRadius: 4, fontWeight: 700, fontSize: "0.78rem", cursor: upiId.includes("@") ? "pointer" : "not-allowed" }}>
                                    VERIFY
                                </button>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#94969f", marginTop: "0.4rem" }}>Example: mobilenumber@upi, name@oksbi, name@paytm</div>
                        </div>
                        <div style={{ margin: "1rem 0", textAlign: "center", color: "#94969f", fontSize: "0.75rem" }}>── OR ──</div>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                            {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                                <button key={app} style={{ padding: "0.45rem 1rem", border: "1px solid #d4d5d9", borderRadius: 6, background: "white", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500, color: "#535766" }}>
                                    {app}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePlaceOrder} disabled={placing} style={{ ...placeOrderBtnStyle, marginTop: "1.25rem" }}>
                            {placing ? "Placing Order..." : `Pay ₹${grandTotal}`}
                        </button>
                    </div>
                );

            /* ── Credit/Debit Card ── */
            case "card":
                return (
                    <div>
                        <div style={sectionTitleStyle}>CREDIT/DEBIT CARD</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div>
                                <label style={fieldLabelStyle}>Card Number</label>
                                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={cardNumber}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                                        setCardNumber(v);
                                    }}
                                    style={inputStyle} />
                                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem" }}>
                                    {["VISA", "Mastercard", "RuPay", "Amex", "Diners"].map(c => (
                                        <span key={c} style={{ fontSize: "0.62rem", padding: "0.1rem 0.35rem", border: "1px solid #e5e5e5", borderRadius: 3, color: "#94969f" }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={fieldLabelStyle}>Valid Thru</label>
                                    <input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry}
                                        onChange={e => {
                                            let v = e.target.value.replace(/\D/g, "");
                                            if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                                            setCardExpiry(v);
                                        }}
                                        style={inputStyle} />
                                </div>
                                <div style={{ width: 110 }}>
                                    <label style={fieldLabelStyle}>CVV</label>
                                    <input type="password" placeholder="•••" maxLength={4} value={cardCvv}
                                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                        style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={fieldLabelStyle}>Name on Card</label>
                                <input type="text" placeholder="As printed on card" value={cardName}
                                    onChange={e => setCardName(e.target.value)} style={inputStyle} />
                            </div>
                            <label style={{ display: "flex", gap: "0.5rem", fontSize: "0.78rem", color: "#535766", alignItems: "center" }}>
                                <input type="checkbox" style={{ accentColor: "#ff3f6c" }} /> Save card securely for future payments
                            </label>
                            <div style={{ fontSize: "0.7rem", color: "#14958f", fontWeight: 600 }}>
                                🔒 Your card details are encrypted and secured with 256-bit SSL
                            </div>
                        </div>
                        <button onClick={handlePlaceOrder}
                            disabled={placing || cardNumber.replace(/\s/g, "").length < 12 || !cardExpiry || !cardCvv || !cardName}
                            style={{
                                ...placeOrderBtnStyle, marginTop: "1.25rem",
                                opacity: cardNumber.replace(/\s/g, "").length < 12 ? 0.5 : 1,
                            }}>
                            {placing ? "Processing Payment..." : `Pay ₹${grandTotal}`}
                        </button>
                    </div>
                );

            /* ── Wallets ── */
            case "wallets":
                return (
                    <div>
                        <div style={sectionTitleStyle}>WALLETS</div>
                        {WALLET_LIST.map(w => (
                            <label key={w.name} style={{
                                ...optionCardStyle(selectedWallet === w.name),
                                padding: "0.7rem 0.85rem", marginBottom: "0.4rem",
                            }}>
                                <input type="radio" name="wallet" value={w.name}
                                    checked={selectedWallet === w.name} onChange={() => setSelectedWallet(w.name)}
                                    style={radioStyle} />
                                <span style={{ fontSize: "1.1rem" }}>{w.icon}</span>
                                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#282c3f" }}>{w.name}</span>
                            </label>
                        ))}
                        <button onClick={handlePlaceOrder} disabled={placing || !selectedWallet}
                            style={{ ...placeOrderBtnStyle, marginTop: "1rem", opacity: selectedWallet ? 1 : 0.5 }}>
                            {placing ? "Redirecting..." : selectedWallet ? `Pay ₹${grandTotal} via ${selectedWallet}` : "Select a wallet"}
                        </button>
                    </div>
                );

            /* ── Pay Later ── */
            case "paylater":
                return (
                    <div>
                        <div style={sectionTitleStyle}>PAY LATER OPTIONS</div>
                        {["Simpl", "LazyPay", "ZestMoney"].map((pl, i) => (
                            <label key={pl} style={{ ...optionCardStyle(i === 0), padding: "0.7rem 0.85rem", marginBottom: "0.4rem" }}>
                                <input type="radio" name="paylater" defaultChecked={i === 0} style={radioStyle} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#282c3f" }}>📅 {pl}</div>
                                    <div style={{ fontSize: "0.72rem", color: "#535766" }}>{pl === "Simpl" ? "Pay next month with 0% interest" : pl === "LazyPay" ? "Buy now, pay later in 15 days" : "EMI starting ₹99/month"}</div>
                                </div>
                            </label>
                        ))}
                        <button onClick={handlePlaceOrder} disabled={placing} style={{ ...placeOrderBtnStyle, marginTop: "1rem" }}>
                            {placing ? "Processing..." : `Pay ₹${grandTotal} Later`}
                        </button>
                    </div>
                );

            /* ── EMI ── */
            case "emi":
                return (
                    <div>
                        <div style={sectionTitleStyle}>EMI OPTIONS</div>
                        <div style={{ fontSize: "0.82rem", color: "#535766", marginBottom: "0.75rem" }}>Convert your payment into easy monthly installments</div>
                        {[3, 6, 9, 12].map(months => {
                            const emi = Math.round(grandTotal / months);
                            return (
                                <label key={months} style={{ ...optionCardStyle(months === 3), padding: "0.65rem 0.85rem", marginBottom: "0.35rem" }}>
                                    <input type="radio" name="emi" defaultChecked={months === 3} style={radioStyle} />
                                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#282c3f" }}>{months} Months</div>
                                            <div style={{ fontSize: "0.72rem", color: "#14958f" }}>No cost EMI</div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#282c3f" }}>₹{emi}/month</div>
                                    </div>
                                </label>
                            );
                        })}
                        <button onClick={handlePlaceOrder} disabled={placing} style={{ ...placeOrderBtnStyle, marginTop: "1rem" }}>
                            {placing ? "Processing..." : "Proceed with EMI"}
                        </button>
                    </div>
                );

            /* ── Net Banking ── */
            case "netbanking":
                return (
                    <div>
                        <div style={sectionTitleStyle}>NET BANKING</div>
                        <div style={{ fontSize: "0.78rem", color: "#535766", marginBottom: "0.6rem" }}>Popular Banks</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {NB_BANKS.map(bank => (
                                <label key={bank} style={{
                                    display: "flex", gap: "0.6rem", alignItems: "center", padding: "0.55rem 0.75rem",
                                    border: `1px solid ${selectedBank === bank ? "#ff3f6c" : "#f0f0f0"}`,
                                    borderRadius: 4, cursor: "pointer", fontSize: "0.82rem", color: "#282c3f",
                                    background: selectedBank === bank ? "#fff9fa" : "white",
                                }}>
                                    <input type="radio" name="bank" value={bank}
                                        checked={selectedBank === bank} onChange={() => setSelectedBank(bank)}
                                        style={radioStyle} />
                                    🏦 {bank}
                                </label>
                            ))}
                        </div>
                        <button onClick={handlePlaceOrder} disabled={placing || !selectedBank}
                            style={{ ...placeOrderBtnStyle, marginTop: "1rem", opacity: selectedBank ? 1 : 0.5 }}>
                            {placing ? "Redirecting to bank..." : selectedBank ? `Pay ₹${grandTotal} via ${selectedBank}` : "Select a bank"}
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    /* ────────────────── render ────────────────── */
    return (
        <div style={{ background: "#f5f5f6", minHeight: "100vh", paddingBottom: "3rem" }}>
            <CheckoutSteps current="payment" />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>

                {/* LEFT */}
                <div>
                    {/* Bank Offer Banner */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "0.85rem 1rem", marginBottom: "0.75rem", fontSize: "0.82rem" }}>
                        <div style={{ fontWeight: 700, color: "#282c3f", marginBottom: "0.25rem" }}>🏦 Bank Offer</div>
                        <div style={{ color: "#535766" }}>10% Instant Discount On HDFC Bank Credit Card on min spend of ₹4,000</div>
                        <button style={{ background: "none", border: "none", color: "#ff3f6c", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", marginTop: "0.3rem", padding: 0 }}>Show More ▾</button>
                    </div>

                    {/* Payment Panel */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#282c3f" }}>Choose Payment Mode</h2>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", minHeight: 400 }}>
                            {/* Sidebar */}
                            <div style={{ borderRight: "1px solid #e5e5e5" }}>
                                {METHODS.map(m => (
                                    <button key={m.id} onClick={() => setActiveMethod(m.id)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap",
                                            width: "100%", padding: "0.78rem 0.75rem", textAlign: "left",
                                            background: activeMethod === m.id ? "#fff9fa" : "white",
                                            border: "none", borderLeft: `3px solid ${activeMethod === m.id ? "#ff3f6c" : "transparent"}`,
                                            borderBottom: "1px solid #f5f5f6",
                                            cursor: "pointer", fontSize: "0.78rem", fontWeight: activeMethod === m.id ? 700 : 500,
                                            color: activeMethod === m.id ? "#ff3f6c" : "#535766",
                                        }}>
                                        <span>{m.icon}</span>
                                        <span style={{ flex: 1, whiteSpace: "pre-line" }}>{m.label}</span>
                                        {m.tag && <span style={{ fontSize: "0.62rem", color: "#ff3f6c", fontWeight: 700 }}>{m.tag}</span>}
                                    </button>
                                ))}
                            </div>

                            {/* Right panel content */}
                            <div style={{ padding: "1rem 1.25rem" }}>
                                {renderMethodPanel()}
                            </div>
                        </div>
                    </div>

                    {/* Gift Card */}
                    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "0.85rem 1rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "0.85rem", color: "#282c3f" }}>🎁 Have a Gift Card?</div>
                        <button style={{ background: "none", border: "none", color: "#ff3f6c", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>APPLY GIFT CARD</button>
                    </div>

                    {/* Payment logos */}
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#94969f" }}>
                        {["VISA", "Mastercard", "American Express", "Diners Club", "RuPay", "PayPal", "EMI"].map(p => (
                            <span key={p} style={{ padding: "0.2rem 0.6rem", border: "1px solid #d4d5d9", borderRadius: 4, fontSize: "0.68rem", color: "#535766" }}>{p}</span>
                        ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.72rem", color: "#94969f" }}>Need Help? <span style={{ color: "#ff3f6c", cursor: "pointer" }}>Contact Us</span></div>
                </div>

                {/* RIGHT — Price Summary */}
                <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "1.25rem", position: "sticky", top: 80 }}>
                    <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94969f", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                        PRICE DETAILS ({items.length} Item{items.length !== 1 ? "s" : ""})
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <Row label="Total MRP" value={`₹${origInr}`} />
                        <Row label="Discount on MRP" value={`−₹${discountInr}`} valueColor="#14958f" />
                        <Row label="Platform Fee" value={`₹${platformFee}`} />
                        <Row label="Shipping Fee" value="FREE" valueColor="#14958f" />
                        <div style={{ borderTop: "1px dashed #e5e5e5", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: "#282c3f" }}>
                            <span>Total Amount</span><span>₹{grandTotal}</span>
                        </div>
                    </div>
                    <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "#535766", lineHeight: 1.6 }}>
                        By placing the order, you agree to VendorVerse&apos;s <span style={{ color: "#ff3f6c", cursor: "pointer" }}>Terms of Use</span> and <span style={{ color: "#ff3f6c", cursor: "pointer" }}>Privacy Policy</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════ helpers ═══════════ */
const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#535766" }}>
        <span>{label}</span><span style={{ fontWeight: 600, color: valueColor || "#282c3f" }}>{value}</span>
    </div>
);

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.75rem", border: "1px solid #d4d5d9", borderRadius: 4,
    fontSize: "0.85rem", color: "#282c3f", background: "white", outline: "none",
};

const fieldLabelStyle: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 600, color: "#535766", marginBottom: "0.3rem", display: "block",
};

const radioStyle: React.CSSProperties = { accentColor: "#ff3f6c", marginTop: 2, flexShrink: 0 };

const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 700, color: "#94969f", letterSpacing: "0.06em", marginBottom: "0.75rem",
};

const optionCardStyle = (selected: boolean): React.CSSProperties => ({
    display: "flex", gap: "0.75rem", padding: "0.85rem", alignItems: "center",
    border: `1.5px solid ${selected ? "#ff3f6c" : "#e5e5e5"}`, borderRadius: 6,
    marginBottom: "0.5rem", cursor: "pointer", background: selected ? "#fff9fa" : "white",
});

const placeOrderBtnStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem", background: "#ff3f6c", color: "white",
    border: "none", borderRadius: 6, fontSize: "0.9rem", fontWeight: 700,
    letterSpacing: "0.05em", cursor: "pointer", transition: "opacity 0.2s",
};
