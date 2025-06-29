"use client";

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Divider,
} from '@heroui/react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClassManager() {
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState('');

  // Fetch existing classes
  const { data: classesData, error } = useSWR('/api/classes', fetcher);
  const classes = classesData?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!className.trim()) {
      alert('Bitte gib einen Klassennamen ein.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: className }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Klasse erfolgreich erstellt! 🎉');
        setClassName('');
        // Refresh the classes list
        mutate('/api/classes');
      } else {
        alert(result.error || 'Fehler beim Erstellen der Klasse');
      }
    } catch (error) {
      console.error('Class creation error:', error);
      alert('Fehler beim Erstellen der Klasse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">Klassenverwaltung</h2>
          <p className="text-sm text-default-500">
            Erstelle und verwalte Klassen für die Wichtelaktion
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Create New Class Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              label="Neuer Klassenname"
              placeholder="z.B. 10a, 11b, etc."
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              disabled={loading || !className.trim()}
            >
              {loading ? 'Erstellen...' : 'Erstellen'}
            </Button>
          </div>
        </form>

        <Divider />

        {/* Existing Classes List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Vorhandene Klassen</h3>
          {error ? (
            <p className="text-red-500">Fehler beim Laden der Klassen</p>
          ) : classes.length === 0 ? (
            <p className="text-default-500">Noch keine Klassen erstellt</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {classes.map((cls: any) => (
                <Card key={cls.id} className="p-3">
                  <div className="text-center">
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-default-500">
                      {cls.participants?.length || 0} Teilnehmer
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
} 