"use client";

import React from "react";
import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Component() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Wichtelaktion 2024
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Bitte melde dich an, um die Wichtelaktion zu starten.
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton mode="modal">
            <Button className="w-full" color="primary" size="lg">
              Anmelden
            </Button>
          </SignInButton>

          <SignUpButton mode="modal">
            <Button
              className="w-full"
              color="secondary"
              size="lg"
              variant="bordered"
            >
              Registrieren
            </Button>
          </SignUpButton>
        </div>

        <Divider />

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Ein Projekt von{" "}
            <a
              className="text-primary inline-flex items-center"
              href="https://github.com/JonasGoetz01"
            >
              <Icon className="mr-1" icon="mdi:github" />
              Jonas Götz
            </a>{" "}
            &{" "}
            <a
              className="text-primary inline-flex items-center"
              href="https://www.linkedin.com/in/jonas-g%C3%B6tz-7b66b61bb/"
            >
              <Icon className="mr-1" icon="mdi:linkedin" />
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
