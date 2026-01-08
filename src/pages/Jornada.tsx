import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Header } from "@/components/layout/Header";
import { DayCard } from "@/components/features/DayCard";
import { AchievementBadge } from "@/components/features/AchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";

export default function Jornada() {
  const navigate = useNavigate();
  const { user, days, achievements, unlockDay } = useStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const completedDays = days.filter((d) => d.status === "completed").length;

  const handleScanQR = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setQrCode("");
    setShowQRModal(true);
  };

  const handleValidateQR = async () => {
    if (qrCode.length < 5) {
      toast.error("Código inválido");
      return;
    }

    setIsValidating(true);
    
    // Simular validação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (selectedDay) {
      unlockDay(selectedDay, "qrcode");
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success(`✅ Dia ${selectedDay} desbloqueado! +100 pts`);
      setShowQRModal(false);
      navigate(`/jornada/dia/${selectedDay}`);
    }

    setIsValidating(false);
  };

  const handleManualUnlock = async (dayNumber: number) => {
    const confirmed = window.confirm(
      "Você pode desbloquear o conteúdo mesmo sem ter ido ao culto, mas não ganhará os +100 pontos de presença. Deseja continuar?"
    );

    if (confirmed) {
      unlockDay(dayNumber, "manual");
      toast.success(`Dia ${dayNumber} desbloqueado`);
      navigate(`/jornada/dia/${dayNumber}`);
    }
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
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                  Bem-vindo, {user.name}! 👋
                </h1>

                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full font-display font-bold text-lg text-secondary shadow-cartoon-sm">
                    🔥 {user.totalPoints} pontos
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
              🏆 Suas Conquistas
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-3xl p-8 w-full max-w-md shadow-cartoon-lg"
          >
            <h3 className="font-display font-bold text-xl text-center mb-2">
              Escanear QR Code
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Cole o código que aparece no telão
            </p>

            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value.toUpperCase())}
              placeholder="Ex: RVL2025D1ABC"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-center font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQRModal(false)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleValidateQR}
                isLoading={isValidating}
                fullWidth
              >
                Validar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
