"use client"

import React from 'react'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Button,
  User,
  Spacer,
  Code
} from '@heroui/react'

interface UserData {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

interface DashboardClientProps {
  user: UserData
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Willkommen, {user.firstName || 'User'}! 👋
              </h1>
              <p className="text-default-500 mt-1">
                Hier ist deine Übersicht für die diesjährige Wichtelaktion.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 