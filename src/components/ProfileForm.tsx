import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getAvatarUrl } from "@/lib/e2/avatars"

export default function ProfileForm({ user, profile, onSave }: { user: any, profile: any, onSave: any }) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [full_name, setFullName] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarPresignedUrl, setAvatarPresignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setFullName(profile.full_name || "")
      setLocation(profile.location || "")
      setBio(profile.bio || "")
      if (profile.avatar_url) {
        const presignedUrl = getAvatarUrl(profile.avatar_url)
        presignedUrl.then(url => setAvatarPresignedUrl(url))
      }
    }
  }, [profile])

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    let avatarKey = profile?.avatar_key

    if (avatarFile) {
      const presignResponse = await fetch('/api/user/avatar/request-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: avatarFile.name, contentType: avatarFile.type })
      })

      if (!presignResponse.ok) {
        alert("Error: could not get permission to upload.")
        setLoading(false)
        return
      }

      const { uploadUrl, key } = await presignResponse.json()
      avatarKey = key

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: avatarFile,
        headers: { 'Content-Type': avatarFile.type }
      })

      if (!uploadResponse.ok) {
        alert("Error: file upload failed.")
        setLoading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append("username", username)
    formData.append("full_name", full_name)
    formData.append("location", location)
    formData.append("bio", bio)

    if (avatarKey) {
      formData.append("avatar_key", avatarKey)
    }

    const result = await onSave(formData)

    if (result.error) {
      alert(result.message)
    }
    else {
      alert(result.message)
      router.push('/profile')
    }
    setLoading(false)
  }

  return (
    <TabsContent value="profile" className="space-y-6">
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarPreview || avatarPresignedUrl || "/default-avatar.png"} alt="Profile" />
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent" type="button" onClick={() => avatarInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    Upload new photo
                  </Button>
                </Label>
                <Input id="avatar-upload" type="file" className="hidden" ref={avatarInputRef} onChange={handleAvatarChange} />
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Name Field */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={full_name} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Brief description for your profile. Max 500 characters.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </TabsContent>
  )
}