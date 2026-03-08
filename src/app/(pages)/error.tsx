'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCcw, Home, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [showDetails, setShowDetails] = useState(false)
    const [glitchActive, setGlitchActive] = useState(true)

    useEffect(() => {
        console.error(error)
        const timer = setTimeout(() => setGlitchActive(false), 2000)
        return () => clearTimeout(timer)
    }, [error])

    return (
        <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Red warning gradient orbs */}
                <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-destructive/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-destructive/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

                {/* Scanlines effect */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 4px)`,
                    }}
                />

                {/* Floating warning symbols */}
                <div className="absolute top-[15%] left-[8%] text-destructive/10 animate-float" style={{ animationDuration: '7s' }}>
                    <AlertTriangle className="w-12 h-12" />
                </div>
                <div className="absolute top-[25%] right-[12%] text-destructive/8 animate-float" style={{ animationDelay: '1.5s', animationDuration: '6s' }}>
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="absolute bottom-[20%] left-[15%] text-destructive/10 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }}>
                    <AlertTriangle className="w-10 h-10" />
                </div>
            </div>

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* Error icon with pulse */}
                <div className="flex justify-center mb-8 animate-fade-in-up">
                    <div className="relative">
                        <div className={`w-24 h-24 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center transition-all duration-500 ${glitchActive ? 'animate-bounce-in' : ''}`}>
                            <AlertTriangle className="w-12 h-12 text-destructive" />
                        </div>
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 rounded-2xl border border-destructive/20 animate-ping opacity-20" />
                        <div className="absolute -inset-2 rounded-2xl border border-destructive/10 animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
                    </div>
                </div>

                {/* Error title with glitch */}
                <div className="relative mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                        Something Went Wrong
                    </h1>
                </div>

                {/* Error message */}
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                    An unexpected error occurred. Don&apos;t worry, our crew is on it. You can try again or head back to safety.
                </p>

                {/* Error details toggle */}
                {error.message && (
                    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {showDetails ? 'Hide' : 'Show'} Error Details
                        </button>
                        {showDetails && (
                            <Card className="mt-3 p-4 text-left bg-card/50 backdrop-blur-sm border-destructive/20 animate-scale-in">
                                <p className="text-sm font-mono text-muted-foreground break-all">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs font-mono text-muted-foreground/60 mt-2">
                                        Digest: {error.digest}
                                    </p>
                                )}
                            </Card>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="press-effect gap-2 px-8 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" size="lg" className="press-effect gap-2 px-8 hover:border-primary/50 transition-all duration-300">
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                {/* Decorative broken film strip */}
                <div className="mt-16 flex items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-6 rounded-sm border transition-all duration-300 ${i === 3
                                    ? 'border-destructive/40 bg-destructive/5 rotate-12'
                                    : 'border-foreground/10'
                                }`}
                            style={{
                                transform: `rotate(${i === 3 ? 12 : (i - 3) * 2}deg) ${i === 3 ? 'translateY(-4px)' : ''}`,
                                opacity: i === 3 ? 0.8 : 0.15,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
