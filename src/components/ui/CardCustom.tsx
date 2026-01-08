import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "gradient" | "outlined" | "highlight";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: "bg-card border border-border/20",
  gradient: "bg-gradient-to-br from-secondary to-accent",
  outlined: "bg-card border-3 border-secondary",
  highlight: "bg-card border-3 border-primary",
};

export function Card({
  children,
  variant = "default",
  hover = false,
  className,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl shadow-cartoon p-6",
        variantClasses[variant],
        hover && "cursor-pointer hover:-translate-y-1 hover:shadow-cartoon-hover transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
