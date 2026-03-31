import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import JobCard from '../components/JobCard';

export default function JobListPage() {
  const { isStudent, userId } = useRole();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: '',
    jobType: searchParams.get('jobType') || '',
    industry: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('isActive', '1');
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.industry) params.append('industry', filters.industry);
    try {
      const data = await api.get(`/job-postings?${params.toString()}`);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!isStudent || !userId) return;
    try {
      const saved = await api.get(`/saved-postings?studentId=${userId}`);
      setSavedIds(new Set(saved.map((s) => s.jobPostingId)));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    fetchSaved();
  }, [isStudent, userId]);

  const handleSave = async (jobId) => {
    try {
      await api.post('/saved-postings', { studentId: userId, jobPostingId: jobId });
      setSavedIds((prev) => new Set([...prev, jobId]));
    } catch {
      /* already saved */
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/60 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-white mb-2">Browse Jobs</h1>
          <p className="text-white/40 text-sm">
            Explore opportunities across the iMasons digital infrastructure network.
          </p>

          {/* Inline search */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by title or keyword..."
                className="w-full bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
              />
            </div>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Location"
              className="bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm w-36 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
            />
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="bg-brand-dark-elevated/80 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
            >
              <option value="" className="bg-brand-dark-elevated">All Types</option>
              <option value="internship" className="bg-brand-dark-elevated">Internship</option>
              <option value="full-time" className="bg-brand-dark-elevated">Full Time</option>
              <option value="part-time" className="bg-brand-dark-elevated">Part Time</option>
              <option value="mentorship" className="bg-brand-dark-elevated">Mentorship</option>
            </select>
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              placeholder="Industry"
              className="bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm w-36 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ search: '', location: '', jobType: '', industry: '' })}
                className="text-xs text-white/40 hover:text-brand-cyan px-3 py-2.5 transition-colors"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Job feed */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/40">
            {loading ? 'Searching...' : `${jobs.length} ${jobs.length === 1 ? 'result' : 'results'} found`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-brand-cyan rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showSave={isStudent && userId}
                isSaved={savedIds.has(job.id)}
                onSave={() => handleSave(job.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark-card border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-white/40 font-medium mb-1">No jobs found</p>
            <p className="text-white/25 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </section>
    </div>
  );
}
