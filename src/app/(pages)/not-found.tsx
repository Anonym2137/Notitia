import Link from "next/link"
import { Film, Home, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floating film reels */}
                <div className="absolute top-[10%] left-[10%] w-16 h-16 rounded-full border-2 border-primary/20 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
                <div className="absolute top-[20%] right-[15%] w-24 h-24 rounded-full border-2 border-primary/10 animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }} />
                <div className="absolute bottom-[25%] left-[20%] w-20 h-20 rounded-full border-2 border-primary/15 animate-float" style={{ animationDelay: '2s', animationDuration: '7s' }} />
                <div className="absolute bottom-[15%] right-[10%] w-12 h-12 rounded-full border-2 border-primary/20 animate-float" style={{ animationDelay: '0.5s', animationDuration: '5s' }} />

                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* 404 Number with glitch effect */}
                <div className="relative mb-8 animate-fade-in-up">
                    <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter bg-gradient-to-b from-primary via-primary/60 to-transparent bg-clip-text text-transparent select-none">
                        404
                    </h1>
                    {/* Glow behind the number */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    </div>
                </div>

                {/* Film icon */}
                <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                            <Film className="w-10 h-10 text-primary" />
                        </div>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping opacity-20" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                    Scene Not Found
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                    Looks like this scene was left on the cutting room floor. The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                    <Button asChild size="lg" className="press-effect gap-2 px-8 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="press-effect gap-2 px-8 hover:border-primary/50 transition-all duration-300">
                        <Link href="/">
                            <Search className="w-4 h-4" />
                            Search Movies
                        </Link>
                    </Button>
                </div>

                {/* Decorative film strip */}
                <div className="mt-16 flex items-center justify-center gap-2 opacity-20 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-8 h-6 rounded-sm border border-foreground/40"
                            style={{
                                transform: `rotate(${(i - 3) * 3}deg)`,
                                opacity: 1 - Math.abs(i - 3) * 0.15,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
