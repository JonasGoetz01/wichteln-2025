import { currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export const getCurrentUser = async () => {
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress || ''

  // First, check if user exists by clerkId
  let existingUser = await db.user.findUnique({
    where: { clerkId: user.id }
  })

  if (existingUser) {
    // User exists by clerkId, just update their info
    const updatedUser = await db.user.update({
      where: { clerkId: user.id },
      data: {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    })
    return updatedUser
  }

  // User doesn't exist by clerkId, check if email already exists
  existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Email exists with different clerkId, update the clerkId
    console.log('Email exists with different clerkId, updating...')
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

  // No existing user, create new one
  try {
    const newUser = await db.user.create({
      data: {
        clerkId: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    })
    return newUser
  } catch (error) {
    console.error('Error creating new user:', error)
    throw error
  }
} 