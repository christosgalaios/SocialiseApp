import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateEventModal from './CreateEventModal';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock LocationPicker
vi.mock('./LocationPicker', () => ({
  default: ({ value, onChange }) => (
    <input
      data-testid="location-picker"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search location..."
    />
  ),
}));

// Mock constants
vi.mock('../data/constants', () => ({
  CATEGORIES: [
    { id: 'All', label: 'All', icon: () => null },
    { id: 'Food & Drinks', label: 'Food & Drinks', icon: () => <span data-testid="icon-food">🍽️</span> },
    { id: 'Outdoors', label: 'Outdoors', icon: () => <span data-testid="icon-outdoors">🌿</span> },
    { id: 'Entertainment', label: 'Entertainment', icon: () => <span data-testid="icon-entertainment">🎭</span> },
    { id: 'Active', label: 'Active', icon: () => <span data-testid="icon-active">💪</span> },
    { id: 'Creative', label: 'Creative', icon: () => <span data-testid="icon-creative">🎨</span> },
    { id: 'Learning', label: 'Learning', icon: () => <span data-testid="icon-learning">📚</span> },
    { id: 'Nightlife', label: 'Nightlife', icon: () => <span data-testid="icon-nightlife">🌙</span> },
  ],
}));

describe('CreateEventModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal header', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Create Event')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Share your vibe with the community')).toBeInTheDocument();
    });

    it('should render publish button', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Publish Event')).toBeInTheDocument();
    });

    it('should render category buttons (excluding All)', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Food & Drinks')).toBeInTheDocument();
      expect(screen.getByText('Outdoors')).toBeInTheDocument();
      expect(screen.queryByText('All')).not.toBeInTheDocument();
    });

    it('should render date and time inputs', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('should render pricing toggle', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Ticketed')).toBeInTheDocument();
    });

    it('should render cover image input', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Cover Image')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      // Close button (the X at the top-right)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Form interactions', () => {
    it('should update title on input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My New Event');
      expect(titleInput).toHaveValue('My New Event');
    });

    it('should update location on input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const locationInput = screen.getByTestId('location-picker');
      await user.type(locationInput, 'London');
      expect(locationInput).toHaveValue('London');
    });

    it('should close modal on backdrop click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // The backdrop is the first motion div with onClick={onClose}
      const backdrop = screen.getAllByTestId('motion-div')[0];
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should switch to ticketed pricing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const ticketedButton = screen.getByText('Ticketed');
      await user.click(ticketedButton);

      // Price input should appear
      expect(screen.getByText('Ticket Price (£)')).toBeInTheDocument();
    });

    it('should show price input only when ticketed', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      // Default is free, so no price input
      expect(screen.queryByText('Ticket Price (£)')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Submit without filling in title
      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when location is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Fill in title but not location
      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My Event');

      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      expect(screen.getByText('Location is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when ticketed price is 0', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Fill title and location
      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My Event');

      const locationInput = screen.getByTestId('location-picker');
      await user.type(locationInput, 'London');

      // Switch to ticketed and set price to 0
      const ticketedButton = screen.getByText('Ticketed');
      await user.click(ticketedButton);

      // Clear the default price and set to 0
      const priceInput = screen.getByDisplayValue('10');
      await user.clear(priceInput);
      await user.type(priceInput, '0');

      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit successfully with valid data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My Event');

      const locationInput = screen.getByTestId('location-picker');
      await user.type(locationInput, 'London');

      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe('My Event');
      expect(submittedData.location).toBe('London');
    });
  });

  describe('Category selection', () => {
    it('should have Food & Drinks selected by default', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // The Food & Drinks button should have the selected class (bg-primary text-white)
      const foodButton = screen.getByText('Food & Drinks');
      expect(foodButton.closest('button')).toHaveClass('bg-primary');
    });

    it('should switch category on click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const outdoorsButton = screen.getByText('Outdoors');
      await user.click(outdoorsButton);

      // After clicking, outdoors should be selected
      expect(outdoorsButton.closest('button')).toHaveClass('bg-primary');
    });
  });

  describe('Image preview', () => {
    it('should show image URL input by default', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('Paste image URL...')).toBeInTheDocument();
    });

    it('should provide default image if none provided on submit', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My Event');

      const locationInput = screen.getByTestId('location-picker');
      await user.type(locationInput, 'London');

      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.image).toContain('unsplash.com');
    });
  });

  describe('Default form values', () => {
    it('should default to free event type', () => {
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const freeButton = screen.getByText('Free');
      expect(freeButton).toHaveClass('bg-primary');
    });

    it('should include category in submitted data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CreateEventModal onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText('e.g. Friday Drinks at The Golden Lion');
      await user.type(titleInput, 'My Event');

      const locationInput = screen.getByTestId('location-picker');
      await user.type(locationInput, 'London');

      const publishButton = screen.getByText('Publish Event');
      await user.click(publishButton);

      expect(mockOnSubmit.mock.calls[0][0].category).toBe('Food & Drinks');
    });
  });
});
