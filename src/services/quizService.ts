import { supabase } from '../lib/supabase';

export interface QuizAnswer {
    questionNumber: number;
    answer: string;
    timeTaken: number;
    score: number;
}

export interface QuizResultData {
    userId: string;
    jornadaId: string;
    answers: QuizAnswer[];
    totalScore: number;
}

export const quizService = {
    calculateScore(timeTaken: number, maxPointsPerQuestion: number = 33.33): number {
        const maxTime = 60; // seconds
        const gracePeriod = 15; // seconds before point reduction starts

        if (timeTaken <= gracePeriod) {
            return maxPointsPerQuestion;
        }

        const reductionTime = maxTime - gracePeriod; // 45s
        const remainingReductionTime = Math.max(0, maxTime - timeTaken); // 0 to 45

        const score = (remainingReductionTime / reductionTime) * maxPointsPerQuestion;
        return Math.round(score * 100) / 100; // round to 2 decimals
    },

    async saveQuizResult(data: QuizResultData) {
        const { userId, jornadaId, answers, totalScore } = data;

        const payload = {
            user_id: userId,
            jornada_id: jornadaId,
            question_1_answer: answers.find(a => a.questionNumber === 1)?.answer || '',
            question_1_time: answers.find(a => a.questionNumber === 1)?.timeTaken || 0,
            question_1_score: answers.find(a => a.questionNumber === 1)?.score || 0,
            question_2_answer: answers.find(a => a.questionNumber === 2)?.answer || '',
            question_2_time: answers.find(a => a.questionNumber === 2)?.timeTaken || 0,
            question_2_score: answers.find(a => a.questionNumber === 2)?.score || 0,
            question_3_answer: answers.find(a => a.questionNumber === 3)?.answer || '',
            question_3_time: answers.find(a => a.questionNumber === 3)?.timeTaken || 0,
            question_3_score: answers.find(a => a.questionNumber === 3)?.score || 0,
            total_score: totalScore,
            completed_at: new Date().toISOString(),
        };

        const { data: result, error } = await supabase
            .from('quiz_results')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error saving quiz result:', error);
            throw error;
        }

        return result;
    }
};
