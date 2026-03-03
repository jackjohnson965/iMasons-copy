import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import ImasonsLogo from './ImasonsLogo';

export default function Navbar() {
  const { role, linkedProfileId, isStudent, isEmployer, isAdmin, isAuthenticated, clearRole } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearRole();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-brand-purple/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center shrink-0" aria-label="iMasons home">
            <ImasonsLogo className="h-9" />
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-brand-purple transition-colors"
              >
                Jobs
              </Link>
              <Link
                to="/mentors"
                className="text-gray-600 hover:text-brand-purple transition-colors"
              >
                Mentors
              </Link>
              <Link
                to="/students"
                className="text-gray-600 hover:text-brand-purple transition-colors"
              >
                Students
              </Link>
              {isStudent && linkedProfileId && (
                <>
                  <Link
                    to={`/student/profile/${linkedProfileId}`}
                    className="text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    to={`/student/dashboard/${linkedProfileId}`}
                    className="text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {isEmployer && linkedProfileId && (
                <>
                  <Link
                    to={`/employer/dashboard/${linkedProfileId}`}
                    className="text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs/new"
                    className="text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/mentors/new"
                    className="text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    Post Mentorship
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="text-gray-600 hover:text-brand-purple transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: auth controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-xs font-semibold capitalize bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-brand-teal hover:text-brand-purple transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-brand-purple px-3 py-1 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-brand-purple hover:bg-brand-purple-dark text-white px-4 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
