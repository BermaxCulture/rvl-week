import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Day, Achievement, RegisterData } from "@/types";
import { mockDays, mockAchievements } from "@/mocks/days.mock";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Days
  days: Day[];

  // Achievements
  achievements: Achievement[];
  pendingUnlockDay: number | null;

  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  fetchDays: () => Promise<void>;

  // Day Actions
  setPendingUnlock: (dayNumber: number) => void;
  unlockDay: (dayNumber: number, method: "qrcode" | "manual", code?: string) => Promise<{ success: boolean; message: string }>;
  updateDay: (dayNumber: number, data: Partial<Day>) => Promise<boolean>;
  markVideoWatched: (dayNumber: number, type: "main" | "pastor") => void;
  completeQuiz: (dayNumber: number, score: number) => void;
  markDayComplete: (dayNumber: number) => void;

  // Points Actions
  addPoints: (points: number) => void;

  // Achievement Actions
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      days: mockDays,
      achievements: mockAchievements,
      pendingUnlockDay: null as number | null,

      // Auth Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          set({ isLoading: false });
          return false;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, phone_number, image_url')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          name: profile?.full_name || data.user.user_metadata.name || data.user.email?.split("@")[0],
          email: data.user.email || "",
          phone: profile?.phone_number || data.user.user_metadata.phone || "",
          imageUrl: profile?.image_url,
          totalPoints: 0,
          completedDays: [],
          achievements: [],
          role: (profile?.role as any) || 'usuario',
          createdAt: data.user.created_at,
        };

        set({ user, isAuthenticated: true, isLoading: false });
        await get().fetchDays();

        // Execute pending unlock if any
        const { pendingUnlockDay } = get();
        if (pendingUnlockDay) {
          await get().unlockDay(pendingUnlockDay, "qrcode");
          set({ pendingUnlockDay: null } as any);
        }

        return true;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              phone: data.phone,
            }
          }
        });

        set({ isLoading: false });
        if (error) {
          toast.error(error.message);
          return false;
        }

        return true;
      },

      verifyEmail: async (email: string, token: string) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        });

        if (error || !data.user) {
          set({ isLoading: false });
          toast.error(error?.message || "Código inválido ou expirado");
          return false;
        }

        // Profile is handled by trigger, but we need to fetch it to update store
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number, role, image_url')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          name: profile?.full_name || data.user.user_metadata.name,
          email: data.user.email!,
          phone: profile?.phone_number || data.user.user_metadata.phone,
          imageUrl: profile?.image_url,
          totalPoints: 0,
          completedDays: [],
          achievements: [],
          role: profile?.role || 'usuario',
          createdAt: data.user.created_at,
        };

        set({ user, isAuthenticated: true, isLoading: false });
        await get().fetchDays();

        // Execute pending unlock if any
        const { pendingUnlockDay } = get();
        if (pendingUnlockDay) {
          await get().unlockDay(pendingUnlockDay, "qrcode");
          set({ pendingUnlockDay: null } as any);
        }

        return true;
      },

      resendOTP: async (email: string) => {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });

        if (error) {
          toast.error("Erro ao reenviar código: " + error.message);
          return false;
        }

        toast.success("Novo código enviado para seu email!");
        return true;
      },

      updateProfile: async (updateData: Partial<User>) => {
        const { user } = get();
        if (!user) return false;

        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updateData.name,
            phone_number: updateData.phone,
            image_url: updateData.imageUrl,
          })
          .eq('id', user.id);

        if (!error) {
          set({ user: { ...user, ...updateData } });
          return true;
        }
        return false;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, days: mockDays, achievements: mockAchievements });
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, phone_number, image_url')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata.name || session.user.email?.split("@")[0],
            email: session.user.email || "",
            phone: profile?.phone_number || session.user.user_metadata.phone || "",
            imageUrl: profile?.image_url,
            totalPoints: 0,
            completedDays: [],
            achievements: [],
            role: (profile?.role as any) || 'usuario',
            createdAt: session.user.created_at,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          await get().fetchDays();

          // Execute pending unlock if any
          const { pendingUnlockDay } = get();
          if (pendingUnlockDay) {
            await get().unlockDay(pendingUnlockDay, "qrcode");
            set({ pendingUnlockDay: null } as any);
          }
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },

      fetchDays: async () => {
        const { data: jornadas, error } = await supabase
          .from('jornadas')
          .select(`
            *,
            perguntas_quiz (*)
          `)
          .order('dia_number', { ascending: true });

        if (error || !jornadas) return;

        const { user } = get();
        let progressMap: Record<string, any> = {};
        let totalEarned = 0;

        if (user) {
          const { data: progress } = await supabase
            .from('progresso_usuario')
            .select('*')
            .eq('user_id', user.id);

          if (progress) {
            progress.forEach(p => {
              progressMap[p.jornada_id] = p;
              totalEarned += p.pontos_acumulados || 0;
            });
          }
        }

        const mappedDays: Day[] = jornadas.map(j => {
          const p = progressMap[j.id] || {};
          return {
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
              videoMain: 30,
              videoPastor: 20,
              quiz: 50,
              completion: 50,
              total: 250,
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
              }))
            }
          };
        });

        if (user) {
          set({
            user: { ...user, totalPoints: totalEarned },
            days: mappedDays
          });
        } else {
          set({ days: mappedDays });
        }
      },

      // Day Actions
      setPendingUnlock: (dayNumber: number) => {
        set({ pendingUnlockDay: dayNumber });
      },

      unlockDay: async (dayNumber: number, method: "qrcode" | "manual", code?: string) => {
        const { user } = get();
        if (!user) return { success: false, message: "Usuário não autenticado" };

        const dayToUnlock = get().days.find(d => d.dayNumber === dayNumber);
        if (!dayToUnlock) return { success: false, message: "Dia não encontrado" };

        // Fetch original journey UUID
        const { data: journey, error: journeyError } = await supabase
          .from('jornadas')
          .select('id, qr_code_secret')
          .eq('dia_number', dayNumber)
          .single();

        if (journeyError || !journey) return { success: false, message: "Erro ao buscar dados do dia" };

        // Real code validation if using QR Code
        if (method === "qrcode") {
          if (!code || code.trim().toUpperCase() !== journey.qr_code_secret?.toUpperCase()) {
            return { success: false, message: "Código QR inválido para este dia" };
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
        const { user } = get();
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
            dia_label: `DIA ${dayNumber} • ${new Date(updateData.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`
          })
          .eq('id', journey.id);

        if (!error) {
          await get().fetchDays();
          return true;
        }
        return false;
      },

      markVideoWatched: async (dayNumber: number, type: "main" | "pastor") => {
        const { user, days } = get();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        const pointsToAdd = type === "main" ? 30 : 20;

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            [type === "main" ? "video_principal_assistido" : "video_preparacao_assistido"]: true,
            pontos_acumulados: (day.points.earned || 0) + pointsToAdd
          }, { onConflict: 'user_id,jornada_id' });

        if (!error) {
          await get().fetchDays();
        }
      },

      completeQuiz: async (dayNumber: number, score: number) => {
        const { user, days } = get();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        const quizPoints = score === 3 ? 50 : Math.floor((score / 3) * 50);

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            quiz_concluido: true,
            quiz_score: score,
            pontos_acumulados: (day.points.earned || 0) + quizPoints
          }, { onConflict: 'user_id,jornada_id' });

        if (!error) {
          await get().fetchDays();
          get().checkAchievements();
        }
      },

      markDayComplete: async (dayNumber: number) => {
        const { user, days } = get();
        if (!user) return;

        const day = days.find(d => d.dayNumber === dayNumber);
        if (!day) return;

        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

        const completionPoints = 50;

        const { error } = await supabase
          .from('progresso_usuario')
          .upsert({
            user_id: user.id,
            jornada_id: journey.id,
            pontos_acumulados: (day.points.earned || 0) + completionPoints
          }, { onConflict: 'user_id,jornada_id' });

        if (!error) {
          await get().fetchDays();
          get().checkAchievements();
        }
      },

      addPoints: (points: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, totalPoints: user.totalPoints + points } });
        }
      },

      checkAchievements: () => {
        const { days, achievements, user } = get();

        const completedDaysCount = days.filter((d) => d.status === "completed").length;
        const perfectQuizCount = days.filter(
          (d) => d.activities.quizCompleted && d.activities.quizScore === 3
        ).length;
        const qrScannedCount = days.filter((d) => d.activities.qrScanned).length;

        const updatedAchievements = achievements.map((achievement) => {
          switch (achievement.id) {
            case "jornada_completa":
              return {
                ...achievement,
                progress: completedDaysCount,
                unlocked: completedDaysCount >= 7,
              };
            case "conhecedor_palavra":
              return {
                ...achievement,
                progress: perfectQuizCount,
                unlocked: perfectQuizCount >= 7,
              };
            case "sempre_presente":
              return {
                ...achievement,
                progress: qrScannedCount,
                unlocked: qrScannedCount >= 7,
              };
            case "comprometido":
              return {
                ...achievement,
                progress: completedDaysCount,
                unlocked: completedDaysCount >= 5,
              };
            default:
              return achievement;
          }
        });

        set({ achievements: updatedAchievements });
      },

      unlockAchievement: (achievementId: string) => {
        const { achievements, user } = get();

        const updatedAchievements = achievements.map((a) =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a
        );

        const updatedUser = user
          ? { ...user, achievements: [...user.achievements, achievementId] }
          : null;

        set({ achievements: updatedAchievements, user: updatedUser });
      },
    }),
    {
      name: "rvl-week-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        days: state.days,
        achievements: state.achievements,
        pendingUnlockDay: state.pendingUnlockDay,
      }),
    }
  )
);
