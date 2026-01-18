import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Clock, MapPin, Calendar, Sparkles } from "lucide-react";
import { mockDays } from "@/mocks/days.mock";
import { useIsMobile } from "@/hooks/use-mobile";

import franciscoVasco from "@/assets/speakers/francisco-vasco.jpg";
import helvecioCoimbra from "@/assets/speakers/helvecio-coimbra.jpg";
import pedroLucasRios from "@/assets/speakers/pedro-lucas-rios.jpg";
import vitorLedo from "@/assets/speakers/vitor-ledo.jpg";
import renanAmaral from "@/assets/speakers/renan-amaral.jpg";
import lucasUrrutty from "@/assets/speakers/lucas-urrutty.jpg";

const speakerImages = [
    franciscoVasco,   // Dia 1
    vitorLedo,        // Dia 2
    franciscoVasco,   // Dia 3
    pedroLucasRios,   // Dia 4
    renanAmaral,      // Dia 5
    lucasUrrutty,     // Dia 6
    helvecioCoimbra,  // Dia 7
];

const uniqueDays = mockDays;

export function ScheduleCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const isMobile = useIsMobile();

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % uniqueDays.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + uniqueDays.length) % uniqueDays.length);

    // Auto-play carousel
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [currentIndex, isPaused]);

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
        <section className="relative min-h-[80vh] flex items-center overflow-hidden py-16 md:py-24"
            style={{ background: 'linear-gradient(135deg, #5b00a3 0%, #3d017a 100%)' }}>
            {/* Grain Texture Overlay */}
            <GrainOverlay />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center">

                    {/* Typography Section */}
                    <div className="w-full mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col select-none items-center text-center"
                        >
                            <h2 className="font-display text-[45px] md:text-[85px] text-white leading-[0.85] tracking-tight mb-2 uppercase italic font-black">
                                VEJA QUEM
                            </h2>
                            <h2 className="font-display text-[45px] md:text-[85px] text-white leading-[0.85] tracking-tight uppercase italic font-black">
                                ESTARÁ CONOSCO
                            </h2>
                        </motion.div>
                    </div>

                    {/* 3D Stacked Carousel */}
                    <div
                        className="relative w-full flex justify-center perspective-1000 py-6"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div className="relative w-full max-w-[450px] md:max-w-[700px] aspect-[1.2/1] preserve-3d">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {[...Array(4)].map((_, i) => {
                                    const slideIndex = (currentIndex + i) % uniqueDays.length;
                                    const isFront = i === 0;

                                    return (
                                        <motion.div
                                            key={slideIndex}
                                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                            animate={{
                                                opacity: 1 - i * 0.25,
                                                x: -i * (isMobile ? 12 : 20),
                                                y: i * (isMobile ? 12 : 20),
                                                scale: 1 - i * 0.08,
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
                                                    alt={uniqueDays[slideIndex].pastor}
                                                    className="w-full h-full object-cover grayscale-[0.2]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#00004dE6] via-transparent to-transparent" />

                                                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <h3 className="font-display text-3xl md:text-5xl text-white uppercase italic font-black leading-[0.85] tracking-tighter">
                                                                {uniqueDays[slideIndex].pastor}
                                                            </h3>
                                                            {uniqueDays[slideIndex].church && (
                                                                <p className="text-white/60 font-heading text-[10px] md:text-sm uppercase tracking-wide">
                                                                    {uniqueDays[slideIndex].church}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Circular Navigation Arrows */}
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between z-50 pointer-events-none">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/60 flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all -ml-8 md:-ml-16 shadow-2xl bg-black/10 backdrop-blur-md group"
                                >
                                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 stroke-[3px] group-active:scale-90 transition-transform" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/60 flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all -mr-8 md:-mr-16 shadow-2xl bg-black/10 backdrop-blur-md group"
                                >
                                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 stroke-[3px] group-active:scale-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
