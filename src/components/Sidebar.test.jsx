import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';

// Mock constants
vi.mock('../data/constants', () => ({
  CATEGORIES: [
    { id: 'All', label: 'All', icon: () => <span>📋</span> },
    { id: 'Food & Drinks', label: 'Food & Drinks', icon: () => <span>🍽️</span> },
    { id: 'Outdoors', label: 'Outdoors', icon: () => <span>🌿</span> },
    { id: 'Entertainment', label: 'Entertainment', icon: () => <span>🎭</span> },
    { id: 'Active', label: 'Active', icon: () => <span>💪</span> },
  ],
}));

describe('Sidebar', () => {
  const mockOnSelect = vi.fn();
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render navigation landmark', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByRole('navigation', { name: 'Desktop navigation' })).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('Navigate')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Hub')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should call setActiveTab when a nav tab is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="home" setActiveTab={mockSetActiveTab} />);
      await user.click(screen.getByText('Hub'));
      expect(mockSetActiveTab).toHaveBeenCalledWith('hub');
    });

    it('should render category heading only on explore tab', () => {
      const { rerender } = render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByText('Discover')).not.toBeInTheDocument();

      rerender(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('should render all categories with icons on explore tab', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Food & Drinks')).toBeInTheDocument();
      expect(screen.getByText('Outdoors')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should not render category options on non-explore tabs', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should render listbox role on explore tab', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByRole('listbox', { name: 'Discover' })).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    it('should mark active category as selected', () => {
      render(<Sidebar activeCategory="Food & Drinks" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const foodOption = screen.getByRole('option', { name: /Food & Drinks/ });
      expect(foodOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark non-active categories as not selected', () => {
      render(<Sidebar activeCategory="Food & Drinks" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const allOption = screen.getByRole('option', { name: /All/ });
      expect(allOption).toHaveAttribute('aria-selected', 'false');
    });

    it('should apply active styling to selected category', () => {
      render(<Sidebar activeCategory="Food & Drinks" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const foodOption = screen.getByRole('option', { name: /Food & Drinks/ });
      expect(foodOption).toHaveClass('bg-primary');
    });

    it('should set tabIndex=0 on active and -1 on others', () => {
      render(<Sidebar activeCategory="Outdoors" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const outdoorsOption = screen.getByRole('option', { name: /Outdoors/ });
      const allOption = screen.getByRole('option', { name: /All/ });
      expect(outdoorsOption).toHaveAttribute('tabindex', '0');
      expect(allOption).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Click interactions', () => {
    it('should call onSelect when a category is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);

      await user.click(screen.getByRole('option', { name: /Outdoors/ }));
      expect(mockOnSelect).toHaveBeenCalledWith('Outdoors');
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate down on ArrowDown', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const allOption = screen.getByRole('option', { name: /All/ });

      fireEvent.keyDown(allOption, { key: 'ArrowDown' });
      expect(mockOnSelect).toHaveBeenCalledWith('Food & Drinks');
    });

    it('should navigate up on ArrowUp', () => {
      render(<Sidebar activeCategory="Food & Drinks" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const foodOption = screen.getByRole('option', { name: /Food & Drinks/ });

      fireEvent.keyDown(foodOption, { key: 'ArrowUp' });
      expect(mockOnSelect).toHaveBeenCalledWith('All');
    });

    it('should wrap from last to first on ArrowDown', () => {
      render(<Sidebar activeCategory="Active" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const activeOption = screen.getByRole('option', { name: /Active/ });

      fireEvent.keyDown(activeOption, { key: 'ArrowDown' });
      expect(mockOnSelect).toHaveBeenCalledWith('All');
    });

    it('should wrap from first to last on ArrowUp', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const allOption = screen.getByRole('option', { name: /All/ });

      fireEvent.keyDown(allOption, { key: 'ArrowUp' });
      expect(mockOnSelect).toHaveBeenCalledWith('Active');
    });

    it('should not navigate on unrelated keys', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} activeTab="explore" setActiveTab={mockSetActiveTab} />);
      const allOption = screen.getByRole('option', { name: /All/ });

      fireEvent.keyDown(allOption, { key: 'Enter' });
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Premium banner', () => {
    it('should not render premium banner when experimentalFeatures is false', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} experimentalFeatures={false} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByText('Go Premium')).not.toBeInTheDocument();
    });

    it('should render premium banner when experimentalFeatures is true', () => {
      render(<Sidebar activeCategory="All" onSelect={mockOnSelect} experimentalFeatures={true} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('Go Premium')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });
  });
});
