import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, PartyPopper, FileText } from "lucide-react";
import { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/ButtonCustom";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface QuizProps {
  questions: QuizQuestion[];
  timeLimit?: number;
  penaltyTime?: number;
  maxPoints?: number;
  onComplete: (score: number) => void;
}

type AnswerState = "unanswered" | "correct" | "incorrect" | "timeout" | "correct_with_penalty";

export function Quiz({ questions, timeLimit = 60, penaltyTime = 30, maxPoints = 100, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-2xl border-2 border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground italic">O quiz para este dia estará disponível em breve.</p>
      </div>
    );
  }

  const question = questions[currentQuestion];

  const handleSelectAnswer = (index: number) => {
    if (answerState !== "unanswered") return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerState !== "unanswered") return;

    const isCorrect = selectedAnswer === question.correct;

    // Check for penalty
    // If timeLeft is less than (timeLimit - penaltyTime), it means we passed the penalty threshold
    // e.g. Limit 60, Penalty 30. Penalty starts at 30s elapsed (timeLeft <= 30).
    const isPenalty = timeLeft <= (timeLimit - penaltyTime);

    if (isCorrect) {
      if (isPenalty) {
        setAnswerState("correct_with_penalty");
        setUserAnswers(prev => [...prev, 0.5]);
      } else {
        setAnswerState("correct");
        setUserAnswers(prev => [...prev, 1]);
      }
    } else {
      setAnswerState("incorrect");
      setUserAnswers(prev => [...prev, 0]);
    }
  };

  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (answerState === "unanswered") {
            setAnswerState("timeout");
            setUserAnswers(prevAnswers => [...prevAnswers, 0]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showResults, answerState]);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerState("unanswered");
      setTimeLeft(timeLimit);
    } else {
      // O userAnswers já contém o resultado da pergunta atual
      const totalScore = userAnswers.reduce((a, b) => a + b, 0);
      setShowResults(true);

      const correctCount = userAnswers.filter(s => s >= 0.5).length; // Count passed questions

      if (userAnswers.every(s => s === 1)) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      }

      onComplete(totalScore);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswerState("unanswered");
    setUserAnswers([]);
    setShowResults(false);
    setTimeLeft(timeLimit);
  };

  if (showResults) {
    const totalScore = userAnswers.reduce((a, b) => a + b, 0);
    const maxScore = questions.length;
    const isPerfect = totalScore === maxScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-card rounded-2xl border-3 border-primary shadow-cartoon"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            {isPerfect ? (
              <PartyPopper className="w-10 h-10 text-primary" />
            ) : (
              <FileText className="w-10 h-10 text-primary" />
            )}
          </div>
        </div>
        <h3 className="font-display font-bold text-2xl mb-2">
          {isPerfect ? "Perfeito!" : "Quiz Concluído!"}
        </h3>
        <p className="text-lg text-muted-foreground mb-4">
          Você fez {totalScore} de {maxScore} pontos possíveis
        </p>
        <p className={cn("font-bold mb-6", isPerfect ? "text-success" : "text-primary")}>
          +{Math.ceil((totalScore / maxScore) * maxPoints)} pts conquistados
        </p>
        {!isPerfect && (
          <Button variant="outline" icon={RotateCcw} onClick={handleRetry}>
            Tentar Novamente
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-3 border-primary/30">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary">
            Pergunta {currentQuestion + 1} de {questions.length} • {timeLeft}s
          </span>
          <span className="text-sm text-muted-foreground">+{maxPoints} pts ({Math.round((maxPoints / questions.length) * 100) / 100} pts/pergunta)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <h4 className="font-display font-bold text-lg mb-6">{question?.question}</h4>

      <div className="space-y-3 mb-6">
        <AnimatePresence mode="wait">
          {question?.options.map((option, index) => {
            if (!option || !option.trim()) return null;
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
                onClick={() => handleSelectAnswer(index)}
                disabled={answerState !== "unanswered"}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                  "flex items-center gap-3",
                  answerState === "unanswered" && [
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                  ],
                  showCorrect && "border-success bg-success/10",
                  showIncorrect && "border-destructive bg-destructive/10"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    answerState === "unanswered" && [
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    ],
                    showCorrect && "bg-success text-success-foreground",
                    showIncorrect && "bg-destructive text-destructive-foreground"
                  )}
                >
                  {showCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : showIncorrect ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Feedback Message */}
      {answerState !== "unanswered" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl mb-6 flex items-start gap-3",
            (answerState === "correct" || answerState === "correct_with_penalty") ? "bg-success/10 text-success-foreground" :
              answerState === "timeout" ? "bg-warning/10 text-warning-foreground" : "bg-destructive/10 text-destructive-foreground"
          )}
        >
          {(answerState === "correct" || answerState === "correct_with_penalty") ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-success" />
          ) : answerState === "timeout" ? (
            <RotateCcw className="w-5 h-5 shrink-0 mt-0.5 text-warning" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
          )}
          <div>
            <p className="font-bold mb-1">
              {answerState === "correct" ? "Resposta Correta!" :
                answerState === "correct_with_penalty" ? "Resposta correta, mas seja mais rápido na próxima para ganhar a pontuação máxima!" :
                  answerState === "timeout" ? "Tempo Esgotado!" : "Resposta Incorreta"}
            </p>
            {question?.explanation && (
              <p className="text-sm opacity-90">{question.explanation}</p>
            )}
            {!question?.explanation && (answerState !== "correct" && answerState !== "correct_with_penalty") && (
              <p className="text-sm opacity-90">A resposta correta era: {question.options[question.correct]}</p>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        {answerState === "unanswered" ? (
          <Button
            variant="primary"
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            fullWidth
          >
            Responder
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleNextQuestion}
            fullWidth
          >
            {currentQuestion < questions.length - 1 ? "Próxima" : "Ver Resultado"}
          </Button>
        )}
      </div>
    </div>
  );
}
