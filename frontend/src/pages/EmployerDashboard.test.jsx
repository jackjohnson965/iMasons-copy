import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { stores } from '../test/handlers.js';
import EmployerDashboardPage from './EmployerDashboardPage.jsx';

describe('EmployerDashboardPage', () => {
  beforeEach(() => {
    stores.employers.push({
      id: 1,
      companyName: 'Acme Corp',
      contactEmail: 'jobs@acme.com',
      industry: 'Tech',
      location: 'Remote',
      description: 'Great company',
      websiteUrl: 'https://acme.com',
    });

    stores.jobs.push(
      {
        id: 11,
        employerId: 1,
        title: 'Software Engineer Intern',
        description: 'Build things',
        location: 'Remote',
        jobType: 'internship',
        industry: 'Tech',
        isActive: 1,
        status: 'active',
      },
      {
        id: 12,
        employerId: 1,
        title: 'Data Analyst',
        description: 'Analyze data',
        location: 'Austin',
        jobType: 'full-time',
        industry: 'Tech',
        isActive: 1,
        status: 'active',
      },
    );

    stores.applications.push(
      {
        id: 100,
        studentId: 7,
        jobPostingId: 11,
        status: 'submitted',
        createdAt: '2026-04-24T10:00:00Z',
        answers: [],
        student: { firstName: 'Older', lastName: 'Applicant', email: 'older@example.com' },
      },
      {
        id: 101,
        studentId: 8,
        jobPostingId: 12,
        status: 'submitted',
        createdAt: '2026-04-25T10:00:00Z',
        answers: [],
        student: { firstName: 'Recent', lastName: 'Applicant', email: 'recent@example.com' },
      },
    );
  });

  it('shows recent applicants sorted by newest and links to their profiles', async () => {
    renderWithProviders(<EmployerDashboardPage />, {
      authState: { role: 'employer', userId: 3, token: 't', linkedProfileId: 1 },
    });

    expect(await screen.findByText('Recently Applied')).toBeInTheDocument();

    const names = await screen.findAllByRole('link', { name: /applicant/i });
    expect(names[0]).toHaveAttribute('href', '/student/profile/8/view');
    expect(names[1]).toHaveAttribute('href', '/student/profile/7/view');
  });
});
