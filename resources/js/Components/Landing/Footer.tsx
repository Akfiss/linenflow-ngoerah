import { Link } from "@inertiajs/react";

export default function Footer() {
    return (
        <footer id="contact" className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link
                            href="/"
                            className="text-3xl font-bold text-white mb-4 block"
                        >
                            Linen<span className="text-teal-400">Flow</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Sistem Informasi Manajemen Linen terintegrasi untuk
                            RS Ngoerah. Dikembangkan untuk mendukung efisiensi
                            dan standar kebersihan linen rumah sakit.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-5 text-lg">
                            Navigasi
                        </h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-teal-400 transition-colors"
                                >
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#features"
                                    className="hover:text-teal-400 transition-colors"
                                >
                                    Fitur
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className="hover:text-teal-400 transition-colors"
                                >
                                    Tentang
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-5 text-lg">
                            Akses Sistem
                        </h4>
                        <Link
                            href={route("login")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-full transition-colors"
                        >
                            Masuk ke Sistem &rarr;
                        </Link>
                        <p className="text-gray-500 text-xs mt-4">
                            Hanya untuk pengguna terotorisasi.
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} LinenFlow App. All
                        rights reserved.
                    </p>
                    <p className="text-gray-600 text-xs">
                        Developed for RS Ngoerah, Bali.
                    </p>
                </div>
            </div>
        </footer>
    );
}
