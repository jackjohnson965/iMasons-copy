import { useState, useEffect } from 'react';
import { api } from '../api';
import StudentCard from '../components/StudentCard';
import Skeleton from '../components/Skeleton';

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    skills: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('isActive', '1');
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.skills) params.append('skills', filters.skills);
      try {
        const data = await api.get(`/students?${params.toString()}`);
        setStudents(data);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
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
          <h1 className="text-3xl font-black text-white mb-2">Student Directory</h1>
          <p className="text-white/40 text-sm">
            Discover talented students from universities worldwide.
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
                placeholder="Search by name or keyword..."
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
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
              placeholder="Skills"
              className="bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm w-36 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ search: '', location: '', skills: '' })}
                className="text-xs text-white/40 hover:text-brand-cyan px-3 py-2.5 transition-colors"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Student grid */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/40">
            {loading ? 'Searching...' : `${students.length} ${students.length === 1 ? 'student' : 'students'} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.StudentCard key={i} />
            ))}
          </div>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark-card border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-white/40 font-medium mb-1">No students found</p>
            <p className="text-white/25 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </section>
    </div>
  );
}
