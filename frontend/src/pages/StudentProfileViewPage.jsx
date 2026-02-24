import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import SkillTag from '../components/SkillTag';

export default function StudentProfileViewPage() {
  const { id } = useParams();
  const { role } = useRole();
  const { data: student, loading } = useFetch(`/students/${id}`);

  useEffect(() => {
    if (id && role) {
      api.post('/analytics/events', {
        eventType: 'profile_view',
        targetId: Number(id),
        viewerRole: role,
      }).catch(() => {});
    }
  }, [id, role]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-gray-500">Student not found</div>;

  const skills = student.skills ? student.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/students" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Students
      </Link>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {student.isActive ? 'Available' : 'Not looking'}
          </span>
        </div>

        {student.location && (
          <p className="text-gray-500 mb-4">📍 {student.location}</p>
        )}

        {student.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">About</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{student.bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Links</h3>
          {student.resumeLink && (
            <a href={student.resumeLink} target="_blank" rel="noreferrer" className="block text-blue-600 hover:text-blue-800 text-sm">
              Resume
            </a>
          )}
          {student.linkedinUrl && (
            <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="block text-blue-600 hover:text-blue-800 text-sm">
              LinkedIn
            </a>
          )}
          {student.githubUrl && (
            <a href={student.githubUrl} target="_blank" rel="noreferrer" className="block text-blue-600 hover:text-blue-800 text-sm">
              GitHub
            </a>
          )}
          {student.portfolioUrl && (
            <a href={student.portfolioUrl} target="_blank" rel="noreferrer" className="block text-blue-600 hover:text-blue-800 text-sm">
              Portfolio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
