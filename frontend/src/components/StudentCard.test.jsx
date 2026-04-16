import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentCard from './StudentCard.jsx';

function renderCard(student) {
  return render(
    <MemoryRouter>
      <StudentCard student={student} />
    </MemoryRouter>,
  );
}

describe('StudentCard', () => {
  beforeEach(() => {
    // StudentCard fires a fetch for the profile photo; short-circuit it so
    // missing-URL tests don't hit MSW's unhandled-request error.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 404 }),
    );
  });

  it('shows initials when no profile photo is set', () => {
    renderCard({
      id: 1,
      firstName: 'Ada',
      lastName: 'Lovelace',
      isActive: 1,
      skills: '',
      profileImageLink: '',
    });
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('links name to the profile view route', () => {
    renderCard({
      id: 7,
      firstName: 'Grace',
      lastName: 'Hopper',
      isActive: 1,
      skills: '',
    });
    const link = screen.getByRole('link', { name: 'Grace Hopper' });
    expect(link).toHaveAttribute('href', '/student/profile/7/view');
  });

  it('shows Available badge when isActive is truthy', () => {
    renderCard({ id: 1, firstName: 'A', lastName: 'B', isActive: 1, skills: '' });
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows Not looking badge when isActive is falsy', () => {
    renderCard({ id: 1, firstName: 'A', lastName: 'B', isActive: 0, skills: '' });
    expect(screen.getByText('Not looking')).toBeInTheDocument();
  });

  it('renders first 5 skills and "+N more" when over 5', () => {
    renderCard({
      id: 1,
      firstName: 'A',
      lastName: 'B',
      isActive: 1,
      skills: 'react, node, python, sql, graphql, tailwind, postgres',
    });
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('graphql')).toBeInTheDocument();
    expect(screen.queryByText('tailwind')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('renders linkedin and github links when present', () => {
    renderCard({
      id: 1,
      firstName: 'A',
      lastName: 'B',
      isActive: 1,
      skills: '',
      linkedinUrl: 'https://linkedin.com/in/a',
      githubUrl: 'https://github.com/a',
    });
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/a',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/a',
    );
  });

  it('renders bio and location when provided', () => {
    renderCard({
      id: 1,
      firstName: 'A',
      lastName: 'B',
      isActive: 1,
      skills: '',
      location: 'NYC',
      bio: 'Loves rocks',
    });
    expect(screen.getByText('NYC')).toBeInTheDocument();
    expect(screen.getByText('Loves rocks')).toBeInTheDocument();
  });
});
