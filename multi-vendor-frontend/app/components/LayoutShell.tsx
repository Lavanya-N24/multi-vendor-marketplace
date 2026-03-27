"use client";

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
            <Navbar />
            {children}
            <footer className="footer">
                © 2026 VendorVerse. All rights reserved.
            </footer>
        </>
    );
}
