import { motion } from "framer-motion";

const features = [
    {
        image: "/images/landing/feature_tracking.png",
        title: "Pelacakan Real-Time",
        description:
            "Pantau posisi dan status setiap linen secara langsung. Dari ruangan pasien hingga proses pencucian.",
    },
    {
        image: "/images/landing/feature_analytics.png",
        title: "Analitik Mendalam",
        description:
            "Dashboard interaktif dengan laporan statistik penggunaan, performa, dan tren stok linen.",
    },
    {
        image: "/images/landing/feature_hygiene.png",
        title: "Standar Higienitas",
        description:
            "Protokol sterilisasi terpantau untuk menjamin kualitas dan kebersihan linen medis.",
    },
];

export default function FeatureSection() {
    return (
        <section
            id="features"
            className="py-24 md:py-32 bg-white relative overflow-hidden"
        >
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                    <motion.span
                        className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Mengapa LinenFlow?
                    </motion.span>
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold text-gray-800 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Fitur{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
                            Unggulan
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-gray-500 text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Dirancang khusus untuk kebutuhan manajemen linen rumah
                        sakit skala besar, dengan fokus pada efisiensi dan
                        keamanan.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-sky-50/30 border border-gray-100 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-300"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -8 }}
                        >
                            <div className="mb-6 w-20 h-20 rounded-2xl bg-white shadow-lg shadow-gray-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-14 h-14 object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-sky-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
