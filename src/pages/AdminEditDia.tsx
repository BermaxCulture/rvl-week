import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    Upload,
    XCircle,
    FileVideo,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";

export default function AdminEditDia() {
    const { dayNumber } = useParams();
    const navigate = useNavigate();
    const { user, days, updateDay } = useStore();

    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
                verse: day.verse,
                verseReference: day.verseReference,
                videoUrl: day.content.videoUrl,
                pastorVideoUrl: day.content.pastorVideoUrl,
                mainPoints: day.content.mainPoints || ["", "", ""]
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
                mainPoints: formData.mainPoints
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

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (50MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 50) {
            toast.error("O vídeo deve ter no máximo 50MB");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${dayNumber}_pastor_video_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('videos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(filePath);

            setFormData({ ...formData, pastorVideoUrl: publicUrl });
            toast.success("Vídeo enviado com sucesso!");
        } catch (error: any) {
            console.error("Erro no upload:", error);
            toast.error("Erro ao enviar o vídeo: " + error.message);
        } finally {
            setIsUploading(false);
        }
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
                        <h1 className="text-3xl font-display font-bold mb-8">Editar Dia {dayNumber}</h1>

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
                            </Card>

                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <Quote className="w-5 h-5 text-secondary" /> Versículo do Dia
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Texto do Versículo</label>
                                    <textarea
                                        value={formData.verse}
                                        onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                                        className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-secondary outline-none transition-all h-24 resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Referência (Ex: João 3:16)</label>
                                    <input
                                        type="text"
                                        value={formData.verseReference}
                                        onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                                        className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-secondary outline-none transition-all"
                                        required
                                    />
                                </div>
                            </Card>

                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <Video className="w-5 h-5 text-red-500" /> Vídeos (YouTube URLs)
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Vídeo do Culto (YouTube)</label>
                                    <input
                                        type="text"
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>

                                {formData.pastorVideoUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden border-2 border-border aspect-video bg-black">
                                        {formData.pastorVideoUrl.includes('supabase') || formData.pastorVideoUrl.match(/\.(mp4|webm|mov|ogg)$/) ? (
                                            <video
                                                src={formData.pastorVideoUrl}
                                                className="w-full h-full object-contain"
                                                controls
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                                                Link externo detectado. O player nativo suporta apenas arquivos hospedados ou diretos.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold block">Vídeo Próximo Dia (Pastor)</label>

                                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Link Direto (Opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.pastorVideoUrl}
                                                onChange={(e) => setFormData({ ...formData, pastorVideoUrl: e.target.value })}
                                                placeholder="Cole o link aqui ou suba um arquivo abaixo..."
                                                className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 focus:border-primary outline-none transition-all text-sm"
                                            />
                                        </div>

                                        <div className="relative flex items-center gap-4 py-1">
                                            <div className="h-px bg-border flex-1" />
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">OU</span>
                                            <div className="h-px bg-border flex-1" />
                                        </div>

                                        {formData.pastorVideoUrl && !formData.pastorVideoUrl.includes('blob:') && !isUploading ? (
                                            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border-2 border-primary/20">
                                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <FileVideo className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground truncate">Vídeo definido:</p>
                                                    <p className="text-sm font-bold truncate">{formData.pastorVideoUrl}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, pastorVideoUrl: "" })}
                                                    className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                                                >
                                                    <XCircle className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoUpload}
                                                    disabled={isUploading}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                                />
                                                <div className="border-2 border-dashed border-border group-hover:border-primary/50 group-hover:bg-primary/5 rounded-xl p-8 transition-all text-center space-y-3">
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                            <p className="text-sm font-bold">Enviando vídeo...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">Clique para subir arquivo</p>
                                                                <p className="text-xs text-muted-foreground mt-1">MP4, MOV ou WebM (Máx 50MB)</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
                                    <ListChecks className="w-5 h-5 text-success" /> Ensinamentos (Cards)
                                </h2>

                                {[0, 1, 2].map(i => (
                                    <div key={i} className="space-y-2">
                                        <label className="text-sm font-semibold">Card {i + 1}</label>
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

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full sm:flex-1"
                                    disabled={isSaving}
                                >
                                    <Save className="w-5 h-5 mr-1.5" />
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[140px]"
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
            </main>
        </div>
    );
}
