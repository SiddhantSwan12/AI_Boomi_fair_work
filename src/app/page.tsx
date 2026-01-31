"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import {
    Search, Shield, Brain, Users, Scale, Star, CheckCircle,
    ArrowRight, Briefcase, ChevronRight, Play, Zap, Lock,
    TrendingUp, Award, Clock, Code, Palette, Megaphone, Cpu,
    Grid3X3, CheckCircle2, DollarSign, Smile
} from "lucide-react";

// Category navigation items
const categoryNav = [
    { name: "Trending", icon: "🔥", active: false },
    { name: "Smart Contracts", icon: null, active: false },
    { name: "AI & ML", icon: null, active: false },
    { name: "Web3 Apps", icon: null, active: false },
    { name: "Design", icon: null, active: false },
    { name: "Writing", icon: null, active: false },
    { name: "Business", icon: null, active: false },
];

const categories = [
    {
        name: "Web Development",
        image: "/images/category-webdev.png",
        icon: Code,
    },
    {
        name: "AI Services",
        image: "/images/category-ai.png",
        icon: Cpu,
    },
    {
        name: "Graphic Design",
        image: "/images/category-design.png",
        icon: Palette,
    },
    {
        name: "Digital Marketing",
        image: "/images/category-marketing.png",
        icon: Megaphone,
    },
];

const features = [
    {
        icon: Grid3X3,
        title: "Access top talent",
        description: "across 100+ categories",
    },
    {
        icon: CheckCircle2,
        title: "Enjoy easy matching",
        description: "with smart recommendations",
    },
    {
        icon: Clock,
        title: "Get quality work",
        description: "done quickly and on budget",
    },
    {
        icon: DollarSign,
        title: "Only pay when happy",
        description: "with secure escrow",
    },
];

const stats = [
    { value: "2.5%", label: "Platform Fee" },
    { value: "$0", label: "Hidden Charges" },
    { value: "24h", label: "Avg Dispute Resolution" },
    { value: "100%", label: "Transparent" },
];

