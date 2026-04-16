import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { stores } from '../test/handlers.js';
import JobCreatePage from './JobCreatePage.jsx';

function renderCreate(route = '/jobs/new') {
  return renderWithProviders(
    <Routes>
      <Route path="/jobs/new" element={<JobCreatePage />} />
      <Route path="/jobs/:id/edit" element={<JobCreatePage />} />
      <Route path="/employer/dashboard/:id" element={<div>EMPLOYER DASH</div>} />
    </Routes>,
    {
      route,
      authState: { role: 'employer', userId: 7, token: 't', linkedProfileId: 7 },
    },
  );
}

describe('JobCreatePage', () => {
  it('submits a new posting with custom questions', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByPlaceholderText(/software engineering intern/i), 'Backend Intern');
    await user.type(
      screen.getByPlaceholderText(/describe the role/i),
      'Write python and drink coffee',
    );
    await user.click(screen.getByRole('button', { name: /add question/i }));
    await user.click(screen.getByRole('button', { name: /add question/i }));
    const qInputs = screen.getAllByPlaceholderText(/^Question \d+$/);
    await user.type(qInputs[0], 'Why this role?');
    await user.type(qInputs[1], 'Any Python experience?');
    await user.click(screen.getByRole('button', { name: 'Create Posting' }));
    await waitFor(() => expect(screen.getByText('EMPLOYER DASH')).toBeInTheDocument());

    const created = stores.jobs.find((j) => j.title === 'Backend Intern');
    expect(created).toBeDefined();
    expect(created.employerId).toBe(7);
    expect(created.customQuestions).toHaveLength(2);
    expect(created.customQuestions[0]).toMatchObject({
      questionText: 'Why this role?',
      questionOrder: 0,
    });
  });

  it('blank custom questions are stripped before submit', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByPlaceholderText(/software engineering intern/i), 'Role with blanks');
    await user.type(
      screen.getByPlaceholderText(/describe the role/i),
      'Description',
    );
    await user.click(screen.getByRole('button', { name: /add question/i }));
    await user.click(screen.getByRole('button', { name: /add question/i }));
    const qInputs = screen.getAllByPlaceholderText(/^Question \d+$/);
    await user.type(qInputs[0], '   ');
    await user.type(qInputs[1], 'Real question');
    await user.click(screen.getByRole('button', { name: 'Create Posting' }));
    await waitFor(() => expect(screen.getByText('EMPLOYER DASH')).toBeInTheDocument());
    const created = stores.jobs.find((j) => j.title === 'Role with blanks');
    expect(created.customQuestions).toHaveLength(1);
    expect(created.customQuestions[0].questionText).toBe('Real question');
  });

  it('remove-question button drops a question row', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.click(screen.getByRole('button', { name: /add question/i }));
    await user.click(screen.getByRole('button', { name: /add question/i }));
    expect(screen.getAllByPlaceholderText(/^Question \d+$/)).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: 'Remove question' })[0]);
    expect(screen.getAllByPlaceholderText(/^Question \d+$/)).toHaveLength(1);
  });

  it('edit mode loads existing posting and submits PUT', async () => {
    stores.jobs.push({
      id: 55,
      title: 'Existing Role',
      description: 'Existing desc',
      location: 'Austin',
      jobType: 'full-time',
      industry: 'Tech',
      isActive: 1,
      status: 'active',
      employerId: 7,
      customQuestions: [],
    });
    const user = userEvent.setup();
    renderCreate('/jobs/55/edit');
    expect(await screen.findByDisplayValue('Existing Role')).toBeInTheDocument();
    const descField = screen.getByDisplayValue('Existing desc');
    await user.clear(descField);
    await user.type(descField, 'Better desc');
    await user.click(screen.getByRole('button', { name: 'Update Posting' }));
    await waitFor(() => expect(screen.getByText('EMPLOYER DASH')).toBeInTheDocument());
    const updated = stores.jobs.find((j) => j.id === 55);
    expect(updated.description).toBe('Better desc');
  });
});
