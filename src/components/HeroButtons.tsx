"use client"

import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroButtons() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
                size="lg"
                className="text-base font-semibold px-8 h-13 gap-2 group"
                asChild
            >
                <Link href="/discover">
                    Start Discovering
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    )
}
