import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditProfileModal } from '@/components/edit-profile-modal'

interface UserData {
  username: string
  name: string
  email: string
  phone_number: string
  address: string
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        console.error('Error al obtener los datos del usuario')
      }
    } catch (error) {
      console.error('Ocurrió un error al obtener los datos del usuario', error)
    }
  }

  const handleEditComplete = (updatedData: UserData) => {
    setUserData(updatedData)
    setIsEditing(false)
  }

  if (!userData) {
    return <div>Cargando datos del usuario...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Nombre de usuario:</strong> {userData.username}</p>
          <p><strong>Nombres:</strong> {userData.name || 'No especificado'}</p>
          <p><strong>Correo electrónico:</strong> {userData.email}</p>
          <p><strong>Número de teléfono:</strong> {userData.phone_number || 'No especificado'}</p>
          <p><strong>Dirección:</strong> {userData.address || 'No especificada'}</p>
        </div>
        <Button 
          onClick={() => setIsEditing(true)} 
          className="mt-4 bg-[#00B3B0] text-white hover:bg-[#009B98]"
        >
          Editar Perfil
        </Button>
      </CardContent>
      {isEditing && (
        <EditProfileModal 
          userData={userData} 
          onClose={() => setIsEditing(false)}
          onEditComplete={handleEditComplete}
        />
      )}
    </Card>
  )
}

