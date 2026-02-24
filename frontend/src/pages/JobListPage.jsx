import { useState, useEffect } from 'react';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import JobCard from '../components/JobCard';
import FilterSidebar from '../components/FilterSidebar';

export default function JobListPage() {
  const { isStudent, userId } = useRole();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
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

  const filterConfig = [
    { name: 'search', label: 'Search', type: 'text', placeholder: 'Search jobs...' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Dallas' },
    {
      name: 'jobType',
      label: 'Job Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'internship', label: 'Internship' },
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'mentorship', label: 'Mentorship' },
      ],
    },
    { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g., Technology' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Jobs</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} config={filterConfig} />
        </div>
        <div className="flex-1">
          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading jobs...</p>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
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
            <p className="text-gray-400 text-center py-12">No jobs found matching your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
