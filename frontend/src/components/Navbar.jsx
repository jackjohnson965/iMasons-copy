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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center shrink-0" aria-label="iMasons home">
            <ImasonsLogo variant="dark" className="h-9" />
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/jobs" className="text-white/70 hover:text-white transition-colors">
                Jobs
              </Link>
              <Link to="/mentors" className="text-white/70 hover:text-white transition-colors">
                Mentors
              </Link>
              <Link to="/students" className="text-white/70 hover:text-white transition-colors">
                Students
              </Link>
              {isStudent && linkedProfileId && (
                <>
                  <Link
                    to={`/student/profile/${linkedProfileId}`}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    to={`/student/dashboard/${linkedProfileId}`}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {isEmployer && linkedProfileId && (
                <>
                  <Link
                    to={`/employer/dashboard/${linkedProfileId}`}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link to="/jobs/new" className="text-white/70 hover:text-white transition-colors">
                    Post Job
                  </Link>
                  <Link to="/mentors/new" className="text-white/70 hover:text-white transition-colors">
                    Post Mentorship
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/dashboard" className="text-white/70 hover:text-white transition-colors">
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
              <span className="text-xs font-semibold capitalize bg-brand-cyan/20 text-brand-cyan px-3 py-1 rounded-full border border-brand-cyan/30">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-white/70 hover:text-white px-3 py-1 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold border border-white/40 text-white hover:bg-white hover:text-black px-4 py-1.5 rounded-lg transition-all"
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
