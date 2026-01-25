import { useEffect, useState } from "react";
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
  ArrowRight,
  User,
  PartyPopper,
  Camera,
  Trophy,
  BookOpen,
  Star,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DayCard } from "@/components/features/DayCard";
import { AchievementBadge } from "@/components/features/AchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/layout/Footer";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Ranking from "@/components/Ranking";
import { qrcodeService } from "@/services/qrcode.service";

export default function Jornada() {
  const navigate = useNavigate();
  const { days, achievements, unlockDay, showClosingCard, toggleClosingCard, fetchDays } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchDays();
  }, []);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const completedDaysCount = days.filter((d) => d.status === "completed").length;


  const handleManualUnlock = async (dayNumber: number) => {
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

  const userRole = (user?.role || 'usuario').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isElevated = isAdmin;

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
                    <Zap className="w-5 h-5 fill-accent" /> {Number(user.totalPoints).toFixed(2)} pontos
                  </span>
                </div>

                <div className="max-w-md">
                  <p className="text-sm text-foreground/80 mb-2">
                    Progresso: {completedDaysCount}/7 dias concluídos
                  </p>
                  <ProgressBar
                    current={completedDaysCount}
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <h2 className="font-display font-bold text-2xl text-foreground">
                Sua Jornada
              </h2>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none">
                      ADMIN
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleClosingCard();
                    }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-lg",
                      showClosingCard
                        ? "bg-purple-600 border-purple-600 text-white shadow-purple-600/30 active:scale-95"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {showClosingCard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    CELEBRAÇÃO: {showClosingCard ? "VISÍVEL" : "OCULTO"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {days
                .map((day, index) => (
                  <motion.div
                    key={day.dayNumber}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DayCard
                      day={day}
                      onScanQR={() => { }} // Não mais usado, o modal abre dentro do card
                      onManualUnlock={() => handleManualUnlock(day.dayNumber)}
                      onViewDay={() => handleViewDay(day.dayNumber)}
                    />
                  </motion.div>
                ))}

              {(showClosingCard || isAdmin) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                    "relative overflow-hidden group min-h-[340px]",
                    !showClosingCard && isAdmin && "opacity-60 grayscale"
                  )}
                >
                  <div className={cn(
                    "h-full rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-cartoon relative transition-all duration-300 border-3",
                    showClosingCard || !isAdmin
                      ? "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-purple-600"
                      : "bg-[#111] border-dashed border-white/10"
                  )}>
                    <div className="absolute inset-0 bg-[url('/grid-bg.png')] opacity-10 pointer-events-none" />

                    <div className="relative z-10 w-full flex flex-col h-full">
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                          <PartyPopper className="w-8 h-8 text-purple-500" />
                        </div>

                        <h3 className="font-display font-black text-xl leading-tight uppercase tracking-tighter">
                          Finalizou a <br />
                          <span className="text-purple-500">Jornada?</span>
                        </h3>

                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                          Os próximos passos <br /> estão aqui
                        </p>
                      </div>

                      <div className="pt-6">
                        <Button
                          onClick={() => navigate('/jornada/conclusao')}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] group-hover:shadow-lg group-hover:shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
                        >
                          ACESSAR CELEBRAÇÃO <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {!showClosingCard && isAdmin && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <p className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white/50 border border-white/10 flex items-center gap-1">
                          <EyeOff className="w-2 h-2" /> Oculto (Admin)
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Ranking Section */}
          <section className="mb-12">
            <Ranking />
          </section>

          {/* CONQUISTAS */}
          <section className="mb-12">
            <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-6 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Suas Conquistas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const totalDays = 7;
                const completed = days.filter(d => d.status === 'completed').length;
                const qrScans = days.filter(d => d.points.earned >= 100).length;
                const perfectQuizzes = days.filter(d => d.status === 'completed' && d.points.earned >= 150).length;

                const achievementsList = [
                  {
                    id: 'jornada_completa',
                    name: 'Jornada Completa',
                    description: 'Completou os 7 dias da RVL Week',
                    icon: Trophy,
                    color: 'yellow',
                    progress: completed,
                    total: 7,
                    unlocked: completed === 7
                  },
                  {
                    id: 'conhecedor_palavra',
                    name: 'Conhecedor da Palavra',
                    description: '100% de acerto em todos os 7 quiz',
                    icon: BookOpen,
                    color: 'purple',
                    progress: perfectQuizzes,
                    total: 7,
                    unlocked: perfectQuizzes === 7
                  },
                  {
                    id: 'sempre_presente',
                    name: 'Sempre Presente',
                    description: 'Escaneou QR Code em todos os cultos',
                    icon: Flame,
                    color: 'orange',
                    progress: qrScans,
                    total: 7,
                    unlocked: qrScans === 7
                  },
                  {
                    id: 'comprometido',
                    name: 'Comprometido',
                    description: 'Completou 4 ou mais dias',
                    icon: Star,
                    color: 'green',
                    progress: completed,
                    total: 4,
                    unlocked: completed >= 4
                  }
                ];

                return achievementsList.map(achievement => {
                  const Icon = achievement.icon;
                  const isLocked = !achievement.unlocked;
                  const percentage = Math.min((achievement.progress / achievement.total) * 100, 100);

                  // Classes dinâmicas baseadas na cor
                  const colorMap: Record<string, string> = {
                    yellow: 'text-yellow-500 bg-yellow-500/20 border-yellow-500',
                    purple: 'text-purple-500 bg-purple-500/20 border-purple-500',
                    orange: 'text-orange-500 bg-orange-500/20 border-orange-500',
                    green: 'text-green-500 bg-green-500/20 border-green-500'
                  };

                  const barColorMap: Record<string, string> = {
                    yellow: 'bg-yellow-500',
                    purple: 'bg-purple-500',
                    orange: 'bg-orange-500',
                    green: 'bg-green-500'
                  };

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "relative rounded-3xl p-6 border-2 transition-all duration-300",
                        isLocked
                          ? 'bg-slate-900/50 border-white/5 grayscale opacity-60'
                          : colorMap[achievement.color] || 'bg-primary/20 border-primary'
                      )}
                    >
                      {/* Badge de desbloqueado */}
                      {!isLocked && (
                        <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg z-10">
                          <Trophy className="text-white" size={16} />
                        </div>
                      )}

                      {/* Cadeado se bloqueado */}
                      {isLocked && (
                        <div className="absolute -top-3 -right-3 bg-slate-800 rounded-full p-2 border border-white/10 z-10">
                          <Lock className="text-white/50" size={16} />
                        </div>
                      )}

                      {/* Ícone */}
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                        isLocked ? "bg-slate-800" : "bg-current/10"
                      )}>
                        <Icon
                          className={isLocked ? 'text-slate-600' : ''}
                          size={36}
                        />
                      </div>

                      {/* Nome */}
                      <h3 className={cn(
                        "font-display font-bold text-lg text-center mb-1",
                        isLocked ? 'text-slate-400' : 'text-white'
                      )}>
                        {achievement.name}
                      </h3>

                      {/* Descrição */}
                      <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
                        {achievement.description}
                      </p>

                      {/* Progresso */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Progresso</span>
                          <span className={isLocked ? 'text-slate-600' : ''}>
                            {achievement.progress}/{achievement.total}
                          </span>
                        </div>

                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              isLocked ? 'bg-slate-700' : barColorMap[achievement.color] || 'bg-primary'
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </section>
        </div>
      </main>


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
              Você pode desbloquear o conteúdo mesmo sem ter ido ao culto, mas <span className="text-amber-500 font-bold">não ganhará os +{pendingDay === 1 ? '75' : '100'} pontos</span> de presença. Deseja continuar?
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
