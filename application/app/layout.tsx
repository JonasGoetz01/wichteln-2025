import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import AuthPage from "./auth-page";

import React from "react";
import {Divider} from "@heroui/react";
import Footer from "./footer";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (  
    <ClerkProvider 
      appearance={{
        baseTheme: dark,
      }}
    >
      <html suppressHydrationWarning lang="en">
        <head />
        <body
          className={clsx(
            "min-h-screen text-foreground bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <SignedOut>
              <AuthPage />
            </SignedOut>
            
            <SignedIn>
              <Navbar />
              <main className="container mx-auto max-w-7xl pt-16 px-6">
                {children}
              </main>
              <Footer />
            </SignedIn>

            <Analytics />
            <SpeedInsights />
          </Providers>
        </body>
      </html>
    </ClerkProvider>  
  );
}
