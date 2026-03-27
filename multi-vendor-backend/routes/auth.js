const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../prisma/generated/prisma");

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, isVendor } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: "Email already in use" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, isVendor: isVendor || false },
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, isVendor: user.isVendor },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isVendor: user.isVendor } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, isVendor: user.isVendor },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isVendor: user.isVendor } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// Get current user
router.get("/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, isVendor: true, createdAt: true },
        });
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
