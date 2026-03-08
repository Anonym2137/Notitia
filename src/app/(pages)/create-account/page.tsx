import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signup } from "./actions"

export default function SignUpPage() {
  return (
    <div className='flex w-full justify-center items-center h-[100vw] lg:h-[60vw] 2xl:h-[35vw]'>
      <form className='w-full max-w-sm'>
        <Card className="w-full max-w-sm">
          <CardHeader className='text-center text-2xl'>
            <CardTitle>Create Account</CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name='email'
                  placeholder='email@gmail.com'
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 underline lg:no-underline lg:hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" name='password' placeholder='∗∗∗∗∗∗∗∗' required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button formAction={signup} className="w-full hover:cursor-pointer">
              Create Account
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div >
  )
}