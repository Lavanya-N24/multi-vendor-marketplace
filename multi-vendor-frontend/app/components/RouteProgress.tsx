"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="route-progress"
      role="progressbar"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "var(--accent, #ff3f6c)",
        transformOrigin: "left",
        animation: "routeProgress 0.4s ease-out forwards",
        zIndex: 9999,
      }}
    />
  );
}
