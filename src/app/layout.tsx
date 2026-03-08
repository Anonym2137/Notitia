import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./(pages)/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Notitia | Movie & Show Database",
    description: "Your ultimate movie and show database. Discover, track, and share your favorite films and series.",
    keywords: ["movies", "tv shows", "database", "notitia", "tracker", "watchlist"],
    openGraph: {
        title: "Notitia | Movie & Show Database",
        description: "Your ultimate movie and show database. Discover, track, and share your favorite films and series.",
        siteName: "Notitia",
        type: "website",
    },
    icons: {
        icon: '/favicon.ico',
    },
    verification: {
        google: '3kqznu8yBWlz5VM0hm-u5dLqjx2_amTvRFrPepyN5fo',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased dark container min-h-screen min-w-full`}
            >
                {children}
            </body>
        </html>
    );
}
