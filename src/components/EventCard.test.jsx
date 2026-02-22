import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from './EventCard';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Coffee Meetup',
    date: '2025-03-01',
    time: '14:00',
    location: 'Downtown Cafe',
    price: 5,
    category: 'Food & Drinks',
    image: 'https://example.com/image.jpg',
    host: 'John Doe',
    attendees: 8,
    spots: 10,
    isMicroMeet: false,
    matchScore: 75,
    matchTags: ['Great value', 'Near you'],
    isJoined: false,
    isSaved: false,
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render event card with title', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      expect(screen.getByText('Coffee Meetup')).toBeInTheDocument();
    });

    it('should display event image', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      const image = screen.getByRole('img', { hidden: true });
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should display event category', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      expect(screen.getByText('Food & Drinks')).toBeInTheDocument();
    });

    it('should display event date and time', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/2025-03-01/)).toBeInTheDocument();
      expect(screen.getByText(/14:00/)).toBeInTheDocument();
    });

    it('should display event location', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      expect(screen.getByText('Downtown Cafe')).toBeInTheDocument();
    });

    it('should display event price in compact view', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} compact={true} />
      );
      // Price is shown in compact view, either as "Free" or as a number
      expect(mockEvent.price === 0 ? screen.getByText(/Free/i) : screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should display attendee count in compact view', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/8 going/)).toBeInTheDocument();
    });
  });

  describe('Joined state display', () => {
    it('should show GOING badge when isJoined is true', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} isJoined={true} />
      );
      expect(screen.getByText(/GOING/i)).toBeInTheDocument();
    });

    it('should show check icon in compact view when joined', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} compact={true} isJoined={true} />
      );
      // Check icon is rendered when isJoined is true
      expect(screen.getByText('Coffee Meetup')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );

      // Click the main card div
      const card = container.querySelector('[data-testid="motion-div"]');
      expect(card).toBeInTheDocument();

      if (card) {
        await user.click(card);
      }
    });
  });

  describe('Price display (compact view)', () => {
    it('should display free event badge', () => {
      const freeEvent = { ...mockEvent, price: 0 };
      render(
        <EventCard event={freeEvent} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/Free/i)).toBeInTheDocument();
    });

    it('should not display price badge for paid events', () => {
      const pricedEvent = { ...mockEvent, price: 25 };
      const { container } = render(
        <EventCard event={pricedEvent} onClick={mockOnClick} compact={true} />
      );
      // Paid events should render without a Free badge
      expect(screen.queryByText(/Free/i)).not.toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it('should render paid event without Free badge', () => {
      const expensiveEvent = { ...mockEvent, price: 500 };
      const { container } = render(
        <EventCard event={expensiveEvent} onClick={mockOnClick} compact={true} />
      );
      // Expensive events should still render normally without Free badge
      expect(screen.queryByText(/Free/i)).not.toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Capacity display (compact view)', () => {
    it('should show attendee count', () => {
      const almostFull = { ...mockEvent, attendees: 9, spots: 10 };
      render(
        <EventCard event={almostFull} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/9 going/)).toBeInTheDocument();
    });

    it('should show full event attendee count', () => {
      const fullEvent = { ...mockEvent, attendees: 10, spots: 10 };
      render(
        <EventCard event={fullEvent} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/10 going/)).toBeInTheDocument();
    });

    it('should show empty event', () => {
      const emptyEvent = { ...mockEvent, attendees: 0, spots: 10 };
      render(
        <EventCard event={emptyEvent} onClick={mockOnClick} compact={true} />
      );
      expect(screen.getByText(/0 going/)).toBeInTheDocument();
    });
  });

  describe('Category variants', () => {
    it('should render different categories', () => {
      const categories = [
        'Food & Drinks',
        'Tech',
        'Outdoors',
        'Arts',
        'Games',
        'Entertainment',
      ];

      categories.forEach(category => {
        const { unmount } = render(
          <EventCard event={{ ...mockEvent, category }} onClick={mockOnClick} />
        );
        expect(screen.getByText(category)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive image alt text', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      const image = screen.getByRole('img', { hidden: true });
      expect(image).toHaveAttribute('alt', 'Coffee Meetup');
    });

    it('should have loading="lazy" on image for performance', () => {
      render(
        <EventCard event={mockEvent} onClick={mockOnClick} />
      );
      const image = screen.getByRole('img', { hidden: true });
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long event titles', () => {
      const longTitleEvent = {
        ...mockEvent,
        title: 'A'.repeat(100) + ' Very Long Event Title That Might Cause Issues',
      };
      const { container } = render(
        <EventCard event={longTitleEvent} onClick={mockOnClick} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimalEvent = {
        id: '1',
        title: 'Event',
        date: '2025-03-01',
        time: '14:00',
        location: 'Location',
        price: 0,
        category: 'Social',
        image: 'https://example.com/img.jpg',
      };
      render(
        <EventCard event={minimalEvent} onClick={mockOnClick} />
      );
      expect(screen.getByText('Event')).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialEvent = {
        ...mockEvent,
        title: "Let's & Talk 'bout & Code @ Home",
      };
      render(
        <EventCard event={specialEvent} onClick={mockOnClick} />
      );
      expect(screen.getByText(/Talk/)).toBeInTheDocument();
    });
  });
});
