const express = require("express");
const { PrismaClient } = require("../prisma/generated/prisma");
const { auth, vendorOnly } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all products (public) — optimized with pagination and sorting
router.get("/", async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, gender, genderExact, subcategory, ageGroup, sortBy, page = 1, limit = 20 } = req.query;
        const where = {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        if (category) where.category = category;
        if (genderExact) where.gender = genderExact;
        else if (gender) where.gender = { in: [gender, "Unisex"] };
        if (subcategory) where.subcategory = subcategory;
        if (ageGroup) where.ageGroup = ageGroup;
        if (search) {
            const searchQuery = search.trim().split(/\s+/).join(" & ");
            where.OR = [
                { title: { search: searchQuery } },
                { description: { search: searchQuery } },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        let orderBy = { createdAt: "desc" };
        if (sortBy === "price-low") orderBy = { price: "asc" };
        else if (sortBy === "price-high") orderBy = { price: "desc" };
        else if (sortBy === "stock") orderBy = { stock: "desc" };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                select: {
                    id: true, title: true, description: true, price: true, image: true,
                    category: true, subcategory: true, gender: true, size: true, stock: true,
                    createdAt: true,
                    vendor: { select: { id: true, name: true } },
                    _count: { select: { reviews: true } },
                },
                orderBy,
            }),
            prisma.product.count({ where })
        ]);

        // Get avg ratings in one query
        const ratings = await prisma.review.groupBy({
            by: ["productId"],
            _avg: { rating: true },
            where: { productId: { in: products.map(p => p.id) } },
        });
        const ratingMap = Object.fromEntries(ratings.map(r => [r.productId, r._avg.rating || 0]));

        const result = products.map((p) => ({
            ...p,
            avgRating: ratingMap[p.id] || 0,
            reviewCount: p._count.reviews,
            _count: undefined,
        }));

        // If sorting by rating, we do it in memory since it's a computed field
        if (sortBy === "rating") {
            result.sort((a, b) => b.avgRating - a.avgRating);
        } else if (sortBy === "popular") {
            result.sort((a, b) => b.reviewCount - a.reviewCount);
        }

        res.json({
            products: result,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasMore: pageNum * limitNum < total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Get single product
router.get("/:id", async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                vendor: { select: { id: true, name: true } },
                reviews: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!product) return res.status(404).json({ error: "Product not found" });

        const avgRating =
            product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

        res.json({ ...product, avgRating, reviewCount: product.reviews.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

// Create product (vendor only)
router.post("/", auth, vendorOnly, async (req, res) => {
    try {
        const { title, description, price, image, category, stock } = req.body;
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                image,
                category,
                stock: parseInt(stock) || 0,
                vendorId: req.user.id,
            },
        });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// Update product (vendor only, own product)
router.put("/:id", auth, vendorOnly, async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.vendorId !== req.user.id)
            return res.status(403).json({ error: "Not your product" });

        const { title, description, price, image, category, stock } = req.body;
        const updated = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                description,
                price: parseFloat(price),
                image,
                category,
                stock: parseInt(stock),
            },
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Delete product (vendor only, own product)
router.delete("/:id", auth, vendorOnly, async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.vendorId !== req.user.id)
            return res.status(403).json({ error: "Not your product" });

        // Delete related reviews and orders first
        await prisma.review.deleteMany({ where: { productId: product.id } });
        await prisma.order.deleteMany({ where: { productId: product.id } });
        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Get vendor's products
router.get("/vendor/mine", auth, vendorOnly, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { vendorId: req.user.id },
            include: {
                reviews: { select: { rating: true } },
                orders: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vendor products" });
    }
});

module.exports = router;
