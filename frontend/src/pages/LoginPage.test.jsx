import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import LoginPage from './LoginPage.jsx';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<div>ADMIN DASH</div>} />
      <Route path="/student/dashboard/:id" element={<div>STUDENT DASH LINKED</div>} />
      <Route path="/student/dashboard" element={<div>STUDENT DASH UNLINKED</div>} />
      <Route path="/employer/dashboard/:id" element={<div>EMPLOYER DASH LINKED</div>} />
    </Routes>,
  );
}

function getFields() {
  return {
    email: document.querySelector('input[type="email"]'),
    password: document.querySelector('input[type="password"]'),
    submit: screen.getByRole('button', { name: 'Sign In' }),
  };
}

describe('LoginPage', () => {
  it('submits credentials, stores auth, navigates to student dashboard', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({
          access_token: 'tok-student',
          token_type: 'bearer',
          role: 'student',
          userId: 5,
          linkedProfileId: 9,
        }),
      ),
    );
    renderLogin();
    const { email, password, submit } = getFields();
    await user.type(email, 'stu@example.com');
    await user.type(password, 'secret123');
    await user.click(submit);

    await waitFor(() => expect(screen.getByText('STUDENT DASH LINKED')).toBeInTheDocument());
    expect(localStorage.getItem('token')).toBe('tok-student');
    expect(localStorage.getItem('role')).toBe('student');
  });

  it('navigates to unlinked student dashboard when linkedProfileId is null', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({
          access_token: 't',
          token_type: 'bearer',
          role: 'student',
          userId: 5,
          linkedProfileId: null,
        }),
      ),
    );
    renderLogin();
    const { email, password, submit } = getFields();
    await user.type(email, 'stu@example.com');
    await user.type(password, 'secret123');
    await user.click(submit);
    await waitFor(() =>
      expect(screen.getByText('STUDENT DASH UNLINKED')).toBeInTheDocument(),
    );
  });

  it('navigates admin to /admin/dashboard', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({
          access_token: 't',
          token_type: 'bearer',
          role: 'admin',
          userId: 1,
          linkedProfileId: null,
        }),
      ),
    );
    renderLogin();
    const { email, password, submit } = getFields();
    await user.type(email, 'adm@example.com');
    await user.type(password, 'secret123');
    await user.click(submit);
    await waitFor(() => expect(screen.getByText('ADMIN DASH')).toBeInTheDocument());
  });

  it('shows backend error message on 401', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 }),
      ),
    );
    renderLogin();
    const { email, password, submit } = getFields();
    await user.type(email, 'stu@example.com');
    await user.type(password, 'wrong');
    await user.click(submit);
    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument(),
    );
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('falls back to generic error when detail is missing', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(
        '/api/auth/login',
        () => new HttpResponse('oops', { status: 500 }),
      ),
    );
    renderLogin();
    const { email, password, submit } = getFields();
    await user.type(email, 'stu@example.com');
    await user.type(password, 'secret123');
    await user.click(submit);
    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument(),
    );
  });
});
