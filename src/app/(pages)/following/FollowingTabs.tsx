"use client"

import { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Film, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FollowingTabsProps {
    peopleCounts: { actors: number; directors: number }
    moviesCount: number
    reviewsCount: number
    peopleContent: ReactNode
    moviesContent: ReactNode
    reviewsContent: ReactNode
}

export default function FollowingTabs({
    peopleCounts,
    moviesCount,
    reviewsCount,
    peopleContent,
    moviesContent,
    reviewsContent,
}: FollowingTabsProps) {
    return (
        <Tabs defaultValue="people" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sticky top-16 z-10 bg-background/95 backdrop-blur-sm">
                <TabsTrigger value="people" className="gap-1.5 text-xs sm:text-sm">
                    <Users className="h-4 w-4 hidden sm:block" />
                    People
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                        {peopleCounts.actors + peopleCounts.directors}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="movies" className="gap-1.5 text-xs sm:text-sm">
                    <Film className="h-4 w-4 hidden sm:block" />
                    Movies
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                        {moviesCount}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4 hidden sm:block" />
                    Reviews
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                        {reviewsCount}
                    </Badge>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="mt-6 space-y-8">
                {peopleContent}
            </TabsContent>

            <TabsContent value="movies" className="mt-6">
                {moviesContent}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
                {reviewsContent}
            </TabsContent>
        </Tabs>
    )
}
