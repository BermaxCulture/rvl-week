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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        console.log('🔑 Desbloqueando dia', day, 'para user', user.id);

        const { data, error } = await supabase.rpc('unlock_via_qr', {
            p_user_id: user.id,
            p_day_number: day,
            p_token: token
        });

        if (error) {
            console.error('❌ Erro RPC:', error);
            throw error;
        }

        const result = typeof data === 'string' ? JSON.parse(data) : data;

        if (!result.success) {
            throw new Error(result.error);
        }

        console.log('✅ Dia desbloqueado com sucesso:', result);

        return {
            success: true,
            dayNumber: result.day || day,
            pointsEarned: result.points || 0
        };
    }
}
