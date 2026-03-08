import { createClient } from "@/lib/supabase/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.NEXT_PUBLIC_E2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.E2_AVATARS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.E2_AVATARS_SECRET_ACCESS_KEY!,
  }
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { filename, contentType } = await req.json()
    const fileExt = filename.split('.').pop()
    const key = `avatars/${user.id}/${uuidv4()}.${fileExt}`

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_E2_AVATARS_BUCKET_NAME,
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 })

    return NextResponse.json({ uploadUrl, key })
  }
  catch (error) {
    console.error('Error creating pre-signed url: ', error)
    return NextResponse.json({ error: 'Failed to create pre-signed url' }, { status: 500 })
  }
}