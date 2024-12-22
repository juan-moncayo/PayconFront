import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Device {
  id: number;
  name: string;
}

interface IrrigationSchedule {
  id: number;
  device: number;
  start_time: string;
  duration: number;
  days: string;
  is_active: boolean;
}

export function IrrigationSchedule() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    start_time: '',
    duration: 0,
    days: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchSchedules();
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const profileResponse = await fetch('http://localhost:8000/api/user-profile/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.default_device) {
          setSelectedDevice(profileData.default_device.id);
          setDevices([profileData.default_device]);
        } else {
          const devicesResponse = await fetch('http://localhost:8000/api/devices/', {
            headers: {
              'Authorization': `Token ${token}`
            }
          });

          if (devicesResponse.ok) {
            const devicesData = await devicesResponse.json();
            setDevices(devicesData);
            if (devicesData.length > 0) {
              setSelectedDevice(devicesData[0].id);
            }
          } else {
            setError('Error al obtener los dispositivos');
          }
        }
      } else {
        setError('Error al obtener el perfil del usuario');
      }
    } catch (error) {
      setError('Ocurrió un error al obtener la información del dispositivo');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedDevice) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/irrigation-schedules/?device=${selectedDevice}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        setError('Error al obtener los horarios de riego');
      }
    } catch (error) {
      setError('Ocurrió un error al obtener los horarios de riego');
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) {
      setError('No se ha seleccionado ningún dispositivo');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Selected Device ID:', selectedDevice);

    const scheduleData = {
      device_id: selectedDevice,
      start_time: newSchedule.start_time,
      duration: parseInt(newSchedule.duration.toString()),
      days: newSchedule.days,
      is_active: true
    };

    try {
      const response = await fetch('http://localhost:8000/api/irrigation-schedules/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules([...schedules, data]);
        setNewSchedule({ start_time: '', duration: 0, days: '' });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al agregar el horario de riego');
      }
    } catch (error) {
      setError('Ocurrió un error al agregar el horario de riego');
    }
  };

  const handleToggleActive = async (scheduleId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/irrigation-schedules/${scheduleId}/toggle/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const updatedSchedule = await response.json();
        setSchedules(schedules.map(schedule =>
          schedule.id === scheduleId ? { ...schedule, is_active: updatedSchedule.is_active } : schedule
        ));
      } else {
        setError('Error al cambiar el estado del horario');
      }
    } catch (error) {
      setError('Ocurrió un error al cambiar el estado del horario');
    }
  };

  if (isLoading) {
    return <div>Cargando dispositivos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Riego</CardTitle>
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
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <p className="font-medium">Hora de inicio: {schedule.start_time}</p>
                <p>Duración: {schedule.duration} minutos</p>
                <p>Días: {schedule.days}</p>
              </div>
              <Button
                onClick={() => handleToggleActive(schedule.id)}
                className={schedule.is_active ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
              >
                {schedule.is_active ? "Activo" : "Inactivo"}
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddSchedule} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Hora de inicio</Label>
            <Input
              id="start_time"
              type="time"
              value={newSchedule.start_time}
              onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={newSchedule.duration}
              onChange={(e) => setNewSchedule({...newSchedule, duration: parseInt(e.target.value)})}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days">Días de la semana</Label>
            <Select
              value={newSchedule.days}
              onValueChange={(value) => setNewSchedule({...newSchedule, days: value})}
            >
              <SelectTrigger id="days">
                <SelectValue placeholder="Selecciona los días" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0123456">Todos los días</SelectItem>
                <SelectItem value="12345">Lunes a Viernes</SelectItem>
                <SelectItem value="06">Fines de semana</SelectItem>
                <SelectItem value="135">Lunes, Miércoles, Viernes</SelectItem>
                <SelectItem value="024">Martes, Jueves, Sábado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-[#00B3B0] text-white hover:bg-[#009B98]">
            Agregar Horario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

