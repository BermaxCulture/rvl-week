import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    User as UserIcon,
    Mail,
    Phone,
    Camera,
    Save,
    Trophy,
    Zap,
    CheckCircle,
    Clock,
    ChevronRight,
    Key,
    Target,
    Lock,
    X,
    Shield,
    AlertCircle,
    Eye,
    EyeOff,
    Church
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function Perfil() {
    const { user, updateProfile } = useAuth();
    const { days } = useStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [journeyDetails, setJourneyDetails] = useState<any[]>([]);
    const [loadingJourney, setLoadingJourney] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        imageUrl: "",
        isMember: false
    });

    const [modalData, setModalData] = useState({
        newEmail: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState(false);
    const [emailStep, setEmailStep] = useState<"request" | "verify">("request");
    const [otpCode, setOtpCode] = useState("");
    const [activeModal, setActiveModal] = useState<"none" | "email" | "password">("none");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                imageUrl: user.imageUrl || "",
                isMember: user.isMember
            });
            fetchJourneyDetails();
        }
    }, [user]);

    const fetchJourneyDetails = async () => {
        if (!user) return;
        setLoadingJourney(true);
        try {
            const { data, error } = await supabase.rpc("get_user_journey_details", {
                target_user_id: user.id,
            });
            if (error) throw error;
            setJourneyDetails(data || []);
        } catch (err) {
            console.error("Erro ao buscar rastro da jornada:", err);
        } finally {
            setLoadingJourney(false);
        }
    };

    if (!user) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            imageUrl: formData.imageUrl,
            isMember: formData.isMember
        });

        if (success) {
            toast.success("Perfil atualizado com sucesso!");
            setIsEditing(false);
        } else {
            toast.error("Erro ao atualizar perfil");
        }
        setIsLoading(false);
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.info("A alteração de e-mail está temporariamente desativada.");
    };

    const handleVerifyEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalData.newPassword !== modalData.confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (modalData.newPassword.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        setIsLoading(true);
        const { updatePassword } = useAuth.getState();
        const success = await updatePassword(modalData.newPassword);
        if (success) {
            setActiveModal("none");
            setModalData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_profile.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
            await updateProfile({ imageUrl: publicUrl });
            toast.success("Foto atualizada!");
        } catch (error: any) {
            toast.error("Erro no upload: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const completedDaysCount = user.completedDays?.length || 0;
    const progressPercent = Math.round((completedDaysCount / 7) * 100);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Sidebar: Profile Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="p-6 sm:p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden mx-auto shadow-xl bg-muted flex items-center justify-center">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-16 h-16 text-muted-foreground" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                                    </label>
                                </div>

                                <h2 className="text-xl font-display font-bold">{user.name}</h2>
                                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                                {user.role === 'usuario' && (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${user.isMember ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Church className="w-3 h-3" /> {user.isMember ? 'Membro na Link Church' : 'Visitante na Link Church'}
                                    </div>
                                )}

                                {user.role === 'admin' && (
                                    <div className="flex flex-col items-center gap-2 mb-6">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                                            <Shield className="w-3 h-3" /> Administrador
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${user.isMember ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Church className="w-3 h-3" /> {user.isMember ? 'Membro na Link Church' : 'Visitante na Link Church'}
                                        </div>
                                    </div>
                                )}

                                {user.role === 'pastor' && (
                                    <div className="flex flex-col items-center gap-2 mb-6">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                                            <Shield className="w-3 h-3" /> Pastor
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${user.isMember ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Church className="w-3 h-3" /> {user.isMember ? 'Membro na Link Church' : 'Visitante na Link Church'}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-display font-bold text-secondary">
                                            <Zap className="w-5 h-5 inline mr-1 fill-secondary" />
                                            {Number(user.totalPoints || 0).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Pontos</p>
                                    </div>
                                    <div className="text-center border-l">
                                        <p className="text-2xl font-display font-bold text-primary">
                                            {completedDaysCount}/7
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Dias</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" /> Minhas Conquistas
                                </h3>
                                <div className="space-y-3">
                                    {user.achievements.length > 0 ? (
                                        user.achievements.map((id) => {
                                            const achievementMap: Record<string, string> = {
                                                'jornada_completa': 'Jornada Completa',
                                                'conhecedor_palavra': 'Conhecedor da Palavra',
                                                'sempre_presente': 'Sempre Presente',
                                                'comprometido': 'Comprometido'
                                            };
                                            return (
                                                <div key={id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-5 h-5 text-yellow-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold truncate">{achievementMap[id] || id}</p>
                                                        <p className="text-[10px] text-muted-foreground">Conquista desbloqueada</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic text-center py-4">
                                            Continue sua jornada para ganhar badges!
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Main Content: Edit and Progress */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6 md:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <h3 className="text-xl font-display font-bold">Informações da Conta</h3>
                                    {!isEditing && (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                                            Editar Perfil
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" /> Nome Completo
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all disabled:opacity-70"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" /> WhatsApp
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all disabled:opacity-70"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-semibold flex items-center gap-2">
                                                <Church className="w-4 h-4 text-muted-foreground" /> Tipo de Vínculo
                                            </label>
                                            <div className="flex bg-muted/30 p-1.5 rounded-2xl border-2 border-border gap-1.5">
                                                <button
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => setFormData({ ...formData, isMember: true })}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all",
                                                        formData.isMember
                                                            ? "bg-primary text-white shadow-lg"
                                                            : "text-muted-foreground hover:bg-white/5"
                                                    )}
                                                >
                                                    Membro
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => setFormData({ ...formData, isMember: false })}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all",
                                                        !formData.isMember
                                                            ? "bg-primary text-white shadow-lg"
                                                            : "text-muted-foreground hover:bg-white/5"
                                                    )}
                                                >
                                                    Visitante
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                            <Button type="submit" variant="primary" className="flex-1 order-1 sm:order-2" disabled={isLoading}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {isLoading ? "Salvando..." : "Salvar Alterações"}
                                            </Button>
                                            <Button type="button" variant="outline" className="flex-1 order-2 sm:order-1" onClick={() => setIsEditing(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </form>

                                {!isEditing && (
                                    <div className="mt-8 pt-8 border-t space-y-4">
                                        <h4 className="font-bold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest">
                                            <Key className="w-4 h-4" /> Conta e Segurança
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                onClick={() => {
                                                    setModalData(prev => ({ ...prev, newEmail: user.email }));
                                                    setActiveModal("email");
                                                }}
                                                className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all border border-transparent hover:border-primary/20 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-primary" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold">Alterar E-mail</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Email atual ativo</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <button
                                                onClick={() => setActiveModal("password")}
                                                className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all border border-transparent hover:border-primary/20 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Lock className="w-5 h-5 text-secondary" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold">Trocar Senha</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Segurança da conta</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Progress Summary */}
                            <Card className="p-6 sm:p-8">
                                <h3 className="text-xl font-display font-bold mb-6">Seu Progresso de Fé</h3>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold">Jornada Revival Week</span>
                                            <span className="text-primary font-bold">{progressPercent}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden border-2 border-border">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" /> Rastro da Jornada
                                        </h3>

                                        {loadingJourney ? (
                                            <div className="flex items-center justify-center py-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {journeyDetails
                                                    .filter((day) => {
                                                        const now = new Date();
                                                        const isCompleted = day.completed;
                                                        const dateStr = day.data_real.toString().split('T')[0];
                                                        const dayStart = new Date(`${dateStr}T00:00:00-03:00`);
                                                        return isCompleted || now >= dayStart;
                                                    })
                                                    .map((day) => {
                                                        const now = new Date();
                                                        const isCompleted = day.completed || (Number(day.points_earned) >= 200);
                                                        const dateStr = day.data_real.toString().split('T')[0];
                                                        const unlockTime = day.day_number === 7 ? '17:00:00' : '19:30:00';
                                                        const unlockDate = new Date(`${dateStr}T${unlockTime}-03:00`);

                                                        const isRevealed = now >= unlockDate || isCompleted;
                                                        const displayTitle = isRevealed ? day.title : "CONTEÚDO PRIVADO";

                                                        return (
                                                            <div
                                                                key={day.day_number}
                                                                className={`
                                                                    flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                                                                    ${isCompleted
                                                                        ? "bg-green-500/20 border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                                                        : isRevealed
                                                                            ? "bg-red-500/5 border-red-500/10 opacity-60"
                                                                            : "bg-muted/10 border-border/20 grayscale opacity-40"}
                                                                `}
                                                            >
                                                                <div className={`
                                                                    w-10 h-10 rounded-xl flex items-center justify-center font-display font-black flex-shrink-0
                                                                    ${isCompleted ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted text-muted-foreground"}
                                                                `}>
                                                                    {day.day_number}
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <h4 className={`font-bold text-sm leading-tight uppercase font-display ${isCompleted ? "text-green-400" : ""}`}>
                                                                        {displayTitle}
                                                                    </h4>
                                                                    <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">
                                                                        {isCompleted ? `+${day.points_earned} PTS` : isRevealed ? "Não concluído" : "Liberação às " + (day.day_number === 7 ? "17h" : "19:30")}
                                                                    </p>
                                                                </div>
                                                                {isCompleted ? (
                                                                    <div className="bg-green-500 rounded-full p-1 shadow-[0_0_15px_rgba(34,197,94,0.6)] flex-shrink-0">
                                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                                    </div>
                                                                ) : (
                                                                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 opacity-40" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />

            {/* Modais de Segurança */}
            <AnimatePresence>
                {activeModal !== "none" && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal("none")}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-card border-2 border-border p-6 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-display font-bold flex items-center gap-2">
                                    {activeModal === "email" ? <Mail className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-secondary" />}
                                    {activeModal === "email" ? "Alterar E-mail" : "Alterar Senha"}
                                </h3>
                                <button onClick={() => setActiveModal("none")} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {activeModal === "email" ? (
                                emailStep === "request" ? (
                                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 mb-4">
                                            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Enviaremos um código de 6 dígitos para o seu novo e-mail para validar a alteração.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Novo E-mail</label>
                                            <input
                                                type="email"
                                                value={modalData.newEmail}
                                                onChange={(e) => setModalData(prev => ({ ...prev, newEmail: e.target.value }))}
                                                placeholder="exemplo@email.com"
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="h-12">
                                            {isLoading ? "Enviando..." : "Receber Código"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col gap-2 mb-4 text-center">
                                            <p className="text-xs text-muted-foreground">O código foi enviado para:</p>
                                            <p className="text-sm font-bold text-primary">{modalData.newEmail}</p>
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Código de 6 dígitos</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                                placeholder="000000"
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[12px] focus:border-primary outline-none transition-all"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="h-12">
                                            {isLoading ? "Validando..." : "Confirmar Alteração"}
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => setEmailStep("request")}
                                            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-2"
                                        >
                                            Deseja usar outro e-mail? Voltar
                                        </button>
                                    </form>
                                )
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nova Senha</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={modalData.newPassword}
                                                onChange={(e) => setModalData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                placeholder="Mínimo 6 caracteres"
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-3 pr-12 focus:border-primary outline-none transition-all"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirmar Nova Senha</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={modalData.confirmPassword}
                                                onChange={(e) => setModalData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                placeholder="Repita a nova senha"
                                                className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-3 pr-12 focus:border-primary outline-none transition-all"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="h-12">
                                        {isLoading ? "Salvando..." : "Atualizar Senha"}
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
