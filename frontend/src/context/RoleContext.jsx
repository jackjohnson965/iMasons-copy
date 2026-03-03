import { createContext, useState, useContext } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem('role'));
  const [userId, setUserIdState] = useState(() => {
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : null;
  });
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  // linkedProfileId: the Student.id or Employer.id (distinct from User.id)
  const [linkedProfileId, setLinkedProfileIdState] = useState(() => {
    const stored = localStorage.getItem('linkedProfileId');
    return stored ? Number(stored) : null;
  });

  const setRole = (newRole) => {
    setRoleState(newRole);
    if (newRole) localStorage.setItem('role', newRole);
    else localStorage.removeItem('role');
  };

  const setUserId = (id) => {
    setUserIdState(id);
    if (id) localStorage.setItem('userId', String(id));
    else localStorage.removeItem('userId');
  };

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  };

  const setLinkedProfileId = (id) => {
    setLinkedProfileIdState(id);
    if (id != null) localStorage.setItem('linkedProfileId', String(id));
    else localStorage.removeItem('linkedProfileId');
  };

  /**
   * Called after a successful login or register.
   * Sets all auth state at once from the TokenResponse payload.
   */
  const setAuth = ({ access_token, role: newRole, userId: newUserId, linkedProfileId: lpId }) => {
    setToken(access_token);
    setRole(newRole);
    setUserId(newUserId);
    setLinkedProfileId(lpId ?? null);
  };

  const clearRole = () => {
    setRole(null);
    setUserId(null);
    setToken(null);
    setLinkedProfileId(null);
  };

  return (
    <RoleContext.Provider value={{
      role,
      userId,
      token,
      linkedProfileId,
      setRole,
      setUserId,
      setToken,
      setLinkedProfileId,
      setAuth,
      clearRole,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return {
    ...context,
    isStudent: context.role === 'student',
    isEmployer: context.role === 'employer',
    isAdmin: context.role === 'admin',
    isAuthenticated: !!context.token,
  };
}
