import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import Navbar from './Navbar.jsx';

describe('Navbar', () => {
  it('shows Sign In / Register and hides Explore when unauthenticated', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('button', { name: /explore/i })).not.toBeInTheDocument();
  });

  it('shows Explore and My Account dropdowns for a linked student', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, {
      authState: { role: 'student', userId: 1, token: 't', linkedProfileId: 5 },
    });
    expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument();
    const myAcct = screen.getByRole('button', { name: /my account/i });
    expect(myAcct).toBeInTheDocument();
    await user.click(myAcct);
    expect(screen.getByRole('link', { name: /my dashboard/i })).toHaveAttribute(
      'href',
      '/student/dashboard/5',
    );
    expect(screen.getByRole('link', { name: /edit profile/i })).toHaveAttribute(
      'href',
      '/student/profile/5',
    );
  });

  it('shows Employer dropdown with Post a Job for a linked employer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, {
      authState: { role: 'employer', userId: 2, token: 't', linkedProfileId: 9 },
    });
    const empBtn = screen.getByRole('button', { name: /^employer$/i });
    await user.click(empBtn);
    expect(screen.getByRole('link', { name: /post a job/i })).toHaveAttribute('href', '/jobs/new');
    expect(screen.getByRole('link', { name: /post mentorship/i })).toHaveAttribute(
      'href',
      '/mentors/new',
    );
  });

  it('shows a direct Admin link for admins', () => {
    renderWithProviders(<Navbar />, {
      authState: { role: 'admin', userId: 3, token: 't' },
    });
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/dashboard');
  });

  it('displays the current role pill', () => {
    renderWithProviders(<Navbar />, {
      authState: { role: 'student', userId: 1, token: 't', linkedProfileId: 5 },
    });
    expect(screen.getByText('student')).toBeInTheDocument();
  });

  it('logging out clears localStorage and hides authed nav', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, {
      authState: { role: 'student', userId: 1, token: 't', linkedProfileId: 5 },
    });
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
  });
});
