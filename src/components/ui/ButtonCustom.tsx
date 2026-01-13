import { forwardRef, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  isLoading?: boolean;
  glow?: boolean;
}

const variantClasses = {
  primary: `
    text-white font-heading font-bold uppercase tracking-wider
    bg-gradient-to-r from-[#5b00a3] to-[#4C1D95]
    hover:from-[#4C1D95] hover:to-[#3d017a]
    shadow-[0_8px_24px_rgba(91,0,163,0.4)]
    hover:shadow-[0_12px_32px_rgba(91,0,163,0.5),0_0_20px_rgba(91,0,163,0.3)]
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  secondary: `
    text-white font-heading font-bold uppercase tracking-wider
    bg-gradient-to-r from-purple-600 to-purple-700
    hover:from-purple-700 hover:to-purple-800
    shadow-[0_8px_24px_hsl(263_84%_58%/0.4)]
    hover:shadow-[0_12px_32px_hsl(263_84%_58%/0.5),0_0_20px_hsl(263_84%_58%/0.3)]
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  outline: `
    font-heading font-bold uppercase tracking-wider
    border-2 border-[#5b00a3] text-[#5b00a3] bg-transparent
    backdrop-blur-sm
    hover:bg-[#5b00a3] hover:text-white
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  ghost: `
    text-foreground font-heading font-medium
    hover:bg-white/10
    hover:text-[#fcd95b]
  `,
};

const sizeClasses = {
  sm: "px-5 py-2.5 text-sm rounded-xl",
  md: "px-7 py-3.5 text-base rounded-xl",
  lg: "px-10 py-5 text-lg rounded-2xl",
  xl: "px-12 py-6 text-xl rounded-2xl",
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
      glow = false,
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
          "relative inline-flex items-center justify-center gap-2.5",
          "transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          glow && "animate-pulse-glow",
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