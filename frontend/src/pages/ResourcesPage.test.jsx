import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import { stores } from '../test/handlers.js';
import ResourcesPage from './ResourcesPage.jsx';

describe('ResourcesPage', () => {
  beforeEach(() => {
    stores.resources.push(
      { id: 1, title: 'Cloud 101', description: 'Intro to cloud', url: 'https://ex.com/1' },
      { id: 2, title: 'Networking', description: 'Packets and protocols', url: 'https://ex.com/2' },
    );
  });

  it('renders resources from the API', async () => {
    renderWithProviders(<ResourcesPage />);
    expect(await screen.findByText('Cloud 101')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
    const visitLinks = screen.getAllByRole('link', { name: /visit resource/i });
    expect(visitLinks[0]).toHaveAttribute('href', 'https://ex.com/1');
  });

  it('does not show Manage Resources for non-admin', async () => {
    renderWithProviders(<ResourcesPage />);
    await screen.findByText('Cloud 101');
    expect(
      screen.queryByRole('link', { name: /manage resources/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('shows admin controls for admin users', async () => {
    renderWithProviders(<ResourcesPage />, {
      authState: { role: 'admin', userId: 1, token: 't' },
    });
    await screen.findByText('Cloud 101');
    expect(screen.getByRole('link', { name: /manage resources/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2);
  });

  it('admin can delete a resource after confirming', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      renderWithProviders(<ResourcesPage />, {
        authState: { role: 'admin', userId: 1, token: 't' },
      });
      await screen.findByText('Cloud 101');
      await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
      await waitFor(() =>
        expect(screen.queryByText('Cloud 101')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('Networking')).toBeInTheDocument();
    } finally {
      confirmSpy.mockRestore();
    }
  });

  it('shows empty state when no resources exist', async () => {
    stores.resources.length = 0;
    renderWithProviders(<ResourcesPage />);
    expect(await screen.findByText('No resources available')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    stores.resources.length = 0;
    server.use(
      http.get('/api/resources', () => new HttpResponse(null, { status: 500 })),
    );
    renderWithProviders(<ResourcesPage />);
    expect(await screen.findByText('Failed to fetch resources')).toBeInTheDocument();
  });
});
