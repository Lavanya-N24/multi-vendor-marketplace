import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import RouteProgress from "./components/RouteProgress";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { WishlistProvider } from "../lib/wishlist";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VendorVerse — Multi-Vendor Marketplace",
  description:
    "Discover amazing products from multiple vendors. Shop, sell, and grow with VendorVerse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`} style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RouteProgress />
            <LayoutShell>{children}</LayoutShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
