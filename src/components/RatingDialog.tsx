"use client"

import { useState } from "react"
import { Star, Facebook, Twitter, Mail, Link2, Loader2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { RatingDialogProps } from "@/types"
import { cn } from "@/lib/utils"

export function RatingDialog({ movieTitle, movieId }: RatingDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState("")
  const [watched, setWatched] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [lastClickedStar, setLastClickedStar] = useState(0)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Rating required", {
        description: "Please select a rating before submitting.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/movie/post_user_rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          rating,
          review: review || undefined,
          watched,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setJustSubmitted(true)
        toast.success("Rating saved! ⭐", {
          description: `Your review of ${rating} stars was saved.`,
        })
        setTimeout(() => {
          setOpen(false)
          setJustSubmitted(false)
          // Reset form
          setRating(0)
          setReview("")
          setWatched(false)
        }, 1200)
      } else {
        toast.error("Error", {
          description: result.error || "Couldn't save your review",
        })
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast.error("Error", {
        description: "An unknown error occurred while submitting your review.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/movie/${movieId}`
    const shareText = `Check out ${movieTitle}! I rated it ${rating} stars.`

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        )
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(movieTitle)}&body=${encodeURIComponent(shareText + " " + shareUrl)}`
        break
      case "copy":
        navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied!", {
          description: "Movie link has been copied to clipboard.",
        })
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 press-effect hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 group">
          <Star className="w-4 h-4 transition-transform duration-300 group-hover:rotate-[72deg] group-hover:scale-110" /> Rate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">{movieTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex flex-col items-center gap-1">
              <Label className="text-lg font-medium text-muted-foreground">Rate this movie</Label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[2, 4, 6, 8, 10].map((starIndex) => {
                  const filled = (hoverRating || rating) >= starIndex
                  const halfFilled = (hoverRating || rating) >= starIndex - 1 && !filled

                  return (
                    <button
                      key={starIndex}
                      type="button"
                      className={cn(
                        "relative p-1 transition-all duration-200 hover:scale-125 focus:outline-none",
                        lastClickedStar === starIndex ? "animate-star-pop" : ""
                      )}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const isHalf = e.clientX - rect.left < rect.width / 2
                        const newRating = starIndex - (isHalf ? 1 : 0)
                        setRating(newRating)
                        setLastClickedStar(starIndex)
                        setTimeout(() => setLastClickedStar(0), 300)
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const isHalf = e.clientX - rect.left < rect.width / 2
                        setHoverRating(starIndex - (isHalf ? 1 : 0))
                      }}
                    >
                      <div className="relative">
                        <Star
                          className={cn(
                            "w-10 h-10 transition-all duration-200",
                            filled
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                              : "text-muted-foreground hover:text-yellow-400/50"
                          )}
                        />
                        {halfFilled && (
                          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                            <Star className="w-10 h-10 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              <span className="h-8 text-xl font-bold text-foreground transition-all">
                {hoverRating || rating ? (hoverRating || rating).toFixed(1) : "0.0"}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 10</span>
              </span>
            </div>
          </div>

          <Separator />

          {/* Review Section */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-base font-semibold">
              Write a Review (Optional)
            </Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this movie..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="resize-none focus-glow transition-all duration-300"
            />
            <p className="text-xs text-muted-foreground">{review.length} / 500 characters</p>
          </div>

          <Separator />

          {/* Watched Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Mark as Watched</Label>
              <p className="text-sm text-muted-foreground">Add this movie to your watched list</p>
            </div>
            <Switch checked={watched} onCheckedChange={setWatched} />
          </div>

          <Separator />

          {/* Share Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Share Your Rating</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-col h-auto py-3 gap-2 bg-transparent press-effect hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="w-5 h-5" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-col h-auto py-3 gap-2 bg-transparent press-effect hover:bg-sky-500/10 hover:border-sky-500/40 transition-all duration-200"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="w-5 h-5" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-col h-auto py-3 gap-2 bg-transparent press-effect hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-200"
                onClick={() => handleShare("email")}
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-col h-auto py-3 gap-2 bg-transparent press-effect hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
                onClick={() => handleShare("copy")}
              >
                <Link2 className="w-5 h-5" />
                <span className="text-xs">Copy Link</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 press-effect">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn(
              "flex-1 press-effect transition-all duration-300",
              justSubmitted
                ? "bg-green-500 hover:bg-green-600 animate-success-ripple"
                : "hover:shadow-lg hover:shadow-primary/20"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : justSubmitted ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-bounce-in" />
                Saved!
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}