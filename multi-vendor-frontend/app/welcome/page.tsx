"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(() => router.push("/"), 800);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

                .welcome-page {
                    position: fixed; inset: 0; z-index: 99999;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    overflow: hidden; cursor: default;
                    background: #0a0a0f;
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }
                .welcome-page.exiting {
                    opacity: 0; transform: scale(1.1);
                }

                /* Animated gradient background */
                .welcome-bg {
                    position: absolute; inset: 0; z-index: 0;
                    background: 
                        radial-gradient(ellipse at 20% 50%, rgba(255,63,108,0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 20%, rgba(20,149,143,0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 80%, rgba(255,126,51,0.12) 0%, transparent 50%),
                        linear-gradient(135deg, #0a0a1a 0%, #0d0d20 50%, #0a0a1a 100%);
                    animation: bgShift 8s ease-in-out infinite alternate;
                }
                @keyframes bgShift {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(25deg); }
                }

                /* Floating particles */
                .particles {
                    position: absolute; inset: 0; z-index: 1; overflow: hidden;
                }
                .particle {
                    position: absolute; border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                    animation: float 20s infinite;
                }
                .particle:nth-child(1) { width: 300px; height: 300px; top: -5%; left: 10%; animation-duration: 25s; }
                .particle:nth-child(2) { width: 200px; height: 200px; top: 60%; right: -3%; animation-duration: 18s; animation-delay: -5s; }
                .particle:nth-child(3) { width: 150px; height: 150px; bottom: 10%; left: 30%; animation-duration: 22s; animation-delay: -8s; }
                .particle:nth-child(4) { width: 100px; height: 100px; top: 20%; right: 20%; animation-duration: 15s; animation-delay: -3s; background: rgba(255,63,108,0.08); }
                .particle:nth-child(5) { width: 250px; height: 250px; bottom: -5%; right: 15%; animation-duration: 30s; animation-delay: -10s; background: rgba(20,149,143,0.06); }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(30px, -50px) rotate(5deg); }
                    50% { transform: translate(-20px, 20px) rotate(-3deg); }
                    75% { transform: translate(40px, 30px) rotate(7deg); }
                }

                /* Glowing lines */
                .glow-line {
                    position: absolute; z-index: 1;
                    height: 1px; opacity: 0.15;
                    background: linear-gradient(90deg, transparent, #ff3f6c, #14958f, transparent);
                    animation: glowSlide 6s ease-in-out infinite;
                }
                .glow-line:nth-child(1) { top: 25%; left: 0; width: 60%; animation-delay: 0s; }
                .glow-line:nth-child(2) { top: 55%; right: 0; width: 45%; animation-delay: -2s; }
                .glow-line:nth-child(3) { bottom: 30%; left: 10%; width: 55%; animation-delay: -4s; }
                @keyframes glowSlide {
                    0%, 100% { opacity: 0.05; transform: translateX(-10%); }
                    50% { opacity: 0.2; transform: translateX(10%); }
                }

                /* Main content */
                .welcome-content {
                    position: relative; z-index: 10;
                    text-align: center;
                    display: flex; flex-direction: column; align-items: center;
                    gap: 0;
                }

                /* Logo icon */
                .welcome-logo {
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #ff3f6c, #ff7e33);
                    border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem; font-weight: 900; color: white;
                    font-family: 'Outfit', sans-serif;
                    box-shadow: 0 20px 60px rgba(255,63,108,0.3);
                    margin-bottom: 2rem;
                    opacity: 0; transform: scale(0.5) rotate(-10deg);
                    transition: all 0.8s cubic-bezier(0.34,1.56,0.64,1);
                }
                .loaded .welcome-logo {
                    opacity: 1; transform: scale(1) rotate(0deg);
                }

                /* Welcome text */
                .welcome-label {
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.85rem; font-weight: 500;
                    letter-spacing: 6px; text-transform: uppercase;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 1rem;
                    opacity: 0; transform: translateY(15px);
                    transition: all 0.6s ease 0.3s;
                }
                .loaded .welcome-label {
                    opacity: 1; transform: translateY(0);
                }

                /* Brand name */
                .welcome-brand {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(3rem, 8vw, 6.5rem);
                    font-weight: 900;
                    letter-spacing: -2px;
                    background: linear-gradient(135deg, #ffffff 0%, #ff3f6c 40%, #ff7e33 60%, #14958f 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradientText 4s ease infinite;
                    margin-bottom: 0.5rem;
                    opacity: 0; transform: translateY(30px);
                    transition: all 0.8s ease 0.5s;
                    line-height: 1.1;
                }
                .loaded .welcome-brand {
                    opacity: 1; transform: translateY(0);
                }
                @keyframes gradientText {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                /* Tagline */
                .welcome-tagline {
                    font-family: 'Outfit', sans-serif;
                    font-size: clamp(1rem, 2.5vw, 1.35rem);
                    font-weight: 300;
                    color: rgba(255,255,255,0.55);
                    max-width: 500px;
                    line-height: 1.6;
                    margin-bottom: 3rem;
                    opacity: 0; transform: translateY(20px);
                    transition: all 0.6s ease 0.7s;
                }
                .loaded .welcome-tagline {
                    opacity: 1; transform: translateY(0);
                }

                /* CTA Button */
                .welcome-cta {
                    position: relative;
                    font-family: 'Outfit', sans-serif;
                    font-size: 1rem; font-weight: 600;
                    letter-spacing: 3px; text-transform: uppercase;
                    color: white;
                    background: linear-gradient(135deg, #ff3f6c, #ff6b35);
                    border: none; border-radius: 60px;
                    padding: 1rem 3.5rem;
                    cursor: pointer;
                    overflow: hidden;
                    opacity: 0; transform: translateY(20px);
                    transition: all 0.6s ease 0.9s;
                    box-shadow: 0 10px 40px rgba(255,63,108,0.3);
                }
                .loaded .welcome-cta {
                    opacity: 1; transform: translateY(0);
                }
                .welcome-cta:hover {
                    transform: translateY(-3px) scale(1.05) !important;
                    box-shadow: 0 15px 50px rgba(255,63,108,0.45);
                }
                .welcome-cta::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
                    transform: translateX(-100%);
                    transition: transform 0.6s ease;
                }
                .welcome-cta:hover::before {
                    transform: translateX(100%);
                }

                /* Scroll indicator */
                .welcome-scroll {
                    position: absolute; bottom: 2rem; left: 50%;
                    transform: translateX(-50%);
                    display: flex; flex-direction: column; align-items: center;
                    opacity: 0;
                    transition: opacity 0.6s ease 1.3s;
                    z-index: 10;
                }
                .loaded .welcome-scroll {
                    opacity: 0.4;
                }
                .scroll-mouse {
                    width: 24px; height: 38px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-radius: 12px;
                    display: flex; justify-content: center;
                    padding-top: 8px;
                    margin-bottom: 0.5rem;
                }
                .scroll-dot {
                    width: 4px; height: 8px;
                    background: rgba(255,255,255,0.6);
                    border-radius: 2px;
                    animation: scrollBounce 1.5s ease-in-out infinite;
                }
                @keyframes scrollBounce {
                    0%, 100% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(10px); opacity: 0.3; }
                }
                .scroll-text {
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.65rem; color: rgba(255,255,255,0.35);
                    letter-spacing: 3px; text-transform: uppercase;
                }

                /* Feature pills at bottom */
                .welcome-features {
                    display: flex; gap: 2rem;
                    margin-top: 2.5rem;
                    opacity: 0;
                    transition: opacity 0.6s ease 1.1s;
                }
                .loaded .welcome-features {
                    opacity: 1;
                }
                .welcome-feat {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.75rem; color: rgba(255,255,255,0.35);
                    letter-spacing: 1px;
                }
                .feat-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: rgba(255,63,108,0.6);
                }

                /* Corner decorations */
                .corner-deco {
                    position: absolute; z-index: 2;
                    width: 120px; height: 120px;
                    border: 1px solid rgba(255,255,255,0.04);
                }
                .corner-deco.tl { top: 2rem; left: 2rem; border-right: none; border-bottom: none; }
                .corner-deco.br { bottom: 2rem; right: 2rem; border-left: none; border-top: none; }
            `}</style>

            <div className={`welcome-page ${loaded ? "loaded" : ""} ${exiting ? "exiting" : ""}`}>
                <div className="welcome-bg" />

                {/* Floating particles */}
                <div className="particles">
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                </div>

                {/* Glowing accent lines */}
                <div className="glow-line" />
                <div className="glow-line" />
                <div className="glow-line" />

                {/* Corner decorations */}
                <div className="corner-deco tl" />
                <div className="corner-deco br" />

                {/* Main content */}
                <div className="welcome-content">
                    <div className="welcome-logo">V</div>
                    <div className="welcome-label">Welcome to</div>
                    <h1 className="welcome-brand">VendorVerse</h1>
                    <p className="welcome-tagline">
                        Your premium multi-vendor marketplace. Discover extraordinary products from trusted sellers worldwide.
                    </p>
                    <button className="welcome-cta" onClick={handleEnter}>
                        Explore Now
                    </button>
                    <div className="welcome-features">
                        <div className="welcome-feat"><div className="feat-dot" />365+ Products</div>
                        <div className="welcome-feat"><div className="feat-dot" />12+ Vendors</div>
                        <div className="welcome-feat"><div className="feat-dot" />Free Shipping</div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="welcome-scroll">
                    <div className="scroll-mouse"><div className="scroll-dot" /></div>
                    <div className="scroll-text">Click to Enter</div>
                </div>
            </div>
        </>
    );
}
