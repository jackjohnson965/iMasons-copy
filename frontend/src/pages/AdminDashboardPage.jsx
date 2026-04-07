import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../api';
import Skeleton from '../components/Skeleton';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/50 mb-1.5';

function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton.TableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

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
    { id: 'students', label: 'Students', count: students?.length },
    { id: 'postings', label: 'Postings', count: postings?.length },
    { id: 'resources', label: 'Resources', count: resources?.length },
    { id: 'users', label: 'Users', count: users?.length },
  ];

  const thCls = 'px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider';
  const tdCls = 'px-5 py-3.5';

  const statusBadge = {
    active: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
    closed: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/25',
    archived: 'bg-white/10 text-white/40 border border-white/10',
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Page header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Administration</p>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-brand-dark-elevated rounded-xl p-1 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResetResult(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                tab === t.id ? 'bg-brand-purple text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-white/20' : 'bg-white/5 text-white/30'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Students tab */}
        {tab === 'students' && (
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
            {studentsLoading ? (
              <TableSkeleton cols={6} />
            ) : !students?.length ? (
              <div className="p-12 text-center">
                <p className="text-white/30 text-sm">No students found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className={thCls}>ID</th>
                      <th className={thCls}>Name</th>
                      <th className={thCls}>Email</th>
                      <th className={thCls}>Location</th>
                      <th className={thCls}>Status</th>
                      <th className={thCls}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id} className={`hover:bg-white/[0.02] transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                        <td className={`${tdCls} text-white/25 font-mono text-xs`}>{s.id}</td>
                        <td className={`${tdCls} font-medium text-white`}>{s.firstName} {s.lastName}</td>
                        <td className={`${tdCls} text-white/50`}>{s.email}</td>
                        <td className={`${tdCls} text-white/50`}>{s.location || '—'}</td>
                        <td className={tdCls}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s.isActive ? statusBadge.active : 'bg-white/10 text-white/40 border border-white/10'
                          }`}>
                            {s.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className={tdCls}>
                          <button
                            onClick={() => toggleStudentStatus(s)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                              s.isActive
                                ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20 hover:bg-accent-amber/20'
                                : 'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20'
                            }`}
                          >
                            {s.isActive ? 'Hide' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Job Postings tab */}
        {tab === 'postings' && (
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
            {postingsLoading ? (
              <TableSkeleton cols={5} />
            ) : !postings?.length ? (
              <div className="p-12 text-center">
                <p className="text-white/30 text-sm">No job postings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className={thCls}>ID</th>
                      <th className={thCls}>Title</th>
                      <th className={thCls}>Type</th>
                      <th className={thCls}>Status</th>
                      <th className={thCls}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postings.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                        <td className={`${tdCls} text-white/25 font-mono text-xs`}>{p.id}</td>
                        <td className={`${tdCls} font-medium text-white`}>{p.title}</td>
                        <td className={`${tdCls} text-white/50 capitalize`}>{p.jobType}</td>
                        <td className={tdCls}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className={`${tdCls}`}>
                          <div className="flex gap-2">
                            {p.status !== 'active' && (
                              <button onClick={() => setPostingStatus(p.id, 'active')} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 transition-colors">
                                Activate
                              </button>
                            )}
                            {p.status !== 'closed' && (
                              <button onClick={() => setPostingStatus(p.id, 'closed')} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-rose/10 text-accent-rose border border-accent-rose/20 hover:bg-accent-rose/20 transition-colors">
                                Close
                              </button>
                            )}
                            {p.status !== 'archived' && (
                              <button onClick={() => setPostingStatus(p.id, 'archived')} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-colors">
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Resources tab */}
        {tab === 'resources' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Manage Resources</h2>
              <button
                onClick={() => setShowResourceForm(true)}
                className="bg-brand-purple hover:bg-brand-purple-light text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Resource
              </button>
            </div>

            {showResourceForm && (
              <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden mb-6">
                <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />
                <div className="p-6">
                  <h3 className="text-base font-semibold text-white mb-4">
                    {editingResource ? 'Edit Resource' : 'Add New Resource'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input
                        type="text"
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        className={inputCls}
                        placeholder="Resource title"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        value={resourceForm.description}
                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        className={inputCls}
                        placeholder="Resource description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>URL</label>
                      <input
                        type="url"
                        value={resourceForm.url}
                        onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                        className={inputCls}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingResource ? handleUpdateResource : handleCreateResource}
                        className="bg-brand-purple hover:bg-brand-purple-light text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                      >
                        {editingResource ? 'Update' : 'Create'}
                      </button>
                      <button
                        onClick={cancelResourceForm}
                        className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-lg font-medium text-sm border border-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
              {resourcesLoading ? (
                <TableSkeleton cols={4} />
              ) : !resources?.length ? (
                <div className="p-12 text-center">
                  <p className="text-white/30 text-sm">No resources found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className={thCls}>ID</th>
                        <th className={thCls}>Title</th>
                        <th className={thCls}>URL</th>
                        <th className={thCls}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r, i) => (
                        <tr key={r.id} className={`hover:bg-white/[0.02] transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                          <td className={`${tdCls} text-white/25 font-mono text-xs`}>{r.id}</td>
                          <td className={`${tdCls} font-medium text-white`}>{r.title}</td>
                          <td className={`${tdCls} text-white/50 truncate max-w-xs`}>
                            <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">{r.url}</a>
                          </td>
                          <td className={`${tdCls}`}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditResource(r)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteResource(r.id)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-rose/10 text-accent-rose border border-accent-rose/20 hover:bg-accent-rose/20 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div>
            {resetResult && (
              <div className="bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan p-4 rounded-xl mb-6 text-sm">
                <p className="font-medium">{resetResult.message}</p>
                {resetResult.tempPassword && (
                  <p className="mt-1.5 text-white/70">
                    Temporary password: <code className="bg-brand-dark-elevated px-2 py-0.5 rounded font-mono text-brand-cyan">{resetResult.tempPassword}</code>
                  </p>
                )}
              </div>
            )}

            <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
              {usersLoading ? (
                <TableSkeleton cols={6} />
              ) : !users?.length ? (
                <div className="p-12 text-center">
                  <p className="text-white/30 text-sm">No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className={thCls}>ID</th>
                        <th className={thCls}>Email</th>
                        <th className={thCls}>Role</th>
                        <th className={thCls}>iMasons ID</th>
                        <th className={thCls}>Profile</th>
                        <th className={thCls}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                          <td className={`${tdCls} text-white/25 font-mono text-xs`}>{u.id}</td>
                          <td className={`${tdCls} text-white`}>{u.email}</td>
                          <td className={`${tdCls} capitalize text-white/50`}>{u.role}</td>
                          <td className={`${tdCls} font-mono text-xs text-white/30`}>{u.imasonsIdentifier}</td>
                          <td className={`${tdCls} text-white/30`}>{u.linkedProfileId ?? '—'}</td>
                          <td className={tdCls}>
                            <button
                              onClick={() => resetPassword(u.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-purple/20 text-brand-cyan border border-brand-purple/30 hover:bg-brand-purple/30 transition-colors"
                            >
                              Reset Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
