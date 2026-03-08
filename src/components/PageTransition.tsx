"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const NAV_ORDER = ["/", "/following", "/discover", "/watchlist", "/profile"]

function getNavIndex(pathname: string): number {
    const idx = NAV_ORDER.indexOf(pathname)
    return idx === -1 ? -1 : idx
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const prevIndexRef = useRef<number>(getNavIndex(pathname))
    const [direction, setDirection] = useState<"left" | "right" | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const currentIndex = getNavIndex(pathname)
        const prevIndex = prevIndexRef.current

        if (currentIndex !== -1 && prevIndex !== -1 && currentIndex !== prevIndex) {
            setDirection(currentIndex > prevIndex ? "left" : "right")
            setIsAnimating(true)

            const timer = setTimeout(() => {
                setIsAnimating(false)
                setDirection(null)
            }, 300)

            prevIndexRef.current = currentIndex
            return () => clearTimeout(timer)
        }

        prevIndexRef.current = currentIndex
    }, [pathname])

    return (
        <div
            className={isAnimating && direction ? `page-slide-in-from-${direction}` : ""}
            style={{ minHeight: "100vh" }}
        >
            {children}
        </div>
    )
}
