'use client'

import { toggleWatchlist } from "@/app/(pages)/movies/[slug]/actions"
import { useCallback, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function WatchlistBtn({ movieId, isInWatchlist, className = "", isLoggedIn = false }: { movieId: number, isInWatchlist: boolean, className?: string, isLoggedIn?: boolean }) {
  const [isAdded, setIsAdded] = useState(isInWatchlist)
  const [isPending, startTransition] = useTransition()
  const [justToggled, setJustToggled] = useState(false)
  const router = useRouter()

  const handleClick = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await toggleWatchlist(movieId)
        setIsAdded(result)
        if (result) {
          setJustToggled(true)
          setTimeout(() => setJustToggled(false), 600)
        }
      }
      catch (err) {
        console.error(err)
      }
    })
  }, [movieId])

  if (!isLoggedIn) {
    return (
      <Button className={`h-10 transition-all duration-300 hover:cursor-pointer press-effect hover:shadow-lg hover:shadow-primary/20 ${className}`} onClick={() => toast.warning("You must be logged in, To add movies into watchlist", { action: { label: "Log in", onClick: () => router.push('/login') } })}>
        <Plus className="w-4 h-4 mr-2" />
        Add to Watchlist
      </Button>
    )
  }

  return (
    <Button
      variant={isAdded ? 'secondary' : 'default'}
      className={`h-10 transition-all duration-300 hover:cursor-pointer press-effect hover:shadow-lg ${isAdded ? 'hover:shadow-primary/10' : 'hover:shadow-primary/20'} ${justToggled ? 'animate-success-ripple' : ''} ${className}`}
      onClick={handleClick}
      disabled={isPending}
    >
      {isAdded ? (
        <>
          <Check className={`w-4 h-4 mr-2 ${justToggled ? 'animate-check-pop' : ''}`} />
          On Watchlist
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
          Add to Watchlist
        </>
      )}
    </Button>
  )
}