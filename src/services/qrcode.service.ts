import { supabase } from '@/lib/supabase'
import { getBaseUrl } from '@/utils/environment'

export const qrcodeService = {
    get baseUrl() {
        return getBaseUrl();
    },

    generateQRUrl: async (dayNumber: number): Promise<string | null> => {
        try {
            const { data } = await supabase
                .from('jornadas')
                .select('qr_code_url')
                .eq('dia_number', dayNumber)
                .single()

            if (!data?.qr_code_url) return null

            const baseUrl = getBaseUrl()
            const savedUrl = new URL(data.qr_code_url)
            const day = savedUrl.searchParams.get('day')
            const token = savedUrl.searchParams.get('token')

            return `${baseUrl}/unlock?day=${day}&token=${token}&t=${Date.now()}`
        } catch (error) {
            console.error('Erro ao gerar URL:', error)
            return null
        }
    },

    unlockDay: async (qrUrl: string) => {
        try {
            const url = new URL(qrUrl);
            const day = parseInt(url.searchParams.get('day') || '0');
            const token = url.searchParams.get('token') || '';

            return await qrcodeService.unlockDayViaQR(day, token);
        } catch (err: any) {
            if (err.message === 'AUTH_REQUIRED') throw err;
            console.error("[QR Service] Erro ao desbloquear:", err);
            throw new Error(err.message || 'Erro ao ler QR Code');
        }
    },

    unlockDayViaQR: async (day: number, token: string) => {
        if (!day || !token) {
            throw new Error('Parâmetros inválidos');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            localStorage.setItem('pending_unlock', JSON.stringify({ day, token }));
            throw new Error('AUTH_REQUIRED');
        }

        const { data, error } = await supabase.rpc('unlock_via_qr', {
            p_user_id: userId,
            p_day_number: day,
            p_token: token
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        return {
            success: true,
            day: data.day || day,
            points: data.points || 0
        };
    }
}
