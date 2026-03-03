import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useRole();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    imasonsIdentifier: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const identifierHint = {
    student: 'STU-XXXX (e.g., STU-1234)',
    employer: 'EMP-XXXX (e.g., EMP-1234)',
    admin: 'ADM-XXXX (e.g., ADM-0001)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        role: form.role,
        imasonsIdentifier: form.imasonsIdentifier,
      });
      setAuth(res);

      // New users need to create their profile next
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Create Account</h1>
        <p className="text-gray-500 text-center mb-8">Join the iMasons Job Board network</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {['student', 'employer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r, imasonsIdentifier: '' })}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    form.role === r
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">iMasons Identifier</label>
            <input
              type="text"
              value={form.imasonsIdentifier}
              onChange={(e) => setForm({ ...form, imasonsIdentifier: e.target.value.toUpperCase() })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={identifierHint[form.role]}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the identifier provided by iMasons: {identifierHint[form.role]}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
