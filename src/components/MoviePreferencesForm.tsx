import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react";

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
  "Classic Cinema",
  "Foreign",
]

export default function MoviePreferencesForm({ profile, onSave }: { profile: any, onSave: any }) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(profile?.genres || [])
  const [loading, setLoading] = useState(false)

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    }
    else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append("genres", JSON.stringify(selectedGenres))
    const result = await onSave(formData)
    if (result.error) {
      alert(result.message)
    }
    else {
      alert(result.message)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Genres</CardTitle>
        <CardDescription>Select your favorite movie genres to get personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              className="cursor-pointer gap-1 px-3 py-1.5"
              onClick={() => toggleGenre(genre)}
            >
              {genre}
              {selectedGenres.includes(genre) && <X className="h-3 w-3" />}
            </Badge>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  )
}