import { OptimizedImage } from "./OptimizedImage";

interface AvatarProps {
  src?: string | null;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export function Avatar({ src, alt, name, size = "md", className = "" }: AvatarProps) {
  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-24 w-24 text-2xl",
    "2xl": "h-40 w-40 text-4xl sm:h-48 sm:w-48",
    "3xl": "h-56 w-56 text-6xl sm:h-64 sm:w-64",
  };

  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    "2xl": 192,
    "3xl": 256,
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
    : (alt && alt[0] ? alt[0].toUpperCase() : "?");

  return (
    <div
      className={`${sizeStyles[size]} relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-purple-100 bg-purple-50 font-bold text-purple-600 shadow-sm ${className}`}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          sizes={`${pixelSizes[size]}px`}
          className="h-full w-full object-cover"
          fallbackInitials={initials}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
