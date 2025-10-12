import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import App from './app';

// Mock the auth API
vi.mock('./api', () => ({
  authApi: {
    me: vi.fn().mockRejectedValue(new Error('Not logged in')),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should show login page after loading', async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(getByText('Admin Dashboard')).toBeTruthy();
    });
  });
});
