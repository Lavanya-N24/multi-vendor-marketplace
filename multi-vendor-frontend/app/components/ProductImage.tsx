"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

const FALLBACK_EMOJI = "📦";

export default function ProductImage({
  src,
  alt,
  className = "",
  fill = true,
  sizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src) {
    return <span style={{ fontSize: "3rem" }}>{FALLBACK_EMOJI}</span>;
  }

  // Use native <img> for external CDNs (Pexels, Unsplash, etc.) so product images load like Myntra/Flipkart
  const isExternal =
    src.includes("placehold.co") ||
    src.includes("loremflickr.com") ||
    src.includes("picsum.photos") ||
    src.includes("images.unsplash.com") ||
    src.includes("images.pexels.com") ||
    src.includes("image.pollinations.ai");

  if (isExternal) {
    return (
      <img
        src={error ? "https://placehold.co/400x500/f5f5f6/94969f?text=No+Image" : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
        onError={(e) => {
          if (!error) {
            setError(true);
          }
        }}
      />
    );
  }

  return (
    <Image
      src={error ? "https://placehold.co/400x500/f5f5f6/94969f?text=No+Image" : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit: "cover", objectPosition: "center" }}
      onError={() => setError(true)}
      unoptimized={error ? true : false}
    />
  );
}
