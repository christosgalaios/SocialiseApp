import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BottomNav from './BottomNav';

// Mock Framer Motion — strip motion-specific props to avoid React DOM warnings
const stripMotionProps = (props) => {
  const motionKeys = ['whileTap', 'whileHover', 'initial', 'animate', 'exit', 'transition', 'layoutId', 'layout', 'style', 'variants'];
  const filtered = {};
  for (const [k, v] of Object.entries(props)) {
    if (!motionKeys.includes(k)) filtered[k] = v;
  }
  return filtered;
};

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }) => <button {...stripMotionProps(props)}>{children}</button>,
    div: ({ children, ...props }) => <div {...stripMotionProps(props)}>{children}</div>,
    span: ({ children, ...props }) => <span {...stripMotionProps(props)}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('BottomNav', () => {
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all navigation tabs', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByLabelText('Hub')).toBeInTheDocument();
      expect(screen.getByLabelText('Explore')).toBeInTheDocument();
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();
    });

    it('should render navigation landmark', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('should render tablist', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      expect(screen.getByRole('tablist', { name: 'App sections' })).toBeInTheDocument();
    });
  });

  describe('Active tab state', () => {
    it('should mark home tab as selected when active', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const homeTab = screen.getByRole('tab', { name: 'Home' });
      expect(homeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark other tabs as not selected', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const hubTab = screen.getByRole('tab', { name: 'Hub' });
      expect(hubTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should set tabIndex=0 on active tab and -1 on others', () => {
      render(
        <BottomNav
          activeTab="hub"
          setActiveTab={mockSetActiveTab}
        />
      );

      const hubTab = screen.getByRole('tab', { name: 'Hub' });
      const homeTab = screen.getByRole('tab', { name: 'Home' });
      expect(hubTab).toHaveAttribute('tabindex', '0');
      expect(homeTab).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Tab click interactions', () => {
    it('should call setActiveTab when a tab is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      await user.click(screen.getByRole('tab', { name: 'Hub' }));
      expect(mockSetActiveTab).toHaveBeenCalledWith('hub', expect.any(Number));
    });

    it('should pass correct direction when navigating forward', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      // Home is index 0, Explore is index 2 → direction = 2
      await user.click(screen.getByRole('tab', { name: 'Explore' }));
      expect(mockSetActiveTab).toHaveBeenCalledWith('explore', 2);
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate to next tab on ArrowRight', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const homeTab = screen.getByRole('tab', { name: 'Home' });
      fireEvent.keyDown(homeTab, { key: 'ArrowRight' });

      // Home → Hub (next tab)
      expect(mockSetActiveTab).toHaveBeenCalledWith('hub', expect.any(Number));
    });

    it('should navigate to previous tab on ArrowLeft', () => {
      render(
        <BottomNav
          activeTab="hub"
          setActiveTab={mockSetActiveTab}
        />
      );

      const hubTab = screen.getByRole('tab', { name: 'Hub' });
      fireEvent.keyDown(hubTab, { key: 'ArrowLeft' });

      // Hub → Home (previous tab)
      expect(mockSetActiveTab).toHaveBeenCalledWith('home', expect.any(Number));
    });

    it('should wrap around from last to first on ArrowRight', () => {
      render(
        <BottomNav
          activeTab="profile"
          setActiveTab={mockSetActiveTab}
        />
      );

      const profileTab = screen.getByRole('tab', { name: 'Profile' });
      fireEvent.keyDown(profileTab, { key: 'ArrowRight' });

      // Profile → Home (wraps around)
      expect(mockSetActiveTab).toHaveBeenCalledWith('home', expect.any(Number));
    });

    it('should wrap around from first to last on ArrowLeft', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const homeTab = screen.getByRole('tab', { name: 'Home' });
      fireEvent.keyDown(homeTab, { key: 'ArrowLeft' });

      // Home → Profile (wraps around)
      expect(mockSetActiveTab).toHaveBeenCalledWith('profile', expect.any(Number));
    });

    it('should also navigate on ArrowDown', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const homeTab = screen.getByRole('tab', { name: 'Home' });
      fireEvent.keyDown(homeTab, { key: 'ArrowDown' });

      expect(mockSetActiveTab).toHaveBeenCalledWith('hub', expect.any(Number));
    });

    it('should not navigate on unrelated keys', () => {
      render(
        <BottomNav
          activeTab="home"
          setActiveTab={mockSetActiveTab}
        />
      );

      const homeTab = screen.getByRole('tab', { name: 'Home' });
      fireEvent.keyDown(homeTab, { key: 'Enter' });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });
  });
});
