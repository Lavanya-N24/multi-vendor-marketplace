const express = require("express");
const { PrismaClient } = require("../prisma/generated/prisma");
const { auth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Create order
router.post("/", auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.stock < quantity)
            return res.status(400).json({ error: "Insufficient stock" });

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity) || 1,
                total: product.price * (parseInt(quantity) || 1),
                status: "confirmed",
            },
        });

        // Reduce stock
        await prisma.product.update({
            where: { id: parseInt(productId) },
            data: { stock: product.stock - (parseInt(quantity) || 1) },
        });

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    include: { vendor: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Get vendor's orders (orders for vendor's products)
router.get("/vendor", auth, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { product: { vendorId: req.user.id } },
            include: {
                product: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vendor orders" });
    }
});

// Update order status (vendor only)
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { product: true },
        });

        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.product.vendorId !== req.user.id)
            return res.status(403).json({ error: "Not your order to update" });

        const updated = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update order" });
    }
});

module.exports = router;
