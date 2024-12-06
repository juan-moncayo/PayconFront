'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface LoginError {
  error?: string
  non_field_errors?: string[]
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<LoginError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        router.push('/profile')
      } else {
        setError(data)
      }
    } catch (error) {
      setError({ error: 'Error de red. Por favor, verifica tu conexión.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="mb-8 text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
      {error && (error.error || error.non_field_errors) && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error.error || error.non_field_errors?.join(', ')}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            id="username"
            type="text"
            className="bg-gray-50"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            className="bg-gray-50"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#00B3B0] text-white hover:bg-[#009B98]"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
      <div className="text-center mt-4">
        <Link
          href="/register"
          className="text-[#00B3B0] hover:text-[#009B98] text-sm font-medium"
        >
          ¿No tienes una cuenta? Regístrate
        </Link>
      </div>
    </>
  )
}

