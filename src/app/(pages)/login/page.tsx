import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const errorMessage = searchParams?.error as string | undefined;
  return (
    <div className='flex w-full justify-center items-center h-[100vw] lg:h-[60vw] 2xl:h-[35vw]'>
      <form className='w-full max-w-sm animate-fade-in-up'>
        <Card className="w-full max-w-sm shadow-2xl hover:shadow-primary/10 transition-shadow duration-500">
          <CardHeader className='text-center text-2xl'>
            <CardTitle className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Login</CardTitle>
            <hr className="border-border/50" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
                  {errorMessage}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name='email'
                  placeholder='email@gmail.com'
                  required
                  className="focus-glow transition-all duration-300"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 underline lg:no-underline lg:hover:underline text-primary/70 hover:text-primary transition-colors duration-200"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" name='password' placeholder='∗∗∗∗∗∗∗∗' required className="focus-glow transition-all duration-300" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button formAction={login} className="w-full hover:cursor-pointer press-effect hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              Log in
            </Button>
            <Button variant="outline" className="w-full press-effect hover:bg-primary/5 transition-all duration-200">
              <a href="/create-account" className='w-full'>
                Create Account
              </a>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div >
  )
}