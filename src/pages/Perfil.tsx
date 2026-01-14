import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    Shield,
    Key
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/ButtonCustom";
import { Card } from "@/components/ui/CardCustom";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";

export default function Perfil() {
    const { user, days, updateProfile } = useStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        imageUrl: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                imageUrl: user.imageUrl || ""
            });
        }
    }, [user]);

    if (!user) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            imageUrl: formData.imageUrl
        });

        if (success) {
            toast.success("Perfil atualizado com sucesso!");
            setIsEditing(false);
        } else {
            toast.error("Erro ao atualizar perfil");
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
                            <Card className="p-8 text-center relative overflow-hidden">
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
                                <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

                                {user.role === 'admin' && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                        <Shield className="w-3 h-3" /> Administrador
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-display font-bold text-secondary">
                                            <Zap className="w-5 h-5 inline mr-1 fill-secondary" />
                                            {user.totalPoints}
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
                                        user.achievements.map((id) => (
                                            <div key={id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                                                <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{id}</p>
                                                    <p className="text-[10px] text-muted-foreground">Conquista desbloqueada</p>
                                                </div>
                                            </div>
                                        ))
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
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" /> E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full bg-muted/10 border-2 border-border/50 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed text-muted-foreground italic"
                                        />
                                        <p className="text-[10px] text-muted-foreground">O e-mail não pode ser alterado.</p>
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
                                    <div className="mt-8 pt-8 border-t">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-sm">
                                            <Key className="w-4 h-4" /> Segurança
                                        </h4>
                                        <button
                                            onClick={() => toast.info("Funcionalidade de troca de senha em breve!")}
                                            className="flex items-center justify-between w-full p-4 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all"
                                        >
                                            <span className="text-sm font-medium">Alterar Senha</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                            </Card>

                            {/* Progress Summary */}
                            <Card className="p-8">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <div className="bg-primary/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                            </div>
                                            <p className="text-lg font-bold">{completedDaysCount} / 7</p>
                                            <p className="text-xs text-muted-foreground">Dias de jornada concluídos</p>
                                        </div>
                                        <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                                            <div className="bg-secondary/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                                                <Zap className="w-4 h-4 text-secondary" />
                                            </div>
                                            <p className="text-lg font-bold">{user.totalPoints}</p>
                                            <p className="text-xs text-muted-foreground">Pontos totais acumulados</p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/20 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                                            <Clock className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Membro desde</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto"
                                            onClick={() => navigate('/jornada')}
                                        >
                                            Ver Jornada
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
