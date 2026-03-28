"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useWishlist } from "../../lib/wishlist";
import ProductImage from "../components/ProductImage";

const USD_TO_INR = 83;

interface Product {
  id: number;
  title: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  vendor: { name: string };
  avgRating: number;
  reviewCount: number;
}

const CATEGORIES = [
  { name: "Electronics", icon: "💻", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" },
  { name: "Fashion", icon: "👗", img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=200&h=200&fit=crop" },
  { name: "Home", icon: "🏡", img: "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=200&h=200&fit=crop" },
  { name: "Sports", icon: "⚽", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" },
  { name: "Books", icon: "📚", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=200&fit=crop" },
  { name: "Beauty", icon: "✨", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop" },
];

const BANNERS = [
  { 
    title: "ELEVATE YOUR STYLE", 
    subtitle: "Up to 50% Off on Premium Fashion & Accessories", 
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=600&fit=crop",
    bg: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))",
    cta: "SHOP NOW" 
  },
  { 
    title: "NEXT-GEN TECH", 
    subtitle: "Discover the Latest in Electronics & Smart Devices", 
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&h=600&fit=crop",
    bg: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))",
    cta: "EXPLORE" 
  },
  { 
    title: "BEAUTY ESSENTIALS", 
    subtitle: "Premium Skincare & Makeup for a RADIANT YOU", 
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=600&fit=crop",
    bg: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))",
    cta: "SHOP BEAUTY" 
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // Fetch a larger batch for the home page sections (trending, deals, etc.)
    api.get("products", { params: { limit: 1000 } })
      .then((res) => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, vendorName: product.vendor.name });
  };

  const getOriginalPrice = (price: number) => Math.round(price * 1.35);

  const trending = products.filter((p) => p.avgRating >= 4).slice(0, 8);
  const newArrivals = [...products].reverse().slice(0, 8);
  const deals = products.filter((p) => p.price < 50).slice(0, 6);
  const topRated = [...products].sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);

  const b = BANNERS[bannerIdx];

  const ProductCard = ({ product, badge }: { product: Product; badge?: string }) => {
    const orig = getOriginalPrice(product.price);
    const discount = Math.round(((orig - product.price) / orig) * 100);
    const wishlisted = isInWishlist(product.id);
    return (
      <Link href={`/products/${product.id}`} className="home-product-card slide-up">
        <div className="home-card-image">
          <ProductImage src={product.image} alt={product.title} />
          <button className={`wishlist-heart ${wishlisted ? "active" : ""}`} onClick={(e) => handleWishlist(e, product)}>
            {wishlisted ? "❤️" : "🤍"}
          </button>
          {badge && <div className="home-badge" style={{ background: badge === "NEW" ? "#14958f" : "#ff3f6c" }}>{badge}</div>}
        </div>
        <div className="home-card-info">
          <div className="home-card-brand">{product.vendor.name}</div>
          <div className="home-card-title">{product.title}</div>
          <div className="product-rating-row">
            <span className={`rating-badge ${product.avgRating >= 4 ? "good" : "avg"}`}>{product.avgRating.toFixed(1)} ★</span>
            <span className="rating-count">({(product.reviewCount + 10).toLocaleString()})</span>
          </div>
          <div className="product-price-row">
            <span className="price-inr">₹{Math.round(product.price * USD_TO_INR).toLocaleString()}</span>
            <span className="price-original">₹{Math.round(orig * USD_TO_INR).toLocaleString()}</span>
            {discount > 15 && <span className="price-discount">({discount}% OFF)</span>}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main style={{ background: "white", paddingBottom: "4rem" }}>
      {/* Hero Banner */}
      <section className="home-banner-section">
        <div 
          className="home-banner fade-in" 
          style={{ 
            backgroundImage: `url(${b.image})`, 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            height: "500px"
          }}
        >
          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, background: b.bg, zIndex: 1 }} />
          <div className="home-banner-content" style={{ position: "relative", zIndex: 2 }}>
            <span className="home-banner-label">VENDORVERSE EXCLUSIVE</span>
            <h1 className="home-banner-title">{b.title}</h1>
            <p className="home-banner-sub">{b.subtitle}</p>
            <Link href="/products" className="home-banner-cta">{b.cta} →</Link>
          </div>
          <div className="home-banner-dots">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} className={`home-dot ${i === bannerIdx ? "active" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div style={{ background: "#f5f5f6", padding: "1.5rem 0", borderBottom: "1px solid #e5e5e5" }}>
        <div className="home-trust-grid" style={{ maxWidth: "1200px", margin: "0 auto", gap: "2rem" }}>
            {[
              { icon: "🏎️", title: "Free Shipping", desc: "Reliable delivery" },
              { icon: "🛡️", title: "Selected Quality", desc: "Always checked" },
              { icon: "🔄", title: "Easy Returns", desc: "30-day policy" },
              { icon: "🔒", title: "Secure Checkout", desc: "Data protection" },
            ].map((item) => (
              <div key={item.title} className="home-trust-item">
                <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>{item.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>{item.desc}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Categories */}
      <section className="home-section">
        <h2 className="home-section-title">CATEGORIES TO BAG</h2>
        <div className="home-categories">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/category/${cat.name}`} className="home-cat-card">
              <div className="home-cat-img" style={{ width: "130px", height: "130px" }}>
                <img src={cat.img} alt={cat.name} />
              </div>
              <div className="home-cat-name">{cat.name.toUpperCase()}</div>
              <div className="home-cat-count">{products.filter((p) => p.category === cat.name).length} Styles</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Budget Store */}
      <section className="home-section" style={{ background: "#fff0f3" }}>
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">BUDGET BUYS</h2>
            <p className="home-section-sub">Quality products under ₹3,500</p>
          </div>
          <Link href="/products" className="home-view-all">Explore All →</Link>
        </div>
        <div className="home-product-grid">
            {deals.map((p) => <ProductCard key={p.id} product={p} badge={`${Math.round(((getOriginalPrice(p.price) - p.price) / getOriginalPrice(p.price)) * 100)}% OFF`} />)}
        </div>
      </section>

      {/* Trending */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">TRENDING NOW</h2>
            <p className="home-section-sub">Most popular products this week</p>
          </div>
          <Link href="/products" className="home-view-all">View All →</Link>
        </div>
        <div className="home-product-grid">{trending.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      {/* Highlight Banners */}
      <section className="home-section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ position: "relative", height: "300px", borderRadius: "12px", overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=400&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Fashion" />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "2rem" }}>
                    <h3 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800 }}>STYLE UP</h3>
                    <p style={{ color: "white", marginBottom: "1rem" }}>Premium footwear & apparel</p>
                    <Link href="/category/Fashion" className="btn-primary" style={{ width: "fit-content" }}>EXPLORE NOW</Link>
                </div>
            </div>
            <div style={{ position: "relative", height: "300px", borderRadius: "12px", overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Electronics" />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "2rem" }}>
                    <h3 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800 }}>SMART DEALS</h3>
                    <p style={{ color: "white", marginBottom: "1rem" }}>Next-gen electronics</p>
                    <Link href="/category/Electronics" className="btn-primary" style={{ width: "fit-content" }}>SHOP DEALS</Link>
                </div>
            </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">NEW ON THE SHELF</h2>
              <p className="home-section-sub">The latest additions to our marketplace</p>
            </div>
            <Link href="/products" className="home-view-all">View All →</Link>
          </div>
          <div className="home-product-grid">{newArrivals.map((p) => <ProductCard key={p.id} product={p} badge="NEW" />)}</div>
        </section>
      )}

      {/* Footer Meta */}
      <section className="home-section" style={{ borderTop: "1px solid #f0f0f0", marginTop: "3rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#282c3f", marginBottom: "1rem", letterSpacing: "2px" }}>VENDORVERSE — YOUR GLOBAL MARKETPLACE</h3>
          <p style={{ fontSize: "0.85rem", color: "#94969f", lineHeight: "1.8", maxWidth: "800px", margin: "0 auto" }}>
              Explore an curated selection of products across fashion, electronics, home decor, and beauty. 
              We bring together the world&apos;s most talented vendors to provide you with a unique shopping experience.
              100% Genuine Products | Secure Payments | Easy Returns.
          </p>
      </section>
    </main>
  );
}
