import React from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function CarouselElement({ title, link = "/", className, children }: { title: string, link?: string, className?: string, children: React.ReactNode }) {
  return (
    <div className=" w-full max-w-full flex flex-col px-2 items-center">
      <div className="w-full h-full flex mb-4 pl-[60px]">
        <Link href={link} className="text-2xl font-semibold animated-underline hover:text-primary transition-colors duration-300">
          {title}
        </Link>
      </div>
      <Carousel opts={{ align: "start" }} className={cn("flex items-center", className)}>
        <CarouselPrevious className="left-4 hidden sm:flex hover:bg-primary hover:text-primary-foreground transition-all duration-200 press-effect" />
        <CarouselContent className="mx-4 sm:mx-0">
          {children}
        </CarouselContent>
        <CarouselNext className="right-4 hidden sm:flex hover:bg-primary hover:text-primary-foreground transition-all duration-200 press-effect" />
      </Carousel>
    </div >
  )
}