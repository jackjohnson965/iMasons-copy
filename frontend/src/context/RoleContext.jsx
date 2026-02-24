import { createContext, useState, useContext } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem('role'));
  const [userId, setUserIdState] = useState(() => {
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : null;
  });

  const setRole = (newRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
  };

  const setUserId = (id) => {
    setUserIdState(id);
    if (id) {
      localStorage.setItem('userId', String(id));
    } else {
      localStorage.removeItem('userId');
    }
  };

  const clearRole = () => {
    setRole(null);
    setUserId(null);
  };

  return (
    <RoleContext.Provider value={{ role, userId, setRole, setUserId, clearRole }}>
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
  };
}
