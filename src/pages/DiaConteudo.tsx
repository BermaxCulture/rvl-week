import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  BookOpen,
  Video,
  MessageCircle,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Quiz } from "@/components/features/Quiz";
import { useStore } from "@/store/useStore";

export default function DiaConteudo() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { user, days, markVideoWatched, completeQuiz, markDayComplete } = useStore();

  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isLoadingPastorVideo, setIsLoadingPastorVideo] = useState(false);

  const dayNum = parseInt(dayNumber || "1");
  const day = days.find((d) => d.dayNumber === dayNum);

  if (!day || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Dia não encontrado</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
  };

  const handleWatchVideo = async (type: "main" | "pastor") => {
    const activityKey = type === "main" ? "videoWatched" : "pastorVideoWatched";
    
    if (day.activities[activityKey]) {
      toast.info("Você já assistiu este vídeo");
      return;
    }

    if (type === "main") {
      setIsLoadingVideo(true);
    } else {
      setIsLoadingPastorVideo(true);
    }

    // Simular carregamento do vídeo
    await new Promise((resolve) => setTimeout(resolve, 2000));

    markVideoWatched(dayNum, type);

    if (type === "main") {
      setIsLoadingVideo(false);
      toast.success("✅ Vídeo assistido! +30 pts");
    } else {
      setIsLoadingPastorVideo(false);
      toast.success("✅ Vídeo assistido! +20 pts");
    }
  };

  const handleQuizComplete = (score: number) => {
    completeQuiz(dayNum, score);
  };

  const handleMarkComplete = async () => {
    const allComplete =
      day.activities.qrScanned &&
      day.activities.videoWatched &&
      day.activities.pastorVideoWatched &&
      day.activities.quizCompleted;

    if (!allComplete) {
      toast.error("Complete todas as atividades primeiro!");
      return;
    }

    markDayComplete(dayNum);

    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
    });

    toast.success("🎉 Dia concluído! +50 pts de conclusão");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate("/jornada");
  };

  const handleShare = () => {
    const text = `Completei o Dia ${dayNum} da RVL Week! 🔥 #RVLWeek #LinkChurch`;
    
    if (navigator.share) {
      navigator.share({
        title: "RVL Week",
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência!");
    }
  };

  const totalEarned = day.points.earned;
  const totalPossible = day.points.total;
  const allComplete =
    day.activities.videoWatched &&
    day.activities.pastorVideoWatched &&
    day.activities.quizCompleted;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/jornada"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-hero rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
          >
            {/* Triangle Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <polygon
                  points="0,100 30,30 60,100"
                  fill="rgba(252, 217, 91, 0.5)"
                />
                <polygon
                  points="40,100 70,50 100,100"
                  fill="rgba(252, 217, 91, 0.4)"
                />
              </svg>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-semibold text-foreground/70 mb-2">
                DIA {day.dayNumber} • {formatDate(day.date)}
              </p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-primary mb-4">
                {day.theme}
              </h1>
              <p className="text-foreground font-semibold mb-1">{day.pastor}</p>
              {day.church && (
                <p className="text-sm text-foreground/70">{day.church}</p>
              )}

              <div className="mt-6 bg-card p-6 rounded-2xl border-3 border-foreground/10 shadow-cartoon max-w-lg mx-auto">
                <p className="text-lg italic text-foreground mb-2">"{day.verse}"</p>
                <p className="text-sm font-semibold text-primary">
                  — {day.verseReference}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Points */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Principais ensinamentos
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {day.content.mainPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card
                    variant={index === 0 ? "outlined" : index === 1 ? "highlight" : "default"}
                    className="h-full"
                  >
                    <div className="text-3xl mb-3">
                      {index === 0 ? "💡" : index === 1 ? "📖" : "🙏"}
                    </div>
                    <p className="text-foreground">{point}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Video Main */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-secondary" />
              Assista ao culto completo
            </h2>

            <Card variant="outlined" className="relative overflow-hidden">
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center relative">
                {isLoadingVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Carregando vídeo...</p>
                  </div>
                ) : day.activities.videoWatched ? (
                  <div className="flex flex-col items-center gap-3 text-success">
                    <CheckCircle className="w-16 h-16" />
                    <p className="font-semibold">Assistido ✓</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleWatchVideo("main")}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-cartoon group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-secondary-foreground ml-1" />
                    </div>
                    <p className="font-semibold text-foreground">Clique para assistir</p>
                  </button>
                )}

                {!day.activities.videoWatched && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-bold">
                    +30 pts
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Duração: ~45 min</p>
                {day.activities.videoWatched && (
                  <span className="text-success text-sm font-semibold">+30 pts conquistados</span>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Pastor Video */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Preparação para o próximo dia
            </h2>

            <Card className="relative overflow-hidden">
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center relative">
                {isLoadingPastorVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Carregando vídeo...</p>
                  </div>
                ) : day.activities.pastorVideoWatched ? (
                  <div className="flex flex-col items-center gap-3 text-success">
                    <CheckCircle className="w-16 h-16" />
                    <p className="font-semibold">Assistido ✓</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleWatchVideo("pastor")}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-cartoon group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary-foreground ml-1" />
                    </div>
                    <p className="font-semibold text-foreground">Clique para assistir</p>
                  </button>
                )}

                {!day.activities.pastorVideoWatched && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                    +20 pts
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Duração: ~2 min</p>
                {day.activities.pastorVideoWatched && (
                  <span className="text-success text-sm font-semibold">+20 pts conquistados</span>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Quiz */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4">🧠 Quiz do Versículo</h2>

            {day.activities.quizCompleted ? (
              <Card variant="highlight" className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">Quiz Concluído!</h3>
                <p className="text-muted-foreground">
                  Você acertou {day.activities.quizScore}/3 perguntas
                </p>
                <p className="text-success font-semibold mt-2">
                  +{Math.floor((day.activities.quizScore / 3) * 50)} pts conquistados
                </p>
              </Card>
            ) : (
              <Quiz questions={day.content.quiz} onComplete={handleQuizComplete} />
            )}
          </motion.section>

          {/* Progress Footer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card variant="outlined">
              <h3 className="font-display font-bold text-lg mb-4">Progresso do Dia</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  {day.activities.qrScanned ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={day.activities.qrScanned ? "text-foreground" : "text-muted-foreground"}>
                    QR Code escaneado
                  </span>
                  <span className="ml-auto text-sm font-semibold">
                    {day.activities.qrScanned ? "+100 pts" : "0/100 pts"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {day.activities.videoWatched ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={day.activities.videoWatched ? "text-foreground" : "text-muted-foreground"}>
                    Vídeo principal assistido
                  </span>
                  <span className="ml-auto text-sm font-semibold">
                    {day.activities.videoWatched ? "+30 pts" : "0/30 pts"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {day.activities.pastorVideoWatched ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={day.activities.pastorVideoWatched ? "text-foreground" : "text-muted-foreground"}>
                    Vídeo do pastor assistido
                  </span>
                  <span className="ml-auto text-sm font-semibold">
                    {day.activities.pastorVideoWatched ? "+20 pts" : "0/20 pts"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {day.activities.quizCompleted ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={day.activities.quizCompleted ? "text-foreground" : "text-muted-foreground"}>
                    Quiz completado
                  </span>
                  <span className="ml-auto text-sm font-semibold">
                    {day.activities.quizCompleted
                      ? `+${Math.floor((day.activities.quizScore / 3) * 50)} pts`
                      : "0/50 pts"}
                  </span>
                </div>
              </div>

              <ProgressBar current={totalEarned} total={totalPossible} showLabel color="orange" size="lg" />

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {day.status !== "completed" && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleMarkComplete}
                    disabled={!allComplete}
                    fullWidth
                  >
                    {allComplete ? (
                      <>✓ MARCAR DIA COMO CONCLUÍDO (+50 pts)</>
                    ) : (
                      "Complete todas as atividades"
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  icon={Share2}
                  onClick={handleShare}
                  fullWidth={day.status === "completed"}
                >
                  Compartilhar
                </Button>
              </div>
            </Card>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
