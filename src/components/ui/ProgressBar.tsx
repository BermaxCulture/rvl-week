import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: "orange" | "purple" | "green";
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  orange: "bg-secondary",
  purple: "bg-primary",
  green: "bg-success",
};

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function ProgressBar({
  current,
  total,
  showLabel = false,
  color = "orange",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {current}/{total} completos
        </p>
      )}
    </div>
  );
}
