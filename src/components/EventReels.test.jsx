import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventReels from './EventReels';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
    img: (props) => <img data-testid="motion-img" {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock constants
vi.mock('../data/constants', () => ({
  INCLUSIVITY_TAGS: [
    { id: 'lgbtq', label: 'LGBTQ+', emoji: '🏳️‍🌈' },
    { id: 'sober', label: 'Sober-Friendly', emoji: '🧃' },
  ],
}));

const mockEvents = [
  {
    id: '1',
    title: 'Friday Drinks',
    date: 'Feb 28',
    time: '19:00',
    location: 'London, UK',
    category: 'Food & Drinks',
    attendees: 12,
    host: 'Jane',
    image: 'https://example.com/img1.jpg',
    tags: ['lgbtq'],
  },
  {
    id: '2',
    title: 'Park Run',
    date: 'Mar 1',
    time: '08:00',
    location: 'Hyde Park',
    category: 'Active',
    attendees: 25,
    host: 'Mike',
    image: 'https://example.com/img2.jpg',
    tags: [],
  },
  {
    id: '3',
    title: 'Art Workshop',
    date: 'Mar 2',
    time: '14:00',
    location: 'Shoreditch',
    category: 'Creative',
    attendees: 8,
    host: 'Sarah',
    image: 'https://example.com/img3.jpg',
    tags: [],
  },
];

describe('EventReels', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the reels header', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByText('Reels')).toBeInTheDocument();
    });

    it('should render the first event by default', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByText('Friday Drinks')).toBeInTheDocument();
    });

    it('should render event metadata', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByText('Feb 28')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('by Jane')).toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByText('Food & Drinks')).toBeInTheDocument();
    });

    it('should render progress indicator dots', () => {
      const { container } = render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      // 3 events = 3 progress dots
      const dots = container.querySelectorAll('.rounded-full.transition-all');
      expect(dots.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility (aria-labels)', () => {
    it('should have aria-label on close button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Close reels' })).toBeInTheDocument();
    });

    it('should have aria-label on previous reel button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Previous reel' })).toBeInTheDocument();
    });

    it('should have aria-label on next reel button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Next reel' })).toBeInTheDocument();
    });

    it('should have aria-label on like button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Like event' })).toBeInTheDocument();
    });

    it('should have aria-label on chat button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Open event chat' })).toBeInTheDocument();
    });

    it('should have aria-label on upload button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Upload media' })).toBeInTheDocument();
    });

    it('should have aria-label on share button', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      expect(screen.getByRole('button', { name: 'Share event' })).toBeInTheDocument();
    });

    it('should toggle like button aria-label when liked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const likeButton = screen.getByRole('button', { name: 'Like event' });
      await user.click(likeButton);
      expect(screen.getByRole('button', { name: 'Unlike event' })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should disable previous button on first event', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      const prevButton = screen.getByRole('button', { name: 'Previous reel' });
      expect(prevButton).toBeDisabled();
    });

    it('should not disable next button when not on last event', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      const nextButton = screen.getByRole('button', { name: 'Next reel' });
      expect(nextButton).not.toBeDisabled();
    });

    it('should navigate to next event on next button click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const nextButton = screen.getByRole('button', { name: 'Next reel' });
      await user.click(nextButton);
      expect(screen.getByText('Park Run')).toBeInTheDocument();
    });

    it('should navigate via keyboard ArrowDown', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      expect(screen.getByText('Park Run')).toBeInTheDocument();
    });

    it('should navigate via keyboard ArrowUp', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      // Go to second first
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      expect(screen.getByText('Park Run')).toBeInTheDocument();
      // Then go back
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      expect(screen.getByText('Friday Drinks')).toBeInTheDocument();
    });

    it('should close on Escape key', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const closeButton = screen.getByRole('button', { name: 'Close reels' });
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectEvent when chat button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const chatButton = screen.getByRole('button', { name: 'Open event chat' });
      await user.click(chatButton);
      expect(mockOnSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should toggle like state on like button click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      // Initially not liked
      expect(screen.getByRole('button', { name: 'Like event' })).toBeInTheDocument();

      // Click to like
      await user.click(screen.getByRole('button', { name: 'Like event' }));
      expect(screen.getByRole('button', { name: 'Unlike event' })).toBeInTheDocument();

      // Click to unlike
      await user.click(screen.getByRole('button', { name: 'Unlike event' }));
      expect(screen.getByRole('button', { name: 'Like event' })).toBeInTheDocument();
    });

    it('should show upload overlay when upload button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const uploadButton = screen.getByRole('button', { name: 'Upload media' });
      await user.click(uploadButton);

      expect(screen.getByText('Share a Moment')).toBeInTheDocument();
      expect(screen.getByText('Upload Video')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    });

    it('should close upload overlay via cancel button', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      // Open upload
      await user.click(screen.getByRole('button', { name: 'Upload media' }));
      expect(screen.getByText('Share a Moment')).toBeInTheDocument();

      // Cancel
      await user.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Share a Moment')).not.toBeInTheDocument();
    });
  });

  describe('Touch navigation', () => {
    it('should navigate to next event on swipe up', () => {
      const { container } = render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      // Find the touch container (the flex-1 div)
      const touchArea = container.querySelector('.flex-1.relative.overflow-hidden');
      if (touchArea) {
        fireEvent.touchStart(touchArea, { touches: [{ clientY: 300 }] });
        fireEvent.touchEnd(touchArea, { changedTouches: [{ clientY: 200 }] }); // 100px swipe up
        expect(screen.getByText('Park Run')).toBeInTheDocument();
      }
    });

    it('should navigate to previous event on swipe down', () => {
      const { container } = render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);

      const touchArea = container.querySelector('.flex-1.relative.overflow-hidden');
      if (touchArea) {
        // First go to second event
        fireEvent.keyDown(window, { key: 'ArrowDown' });
        // Then swipe down
        fireEvent.touchStart(touchArea, { touches: [{ clientY: 200 }] });
        fireEvent.touchEnd(touchArea, { changedTouches: [{ clientY: 300 }] }); // 100px swipe down
        expect(screen.getByText('Friday Drinks')).toBeInTheDocument();
      }
    });
  });

  describe('Inclusivity tags', () => {
    it('should render inclusivity tag when present', () => {
      render(<EventReels events={mockEvents} onClose={mockOnClose} onSelectEvent={mockOnSelectEvent} />);
      // First event has lgbtq tag
      expect(screen.getByText(/LGBTQ\+/)).toBeInTheDocument();
    });
  });
});
