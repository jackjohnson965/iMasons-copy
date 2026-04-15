import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { stores } from '../test/handlers.js';
import JobDetailPage from './JobDetailPage.jsx';

function renderDetail(jobId) {
  return renderWithProviders(
    <Routes>
      <Route path="/jobs/:id" element={<JobDetailPage />} />
    </Routes>,
    {
      route: `/jobs/${jobId}`,
      authState: { role: 'student', userId: 5, token: 't', linkedProfileId: 5 },
    },
  );
}

describe('JobDetailPage', () => {
  beforeEach(() => {
    stores.jobs.push({
      id: 11,
      title: 'Data Engineer',
      description: 'Build pipelines',
      jobType: 'full-time',
      location: 'Austin',
      industry: 'Tech',
      status: 'active',
      isActive: 1,
      employerId: 9,
      customQuestions: [
        { id: 100, questionText: 'Why are you interested?' },
        { id: 101, questionText: 'Years of Python experience?' },
      ],
    });
    stores.employers.push({
      id: 9,
      companyName: 'Pipelines Inc',
      contactEmail: 'hr@pipelines.test',
      description: 'We love data',
      websiteUrl: 'https://pipelines.test',
      industry: 'Tech',
    });
  });

  it('renders title, description, and custom questions', async () => {
    renderDetail(11);
    expect(await screen.findByRole('heading', { name: 'Data Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Build pipelines')).toBeInTheDocument();
    expect(screen.getByText('Why are you interested?')).toBeInTheDocument();
    expect(screen.getByText('Years of Python experience?')).toBeInTheDocument();
  });

  it('renders employer info when loaded', async () => {
    renderDetail(11);
    // companyName appears both in header subtitle and "About the Employer"
    const matches = await screen.findAllByText('Pipelines Inc');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('We love data')).toBeInTheDocument();
  });

  it('Apply via Email posts an email_click analytics event and opens mailto', async () => {
    const user = userEvent.setup();
    renderDetail(11);

    const hrefSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        set href(val) { hrefSpy(val); },
        get href() { return originalLocation.href; },
      },
    });

    try {
      const applyBtn = await screen.findByRole('button', { name: /apply via email/i });
      await user.click(applyBtn);
      await new Promise((r) => setTimeout(r, 10));
      expect(hrefSpy).toHaveBeenCalledWith(expect.stringContaining('mailto:hr@pipelines.test'));
      expect(
        stores.analytics.some((e) => e.eventType === 'email_click' && e.targetId === 11),
      ).toBe(true);
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  it('firing a posting_view analytics event on mount', async () => {
    renderDetail(11);
    await screen.findByRole('heading', { name: 'Data Engineer' });
    // analytics events are async; wait a tick
    await new Promise((r) => setTimeout(r, 20));
    expect(
      stores.analytics.some((e) => e.eventType === 'posting_view' && e.targetId === 11),
    ).toBe(true);
  });

  it('Save button calls saved-postings', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    try {
      renderDetail(11);
      await screen.findByRole('heading', { name: 'Data Engineer' });
      await user.click(screen.getByRole('button', { name: /save for later/i }));
      await new Promise((r) => setTimeout(r, 10));
      expect(stores.saved.some((s) => s.jobPostingId === 11)).toBe(true);
      expect(alertSpy).toHaveBeenCalledWith('Job saved!');
    } finally {
      alertSpy.mockRestore();
    }
  });
});
