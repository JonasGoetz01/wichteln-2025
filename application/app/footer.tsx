"use client";

import React from "react";
import { Divider } from "@heroui/react";

export default function Component() {
  return (
    <footer className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2 md:order-2 md:items-end" />
        <div className="mt-4 md:order-1 md:mt-0">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <div className="flex items-center">
              <span className="text-small font-medium">Wichtelaktion</span>
            </div>
            <Divider className="h-4" orientation="vertical" />
          </div>
          <p className="text-center text-tiny text-default-400 md:text-start">
            &copy; 2025 Alle Inhalte wurden von Jonas Götz erstellt.
          </p>
        </div>
      </div>
    </footer>
  );
}
