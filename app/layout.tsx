import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import AuthPage from './auth-page'
import './globals.css'
import AppNavbar from "./navbar";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            <SignedOut>
              <AuthPage />
            </SignedOut>
            
            <SignedIn>
              <div className="min-h-screen bg-background">
                <AppNavbar />
                <main className="container mx-auto px-6 py-8 max-w-7xl">
                  {children}
                </main>
              </div>
            </SignedIn>
          
            <Analytics />
            <SpeedInsights />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}