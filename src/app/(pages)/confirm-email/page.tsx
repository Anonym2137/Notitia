import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function ConfirmEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Confirm Your Email</CardTitle>
          <CardDescription className="pt-2">
            We have sent a confirmation link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Please check your inbox (and spam folder, just in case) and click the link to activate your account. This page can be safely closed.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
