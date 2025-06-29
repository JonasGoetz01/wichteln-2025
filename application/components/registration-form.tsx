"use client";

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    interests: '',
  });

  // Fetch available classes
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classId) {
      alert('Bitte wähle deine Klasse aus.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Erfolgreich registriert! 🎉');
        // Refresh the page to show updated registration status
        router.refresh();
      } else {
        alert(result.error || 'Fehler bei der Registrierung');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Fehler bei der Registrierung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">Für Wichtelaktion anmelden</h2>
          <p className="text-sm text-default-500">
            Melde dich für die diesjährige Wichtelaktion an
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Klasse"
            placeholder="Wähle deine Klasse"
            selectedKeys={formData.classId ? [formData.classId] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              setFormData({ ...formData, classId: selectedKey });
            }}
            required
          >
            {classes.map((cls: any) => (
              <SelectItem key={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            label="Interessen & Geschenkwünsche"
            placeholder="Beschreibe deine Hobbys, Interessen oder Geschenkideen... (optional)"
            description="Hilf deinem Wichtel bei der Geschenkauswahl! Z.B. Bücher, Sport, Musik, Süßigkeiten, etc."
            value={formData.interests}
            onValueChange={(value) => {
              setFormData({ ...formData, interests: value });
            }}
            minRows={3}
            maxRows={6}
            className="w-full"
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-sm">💡</span>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                <p className="font-medium mb-1">Tipp für bessere Geschenke:</p>
                <p>Erwähne deine Hobbys, Lieblingssachen oder was du gerne magst. So kann dein Wichtel das perfekte Geschenk für dich finden!</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Wird registriert...' : 'Jetzt anmelden'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
} 