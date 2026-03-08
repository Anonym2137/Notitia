"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { toggleFollowActor, toggleFollowDirector } from "@/app/(pages)/following/actions"
import { toast } from "sonner"

interface FollowPersonButtonProps {
    personId: number
    type: "actor" | "director"
    initialFollowed: boolean
    size?: "sm" | "default" | "lg" | "icon"
    showLabel?: boolean
    label?: string
    followingLabel?: string
}

export default function FollowPersonButton({
    personId,
    type,
    initialFollowed,
    size = "sm",
    showLabel = true,
    label,
    followingLabel,
}: FollowPersonButtonProps) {
    const [isFollowed, setIsFollowed] = useState(initialFollowed)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const result = type === "actor"
                ? await toggleFollowActor(personId)
                : await toggleFollowDirector(personId)
            setIsFollowed(result)
            toast.success(result ? `Following ${type}!` : `Unfollowed ${type}`)
        } catch (error) {
            console.error(`Error toggling ${type} follow:`, error)
            toast.error("You must be logged in")
        }
        setIsLoading(false)
    }

    return (
        <Button
            size={size}
            variant={isFollowed ? "outline" : "default"}
            className={`gap-1.5 text-xs transition-all duration-200 hover:cursor-pointer ${isFollowed
                ? "border-primary/30 text-primary hover:text-destructive hover:border-destructive/30"
                : ""
                }`}
            disabled={isLoading}
            onClick={handleToggle}
        >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isFollowed ? (
                <>
                    <UserMinus className="h-3.5 w-3.5" />
                    {showLabel && (followingLabel || "Following")}
                </>
            ) : (
                <>
                    <UserPlus className="h-3.5 w-3.5" />
                    {showLabel && (label || "Follow")}
                </>
            )}
        </Button>
    )
}
