"use client"

import { Home, Heart, Shuffle, Bookmark, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/following", icon: Heart, label: "Following" },
    { href: "/discover", icon: Shuffle, label: "Discover", isCenter: true },
    { href: "/watchlist", icon: Bookmark, label: "Watchlist" },
    { href: "/profile", icon: User, label: "Profile" },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Frosted glass background */}
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />

            <div className="relative flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom,8px)] pt-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-3 flex flex-col items-center"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                                    "bg-primary text-primary-foreground",
                                    "hover:shadow-primary/40 hover:shadow-xl hover:scale-105 active:scale-95"
                                )}>
                                    <Icon className={cn(
                                        "w-6 h-6",
                                        isActive && "fill-current"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] mt-1 font-medium",
                                    "text-primary"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5 transition-all duration-200",
                                isActive && "scale-110 fill-current"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
