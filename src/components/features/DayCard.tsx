import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star, CheckCircle, QrCode, Unlock, Sparkles, CheckCircle2, Eye, Edit2, AlertCircle } from "lucide-react";
import { Day } from "@/types";
import { Button } from "@/components/ui/ButtonCustom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import { Link } from "react-router-dom";
import QRInstructionsModal from "../QRInstructionsModal";

interface DayCardProps {
  day: Day;
  onScanQR: () => void;
  onManualUnlock: () => void;
  onViewDay: () => void;
}

export function DayCard({ day, onScanQR, onManualUnlock, onViewDay }: DayCardProps) {
  const { user } = useAuth();
  const { days } = useStore();
  const [showInstructions, setShowInstructions] = useState(false);

  const userRole = (user?.role || 'usuario').toLowerCase();
  const isElevated = userRole !== 'usuario' && userRole !== 'usuário';
  const isAdmin = userRole === 'admin';

  const GAMIFIED_DAYS = [1, 2, 3, 4, 5, 6];
  const isGamifiedDay = (dayNumber: number) => GAMIFIED_DAYS.includes(dayNumber);

  const getLockReason = (method: 'qrcode' | 'manual') => {
    if (isElevated) return null;

    // 1. Trava de Sequência (Para ambos os métodos, exceto Dia 1)
    if (day.dayNumber > 1) {
      const previousDay = days.find(d => d.dayNumber === day.dayNumber - 1);
      if (!previousDay || previousDay.status === 'locked') {
        return "sequence";
      }
    }

    // 2. Trava de Horário (Apenas para MANUAL)
    if (method === 'manual') {
      const now = new Date();
      const unlockTime = day.dayNumber === 7 ? '10:00:00' : '19:30:00';
      const unlockDate = new Date(`${day.date}T${unlockTime}-03:00`);
      if (now < unlockDate) {
        return "time";
      }
    }

    return null;
  };

  const sequenceBlocked = getLockReason('qrcode') === "sequence";
  const manualTimeBlocked = getLockReason('manual') === "time";

  const isQrBlocked = sequenceBlocked;
  const isManualBlocked = sequenceBlocked || manualTimeBlocked;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const renderContent = () => {
    switch (day.status) {
      case "locked":
        return (
          <>
            <div className="absolute -top-2 -right-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold shadow-sm">
              +{day.points.total} pts
            </div>

            {(sequenceBlocked || manualTimeBlocked) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-1 items-center justify-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    Acesso Restrito
                  </p>
                </div>
                {sequenceBlocked && (
                  <p className="text-[9px] text-red-500/80 font-bold uppercase">
                    Desbloqueie o Dia {day.dayNumber - 1} primeiro
                  </p>
                )}
                {!sequenceBlocked && manualTimeBlocked && (
                  <p className="text-[9px] text-red-500/80 font-bold uppercase">
                    Manual liberado em {formatDate(day.date)} às {day.dayNumber === 7 ? '10:00' : '19:30'}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground/80">
              DIA {day.dayNumber}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date)}</p>

            <div className={cn("mt-5 flex flex-col gap-2")}>
              <button
                disabled={isQrBlocked}
                onClick={() => setShowInstructions(true)}
                className={cn(
                  "w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-600/10 disabled:pointer-events-none",
                  isQrBlocked && "opacity-40"
                )}
              >
                <QrCode size={20} />
                {isElevated ? "DESBLOQUEAR (TESTE)" : "DESBLOQUEAR VIA QR CODE"}
              </button>

              <Button
                variant="outline"
                size="sm"
                icon={Unlock}
                onClick={onManualUnlock}
                fullWidth
                disabled={isManualBlocked}
                className={cn(isManualBlocked && "opacity-40")}
              >
                Desbloquear Manual
              </Button>
            </div>
          </>
        );

      case "available":
        return (
          <>
            <div className="absolute -top-2 -right-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold shadow-cartoon-sm">
              +{day.points.total} pts
            </div>

            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-accent">
              <Star className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground">
              DIA {day.dayNumber}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(day.date)}</p>
            <div className="mt-4 px-3 py-2 bg-accent/15 rounded-lg border border-accent/20">
              <p className="text-sm text-accent font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 fill-accent/30" /> Pronto para começar
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{day.pastor}</p>
            {day.church && (
              <p className="text-xs text-muted-foreground">{day.church}</p>
            )}
            <div className="mt-5">
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={onViewDay}
                fullWidth
              >
                Acessar Conteúdo
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
                <CheckCircle2 className="w-4 h-4" /> Concluído!
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
        day.status === "locked" && "bg-card border-2 border-border/50 shadow-sm",
        day.status === "available" && "bg-card border-3 border-secondary shadow-cartoon hover:shadow-cartoon-hover",
        day.status === "completed" && "bg-card border-3 border-success shadow-cartoon"
      )}
    >
      {isElevated && (
        <div className="absolute top-2 left-2 flex gap-1 z-20">
          <Link
            to={`/jornada/dia/${day.dayNumber}?preview=true`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm"
            title="Visualizar (Admin Preview)"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <Link
              to={`/jornada/dia/${day.dayNumber}/editar`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-lg transition-all shadow-sm"
              title="Editar (Admin)"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      {renderContent()}

      <QRInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        dayNumber={day.dayNumber}
      />
    </motion.div>
  );
}
