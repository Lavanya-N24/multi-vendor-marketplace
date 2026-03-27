"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WishlistItem {
    productId: number;
    title: string;
    price: number;
    image?: string;
    category?: string;
    vendorName: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
    itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("wishlist");
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(items));
    }, [items]);

    const addToWishlist = (item: WishlistItem) => {
        setItems((prev) => {
            if (prev.find((i) => i.productId === item.productId)) return prev;
            return [...prev, item];
        });
    };

    const removeFromWishlist = (productId: number) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    };

    const isInWishlist = (productId: number) => {
        return items.some((i) => i.productId === productId);
    };

    const toggleWishlist = (item: WishlistItem) => {
        if (isInWishlist(item.productId)) {
            removeFromWishlist(item.productId);
        } else {
            addToWishlist(item);
        }
    };

    return (
        <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, itemCount: items.length }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
