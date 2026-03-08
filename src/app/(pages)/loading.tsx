export default function HomeLoading() {
    return (
        <div className="flex flex-col pb-4 animate-pulse">
            {/* Hero skeleton */}
            <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center overflow-hidden pt-16">
                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-20 py-8 sm:py-0">
                    <div className="flex-1 max-w-2xl space-y-6 text-center lg:text-left">
                        <div className="space-y-3">
                            <div className="h-12 sm:h-16 lg:h-20 bg-secondary/60 rounded-2xl w-3/4 mx-auto lg:mx-0" />
                            <div className="h-10 sm:h-14 lg:h-16 bg-primary/20 rounded-2xl w-1/2 mx-auto lg:mx-0" />
                        </div>
                        <div className="h-5 bg-secondary/40 rounded-lg w-2/3 mx-auto lg:mx-0" />
                        <div className="flex justify-center lg:justify-start gap-4 pt-2">
                            <div className="h-14 w-40 bg-primary/20 rounded-xl" />
                            <div className="h-14 w-36 bg-secondary/50 rounded-xl" />
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                            <div className="text-center space-y-1">
                                <div className="h-7 w-12 bg-secondary/60 rounded mx-auto" />
                                <div className="h-3 w-14 bg-secondary/40 rounded mx-auto" />
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center space-y-1">
                                <div className="h-7 w-12 bg-secondary/60 rounded mx-auto" />
                                <div className="h-3 w-10 bg-secondary/40 rounded mx-auto" />
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center space-y-1">
                                <div className="h-7 w-10 bg-secondary/60 rounded mx-auto" />
                                <div className="h-3 w-12 bg-secondary/40 rounded mx-auto" />
                            </div>
                        </div>
                    </div>

                    {/* Floating cards skeleton (desktop) */}
                    <div className="hidden lg:flex relative w-80 h-[440px]">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="absolute rounded-2xl bg-secondary/50"
                                style={{
                                    width: "240px",
                                    height: "360px",
                                    top: `${i * 20}px`,
                                    left: `${i * 30}px`,
                                    zIndex: 3 - i,
                                    transform: `rotate(${(i - 1) * 4}deg)`,
                                    opacity: 1 - i * 0.15,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending section skeleton */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-10">
                        <div className="h-9 bg-secondary/60 rounded-xl w-64" />
                        <div className="h-5 bg-secondary/40 rounded-lg w-80 mt-3" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="rounded-xl bg-secondary/50 aspect-[2/3]" />
                                <div className="space-y-1.5">
                                    <div className="h-4 bg-secondary/60 rounded w-3/4" />
                                    <div className="h-3 bg-secondary/40 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Genre section skeleton */}
            <section className="py-16 lg:py-24 bg-secondary/10">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="h-9 bg-secondary/60 rounded-xl w-52 mx-auto" />
                        <div className="h-5 bg-secondary/40 rounded-lg w-60 mx-auto mt-3" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border">
                                <div className="w-12 h-12 rounded-xl bg-secondary/40" />
                                <div className="space-y-1 text-center">
                                    <div className="h-4 bg-secondary/50 rounded w-16 mx-auto" />
                                    <div className="h-3 bg-secondary/30 rounded w-20 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
