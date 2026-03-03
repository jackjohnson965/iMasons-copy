import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../api';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('students');
  const { data: students, loading: studentsLoading, refetch: refetchStudents } = useFetch('/admin/students');
  const { data: postings, loading: postingsLoading, refetch: refetchPostings } = useFetch('/admin/job-postings');
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useFetch('/admin/users');

  const [resetResult, setResetResult] = useState(null);

  const toggleStudentStatus = async (student) => {
    const newStatus = student.isActive ? 'hidden' : 'active';
    await api.put(`/admin/students/${student.id}/status`, { status: newStatus });
    refetchStudents();
  };

  const setPostingStatus = async (postingId, status) => {
    await api.put(`/admin/job-postings/${postingId}/status`, { status });
    refetchPostings();
  };

  const resetPassword = async (userId) => {
    try {
      const res = await api.post(`/admin/users/${userId}/password-reset`, {});
      setResetResult(res);
    } catch {
      setResetResult({ message: 'Password reset failed' });
    }
  };

  const tabs = [
    { id: 'students', label: 'Students' },
    { id: 'postings', label: 'Job Postings' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResetResult(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {studentsLoading ? (
            <p className="p-6 text-gray-500">Loading students...</p>
          ) : !students?.length ? (
            <p className="p-6 text-gray-400">No students found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-gray-500">{s.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-gray-600">{s.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStudentStatus(s)}
                        className={`text-xs font-medium px-3 py-1 rounded-lg ${
                          s.isActive
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {s.isActive ? 'Hide' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Job Postings tab */}
      {tab === 'postings' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {postingsLoading ? (
            <p className="p-6 text-gray-500">Loading postings...</p>
          ) : !postings?.length ? (
            <p className="p-6 text-gray-400">No job postings found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {postings.map((p) => {
                  const statusColors = {
                    active: 'bg-green-100 text-green-800',
                    closed: 'bg-red-100 text-red-800',
                    archived: 'bg-gray-100 text-gray-600',
                  };
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-gray-500">{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{p.jobType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[p.status] || 'bg-gray-100'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {p.status !== 'active' && (
                          <button onClick={() => setPostingStatus(p.id, 'active')} className="text-xs font-medium px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
                            Activate
                          </button>
                        )}
                        {p.status !== 'closed' && (
                          <button onClick={() => setPostingStatus(p.id, 'closed')} className="text-xs font-medium px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
                            Close
                          </button>
                        )}
                        {p.status !== 'archived' && (
                          <button onClick={() => setPostingStatus(p.id, 'archived')} className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200">
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          {resetResult && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-4 text-sm">
              <p className="font-medium">{resetResult.message}</p>
              {resetResult.tempPassword && (
                <p className="mt-1">
                  Temporary password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">{resetResult.tempPassword}</code>
                </p>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {usersLoading ? (
              <p className="p-6 text-gray-500">Loading users...</p>
            ) : !users?.length ? (
              <p className="p-6 text-gray-400">No users found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">iMasons ID</th>
                    <th className="px-4 py-3 font-medium">Profile ID</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-gray-500">{u.id}</td>
                      <td className="px-4 py-3 text-gray-900">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{u.role}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.imasonsIdentifier}</td>
                      <td className="px-4 py-3 text-gray-500">{u.linkedProfileId ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => resetPassword(u.id)}
                          className="text-xs font-medium px-3 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
