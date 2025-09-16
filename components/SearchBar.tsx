'use client';
import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="flex space-x-2 mb-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border px-2 py-1 flex-1"
        placeholder="Search..."
      />
      <button
        onClick={() => onSearch(value)}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Search
      </button>
    </div>
  );
}
