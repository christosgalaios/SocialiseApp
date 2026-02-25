import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render navigation landmark', () => {
      render(<Sidebar activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByRole('navigation', { name: 'Desktop navigation' })).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      render(<Sidebar activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('Navigate')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Hub')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should call setActiveTab when a nav tab is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Sidebar activeTab="home" setActiveTab={mockSetActiveTab} />);
      await user.click(screen.getByText('Hub'));
      expect(mockSetActiveTab).toHaveBeenCalledWith('hub');
    });

    it('should not render Discover category section on any tab', () => {
      render(<Sidebar activeTab="explore" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByText('Discover')).not.toBeInTheDocument();
    });

    it('should not render category listbox', () => {
      render(<Sidebar activeTab="explore" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Premium banner', () => {
    it('should not render premium banner when experimentalFeatures is false', () => {
      render(<Sidebar experimentalFeatures={false} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.queryByText('Go Premium')).not.toBeInTheDocument();
    });

    it('should render premium banner when experimentalFeatures is true', () => {
      render(<Sidebar experimentalFeatures={true} activeTab="home" setActiveTab={mockSetActiveTab} />);
      expect(screen.getByText('Go Premium')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });
  });
});
