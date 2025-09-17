type ResourceTableProps = {
  data: any[];
  fields: string[];
  onRowClick?: (id: string) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
};

export default function ResourceTable({ 
  data, 
  fields, 
  onRowClick, 
  onEdit, 
  onDelete, 
  showActions = true 
}: ResourceTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No records found.</p>;
  }

  const renderCellContent = (value: any, field: string) => {
    if (value === null || value === undefined) {
      return "";
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return "";
        return value.map(item => {
          if (typeof item === 'object') {
            return item.display || item.code || item.value || item.text || JSON.stringify(item);
          }
          return String(item);
        }).join(', ');
      }
      
      if (value.coding && Array.isArray(value.coding)) {
        const firstCoding = value.coding[0];
        return value.text || firstCoding?.display || firstCoding?.code || "";
      }
      
      if (value.value !== undefined) {
        const unit = value.unit || value.code || "";
        return `${value.value}${unit ? ` ${unit}` : ""}`;
      }
      
      if (value.reference) {
        return value.display || value.reference;
      }
      
      if (value.start || value.end) {
        const start = value.start ? new Date(value.start).toLocaleDateString() : "";
        const end = value.end ? new Date(value.end).toLocaleDateString() : "";
        if (start && end) return `${start} - ${end}`;
        if (start) return `From ${start}`;
        if (end) return `Until ${end}`;
      }
      
      if (value.family || value.given) {
        const family = value.family || "";
        const given = Array.isArray(value.given) ? value.given.join(" ") : (value.given || "");
        const prefix = value.prefix ? (Array.isArray(value.prefix) ? value.prefix.join(" ") : value.prefix) + " " : "";
        const suffix = value.suffix ? " " + (Array.isArray(value.suffix) ? value.suffix.join(" ") : value.suffix) : "";
        return `${prefix}${given} ${family}${suffix}`.trim();
      }
      
      if (value.display) return value.display;
      if (value.text) return value.text;
      if (value.name) return value.name;
      
      const entries = Object.entries(value);
      if (entries.length <= 3) {
        return entries
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join(', ');
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

  const isLocalRecord = (item: any) => {
    // Check if this is a locally created record (has our generated ID pattern)
    return item.id && (
      item.id.startsWith('patient-') || 
      item.id.startsWith('condition-') || 
      item.id.startsWith('allergy-') ||
      item.id.startsWith('appointment-') ||
      item.id.startsWith('observation-')
    );
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
            <th className="px-4 py-2 font-medium">Source</th>
            {showActions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isLocal = isLocalRecord(row);
            return (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {fields.map((field) => (
                  <td key={field} className="px-4 py-2">
                    {renderCellContent(row[field], field)}
                  </td>
                ))}
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isLocal 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isLocal ? 'Local' : 'FHIR'}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {onRowClick && (
                        <button 
                          onClick={() => onRowClick(row.id)} // This line is changed
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </button>
                      )}
                      {onEdit && isLocal && (
                        <button 
                          onClick={() => onEdit(row)} 
                          className="text-green-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && isLocal && (
                        <button 
                          onClick={() => onDelete(row.id)} 
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      )}
                      {!isLocal && (onEdit || onDelete) && (
                        <span className="text-gray-400 text-xs">
                          (FHIR records cannot be modified)
                        </span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}