import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section
            ref={targetRef}
            className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white"
        >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 bg-gradient-to-t from-sky-50/50 to-transparent" />
            </div>

            {/* Navigation Bar */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-sky-600">
                        Linen<span className="text-teal-500">Flow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
                        <a
                            href="#features"
                            className="hover:text-sky-600 transition-colors"
                        >
                            Fitur
                        </a>
                        <a
                            href="#about"
                            className="hover:text-sky-600 transition-colors"
                        >
                            Tentang
                        </a>
                        <a
                            href="#contact"
                            className="hover:text-sky-600 transition-colors"
                        >
                            Kontak
                        </a>
                    </div>
                    <Link href={route("login")}>
                        <Button className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-6 shadow-md shadow-sky-200 transition-all hover:shadow-lg hover:shadow-sky-300">
                            Masuk
                        </Button>
                    </Link>
                </div>
            </motion.nav>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-6 pt-32 md:pt-40 pb-20">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                    {/* Text Content */}
                    <motion.div
                        className="lg:w-1/2 text-center lg:text-left"
                        style={{ opacity }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-semibold text-sm mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            Sistem Terintegrasi
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Manajemen Linen
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
                                Rumah Sakit Modern
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Pantau sirkulasi linen dari kotor hingga bersih
                            dengan presisi tinggi. Digitalisasi proses,
                            tingkatkan efisiensi, dan jaga standar kebersihan.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Link href={route("login")}>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-sky-300/50 transition-all hover:scale-105 hover:shadow-xl"
                                >
                                    Mulai Sekarang{" "}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-gray-300 text-gray-600 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
                            >
                                Pelajari Lebih Lanjut
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        className="lg:w-1/2"
                        style={{ y }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="relative">
                            {/* Decorative ring */}
                            <div className="absolute -inset-4 md:-inset-8 border-2 border-dashed border-sky-200 rounded-3xl opacity-50"></div>
                            <img
                                src="/images/landing/hero.png"
                                alt="LinenFlow Dashboard Illustration"
                                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl shadow-sky-200/50"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <a
                        href="#features"
                        className="flex flex-col items-center text-gray-400 hover:text-sky-600 transition-colors"
                    >
                        <span className="text-xs font-medium mb-1">Scroll</span>
                        <ChevronDown className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
