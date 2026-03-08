"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToWatchlist, removeFromWatchlist } from "@/app/(pages)/watchlist/actions"
import { toast } from "sonner"

type TrendingWatchlistBtnProps = {
    movieId: number
    initialInWatchlist: boolean
}

export default function TrendingWatchlistBtn({ movieId, initialInWatchlist }: TrendingWatchlistBtnProps) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialInWatchlist)
    const [isPending, startTransition] = useTransition()

    const toggleWatchlist = () => {
        const wasInWatchlist = isInWatchlist
        setIsInWatchlist(!wasInWatchlist)

        startTransition(async () => {
            try {
                if (wasInWatchlist) {
                    await removeFromWatchlist(movieId)
                    toast.success("Removed from watchlist")
                } else {
                    await addToWatchlist(movieId)
                    toast.success("Added to watchlist")
                }
            } catch (err) {
                console.error("Failed to update watchlist:", err)
                setIsInWatchlist(wasInWatchlist)
                toast.error("Failed to update watchlist")
            }
        })
    }

    return (
        <Button
            size="sm"
            className="w-full text-xs font-semibold gap-1"
            variant={isInWatchlist ? "secondary" : "default"}
            onClick={toggleWatchlist}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <Plus
                    className={`w-3.5 h-3.5 transition-transform ${isInWatchlist ? "rotate-45" : ""}`}
                />
            )}
            {isInWatchlist ? "In Watchlist" : "Watchlist"}
        </Button>
    )
}
