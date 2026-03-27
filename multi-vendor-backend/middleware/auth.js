const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const vendorOnly = (req, res, next) => {
    if (!req.user.isVendor) {
        return res.status(403).json({ error: "Vendor access required" });
    }
    next();
};

module.exports = { auth, vendorOnly };
