import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/";

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
