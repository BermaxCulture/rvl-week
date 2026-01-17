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

            // Usar URL base dinâmica
            const baseUrl = getBaseUrl()

            // Extrair params da URL salva no banco
            const savedUrl = new URL(data.qr_code_url)
            const day = savedUrl.searchParams.get('day')
            const token = savedUrl.searchParams.get('token')

            // Montar URL com base dinâmica
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

            if (!day || !token) {
                throw new Error('QR Code inválido ou incompleto');
            }

            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                localStorage.setItem('pending_qr_unlock', JSON.stringify({ day, token }));
                throw new Error('AUTH_REQUIRED');
            }

            const { data, error } = await supabase.rpc('unlock_via_qr', {
                p_user_id: userId,
                p_day_number: day,
                p_token: token
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            return data;
        } catch (err: any) {
            if (err.message === 'AUTH_REQUIRED') throw err;
            console.error("[QR Service] Erro ao desbloquear:", err);
            throw new Error(err.message || 'Erro ao ler QR Code');
        }
    }
}
