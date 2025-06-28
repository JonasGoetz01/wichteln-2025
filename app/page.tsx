import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import DashboardClient from './dashboard-client'
import { Button } from '@heroui/react'

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
      </>
    )
  }

  return (
    <div>
      <DashboardClient user={user} />
    </div>
  )
} 