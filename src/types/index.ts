export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  totalPoints: number;
  completedDays: number[];
  achievements: string[];
  role: 'usuario' | 'admin' | 'pastor';
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface DayContent {
  mainPoints: string[];
  videoUrl: string;
  videoThumbnail: string;
  pastorVideoUrl: string;
  pastorVideoThumbnail: string;
  quiz: QuizQuestion[];
}

export interface DayPoints {
  qrcode: number;
  videoMain: number;
  videoPastor: number;
  quiz: number;
  completion: number;
  total: number;
  earned: number;
}

export interface DayActivities {
  qrScanned: boolean;
  videoWatched: boolean;
  pastorVideoWatched: boolean;
  quizCompleted: boolean;
  quizScore: number;
}

export interface Day {
  dayNumber: number;
  date: string;
  pastor: string;
  church?: string;
  theme: string;
  verse: string;
  verseReference: string;
  status: 'locked' | 'available' | 'completed';
  unlockedBy?: 'qrcode' | 'manual';
  unlockedAt?: string;
  completedAt?: string;
  points: DayPoints;
  activities: DayActivities;
  content: DayContent;
  qrCodeUrl?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
