'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sprout, Sun } from 'lucide-react'

interface SensorReading {
  id: number
  temperature: number
  humidity: number
  soil_moisture: number
  light_intensity: number
  timestamp: string
}

interface SensorReadingsProps {
  deviceId: number
}

export function SensorReadings({ deviceId }: SensorReadingsProps) {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReadings()
    const interval = setInterval(fetchReadings, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [deviceId])

  const fetchReadings = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/sensor-readings/?device=${deviceId}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      } else {
        setError('Error al obtener las lecturas de los sensores')
      }
    } catch (error) {
      setError('Ocurrió un error al obtener las lecturas de los sensores')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Cargando lecturas de sensores...</div>
  }

  const latestReading = readings[0]

  if (!latestReading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lecturas de Sensores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay lecturas disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lecturas de Sensores</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Temperatura</span>
            </div>
            <p className="text-2xl font-bold mt-2">{latestReading.temperature}°C</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Humedad</span>
            </div>
            <p className="text-2xl font-bold mt-2">{latestReading.humidity}%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Humedad del Suelo</span>
            </div>
            <p className="text-2xl font-bold mt-2">{latestReading.soil_moisture}%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Intensidad de Luz</span>
            </div>
            <p className="text-2xl font-bold mt-2">{latestReading.light_intensity} lux</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-right">
          Última actualización: {new Date(latestReading.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}

