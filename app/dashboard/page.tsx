import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>
  }

  // Example: Fetch user's posts
  const posts = await db.post.findMany({
    where: { authorId: user.id },
    include: {
      comments: {
        include: {
          author: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Posts Count
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {posts.length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Posts
          </h2>
        </div>
        
        {posts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                {post.content && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {post.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span>
                    {post.comments.length} comments
                  </span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No posts yet. Create your first post to see it here!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 