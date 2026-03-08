import { Zap, Smile, Theater, Ghost, Rocket, Heart, AlertTriangle, Sparkles } from "lucide-react"
import Link from "next/link"
import { GENRES } from "@/lib/mock-data"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Zap, Smile, Theater, Ghost, Rocket, Heart, AlertTriangle, Sparkles}

export default function GenresSection() {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold text-foreground"
          >
            Browse by Genre
          </h2>
          <p className="text-muted-foreground mt-2">
            Find movies that match your mood
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GENRES.map((genre, index) => {
            const Icon = iconMap[genre.icon] || Zap
            return (
              <Link
                key={genre.name}
                href={`/search?genres=${encodeURIComponent(genre.name)}`}
                className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{genre.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {genre.count.toLocaleString()} movies
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}