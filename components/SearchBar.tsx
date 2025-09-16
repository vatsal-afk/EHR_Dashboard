"use client";
import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void | Promise<void>;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="flex-1 border rounded px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
      >
        Search
      </button>
    </form>
  );
}
