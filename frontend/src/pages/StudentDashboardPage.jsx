import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { api } from '../api';
import JobCard from '../components/JobCard';
import StatCard from '../components/StatCard';

export default function StudentDashboardPage() {
  const { id } = useParams();
  const { data: student, loading: studentLoading } = useFetch(`/students/${id}`);
  const { data: saved, loading: savedLoading, refetch: refetchSaved } = useFetch(`/saved-postings?studentId=${id}`);
  const { data: analytics } = useFetch(`/analytics/student/${id}`);

  const handleUnsave = async (savedId) => {
    await api.delete(`/saved-postings/${savedId}`);
    refetchSaved();
  };

  if (studentLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-gray-500">Student not found</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {student.firstName}!
          </h1>
          <p className="text-gray-500">{student.email}</p>
        </div>
        <Link
          to={`/student/profile/${id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Profile Views" value={analytics?.totalViews ?? 0} />
        <StatCard label="Saved Jobs" value={saved?.length ?? 0} />
        <StatCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Jobs</h2>
      {savedLoading ? (
        <p className="text-gray-500">Loading saved jobs...</p>
      ) : saved?.length > 0 ? (
        <div className="space-y-4">
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="flex-1">
                <JobCard job={s.jobPosting} />
              </div>
              <button
                onClick={() => handleUnsave(s.id)}
                className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap"
              >
                Unsave
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 py-8 text-center">No saved jobs yet. Browse jobs to save some!</p>
      )}
    </div>
  );
}
