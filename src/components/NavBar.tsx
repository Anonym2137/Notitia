import MainContent from "@/components/MainContent";
import Image from "next/image";
import { NavigationMenu, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { VscMenu, VscAccount, VscOutput, VscSettingsGear, VscSignIn, VscHeart } from "react-icons/vsc";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { Label } from "./ui/label";
import SearchBar from "./SearchBar";
import { Toaster } from "./ui/sonner";

interface User {
  id: string,
  email?: string,
}

interface Profile {
  username: string | null,
  full_name: string | null,
}

interface NavBarProps {
  user: User | null,
  profile: Profile | null,
}

export default function NavBar({ user, profile }: NavBarProps) {
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User"

  return (
    <MainContent>
      <Toaster />
      <nav className="glass-effect sticky top-0 z-50 display flex w-screen h-[128px] px-2 transition-all duration-300">
        <div className="hover:scale-105 transition-transform duration-300 flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="logo" height={60} width={70} />
          </Link>
        </div>
        <div className="w-fit hidden lg:flex lg:items-center">
          <NavigationMenuItem className="list-none">
            <Button asChild className="text-2xl flex h-full" variant='link'>
              <Link href="/" className="animated-underline">Home</Link>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem className="list-none">
            <Button asChild className="text-2xl flex h-full" variant='link'>
              <Link href="/following" className="animated-underline">Following</Link>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem className="list-none">
            <Button asChild className="text-2xl flex h-full" variant='link'>
              <Link href="/watchlist" className="animated-underline">Watchlist</Link>
            </Button>
          </NavigationMenuItem>
        </div>
        <SearchBar />
        <Sheet>
          <div className="h-full flex items-center mx-3 lg:hidden">
            <SheetTrigger asChild>
              <Button variant="outline" className="press-effect">
                <VscMenu size={128} />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-4 px-4 my-9">
              <div className="grid border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="press-effect">
                    <Link href="/">Home</Link>
                  </Button>
                </SheetClose>
              </div>
              <div className="grid  border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="press-effect">
                    <Link href="/following">Following</Link>
                  </Button>
                </SheetClose>
              </div>
              <div className="grid  border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="press-effect">
                    <Link href="/watchlist">Watchlist</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
            {user ? (
              <>
                <SheetFooter>
                  <div className="flex items-center space-x-4">
                    <VscAccount size={36} />
                    <div className="space-y-2">
                      <h2>{displayName}</h2>
                      <h3>{user?.email}</h3>
                    </div>
                  </div>
                  <hr />
                  <div className="grid border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                    <div className="grid border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                      <SheetClose asChild>
                        <Button asChild variant="ghost" className="press-effect">
                          <Link href="/profile">
                            <VscAccount />
                            Profile
                          </Link>
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetClose asChild>
                      <Button asChild variant="ghost" className="press-effect">
                        <Link href="/myactivity">
                          <VscOutput />
                          My Activity
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="grid border-2 border-b-secondary-foreground border-x-transparent border-t-transparent rounded-none">
                    <SheetClose asChild>
                      <Button asChild variant="ghost" className="press-effect">
                        <Link href="/settings">
                          <VscSettingsGear />
                          Settings
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="grid cols-2 justify-items-center border-2 gap-0 border-b-destructive border-x-transparent border-t-transparent rounded-none text-destructive">
                    <SheetClose asChild>
                      <SignOutButton />
                    </SheetClose>
                  </div>
                </SheetFooter>
              </>
            ) : (
              <SheetFooter>
                <SheetClose asChild>
                  <Button asChild type="submit" className="press-effect">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="press-effect">
                    <Link href="/register">Create Account</Link>
                  </Button>
                </SheetClose>
              </SheetFooter>
            )
            }
          </SheetContent>
        </Sheet>
        <div className="hidden lg:flex lg:items-center lg:mx-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="press-effect hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"><VscAccount size={30} /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 animate-scale-in">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {user ? (
                  <>
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex col gap-2">
                        <VscAccount />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/myactivity" className="flex col gap-2">
                        <VscOutput />
                        <span>My Activity</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex col gap-2">
                        <VscSettingsGear />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <SignOutButton />
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <VscSignIn />
                    <Link href='/login'>Log In</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </MainContent >
  )
}