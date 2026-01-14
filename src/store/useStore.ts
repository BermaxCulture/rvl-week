import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Day, Achievement, RegisterData } from "@/types";
import { mockDays, mockAchievements } from "@/mocks/days.mock";
import { supabase } from "@/lib/supabase";

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Days
  days: Day[];

  // Achievements
  achievements: Achievement[];

  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  fetchDays: () => Promise<void>;

  // Day Actions
  unlockDay: (dayNumber: number, method: "qrcode" | "manual") => void;
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

        // Fetch user profile or point data if needed
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata.name || data.user.email?.split("@")[0],
          email: data.user.email || "",
          phone: data.user.user_metadata.phone || "",
          totalPoints: 0, // Should fetch from a profile table in a real scenario
          completedDays: [],
          achievements: [],
          createdAt: data.user.created_at,
        };

        set({ user, isAuthenticated: true, isLoading: false });
        await get().fetchDays();
        return true;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              phone: data.phone,
            }
          }
        });

        if (error || !authData.user) {
          set({ isLoading: false });
          return false;
        }

        const user: User = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          totalPoints: 0,
          completedDays: [],
          achievements: [],
          createdAt: authData.user.created_at,
        };

        set({ user, isAuthenticated: true, isLoading: false });
        await get().fetchDays();
        return true;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, days: mockDays, achievements: mockAchievements });
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split("@")[0],
            email: session.user.email || "",
            phone: session.user.user_metadata.phone || "",
            totalPoints: 0,
            completedDays: [],
            achievements: [],
            createdAt: session.user.created_at,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          await get().fetchDays();
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

        if (user) {
          const { data: progress } = await supabase
            .from('progresso_usuario')
            .select('*')
            .eq('user_id', user.id);

          if (progress) {
            progress.forEach(p => progressMap[p.jornada_id] = p);
          }
        }

        const mappedDays: Day[] = jornadas.map(j => {
          const p = progressMap[j.id] || {};
          return {
            dayNumber: j.dia_number,
            date: j.dia_label.split(' • ')[1] || '',
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

        set({ days: mappedDays });
      },

      // Day Actions
      unlockDay: async (dayNumber: number, method: "qrcode" | "manual") => {
        const { user } = get();
        if (!user) return;

        const dayToUnlock = get().days.find(d => d.dayNumber === dayNumber);
        if (!dayToUnlock) return;

        // Fetch original journey UUID
        const { data: journey } = await supabase
          .from('jornadas')
          .select('id')
          .eq('dia_number', dayNumber)
          .single();

        if (!journey) return;

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
        }
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
      }),
    }
  )
);
