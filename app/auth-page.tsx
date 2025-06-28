"use client"

import {
  Card,
  CardBody,
  CardHeader,
  Button,
} from '@heroui/react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-3 pb-0">
          <h2 className="text-2xl font-bold text-center">Willkommen</h2>
          <p className="text-default-500 text-center text-sm">
            Bitte melde dich an, um die Wichtelaktion zu starten.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          <SignInButton mode="modal">
            <Button color="primary" className="w-full">Anmelden</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button color="primary" variant="bordered" className="w-full">Registrieren</Button>
          </SignUpButton>
        </CardBody>
      </Card>
    </div>
  )
} 