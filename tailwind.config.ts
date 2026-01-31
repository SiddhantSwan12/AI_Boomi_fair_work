import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Professional Blues/Purples (Trust & Tech)
        primary: {
          900: "#1e1b4b",
          700: "#4338ca",
          500: "#6366f1",
          300: "#a5b4fc",
        },
        // Secondary - Sophisticated Purple (Innovation)
        secondary: {
          700: "#6d28d9",
          500: "#8b5cf6",
        },
        // Neutral - Professional Grays
        neutral: {
          950: "#0f172a",
          900: "#1e293b",
          800: "#334155",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
        // Semantic Colors
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      spacing: {
        xs: "0.5rem",   // 8px
        sm: "0.75rem",  // 12px
        md: "1rem",     // 16px
        lg: "1.5rem",   // 24px
        xl: "2rem",     // 32px
        "2xl": "3rem",  // 48px
        "3xl": "4rem",  // 64px
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        "indigo-sm": "0 1px 2px 0 rgba(99, 102, 241, 0.05)",
        "indigo-md": "0 4px 6px -1px rgba(99, 102, 241, 0.1)",
        "indigo-lg": "0 10px 15px -3px rgba(99, 102, 241, 0.1)",
        "indigo-xl": "0 20px 25px -5px rgba(99, 102, 241, 0.1)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
