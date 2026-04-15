import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

function Harness({ route, role }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/" element={<div>HOME PAGE</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute role={role}>
              <div>SECRET CONTENT</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when no token is present', () => {
    render(<Harness route="/protected" />);
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET CONTENT')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and no role required', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('role', 'student');
    render(<Harness route="/protected" />);
    expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('role', 'admin');
    render(<Harness route="/protected" role="admin" />);
    expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument();
  });

  it('redirects to / when role mismatches', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('role', 'student');
    render(<Harness route="/protected" role="admin" />);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET CONTENT')).not.toBeInTheDocument();
  });
});
