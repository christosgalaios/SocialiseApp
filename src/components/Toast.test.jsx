import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

// Mock Framer Motion — strip motion-specific props to avoid DOM warnings
const MOTION_KEYS = ['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'layoutId', 'layout', 'variants'];
const stripMotion = (props) => Object.fromEntries(Object.entries(props).filter(([k]) => !MOTION_KEYS.includes(k)));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...stripMotion(props)}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the message text', () => {
      render(<Toast message="Event created!" type="success" onClose={mockOnClose} />);
      expect(screen.getByText('Event created!')).toBeInTheDocument();
    });

    it('should render dismiss button', () => {
      render(<Toast message="Test" type="success" onClose={mockOnClose} />);
      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for live region', () => {
      const { container } = render(<Toast message="Test" type="success" onClose={mockOnClose} />);
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      const { container } = render(<Toast message="Test" type="success" onClose={mockOnClose} />);
      const liveElement = container.querySelector('[aria-live="polite"]');
      expect(liveElement).toBeInTheDocument();
    });

    it('should have aria-atomic="true"', () => {
      const { container } = render(<Toast message="Test" type="success" onClose={mockOnClose} />);
      const atomicElement = container.querySelector('[aria-atomic="true"]');
      expect(atomicElement).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<Toast message="Test" type="success" onClose={mockOnClose} />);
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Types', () => {
    it('should use primary border for success type', () => {
      const { container } = render(<Toast message="Success!" type="success" onClose={mockOnClose} />);
      const inner = container.querySelector('.border-primary');
      expect(inner).toBeInTheDocument();
    });

    it('should use accent border for non-success type', () => {
      const { container } = render(<Toast message="Info!" type="info" onClose={mockOnClose} />);
      const inner = container.querySelector('.border-accent');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when dismiss button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Toast message="Test" type="success" onClose={mockOnClose} />);

      await user.click(screen.getByLabelText('Dismiss notification'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
