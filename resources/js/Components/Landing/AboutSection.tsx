import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section
            id="about"
            className="py-24 md:py-32 bg-gradient-to-b from-white to-sky-50 relative overflow-hidden"
        >
            {/* Decorative Shapes */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-20 w-40 h-40 border-2 border-dashed border-sky-200 rounded-full opacity-50 pointer-events-none" />
            <div className="absolute top-1/4 right-10 w-24 h-24 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Image Side */}
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-sky-300/20 to-teal-300/20 rounded-3xl blur-xl"></div>
                            <img
                                src="/images/landing/about.png"
                                alt="Tentang LinenFlow"
                                className="relative rounded-3xl shadow-2xl shadow-sky-200/40 border border-white/50"
                            />
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 font-semibold text-sm mb-4">
                            Tentang Kami
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                            Solusi Digital untuk{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
                                RS Ngoerah
                            </span>
                        </h2>
                        <div className="space-y-5 text-gray-500 text-lg leading-relaxed">
                            <p>
                                LinenFlow adalah solusi digital komprehensif
                                yang dikembangkan khusus untuk Divisi Binatu RS
                                Ngoerah. Sistem ini mentransformasi pengelolaan
                                linen manual menjadi proses digital yang
                                terukur.
                            </p>
                            <p>
                                Dengan fokus pada efisiensi, transparansi, dan
                                kemudahan penggunaan, LinenFlow memastikan
                                ketersediaan linen bersih selalu terjaga,
                                mendukung operasional medis yang krusial.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6 mt-10">
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50">
                                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500 mb-1">
                                    24/7
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                    Monitoring Aktif
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50">
                                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500 mb-1">
                                    100%
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                    Digital Tracking
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
