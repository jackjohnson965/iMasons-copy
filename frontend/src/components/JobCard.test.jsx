import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import JobCard from './JobCard.jsx';

const baseJob = {
  id: 11,
  title: 'Senior Stonemason',
  jobType: 'full-time',
  location: 'Remote',
  industry: 'Construction',
  description: 'Shape beautiful buildings.',
  employer: { companyName: 'Acme Masonry' },
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <JobCard job={baseJob} {...props} />
    </MemoryRouter>,
  );
}

describe('JobCard', () => {
  it('renders title, employer, location, industry, and description', () => {
    renderCard();
    expect(screen.getByRole('link', { name: 'Senior Stonemason' })).toHaveAttribute('href', '/jobs/11');
    expect(screen.getByText('Acme Masonry')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Construction')).toBeInTheDocument();
    expect(screen.getByText('Shape beautiful buildings.')).toBeInTheDocument();
    expect(screen.getByText('full-time')).toBeInTheDocument();
  });

  it('renders Apply link pointing to detail route', () => {
    renderCard();
    const applyLink = screen.getByRole('link', { name: 'Apply' });
    expect(applyLink).toHaveAttribute('href', '/jobs/11');
  });

  it('does not render save button when showSave is false', () => {
    renderCard({ showSave: false });
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderCard({ showSave: true, isSaved: false, onSave });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows Saved state and disables the button when isSaved is true', () => {
    renderCard({ showSave: true, isSaved: true, onSave: () => {} });
    const btn = screen.getByRole('button', { name: 'Saved' });
    expect(btn).toBeDisabled();
  });

  it('falls back to part-time styles when jobType is unknown', () => {
    render(
      <MemoryRouter>
        <JobCard job={{ ...baseJob, jobType: 'weird-type' }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('weird-type')).toBeInTheDocument();
  });
});
