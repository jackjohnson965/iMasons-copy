import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import ImasonsLogo from './ImasonsLogo';

function DropdownMenu({ label, items, currentPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = items.some((item) => currentPath.startsWith(item.to));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isActive ? 'text-brand-cyan' : 'text-white/70 hover:text-white'
        }`}
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-brand-dark-card border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                currentPath === item.to
                  ? 'bg-brand-purple/20 text-brand-cyan'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <span className="block text-xs text-white/40 mt-0.5">{item.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { role, linkedProfileId, isStudent, isEmployer, isAdmin, isAuthenticated, clearRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearRole();
    navigate('/');
  };

  const exploreItems = [
    { to: '/jobs', label: 'Browse Jobs', description: 'Search open positions' },
    { to: '/mentors', label: 'Mentorships', description: 'Find a mentor' },
    { to: '/students', label: 'Student Directory', description: 'Discover talent' },
    { to: '/resources', label: 'Resources', description: 'Guides & tools' },
  ];

  const studentItems = isStudent && linkedProfileId ? [
    { to: `/student/dashboard/${linkedProfileId}`, label: 'My Dashboard', description: 'Stats & saved jobs' },
    { to: `/student/profile/${linkedProfileId}`, label: 'Edit Profile', description: 'Update your info' },
    { to: `/student/profile/${linkedProfileId}/view`, label: 'View Profile', description: 'See public profile' },
  ] : [];

  const employerItems = isEmployer && linkedProfileId ? [
    { to: `/employer/dashboard/${linkedProfileId}`, label: 'My Dashboard', description: 'Analytics & postings' },
    { to: '/jobs/new', label: 'Post a Job', description: 'Create a new listing' },
    { to: '/mentors/new', label: 'Post Mentorship', description: 'Offer mentorship' },
  ] : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: Logo + nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center shrink-0" aria-label="iMasons home">
            <ImasonsLogo variant="dark" className="h-8" />
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <DropdownMenu label="Explore" items={exploreItems} currentPath={location.pathname} />

              {isStudent && studentItems.length > 0 && (
                <DropdownMenu label="My Account" items={studentItems} currentPath={location.pathname} />
              )}

              {isEmployer && employerItems.length > 0 && (
                <DropdownMenu label="Employer" items={employerItems} currentPath={location.pathname} />
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/admin/dashboard' ? 'text-brand-cyan' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: auth controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-flex text-xs font-semibold capitalize bg-brand-purple/30 text-brand-cyan px-3 py-1 rounded-full border border-brand-purple/40">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
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
                className="text-sm font-semibold bg-brand-purple hover:bg-brand-purple-light text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-2 text-white/60 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden bg-brand-dark-card border-t border-white/5 px-6 py-4 space-y-1">
          {[...exploreItems, ...studentItems, ...employerItems].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.to
                  ? 'bg-brand-purple/20 text-brand-cyan'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
