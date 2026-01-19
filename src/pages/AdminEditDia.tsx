import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Video,
    BookOpen,
    User as UserIcon,
    Church,
    Quote,
    ListChecks,
    AlertCircle,
    Brain,
    Plus,
    Trash2,
    Maximize2,
    X,
    Edit3
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function AdminEditDia() {
    const { dayNumber } = useParams();
    const navigate = useNavigate();
    const { days, updateDay } = useStore();
    const { user } = useAuth();

    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const quizEndRef = useRef<HTMLDivElement>(null);

    // Estado para o modal de expansão
    const [expandedField, setExpandedField] = useState<{
        title: string;
        value: string;
        field: string;
        qIdx?: number;
    } | null>(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            toast.error("Acesso negado");
            navigate("/jornada");
            return;
        }

        const dayNum = parseInt(dayNumber || "1");
        const day = days.find((d) => d.dayNumber === dayNum);

        if (day) {
            setFormData({
                date: day.date,
                theme: day.theme,
                pastor: day.pastor,
                church: day.church,
                verse: day.verse || "",
                verseReference: day.verseReference || "",
                videoUrl: day.content.videoUrl,
                pastorVideoUrl: day.content.pastorVideoUrl,
                mainPoints: day.content.mainPoints || ["", "", ""],
                quiz: day.content.quiz || []
            });
        }
    }, [dayNumber, days, user, navigate]);

    if (!formData) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const success = await updateDay(parseInt(dayNumber!), {
            date: formData.date,
            theme: formData.theme,
            pastor: formData.pastor,
            church: formData.church,
            verse: formData.verse,
            verseReference: formData.verseReference,
            content: {
                ...days.find(d => d.dayNumber === parseInt(dayNumber!))?.content,
                videoUrl: formData.videoUrl,
                pastorVideoUrl: formData.pastorVideoUrl,
                mainPoints: formData.mainPoints,
                quiz: formData.quiz
            }
        });

        if (success) {
            toast.success("Dia atualizado com sucesso!");
            navigate(`/jornada/dia/${dayNumber}`);
        } else {
            toast.error("Erro ao atualizar o dia");
        }
        setIsSaving(false);
    };

    const updateMainPoint = (index: number, value: string) => {
        const newPoints = [...formData.mainPoints];
        newPoints[index] = value;
        setFormData({ ...formData, mainPoints: newPoints });
    };

    const updateQuizQuestion = (qIndex: number, field: string, value: any) => {
        const newQuiz = [...formData.quiz];
        newQuiz[qIndex] = { ...newQuiz[qIndex], [field]: value };
        setFormData({ ...formData, quiz: newQuiz });
    };

    const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuiz = [...formData.quiz];
        const newOptions = [...newQuiz[qIndex].options];
        newOptions[oIndex] = value;
        newQuiz[qIndex] = { ...newQuiz[qIndex], options: newOptions };
        setFormData({ ...formData, quiz: newQuiz });
    };

    const addQuizQuestion = () => {
        if (formData.quiz.length >= 3) {
            toast.error("O quiz pode ter no máximo 3 perguntas.");
            return;
        }

        const newQuestion = {
            question: "",
            options: ["", "", "", ""],
            correct: 0,
            explanation: ""
        };
        setFormData({ ...formData, quiz: [...formData.quiz, newQuestion] });

        // Rolar para a nova pergunta
        setTimeout(() => {
            quizEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const removeQuizQuestion = (index: number) => {
        const newQuiz = formData.quiz.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, quiz: newQuiz });
    };

    const handleSaveExpanded = () => {
        if (!expandedField) return;

        if (expandedField.field === 'question' && expandedField.qIdx !== undefined) {
            updateQuizQuestion(expandedField.qIdx, 'question', expandedField.value);
        } else if (expandedField.field === 'explanation' && expandedField.qIdx !== undefined) {
            updateQuizQuestion(expandedField.qIdx, 'explanation', expandedField.value);
        } else if (expandedField.field.startsWith('mainPoint-')) {
            const idx = parseInt(expandedField.field.split('-')[1]);
            updateMainPoint(idx, expandedField.value);
        }

        setExpandedField(null);
    };

    const isDirectVideo = (url: string) => {
        if (!url) return false;
        return url.match(/\.(mp4|webm|ogg|mov)$/) !== null ||
            url.includes('vercel-storage.com') ||
            url.includes('.supabase.co/storage');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col text-left">
            <Header />

            <main className="flex-1 pt-28 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mt-4 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Link
                            to={`/jornada/dia/${dayNumber}`}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar ao Conteúdo</span>
                        </Link>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Painel Admin
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-display font-bold mb-8 text-foreground">Editar Dia {dayNumber}</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-primary" /> Informações Básicas
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Título do Tema</label>
                                        <input
                                            type="text"
                                            value={formData.theme}
                                            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Data do Dia</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" /> Preletor
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.pastor}
                                            onChange={(e) => setFormData({ ...formData, pastor: e.target.value })}
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Church className="w-4 h-4" /> Igreja
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.church}
                                            onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Quote className="w-4 h-4" /> Versículo Chave (Texto)
                                    </label>
                                    <textarea
                                        value={formData.verse}
                                        onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                                        placeholder="Digite o texto do versículo..."
                                        className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all resize-none h-24"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Referência Bíblica</label>
                                    <input
                                        type="text"
                                        value={formData.verseReference}
                                        onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                                        placeholder="ex: Provérbios 3:5-6"
                                        className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </Card>


                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <Video className="w-5 h-5 text-red-500" /> Vídeos (YouTube URLs)
                                </h2>

                                <div className="space-y-4">
                                </div>



                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Vídeo Próximo Dia (Pastor - YouTube ou MP4 direto)</label>
                                        <input
                                            type="text"
                                            value={formData.pastorVideoUrl}
                                            onChange={(e) => setFormData({ ...formData, pastorVideoUrl: e.target.value })}
                                            placeholder="https://... ou .mp4"
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    {formData.pastorVideoUrl && (
                                        <div className="rounded-xl overflow-hidden border-2 border-border aspect-video bg-black">
                                            {isDirectVideo(formData.pastorVideoUrl) ? (
                                                <video src={formData.pastorVideoUrl} className="w-full h-full object-contain" controls />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                                                    Player do YouTube será usado na exibição.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <ListChecks className="w-5 h-5 text-success" /> Ensinamentos (Cards)
                                </h2>

                                {[0, 1, 2].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold">Card {i + 1}</label>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedField({ title: `Card ${i + 1}`, value: formData.mainPoints[i] || "", field: `mainPoint-${i}` })}
                                                className="text-primary hover:text-primary/80 p-1"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.mainPoints[i] || ""}
                                            onChange={(e) => updateMainPoint(i, e.target.value)}
                                            className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-success outline-none transition-all"
                                            placeholder={`Ponto principal ${i + 1}...`}
                                        />
                                    </div>
                                ))}
                            </Card>

                            <Card className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b pb-2 mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-500" /> Quiz do Dia
                                    </h2>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addQuizQuestion}
                                        disabled={formData.quiz.length >= 3}
                                        className="gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9 text-[10px] sm:text-xs"
                                    >
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="inline-flex">Add Pergunta</span>
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    {formData.quiz.map((q: any, qIdx: number) => (
                                        <div key={qIdx} className="p-4 bg-card border-2 border-border rounded-2xl relative space-y-4 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => removeQuizQuestion(qIdx)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pergunta {qIdx + 1}</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedField({ title: `Pergunta ${qIdx + 1}`, value: q.question, field: "question", qIdx })}
                                                        className="text-purple-500 hover:text-purple-600 p-1"
                                                    >
                                                        <Maximize2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(qIdx, "question", e.target.value)}
                                                    placeholder="Digite a pergunta..."
                                                    className="w-full bg-muted/10 border-2 border-border rounded-xl px-4 py-2 focus:border-purple-500 outline-none transition-all font-bold text-sm h-20 resize-none"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt: string, oIdx: number) => (
                                                    <div key={oIdx} className="space-y-1">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Opção {oIdx + 1}</label>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Correta</span>
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIdx}`}
                                                                    checked={q.correct === oIdx}
                                                                    onChange={() => updateQuizQuestion(qIdx, "correct", oIdx)}
                                                                    className="w-4 h-4 accent-purple-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateQuizOption(qIdx, oIdx, e.target.value)}
                                                            placeholder={`Opção ${oIdx + 1}`}
                                                            className={`w-full bg-muted/10 border-2 rounded-xl px-4 py-2 outline-none transition-all text-sm ${q.correct === oIdx ? 'border-purple-500/50 bg-purple-500/5' : 'border-border'}`}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Explicação da resposta</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedField({ title: `Explicação (Q${qIdx + 1})`, value: q.explanation, field: "explanation", qIdx })}
                                                        className="text-purple-500 hover:text-purple-600 p-1"
                                                    >
                                                        <Maximize2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={q.explanation}
                                                    onChange={(e) => updateQuizQuestion(qIdx, "explanation", e.target.value)}
                                                    placeholder="Explique por que esta é a resposta correta..."
                                                    className="w-full bg-muted/10 border-2 border-border rounded-xl px-4 py-2 focus:border-purple-500 outline-none transition-all text-sm h-20 resize-none italic"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {formData.quiz.length === 0 && (
                                        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                                            Nenhuma pergunta cadastrada para este dia.
                                        </div>
                                    )}
                                    <div ref={quizEndRef} />
                                </div>
                            </Card>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full sm:flex-1 h-14 text-lg font-bold"
                                    disabled={isSaving}
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[140px] h-14"
                                    onClick={() => navigate(`/jornada/dia/${dayNumber}`)}
                                >
                                    Cancelar
                                </Button>
                            </div>

                            <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-xl flex gap-3">
                                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                                <p className="text-xs text-yellow-500/80 leading-relaxed">
                                    As alterações serão salvas diretamente no banco de dados do Supabase e ficarão visíveis para todos os usuários imediatamente.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main >

            {/* Modal de Edição Expandida */}
            <AnimatePresence>
                {
                    expandedField && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-2xl bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
                                    <h3 className="text-lg sm:text-xl font-display font-bold flex items-center gap-2 truncate pr-2">
                                        <Edit3 className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="truncate">{expandedField.title}</span>
                                    </h3>
                                    <button
                                        onClick={() => setExpandedField(null)}
                                        className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6 flex-1 overflow-auto">
                                    <textarea
                                        value={expandedField.value}
                                        onChange={(e) => setExpandedField({ ...expandedField, value: e.target.value })}
                                        className="w-full h-full min-h-[250px] sm:min-h-[300px] bg-muted/10 border-2 border-border rounded-2xl p-4 sm:p-6 focus:border-primary outline-none transition-all text-base sm:text-lg leading-relaxed resize-none"
                                        autoFocus
                                        placeholder="Digite o texto aqui..."
                                    />
                                </div>

                                <div className="p-4 sm:p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleSaveExpanded}
                                        variant="primary"
                                        className="w-full sm:flex-1 h-12 sm:h-14 text-base sm:text-lg font-bold order-1 sm:order-1"
                                    >
                                        Confirmar Alteração
                                    </Button>
                                    <Button
                                        onClick={() => setExpandedField(null)}
                                        variant="outline"
                                        className="w-full sm:w-auto px-8 h-12 sm:h-14 order-2 sm:order-2"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
