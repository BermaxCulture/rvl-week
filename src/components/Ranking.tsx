import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Award, Zap, ArrowRight, X, Calendar, Target, CheckCircle2, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/ButtonCustom'
import { mockAchievements } from '@/mocks/days.mock'

interface RankingUser {
    id: string
    name: string
    email: string
    avatar_url: string | null
    total_points: number
    completed_days: number
    achievements: string[]
    position: number
}

interface UserDetail {
    day_number: number
    title: string
    completed: boolean
    points_earned: number
}

interface UserRank {
    position: number
    total_users: number
    user_total_points: number
    user_completed_days: number
}

export default function Ranking() {
    const navigate = useNavigate()
    const [topUsers, setTopUsers] = useState<RankingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // User Rank State
    const [userRank, setUserRank] = useState<UserRank | null>(null)

    // Modal State
    const [selectedUser, setSelectedUser] = useState<RankingUser | null>(null)
    const [userDetails, setUserDetails] = useState<UserDetail[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        loadRanking()
        loadUserRank()
    }, [])

    const loadRanking = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .rpc('get_ranking', { limit_count: 3 })

            if (error) throw error
            setTopUsers(data || [])
        } catch (err) {
            console.error('Erro ao carregar ranking:', err)
            setError('Não foi possível carregar o ranking')
        } finally {
            setLoading(false)
        }
    }

    const loadUserRank = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .rpc('get_user_rank', { target_user_id: user.id })

            if (error) throw error
            if (data && data.length > 0) {
                setUserRank(data[0])
            }
        } catch (err) {
            console.error('Erro ao carregar posição do usuário:', err)
        }
    }

    const fetchUserDetails = async (user: RankingUser) => {
        setSelectedUser(user)
        setLoadingDetails(true)
        try {
            const { data, error } = await supabase.rpc("get_user_journey_details", {
                target_user_id: user.id,
            })
            if (error) throw error
            setUserDetails(data || [])
        } catch (err) {
            console.error("Erro ao buscar detalhes:", err)
        } finally {
            setLoadingDetails(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    }

    const formatName = (name: string) => {
        const parts = name.trim().split(/\s+/)
        if (parts.length <= 2) return name
        return `${parts[0]} ${parts[parts.length - 1]}`
    }

    const getPositionStyle = (position: number) => {
        switch (position) {
            case 1:
                return {
                    icon: <Trophy className="text-yellow-500" size={28} />,
                    bgGradient: 'from-yellow-500/20 to-orange-500/20',
                    borderColor: 'border-yellow-500',
                    badge: '🥇'
                }
            case 2:
                return {
                    icon: <Medal className="text-gray-400" size={28} />,
                    bgGradient: 'from-gray-400/20 to-gray-500/20',
                    borderColor: 'border-gray-400',
                    badge: '🥈'
                }
            case 3:
                return {
                    icon: <Award className="text-orange-600" size={28} />,
                    bgGradient: 'from-orange-600/20 to-orange-700/20',
                    borderColor: 'border-orange-600',
                    badge: '🥉'
                }
            default:
                return {
                    icon: <span className="text-purple-400 font-bold text-lg">{position}º</span>,
                    bgGradient: 'from-gray-800/50 to-gray-900/50',
                    borderColor: 'border-gray-700',
                    badge: null
                }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-col items-start gap-1 mb-6">
                <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-secondary" />
                    TOP 3 DA SEMANA
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/ranking')}
                    className="text-[12px] font-bold text-secondary hover:bg-secondary/10 flex items-center gap-2"
                >
                    VER RANKING COMPLETO <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-4">
                {topUsers.map((user, index) => {
                    const style = getPositionStyle(user.position)

                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => fetchUserDetails(user)}
                            className={`
                                relative flex items-center gap-4 cursor-pointer
                                bg-gradient-to-r ${style.bgGradient}
                                backdrop-blur-lg border-2 ${style.borderColor}
                                rounded-2xl p-4 md:p-5
                                hover:scale-[1.01] hover:shadow-xl transition-all duration-300
                            `}
                        >
                            <div className="w-12 flex justify-center items-center">
                                {style.icon}
                            </div>

                            <div className="relative">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className={`w-12 h-12 rounded-full object-cover border-2 ${style.borderColor}`}
                                    />
                                ) : (
                                    <div className={`
                    w-12 h-12 rounded-full bg-primary/20 
                    border-2 ${style.borderColor}
                    flex items-center justify-center font-bold text-white
                  `}>
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate italic uppercase text-sm sm:text-base">
                                    {formatName(user.name)}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-tight">
                                        {user.completed_days}/7 DIAS CONCLUÍDOS
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <Zap className="text-yellow-500 fill-yellow-500" size={16} />
                                    <p className="text-xl font-black text-yellow-500">
                                        {user.total_points}
                                    </p>
                                </div>
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                    PONTOS
                                </p>
                            </div>
                        </motion.div>
                    )
                })}

                {topUsers.length === 0 && !error && (
                    <div className="p-8 text-center bg-card/50 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-display text-sm">
                        A JORNADA ESTÁ COMEÇANDO. SEJA O PRIMEIRO!
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 text-xs text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* User Position Summary */}
            {userRank && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-card/40 border-2 border-border/50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <User className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sua Posição</p>
                            <h4 className="text-2xl font-black font-display text-foreground">
                                #{userRank.position} <span className="text-sm font-bold text-muted-foreground">de {userRank.total_users}</span>
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-yellow-500 flex items-center gap-2">
                                <Zap className="w-5 h-5 fill-yellow-500" /> {userRank.user_total_points}
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">PONTOS</p>
                        </div>
                        <div className="h-10 w-px bg-border/50" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> {userRank.user_completed_days}/7
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">DIAS</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border-2 border-primary/20 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="relative p-8 md:p-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border/50">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute right-6 top-6 p-2 bg-background/50 hover:bg-background rounded-full transition-all hover:rotate-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        {selectedUser.avatar_url ? (
                                            <img
                                                src={selectedUser.avatar_url}
                                                alt={selectedUser.name}
                                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary shadow-xl"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20 flex items-center justify-center font-bold text-4xl border-4 border-primary shadow-xl">
                                                {selectedUser.name[0]}
                                            </div>
                                        )}
                                        <div className="absolute -top-4 -right-2 bg-yellow-500 text-black font-black px-4 py-1 rounded-full text-lg shadow-cartoon-sm">
                                            #{selectedUser.position}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl md:text-4xl font-black font-display mb-2 uppercase tracking-tight">
                                            {selectedUser.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="bg-yellow-500/10 text-yellow-500 px-4 py-1 rounded-full flex items-center gap-2 font-black italic">
                                                <Zap className="w-4 h-4 fill-yellow-500" />
                                                {selectedUser.total_points} PTS
                                            </div>
                                            <div className="bg-primary/10 text-primary px-4 py-1 rounded-full flex items-center gap-2 font-black italic">
                                                <Calendar className="w-4 h-4" />
                                                {selectedUser.completed_days}/7 DIAS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 text-left">
                                        <Award className="w-5 h-5 text-secondary" /> Conquistas Desbloqueadas
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {mockAchievements.map((m) => {
                                            const isUnlocked = selectedUser.achievements?.includes(m.id)
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`
                                                        relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all
                                                        ${isUnlocked ? "bg-secondary/5 border-secondary/30 grayscale-0" : "bg-card border-border grayscale opacity-40"}
                                                    `}
                                                >
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${isUnlocked ? 'from-secondary to-purple-600' : 'from-muted to-muted'} shadow-lg`}>
                                                        <Award className="text-white w-6 h-6" />
                                                    </div>
                                                    <p className="text-[9px] font-bold text-center leading-tight uppercase font-heading">{m.name}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 text-left">
                                        <Target className="w-5 h-5 text-primary" /> Rastro da Jornada
                                    </h3>

                                    {loadingDetails ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 text-left">
                                            {userDetails.map((day) => (
                                                <div
                                                    key={day.day_number}
                                                    className={`
                                                        flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                                                        ${day.completed ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/10 opacity-60"}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-10 h-10 rounded-xl flex items-center justify-center font-display font-black
                                                        ${day.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                                                    `}>
                                                        {day.day_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm leading-tight">{day.title}</h4>
                                                        <p className="text-[10px] uppercase font-black tracking-widest mt-0.5 opacity-60">
                                                            {day.completed ? `+${day.points_earned} PTS` : "Não concluído"}
                                                        </p>
                                                    </div>
                                                    {day.completed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 border-t border-border/50 bg-black/20">
                                <Button variant="outline" fullWidth onClick={() => setSelectedUser(null)}>
                                    Fechar Perfil
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
