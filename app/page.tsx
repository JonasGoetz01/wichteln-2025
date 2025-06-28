import React from 'react'
import { getCurrentUser } from '@/lib/auth'

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s your dashboard with data from NeonDB via Prisma ORM.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            User ID
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {user.id}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  )
} 