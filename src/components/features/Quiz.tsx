import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, PartyPopper, FileText } from "lucide-react";
import { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/ButtonCustom";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

type AnswerState = "unanswered" | "correct" | "incorrect";

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
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
    setAnswerState(isCorrect ? "correct" : "incorrect");
    setUserAnswers(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerState("unanswered");
    } else {
      // O userAnswers já contém o resultado da pergunta atual, pois foi adicionado no handleSubmitAnswer
      const correctCount = userAnswers.filter(Boolean).length;
      setShowResults(true);

      if (correctCount === questions.length) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      }

      onComplete(correctCount);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswerState("unanswered");
    setUserAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    const correctCount = userAnswers.filter(Boolean).length;
    const isPerfect = correctCount === questions.length;

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
          Você acertou {correctCount}/{questions.length}
        </p>
        <p className={cn("font-bold mb-6", isPerfect ? "text-success" : "text-primary")}>
          +{isPerfect ? 50 : Math.floor((correctCount / questions.length) * 50)} pts conquistados
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
            Pergunta {currentQuestion + 1} de {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">+50 pts (100%)</span>
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

      {answerState !== "unanswered" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl mb-6",
            answerState === "correct" ? "bg-success/10" : "bg-muted"
          )}
        >
          <p className="text-sm">{question?.explanation}</p>
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
