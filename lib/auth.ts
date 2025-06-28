import { currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export const getCurrentUser = async () => {
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress || ''

  try {
    // Try to sync Clerk user with database
    const dbUser = await db.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      create: {
        clerkId: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    })

    return dbUser
  } catch (error: any) {
    // Handle unique constraint error on email
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      // Check if there's an existing user with this email
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // Update the existing user's clerkId and other fields
        const updatedUser = await db.user.update({
          where: { email },
          data: {
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          },
        })
        return updatedUser
      }
    }
    
    // Re-throw the error if it's not the email uniqueness issue we can handle
    throw error
  }
} 