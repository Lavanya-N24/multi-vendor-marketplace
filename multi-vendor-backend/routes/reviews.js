const express = require("express");
const { PrismaClient } = require("../prisma/generated/prisma");
const { auth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Add review
router.post("/", auth, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Check if user already reviewed this product
        const existing = await prisma.review.findFirst({
            where: { userId: req.user.id, productId: parseInt(productId) },
        });
        if (existing)
            return res.status(400).json({ error: "You already reviewed this product" });

        const review = await prisma.review.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId),
                rating: parseInt(rating),
                comment,
            },
            include: { user: { select: { id: true, name: true } } },
        });

        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create review" });
    }
});

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(req.params.productId) },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Delete review (own review)
router.delete("/:id", auth, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!review) return res.status(404).json({ error: "Review not found" });
        if (review.userId !== req.user.id)
            return res.status(403).json({ error: "Not your review" });

        await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Review deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

module.exports = router;
