export default function FilterSidebar({ filters, onChange, config }) {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-brand-dark-card border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-white">Filters</h3>
      {config.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-white/60 mb-1">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full bg-brand-dark-elevated border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-brand-dark-elevated">
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.name === 'search' ? (
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <img src="/images/search-icon.png" alt="" className="h-4 w-4 object-contain opacity-50" aria-hidden="true" />
              </span>
              <input
                type="text"
                value={filters[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
              />
            </div>
          ) : (
            <input
              type="text"
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
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
        className="w-full text-sm text-white/40 hover:text-brand-cyan py-1 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
