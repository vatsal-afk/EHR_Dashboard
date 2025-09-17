"use client";
import { useState, useEffect } from "react";
import ResourceTable from "@/components/ResourceTable";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPatient, setNewPatient] = useState({ id: "", name: "", gender: "", birthDate: "" });
  const router = useRouter();

  const fetchPatients = async (query: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients${query}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = async (name: string) => {
    if (!name) return fetchPatients();
    await fetchPatients(`?name=${encodeURIComponent(name)}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      setNewPatient({ id: "", name: "", gender: "", birthDate: "" });
      fetchPatients();
    } catch (err) {
      console.error("Failed to create patient", err);
    }
  };

  const handleRowClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Patients</h1>
      <SearchBar placeholder="Search by name..." onSearch={handleSearch} />

      <div className="mt-4 p-4 border rounded-lg">
        <h2 className="text-lg font-bold mb-2">Create New Patient</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="ID"
            value={newPatient.id}
            onChange={(e) => setNewPatient({ ...newPatient, id: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Gender"
            value={newPatient.gender}
            onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Birth Date (YYYY-MM-DD)"
            value={newPatient.birthDate}
            onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm">
            Create
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResourceTable
          data={data}
          fields={["id", "name", "gender", "birthDate"]}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}