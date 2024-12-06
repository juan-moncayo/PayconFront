import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Device {
  id: number
  name: string
  created_at: string
  updated_at: string
  latest_reading: SensorReading | null
}

interface SensorReading {
  id: number
  temperature: number
  humidity: number
  air_quality: number
  timestamp: string
}

interface DeviceDetailsProps {
  device: Device
  onClose: () => void
}

export function DeviceDetails({ device, onClose }: DeviceDetailsProps) {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReadings()
  }, [device.id])

  const fetchReadings = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/devices/${device.id}/readings/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      } else {
        setError('Error al obtener las lecturas')
      }
    } catch (error) {
      setError('Ocurrió un error al obtener las lecturas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Cargando lecturas...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{device.name} - Lecturas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {readings.map((reading) => (
            <div key={reading.id} className="p-2 bg-gray-100 rounded">
              <p>Temperatura: {reading.temperature}°C</p>
              <p>Humedad: {reading.humidity}%</p>
              <p>Calidad del Aire: {reading.air_quality}</p>
              <p>Fecha: {new Date(reading.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <Button onClick={onClose} className="mt-4">
          Cerrar
        </Button>
      </CardContent>
    </Card>
  )
}

