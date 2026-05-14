"use client";

import dynamic from "next/dynamic";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import HeroSection from "@/components/landing/sections/HeroSection";
import ManifestoSection from "@/components/landing/sections/ManifestoSection";
import CosmosValuePropSection from "@/components/landing/sections/CosmosValuePropSection";
import MetricsSection from "@/components/landing/sections/MetricsSection";
import InstitutionalSection from "@/components/landing/sections/InstitutionalSection";
import FeatureChipsSection from "@/components/landing/sections/FeatureChipsSection";
import ComparisonSection from "@/components/landing/sections/ComparisonSection";
import ArchitectureSection from "@/components/landing/sections/ArchitectureSection";
import CTAFooterSection from "@/components/landing/sections/CTAFooterSection";
import PromoCardsSection from "@/components/landing/sections/PromoCardsSection";
import CategoryIconsSection from "@/components/landing/sections/CategoryIconsSection";
import TechStripSection from "@/components/landing/sections/TechStripSection";
import CosmosGallerySection from "@/components/landing/sections/CosmosGallerySection";

const SmoothScrollProvider = dynamic(
    () => import("@/components/SmoothScrollProvider"),
    { ssr: false }
);

export default function LandingPage() {
    return (
        <SmoothScrollProvider>
            <div className="min-h-screen">
                <LandingNavbar />

                <main>
                    <div className="relative overflow-hidden" style={{ zIndex: 1 }}>
                        <HeroSection />
                    </div>

                    <ManifestoSection />
                    <CosmosValuePropSection />

                    <TechStripSection />
                    <CategoryIconsSection />
                    <CosmosGallerySection />
                    <MetricsSection />
                    <PromoCardsSection />
                    <InstitutionalSection />
                    <FeatureChipsSection />
                    <ArchitectureSection />
                    <ComparisonSection />
                    <CTAFooterSection />
                </main>

                <LandingFooter />
            </div>
        </SmoothScrollProvider>
    );
}
