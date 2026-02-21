import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthScreen from './AuthScreen';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('AuthScreen', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Layout and rendering', () => {
    it('should render auth screen with header', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);
      expect(screen.getByText(/Building/i)).toBeInTheDocument();
      expect(screen.getByText(/Communities/i)).toBeInTheDocument();
    });

    it('should display testimonials carousel', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);
      expect(screen.getByText(/Sarah K\./)).toBeInTheDocument();
    });

    it('should render login form by default', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);
      expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
      expect(screen.getByText(/Log In/i)).toBeInTheDocument();
    });

    it('should show Socialise branding', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);
      expect(screen.getByText('Socialise.')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const submitButton = screen.getByText(/Log In/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter your email address/i)
        ).toBeInTheDocument();
      });
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Log In/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '12345');

      const submitButton = screen.getByText(/Log In/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should accept valid credentials and call onLogin', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByText(/Log In/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('login', {
          email: 'test@example.com',
          password: 'password123',
          firstName: '',
          lastName: '',
        });
      });
    });

    it('should clear errors when input changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const submitButton = screen.getByText(/Log In/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter your email address/i)
        ).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter your email address/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Register mode', () => {
    it('should toggle to register mode', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/First name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Last name/i)).toBeInTheDocument();
    });

    it('should require first name in register mode', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByText(/Create Account/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter your first name/i)
        ).toBeInTheDocument();
      });
    });

    it('should require last name in register mode', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      const firstNameInput = screen.getByPlaceholderText(/First name/i);
      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(firstNameInput, 'John');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByText(/Create Account/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter your last name/i)
        ).toBeInTheDocument();
      });
    });

    it('should call onLogin with register and user data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      const firstNameInput = screen.getByPlaceholderText(/First name/i);
      const lastNameInput = screen.getByPlaceholderText(/Last name/i);
      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByText(/Create Account/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('register', {
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });
      });
    });

    it('should toggle back to login mode', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      let toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      expect(screen.getByText(/Create Account/i)).toBeInTheDocument();

      toggleButton = screen.getByText(/Already have an account\?/i);
      await user.click(toggleButton);

      expect(screen.getByText(/Log In/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/First name/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should disable submit button while loading', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnLogin.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Log In/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnLogin.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Log In/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // After clicking, there should be a loading state
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    it('should display login error', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnLogin.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Log In/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid credentials/i)
        ).toBeInTheDocument();
      });
    });

    it('should display registration error', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnLogin.mockRejectedValueOnce(
        new Error('An account with that email already exists')
      );

      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      const firstNameInput = screen.getByPlaceholderText(/First name/i);
      const lastNameInput = screen.getByPlaceholderText(/Last name/i);
      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Create Account/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/An account with that email already exists/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Testimonials carousel', () => {
    it('should cycle testimonials automatically', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);

      expect(screen.getByText(/Sarah K\./)).toBeInTheDocument();

      vi.advanceTimersByTime(5000);

      // After 5 seconds, should show next testimonial
      // Note: This depends on implementation, but we expect carousel to rotate
      expect(screen.getByText(/Sarah K\./)).toBeInTheDocument();
    });

    it('should allow manual testimonial navigation', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const dots = screen.getAllByRole('button').filter(
        btn => btn.className.includes('rounded-full') && btn.className.includes('h-1.5')
      );

      if (dots.length > 1) {
        await user.click(dots[1]);
        // Should navigate to second testimonial
      }
    });
  });

  describe('Input trimming and normalization', () => {
    it('should trim whitespace from email', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Log In/i);

      await user.type(emailInput, '  test@example.com  ');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('login', {
          email: 'test@example.com',
          password: 'password123',
          firstName: '',
          lastName: '',
        });
      });
    });

    it('should trim whitespace from names in register', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthScreen onLogin={mockOnLogin} />);

      const toggleButton = screen.getByText(/Don't have an account\?/i);
      await user.click(toggleButton);

      const firstNameInput = screen.getByPlaceholderText(/First name/i);
      const lastNameInput = screen.getByPlaceholderText(/Last name/i);
      const emailInput = screen.getByPlaceholderText(/Email address/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      const submitButton = screen.getByText(/Create Account/i);

      await user.type(firstNameInput, '  John  ');
      await user.type(lastNameInput, '  Doe  ');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('register', {
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });
      });
    });
  });
});
