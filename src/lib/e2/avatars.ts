'use server'

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export async function getAvatarUrl(key: string) {
  const objectKey = key.startsWith('/') ? key.substring(1) : key

  try {
    const s3Client = new S3Client({
      endpoint: `https://${process.env.NEXT_PUBLIC_E2_ENDPOINT}`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.E2_AVATARS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.E2_AVATARS_SECRET_ACCESS_KEY!,
      }
    })

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_E2_AVATARS_BUCKET_NAME,
      Key: objectKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return signedUrl
  }
  catch (error) {
    console.error("Error generating signed URL: ", error)
    return "/default-avatar.png"
  }
}