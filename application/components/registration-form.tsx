"use client";

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
} from '@heroui/react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
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