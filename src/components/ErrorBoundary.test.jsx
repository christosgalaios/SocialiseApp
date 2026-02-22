import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

// Suppress console.error for intentional throw tests
const originalConsoleError = console.error;

beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  // Component that throws on demand
  const ThrowingComponent = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div data-testid="child-content">Everything works!</div>;
  };

  describe('Normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Everything works!')).toBeInTheDocument();
    });

    it('should not show error UI when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error UI when a child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });

    it('should show recovery instructions', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
    });

    it('should have role="alert" on error container', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should not render children when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });

    it('should show Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show Reload App button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reload App')).toBeInTheDocument();
    });
  });

  describe('Recovery', () => {
    it('should reset error state and re-render children on Try Again', async () => {
      const user = userEvent.setup({ delay: null });

      // Use a stateful wrapper to control throwing behavior
      let shouldThrow = true;
      const ConditionalThrow = () => {
        if (shouldThrow) throw new Error('Test error');
        return <div data-testid="recovered">Recovered!</div>;
      };

      render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      // Error UI should be shown
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

      // Fix the error and click Try Again
      shouldThrow = false;
      await user.click(screen.getByText('Try Again'));

      // Children should re-render
      expect(screen.getByTestId('recovered')).toBeInTheDocument();
      expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
    });

    it('should call window.location.reload on Reload App click', async () => {
      const user = userEvent.setup({ delay: null });
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
        configurable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      await user.click(screen.getByText('Reload App'));
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error logging', () => {
    it('should log errors to console', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // componentDidCatch should have logged the error
      expect(console.error).toHaveBeenCalled();
    });
  });
});
