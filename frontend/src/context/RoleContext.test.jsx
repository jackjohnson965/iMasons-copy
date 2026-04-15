import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RoleProvider, useRole } from './RoleContext.jsx';

function wrap({ children }) {
  return <RoleProvider>{children}</RoleProvider>;
}

describe('RoleContext', () => {
  it('starts unauthenticated when localStorage is empty', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrap });
    expect(result.current.role).toBeNull();
    expect(result.current.userId).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.linkedProfileId).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('role', 'employer');
    localStorage.setItem('userId', '42');
    localStorage.setItem('token', 'abc');
    localStorage.setItem('linkedProfileId', '7');

    const { result } = renderHook(() => useRole(), { wrapper: wrap });
    expect(result.current.role).toBe('employer');
    expect(result.current.userId).toBe(42);
    expect(result.current.token).toBe('abc');
    expect(result.current.linkedProfileId).toBe(7);
    expect(result.current.isEmployer).toBe(true);
    expect(result.current.isStudent).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('setAuth persists all fields to localStorage', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrap });
    act(() => {
      result.current.setAuth({
        access_token: 'new-token',
        role: 'student',
        userId: 5,
        linkedProfileId: 99,
      });
    });
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(localStorage.getItem('role')).toBe('student');
    expect(localStorage.getItem('userId')).toBe('5');
    expect(localStorage.getItem('linkedProfileId')).toBe('99');
    expect(result.current.isStudent).toBe(true);
  });

  it('setAuth with null linkedProfileId removes the key', () => {
    localStorage.setItem('linkedProfileId', '7');
    const { result } = renderHook(() => useRole(), { wrapper: wrap });
    act(() => {
      result.current.setAuth({
        access_token: 't',
        role: 'admin',
        userId: 1,
        linkedProfileId: null,
      });
    });
    expect(localStorage.getItem('linkedProfileId')).toBeNull();
    expect(result.current.isAdmin).toBe(true);
  });

  it('clearRole wipes everything', () => {
    localStorage.setItem('role', 'student');
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 't');
    localStorage.setItem('linkedProfileId', '2');
    const { result } = renderHook(() => useRole(), { wrapper: wrap });
    act(() => result.current.clearRole());
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('linkedProfileId')).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('throws when useRole is used outside RoleProvider', () => {
    expect(() => renderHook(() => useRole())).toThrow(
      /useRole must be used within a RoleProvider/,
    );
  });
});
