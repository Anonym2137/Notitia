import Image from "next/image";
import { cn } from "@/lib/utils";
import { Actor } from "@/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { VscStarEmpty, VscThumbsup } from "react-icons/vsc";
import CarouselElement from "./CarouselElement";
import { CarouselItem } from "./ui/carousel";

export default function CastCard({ actors, movie }: { actors: Actor[], movie: string }) {
  return (
    <CarouselElement title="Cast" link={`/${movie}/cast}`} className="gap-5">
      {actors.map((actor, index) => (
        <CarouselItem key={index}>
          <div className="group relative bg-slate-800/60 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
            <Link href={`/people/${actor.id}?type=actor`}>
              <Image height={252} width={320} className="w-full h-80 object-cover object-top" src={actor.photo_url} alt={actor.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            </Link>
            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
              <h3 className="text-2xl font-bold mb-1">{actor.name}</h3>
              <div className="flex items-center text-sm text-gray-300 space-x-4 mb-4">
                <div className="flex items-center">
                  <VscStarEmpty />
                  <span>7.3</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-film text-gray-400 mr-1"></i>
                  <span>{actor.role}</span>
                </div>
              </div>
              <Button className="w-full bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg lg:opacity-0 lg:group-hover:opacity-100 lg:transform lg:group-hover:translate-y-0 lg:translate-y-4 lg:transition-all lg:duration-300 lg:ease-in-out">
                <VscThumbsup size={16} />
                Add to Favourite
              </Button>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselElement >
  )
}