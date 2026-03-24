import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../api';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('students');
  const { data: students, loading: studentsLoading, refetch: refetchStudents } = useFetch('/admin/students');
  const { data: postings, loading: postingsLoading, refetch: refetchPostings } = useFetch('/admin/job-postings');
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useFetch('/admin/users');
  const { data: resources, loading: resourcesLoading, refetch: refetchResources } = useFetch('/resources');

  const [resetResult, setResetResult] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', url: '' });
  const [showResourceForm, setShowResourceForm] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editResourceId = urlParams.get('editResource');
    if (editResourceId && resources) {
      const resource = resources.find(r => r.id === parseInt(editResourceId));
      if (resource) {
        setTab('resources');
        handleEditResource(resource);
      }
    }
  }, [resources]);

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

  const handleCreateResource = async () => {
    try {
      await api.post('/resources', resourceForm);
      setResourceForm({ title: '', description: '', url: '' });
      setShowResourceForm(false);
      refetchResources();
    } catch (error) {
      console.error('Failed to create resource:', error);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({ title: resource.title, description: resource.description, url: resource.url });
    setShowResourceForm(true);
  };

  const handleUpdateResource = async () => {
    try {
      await api.put(`/resources/${editingResource.id}`, resourceForm);
      setEditingResource(null);
      setResourceForm({ title: '', description: '', url: '' });
      setShowResourceForm(false);
      refetchResources();
    } catch (error) {
      console.error('Failed to update resource:', error);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      refetchResources();
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const cancelResourceForm = () => {
    setEditingResource(null);
    setResourceForm({ title: '', description: '', url: '' });
    setShowResourceForm(false);
  };

  const tabs = [
    { id: 'students', label: 'Students' },
    { id: 'postings', label: 'Job Postings' },
    { id: 'resources', label: 'Resources' },
    { id: 'users', label: 'Users' },
  ];

  const thCls = 'px-4 py-3 font-medium text-left';
  const tdCls = 'px-4 py-3';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-brand-dark-elevated rounded-lg p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResetResult(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-brand-purple text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === 'students' && (
        <div className="bg-brand-dark-card border border-white/10 rounded-xl overflow-hidden">
          {studentsLoading ? (
            <p className="p-6 text-white/50">Loading students...</p>
          ) : !students?.length ? (
            <p className="p-6 text-white/30">No students found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-left uppercase text-xs tracking-wider">
                <tr>
                  <th className={thCls}>ID</th>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Location</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/2">
                    <td className={`${tdCls} text-white/30`}>{s.id}</td>
                    <td className={`${tdCls} font-medium text-white`}>{s.firstName} {s.lastName}</td>
                    <td className={`${tdCls} text-white/60`}>{s.email}</td>
                    <td className={`${tdCls} text-white/60`}>{s.location || '—'}</td>
                    <td className={tdCls}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                          : 'bg-white/10 text-white/40 border border-white/10'
                      }`}>
                        {s.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className={tdCls}>
                      <button
                        onClick={() => toggleStudentStatus(s)}
                        className={`text-xs font-medium px-3 py-1 rounded-lg border transition-colors ${
                          s.isActive
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                            : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 hover:bg-brand-cyan/20'
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
        <div className="bg-brand-dark-card border border-white/10 rounded-xl overflow-hidden">
          {postingsLoading ? (
            <p className="p-6 text-white/50">Loading postings...</p>
          ) : !postings?.length ? (
            <p className="p-6 text-white/30">No job postings found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-left uppercase text-xs tracking-wider">
                <tr>
                  <th className={thCls}>ID</th>
                  <th className={thCls}>Title</th>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {postings.map((p) => {
                  const statusBadge = {
                    active: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
                    closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
                    archived: 'bg-white/10 text-white/40 border border-white/10',
                  };
                  return (
                    <tr key={p.id} className="hover:bg-white/2">
                      <td className={`${tdCls} text-white/30`}>{p.id}</td>
                      <td className={`${tdCls} font-medium text-white`}>{p.title}</td>
                      <td className={`${tdCls} text-white/60 capitalize`}>{p.jobType}</td>
                      <td className={tdCls}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className={`${tdCls} flex gap-2`}>
                        {p.status !== 'active' && (
                          <button onClick={() => setPostingStatus(p.id, 'active')} className="text-xs font-medium px-3 py-1 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hover:bg-brand-cyan/20">
                            Activate
                          </button>
                        )}
                        {p.status !== 'closed' && (
                          <button onClick={() => setPostingStatus(p.id, 'closed')} className="text-xs font-medium px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                            Close
                          </button>
                        )}
                        {p.status !== 'archived' && (
                          <button onClick={() => setPostingStatus(p.id, 'archived')} className="text-xs font-medium px-3 py-1 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10">
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

      {/* Resources tab */}
      {tab === 'resources' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Manage Resources</h2>
            <button
              onClick={() => setShowResourceForm(true)}
              className="bg-brand-cyan text-black px-4 py-2 rounded-lg font-semibold hover:bg-brand-cyan/90 transition-colors"
            >
              Add Resource
            </button>
          </div>

          {showResourceForm && (
            <div className="bg-brand-dark-card border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                  <input
                    type="text"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                    placeholder="Resource title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                    placeholder="Resource description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">URL</label>
                  <input
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingResource ? handleUpdateResource : handleCreateResource}
                    className="bg-brand-cyan text-black px-4 py-2 rounded-lg font-semibold hover:bg-brand-cyan/90 transition-colors"
                  >
                    {editingResource ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={cancelResourceForm}
                    className="bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-brand-dark-card border border-white/10 rounded-xl overflow-hidden">
            {resourcesLoading ? (
              <p className="p-6 text-white/50">Loading resources...</p>
            ) : !resources?.length ? (
              <p className="p-6 text-white/30">No resources found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/40 text-left uppercase text-xs tracking-wider">
                  <tr>
                    <th className={thCls}>ID</th>
                    <th className={thCls}>Title</th>
                    <th className={thCls}>URL</th>
                    <th className={thCls}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-white/2">
                      <td className={`${tdCls} text-white/30`}>{r.id}</td>
                      <td className={`${tdCls} font-medium text-white`}>{r.title}</td>
                      <td className={`${tdCls} text-white/60 truncate max-w-xs`}>{r.url}</td>
                      <td className={`${tdCls} flex gap-2`}>
                        <button
                          onClick={() => handleEditResource(r)}
                          className="text-xs font-medium px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResource(r.id)}
                          className="text-xs font-medium px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        >
                          Delete
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

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          {resetResult && (
            <div className="bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan p-4 rounded-lg mb-4 text-sm">
              <p className="font-medium">{resetResult.message}</p>
              {resetResult.tempPassword && (
                <p className="mt-1 text-white/70">
                  Temporary password: <code className="bg-brand-dark-elevated px-2 py-0.5 rounded font-mono text-brand-cyan">{resetResult.tempPassword}</code>
                </p>
              )}
            </div>
          )}

          <div className="bg-brand-dark-card border border-white/10 rounded-xl overflow-hidden">
            {usersLoading ? (
              <p className="p-6 text-white/50">Loading users...</p>
            ) : !users?.length ? (
              <p className="p-6 text-white/30">No users found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/40 text-left uppercase text-xs tracking-wider">
                  <tr>
                    <th className={thCls}>ID</th>
                    <th className={thCls}>Email</th>
                    <th className={thCls}>Role</th>
                    <th className={thCls}>iMasons ID</th>
                    <th className={thCls}>Profile ID</th>
                    <th className={thCls}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/2">
                      <td className={`${tdCls} text-white/30`}>{u.id}</td>
                      <td className={`${tdCls} text-white`}>{u.email}</td>
                      <td className={`${tdCls} capitalize text-white/60`}>{u.role}</td>
                      <td className={`${tdCls} font-mono text-xs text-white/40`}>{u.imasonsIdentifier}</td>
                      <td className={`${tdCls} text-white/40`}>{u.linkedProfileId ?? '—'}</td>
                      <td className={tdCls}>
                        <button
                          onClick={() => resetPassword(u.id)}
                          className="text-xs font-medium px-3 py-1 rounded-lg bg-brand-purple/20 text-brand-cyan border border-brand-purple/30 hover:bg-brand-purple/30"
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
