export default function FilterSidebar({ filters, onChange, config }) {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </h3>
      {config.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-white/50 mb-1.5">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full bg-brand-dark-elevated border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-brand-dark-elevated">
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.name === 'search' ? (
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={filters[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
              />
            </div>
          ) : (
            <input
              type="text"
              value={filters[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
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
        className="w-full text-sm text-white/30 hover:text-brand-cyan py-1.5 transition-colors flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear Filters
      </button>
    </div>
  );
}
