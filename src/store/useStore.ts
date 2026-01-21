import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Day, Achievement } from "@/types";
import { mockDays, mockAchievements } from "@/mocks/days.mock";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { qrcodeService } from "@/services/qrcode.service";

interface StoreState {
  // Days
  days: Day[];

  // Achievements
  achievements: Achievement[];
  pendingUnlockDay: number | null;

  // Actions
  fetchDays: () => Promise<void>;
  setPendingUnlock: (dayNumber: number) => void;
  unlockDay: (dayNumber: number, method: "qrcode" | "manual", code?: string) => Promise<{ success: boolean; message: string }>;
  updateDay: (dayNumber: number, data: Partial<Day>) => Promise<boolean>;
  markVideoWatched: (dayNumber: number, type: "main" | "pastor") => void;
  completeQuiz: (dayNumber: number, score: number) => void;
  markDayComplete: (dayNumber: number) => void;
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      days: mockDays,
      achievements: mockAchievements,
      pendingUnlockDay: null,

      fetchDays: async () => {
        const { user } = useAuth.getState();

        const { data: jornadas, error } = await supabase
          .from('jornadas')
          .select(`
            *,
            perguntas_quiz (*)
          `)
          .order('dia_number', { ascending: true });

        if (error || !jornadas) return;

        console.log(`🗓️ Dias buscados: ${jornadas.length}`);

        let progressMap: Record<string, any> = {};
        let totalEarned = 0;

        if (user) {
          const { data: progress, error: progressError } = await supabase
            .from('progresso_usuario')
            .select('*')
            .eq('user_id', user.id);

          if (progressError) {
            console.error('❌ Erro ao buscar progresso:', progressError);
          }

          if (progress) {
            console.log(`📊 Progresso encontrado para ${user.id}:`, progress.length, 'itens');
            progress.forEach(p => {
              progressMap[p.jornada_id] = p;
              totalEarned += p.pontos_acumulados || 0;
            });
          }
        }

        const mappedDays: Day[] = jornadas.map(j => {
          const p = progressMap[j.id] || {};
          return {
            id: j.id,
            dayNumber: j.dia_number,
            date: j.data_real || '',
            pastor: j.preletor,
            church: j.igreja_preletor,
            theme: j.titulo,
            verse: j.versiculo_texto,
            verseReference: j.versiculo_referencia,
            status: p.quiz_concluido ? 'completed' : (p.jornada_id ? 'available' : 'locked'),
            points: {
              qrcode: 100,
              videoMain: 0,
              videoPastor: 50,
              quiz: j.quiz_max_points || 100,
              completion: 0,
              total: 100 + 50 + (j.quiz_max_points || 100), // QR + Video + Quiz
              earned: p.pontos_acumulados || 0
            },
            activities: {
              qrScanned: p.qr_code_escaneado || false,
              videoWatched: p.video_principal_assistido || false,
              pastorVideoWatched: p.video_preparacao_assistido || false,
              quizCompleted: p.quiz_concluido || false,
              quizScore: p.quiz_score || 0
            },
            content: {
              mainPoints: j.ensinamentos || [],
              videoUrl: j.video_url_principal || '',
              videoThumbnail: '',
              pastorVideoUrl: j.video_url_proximo_dia || '',
              pastorVideoThumbnail: '',
              quiz: j.perguntas_quiz.map((q: any) => ({
                question: q.pergunta,
                options: q.alternativas,
                correct: q.resposta_correta,
                explanation: q.explicacao
              })),
              quizTimeLimit: j.quiz_time_limit || 60,
              quizPenaltyTime: j.quiz_penalty_time || 30,
              quizMaxPoints: j.quiz_max_points || 100
            },
            qrCodeUrl: j.qr_code_url ? (() => {
              try {
                const url = new URL(j.qr_code_url);
                return `${qrcodeService.baseUrl}/unlock${url.search}`;
              } catch {
                return null;
              }
            })() : null
          };
        });

        if (user) {
          // Update user points in useAuth
          useAuth.setState({ user: { ...user, totalPoints: totalEarned } });
        }

        set({ days: mappedDays });
      },

      setPendingUnlock: (dayNumber: number) => {
        set({ pendingUnlockDay: dayNumber });
      },

