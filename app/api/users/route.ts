import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Example: Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        posts: {
          include: {
            comments: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, firstName, lastName, imageUrl } = body

    // Example: Create or update user in database
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        firstName,
        lastName,
        imageUrl,
      },
      create: {
        clerkId: userId,
        email,
        firstName,
        lastName,
        imageUrl,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 