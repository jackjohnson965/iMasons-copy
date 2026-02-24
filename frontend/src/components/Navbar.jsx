import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function Navbar() {
  const { role, userId, isStudent, isEmployer, clearRole } = useRole();
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    clearRole();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-700">
            iMasons Job Board
          </Link>
          {role && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Jobs</Link>
              <Link to="/students" className="text-gray-600 hover:text-gray-900">Students</Link>
              {isStudent && userId && (
                <>
                  <Link to={`/student/profile/${userId}`} className="text-gray-600 hover:text-gray-900">My Profile</Link>
                  <Link to={`/student/dashboard/${userId}`} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                </>
              )}
              {isEmployer && userId && (
                <>
                  <Link to={`/employer/dashboard/${userId}`} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                  <Link to="/jobs/new" className="text-gray-600 hover:text-gray-900">Post Job</Link>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {role && (
            <>
              <span className="text-xs text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">
                {role}
              </span>
              <button
                onClick={handleSwitchRole}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Switch Role
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
