"use client";

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import useSWR from 'swr';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EventManagerProps {
  className?: string;
}

export default function EventManager({ className }: EventManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    registrationDeadline: '',
    assignmentDate: '',
    giftDeadline: '',
    deliveryDate: '',
    isActive: true,
  });

  // Fetch events data
  const { data: eventsData, error, mutate } = useSWR('/api/events', fetcher);

  const events = eventsData?.events || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      registrationDeadline: '',
      assignmentDate: '',
      giftDeadline: '',
      deliveryDate: '',
      isActive: true,
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Bitte gib einen Event-Namen ein.');
      return;
    }

    setIsCreating(true);
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert(editingEvent ? 'Event erfolgreich aktualisiert! 🎉' : 'Event erfolgreich erstellt! 🎉');
        resetForm();
        onClose();
        mutate();
      } else {
        alert(result.error || 'Fehler beim Speichern des Events');
      }
    } catch (error) {
      console.error('Event save error:', error);
      alert('Fehler beim Speichern des Events');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      name: event.name || '',
      description: event.description || '',
      registrationDeadline: event.registrationDeadline ? 
        format(new Date(event.registrationDeadline), 'yyyy-MM-dd\'T\'HH:mm') : '',
      assignmentDate: event.assignmentDate ? 
        format(new Date(event.assignmentDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      giftDeadline: event.giftDeadline ? 
        format(new Date(event.giftDeadline), 'yyyy-MM-dd\'T\'HH:mm') : '',
      deliveryDate: event.deliveryDate ? 
        format(new Date(event.deliveryDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      isActive: event.isActive || false,
    });
    onOpen();
  };

  const handleToggleActive = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        mutate();
      } else {
        alert('Fehler beim Ändern des Event-Status');
      }
    } catch (error) {
      console.error('Toggle event error:', error);
      alert('Fehler beim Ändern des Event-Status');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Bist du dir sicher, dass du dieses Event löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Event erfolgreich gelöscht');
        mutate();
      } else {
        alert('Fehler beim Löschen des Events');
      }
    } catch (error) {
      console.error('Delete event error:', error);
      alert('Fehler beim Löschen des Events');
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p className="text-red-500">Fehler beim Laden der Events</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-xl font-bold">Event-Verwaltung</h2>
              <p className="text-default-500">Erstelle und verwalte Wichtel-Events</p>
            </div>
            <Button
              color="primary"
              onPress={() => {
                resetForm();
                onOpen();
              }}
            >
              Neues Event erstellen
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Alle Events</h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Events table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ANMELDESCHLUSS</TableColumn>
              <TableColumn>ZUORDNUNG</TableColumn>
              <TableColumn>GESCHENK-ABGABE</TableColumn>
              <TableColumn>AUSGABE</TableColumn>
              <TableColumn>AKTIONEN</TableColumn>
            </TableHeader>
            <TableBody>
              {events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      {event.description && (
                        <p className="text-sm text-default-500 truncate max-w-xs">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Chip
                        color={event.isActive ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {event.isActive ? "Aktiv" : "Inaktiv"}
                      </Chip>
                      {event.areAssignmentsCreated && (
                        <Chip color="primary" variant="flat" size="sm">
                          Zuordnungen erstellt
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.registrationDeadline ? (
                        <>
                          <p>{format(new Date(event.registrationDeadline), 'dd.MM.yyyy')}</p>
                          <p className="text-default-500">
                            {format(new Date(event.registrationDeadline), 'HH:mm')}
                          </p>
                        </>
                      ) : (
                        <span className="text-default-400">Nicht gesetzt</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.assignmentDate ? (
                        <>
                          <p>{format(new Date(event.assignmentDate), 'dd.MM.yyyy')}</p>
                          <p className="text-default-500">
                            {format(new Date(event.assignmentDate), 'HH:mm')}
                          </p>
                        </>
                      ) : (
                        <span className="text-default-400">Nicht gesetzt</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.giftDeadline ? (
                        <>
                          <p>{format(new Date(event.giftDeadline), 'dd.MM.yyyy')}</p>
                          <p className="text-default-500">
                            {format(new Date(event.giftDeadline), 'HH:mm')}
                          </p>
                        </>
                      ) : (
                        <span className="text-default-400">Nicht gesetzt</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.deliveryDate ? (
                        <>
                          <p>{format(new Date(event.deliveryDate), 'dd.MM.yyyy')}</p>
                          <p className="text-default-500">
                            {format(new Date(event.deliveryDate), 'HH:mm')}
                          </p>
                        </>
                      ) : (
                        <span className="text-default-400">Nicht gesetzt</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => handleEdit(event)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color={event.isActive ? "warning" : "success"}
                        onPress={() => handleToggleActive(event.id, event.isActive)}
                      >
                        {event.isActive ? "Deaktivieren" : "Aktivieren"}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDelete(event.id)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {events.length === 0 && (
            <div className="text-center py-8">
              <p className="text-default-500">Noch keine Events erstellt</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingEvent ? "Event bearbeiten" : "Neues Event erstellen"}
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Event-Name"
                placeholder="z.B. Wichtelaktion 2024"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                isRequired
              />
              
              <Textarea
                label="Beschreibung"
                placeholder="Beschreibung des Events"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  label="Anmeldeschluss"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                />
                
                <Input
                  type="datetime-local"
                  label="Zuordnungsdatum"
                  value={formData.assignmentDate}
                  onChange={(e) => setFormData({...formData, assignmentDate: e.target.value})}
                />
                
                <Input
                  type="datetime-local"
                  label="Geschenk-Abgabe Deadline"
                  value={formData.giftDeadline}
                  onChange={(e) => setFormData({...formData, giftDeadline: e.target.value})}
                />
                
                <Input
                  type="datetime-local"
                  label="Ausgabedatum"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                />
              </div>

              <Divider />

              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) => setFormData({...formData, isActive: value})}
                >
                  Event aktiv
                </Switch>
                <p className="text-sm text-default-500">
                  Nur aktive Events sind für Teilnehmer sichtbar
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  📅 Zeitplan-Tipps
                </h4>
                <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <p>• Anmeldeschluss: Wann sollen sich alle registriert haben?</p>
                  <p>• Zuordnung: Wann werden die Wichtel-Partner zugewiesen?</p>
                  <p>• Geschenk-Abgabe: Bis wann müssen Geschenke abgegeben werden?</p>
                  <p>• Ausgabe: Wann werden die Geschenke verteilt?</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                Abbrechen
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isCreating}
                disabled={isCreating}
              >
                {isCreating 
                  ? (editingEvent ? 'Wird aktualisiert...' : 'Wird erstellt...') 
                  : (editingEvent ? 'Aktualisieren' : 'Erstellen')
                }
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
} 