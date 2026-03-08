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
    title: "Notitia",
    description: "Your movie and shows database",
    icons: {
        icon: '/favicon.ico',
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
