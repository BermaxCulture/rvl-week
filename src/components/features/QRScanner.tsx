import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                onScan(decodedText);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                }
            },
            (error) => {
                // Silently handle errors while scanning
                // console.warn(error);
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-card rounded-3xl overflow-hidden p-6 border-3 border-secondary shadow-cartoon">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-foreground" />
                </button>

                <div className="text-center mb-6">
                    <h3 className="font-display font-bold text-2xl text-primary mb-2">
                        Escanear QR Code
                    </h3>
                    <p className="text-muted-foreground">
                        Aponte a câmera para o código no telão
                    </p>
                </div>

                <div id="reader" className="w-full overflow-hidden rounded-2xl bg-black aspect-square"></div>

                <p className="text-center mt-6 text-sm text-muted-foreground">
                    O código será validado automaticamente
                </p>
            </div>
        </div>
    );
}
