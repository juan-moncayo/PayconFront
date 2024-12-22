import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Paycon',
  description: 'Sistema de riego inteligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="container mx-auto mt-8">
          {children}
        </main>
      </body>
    </html>
  )
}

