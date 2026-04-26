import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import AboutPage from './AboutPage.jsx';

describe('AboutPage', () => {
  it('renders creator profiles', () => {
    renderWithProviders(<AboutPage />, { route: '/about' });
    expect(screen.getByRole('heading', { name: /meet the team behind this platform/i })).toBeInTheDocument();
    expect(screen.getByText('Adrian Alfonso')).toBeInTheDocument();
    expect(screen.getByText('Ben King')).toBeInTheDocument();
    expect(screen.getByText('Eli Chesnut')).toBeInTheDocument();
    expect(screen.getByText('Jack Johnson')).toBeInTheDocument();
  });
});
