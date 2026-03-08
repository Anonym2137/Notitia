import { Film } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className="text-xl font-bold text-foreground"
            >
              Notitia
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Discover movies you&apos;ll love. Browse, save, and watch.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}