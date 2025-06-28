import { currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export const getCurrentUser = async () => {
  const user = await currentUser()
  if (!user) return null

  // Sync Clerk user with database
  const dbUser = await db.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
  })

  return dbUser
} 