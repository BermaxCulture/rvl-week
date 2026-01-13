import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Clock, MapPin, Calendar } from "lucide-react";
import { mockDays } from "@/mocks/days.mock";

const speakerImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544717297-fa154da09f5b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
];

export function ScheduleCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % mockDays.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + mockDays.length) % mockDays.length);

    const currentDay = mockDays[currentIndex];

    // SVG Grain Filter component
    const GrainOverlay = () => (
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.15] mix-blend-overlay">
            <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <filter id='noiseFilter'>
                    <feTurbulence
                        type='fractalNoise'
                        baseFrequency='0.65'
                        numOctaves='3'
                        stitchTiles='stitch' />
                </filter>
                <rect width='100%' height='100%' filter='url(#noiseFilter)' />
            </svg>
        </div>
    );

    return (
        <section className="relative min-h-[85vh] flex items-center overflow-hidden py-24"
            style={{ background: 'linear-gradient(135deg, #5b00a3 0%, #3d017a 100%)' }}>
            {/* Grain Texture Overlay */}
            <GrainOverlay />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT COLUMN: Dunamis Style Typography */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col select-none"
                        >
                            <h2 className="font-display text-[85px] md:text-[110px] text-white leading-[0.85] tracking-tight mb-2 uppercase italic font-black">
                                PROGRAMAÇÃO
                            </h2>
                            <h2 className="font-display text-[85px] md:text-[110px] text-white leading-[0.85] tracking-tight uppercase italic font-black">
                                COMPLETA
                            </h2>
                            <div className="mt-8">
                                <p className="text-white font-heading text-xl font-medium max-w-[440px] leading-snug">
                                    Um treinamento para <span className="font-black">levantar uma geração</span> que vive o mover de Deus em todas as esferas.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <button className="bg-[#4C1D95] text-white px-10 py-3 rounded-full font-display font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/30 group uppercase border-3 border-white">
                                <span>Saiba mais!</span>
                                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: 3D Stacked Carousel - EXACT DUNAMIS MATH */}
                    <div className="lg:col-span-12 xl:col-span-7 flex justify-center lg:justify-end perspective-1000 py-20 lg:py-0">
                        <div className="relative w-full max-w-[460px] aspect-[1/1.2] preserve-3d">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {[...Array(4)].map((_, i) => {
                                    const slideIndex = (currentIndex + i) % mockDays.length;
                                    const isFront = i === 0;

                                    return (
                                        <motion.div
                                            key={slideIndex}
                                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                            animate={{
                                                opacity: 1 - i * 0.25, // Redução progressiva de opacidade (vazado)
                                                x: -i * 35, // Aumento do deslocamento horizontal
                                                y: i * 35,  // Aumento do deslocamento vertical
                                                scale: 1 - i * 0.08, // Escala reduzida
                                                z: -i * 50,
                                                filter: `blur(${i * 1.5}px)`,
                                            }}
                                            exit={{ opacity: 0, x: -200, scale: 0.5, transition: { duration: 0.4 } }}
                                            transition={{ duration: 0.7, ease: [0.32, 1, 0.4, 1] }}
                                            style={{
                                                zIndex: 10 - i,
                                                position: "absolute",
                                                inset: 0,
                                            }}
                                            className={`rounded-[20px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)] border-2 
                                                ${isFront ? "border-white/40" : "border-white/5 pointer-events-none"}`}
                                        >
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={speakerImages[slideIndex]}
                                                    alt={mockDays[slideIndex].pastor}
                                                    className="w-full h-full object-cover grayscale-[0.2]"
                                                />
                                                {/* Deep Blue Overlay Gradient strictly matching the site */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#00004dE6] via-transparent to-transparent" />

                                                {/* Card Content based on Dunamis image style */}
                                                <div className="absolute inset-x-0 bottom-0 p-10 space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="inline-flex h-8 bg-[#fcd95b] rounded-sm items-center px-4 font-black text-[14px] text-black italic">
                                                            1UV
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-white/70 font-heading font-medium text-xs uppercase tracking-widest">
                                                                Speaker
                                                            </p>
                                                            <h3 className="font-display text-4xl md:text-5xl text-white uppercase italic font-black leading-[0.85] tracking-tighter">
                                                                {mockDays[slideIndex].pastor}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Card Footer Info */}
                                                    <div className="flex items-center justify-between text-white text-[10px] font-heading pt-6 border-t border-white/20 uppercase font-black tracking-widest">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>Online</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>DIA {mockDays[slideIndex].dayNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Circular Navigation Arrows - Center Edge Offset */}
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between z-50 pointer-events-none">
                                <button
                                    onClick={prevSlide}
                                    className="w-14 h-14 rounded-full border-2 border-white/60 flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all -ml-7 shadow-2xl bg-black/10 backdrop-blur-md group"
                                >
                                    <ChevronLeft className="w-8 h-8 stroke-[3px] group-active:scale-90 transition-transform" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-14 h-14 rounded-full border-2 border-white/60 flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all -mr-7 shadow-2xl bg-black/10 backdrop-blur-md group"
                                >
                                    <ChevronRight className="w-8 h-8 stroke-[3px] group-active:scale-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
