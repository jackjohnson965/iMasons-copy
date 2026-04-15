import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleProvider } from '../context/RoleContext.jsx';

/**
 * Wraps ui in MemoryRouter + RoleProvider so components that depend on
 * useRole() or router hooks render without crashing in tests.
 *
 * Options:
 *   route       — initial URL the MemoryRouter starts at (default "/")
 *   authState   — seeds localStorage before render so RoleProvider hydrates
 *                 from it. Pass { role, userId, token, linkedProfileId }.
 */
export function renderWithProviders(ui, { route = '/', authState } = {}) {
  if (authState) {
    if (authState.role) localStorage.setItem('role', authState.role);
    if (authState.userId != null) localStorage.setItem('userId', String(authState.userId));
    if (authState.token) localStorage.setItem('token', authState.token);
    if (authState.linkedProfileId != null) {
      localStorage.setItem('linkedProfileId', String(authState.linkedProfileId));
    }
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      <RoleProvider>{ui}</RoleProvider>
    </MemoryRouter>,
  );
}
