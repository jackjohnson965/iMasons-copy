import { Link } from 'react-router-dom';

const typeColors = {
  internship: 'bg-blue-100 text-blue-800',
  'full-time': 'bg-green-100 text-green-800',
  'part-time': 'bg-yellow-100 text-yellow-800',
  mentorship: 'bg-purple-100 text-purple-800',
};

export default function JobCard({ job, showSave, isSaved, onSave }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[job.jobType] || 'bg-gray-100 text-gray-800'}`}>
              {job.jobType}
            </span>
            {job.location && <span>📍 {job.location}</span>}
            {job.industry && <span>🏭 {job.industry}</span>}
          </div>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
        </div>
        {showSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(); }}
            disabled={isSaved}
            className={`ml-4 text-sm px-3 py-1 rounded-lg ${
              isSaved
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
