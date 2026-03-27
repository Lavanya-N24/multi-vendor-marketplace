"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";
import ThemeToggle from "./ThemeToggle";

// Myntra-style navbar categories: MEN, WOMEN, KIDS, HOME, BEAUTY, GENZ
const MEGA_MENUS: Record<string, { heading: string; color: string; items: { label: string; href: string }[] }[]> = {
    MEN: [
        {
            heading: "Topwear", color: "#ee5f73", items: [
                { label: "T-Shirts", href: "/category/Fashion" },
                { label: "Casual Shirts", href: "/category/Fashion" },
                { label: "Formal Shirts", href: "/category/Fashion" },
                { label: "Jackets", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Bottomwear", color: "#ee5f73", items: [
                { label: "Jeans", href: "/category/Fashion" },
                { label: "Trousers", href: "/category/Fashion" },
                { label: "Shorts", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Footwear", color: "#ee5f73", items: [
                { label: "Sneakers", href: "/category/Sports" },
                { label: "Running Shoes", href: "/category/Sports" },
                { label: "Formal Shoes", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Gadgets", color: "#ee5f73", items: [
                { label: "Smart Watches", href: "/category/Electronics" },
                { label: "Headphones", href: "/category/Electronics" },
                { label: "Speakers", href: "/category/Electronics" },
            ]
        },
    ],
    WOMEN: [
        {
            heading: "Western Wear", color: "#fb56c1", items: [
                { label: "Dresses", href: "/category/Fashion" },
                { label: "Tops", href: "/category/Fashion" },
                { label: "Jeans & Trousers", href: "/category/Fashion" },
                { label: "Jackets & Coats", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Footwear", color: "#fb56c1", items: [
                { label: "Flats", href: "/category/Fashion" },
                { label: "Heels", href: "/category/Fashion" },
                { label: "Sneakers", href: "/category/Sports" },
            ]
        },
        {
            heading: "Beauty & Care", color: "#fb56c1", items: [
                { label: "Lipsticks", href: "/category/Beauty" },
                { label: "Skincare", href: "/category/Beauty" },
                { label: "Makeup", href: "/category/Beauty" },
                { label: "Hair Care", href: "/category/Beauty" },
            ]
        },
        {
            heading: "Accessories", color: "#fb56c1", items: [
                { label: "Handbags", href: "/category/Fashion" },
                { label: "Sunglasses", href: "/category/Fashion" },
                { label: "Watches", href: "/category/Electronics" },
                { label: "Jewellery", href: "/category/Fashion" },
            ]
        },
    ],
    KIDS: [
        {
            heading: "Boys Clothing", color: "#f26a10", items: [
                { label: "T-Shirts", href: "/category/Fashion" },
                { label: "Shirts", href: "/category/Fashion" },
                { label: "Shorts", href: "/category/Fashion" },
                { label: "Jeans", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Girls Clothing", color: "#f26a10", items: [
                { label: "Dresses", href: "/category/Fashion" },
                { label: "Tops", href: "/category/Fashion" },
                { label: "Skirts", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Footwear", color: "#f26a10", items: [
                { label: "Sneakers", href: "/category/Sports" },
                { label: "School Shoes", href: "/category/Fashion" },
                { label: "Sandals", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Toys & Books", color: "#f26a10", items: [
                { label: "Books", href: "/category/Books" },
                { label: "Stationery", href: "/category/Books" },
            ]
        },
    ],
    HOME: [
        {
            heading: "Decor", color: "#0db7af", items: [
                { label: "Plant Pots", href: "/category/Home" },
                { label: "Candles", href: "/category/Home" },
                { label: "Wall Art", href: "/category/Home" },
                { label: "Fairy Lights", href: "/category/Home" },
            ]
        },
        {
            heading: "Furnishing", color: "#0db7af", items: [
                { label: "Throw Blankets", href: "/category/Home" },
                { label: "Desk Organizers", href: "/category/Home" },
                { label: "Cushion Covers", href: "/category/Home" },
            ]
        },
        {
            heading: "Kitchen", color: "#0db7af", items: [
                { label: "Skillets & Pans", href: "/category/Home" },
                { label: "Coffee Makers", href: "/category/Home" },
                { label: "Cutting Boards", href: "/category/Home" },
            ]
        },
        {
            heading: "Electronics", color: "#0db7af", items: [
                { label: "Smart Devices", href: "/category/Electronics" },
                { label: "Chargers", href: "/category/Electronics" },
                { label: "Power Banks", href: "/category/Electronics" },
            ]
        },
    ],
    BEAUTY: [
        {
            heading: "Skincare", color: "#ee5f73", items: [
                { label: "Face Serums", href: "/category/Beauty" },
                { label: "Face Rollers", href: "/category/Beauty" },
                { label: "Sheet Masks", href: "/category/Beauty" },
                { label: "Moisturisers", href: "/category/Beauty" },
            ]
        },
        {
            heading: "Makeup", color: "#ee5f73", items: [
                { label: "Lipsticks", href: "/category/Beauty" },
                { label: "Foundation", href: "/category/Beauty" },
                { label: "Brush Sets", href: "/category/Beauty" },
            ]
        },
        {
            heading: "Hair Care", color: "#ee5f73", items: [
                { label: "Shampoo", href: "/category/Beauty" },
                { label: "Argan Oil", href: "/category/Beauty" },
                { label: "Hair Treatments", href: "/category/Beauty" },
            ]
        },
        {
            heading: "Bath & Body", color: "#ee5f73", items: [
                { label: "Bath Bombs", href: "/category/Beauty" },
                { label: "Lip Balms", href: "/category/Beauty" },
                { label: "Body Lotion", href: "/category/Beauty" },
            ]
        },
    ],
    GENZ: [
        {
            heading: "Trending", color: "#7b61ff", items: [
                { label: "Graphic Tees", href: "/category/Fashion" },
                { label: "Oversized Fits", href: "/category/Fashion" },
                { label: "Streetwear", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Accessories", color: "#7b61ff", items: [
                { label: "Sneakers", href: "/category/Sports" },
                { label: "Caps & Beanies", href: "/category/Fashion" },
                { label: "Sunglasses", href: "/category/Fashion" },
            ]
        },
        {
            heading: "Tech", color: "#7b61ff", items: [
                { label: "Earbuds", href: "/category/Electronics" },
                { label: "Smart Watches", href: "/category/Electronics" },
                { label: "Speakers", href: "/category/Electronics" },
            ]
        },
        {
            heading: "Self Care", color: "#7b61ff", items: [
                { label: "Skincare", href: "/category/Beauty" },
                { label: "Grooming", href: "/category/Beauty" },
                { label: "Fitness", href: "/category/Sports" },
            ]
        },
    ],
};

const CATEGORY_NAMES = Object.keys(MEGA_MENUS);

const CATEGORY_ROUTES: Record<string, string> = {
    MEN: "/category/Men",
    WOMEN: "/category/Women",
    KIDS: "/category/Kids",
    HOME: "/category/Home",
    BEAUTY: "/category/Beauty",
    GENZ: "/category/GenZ",
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [search, setSearch] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeMega, setActiveMega] = useState<string | null>(null);

    // Sync search input with URL param
    useEffect(() => {
        const q = searchParams.get("search") || searchParams.get("q") || "";
        setSearch(q);
    }, [searchParams, pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link href="/store" className="navbar-logo">
                    <span className="logo-icon">V</span>
                </Link>

                {/* Category Links with Mega Menus */}
                <div className="navbar-categories">
                    {CATEGORY_NAMES.map((cat) => (
                        <div
                            key={cat}
                            className="nav-category-wrap"
                            onMouseEnter={() => setActiveMega(cat)}
                            onMouseLeave={() => setActiveMega(null)}
                        >
                            <Link href={CATEGORY_ROUTES[cat] || `/category/${cat}`} className="nav-category">
                                {cat}
                            </Link>

                            {/* Mega Dropdown */}
                            {activeMega === cat && (
                                <div className="mega-dropdown" onMouseLeave={() => setActiveMega(null)}>
                                    <div className="mega-dropdown-inner">
                                        {MEGA_MENUS[cat].map((section) => (
                                            <div key={section.heading} className="mega-section">
                                                <h4 className="mega-heading" style={{ color: section.color }}>{section.heading}</h4>
                                                <ul className="mega-list">
                                                    {section.items.map((item) => (
                                                        <li key={item.label}>
                                                            <Link href={item.href} className="mega-link" onClick={() => setActiveMega(null)}>
                                                                {item.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <form className="navbar-search" onSubmit={handleSearch}>
                    <button type="submit" className="search-submit-btn" aria-label="Search">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoComplete="off"
                        aria-label="Search for products, brands and more"
                    />
                </form>

                {/* Right Icons */}
                <div className="navbar-icons" style={{ display: 'flex', alignItems: 'center' }}>
                    
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Profile */}
                    <div
                        className="nav-icon-item"
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="nav-icon-label">Profile</span>

                        {showProfileMenu && (
                            <div className="nav-dropdown">
                                {user ? (
                                    <>
                                        <div className="nav-dropdown-header">
                                            <strong>Hello {user.name}</strong>
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="nav-dropdown-divider" />
                                        <Link href="/orders" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Orders</Link>
                                        <Link href="/wishlist" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Wishlist</Link>
                                        <Link href="/profile?tab=giftcards" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Gift Cards</Link>
                                        <Link href="/profile?tab=contact" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Contact Us</Link>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                                            <Link href="/profile?tab=insider" style={{ color: "inherit", textDecoration: "none" }} onClick={() => setShowProfileMenu(false)}>
                                                VendorVerse Insider
                                            </Link>
                                            <span style={{ background: "#ff3f6c", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: 3 }}>NEW</span>
                                        </div>
                                        <div className="nav-dropdown-divider" />
                                        <Link href="/profile?tab=credit" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>VendorVerse Credit</Link>
                                        <Link href="/profile?tab=coupons" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Coupons</Link>
                                        <Link href="/profile?tab=cards" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Saved Cards</Link>
                                        <Link href="/profile?tab=addresses" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Saved Addresses</Link>
                                        {user.isVendor && (
                                            <Link href="/vendor/dashboard" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Vendor Dashboard</Link>
                                        )}
                                        <div className="nav-dropdown-divider" />
                                        <Link href="/profile?tab=edit" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Edit Profile</Link>
                                        <button onClick={() => { logout(); setShowProfileMenu(false); }} className="nav-dropdown-item nav-dropdown-logout">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="nav-dropdown-header">
                                            <strong>Welcome</strong>
                                            <span>To access account and manage orders</span>
                                        </div>
                                        <div className="nav-dropdown-auth">
                                            <Link href="/login" className="nav-auth-btn" onClick={() => setShowProfileMenu(false)}>LOGIN / SIGNUP</Link>
                                        </div>
                                        <div className="nav-dropdown-divider" />
                                        <Link href="/orders" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Orders</Link>
                                        <Link href="/wishlist" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Wishlist</Link>
                                        <Link href="/profile" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Gift Cards</Link>
                                        <Link href="/profile" className="nav-dropdown-item" onClick={() => setShowProfileMenu(false)}>Contact Us</Link>
                                    </>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Wishlist */}
                    <Link href="/wishlist" className="nav-icon-item">
                        <div style={{ position: "relative" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {wishlistCount > 0 && <span className="bag-count">{wishlistCount}</span>}
                        </div>
                        <span className="nav-icon-label">Wishlist</span>
                    </Link>

                    {/* Bag / Cart */}
                    <Link href="/cart" className="nav-icon-item">
                        <div style={{ position: "relative" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            {itemCount > 0 && <span className="bag-count">{itemCount}</span>}
                        </div>
                        <span className="nav-icon-label">Bag</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
