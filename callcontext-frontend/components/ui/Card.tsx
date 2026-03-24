import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/formatting";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "stat";
  children: ReactNode;
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles =
    "bg-white border border-warm-200 rounded-lg shadow-sm";

  const variantStyles = {
    default: "",
    hover: "transition-all duration-150 hover:shadow-md hover:border-warm-300 cursor-pointer",
    stat: "",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 border-b border-warm-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 border-t border-warm-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}
