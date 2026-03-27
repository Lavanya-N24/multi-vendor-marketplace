const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const compression = require("compression");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Multi-Vendor Marketplace API is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});