import { useState, useEffect } from 'react';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import JobCard from '../components/JobCard';
import Skeleton from '../components/Skeleton';

export default function MentorListPage() {
  const { isStudent, userId } = useRole();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    industry: '',
  });

  const fetchMentors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('isActive', '1');
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.industry) params.append('industry', filters.industry);
    try {
      const data = await api.get(`/mentors?${params.toString()}`);
      setMentors(data);
    } catch {
      setMentors([]);
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
    fetchMentors();
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
      <section className="bg-gradient-to-r from-brand-teal/30 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-white mb-2">Find Mentors</h1>
          <p className="text-white/40 text-sm">
            Connect with experienced professionals in the iMasons network.
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
                placeholder="Search mentorships..."
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
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              placeholder="Industry"
              className="bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm w-36 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ search: '', location: '', industry: '' })}
                className="text-xs text-white/40 hover:text-brand-cyan px-3 py-2.5 transition-colors"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mentor feed */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/40">
            {loading ? 'Searching...' : `${mentors.length} ${mentors.length === 1 ? 'result' : 'results'} found`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.JobCard key={i} />
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="space-y-3">
            {mentors.map((mentor) => (
              <JobCard
                key={mentor.id}
                job={mentor}
                showSave={isStudent && userId}
                isSaved={savedIds.has(mentor.id)}
                onSave={() => handleSave(mentor.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark-card border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v-1" />
              </svg>
            </div>
            <p className="text-white/40 font-medium mb-1">No mentorships found</p>
            <p className="text-white/25 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </section>
    </div>
  );
}
