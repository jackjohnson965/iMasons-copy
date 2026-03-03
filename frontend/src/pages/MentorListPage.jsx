import { useState, useEffect } from 'react';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import JobCard from '../components/JobCard';
import FilterSidebar from '../components/FilterSidebar';

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

  const filterConfig = [
    { name: 'search', label: 'Search', type: 'text', placeholder: 'Search mentors...' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Dallas' },
    { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g., Technology' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <img src="/images/search-icon.png" alt="Mentor search" className="h-7 w-7 object-contain" />
        Browse Mentors
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} config={filterConfig} />
        </div>
        <div className="flex-1">
          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading mentors...</p>
          ) : mentors.length > 0 ? (
            <div className="space-y-4">
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
            <p className="text-gray-400 text-center py-12">No mentors found matching your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
