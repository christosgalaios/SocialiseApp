import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvatarCropModal from './AvatarCropModal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Image for loading dimensions
const originalImage = globalThis.Image;

describe('AvatarCropModal', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const testImageUrl = 'https://example.com/avatar.jpg';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Image loading
    globalThis.Image = class MockImage {
      constructor() {
        this.naturalWidth = 400;
        this.naturalHeight = 400;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
      set src(_val) {
        // Trigger load asynchronously
      }
    };
  });

  afterAll(() => {
    globalThis.Image = originalImage;
  });

  describe('Rendering', () => {
    it('should render the modal when isOpen is true', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      expect(screen.getByText('Adjust Photo')).toBeInTheDocument();
    });

    it('should not render when imageUrl is null', () => {
      render(<AvatarCropModal imageUrl={null} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      expect(screen.queryByText('Adjust Photo')).not.toBeInTheDocument();
    });

    it('should render Save and Cancel buttons', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
      // Two cancel buttons - header X and footer Cancel
      expect(screen.getAllByText('Cancel').length).toBeGreaterThanOrEqual(1);
    });

    it('should render zoom controls with aria-labels', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset position' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Zoom level' })).toBeInTheDocument();
    });

    it('should render close button with aria-label', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      // Multiple elements match "Cancel" (header X button aria-label + footer Cancel button)
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      expect(cancelButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Interactions', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButtons = screen.getAllByText('Cancel');
      await user.click(cancelButtons[cancelButtons.length - 1]); // Footer cancel
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const backdrops = screen.getAllByTestId('motion-div');
      // Outer backdrop is the first one
      await user.click(backdrops[0]);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should update zoom via slider', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const zoomSlider = screen.getByRole('slider', { name: 'Zoom level' });
      expect(zoomSlider.value).toBe('1'); // Default zoom

      // Change slider directly
      fireEvent.change(zoomSlider, { target: { value: '2' } });
      expect(zoomSlider.value).toBe('2');
    });

    it('should have zoom in and out buttons that are clickable', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const zoomInButton = screen.getByRole('button', { name: 'Zoom in' });
      const zoomOutButton = screen.getByRole('button', { name: 'Zoom out' });

      // Zoom out should be disabled at min
      expect(zoomOutButton).toBeDisabled();
      // Zoom in should not be disabled at min
      expect(zoomInButton).not.toBeDisabled();

      // Click zoom in — button should still be enabled (not at max yet)
      await user.click(zoomInButton);
      expect(zoomInButton).not.toBeDisabled();
    });

    it('should reset zoom when reset button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const zoomSlider = screen.getByRole('slider', { name: 'Zoom level' });

      // Change slider to zoomed
      fireEvent.change(zoomSlider, { target: { value: '2.5' } });
      expect(zoomSlider.value).toBe('2.5');

      // Reset
      const resetButton = screen.getByRole('button', { name: 'Reset position' });
      await user.click(resetButton);
      expect(zoomSlider.value).toBe('1');
    });

    it('should disable zoom out at minimum zoom', () => {
      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
      const zoomOutButton = screen.getByRole('button', { name: 'Zoom out' });
      expect(zoomOutButton).toBeDisabled();
    });
  });

  describe('Wheel handler', () => {
    it('should attach wheel event listener via native addEventListener', () => {
      const addEventSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');

      render(<AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const wheelCalls = addEventSpy.mock.calls.filter(([event]) => event === 'wheel');
      expect(wheelCalls.length).toBeGreaterThan(0);

      addEventSpy.mockRestore();
    });

    it('should clean up wheel event listener on unmount', () => {
      const removeEventSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');

      const { unmount } = render(
        <AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      unmount();

      const wheelCalls = removeEventSpy.mock.calls.filter(([event]) => event === 'wheel');
      expect(wheelCalls.length).toBeGreaterThan(0);

      removeEventSpy.mockRestore();
    });

    it('should render the preview container', () => {
      const { container } = render(
        <AvatarCropModal imageUrl={testImageUrl} isOpen={true} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const previewContainer = container.querySelector('.aspect-square');
      expect(previewContainer).toBeTruthy();
    });
  });
});
