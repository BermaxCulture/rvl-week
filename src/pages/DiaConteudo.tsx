import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  BookOpen,
  Video,
  MessageCircle,
  Lightbulb,
  Brain,
  HandHelping,
  PartyPopper,
  Zap,
  Sparkles,
  Save,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Quiz } from "@/components/features/Quiz";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/layout/Footer";
import { qrcodeService } from "@/services/qrcode.service";
import { cn } from "@/lib/utils";

export default function DiaConteudo() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { days, markVideoWatched, completeQuiz, markDayComplete } = useStore();
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isLoadingPastorVideo, setIsLoadingPastorVideo] = useState(false);
  const [showMainVideo, setShowMainVideo] = useState(false);
  const [showPastorVideo, setShowPastorVideo] = useState(false);

  const getYouTubeId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const dayNum = parseInt(dayNumber || "1");
  const day = days.find((d) => d.dayNumber === dayNum);

  useEffect(() => {
    if (day && day.status === 'locked' && user?.role !== 'admin') {
      toast.error("Dia ainda bloqueado");
      navigate("/jornada");
    }
  }, [day, user, navigate]);

  if (!day || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Dia não encontrado</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00"); // Use noon to avoid timezone issues
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
      setShowMainVideo(true);
    } else {
      setIsLoadingPastorVideo(true);
      setShowPastorVideo(true);
    }

    // Simular carregamento do vídeo
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!isPreview) {
      markVideoWatched(dayNum, type);
    }

    if (type === "main") {
      setIsLoadingVideo(false);
      toast.success(isPreview ? "Vídeo assistido (Modo Preview)" : "Vídeo assistido! +30 pts", {
        icon: <Zap className="w-5 h-5 text-secondary fill-secondary" />
      });
    } else {
      setIsLoadingPastorVideo(false);
      toast.success(isPreview ? "Vídeo assistido (Modo Preview)" : "Vídeo assistido! +20 pts", {
        icon: <Zap className="w-5 h-5 text-primary fill-primary" />
      });
    }
  };

  const handleQuizComplete = (score: number) => {
    if (!isPreview) {
      completeQuiz(dayNum, score);
    } else {
      toast.info(`Quiz concluído (Modo Preview). Pontuação: ${score}/3`);
    }
  };

  const handleMarkComplete = async () => {
    if (day.status === "completed" || isPreview) {
      if (isPreview) {
        toast.info("Ação desabilitada no Modo Preview");
      }
      return;
    }
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

    toast.success("Dia concluído! +50 pts de conclusão", {
      icon: <PartyPopper className="w-5 h-5 text-success" />,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate("/jornada");
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

      {isPreview && (
        <div className="fixed top-24 left-0 right-0 z-40 px-4">
          <div className="container mx-auto">
            <div className="bg-primary text-primary-foreground px-6 py-2 rounded-full shadow-lg flex items-center justify-center gap-2 font-bold text-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
              MODO PREVIEW: NENHUM PROGRESSO SERÁ SALVO
            </div>
          </div>
        </div>
      )}

      <main className={cn("pt-24 pb-12", isPreview && "pt-32")}>
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-8 mb-12"
          >
            <div className="flex items-center justify-between">
              <Link
                to="/jornada"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </Link>

              {(user?.role === 'admin' || user?.role === 'pastor') && (
                <Link
                  to={`/jornada/dia/${dayNumber}/editar`}
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full hover:bg-primary/20 transition-all font-bold text-sm shadow-sm border border-primary/20"
                >
                  <Save className="w-4 h-4" />
                  EDITAR DIA
                </Link>
              )}
            </div>
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
                  fill="rgba(190, 243, 7, 0.4)"
                />
                <polygon
                  points="40,100 70,50 100,100"
                  fill="rgba(91, 0, 163, 0.3)"
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

          {/* Admin QR Code Info */}
          {(user.role === "admin" || user.role === "pastor") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-lg text-amber-500">
                        Painel do Administrador
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                        Gerenciamento de QR Code
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 max-w-xl items-center gap-2 bg-black/20 rounded-xl p-2 border border-white/5 overflow-hidden">
                    <code className="flex-1 text-[10px] md:text-xs font-mono text-amber-200/70 truncate px-2">
                      {(() => {
                        return `${qrcodeService.baseUrl}/unlock?day=${day.dayNumber}&token=RVL2026D${day.dayNumber}`;
                      })()}
                    </code>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-black border-none whitespace-nowrap"
                      onClick={() => {
                        const qrUrl = `${qrcodeService.baseUrl}/unlock?day=${day.dayNumber}&token=RVL2026D${day.dayNumber}`;
                        navigator.clipboard.writeText(qrUrl);
                        toast.success("URL copiada com sucesso!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copiar URL
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-500/10 flex items-center gap-2 text-xs text-amber-500/60 italic">
                  <ExternalLink className="w-3 h-3" />
                  Dica: URL dinâmica para o ambiente de {import.meta.env.PROD ? "Produção" : "Desenvolvimento"}.
                </div>
              </div>
            </motion.div>
          )}

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
                    <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-primary/10">
                      {index === 0 ? (
                        <Lightbulb className="w-6 h-6 text-primary" />
                      ) : index === 1 ? (
                        <BookOpen className="w-6 h-6 text-primary" />
                      ) : (
                        <HandHelping className="w-6 h-6 text-primary" />
                      )}
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

            <Card variant="outlined" className="relative overflow-hidden p-0">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {isLoadingVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Preparando player...</p>
                  </div>
                ) : (day.activities.videoWatched || showMainVideo) ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(day.content.videoUrl)}${showMainVideo ? '?autoplay=1' : ''}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
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
                  <div className="absolute top-4 right-4 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-bold z-10 shadow-lg">
                    +30 pts
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between bg-card/50 border-t border-border/5">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Duração: ~45 min
                </p>
                {day.activities.videoWatched && (
                  <span className="text-success text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> +30 pts conquistados
                  </span>
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

            <Card className="relative overflow-hidden p-0">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {isLoadingPastorVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Preparando player...</p>
                  </div>
                ) : (day.activities.pastorVideoWatched || showPastorVideo) ? (
                  // Check if it's a direct video link (Supabase Storage) or YouTube
                  day.content.pastorVideoUrl.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/.*\.supabase\..*\/storage\/v1\/object\/public\//) ? (
                    <video
                      className="w-full h-full object-contain bg-black"
                      src={day.content.pastorVideoUrl}
                      controls
                      autoPlay={showPastorVideo}
                      playsInline
                    />
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeId(day.content.pastorVideoUrl)}${showPastorVideo ? '?autoplay=1' : ''}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  )
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
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold z-10 shadow-lg">
                    +20 pts
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between bg-card/50 border-t border-border/5">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Duração: ~2 min
                </p>
                {day.activities.pastorVideoWatched && (
                  <span className="text-success text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> +20 pts conquistados
                  </span>
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
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" /> Quiz do Versículo
            </h2>

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

              <ProgressBar current={totalEarned} total={totalPossible} showLabel color="purple" size="lg" />

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

              </div>
            </Card>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
