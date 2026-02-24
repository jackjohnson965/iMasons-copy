import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import JobCard from '../components/JobCard';
import StatCard from '../components/StatCard';

export default function StudentDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, setUserId } = useRole();
  const [showSetup, setShowSetup] = useState(!id && !userId);

  const studentId = id || userId;
  const { data: student, loading: studentLoading } = useFetch(studentId ? `/students/${studentId}` : null);
  const { data: saved, loading: savedLoading, refetch: refetchSaved } = useFetch(studentId ? `/saved-postings?studentId=${studentId}` : null);
  const { data: analytics } = useFetch(studentId ? `/analytics/student/${studentId}` : null);

  const [setupForm, setSetupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    skills: '',
    resumeLink: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [setupError, setSetupError] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetupChange = (e) => {
    setSetupForm({ ...setupForm, [e.target.name]: e.target.value });
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupError(null);
    setSetupLoading(true);
    try {
      const stu = await api.post('/students', setupForm);
      setUserId(stu.id);
      setShowSetup(false);
      navigate(`/student/dashboard/${stu.id}`);
    } catch (err) {
      setSetupError(err.data?.detail || 'Failed to create student profile');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleUnsave = async (savedId) => {
    await api.delete(`/saved-postings/${savedId}`);
    refetchSaved();
  };

  if (showSetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Up Student Profile</h1>
        <p className="text-gray-500 mb-6">Create your profile to start browsing and saving job opportunities.</p>
        {setupError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{setupError}</div>
        )}
        <form onSubmit={handleSetup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                name="firstName"
                value={setupForm.firstName}
                onChange={handleSetupChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                name="lastName"
                value={setupForm.lastName}
                onChange={handleSetupChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={setupForm.email}
              onChange={handleSetupChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={setupForm.bio}
              onChange={handleSetupChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell employers about yourself..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                name="location"
                value={setupForm.location}
                onChange={handleSetupChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Dallas, TX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                name="skills"
                value={setupForm.skills}
                onChange={handleSetupChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Python, React, SQL"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume Link</label>
            <input
              name="resumeLink"
              value={setupForm.resumeLink}
              onChange={handleSetupChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Link to your resume (Google Drive, etc.)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                name="linkedinUrl"
                value={setupForm.linkedinUrl}
                onChange={handleSetupChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input
                name="githubUrl"
                value={setupForm.githubUrl}
                onChange={handleSetupChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
              <input
                name="portfolioUrl"
                value={setupForm.portfolioUrl}
                onChange={handleSetupChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={setupLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {setupLoading ? 'Creating...' : 'Create Student Profile'}
          </button>
        </form>
      </div>
    );
  }

  if (studentLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-gray-500">Student not found</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {student.firstName}!
          </h1>
          <p className="text-gray-500">{student.email}</p>
        </div>
        <Link
          to={`/student/profile/${studentId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Profile Views" value={analytics?.totalViews ?? 0} />
        <StatCard label="Saved Jobs" value={saved?.length ?? 0} />
        <StatCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Jobs</h2>
      {savedLoading ? (
        <p className="text-gray-500">Loading saved jobs...</p>
      ) : saved?.length > 0 ? (
        <div className="space-y-4">
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="flex-1">
                <JobCard job={s.jobPosting} />
              </div>
              <button
                onClick={() => handleUnsave(s.id)}
                className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap"
              >
                Unsave
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 py-8 text-center">No saved jobs yet. Browse jobs to save some!</p>
      )}
    </div>
  );
}
