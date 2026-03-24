import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/formatting";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon: Icon,
      iconPosition = "left",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
      secondary:
        "bg-white border border-warm-200 text-warm-700 hover:bg-warm-50 active:bg-warm-100",
      ghost:
        "bg-transparent text-warm-600 hover:bg-warm-100 active:bg-warm-150",
      danger:
        "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700",
      accent:
        "bg-accent-400 text-warm-900 hover:bg-accent-500 active:bg-accent-600",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-10 px-5 text-base gap-2",
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 size={iconSizes[size]} className="animate-spin" />}
        {!loading && Icon && iconPosition === "left" && (
          <Icon size={iconSizes[size]} />
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon size={iconSizes[size]} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
