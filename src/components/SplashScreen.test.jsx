import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SplashScreen from './SplashScreen';

// Mock Framer Motion — render plain elements
const stripMotionProps = (props) => {
  const motionKeys = [
    'whileTap', 'whileHover', 'initial', 'animate', 'exit', 'transition',
    'layoutId', 'layout', 'variants', 'style',
  ];
  const filtered = {};
  for (const [k, v] of Object.entries(props)) {
    if (!motionKeys.includes(k)) filtered[k] = v;
  }
  return filtered;
};

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...stripMotionProps(props)}>{children}</div>,
    span: ({ children, ...props }) => <span {...stripMotionProps(props)}>{children}</span>,
    p: ({ children, ...props }) => <p {...stripMotionProps(props)}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('SplashScreen', () => {
  let onFinish;

  beforeEach(() => {
    vi.useFakeTimers();
    onFinish = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Full animation playback', () => {
    it('should call onFinish after full 8-second animation', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Not called before 8 seconds
      vi.advanceTimersByTime(7999);
      expect(onFinish).not.toHaveBeenCalled();

      // Called at 8 seconds
      vi.advanceTimersByTime(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should render the S character immediately', () => {
      render(<SplashScreen onFinish={onFinish} />);
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('should render the tagline in the final phase', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Advance to 'together' phase (6200ms)
      vi.advanceTimersByTime(6200);

      expect(screen.getByText('Space for everyone.')).toBeInTheDocument();
    });

    it('should not call onFinish before animation completes', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Advance partway through
      vi.advanceTimersByTime(4000);
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  describe('Tap to skip', () => {
    it('should skip to together phase on first tap', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Tap during early phase
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button'));

      // The tagline should appear (indicating together phase)
      expect(screen.getByText('Space for everyone.')).toBeInTheDocument();

      // onFinish should not be called immediately
      expect(onFinish).not.toHaveBeenCalled();
    });

    it('should auto-finish 1.5s after skipping to together phase', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Tap to skip
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button'));

      // Not called immediately
      expect(onFinish).not.toHaveBeenCalled();

      // Not called before 1.5s
      vi.advanceTimersByTime(1499);
      expect(onFinish).not.toHaveBeenCalled();

      // Called at 1.5s after skip
      vi.advanceTimersByTime(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should finish immediately on second tap (during together phase)', () => {
      render(<SplashScreen onFinish={onFinish} />);

      const button = screen.getByRole('button');

      // First tap: skip to together
      vi.advanceTimersByTime(500);
      fireEvent.click(button);
      expect(onFinish).not.toHaveBeenCalled();

      // Second tap: finish immediately
      fireEvent.click(button);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should finish immediately when tapping during natural together phase', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Wait for together phase to arrive naturally — flush React state updates
      act(() => { vi.advanceTimersByTime(6200); });

      // Tap during together phase
      fireEvent.click(screen.getByRole('button'));
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should cancel original timeouts when skipping', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Tap to skip early
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button'));

      // The original 8s onFinish timeout should be cancelled
      // Only the new 1.5s auto-finish timeout should fire
      vi.advanceTimersByTime(1500);
      expect(onFinish).toHaveBeenCalledTimes(1);

      // Advancing further should not trigger another onFinish call
      vi.advanceTimersByTime(10000);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard interaction', () => {
    it('should skip on Enter key', () => {
      render(<SplashScreen onFinish={onFinish} />);

      vi.advanceTimersByTime(500);
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

      // Should be in together phase
      expect(screen.getByText('Space for everyone.')).toBeInTheDocument();
    });

    it('should skip on Space key', () => {
      render(<SplashScreen onFinish={onFinish} />);

      vi.advanceTimersByTime(500);
      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

      // Should be in together phase
      expect(screen.getByText('Space for everyone.')).toBeInTheDocument();
    });

    it('should finish on Enter during together phase', () => {
      render(<SplashScreen onFinish={onFinish} />);

      // Advance to together phase — flush React state updates
      act(() => { vi.advanceTimersByTime(6200); });

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeouts on unmount', () => {
      const { unmount } = render(<SplashScreen onFinish={onFinish} />);

      vi.advanceTimersByTime(1000);
      unmount();

      // After unmount, advancing time should not call onFinish
      vi.advanceTimersByTime(10000);
      expect(onFinish).not.toHaveBeenCalled();
    });

    it('should clear auto-finish timeout on unmount after skip', () => {
      const { unmount } = render(<SplashScreen onFinish={onFinish} />);

      // Tap to skip
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button'));

      unmount();

      // The 1.5s auto-finish should not fire
      vi.advanceTimersByTime(5000);
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" for tap target', () => {
      render(<SplashScreen onFinish={onFinish} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have tabIndex={0} for keyboard focus', () => {
      render(<SplashScreen onFinish={onFinish} />);
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });
  });
});
