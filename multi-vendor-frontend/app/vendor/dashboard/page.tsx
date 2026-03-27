"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Product {
    id: number;
    title: string;
    price: number;
    stock: number;
    category?: string;
    image?: string;
    orders: any[];
    reviews: { rating: number }[];
}

interface VendorOrder {
    id: number;
    quantity: number;
    total: number;
    status: string;
    createdAt: string;
    product: { title: string };
    user: { name: string; email: string };
}

export default function VendorDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        image: "",
        category: "Electronics",
        stock: "",
    });

    useEffect(() => {
        if (!user?.isVendor) {
            router.push("/");
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [prodRes, orderRes] = await Promise.all([
                api.get("/products/vendor/mine"),
                api.get("/orders/vendor"),
            ]);
            setProducts(prodRes.data);
            setOrders(orderRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const openAddModal = () => {
        setEditProduct(null);
        setForm({ title: "", description: "", price: "", image: "", category: "Electronics", stock: "" });
        setShowModal(true);
    };

    const openEditModal = (p: Product) => {
        setEditProduct(p);
        setForm({
            title: p.title,
            description: "",
            price: p.price.toString(),
            image: p.image || "",
            category: p.category || "Electronics",
            stock: p.stock.toString(),
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editProduct) {
                await api.put(`/products/${editProduct.id}`, form);
            } else {
                await api.post("/products", form);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (orderId: number, status: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const getBadgeClass = (status: string) => {
        const map: Record<string, string> = {
            pending: "badge-pending", confirmed: "badge-confirmed",
            shipped: "badge-shipped", delivered: "badge-delivered",
            cancelled: "badge-cancelled",
        };
        return `badge ${map[status] || "badge-pending"}`;
    };

    if (loading)
        return (
            <div className="loading-page">
                <div className="spinner"></div>Loading dashboard...
            </div>
        );

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h1>Vendor Dashboard</h1>
                <p>Welcome back, {user?.name}! Manage your store below.</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value accent">{totalProducts}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value cyan">{totalOrders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Revenue</div>
                    <div className="stat-value success">${totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* Products */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div className="section-header" style={{ marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Your Products</h2>
                    <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                        + Add Product
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="empty-state" style={{ padding: "2rem" }}>
                        <p>No products yet. Add your first product!</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Orders</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                            {p.title}
                                        </td>
                                        <td>{p.category || "—"}</td>
                                        <td>${p.price.toFixed(2)}</td>
                                        <td>
                                            <span style={{ color: p.stock > 0 ? "var(--success)" : "var(--danger)" }}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td>{p.orders.length}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Orders */}
            <div className="card">
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
                    Recent Orders
                </h2>

                {orders.length === 0 ? (
                    <div className="empty-state" style={{ padding: "2rem" }}>
                        <p>No orders yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                            #{order.id}
                                        </td>
                                        <td>{order.product.title}</td>
                                        <td>{order.user.name}</td>
                                        <td>{order.quantity}</td>
                                        <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                        <td>
                                            <span className={getBadgeClass(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="form-input"
                                                style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", width: "auto" }}
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
                        <h2>{editProduct ? "Edit Product" : "Add New Product"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Product name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Product description..."
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Price ($)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        placeholder="29.99"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                        placeholder="100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Home">Home</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Books">Books</option>
                                    <option value="Beauty">Beauty</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input
                                    className="form-input"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
