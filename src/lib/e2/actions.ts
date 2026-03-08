'use server'

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function getPrivateImageUrl(key: string) {
  const objectKey = key.startsWith('/') ? key.substring(1) : key

  try {
    const s3Client = new S3Client({
      endpoint: `https://${process.env.NEXT_PUBLIC_E2_ENDPOINT}`,
      region: 'de-fra2',
      credentials: {
        accessKeyId: process.env.E2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.E2_SECRET_ACCESS_KEY!,
      }
    })

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_E2_BUCKET_NAME,
      Key: objectKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return signedUrl
  }
  catch (err) {
    console.error("Error generating signed url: ", err)
    return "/poster/default"
  }
}