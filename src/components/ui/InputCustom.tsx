import { forwardRef, useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full px-4 py-3 rounded-xl border-2 bg-card",
              "font-body text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "transition-all duration-200",
              Icon && "pl-12",
              isPassword && "pr-12",
              error ? "border-destructive" : "border-border",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