const testimonials = [
    {
        quote: "Finally, a platform that doesn't take 20% of my earnings. The escrow system gives me peace of mind.",
        author: "Sarah Chen",
        role: "Full-Stack Developer",
        avatar: "👩‍💻",
    },
    {
        quote: "The AI dispute resolution saved me weeks of back-and-forth. Fair and fast.",
        author: "Marcus Johnson",
        role: "UI/UX Designer",
        avatar: "👨‍🎨",
    },
    {
        quote: "Web3 freelancing done right. Lower fees, better protection, transparent process.",
        author: "Elena Rodriguez",
        role: "Smart Contract Auditor",
        avatar: "👩‍🔬",
    },
];

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section with Image */}
            <section className="relative overflow-hidden">
                {/* Background with gradient overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero.png"
                        alt="Professionals collaborating"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003912]/95 via-[#003912]/80 to-transparent" />
                </div>

                <div className="relative z-10 container-custom py-24 lg:py-36">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <div className="animate-fade-in inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-white/90 text-sm font-medium">Now on Polygon Network</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                            Find the perfect{" "}
                            <span className="text-gradient">freelance</span>{" "}
                            services for your business
                        </h1>

                        <p className="animate-fade-in-up animate-fade-in-delay-1 text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                            Secure escrow payments. AI-powered dispute resolution.
                            The fairest freelance platform on Web3.
                        </p>

                        {/* Search Bar */}
                        <div className="animate-fade-in-up animate-fade-in-delay-2 mb-6">
                            <div className="search-bar max-w-xl">
                                <Search className="w-5 h-5 text-gray-400 ml-4" />
                                <input
                                    type="text"
                                    placeholder='Try "Smart Contract Development"'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="text-gray-900"
                                />
                                <Link href="/jobs">
                                    <button className="flex items-center gap-2">
                                        Search
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="animate-fade-in-up animate-fade-in-delay-3 flex flex-wrap items-center gap-3">
                            <span className="text-gray-400 text-sm">Popular:</span>
                            {["Smart Contracts", "Web3 Apps", "AI Agents", "DeFi"].map((tag) => (
                                <Link
                                    key={tag}
                                    href="/jobs"
                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white hover:bg-white/20 transition-all"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
            </section>

            {/* Trusted By Section */}
            <section className="py-6 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Trusted by leading companies</span>
                        {["Meta", "Google", "Netflix", "Spotify", "Airbnb"].map((company) => (
                            <span
                                key={company}
                                className="trust-logo text-gray-300 text-xl font-bold tracking-wide hover:text-gray-600 transition-all cursor-default"
                            >
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promo Section - Rose/Pink (Vibe Coding style) */}
            <section className="container-custom py-10">
                <div className="promo-section promo-section-rose relative overflow-hidden">
                    {/* Video Background */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/images/promo-video.mp4" type="video/mp4" />
                    </video>

                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c0747f]/80 to-[#b56576]/60" />

                    <div className="grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12 relative z-10">
                        {/* Left Content */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                                Need help with<br />Web3 development?
                            </h2>
                            <p className="text-white/80 mb-6 text-lg">
                                Get matched with the right expert to keep building and scaling your project
                            </p>
                            <button className="btn-white-outline">
                                Find an expert
                            </button>
                        </div>

                        {/* Right Image - Keep for visual balance */}
                        <div className="relative h-64 lg:h-80">
                            <Image
                                src="/images/promo-workspace.png"
                                alt="Web3 Development Workspace"
                                fill
                                className="object-contain object-right"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section - Minimal Cards */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                        Trusted Services
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link key={category.name} href="/jobs" className="minimal-card group">
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#6B5DD3] transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Make it Happen Section */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="container-custom">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">
                        Make it all happen with freelancers
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {features.map((feature, index) => (
                            <div key={index} className="text-left">
                                <div className="minimal-card-icon w-12 h-12 mb-4">
                                    <feature.icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/jobs" className="btn-black">
                            Join now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Promo Section - Cream (Logo Maker style) */}
            <section className="container-custom py-10">
                <div className="promo-section promo-section-cream">
                    <div className="grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
                        {/* Left Content */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl font-bold text-gray-900">FairWork</span>
                                <span className="text-xl font-light text-gray-500">secure escrow.</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Secure payments<br />
                                <span className="text-[#6B5DD3]">in seconds</span>
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Smart contract escrow. Funds release when you&apos;re happy.
                            </p>
                            <button className="btn-black">
                                Try Secure Escrow
                            </button>
                        </div>

                        {/* Right Image */}
                        <div className="relative h-64 lg:h-80">
                            <Image
                                src="/images/colorful-cans.png"
                                alt="Secure Escrow Features"
                                fill
                                className="object-contain object-right"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Simple, secure, and transparent from start to finish
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#6B5DD3] via-[#8B7FE8] to-[#6B5DD3]" />

                        {[
                            { step: "1", title: "Post a Job", desc: "Describe your project and set your budget", icon: Briefcase },
                            { step: "2", title: "Fund Escrow", desc: "Deposit USDC into secure smart contract", icon: Lock },
                            { step: "3", title: "Get Work Done", desc: "Freelancer delivers, you review", icon: Clock },
                            { step: "4", title: "Release Payment", desc: "Approve and funds release instantly", icon: Zap },
                        ].map((item) => (
                            <div key={item.step} className="text-center relative">
                                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#6B5DD3] to-[#8B7FE8] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            What success on FairWork looks like
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.author}
                                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    &quot;{testimonial.quote}&quot;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 gradient-hero relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="relative container-custom text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to work fairly?
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-xl mx-auto text-lg">
                        Connect your wallet and experience the future of freelancing.
                        No signup. No fees until you get paid.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/jobs/create" className="btn-primary !bg-white !text-[#003912] hover:!bg-gray-100 flex items-center gap-2">
                            Post a Job <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/jobs" className="btn-outline !border-white !text-white hover:!bg-white/10">
                            Browse Opportunities
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-16">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-[#6B5DD3] rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white font-bold text-xl">FairWork</span>
                            </Link>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                The fairest freelance platform. Built on Polygon, powered by AI.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Platform</h4>
                            <div className="space-y-3 text-sm">
                                <Link href="/jobs" className="block hover:text-white transition-colors">Browse Jobs</Link>
                                <Link href="/jobs/create" className="block hover:text-white transition-colors">Post a Job</Link>
                                <Link href="/disputes" className="block hover:text-white transition-colors">Dispute Center</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Resources</h4>
                            <div className="space-y-3 text-sm">
                                <a href="#" className="block hover:text-white transition-colors">How It Works</a>
                                <a href="#" className="block hover:text-white transition-colors">Smart Contracts</a>
                                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Built With</h4>
                            <div className="space-y-3 text-sm">
                                <a href="https://polygon.technology" target="_blank" rel="noopener" className="block hover:text-white transition-colors">Polygon Network</a>
                                <a href="https://openai.com" target="_blank" rel="noopener" className="block hover:text-white transition-colors">OpenAI</a>
                                <a href="https://supabase.com" target="_blank" rel="noopener" className="block hover:text-white transition-colors">Supabase</a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm">© 2024 FairWork. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Deployed on Polygon Amoy Testnet
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
