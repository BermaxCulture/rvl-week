import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import { User, RegisterData } from '@/types'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { qrcodeService } from '@/services/qrcode.service'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    register: (data: RegisterData) => Promise<boolean>
    verifyEmail: (email: string, token: string) => Promise<boolean>
    resendOTP: (email: string) => Promise<boolean>
    updateProfile: (data: Partial<User>) => Promise<boolean>
    updateEmail: (newEmail: string) => Promise<boolean>
    confirmEmailChange: (newEmail: string, token: string) => Promise<boolean>
    updatePassword: (newPassword: string) => Promise<boolean>
    logout: () => void
    checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: async (email, password) => {
                set({ isLoading: true })
                const { user, error } = await authService.login(email, password)

                if (error) {
                    toast.error('Erro ao fazer login: ' + error.message)
                    set({ isLoading: false })
                    return false
                }

                set({ user, isAuthenticated: true, isLoading: false })
                toast.success('Bem-vindo de volta! 🔥')

                // Fetch app data after login
                await useStore.getState().fetchDays()

                return true
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true })
                const { user: authUser, error } = await authService.register(data)

                if (error) {
                    toast.error('Erro ao criar conta: ' + error.message)
                    set({ isLoading: false })
                    return false
                }

                // Criar Perfil na tabela profiles explicitamente para garantir que a role seja 'usuario'
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: authUser?.id,
                    full_name: data.name,
                    email: data.email,
                    phone_number: data.phone,
                    role: 'usuario'
                });

                if (profileError) {
                    console.error("[Auth] Erro ao criar perfil:", profileError);
                }

                toast.success('Conta criada! Verifique seu email.')
                set({ isLoading: false })
                return true
            },

            verifyEmail: async (email: string, token: string) => {
                set({ isLoading: true })
                const { data, error } = await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: 'signup'
                })

                if (error || !data.user) {
                    set({ isLoading: false })
                    toast.error(error?.message || "Código inválido ou expirado")
                    return false
                }

                const user = await authService.getCurrentUser()
                if (user) {
                    set({ user, isAuthenticated: true, isLoading: false })
                    await useStore.getState().fetchDays()

                    return true
                }

                set({ isLoading: false })
                return false
            },

            resendOTP: async (email: string) => {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                })

                if (error) {
                    toast.error("Erro ao reenviar código: " + error.message)
                    return false
                }

                toast.success("Novo código enviado para seu email!")
                return true
            },

            updateProfile: async (updateData: Partial<User>) => {
                const { user } = get()
                if (!user) return false

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: updateData.name,
                        phone_number: updateData.phone,
                        image_url: updateData.imageUrl,
                    })
                    .eq('id', user.id)

                if (!error) {
                    set({ user: { ...user, ...updateData } })
                    return true
                }
                return false
            },

            updateEmail: async (newEmail: string) => {
                const { error } = await supabase.auth.updateUser({ email: newEmail })
                if (error) {
                    toast.error("Erro ao atualizar email: " + error.message)
                    return false
                }
                toast.success("Código enviado para seu novo e-mail!")
                return true
            },

            confirmEmailChange: async (newEmail: string, token: string) => {
                console.log("[Auth] Iniciando confirmação de troca de email...");
                console.log("[Auth] Novo Email alvo:", newEmail);

                const { data, error } = await supabase.auth.verifyOtp({
                    email: newEmail,
                    token,
                    type: 'email_change'
                })

                if (error) {
                    console.error("[Auth] Erro ao verificar OTP:", error);
                    toast.error("Código inválido ou expirado: " + error.message)
                    return false
                }

                console.log("[Auth] OTP verificado com sucesso no Auth do Supabase!");
                console.log("[Auth] Dados do usuário retornados:", data.user);

                // IMPORTANTE: Sincronizar com a tabela public.profiles
                if (data.user) {
                    console.log("[Auth] Sincronizando tabela public.profiles para o ID:", data.user.id);
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ email: newEmail })
                        .eq('id', data.user.id);

                    if (profileError) {
                        console.error("[Auth] Erro ao atualizar perfil público:", profileError);
                        // Mesmo com erro no profile, a conta auth já mudou, então não retornamos false aqui
                        // mas avisamos o dev via log.
                    } else {
                        console.log("[Auth] Tabela public.profiles atualizada com sucesso!");
                    }
                }

                toast.success("E-mail atualizado com sucesso!")

                // Refresh user data localmente
                console.log("[Auth] Recarregando dados do usuário para o estado global...");
                const updatedUser = await authService.getCurrentUser()
                if (updatedUser) {
                    set({ user: updatedUser })
                    console.log("[Auth] Estado global atualizado com novo email:", updatedUser.email);
                }

                return true
            },

            updatePassword: async (newPassword: string) => {
                const { error } = await supabase.auth.updateUser({ password: newPassword })
                if (error) {
                    toast.error("Erro ao atualizar senha: " + error.message)
                    return false
                }
                toast.success("Senha atualizada com sucesso!")
                return true
            },

            logout: async () => {
                await authService.logout()
                set({ user: null, isAuthenticated: false })
                // Clear store data on logout
                useStore.setState({ days: [], achievements: [] })
                toast.success('Sessão encerrada.')
            },

            checkAuth: async () => {
                set({ isLoading: true })
                const user = await authService.getCurrentUser()
                if (user) {
                    set({ user, isAuthenticated: true, isLoading: false })
                    await useStore.getState().fetchDays()
                } else {
                    set({ user: null, isAuthenticated: false, isLoading: false })
                }
            }
        }),
        {
            name: 'rvl-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
