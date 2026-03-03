import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function Navbar() {
  const { role, linkedProfileId, isStudent, isEmployer, isAdmin, isAuthenticated, clearRole } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
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
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Jobs</Link>
              <Link to="/students" className="text-gray-600 hover:text-gray-900">Students</Link>
              {isStudent && linkedProfileId && (
                <>
                  <Link to={`/student/profile/${linkedProfileId}`} className="text-gray-600 hover:text-gray-900">My Profile</Link>
                  <Link to={`/student/dashboard/${linkedProfileId}`} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                </>
              )}
              {isEmployer && linkedProfileId && (
                <>
                  <Link to={`/employer/dashboard/${linkedProfileId}`} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                  <Link to="/jobs/new" className="text-gray-600 hover:text-gray-900">Post Job</Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">Admin Panel</Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-xs text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">Sign In</Link>
              <Link to="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
