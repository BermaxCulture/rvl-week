import { motion } from "framer-motion";
import { Trophy, BookOpen, Flame, Star, Lock } from "lucide-react";
import { Achievement } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
}

const iconMap: Record<string, typeof Trophy> = {
  Trophy,
  BookOpen,
  Flame,
  Star,
};

export function AchievementBadge({ achievement, size = "md" }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const isUnlocked = achievement.unlocked;

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative rounded-2xl text-center transition-all duration-200 h-full flex flex-col",
        sizeClasses[size],
        isUnlocked
          ? "bg-gradient-to-br from-secondary/20 to-accent/20 border-2 border-secondary shadow-cartoon"
          : "bg-muted/50 border-2 border-border grayscale"
      )}
    >
      {!isUnlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full flex-shrink-0",
          isUnlocked
            ? "bg-gradient-to-br from-secondary to-accent"
            : "bg-muted"
        )}
      >
        <Icon
          className={cn(
            iconSizes[size],
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[2.5rem] mb-2">
        <h4
          className={cn(
            "font-display font-bold text-sm leading-tight",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {achievement.name}
        </h4>
      </div>

      <div className="mt-auto w-full">
        <ProgressBar
          current={achievement.progress}
          total={achievement.total}
          color={isUnlocked ? "purple" : "purple"}
          size="sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {achievement.progress}/{achievement.total}
        </p>
      </div>
    </motion.div>
  );
}
