import {
  Card,
  CardBody,
} from "@heroui/card";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ParticipantsTable from "./participants-table";
import ClassesTable from "./classes-table";
import RegistrationForm from "@/components/registration-form";
import ClassManager from "@/components/class-manager";

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
      </>
    )
  }

  // Check if user is already registered as participant
  const existingParticipant = await db.participant.findUnique({
    where: { userId: user.id },
    include: {
      class: true,
    },
  });

  // For demo purposes, we'll treat users with firstName 'Admin' as administrators
  // In production, this should be based on the user.role field
  const isAdmin = user.firstName?.toLowerCase() === 'admin' || user.email?.includes('admin');

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
          {existingParticipant && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-400">
                ✅ Du bist bereits für die Wichtelaktion angemeldet! 
                {existingParticipant.class && ` (Klasse: ${existingParticipant.class.name})`}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Registration Form - shown if not registered yet */}
      {!existingParticipant && (
        <div className="flex justify-center">
          <RegistrationForm />
        </div>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                🛠️ Administrator-Bereich
              </h2>
              <ClassManager />
            </CardBody>
          </Card>
        </div>
      )}

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Teilnehmer</h3>
            <ParticipantsTable />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Klassen</h3>
            <ClassesTable />
          </CardBody>
        </Card>
      </div>

      {/* Current Status */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status der Wichtelaktion</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">📝</p>
              <p className="font-medium">Anmeldephase</p>
              <p className="text-sm text-default-500">Derzeit läuft die Registrierung</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">🎯</p>
              <p className="font-medium">Zuordnung</p>
              <p className="text-sm text-default-500">Steht noch aus</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">🎁</p>
              <p className="font-medium">Geschenke</p>
              <p className="text-sm text-default-500">Noch nicht gestartet</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
