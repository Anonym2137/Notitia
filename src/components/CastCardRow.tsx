import { Actor } from "@/types";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import Link from "next/link";
import FollowPersonButton from "./FollowPersonButton";

export default function CastCardRow({ actor, isFollowed = false }: { actor: Actor; isFollowed?: boolean }) {
  return (
    <Card className="group overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link href={`/people/${actor.id}?type=actor`} className="relative w-16 h-16 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={actor.photo_url || "/placeholder.svg"}
              alt={actor.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </Link>
          <div className="flex-1">
            <Link href={`/people/${actor.id}?type=actor`} className="hover:text-primary transition-colors duration-200">
              <h3 className="font-semibold text-lg">{actor.name}</h3>
            </Link>
          </div>
          <FollowPersonButton
            personId={actor.id}
            type="actor"
            initialFollowed={isFollowed}
          />
        </div>
      </CardContent>
    </Card>
  )
}