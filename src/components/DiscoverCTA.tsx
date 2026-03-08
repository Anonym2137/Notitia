import { ArrowRight, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DiscoverCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 lg:py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-float">
              <Shuffle className="w-8 h-8 text-primary" />
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-xl text-balance"
            >
              Not Sure What to Watch?
            </h2>

            <p className="text-muted-foreground text-lg mt-4 max-w-md leading-relaxed">
              Browse through movies and add them to your watchlist.
              Discover your next favorite film.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                size="lg"
                className="text-base font-semibold px-10 h-14 gap-2 group"
                asChild
              >
                <Link href="/discover">
                  Start Browsing
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <span>Browse movies</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>Add to watchlist</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>Tap for details</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}