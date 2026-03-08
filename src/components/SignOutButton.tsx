'use client'

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { VscSignOut } from "react-icons/vsc"
import { Button } from "./ui/button"

export default function SignOutButton() {
  const router = useRouter()
  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Error while signing out: ', error.message)
      }
      router.refresh()
    }
    catch (error) {
      console.error('Logout failed: ', error)
    }
  }
  return (
    <>
      <Button variant="ghost" className="w-full hover:cursor-pointer bg-transparent press-effect" onClick={handleSignOut}>
        <VscSignOut className="text-destructive" />
        Log out
      </Button>
    </>
  )
}