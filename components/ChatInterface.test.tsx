import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ChatInterface from './ChatInterface';

// Set up environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock the Supabase client
const mockGetSession = vi.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
};

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}));

// Mock fetch globally
global.fetch = vi.fn();

const mockSession = {
  access_token: 'test-token-123',
  user: { id: 'test-user-123' },
};

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders empty state when no initialMessage', () => {
      render(<ChatInterface initialMessage={null} />);
      expect(
        screen.getByText('Send a message to get a sarcastic rhyme!')
      ).toBeInTheDocument();
    });

    it('renders user and assistant bubbles with initialMessage', () => {
      const initialMessage = {
        userMessage: 'Hello',
        assistantMessage: 'Well hello there, quite the sight!',
      };
      render(<ChatInterface initialMessage={initialMessage} />);

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(
        screen.getByText('Well hello there, quite the sight!')
      ).toBeInTheDocument();
    });

    it('renders input, button, and character counter', () => {
      render(<ChatInterface initialMessage={null} />);

      expect(screen.getByPlaceholderText('Your message...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('renders character counter showing correct count', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      expect(screen.getByText('5/50')).toBeInTheDocument();
    });
  });

  describe('Character Counter', () => {
    it('shows "0/50" initially', () => {
      render(<ChatInterface initialMessage={null} />);
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('updates as user types', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Test message');

      expect(screen.getByText('12/50')).toBeInTheDocument();
    });

    it('shows red text when at 50 characters', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      const message = 'a'.repeat(50);
      await userEvent.type(input, message);

      const counter = screen.getByText('50/50');
      expect(counter).toHaveClass('text-red-600');
    });
  });

  describe('Submit Button State', () => {
    it('disabled when empty', () => {
      render(<ChatInterface initialMessage={null} />);
      const button = screen.getByRole('button', { name: /send/i });
      expect(button).toBeDisabled();
    });

    it('disabled when whitespace only', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, '   ');

      const button = screen.getByRole('button', { name: /send/i });
      expect(button).toBeDisabled();
    });

    it('enabled when at exactly 50 chars (max allowed)', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      const message = 'a'.repeat(50);
      await userEvent.type(input, message);

      const button = screen.getByRole('button', { name: /send/i });
      expect(button).not.toBeDisabled();
    });

    it('disabled during loading', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    userMessage: 'Hello',
                    assistantMessage: 'Well hello there!',
                  }),
                }),
              200
            )
          )
      );

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      expect(button).toBeDisabled();
    });

    it('enabled with valid 1-50 char message', async () => {
      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits on button click', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('submits on Enter key', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Optimistic Update', () => {
    it('shows user message immediately on submit', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    userMessage: 'Hello',
                    assistantMessage: 'Well hello there!',
                  }),
                }),
              100
            )
          )
      );

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      // User message should appear immediately (optimistic update)
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });

      // Assistant message shows loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls POST /api/chat with correct body', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            body: JSON.stringify({ message: 'Hello' }),
          })
        );
      });
    });

    it('includes Authorization header with Bearer token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token-123',
            }),
          })
        );
      });
    });

    it('sends trimmed message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, '  Hello  ');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat',
          expect.objectContaining({
            body: JSON.stringify({ message: 'Hello' }),
          })
        );
      });
    });
  });

  describe('Success Flow', () => {
    it('updates both bubbles with server response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there, quite the sight!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(
          screen.getByText('Well hello there, quite the sight!')
        ).toBeInTheDocument();
      });
    });

    it('clears input after success', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userMessage: 'Hello',
          assistantMessage: 'Well hello there!',
        }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText(
        'Your message...'
      ) as HTMLInputElement;
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('clears error on success', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Network error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            userMessage: 'Hello',
            assistantMessage: 'Well hello there!',
          }),
        });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      const button = screen.getByRole('button', { name: /send/i });

      // First attempt fails
      await userEvent.type(input, 'Hello');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Clear and retry
      await userEvent.clear(input);
      await userEvent.type(input, 'World');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Network error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message on failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('removes optimistic message on error', async () => {
      const initialMessage = {
        userMessage: 'Previous',
        assistantMessage: 'Response',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ChatInterface initialMessage={initialMessage} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'New message');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        // Should revert to initial message
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Response')).toBeInTheDocument();
        expect(screen.queryByText('New message')).not.toBeInTheDocument();
      });
    });

    it('does not clear input on error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText(
        'Your message...'
      ) as HTMLInputElement;
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      // Wait for error to appear, then check input value
      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });

      expect(input.value).toBe('Hello');
    });
  });

  describe('Session Handling', () => {
    it('handles missing session gracefully', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
      });

      render(<ChatInterface initialMessage={null} />);

      const input = screen.getByPlaceholderText('Your message...');
      await userEvent.type(input, 'Hello');

      const button = screen.getByRole('button', { name: /send/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Sign in to chat')).toBeInTheDocument();
      });
    });
  });
});
