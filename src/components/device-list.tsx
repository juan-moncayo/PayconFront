import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AddDeviceModal } from './add-device-modal'
import { DeviceDetails } from './device-details'
import { EditDeviceModal } from './edit-device-modal'
import { Input } from "@/components/ui/input"

interface Device {
  id: number
  name: string
  created_at: string
  updated_at: string
  latest_reading: SensorReading | null
  mqtt_server: string
  mqtt_port: number
  mqtt_username: string
  mqtt_password: string
  mqtt_vhost: string
  mqtt_exchange: string
  mqtt_routing_key: string
}

interface SensorReading {
  id: number
  temperature: number
  humidity: number
  air_quality: number
  timestamp: string
}

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [superUsername, setSuperUsername] = useState('')
  const [superPassword, setSuperPassword] = useState('')
  const [validatingCredentials, setValidatingCredentials] = useState(false)
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/devices/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      } else {
        setError('Error al obtener los dispositivos')
      }
    } catch (error) {
      setError('Ocurrió un error al obtener los dispositivos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDevice = (newDevice: Device) => {
    setDevices(prev => [...prev, newDevice])
    setShowAddDeviceModal(false)
  }

  const handleEditClick = (device: Device) => {
    setSelectedDevice(device)
    setActionType('edit')
    setShowDeleteDialog(true)
  }

  const handleDeleteClick = (device: Device) => {
    setSelectedDevice(device)
    setActionType('delete')
    setShowDeleteDialog(true)
  }

  const validateSuperuser = async () => {
    setValidatingCredentials(true)
    setError(null)
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/validate-superuser/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: superUsername, password: superPassword })
      })

      if (response.ok) {
        if (actionType === 'edit') {
          setShowEditModal(true)
        } else if (actionType === 'delete') {
          handleDeleteConfirm()
        }
        setShowDeleteDialog(false)
        setSuperUsername('')
        setSuperPassword('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Credenciales de superusuario inválidas')
      }
    } catch (error) {
      setError('Error al validar credenciales')
    } finally {
      setValidatingCredentials(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDevice) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/devices/${selectedDevice.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        setDevices(prev => prev.filter(device => device.id !== selectedDevice.id))
        setSelectedDevice(null)
      } else {
        setError('Error al eliminar el dispositivo')
      }
    } catch (error) {
      setError('Ocurrió un error al eliminar el dispositivo')
    }
  }

  if (isLoading) {
    return <div>Cargando dispositivos...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Dispositivos</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            {devices.map((device) => (
              <div key={device.id} className="mb-4 p-4 bg-gray-100 rounded">
                <p><strong>Nombre:</strong> {device.name}</p>
                <p><strong>Última lectura:</strong></p>
                {device.latest_reading ? (
                  <>
                    <p>Temperatura: {device.latest_reading.temperature}°C</p>
                    <p>Humedad: {device.latest_reading.humidity}%</p>
                    <p>Calidad del aire: {device.latest_reading.air_quality}</p>
                  </>
                ) : (
                  <p>No hay lecturas disponibles</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button 
                    onClick={() => setSelectedDevice(device)}
                    className="bg-[#00B3B0] text-white hover:bg-[#009B98]"
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    onClick={() => handleEditClick(device)}
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Editar
                  </Button>
                  <Button 
                    onClick={() => handleDeleteClick(device)}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
        <Button 
          onClick={() => setShowAddDeviceModal(true)} 
          className="w-full mt-4 bg-[#00B3B0] text-white hover:bg-[#009B98]"
        >
          Agregar Nuevo Dispositivo
        </Button>

        <AddDeviceModal 
          isOpen={showAddDeviceModal}
          onClose={() => setShowAddDeviceModal(false)}
          onAddDevice={handleAddDevice}
        />

        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle>Validación de Superusuario</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Por favor, ingrese las credenciales de superusuario para {actionType === 'edit' ? 'editar' : 'eliminar'} el dispositivo.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="superUsername" className="block text-sm font-medium text-gray-700">
                      Usuario Superusuario
                    </label>
                    <Input
                      id="superUsername"
                      value={superUsername}
                      onChange={(e) => setSuperUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="superPassword" className="block text-sm font-medium text-gray-700">
                      Contraseña Superusuario
                    </label>
                    <Input
                      id="superPassword"
                      type="password"
                      value={superPassword}
                      onChange={(e) => setSuperPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowDeleteDialog(false)
                  setSuperUsername('')
                  setSuperPassword('')
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={validateSuperuser}
                  disabled={validatingCredentials}
                  className="bg-[#00B3B0] text-white hover:bg-[#009B98]"
                >
                  {validatingCredentials ? 'Validando...' : 'Validar'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {selectedDevice && !showEditModal && !showDeleteDialog && (
          <DeviceDetails 
            device={selectedDevice}
            onClose={() => setSelectedDevice(null)}
          />
        )}
        {showEditModal && selectedDevice && (
          <EditDeviceModal
            device={selectedDevice}
            onClose={() => {
              setShowEditModal(false)
              setSelectedDevice(null)
            }}
            onUpdate={(updatedDevice) => {
              setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d))
              setShowEditModal(false)
              setSelectedDevice(null)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

