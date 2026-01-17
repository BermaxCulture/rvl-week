import { useState } from 'react'
import { X, Camera, QrCode, Smartphone, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'

interface QRInstructionsModalProps {
    isOpen: boolean
    onClose: () => void
    dayNumber: number
}

export default function QRInstructionsModal({ isOpen, onClose, dayNumber }: QRInstructionsModalProps) {
    const [manualCode, setManualCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { unlockDay } = useStore()
    const navigate = useNavigate()

    if (!isOpen) return null

    const handleManualUnlock = async () => {
        if (!manualCode.trim()) {
            toast.error('Digite o código mostrado no telão')
            return
        }

        setIsLoading(true)
        try {
            const result = await unlockDay(dayNumber, 'qrcode', manualCode.trim())

            if (result.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                toast.success(result.message)
                onClose()
                navigate(`/jornada/dia/${dayNumber}`)
            } else {
                toast.error(result.message || 'Código incorreto. Verifique o telão.')
            }
        } catch (err) {
            toast.error('Erro ao validar código. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto pt-20 pb-20">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full p-8 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] my-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-white font-display font-bold text-2xl flex items-center gap-3">
                        <QrCode size={28} className="text-purple-500" />
                        Como Desbloquear
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Instruções */}
                <div className="space-y-6 mb-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold text-lg border border-purple-500/30">
                            1
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Abra a câmera do seu celular</p>
                            <p className="text-gray-400 text-sm">Use o app nativo de câmera (iOS ou Android)</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold text-lg border border-purple-500/30">
                            2
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Escaneie o QR Code no telão</p>
                            <p className="text-gray-400 text-sm">Aponte a câmera para o código projetado no culto</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold text-lg border border-purple-500/30">
                            3
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">Seja redirecionado</p>
                            <p className="text-gray-400 text-sm">O dia será desbloqueado automaticamente ao acessar o link</p>
                        </div>
                    </div>
                </div>

                {/* Ilustração */}
                <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/50 rounded-2xl p-6 text-center mb-8 border border-white/5">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera size={32} className="text-purple-400" />
                    </div>
                    <p className="text-white font-semibold mb-1 text-lg">Escaneie o QR!</p>
                    <p className="text-gray-400 text-sm italic">O desbloqueio é via câmera nativa</p>
                </div>

                {/* Fallback - Código Manual */}
                <details className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 group">
                    <summary className="text-amber-400 font-semibold cursor-pointer text-sm flex items-center gap-2 list-none justify-center">
                        <Smartphone size={18} />
                        Não conseguiu escanear? Clique aqui
                    </summary>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-xs mb-3 text-center uppercase tracking-widest font-bold">DIGITE O CÓDIGO DO TELÃO</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="Ex: ABC123"
                                className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-emerald-400 font-mono text-center outline-none border border-white/10 focus:border-purple-500/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleManualUnlock}
                                disabled={isLoading}
                                className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-center">O código é o mesmo que aparece abaixo do QR no telão.</p>
                    </div>
                </details>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-white/5 active:scale-[0.98]"
                >
                    Entendi
                </button>
            </div>
        </div>
    )
}
