'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <nav className="bg-[#00B3B0] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Paycon
        </Link>
        <div>
          <Link href="/profile" className="text-white mr-4 hover:text-gray-200">
            Perfil
          </Link>
          <Link href="/irrigation" className="text-white mr-4 hover:text-gray-200">
            Sistema de Riego
          </Link>
          <Button
            onClick={handleLogout}
            className="text-white hover:text-gray-200 bg-transparent hover:bg-[#009B98]"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}

