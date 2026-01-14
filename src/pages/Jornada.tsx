import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Flame,
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  User,
  PartyPopper,
  Camera,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DayCard } from "@/components/features/DayCard";
import { AchievementBadge } from "@/components/features/AchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/ButtonCustom";
import { Quiz } from "@/components/features/Quiz";
import { useStore } from "@/store/useStore";
import { Footer } from "@/components/layout/Footer";
import { QRScanner } from "@/components/features/QRScanner";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Jornada() {
  const navigate = useNavigate();
  const { user, days, achievements, unlockDay } = useStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const completedDays = days.filter((d) => d.status === "completed").length;

  const handleScanQR = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setQrCode("");
    setShowQRModal(true);
  };

  const handleValidateQR = async (codeToValidate?: string) => {
    const code = codeToValidate || qrCode;
    if (code.length < 5) {
      toast.error("Código inválido");
      return;
    }

    setIsValidating(true);

    if (selectedDay) {
      const result = await unlockDay(selectedDay, "qrcode", code);

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(result.message);
        setShowQRModal(false);
        setShowScanner(false);
        navigate(`/jornada/dia/${selectedDay}`);
      } else {
        toast.error(result.message);
      }
    }

    setIsValidating(false);
  };

  const handleManualUnlock = (dayNumber: number) => {
    setPendingDay(dayNumber);
    setShowConfirmModal(true);
  };

  const confirmManualUnlock = async () => {
    if (pendingDay) {
      const result = await unlockDay(pendingDay, "manual");
      if (result.success) {
        toast.success(result.message);
        navigate(`/jornada/dia/${pendingDay}`);
      } else {
        toast.error(result.message);
      }
    }
    setShowConfirmModal(false);
  };

  const handleViewDay = (dayNumber: number) => {
    navigate(`/jornada/dia/${dayNumber}`);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="gradient-hero rounded-3xl p-6 md:p-8 shadow-cartoon relative overflow-hidden">
              {/* Triangle Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polygon
                    points="70,100 85,50 100,100"
                    fill="rgba(252, 217, 91, 0.5)"
                  />
                  <polygon
                    points="0,100 15,70 30,100"
                    fill="rgba(252, 217, 91, 0.4)"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4 flex items-center gap-2">
                  Bem-vindo, {user.name}! <User className="w-6 h-6 text-secondary" />
                </h1>

                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full font-display font-bold text-xl text-accent">
                    <Zap className="w-5 h-5 fill-accent" /> {user.totalPoints} pontos
                  </span>
                </div>

                <div className="max-w-md">
                  <p className="text-sm text-foreground/80 mb-2">
                    Progresso: {completedDays}/7 dias concluídos
                  </p>
                  <ProgressBar
                    current={completedDays}
                    total={7}
                    color="purple"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Days Grid */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">
              Sua Jornada
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {days.map((day, index) => (
                <motion.div
                  key={day.dayNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DayCard
                    day={day}
                    onScanQR={() => handleScanQR(day.dayNumber)}
                    onManualUnlock={() => handleManualUnlock(day.dayNumber)}
                    onViewDay={() => handleViewDay(day.dayNumber)}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Achievements Section */}
          <section>
            <h2 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
              <Award className="w-7 h-7 text-secondary" /> Suas Conquistas
            </h2>

            {/* Mobile-First Instruction Panel */}
            <AnimatePresence mode="wait">
              {selectedAchievement && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-secondary/20 p-2 rounded-xl">
                      <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {achievements.find(a => a.id === selectedAchievement)?.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {achievements.find(a => a.id === selectedAchievement)?.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAchievement(achievement.id === selectedAchievement ? null : achievement.id)}
                  className={cn(
                    "cursor-pointer transition-all rounded-2xl h-full",
                    selectedAchievement === achievement.id && "ring-4 ring-secondary/30"
                  )}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>
            {!selectedAchievement && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Toque em uma conquista para ver como ganhá-la ✨
              </p>
            )}
          </section>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => setShowScanner(true)}
                icon={Camera}
                fullWidth
              >
                Abrir Câmera
              </Button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou digite o código</span>
                </div>
              </div>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                placeholder="Ex: RVL2025D1ABC"
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-center font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQRModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleValidateQR()}
                isLoading={isValidating}
                className="flex-1"
              >
                Validar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Scanner Component */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={(text) => handleValidateQR(text)}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      {/* Manual Unlock Confirmation Modal */}
      {showConfirmModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h3 className="font-display font-bold text-xl text-center mb-4">
              Desbloquear Manualmente?
            </h3>

            <p className="text-muted-foreground text-center mb-8 leading-relaxed">
              Você pode desbloquear o conteúdo mesmo sem ter ido ao culto, mas <span className="text-amber-500 font-bold">não ganhará os +100 pontos</span> de presença. Deseja continuar?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 order-2 sm:order-1"
              >
                Voltar
              </Button>
              <Button
                variant="primary"
                onClick={confirmManualUnlock}
                className="flex-1 order-1 sm:order-2 bg-amber-600 hover:bg-amber-700 border-none shadow-lg shadow-amber-900/20"
              >
                Sim, Desbloquear
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}
