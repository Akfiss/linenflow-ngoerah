import { Head } from "@inertiajs/react";
import HeroSection from "@/Components/Landing/HeroSection";
import FeatureSection from "@/Components/Landing/FeatureSection";
import AboutSection from "@/Components/Landing/AboutSection";
import Footer from "@/Components/Landing/Footer";

export default function LandingPage() {
    return (
        <>
            <Head title="Welcome to LinenFlow" />
            <main className="bg-white min-h-screen selection:bg-sky-500/20 selection:text-sky-800 scroll-smooth">
                <HeroSection />
                <FeatureSection />
                <AboutSection />
                <Footer />
            </main>
        </>
    );
}
