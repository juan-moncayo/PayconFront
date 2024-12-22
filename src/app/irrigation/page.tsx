'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IrrigationSchedule } from '@/components/irrigation-schedule'
import { IrrigationLogs } from '@/components/irrigation-logs'

interface Device {
  id: number
  name: string
}

export default function IrrigationPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        if (data.length > 0) {
          setSelectedDevice(data[0])
        }
      } else {
        setError('Error al obtener los dispositivos')
      }
    } catch (error) {
      setError('Ocurrió un error al obtener los dispositivos')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Cargando dispositivos...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Riego</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="device-select" className="block text-sm font-medium text-gray-700">
              Seleccionar Dispositivo
            </label>
            <select
              id="device-select"
              value={selectedDevice?.id || ''}
              onChange={(e) => {
                const device = devices.find(d => d.id === parseInt(e.target.value))
                setSelectedDevice(device || null)
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
          {selectedDevice && (
            <>
              <IrrigationSchedule deviceId={selectedDevice.id} />
              <div className="mt-8">
                <IrrigationLogs device={selectedDevice} onClose={() => {}} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

