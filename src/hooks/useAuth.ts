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
    updateProfile: (data: Partial<User>) => Promise<boolean>
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
                    const message = error.message === 'Invalid login credentials'
                        ? 'E-mail ou senha incorretos'
                        : error.message
                    toast.error('Erro ao fazer login: ' + message)
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
                const { user: authUser, session, error } = await authService.register(data)

                if (error) {
                    toast.error('Erro ao criar conta: ' + error.message)
                    set({ isLoading: false })
                    return false
                }

                // Criar Perfil na tabela profiles
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

                if (session) {
                    // Se houver sessão, o login foi automático
                    const user = await authService.getCurrentUser()
                    set({ user, isAuthenticated: true, isLoading: false })
                    await useStore.getState().fetchDays()
                    toast.success('Conta criada e autenticada! 🚀')
                } else {
                    toast.success('Conta criada! Bem-vindo.')
                    // Se não houver sessão e o usuário removeu o provider, ele provavelmente 
                    // configurou o supabase de forma que não loga automático mas também não tem OTP
                    // Nesse caso o usuário terá que fazer login manual.
                    set({ isLoading: false })
                }

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
