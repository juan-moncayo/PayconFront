import React from 'react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00B3B0] from-50% to-gray-100 to-50%">
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-lg shadow-lg">
          {/* Left Panel */}
          <div className="flex w-1/2 flex-col items-center justify-center bg-[#2D3436] p-8 text-white">
            <div className="mb-8 text-center">
              <h1 className="mb-6 text-xl font-medium">BIENVENIDO(A) A</h1>
              <div className="mb-4">
                <Image
                  src="/inicio-logo.png?height=150&width=150"
                  alt="Paycon Logo"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </div>
            <p className="mb-12 max-w-md text-center text-gray-300">
              En PAYCON, ofrecemos una gama completa de servicios que combinan nuestra experiencia en la producción de hongos con tecnología de vanguardia.
            </p>
            <div className="flex gap-4">
              <Button className="bg-[#00B3B0] text-white hover:bg-[#009B98]">
                <Link href="/register">REGISTRARSE</Link>
              </Button>
              <Button variant="outline" className="border-[#00B3B0] text-[#00B3B0] hover:bg-[#00B3B0] hover:text-white">
                <Link href="/login">INICIAR SESIÓN</Link>
              </Button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex w-1/2 items-center justify-center bg-white p-8">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
