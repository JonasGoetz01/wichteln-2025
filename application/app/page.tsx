import {
  Card,
  CardBody,
} from "@heroui/card";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
      </>
    )
  }

  // Fetch all users from database
  const allUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardBody className="p-6">
          <h1 className="text-2xl font-bold mb-2">
            Hallo {user.firstName || 'User'}! 👋
          </h1>
          <p className="text-default-500">
            Willkommen zur Wichtelaktion des Burghadt Gymnasiums Buchen. Hier kannst du deinen zugewiesenen Wichtel finden und alle Informationen zu der Wichtelaktion erhalten.
          </p>
        </CardBody>
      </Card>
      <Card>
      <CardBody className="p-6">
        <h2 className="text-xl font-bold mb-4">Registered Users</h2>
        {allUsers.map((user) => (
          <p key={user.id} className="text-default-500">
            {user.firstName}
          </p>
        ))}
      </CardBody>
      </Card>
    </div>
  )
}
