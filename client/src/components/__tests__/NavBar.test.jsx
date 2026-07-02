import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../NavBar.jsx'; // Adjust path if needed
import { ContextProvider } from '../../context/ContextProvider.jsx'; // Mock context if used

// Mock axios to prevent network calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { user: { username: 'testuser' } } })),
  },
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => 'mock-token'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

// Mock context or modules as needed
vi.mock('../../context/ContextProvider.jsx', () => ({
  ContextProvider: ({ children }) => children,
}));

describe('NavBar', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <ContextProvider>
          <NavBar />
        </ContextProvider>
      </BrowserRouter>
    );
  });

  it('renders user profile section', async () => {
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('opens navigation menu when hamburger button is clicked', async () => {
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/expenses/i)).toBeInTheDocument();
      expect(screen.getByText(/incomes/i)).toBeInTheDocument();
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });
  });
});
