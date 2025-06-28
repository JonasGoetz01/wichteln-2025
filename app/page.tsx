import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/table";
import {
  Card,
  CardBody,
  CardHeader
} from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

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
            Hello {user.firstName || 'User'}! 👋
          </h1>
          <p className="text-default-500">
            Welcome to your dashboard. Here you can see all registered users.
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
