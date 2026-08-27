interface AvatarProps {
  src?: string;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt, name, size = "md" }: AvatarProps) {
  const sizeStyles = {
    sm: "h-8 w-8 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
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
      className={`${sizeStyles[size]} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-purple-100 bg-purple-50 font-bold text-purple-600`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
