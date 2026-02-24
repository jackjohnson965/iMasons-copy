export default function FilterSidebar({ filters, onChange, config }) {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Filters</h3>
      {config.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      ))}
      <button
        onClick={() => {
          const cleared = {};
          config.forEach((f) => { cleared[f.name] = ''; });
          onChange(cleared);
        }}
        className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
      >
        Clear Filters
      </button>
    </div>
  );
}
