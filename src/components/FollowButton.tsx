'use client'

import { useCallback, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck } from "lucide-react"
import { toggleFollow } from "@/app/(pages)/profile/[userId]/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function FollowButton({
    userId,
    isFollowing,
    isLoggedIn = false,
}: {
    userId: string
    isFollowing: boolean
    isLoggedIn?: boolean
}) {
    const [following, setFollowing] = useState(isFollowing)
    const [isPending, startTransition] = useTransition()
    const [justToggled, setJustToggled] = useState(false)
    const router = useRouter()

    const handleClick = useCallback(() => {
        if (!isLoggedIn) {
            toast.warning("You must be logged in to follow users", {
                action: {
                    label: "Log in",
                    onClick: () => router.push('/login'),
                },
            })
            return
        }

        startTransition(async () => {
            try {
                const result = await toggleFollow(userId)
                setFollowing(result)
                if (result) {
                    setJustToggled(true)
                    setTimeout(() => setJustToggled(false), 600)
                    toast.success("Following!")
                } else {
                    toast.success("Unfollowed")
                }
            } catch (err) {
                console.error(err)
                toast.error("Something went wrong")
            }
        })
    }, [userId, isLoggedIn, router])

    return (
        <Button
            variant={following ? "secondary" : "default"}
            className={`h-10 transition-all duration-300 hover:cursor-pointer press-effect hover:shadow-lg ${following ? "hover:shadow-primary/10" : "hover:shadow-primary/20"} ${justToggled ? "animate-success-ripple" : ""}`}
            onClick={handleClick}
            disabled={isPending}
        >
            {following ? (
                <>
                    <UserCheck className={`w-4 h-4 mr-2 ${justToggled ? "animate-check-pop" : ""}`} />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                </>
            )}
        </Button>
    )
}
