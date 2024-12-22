import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Device {
  id: number
  name: string
}

interface IrrigationLog {
  id: number
  start_time: string
  end_time: string
  water_used: number
}

export function IrrigationLogs() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [logs, setLogs] = useState<IrrigationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices();
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchLogs()
    }
  }, [selectedDevice])

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
          setSelectedDevice(data[0].id)
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

  const fetchLogs = async () => {
    if (!selectedDevice) return;

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Esta URL parece estar correcta, pero la dejamos aquí para referencia
      const response = await fetch(`http://localhost:8000/api/irrigation-logs/?device=${selectedDevice}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      } else {
        setError('Error al obtener los registros de riego')
      }
    } catch (error) {
      setError('Ocurrió un error al obtener los registros de riego')
    }
  }

  if (isLoading) {
    return <div>Cargando dispositivos...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Riego</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <Label htmlFor="device-select">Seleccionar Dispositivo</Label>
          <Select
            value={selectedDevice?.toString() || ''}
            onValueChange={(value) => setSelectedDevice(Number(value))}
          >
            <SelectTrigger id="device-select">
              <SelectValue placeholder="Seleccione un dispositivo" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id.toString()}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-2 bg-gray-100 rounded">
              <p>Inicio: {new Date(log.start_time).toLocaleString()}</p>
              <p>Fin: {new Date(log.end_time).toLocaleString()}</p>
              <p>Agua utilizada: {log.water_used} litros</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

