import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Device {
  id: number
  name: string
  created_at: string
  updated_at: string
  latest_reading: null
  mqtt_server: string
  mqtt_port: number
  mqtt_username: string
  mqtt_password: string
  mqtt_vhost: string
  mqtt_exchange: string
  mqtt_routing_key: string
  user: number
}

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDevice: (device: Device) => void
}

export function AddDeviceModal({ isOpen, onClose, onAddDevice }: AddDeviceModalProps) {
  const [step, setStep] = useState(1)
  const [deviceName, setDeviceName] = useState('')
  const [superUsername, setSuperUsername] = useState('')
  const [superPassword, setSuperPassword] = useState('')
  const [mqttConfig, setMqttConfig] = useState({
    server: '',
    port: '',
    username: '',
    password: '',
    vhost: '',
    exchange: '',
    routingKey: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      resetForm()
      fetchUserId()
    }
  }, [isOpen])

  const fetchUserId = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUserId(userData.id)
      }
    } catch (error) {
      console.error('Error fetching user ID:', error)
    }
  }

  const handleSuperuserValidation = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setStep(2)
        setError(null)
      } else {
        setError('Credenciales de superusuario inválidas')
      }
    } catch (error) {
      setError('Ocurrió un error al validar las credenciales')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token || !userId) return

    try {
      const requestBody = {
        name: deviceName,
        mqtt_server: mqttConfig.server,
        mqtt_port: parseInt(mqttConfig.port),
        mqtt_username: mqttConfig.username,
        mqtt_password: mqttConfig.password,
        mqtt_vhost: mqttConfig.vhost,
        mqtt_exchange: mqttConfig.exchange,
        mqtt_routing_key: mqttConfig.routingKey,
        user: userId // Add the user ID to the request
      }

      console.log('Request body:', requestBody)

      const response = await fetch('http://localhost:8000/api/devices/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log('Response:', response.status, responseData)

      if (response.ok) {
        onAddDevice(responseData)
        onClose()
        resetForm()
      } else {
        if (typeof responseData === 'object') {
          const errorMessage = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
          setError(errorMessage)
        } else {
          setError(responseData.error || 'Error al agregar el dispositivo')
        }
      }
    } catch (error) {
      console.error('Error completo:', error)
      setError('Ocurrió un error al agregar el dispositivo')
    }
  }

  const resetForm = () => {
    setStep(1)
    setDeviceName('')
    setSuperUsername('')
    setSuperPassword('')
    setMqttConfig({
      server: '',
      port: '',
      username: '',
      password: '',
      vhost: '',
      exchange: '',
      routingKey: ''
    })
    setError(null)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Agregar Nuevo Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSuperuserValidation} className="space-y-4">
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
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={onClose} variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00B3B0] text-white hover:bg-[#009B98]">
                  Validar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">
                  Nombre del dispositivo (ESP32)
                </label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttServer" className="block text-sm font-medium text-gray-700">
                  Servidor MQTT (RabbitMQ)
                </label>
                <Input
                  id="mqttServer"
                  value={mqttConfig.server}
                  onChange={(e) => setMqttConfig({...mqttConfig, server: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttPort" className="block text-sm font-medium text-gray-700">
                  Puerto MQTT
                </label>
                <Input
                  id="mqttPort"
                  type="number"
                  value={mqttConfig.port}
                  onChange={(e) => setMqttConfig({...mqttConfig, port: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttUsername" className="block text-sm font-medium text-gray-700">
                  Usuario MQTT
                </label>
                <Input
                  id="mqttUsername"
                  value={mqttConfig.username}
                  onChange={(e) => setMqttConfig({...mqttConfig, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttPassword" className="block text-sm font-medium text-gray-700">
                  Contraseña MQTT
                </label>
                <Input
                  id="mqttPassword"
                  type="password"
                  value={mqttConfig.password}
                  onChange={(e) => setMqttConfig({...mqttConfig, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttVhost" className="block text-sm font-medium text-gray-700">
                  VHost MQTT
                </label>
                <Input
                  id="mqttVhost"
                  value={mqttConfig.vhost}
                  onChange={(e) => setMqttConfig({...mqttConfig, vhost: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttExchange" className="block text-sm font-medium text-gray-700">
                  Exchange MQTT
                </label>
                <Input
                  id="mqttExchange"
                  value={mqttConfig.exchange}
                  onChange={(e) => setMqttConfig({...mqttConfig, exchange: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="mqttRoutingKey" className="block text-sm font-medium text-gray-700">
                  Routing Key MQTT
                </label>
                <Input
                  id="mqttRoutingKey"
                  value={mqttConfig.routingKey}
                  onChange={(e) => setMqttConfig({...mqttConfig, routingKey: e.target.value})}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={onClose} variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00B3B0] text-white hover:bg-[#009B98]">
                  Agregar Dispositivo
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

