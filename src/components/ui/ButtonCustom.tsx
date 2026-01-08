import { forwardRef, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses = {
  primary:
    "bg-secondary text-secondary-foreground hover:-translate-y-1 hover:shadow-cartoon-hover active:translate-y-0 active:shadow-cartoon-sm shadow-cartoon",
  secondary:
    "bg-primary text-primary-foreground hover:-translate-y-1 hover:shadow-cartoon-hover active:translate-y-0 active:shadow-cartoon-sm shadow-cartoon",
  outline:
    "border-3 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground",
  ghost: "text-primary hover:bg-primary/10",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      isLoading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "font-display font-bold rounded-2xl transition-all duration-200 ease-out",
          "inline-flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
