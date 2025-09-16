'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointments = async (query?: string) => {
    let url = '/api/appointments';
    if (query) url += `?date=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <SearchBar onSearch={fetchAppointments} />
      <ResourceTable data={appointments} />
    </div>
  );
}
