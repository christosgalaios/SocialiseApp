import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock ALL external deps before importing the component
const mockUseJsApiLoader = vi.fn();
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: (...args) => mockUseJsApiLoader(...args),
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
}));

const stableSetValue = vi.fn();
vi.mock('use-places-autocomplete', () => ({
  default: () => ({
    ready: true,
    value: '',
    suggestions: { status: '', data: [] },
    setValue: stableSetValue,
    clearSuggestions: vi.fn(),
  }),
  getGeocode: vi.fn(),
  getLatLng: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import LocationPicker from './LocationPicker';

describe('LocationPicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseJsApiLoader.mockReturnValue({ isLoaded: false, loadError: null });
  });

  describe('Fallback input when API key is missing (BUG-1771938422741)', () => {
    it('should render a text input when apiKey is not provided', () => {
      render(<LocationPicker value="" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('Type a location...')).toBeInTheDocument();
    });

    it('should render a text input when apiKey is undefined', () => {
      render(<LocationPicker value="" onChange={mockOnChange} apiKey={undefined} />);
      expect(screen.getByPlaceholderText('Type a location...')).toBeInTheDocument();
    });

    it('should show helpful message about manual entry', () => {
      render(<LocationPicker value="" onChange={mockOnChange} />);
      expect(screen.getByText(/enter address manually/i)).toBeInTheDocument();
    });

    it('should call onChange when user types in fallback input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LocationPicker value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Type a location...');
      await user.type(input, 'L');
      expect(mockOnChange).toHaveBeenCalledWith('L');
    });

    it('should display existing value in fallback input', () => {
      render(<LocationPicker value="London" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('Type a location...')).toHaveValue('London');
    });

    it('should handle object value in fallback input', () => {
      render(<LocationPicker value={{ address: 'Paris', lat: 48.8, lng: 2.3 }} onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('Type a location...')).toHaveValue('Paris');
    });
  });

  describe('Fallback input when Maps API fails to load', () => {
    it('should render fallback input on loadError', () => {
      mockUseJsApiLoader.mockReturnValue({ isLoaded: false, loadError: new Error('Load failed') });
      render(<LocationPicker value="" onChange={mockOnChange} apiKey="test-key" />);
      expect(screen.getByPlaceholderText('Type a location...')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should not show fallback input while Maps API is loading', () => {
      mockUseJsApiLoader.mockReturnValue({ isLoaded: false, loadError: null });
      render(<LocationPicker value="" onChange={mockOnChange} apiKey="test-key" />);
      expect(screen.queryByPlaceholderText('Type a location...')).not.toBeInTheDocument();
    });
  });
});
