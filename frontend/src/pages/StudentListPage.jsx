import { useState, useEffect } from 'react';
import { api } from '../api';
import StudentCard from '../components/StudentCard';
import FilterSidebar from '../components/FilterSidebar';

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

  const filterConfig = [
    { name: 'search', label: 'Search', type: 'text', placeholder: 'Search students...' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Dallas' },
    { name: 'skills', label: 'Skills', type: 'text', placeholder: 'e.g., Python' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Students</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} config={filterConfig} />
        </div>
        <div className="flex-1">
          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading students...</p>
          ) : students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">No students found matching your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
