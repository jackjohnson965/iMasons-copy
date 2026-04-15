import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import { stores } from '../test/handlers.js';
import StudentListPage from './StudentListPage.jsx';

describe('StudentListPage', () => {
  beforeEach(() => {
    // StudentCard attempts to fetch profile photos — add a 404 handler so
    // MSW's onUnhandledRequest: 'error' doesn't fail the test.
    server.use(
      http.get('/api/students/:id/profile-photo/download', () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );

    stores.students.push(
      { id: 1, firstName: 'Ada', lastName: 'Lovelace', isActive: 1, skills: 'math,logic', location: 'London' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper', isActive: 1, skills: 'compilers', location: 'NYC' },
    );
  });

  it('renders students from the API', async () => {
    renderWithProviders(<StudentListPage />);
    expect(await screen.findByRole('link', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Grace Hopper' })).toBeInTheDocument();
  });

  it('links each card to its profile view route', async () => {
    renderWithProviders(<StudentListPage />);
    const ada = await screen.findByRole('link', { name: 'Ada Lovelace' });
    expect(ada).toHaveAttribute('href', '/student/profile/1/view');
  });

  it('shows empty state when no students exist', async () => {
    stores.students.length = 0;
    renderWithProviders(<StudentListPage />);
    expect(await screen.findByText('No students found')).toBeInTheDocument();
  });

  it('typing in search updates the input value', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StudentListPage />);
    await screen.findByRole('link', { name: 'Ada Lovelace' });
    const search = screen.getByPlaceholderText(/search by name/i);
    await user.type(search, 'Grace');
    expect(search).toHaveValue('Grace');
  });
});
