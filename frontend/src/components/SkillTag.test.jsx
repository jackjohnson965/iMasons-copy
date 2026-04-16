import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillTag from './SkillTag.jsx';

describe('SkillTag', () => {
  it('renders the skill label', () => {
    render(<SkillTag skill="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
