import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PillarCard from './PillarCard.jsx';

describe('PillarCard', () => {
  it('renders label and value', () => {
    render(<PillarCard label="Applications" value={42} icon={<svg data-testid="icon" />} />);
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('wraps in a Link when `to` is provided', () => {
    render(
      <MemoryRouter>
        <PillarCard label="Jobs" value={3} icon={<span />} to="/jobs" />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/jobs');
  });

  it('falls back to default color scheme for unknown color', () => {
    render(<PillarCard label="X" value={1} icon={<span />} color="nope" />);
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
