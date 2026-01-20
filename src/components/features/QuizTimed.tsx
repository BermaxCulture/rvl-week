import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, PartyPopper, Clock, Loader2, Brain, Sparkles, Zap } from "lucide-react";
import { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useQuiz } from "@/hooks/useQuiz";
import { toast } from "sonner";

interface QuizTimedProps {
    questions: QuizQuestion[];
    userId: string;
    jornadaId: string;
    onComplete: (score: number) => void;
}

export function QuizTimed({ questions, userId, jornadaId, onComplete }: QuizTimedProps) {
    const [gameState, setGameState] = useState<"intro" | "playing" | "finished">("intro");

    const {
        currentQuestionIndex,
        timeLeft,
        isFinished,
        isSaving,
        isWaitingNext,
        lastScore,
        handleAnswer,
        goToNextQuestion,
        totalScore
    } = useQuiz({
        userId,
        jornadaId,
        totalQuestions: questions?.length || 0,
        isActive: gameState === "playing",
        onComplete
    });

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerState, setAnswerState] = useState<"unanswered" | "correct" | "incorrect">("unanswered");

    // Sync finished state
    useEffect(() => {
        if (isFinished) setGameState("finished");
    }, [isFinished]);

    // Handle timeout from hook
    useEffect(() => {
        if (isWaitingNext && answerState === "unanswered") {
            setAnswerState("incorrect");
            toast.error("Tempo esgotado!", {
                icon: <Clock className="w-5 h-5" />
            });
        }
    }, [isWaitingNext, answerState]);

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center p-8 bg-card rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <p className="text-muted-foreground italic">O quiz para este dia estará disponível em breve.</p>
            </div>
        );
    }

    const question = questions[currentQuestionIndex];

    const handleSelect = (index: number) => {
        if (answerState !== "unanswered") return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null || answerState !== "unanswered") return;

        const isCorrect = selectedAnswer === question.correct;
        setAnswerState(isCorrect ? "correct" : "incorrect");

        handleAnswer(isCorrect ? question.options[selectedAnswer] : 'WRONG_ANSWER');

        if (isCorrect) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 }
            });
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setAnswerState("unanswered");
        goToNextQuestion();
    };

    if (gameState === "intro") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border-3 border-primary/30 text-center shadow-cartoon"
            >
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Brain className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-primary">Regras do Quiz de Sabedoria</h3>
                <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-1 shrink-0">
                            <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Você tem até <strong>60 segundos</strong> por pergunta.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-1 shrink-0">
                            <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Os pontos só começam a diminuir após <strong>15 segundos</strong>. Seja rápido!</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-1 shrink-0">
                            <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Cada acerto vale até <strong>33.33 pontos</strong> de sabedoria.</p>
                    </div>
                </div>
                <Button variant="primary" size="lg" onClick={() => setGameState("playing")} fullWidth icon={Zap}>
                    COMEÇAR AGORA
                </Button>
            </motion.div>
        );
    }

    if (gameState === "finished") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-card rounded-2xl border-3 border-primary shadow-cartoon"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <PartyPopper className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">Quiz Concluído!</h3>
                <p className="text-lg text-muted-foreground mb-4">
                    Sua pontuação final baseada no tempo:
                </p>
                <div className="text-4xl font-black text-primary mb-6">
                    {totalScore.toFixed(2)} pts
                </div>

                {isSaving ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando resultados...
                    </div>
                ) : (
                    <p className="text-success font-semibold">Resultados salvos com sucesso!</p>
                )}
            </motion.div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-3 border-primary/30 relative overflow-hidden">
            {/* Timer Bar */}
            <div className="absolute top-0 left-0 h-1.5 bg-primary/10 w-full">
                <motion.div
                    className={cn("h-full", timeLeft < 15 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary")}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </div>

            <div className="mb-6 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-primary/60">Progresso</span>
                        <span className="text-lg font-display font-bold text-primary">
                            Pergunta {currentQuestionIndex + 1} de {questions.length}
                        </span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all duration-300",
                        timeLeft < 15 ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "bg-card border-primary/20 text-primary"
                    )}>
                        <Clock className="w-5 h-5" />
                        <span className="font-mono font-black text-xl">
                            {timeLeft}s
                        </span>
                    </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden border border-primary/5">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <h4 className="font-display font-bold text-xl mb-8 leading-relaxed">{question?.question}</h4>

            <div className="space-y-3 mb-8">
                {question?.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectAnswer = index === question.correct;
                    const showCorrect = answerState !== "unanswered" && isCorrectAnswer;
                    const showIncorrect = answerState === "incorrect" && isSelected;

                    return (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleSelect(index)}
                            disabled={answerState !== "unanswered"}
                            className={cn(
                                "w-full p-5 rounded-2xl border-3 text-left transition-all duration-300 relative group",
                                answerState === "unanswered" && [
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                                        : "border-primary/10 bg-card hover:border-primary/50 hover:bg-primary/5 hover:translate-x-1",
                                ],
                                showCorrect && "border-success bg-success/20 text-success-foreground",
                                showIncorrect && "border-destructive bg-destructive/20 text-destructive-foreground"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-transform duration-300 group-hover:scale-110",
                                        answerState === "unanswered" && [
                                            isSelected
                                                ? "bg-white text-primary shadow-inner"
                                                : "bg-primary/10 text-primary",
                                        ],
                                        showCorrect && "bg-success text-white shadow-lg",
                                        showIncorrect && "bg-destructive text-white shadow-lg"
                                    )}
                                >
                                    {showCorrect ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : showIncorrect ? (
                                        <XCircle className="w-6 h-6" />
                                    ) : (
                                        String.fromCharCode(65 + index)
                                    )}
                                </div>
                                <span className="font-bold text-lg">{option}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence>
                {answerState !== "unanswered" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                            "p-6 rounded-2xl mb-8 border-2 flex flex-col items-center text-center gap-3",
                            answerState === "correct" ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
                        )}
                    >
                        {answerState === "correct" ? (
                            <>
                                <div className="flex items-center gap-2 text-success font-black text-xl">
                                    <Sparkles className="w-6 h-6" />
                                    +{lastScore.toFixed(2)} PONTOS!
                                </div>
                                <p className="text-sm font-bold text-success-foreground max-w-xs">
                                    {timeLeft < 45
                                        ? "Você acertou, mas seja mais rápido na próxima para ganhar pontuação máxima!"
                                        : "Incrível! Velocidade máxima!"}
                                </p>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-destructive">Não foi dessa vez! Estude mais o tema.</p>
                        )}
                        <div className="w-full h-px bg-current/10 my-1" />
                        <p className="text-xs font-medium opacity-80">{question?.explanation}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-3">
                {answerState === "unanswered" ? (
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        fullWidth
                        className="py-8 text-xl font-black shadow-lg"
                    >
                        CONFIRMAR RESPOSTA
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleNext}
                        fullWidth
                        className="py-8 text-xl font-black bg-accent hover:bg-accent/90 border-none shadow-lg group"
                        icon={ArrowRight}
                        iconPosition="right"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "PRÓXIMA PERGUNTA" : "FINALIZAR QUIZ"}
                    </Button>
                )}
            </div>
        </div>
    );
}
