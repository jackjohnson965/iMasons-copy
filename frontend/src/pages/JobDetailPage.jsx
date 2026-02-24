import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';

export default function JobDetailPage() {
  const { id } = useParams();
  const { isStudent, userId, role } = useRole();
  const { data: job, loading } = useFetch(`/job-postings/${id}`);
  const { data: employer } = useFetch(job ? `/employers/${job.employerId}` : null);

  useEffect(() => {
    if (id && role) {
      api.post('/analytics/events', {
        eventType: 'posting_view',
        targetId: Number(id),
        viewerRole: role,
      }).catch(() => {});
    }
  }, [id, role]);

  const handleSave = async () => {
    try {
      await api.post('/saved-postings', { studentId: userId, jobPostingId: Number(id) });
      alert('Job saved!');
    } catch {
      alert('Already saved or error occurred');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  const typeColors = {
    internship: 'bg-blue-100 text-blue-800',
    'full-time': 'bg-green-100 text-green-800',
    'part-time': 'bg-yellow-100 text-yellow-800',
    mentorship: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/jobs" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Jobs
      </Link>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            {employer && (
              <p className="text-gray-600 mt-1">{employer.companyName}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[job.jobType] || 'bg-gray-100 text-gray-800'}`}>
            {job.jobType}
          </span>
        </div>

        <div className="flex gap-4 text-sm text-gray-500 mb-6">
          {job.location && <span>📍 {job.location}</span>}
          {job.industry && <span>🏭 {job.industry}</span>}
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.customQuestions?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Questions</h3>
            <ol className="list-decimal list-inside space-y-2">
              {job.customQuestions.map((q) => (
                <li key={q.id} className="text-gray-700">{q.questionText}</li>
              ))}
            </ol>
          </div>
        )}

        {employer && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Employer</h3>
            <p className="font-medium text-gray-800">{employer.companyName}</p>
            {employer.description && <p className="text-gray-600 text-sm mt-1">{employer.description}</p>}
            {employer.websiteUrl && (
              <a href={employer.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block">
                Visit website
              </a>
            )}
          </div>
        )}

        {isStudent && userId && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save for Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
