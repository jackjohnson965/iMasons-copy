import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton from './Skeleton.jsx';

describe('Skeleton', () => {
  it('renders Line', () => {
    const { container } = render(<Skeleton.Line />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Circle', () => {
    const { container } = render(<Skeleton.Circle />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Card with header + body lines', () => {
    const { container } = render(<Skeleton.Card />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
  });

  it('renders TableRow with requested column count', () => {
    const { container } = render(<Skeleton.TableRow cols={5} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBe(5);
  });

  it('renders PageHeader', () => {
    const { container } = render(<Skeleton.PageHeader />);
    expect(container.querySelectorAll('.animate-pulse').length).toBe(3);
  });

  it('renders PillarGrid with requested count', () => {
    const { container } = render(<Skeleton.PillarGrid count={3} />);
    // each pillar: 1 circle + 2 lines = 3 pulse elements
    expect(container.querySelectorAll('.animate-pulse').length).toBe(9);
  });

  it('renders JobCard skeleton', () => {
    const { container } = render(<Skeleton.JobCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders StudentCard skeleton', () => {
    const { container } = render(<Skeleton.StudentCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders ResourceCard skeleton', () => {
    const { container } = render(<Skeleton.ResourceCard />);
    expect(container.firstChild).toBeTruthy();
  });
});
