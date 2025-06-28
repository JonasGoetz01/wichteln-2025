"use client";

import React from "react";
import {Button, Input, Checkbox, Link, Divider} from "@heroui/react";
import {Icon} from "@iconify/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Component() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  return (
    <div className="flex min-h-[48rem] w-full items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-2 sm:p-4 lg:p-8">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <h1 className="text-2xl font-bold">Willkommen</h1>
        <p className="text-sm text-default-500">Bitte melde dich an, um die Wichtelaktion zu starten.</p>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <SignInButton mode="modal">
            <Button color="primary" className="w-full">Anmelden</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button color="primary" variant="bordered" className="w-full">Registrieren</Button>
          </SignUpButton>
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
          </div>
          <p className="text-center text-xs text-default-400">
            Diese Seite ist nur für die Wichtelaktion des Burghadt Gymnasiums Buchen gedacht
          </p>
          <p className="text-center text-xs text-default-400">
            Alle Inhalte wurden von Jonas Götz erstellt.
          </p>
          <br />
          <div>
            <div className="flex justify-center gap-4">
              <a href="https://github.com/JonasGoetz01" className="text-primary inline-flex items-center">
                <Icon icon="mdi:github" className="mr-1" />
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/jonas-g%C3%B6tz-7b66b61bb/" className="text-primary inline-flex items-center">
                <Icon icon="mdi:linkedin" className="mr-1" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
