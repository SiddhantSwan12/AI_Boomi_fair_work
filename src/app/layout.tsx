import dynamic from "next/dynamic";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Import Providers with SSR disabled to prevent hydration errors
const Providers = dynamic(
    () => import("@/components/Providers").then((mod) => ({ default: mod.Providers })),
    { ssr: false }
);

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
