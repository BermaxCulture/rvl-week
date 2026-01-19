import { supabase } from "@/lib/supabase";
import { User, RegisterData } from "@/types";

export const authService = {
    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            return { user: null, error };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, phone_number, image_url, is_member')
            .eq('id', data.user.id)
            .single();

        const user: User = {
            id: data.user.id,
            name: profile?.full_name || data.user.user_metadata.name || data.user.email?.split("@")[0],
            email: data.user.email || "",
            phone: profile?.phone_number || data.user.user_metadata.phone || "",
            imageUrl: profile?.image_url,
            totalPoints: 0,
            completedDays: [],
            achievements: [],
            role: (profile?.role as any) || 'usuario',
            createdAt: data.user.created_at,
            isMember: profile?.is_member || false,
        };

        return { user, error: null };
    },

    register: async (data: RegisterData) => {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    phone: data.phone,
                    isMember: data.isMember,
                }
            }
        });

        if (error) return { user: null, error };

        // We return the session too, in case email confirmation is disabled
        return { user: authData.user, session: authData.session, error: null };
    },

    logout: async () => {
        await supabase.auth.signOut();
    },

    getCurrentUser: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, phone_number, image_url, is_member')
            .eq('id', session.user.id)
            .single();

        const user: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata.name || session.user.email?.split("@")[0],
            email: session.user.email || "",
            phone: profile?.phone_number || session.user.user_metadata.phone || "",
            imageUrl: profile?.image_url,
            totalPoints: 0,
            completedDays: [],
            achievements: [],
            role: (profile?.role as any) || 'usuario',
            createdAt: session.user.created_at,
            isMember: profile?.is_member || false,
        };

        return user;
    },

    sendResetPasswordEmail: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
    }
};
