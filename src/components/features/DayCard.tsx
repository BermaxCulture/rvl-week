import { motion } from "framer-motion";
import { Lock, Star, CheckCircle, QrCode, Unlock } from "lucide-react";
import { Day } from "@/types";
import { Button } from "@/components/ui/ButtonCustom";
import { cn } from "@/lib/utils";

interface DayCardProps {
  day: Day;
  onScanQR: () => void;
  onManualUnlock: () => void;
  onViewDay: () => void;
}

export function DayCard({ day, onScanQR, onManualUnlock, onViewDay }: DayCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const renderContent = () => {
    switch (day.status) {
      case "locked":
        return (
          <>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl text-muted-foreground">
              DIA {day.dayNumber}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date)}</p>
            <div className="mt-4 px-3 py-2 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Disponível em breve
              </p>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">{day.pastor}</p>
          </>
        );

      case "available":
        return (
          <>
            <div className="absolute -top-2 -right-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold shadow-cartoon-sm animate-pulse-glow">
              +{day.points.total} pts
            </div>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-accent animate-float">
              <Star className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground">
              DIA {day.dayNumber}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date)}</p>
            <div className="mt-4 px-3 py-2 bg-secondary/10 rounded-lg">
              <p className="text-sm text-secondary font-semibold flex items-center justify-center gap-2">
                🎯 Pronto para começar
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{day.pastor}</p>
            {day.church && (
              <p className="text-xs text-muted-foreground">{day.church}</p>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={onScanQR}
                fullWidth
              >
                Escanear QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Unlock}
                onClick={onManualUnlock}
                fullWidth
              >
                Desbloquear
              </Button>
            </div>
          </>
        );

      case "completed":
        return (
          <>
            <div className="absolute -top-2 -right-2 px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-bold shadow-cartoon-sm">
              ✓ 100%
            </div>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-success/20">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground">
              DIA {day.dayNumber}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date)}</p>
            <div className="mt-4 px-3 py-2 bg-success/10 rounded-lg">
              <p className="text-sm text-success font-semibold flex items-center justify-center gap-2">
                ⭐ Concluído!
              </p>
              <p className="text-xs text-success mt-1">
                {day.points.earned}/{day.points.total} pts
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{day.pastor}</p>
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewDay}
                fullWidth
              >
                Ver novamente
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={day.status !== "locked" ? { y: -4 } : undefined}
      className={cn(
        "relative p-6 rounded-2xl text-center transition-all duration-200",
        day.status === "locked" && "bg-muted/50 opacity-60 cursor-not-allowed",
        day.status === "available" && "bg-card border-3 border-secondary shadow-cartoon hover:shadow-cartoon-hover",
        day.status === "completed" && "bg-card border-3 border-success shadow-cartoon"
      )}
    >
      {renderContent()}
    </motion.div>
  );
}
