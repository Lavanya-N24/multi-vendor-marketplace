"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

interface Order {
    id: number;
    quantity: number;
    total: number;
    status: string;
    createdAt: string;
    product: {
        id: number;
        title: string;
        image?: string;
        price: number;
        vendor: { name: string };
    };
}

export default function OrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        api
            .get("/orders")
            .then((res) => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const getBadgeClass = (status: string) => {
        const map: Record<string, string> = {
            pending: "badge-pending",
            confirmed: "badge-confirmed",
            shipped: "badge-shipped",
            delivered: "badge-delivered",
            cancelled: "badge-cancelled",
        };
        return `badge ${map[status] || "badge-pending"}`;
    };

    if (loading)
        return (
            <div className="loading-page">
                <div className="spinner"></div>Loading orders...
            </div>
        );

    return (
        <div className="section fade-in">
            <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h2>No orders yet</h2>
                    <p>Your purchase history will appear here</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Product</th>
                                <th>Vendor</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                        #{order.id}
                                    </td>
                                    <td style={{ color: "var(--text-primary)" }}>
                                        {order.product.title}
                                    </td>
                                    <td>{order.product.vendor.name}</td>
                                    <td>{order.quantity}</td>
                                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={getBadgeClass(order.status)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
