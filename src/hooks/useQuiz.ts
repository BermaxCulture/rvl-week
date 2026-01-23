import { useState, useEffect, useCallback, useRef } from 'react';
import { quizService, QuizAnswer } from '../services/quizService';

interface UseQuizProps {
    userId: string;
    jornadaId: string;
    totalQuestions: number;
    isActive: boolean;
    onComplete: (totalScore: number) => void;
    maxPoints?: number;
}

export const useQuiz = ({ userId, jornadaId, totalQuestions, isActive, onComplete, maxPoints = 100 }: UseQuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isWaitingNext, setIsWaitingNext] = useState(false);
    const [lastScore, setLastScore] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        if (isFinished || isSaving || isWaitingNext) return;

        setTimeLeft(60);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
    }, [stopTimer, isFinished, isSaving, isWaitingNext]);

    const saveResults = useCallback(async (finalAnswers: QuizAnswer[]) => {
        setIsSaving(true);
        try {
            const totalScore = Math.round(finalAnswers.reduce((sum, a) => sum + a.score, 0));
            await quizService.saveQuizResult({
                userId,
                jornadaId,
                answers: finalAnswers,
                totalScore: totalScore
            });
            onComplete(totalScore);
        } catch (error) {
            console.error('Failed to save quiz results:', error);
        } finally {
            setIsSaving(false);
        }
    }, [userId, jornadaId, onComplete]);

    const handleAnswer = useCallback(async (answer: string) => {
        if (isFinished || isSaving || isWaitingNext) return;

        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const maxPointsPerQuestion = maxPoints / totalQuestions;
        const score = quizService.calculateScore(Math.min(timeTaken, 60), maxPointsPerQuestion);
        const finalScore = answer === '' ? 0 : score;

        const newAnswer: QuizAnswer = {
            questionNumber: currentQuestionIndex + 1,
            answer,
            timeTaken: Math.min(timeTaken, 60),
            score: finalScore,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        setLastScore(finalScore);
        stopTimer();
        setIsWaitingNext(true);

        if (currentQuestionIndex >= totalQuestions - 1) {
            // If last question, we'll finish when they click finish or automatically
            // But let's keep it waiting for the user to see the result
        }
    }, [currentQuestionIndex, answers, stopTimer, isFinished, isSaving, isWaitingNext, totalQuestions]);

    const goToNextQuestion = useCallback(async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsWaitingNext(false);
            setTimeLeft(60);
            // Timer will restart via useEffect
        } else {
            setIsFinished(true);
            setIsWaitingNext(false);
            stopTimer();
            await saveResults(answers);
        }
    }, [currentQuestionIndex, totalQuestions, answers, stopTimer, saveResults]);

    useEffect(() => {
        if (isActive && !isFinished && !isSaving && !isWaitingNext) {
            startTimer();
        }
        return () => stopTimer();
    }, [isActive, currentQuestionIndex, isFinished, isSaving, isWaitingNext, startTimer, stopTimer]);

    // Handle timer timeout
    useEffect(() => {
        if (timeLeft === 0 && isActive && !isFinished && !isSaving && !isWaitingNext) {
            handleAnswer('');
        }
    }, [timeLeft, isActive, isFinished, isSaving, isWaitingNext, handleAnswer]);

    return {
        currentQuestionIndex,
        timeLeft,
        isFinished,
        isSaving,
        isWaitingNext,
        lastScore,
        handleAnswer,
        goToNextQuestion,
        totalScore: Math.round(answers.reduce((sum, a) => sum + a.score, 0))
    };
};
