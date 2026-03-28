import axios from "axios";

// Production: set in Vercel → Environment Variables
// Example: https://your-api.onrender.com/api/  (must end with / so paths like "products" resolve correctly)
const raw = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api").trim();
const API_URL = raw.endsWith("/") ? raw : `${raw}/`;

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    if (!process.env.NEXT_PUBLIC_API_URL || API_URL.includes("127.0.0.1") || API_URL.includes("localhost")) {
        console.error(
            "[marketplace] NEXT_PUBLIC_API_URL is missing or still points to localhost. " +
                "Set it in Vercel to your Render API base URL ending with /api/ (e.g. https://xxx.onrender.com/api/)."
        );
    }
}

const api = axios.create({
    baseURL: API_URL,
});

// Add token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
