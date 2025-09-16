"use client";
import { useState, useEffect } from "react";
import ResourceTable from "@/components/ResourceTable";
import SearchBar from "@/components/SearchBar";

export default function PatientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Patients</h1>
      <SearchBar placeholder="Search by name..." onSearch={handleSearch} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResourceTable
          data={data}
          fields={["id", "name", "gender", "birthDate"]}
        />
      )}
    </div>
  );
}
