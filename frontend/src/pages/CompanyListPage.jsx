import { useState, useEffect } from 'react';
import { api } from '../api';
import CompanyCard from '../components/CompanyCard';
import Skeleton from '../components/Skeleton';

export default function CompanyListPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.industry) params.append('industry', filters.industry);
      try {
        const data = await api.get(`/employers?${params.toString()}`);
        setCompanies(data);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-white mb-2">Company Directory</h1>
          <p className="text-white/40 text-sm">
            Discover companies and explore their open positions.
          </p>

          {/* Inline filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by company name or description..."
                className="w-full bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
              />
            </div>
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              placeholder="Industry"
              className="bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm w-36 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ search: '', industry: '' })}
                className="text-xs text-white/40 hover:text-brand-cyan px-3 py-2.5 transition-colors"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Company grid */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/40">
            {loading ? 'Searching...' : `${companies.length} ${companies.length === 1 ? 'company' : 'companies'} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.CompanyCard key={i} />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark-card border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-white/40 font-medium mb-1">No companies found</p>
            <p className="text-white/25 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </section>
    </div>
  );
}