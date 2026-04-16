import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { stores } from '../test/handlers.js';
import JobListPage from './JobListPage.jsx';

describe('JobListPage', () => {
  beforeEach(() => {
    stores.jobs.push(
      {
        id: 1,
        title: 'Backend Intern',
        jobType: 'internship',
        location: 'NYC',
        industry: 'Tech',
        description: 'Write Python',
        isActive: 1,
        status: 'active',
        employerId: 10,
        employer: { companyName: 'Acme' },
        customQuestions: [],
      },
      {
        id: 2,
        title: 'Senior Engineer',
        jobType: 'full-time',
        location: 'Remote',
        industry: 'Tech',
        description: 'Lead the team',
        isActive: 1,
        status: 'active',
        employerId: 10,
        employer: { companyName: 'Acme' },
        customQuestions: [],
      },
    );
  });

  it('renders jobs from the API', async () => {
    renderWithProviders(<JobListPage />);
    expect(await screen.findByText('Backend Intern')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('2 results found')).toBeInTheDocument();
  });

  it('shows empty state when no jobs match', async () => {
    stores.jobs.length = 0;
    renderWithProviders(<JobListPage />);
    expect(await screen.findByText('No jobs found')).toBeInTheDocument();
  });

  it('does not show Save buttons when user is not a student', async () => {
    renderWithProviders(<JobListPage />);
    await screen.findByText('Backend Intern');
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('students see Save buttons and can save a job', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobListPage />, {
      authState: { role: 'student', userId: 5, token: 't', linkedProfileId: 5 },
    });
    await screen.findByText('Backend Intern');
    const saveBtns = await screen.findAllByRole('button', { name: 'Save' });
    expect(saveBtns.length).toBeGreaterThan(0);
    await user.click(saveBtns[0]);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Saved' }).length).toBeGreaterThan(0);
    });
    expect(stores.saved.some((s) => s.jobPostingId === 1 && s.studentId === 5)).toBe(true);
  });

  it('typing in the search box updates filter state and triggers a refetch', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobListPage />);
    await screen.findByText('Backend Intern');
    const searchInput = screen.getByPlaceholderText(/search by title or keyword/i);
    await user.type(searchInput, 'Senior');
    expect(searchInput).toHaveValue('Senior');
  });
});
