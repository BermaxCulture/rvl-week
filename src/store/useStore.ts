import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Day, Achievement, RegisterData } from "@/types";
import { mockDays, mockAchievements } from "@/mocks/days.mock";

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
  checkAuth: () => void;

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
        await sleep(1000);

        if (!email || !password) {
          return false;
        }

        const existingUser = localStorage.getItem("rvl_user");
        let user: User;

        if (existingUser) {
          user = JSON.parse(existingUser);
        } else {
          user = {
            id: crypto.randomUUID(),
            name: email.split("@")[0],
            email,
            phone: "91999999999",
            totalPoints: 0,
            completedDays: [],
            achievements: [],
            createdAt: new Date().toISOString(),
          };
        }

        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      },

      register: async (data: RegisterData) => {
        await sleep(1000);

        if (data.password !== data.confirmPassword) {
          return false;
        }

        const user: User = {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          totalPoints: 0,
          completedDays: [],
          achievements: [],
          createdAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, days: mockDays, achievements: mockAchievements });
        localStorage.removeItem("rvl_user");
      },

      checkAuth: () => {
        const { user } = get();
        set({ isAuthenticated: !!user, isLoading: false });
      },

      // Day Actions
      unlockDay: (dayNumber: number, method: "qrcode" | "manual") => {
        const { days, user } = get();
        const points = method === "qrcode" ? 100 : 0;

        const updatedDays = days.map((day) =>
          day.dayNumber === dayNumber
            ? {
                ...day,
                status: "available" as const,
                unlockedBy: method,
                unlockedAt: new Date().toISOString(),
                activities: {
                  ...day.activities,
                  qrScanned: method === "qrcode",
                },
                points: {
                  ...day.points,
                  earned: day.points.earned + points,
                },
              }
            : day
        );

        const updatedUser = user
          ? { ...user, totalPoints: user.totalPoints + points }
          : null;

        set({ days: updatedDays, user: updatedUser });
        get().checkAchievements();
      },

      markVideoWatched: (dayNumber: number, type: "main" | "pastor") => {
        const { days, user } = get();
        const points = type === "main" ? 30 : 20;

        const updatedDays = days.map((day) =>
          day.dayNumber === dayNumber
            ? {
                ...day,
                activities: {
                  ...day.activities,
                  [type === "main" ? "videoWatched" : "pastorVideoWatched"]: true,
                },
                points: {
                  ...day.points,
                  earned: day.points.earned + points,
                },
              }
            : day
        );

        const updatedUser = user
          ? { ...user, totalPoints: user.totalPoints + points }
          : null;

        set({ days: updatedDays, user: updatedUser });
      },

      completeQuiz: (dayNumber: number, score: number) => {
        const { days, user } = get();
        const points = score === 3 ? 50 : Math.floor((score / 3) * 50);

        const updatedDays = days.map((day) =>
          day.dayNumber === dayNumber
            ? {
                ...day,
                activities: {
                  ...day.activities,
                  quizCompleted: true,
                  quizScore: score,
                },
                points: {
                  ...day.points,
                  earned: day.points.earned + points,
                },
              }
            : day
        );

        const updatedUser = user
          ? { ...user, totalPoints: user.totalPoints + points }
          : null;

        set({ days: updatedDays, user: updatedUser });
        get().checkAchievements();
      },

      markDayComplete: (dayNumber: number) => {
        const { days, user } = get();
        const completionPoints = 50;

        const updatedDays = days.map((day) =>
          day.dayNumber === dayNumber
            ? {
                ...day,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                points: {
                  ...day.points,
                  earned: day.points.earned + completionPoints,
                },
              }
            : day
        );

        const completedDays = [...(user?.completedDays || []), dayNumber];
        const updatedUser = user
          ? {
              ...user,
              totalPoints: user.totalPoints + completionPoints,
              completedDays,
            }
          : null;

        set({ days: updatedDays, user: updatedUser });
        get().checkAchievements();
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
