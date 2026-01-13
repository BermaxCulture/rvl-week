import logoRvlWeek from "@/assets/logo-rvl-week.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-auto",
  md: "h-16 w-auto",
  lg: "h-24 w-auto",
  xl: "h-32 w-auto",
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <img
      src={logoRvlWeek}
      alt="RVL Week"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
}
