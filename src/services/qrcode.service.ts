import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

export const qrcodeService = {
    unlockDay: async (qrUrl: string) => {
        // Extrair params da URL
        // Exemplo: https://rvlweek.linkchurch.com.br/unlock?day=1&token=RVL2025D1X9K01
        try {
            const url = new URL(qrUrl);
            const day = parseInt(url.searchParams.get('day') || '0');
            const token = url.searchParams.get('token') || '';

            if (!day || !token) {
                throw new Error('QR Code inválido ou incompleto');
            }

            // Obter usuário logado
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                // Se não houver usuário, salvamos no localStorage/cookie para processar após o login
                // Seguindo a lógica já existente no app
                localStorage.setItem('pending_qr_unlock', JSON.stringify({ day, token }));
                throw new Error('AUTH_REQUIRED');
            }

            // Chamar a função do Supabase
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