      unlockDay: async (dayNumber: number, method: "qrcode" | "manual", code?: string) => {
        const { user } = useAuth.getState();
        if (!user) return { success: false, message: "Usuário não autenticado" };

        const dayToUnlock = get().days.find(d => d.dayNumber === dayNumber);
        if (!dayToUnlock) return { success: false, message: "Dia não encontrado" };

        const { data: journey, error: journeyError } = await supabase
          .from('jornadas')
          .select('id, qr_code_secret')
          .eq('dia_number', dayNumber)
          .single();

        if (journeyError || !journey) return { success: false, message: "Erro ao buscar dados do dia" };

        if (method === "qrcode") {
          if (!code || code.trim().toUpperCase() !== journey.qr_code_secret?.toUpperCase()) {
            return { success: false, message: "Código QR inválido para este dia" };
          }
        } else {
          // Validação de horário para Desbloqueio MANUAL
          const userRole = (user?.role || 'usuario').toLowerCase();
          const isElevated = userRole !== 'usuario' && userRole !== 'usuário';

          if (!isElevated) {
            const now = new Date();
            const unlockTime = dayNumber === 7 ? '10:00:00' : '19:30:00';
            const unlockDate = new Date(`${dayToUnlock.date}T${unlockTime}-03:00`);

            if (now < unlockDate) {
              return {
                success: false,
                message: `O desbloqueio manual só é permitido após as ${dayNumber === 7 ? '10h' : '19:30'} do dia do evento.`
              };
            }
          }
        }

        const points = method === "qrcode" ? 100 : 0;

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            qr_code_escaneado: method === "qrcode",
            metodo_desbloqueio: method === "qrcode" ? "QR Code" : "Manual",
            pontos_acumulados: points
          }, { onConflict: 'user_id,jornada_id' });

        if (!error) {
          await get().fetchDays();
          get().checkAchievements();
          return { success: true, message: method === "qrcode" ? "Dia desbloqueado com sucesso! +100 pts" : "Dia desbloqueado" };
        } else {
          return { success: false, message: "Erro ao atualizar progresso no banco" };
        }
      },

      updateDay: async (dayNumber: number, updateData: Partial<Day>) => {
        const { user } = useAuth.getState();
        if (user?.role !== 'admin') return false;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return false;

        const { error } = await supabase
          .from('jornadas')
          .update({
            titulo: updateData.theme,
            preletor: updateData.pastor,
            igreja_preletor: updateData.church,
            versiculo_texto: updateData.verse,
            versiculo_referencia: updateData.verseReference,
            ensinamentos: updateData.content?.mainPoints,
            video_url_principal: updateData.content?.videoUrl,
            video_url_proximo_dia: updateData.content?.pastorVideoUrl,
            data_real: updateData.date,
            dia_label: `DIA ${dayNumber} • ${new Date(updateData.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`,
            quiz_time_limit: updateData.content?.quizTimeLimit,
            quiz_penalty_time: updateData.content?.quizPenaltyTime,
            quiz_max_points: updateData.content?.quizMaxPoints
          })
          .eq('id', journey.id);

        if (error) return false;

        // Atualizar Quiz
        if (updateData.content?.quiz) {
          // 1. Deletar perguntas atuais
          await supabase
            .from('perguntas_quiz')
            .delete()
            .eq('jornada_id', journey.id);

          // 2. Inserir novas perguntas
          const quizData = updateData.content.quiz.map(q => ({
            jornada_id: journey.id,
            pergunta: q.question,
            alternativas: q.options,
            resposta_correta: q.correct,
            explicacao: q.explanation
          }));

          if (quizData.length > 0) {
            await supabase
              .from('perguntas_quiz')
              .insert(quizData);
          }
        }

        await get().fetchDays();
        return true;
      },

      markVideoWatched: async (dayNumber: number, type: "main" | "pastor") => {
        const { days } = get();
        const { user } = useAuth.getState();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        const currentPoints = day.points.earned || 0;
        const newTotalPoints =
          (type === "main" ? 0 : 50) + // Points for current action
          (day.activities.qrScanned ? 100 : 0) +
          (type === "main" ? currentPoints : (day.activities.pastorVideoWatched ? 0 : 0)) // This logic is getting complex, let's simplify

        const points = {
          qr: day.activities.qrScanned ? 100 : 0,
          main: 0,
          pastor: (type === "pastor" || day.activities.pastorVideoWatched) ? 50 : 0,
          quiz: day.activities.quizCompleted ? day.activities.quizScore : 0,
          completion: 0
        };

        const totalPoints = points.qr + points.main + points.pastor + points.quiz + points.completion;

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            [type === "main" ? "video_principal_assistido" : "video_preparacao_assistido"]: true,
            pontos_acumulados: totalPoints
          }, { onConflict: 'user_id,jornada_id' });

        if (!error) {
          await get().fetchDays();
        }
      },

      completeQuiz: async (dayNumber: number, score: number) => {
        const { days } = get();
        const { user } = useAuth.getState();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        // score here is already the dynamic points calculated by QuizTimed (0-100)
        const qrPoints = day.activities.qrScanned ? 100 : 0;
        const pastorPoints = day.activities.pastorVideoWatched ? 50 : 0;
        const totalPoints = qrPoints + pastorPoints + score;

        console.log(`📝 Enviando para Supabase: Dia ${dayNumber}, QuizPts: ${score}, QR: ${qrPoints}, Pastor: ${pastorPoints}, Total: ${totalPoints}`);

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            quiz_concluido: true,
            quiz_score: score,
            pontos_acumulados: totalPoints
          }, { onConflict: 'user_id,jornada_id' });

        if (error) {
          console.error('❌ Erro no upsert do progresso:', error);
          toast.error("Erro ao salvar progresso no servidor.");
          return;
        }

        console.log('✅ Progresso salvo com sucesso! Atualizando estado local...');
        await get().fetchDays();
        get().checkAchievements();
        toast.success("Progresso salvo com sucesso!");
      },

      markDayComplete: async (dayNumber: number) => {
        const { days } = get();
        const { user } = useAuth.getState();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        const totalPoints =
          (day.activities.qrScanned ? 100 : 0) +
          (day.activities.pastorVideoWatched ? 50 : 0) +
          day.activities.quizScore;

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            pontos_acumulados: totalPoints
          }, { onConflict: 'user_id,jornada_id' });

        if (error) {
          console.error('❌ Erro ao marcar dia como completo:', error);
          return;
        }

        await get().fetchDays();
        get().checkAchievements();
      },

      checkAchievements: () => {
        const { days, achievements } = get();

        const completedDaysCount = days.filter((d) => d.status === "completed").length;
        const perfectQuizCount = days.filter(
          (d) => d.activities.quizCompleted && d.activities.quizScore === 3
        ).length;
        const qrScannedCount = days.filter((d) => d.activities.qrScanned).length;

        const updatedAchievements = achievements.map((achievement) => {
          let unlocked = achievement.unlocked;
          let progress = achievement.progress;

          switch (achievement.id) {
            case "jornada_completa":
              progress = completedDaysCount;
              unlocked = completedDaysCount >= 7;
              break;
            case "conhecedor_palavra":
              progress = perfectQuizCount;
              unlocked = perfectQuizCount >= 7;
              break;
            case "sempre_presente":
              progress = qrScannedCount;
              unlocked = qrScannedCount >= 7;
              break;
            case "comprometido":
              progress = completedDaysCount;
              unlocked = completedDaysCount >= 4;
              break;
          }

          return { ...achievement, progress, unlocked, unlockedAt: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedAt };
        });

        // Sync with Supabase if user is logged in
        const { user } = useAuth.getState();
        if (user) {
          const unlockedIds = updatedAchievements
            .filter(a => a.unlocked)
            .map(a => a.id);

          if (unlockedIds.length > 0) {
            supabase.from('profiles')
              .update({ achievements: unlockedIds })
              .eq('id', user.id)
              .then(({ error }) => {
                if (!error) {
                  useAuth.setState({ user: { ...user, achievements: unlockedIds } });
                }
              });
          }
        }

        set({ achievements: updatedAchievements });
      },

      unlockAchievement: (achievementId: string) => {
        const { achievements } = get();
        const { user } = useAuth.getState();

        const updatedAchievements = achievements.map((a) =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a
        );

        if (user) {
          useAuth.setState({ user: { ...user, achievements: [...user.achievements, achievementId] } });
        }

        set({ achievements: updatedAchievements });
      },
    }),
    {
      name: "rvl-week-storage",
      partialize: (state) => ({
        days: state.days,
        achievements: state.achievements,
        pendingUnlockDay: state.pendingUnlockDay,
      }),
    }
  )
);
