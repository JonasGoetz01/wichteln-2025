import {
  Card,
  CardBody,
} from "@heroui/card";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import RegistrationForm from "@/components/registration-form";
import ClassManager from "@/components/class-manager";
import AdminDashboard from "@/components/admin-dashboard";
import AssignmentView from "@/components/assignment-view";
import EventManager from "@/components/event-manager";

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

  // For demo purposes, we'll treat users with role 'admin' as administrators
  // In production, this should be based on the user.role field
  const isAdmin = user?.email === 'jonas.goetz01@web.de';

  // Get current event status
  // const currentEvent = await db.event.findFirst({
  //   where: { isActive: true },
  // });
  const currentEvent = null; // Placeholder until schema is fully synced

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
          {isAdmin && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-400">
                🛠️ Administrator-Zugang erkannt. Du hast Zugriff auf das Admin-Dashboard.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Admin Dashboard - Full Featured */}
      {isAdmin && (
        <AdminDashboard />
      )}

      {/* Regular User Experience */}
      {!isAdmin && (
        <>
          {/* Registration Form - shown if not registered yet */}
          {!existingParticipant && (
            <div className="flex justify-center">
              <RegistrationForm />
            </div>
          )}

          {/* Assignment View - shown if registered */}
          {existingParticipant && (
            <AssignmentView />
          )}

          {/* Current Status for Participants */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status der Wichtelaktion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${existingParticipant ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                  <p className="text-2xl font-bold text-blue-600">📝</p>
                  <p className="font-medium">Anmeldung</p>
                  <p className="text-sm text-default-500">
                    {existingParticipant ? 'Abgeschlossen ✓' : 'Noch nicht abgeschlossen'}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">🎯</p>
                  <p className="font-medium">Zuordnung</p>
                  <p className="text-sm text-default-500">
                    Steht noch aus
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">🎁</p>
                  <p className="font-medium">Geschenke</p>
                  <p className="text-sm text-default-500">Noch nicht gestartet</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Admin Tools Section - Separate from Main Dashboard */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Configuration */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">📅 Event-Konfiguration</h3>
              <p className="text-default-500 mb-4">
                Erstelle und verwalte Wichtel-Events mit allen wichtigen Einstellungen.
              </p>
              <EventManager />
            </CardBody>
          </Card>

          {/* Class Management */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">🏫 Zusätzliche Klassenverwaltung</h3>
              <p className="text-default-500 mb-4">
                Erstelle neue Klassen für die Teilnehmer-Anmeldung.
              </p>
              <ClassManager />
            </CardBody>
          </Card>
        </div>
      )}

      {/* Event Information */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wichtelaktion 2024</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> Wichtelaktion des Burghadt Gymnasiums Buchen</p>
            <p><strong>Beschreibung:</strong> Die jährliche Wichtelaktion für alle Schüler</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-default-500">Anmeldephase</p>
                <p className="font-medium">Läuft derzeit</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Zuordnung</p>
                <p className="font-medium">Nach Anmeldeschluss</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Geschenk-Abgabe</p>
                <p className="font-medium">Wird noch bekannt gegeben</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Ausgabe</p>
                <p className="font-medium">Dezember 2024</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Help */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hilfe & Informationen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Für Teilnehmer:</h4>
              <ul className="text-sm space-y-1 text-default-600">
                <li>• Melde dich mit deiner Klasse an</li>
                <li>• Warte auf die Zuordnung deines Wichtel-Partners</li>
                <li>• Kaufe ein passendes Geschenk (€5-15)</li>
                <li>• Gib das Geschenk rechtzeitig ab</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Wichtige Termine:</h4>
              <ul className="text-sm space-y-1 text-default-600">
                <li>• Anmeldung: Bis zum Anmeldeschluss</li>
                <li>• Zuordnung: Wird von den Organisatoren erstellt</li>
                <li>• Geschenk-Abgabe: Bis zur Deadline</li>
                <li>• Ausgabe: Am Ausgabetag</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
