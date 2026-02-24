import { Link } from 'react-router-dom';
import SkillTag from './SkillTag';

export default function StudentCard({ student }) {
  const skills = student.skills ? student.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <Link
        to={`/student/profile/${student.id}/view`}
        className="font-semibold text-gray-900 hover:text-blue-600"
      >
        {student.firstName} {student.lastName}
      </Link>
      {student.location && (
        <p className="text-sm text-gray-500 mt-1">📍 {student.location}</p>
      )}
      {student.bio && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{student.bio}</p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {skills.slice(0, 5).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {skills.length > 5 && (
            <span className="text-xs text-gray-400">+{skills.length - 5} more</span>
          )}
        </div>
      )}
      <div className="flex gap-3 mt-3 text-xs text-gray-400">
        {student.linkedinUrl && <span>LinkedIn</span>}
        {student.githubUrl && <span>GitHub</span>}
        {student.isActive ? (
          <span className="text-green-500">Available</span>
        ) : (
          <span className="text-gray-400">Not looking</span>
        )}
      </div>
    </div>
  );
}
