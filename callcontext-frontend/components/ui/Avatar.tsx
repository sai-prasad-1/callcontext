import { type HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/formatting";
import { getInitials } from "@/lib/utils/formatting";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt,
  firstName,
  lastName,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizeStyles = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const initials = getInitials(firstName, lastName);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden",
        "bg-brand-100 text-brand-600 font-medium",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || `${firstName} ${lastName}`.trim() || "Avatar"}
          fill
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
