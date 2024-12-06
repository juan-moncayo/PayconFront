'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface ValidationErrors {
  [key: string]: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrors({ password: ['Las contraseñas no coinciden'] })
      return
    }
    if (!acceptTerms) {
      setErrors({ non_field_errors: ['Debes aceptar los términos y condiciones'] })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          phone_number: phoneNumber, 
          address,
          name: fullName 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/login')
      } else {
        setErrors(data)
      }
    } catch (error) {
      setErrors({
        non_field_errors: ['Error de red. Por favor, verifica tu conexión.']
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="mb-8 text-2xl font-bold text-gray-900">Crea tu cuenta</h2>
      {errors.non_field_errors && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {errors.non_field_errors.join(', ')}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombres y Apellidos<span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            className="bg-gray-50"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">
            Nombre de Usuario<span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            type="text"
            className="bg-gray-50"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.join(', ')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo<span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            className="bg-gray-50"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.join(', ')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Número de Teléfono<span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            className="bg-gray-50"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number.join(', ')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">
            Dirección<span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            className="bg-gray-50"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.join(', ')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña<span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            className="bg-gray-50"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirmar Contraseña<span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            className="bg-gray-50"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.join(', ')}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm">
            Acepto los Términos y Condiciones y la Política de Privacidad
          </Label>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#00B3B0] text-white hover:bg-[#009B98]"
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
      <div className="text-center mt-4">
        <Link
          href="/login"
          className="text-[#00B3B0] hover:text-[#009B98] text-sm font-medium"
        >
          ¿Ya tienes una cuenta? Iniciar sesión
        </Link>
      </div>
    </>
  )
}

