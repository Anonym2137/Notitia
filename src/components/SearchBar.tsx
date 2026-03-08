'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from 'use-debounce'

export default function SearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSearch = useDebouncedCallback((searchTerm: string) => {
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("query", searchTerm)
    }
    else {
      params.delete("query")
    }
    router.push(`/search?${params.toString()}`)
  }, 300)

  return (
    <form className="max-w-lg mx-auto items-center flex-1" onSubmit={(e) => e.preventDefault()}>
      <div className="relative top-[45px]">
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-10">
          <svg className="w-4 h-4 text-muted-foreground transition-colors duration-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => { handleSearch(e.target.value) }}
          className="block w-full p-2.5 ps-10 text-sm rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground
            focus:outline-none focus-glow focus:ring-0
            transition-all duration-300 ease-out
            focus:scale-[1.02] focus:shadow-lg"
          placeholder="Search movies, actors, friends"
          required
        />
      </div>
    </form>
  )
}