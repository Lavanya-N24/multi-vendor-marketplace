"use client";

import React from "react";
import { useTheme } from "../../lib/theme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle ${theme === "dark" ? "active" : ""}`}
            aria-label="Toggle Dark Mode"
        >
            <div className="toggle-thumb">
                {theme === "dark" ? (
                    <Moon size={14} color="#181a25" className="toggle-icon icon-moon" />
                ) : (
                    <Sun size={14} color="#ff3f6c" className="toggle-icon icon-sun" />
                )}
            </div>
        </button>
    );
}
