import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Device {
  id: number
  name: string
  mqtt_server: string
  mqtt_port: number
  mqtt_username: string
  mqtt_password: string
  mqtt_vhost: string
  mqtt_exchange: string
  mqtt_routing_key: string
}

interface EditDeviceModalProps {
  device: Device
  onClose: () => void
  onUpdate: (device: Device) => void
}

export function EditDeviceModal({ device, onClose, onUpdate }: EditDeviceModalProps) {
  const [deviceData, setDeviceData] = useState({
    name: device.name,
    mqtt_server: device.mqtt_server,
    mqtt_port: device.mqtt_port,
    mqtt_username: device.mqtt_username,
    mqtt_password: '',
    mqtt_vhost: device.mqtt_vhost,
    mqtt_exchange: device.mqtt_exchange,
    mqtt_routing_key: device.mqtt_routing_key
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/devices/${device.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...deviceData,
          mqtt_port: parseInt(deviceData.mqtt_port.toString())
        })
      })

      if (response.ok) {
        const updatedDevice = await response.json()
        onUpdate(updatedDevice)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar el dispositivo')
      }
    } catch (error) {
      setError('Ocurrió un error al actualizar el dispositivo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Editar Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre del dispositivo
              </label>
              <Input
                id="name"
                value={deviceData.name}
                onChange={(e) => setDeviceData({...deviceData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_server" className="block text-sm font-medium text-gray-700">
                Servidor MQTT
              </label>
              <Input
                id="mqtt_server"
                value={deviceData.mqtt_server}
                onChange={(e) => setDeviceData({...deviceData, mqtt_server: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_port" className="block text-sm font-medium text-gray-700">
                Puerto MQTT
              </label>
              <Input
                id="mqtt_port"
                type="number"
                value={deviceData.mqtt_port}
                onChange={(e) => setDeviceData({...deviceData, mqtt_port: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_username" className="block text-sm font-medium text-gray-700">
                Usuario MQTT
              </label>
              <Input
                id="mqtt_username"
                value={deviceData.mqtt_username}
                onChange={(e) => setDeviceData({...deviceData, mqtt_username: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_password" className="block text-sm font-medium text-gray-700">
                Contraseña MQTT (dejar en blanco para mantener la actual)
              </label>
              <Input
                id="mqtt_password"
                type="password"
                value={deviceData.mqtt_password}
                onChange={(e) => setDeviceData({...deviceData, mqtt_password: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="mqtt_vhost" className="block text-sm font-medium text-gray-700">
                VHost MQTT
              </label>
              <Input
                id="mqtt_vhost"
                value={deviceData.mqtt_vhost}
                onChange={(e) => setDeviceData({...deviceData, mqtt_vhost: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_exchange" className="block text-sm font-medium text-gray-700">
                Exchange MQTT
              </label>
              <Input
                id="mqtt_exchange"
                value={deviceData.mqtt_exchange}
                onChange={(e) => setDeviceData({...deviceData, mqtt_exchange: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="mqtt_routing_key" className="block text-sm font-medium text-gray-700">
                Routing Key MQTT
              </label>
              <Input
                id="mqtt_routing_key"
                value={deviceData.mqtt_routing_key}
                onChange={(e) => setDeviceData({...deviceData, mqtt_routing_key: e.target.value})}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={onClose} variant="outline">
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

