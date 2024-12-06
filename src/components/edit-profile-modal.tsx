import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserData {
  username: string
  name: string
  email: string
  phone_number: string
  address: string
}

interface EditProfileModalProps {
  userData: UserData
  onClose: () => void
  onEditComplete: (updatedData: UserData) => void
}

export function EditProfileModal({ userData, onClose, onEditComplete }: EditProfileModalProps) {
  const [editedData, setEditedData] = useState<UserData>(userData)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      })

      if (response.ok) {
        const updatedData = await response.json()
        onEditComplete(updatedData)
      } else {
        console.error('Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Ocurrió un error al actualizar el perfil', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombres y Apellidos
              </Label>
              <Input
                id="name"
                name="name"
                value={editedData.name}
                onChange={handleChange}
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editedData.email}
                onChange={handleChange}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
                Número de teléfono
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={editedData.phone_number}
                onChange={handleChange}
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Dirección
              </Label>
              <Input
                id="address"
                name="address"
                value={editedData.address}
                onChange={handleChange}
                className="bg-gray-50"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline"
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#00B3B0] text-white hover:bg-[#009B98]"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

