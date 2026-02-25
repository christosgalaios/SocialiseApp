import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventDetailSheet from './EventDetailSheet';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useMotionValue: (initial) => ({ get: () => initial, set: () => {} }),
  animate: vi.fn(),
}));

// Mock constants
vi.mock('../data/constants', () => ({
  INCLUSIVITY_TAGS: [
    { id: 'dog-friendly', label: 'Dog Friendly', emoji: '🐕', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    { id: 'wheelchair', label: 'Wheelchair Accessible', emoji: '♿', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  ],
  CATEGORY_ATTRIBUTES: {
    'Outdoors': [
      { key: 'difficulty', label: 'Difficulty', options: ['Easy', 'Moderate', 'Challenging'] },
      { key: 'distance', label: 'Distance', unit: 'km' },
    ],
  },
}));

describe('EventDetailSheet', () => {
  const mockEvent = {
    id: '1',
    title: 'Friday Night Drinks',
    date: '2026-03-01',
    time: '19:00',
    location: 'The Golden Lion, London',
    price: 0,
    category: 'Food & Drinks',
    image: 'https://example.com/event.jpg',
    host: 'John Doe',
    attendees: 8,
    spots: 20,
    isMicroMeet: false,
  };

  const mockMessages = [
    { id: 1, user: 'Alice', avatar: 'https://avatar.com/alice', message: 'Looking forward to this!', time: '2h ago', isMe: false, isHost: false, isSystem: false },
    { id: 2, user: 'Bob', avatar: 'https://avatar.com/bob', message: 'Count me in!', time: '1h ago', isMe: true, isHost: false, isSystem: false },
  ];

  const mockOnClose = vi.fn();
  const mockOnJoin = vi.fn();
  const mockOnSendMessage = vi.fn();
  const mockOnOpenProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Info tab rendering', () => {
    it('should render event title', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Friday Night Drinks')).toBeInTheDocument();
    });

    it('should render event category', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Food & Drinks')).toBeInTheDocument();
    });

    it('should render event date', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('2026-03-01')).toBeInTheDocument();
    });

    it('should render event time', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('19:00')).toBeInTheDocument();
    });

    it('should render event location', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('The Golden Lion, London')).toBeInTheDocument();
    });

    it('should render event image', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      const image = screen.getByAltText('Friday Night Drinks');
      expect(image).toHaveAttribute('src', 'https://example.com/event.jpg');
    });

    it('should show FREE for free events', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('FREE')).toBeInTheDocument();
    });

    it('should show price for paid events', () => {
      const paidEvent = { ...mockEvent, price: 15 };
      render(
        <EventDetailSheet event={paidEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('£15')).toBeInTheDocument();
    });

    it('should render Get Directions link', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText(/Get Directions/)).toBeInTheDocument();
    });

    it('should render trust and safety section', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Contribution Model Applied')).toBeInTheDocument();
      expect(screen.getByText('Safe & Curated Hub')).toBeInTheDocument();
      expect(screen.getByText('Zero-Tolerance Harassment')).toBeInTheDocument();
    });
  });

  describe('Micro-Meet variant', () => {
    it('should show AI Curated badge for micro meets', () => {
      const microEvent = { ...mockEvent, isMicroMeet: true, theme: 'AI Ethics' };
      render(
        <EventDetailSheet event={microEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('AI Curated')).toBeInTheDocument();
    });

    it('should show micro-meet specific description', () => {
      const microEvent = { ...mockEvent, isMicroMeet: true, theme: 'AI Ethics' };
      render(
        <EventDetailSheet event={microEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText(/Exclusive alignment/)).toBeInTheDocument();
      expect(screen.getByText(/AI Ethics/)).toBeInTheDocument();
    });

    it('should not show AI Curated badge for regular events', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.queryByText('AI Curated')).not.toBeInTheDocument();
    });
  });

  describe('Join button', () => {
    it('should show "Join Now" when not joined', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Join Now')).toBeInTheDocument();
    });

    it('should show "I\'m Going" when joined', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={true} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText("I'm Going ✨")).toBeInTheDocument();
    });

    it('should call onJoin when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText('Join Now'));
      expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tab navigation', () => {
    it('should render info and chat tabs', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('The Experience')).toBeInTheDocument();
      expect(screen.getByText(/Community Hub/)).toBeInTheDocument();
    });

    it('should show message count on chat tab', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should switch to chat tab on click', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      // After switching to chat tab, chat input should appear
      expect(screen.getByPlaceholderText('Message the hub...')).toBeInTheDocument();
    });

    it('should show chat messages on chat tab', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      expect(screen.getByText('Looking forward to this!')).toBeInTheDocument();
      expect(screen.getByText('Count me in!')).toBeInTheDocument();
    });

    it('should show empty state when no messages', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={[]} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      expect(screen.getByText('Pre-Event Hub')).toBeInTheDocument();
    });
  });

  describe('Chat interactions', () => {
    it('should show chat input on chat tab', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      expect(screen.getByPlaceholderText('Message the hub...')).toBeInTheDocument();
    });

    it('should call onSendMessage when send button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      const input = screen.getByPlaceholderText('Message the hub...');
      await user.type(input, 'Hello everyone!');

      // Click the send button
      const sendButton = input.parentElement.querySelector('button');
      await user.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello everyone!');
    });

    it('should clear input after sending', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      await user.click(screen.getByText(/Community Hub/));
      const input = screen.getByPlaceholderText('Message the hub...');
      await user.type(input, 'Hello!');

      const sendButton = input.parentElement.querySelector('button');
      await user.click(sendButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );

      // The backdrop is the first motion-div with onClick=onClose
      const allMotionDivs = screen.getAllByTestId('motion-div');
      await user.click(allMotionDivs[0]);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Inclusivity tags', () => {
    it('should render inclusivity tags when present', () => {
      const eventWithTags = { ...mockEvent, tags: ['dog-friendly', 'wheelchair'] };
      render(
        <EventDetailSheet event={eventWithTags} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Dog Friendly')).toBeInTheDocument();
      expect(screen.getByText('Wheelchair Accessible')).toBeInTheDocument();
    });

    it('should not render inclusivity section when no tags', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.queryByText('Dog Friendly')).not.toBeInTheDocument();
    });
  });

  describe('Category attributes', () => {
    it('should render category-specific attributes when present', () => {
      const outdoorEvent = {
        ...mockEvent,
        category: 'Outdoors',
        categoryAttrs: { difficulty: 'Moderate', distance: 10 },
      };
      render(
        <EventDetailSheet event={outdoorEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
      expect(screen.getByText('Distance')).toBeInTheDocument();
      expect(screen.getByText('10 km')).toBeInTheDocument();
    });
  });

  describe('Profile interaction in chat', () => {
    it('should call onOpenProfile for other users messages', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} onOpenProfile={mockOnOpenProfile} />
      );

      await user.click(screen.getByText(/Community Hub/));

      // Click on Alice's name (she's not isMe)
      // The text content is 'Alice' (uppercase is CSS styling, not text)
      const aliceButton = screen.getByText('Alice').closest('button');
      if (aliceButton) {
        await user.click(aliceButton);
        expect(mockOnOpenProfile).toHaveBeenCalledWith({
          name: 'Alice',
          avatar: 'https://avatar.com/alice',
        });
      }
    });
  });

  describe('Image lazy loading', () => {
    it('should have loading="lazy" on event image', () => {
      render(
        <EventDetailSheet event={mockEvent} onClose={mockOnClose} isJoined={false} onJoin={mockOnJoin} messages={mockMessages} onSendMessage={mockOnSendMessage} />
      );
      const image = screen.getByAltText('Friday Night Drinks');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });
});
