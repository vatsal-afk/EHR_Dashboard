type ResourceTableProps = {
  data: any[];
  fields: string[];
  onRowClick?: (id: string) => void;
};

export default function ResourceTable({ data, fields, onRowClick }: ResourceTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No records found.</p>;
  }

  const renderCellContent = (value: any, field: string) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '';
        return value
          .map((item) => {
            if (typeof item === 'object') {
              return item.display || item.code || item.value || item.text || JSON.stringify(item);
            }
            return String(item);
          })
          .join(', ');
      }
      if (value.coding && Array.isArray(value.coding)) {
        const firstCoding = value.coding[0];
        return value.text || firstCoding?.display || firstCoding?.code || '';
      }
      if (value.value !== undefined) {
        const unit = value.unit || value.code || '';
        return `${value.value}${unit ? ` ${unit}` : ''}`;
      }
      if (value.reference) {
        return value.display || value.reference;
      }
      if (value.start || value.end) {
        const start = value.start ? new Date(value.start).toLocaleDateString() : '';
        const end = value.end ? new Date(value.end).toLocaleDateString() : '';
        if (start && end) return `${start} - ${end}`;
        if (start) return `From ${start}`;
        if (end) return `Until ${end}`;
      }
      if (value.family || value.given) {
        const family = value.family || '';
        const given = Array.isArray(value.given) ? value.given.join(' ') : value.given || '';
        const prefix = value.prefix ? (Array.isArray(value.prefix) ? value.prefix.join(' ') : value.prefix) + ' ' : '';
        const suffix = value.suffix ? ' ' + (Array.isArray(value.suffix) ? value.suffix.join(' ') : value.suffix) : '';
        return `${prefix}${given} ${family}${suffix}`.trim();
      }
      if (value.display) return value.display;
      if (value.text) return value.text;
      if (value.name) return value.name;
      const entries = Object.entries(value);
      if (entries.length <= 3) {
        return entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ');
      }
      return JSON.stringify(value);
    }
    if (field.toLowerCase().includes('date') || field.toLowerCase().includes('time')) {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toLocaleDateString();
      }
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {fields.map((field) => (
              <th key={field} className="px-4 py-2 font-medium capitalize">
                {field}
              </th>
            ))}
            {onRowClick && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 cursor-pointer">
              {fields.map((field) => (
                <td key={field} className="px-4 py-2" onClick={() => onRowClick && onRowClick(row.id)}>
                  {renderCellContent(row[field], field)}
                </td>
              ))}
              {onRowClick && (
                <td className="px-4 py-2">
                  <button onClick={() => onRowClick(row.id)} className="text-blue-600 hover:underline">
                    View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}