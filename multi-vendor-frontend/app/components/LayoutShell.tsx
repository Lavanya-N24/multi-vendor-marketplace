"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWelcome = pathname === "/";

    if (isWelcome) {
        return <>{children}</>;
    }
    return (
        <>
            <Suspense fallback={<div className="navbar-skeleton" style={{ height: "80px" }} />}>
                <Navbar />
            </Suspense>
            {children}
            <footer className="footer">
                © 2026 VendorVerse. All rights reserved.
            </footer>
        </>
    );
}
