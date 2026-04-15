import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import RegisterPage from './RegisterPage.jsx';

function renderRegister() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/student/dashboard" element={<div>STUDENT DASH</div>} />
      <Route path="/employer/dashboard" element={<div>EMPLOYER DASH</div>} />
    </Routes>,
  );
}

function getFields() {
  const inputs = document.querySelectorAll('input');
  // Order in JSX: identifier (text), email, password, confirmPassword
  return {
    identifier: inputs[0],
    email: document.querySelector('input[type="email"]'),
    password: document.querySelectorAll('input[type="password"]')[0],
    confirm: document.querySelectorAll('input[type="password"]')[1],
    submit: screen.getByRole('button', { name: 'Create Account' }),
  };
}

async function fillBasics(user, { password = 'abcdef', confirm = 'abcdef', id = 'STU-1234', email = 'a@b.com' } = {}) {
  const f = getFields();
  await user.type(f.identifier, id);
  await user.type(f.email, email);
  await user.type(f.password, password);
  await user.type(f.confirm, confirm);
  return f;
}

describe('RegisterPage', () => {
  it('rejects mismatched passwords before hitting the API', async () => {
    const user = userEvent.setup();
    renderRegister();
    const f = await fillBasics(user, { password: 'abcdef', confirm: 'xyz999' });
    await user.click(f.submit);
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('rejects passwords shorter than 6 chars', async () => {
    const user = userEvent.setup();
    renderRegister();
    const f = await fillBasics(user, { password: 'abc', confirm: 'abc' });
    await user.click(f.submit);
    expect(
      screen.getByText('Password must be at least 6 characters'),
    ).toBeInTheDocument();
  });

  it('submits and redirects to student dashboard on success', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/register', () =>
        HttpResponse.json(
          {
            access_token: 'new-token',
            token_type: 'bearer',
            role: 'student',
            userId: 5,
            linkedProfileId: null,
          },
          { status: 201 },
        ),
      ),
    );
    renderRegister();
    const f = await fillBasics(user);
    await user.click(f.submit);
    await waitFor(() => expect(screen.getByText('STUDENT DASH')).toBeInTheDocument());
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('uppercases the iMasons identifier as the user types', async () => {
    const user = userEvent.setup();
    renderRegister();
    const { identifier } = getFields();
    await user.type(identifier, 'stu-999');
    expect(identifier).toHaveValue('STU-999');
  });

  it('switches to employer role and submits successfully', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/register', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(
          {
            access_token: 't',
            token_type: 'bearer',
            role: body.role,
            userId: 2,
            linkedProfileId: null,
          },
          { status: 201 },
        );
      }),
    );
    renderRegister();
    await user.click(screen.getByRole('button', { name: 'employer' }));
    const f = await fillBasics(user, { id: 'EMP-1000', email: 'emp@co.com' });
    await user.click(f.submit);
    await waitFor(() => expect(screen.getByText('EMPLOYER DASH')).toBeInTheDocument());
  });

  it('surfaces backend 409 duplicate errors', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/register', () =>
        HttpResponse.json({ detail: 'Email already registered' }, { status: 409 }),
      ),
    );
    renderRegister();
    const f = await fillBasics(user, { email: 'dupe@b.com' });
    await user.click(f.submit);
    await waitFor(() =>
      expect(screen.getByText('Email already registered')).toBeInTheDocument(),
    );
  });
});
