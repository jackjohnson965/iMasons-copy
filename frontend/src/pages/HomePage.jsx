import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function HomePage() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      navigate('/jobs');
    } else {
      navigate('/employer/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to iMasons Job Board
      </h1>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-xl">
        Connecting students and employers through the iMasons network for
        internships, mentorships, and employment opportunities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => handleRoleSelect('student')}
          className="bg-white border-2 border-blue-200 hover:border-blue-500 rounded-xl p-8 text-center transition-all hover:shadow-lg cursor-pointer"
        >
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            I'm a Student
          </h2>
          <p className="text-gray-500 text-sm">
            Browse jobs, create your profile, and connect with employers
          </p>
        </button>
        <button
          onClick={() => handleRoleSelect('employer')}
          className="bg-white border-2 border-green-200 hover:border-green-500 rounded-xl p-8 text-center transition-all hover:shadow-lg cursor-pointer"
        >
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            I'm an Employer
          </h2>
          <p className="text-gray-500 text-sm">
            Post opportunities, browse students, and track analytics
          </p>
        </button>
      </div>
    </div>
  );
}
