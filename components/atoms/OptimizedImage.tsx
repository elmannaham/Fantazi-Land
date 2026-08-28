"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  containerClassName?: string;
  fallbackInitials?: string;
}

// Shimmer base64 SVG placeholder pour un chargement visuel immédiat
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e1b4b" offset="20%" />
      <stop stop-color="#312e81" offset="50%" />
      <stop stop-color="#1e1b4b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e1b4b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export function OptimizedImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  fallbackInitials,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    if (fallbackInitials) {
      return (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 font-extrabold text-white ${className}`}>
          {fallbackInitials}
        </div>
      );
    }

    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width || 400 : undefined}
          height={!fill ? height || 400 : undefined}
          className={`${className} object-cover`}
          sizes={sizes || "(max-width: 768px) 100vw, 33vw"}
          {...props}
        />
      );
    }

    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-800 text-slate-400 text-xs font-semibold ${className}`}>
        Photo indisponible
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${fill ? "h-full w-full" : ""} ${containerClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 700))}`}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className={`${className} transition-all duration-500 ease-out ${
          isLoading ? "scale-105 blur-md opacity-0" : "scale-100 blur-0 opacity-100"
        }`}
        {...props}
      />
    </div>
  );
}
