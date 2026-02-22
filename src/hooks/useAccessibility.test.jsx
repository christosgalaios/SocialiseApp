import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useEscapeKey, useFocusTrap } from './useAccessibility';

// jsdom doesn't implement offsetParent (always null), which causes
// getFocusableElements to filter out all elements. Mock it to return
// document.body for non-hidden elements.
const originalOffsetParent = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetParent'
);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() {
      // Return null for hidden elements, body for visible ones
      if (this.style?.display === 'none' || this.hidden) return null;
      return document.body;
    },
    configurable: true,
  });
});

afterAll(() => {
  if (originalOffsetParent) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
  }
});

describe('useEscapeKey', () => {
  let onClose;

  beforeEach(() => {
    onClose = vi.fn();
  });

  it('should call onClose when Escape is pressed while open', () => {
    renderHook(() => useEscapeKey(true, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when Escape is pressed while closed', () => {
    renderHook(() => useEscapeKey(false, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not call onClose for non-Escape keys', () => {
    renderHook(() => useEscapeKey(true, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useEscapeKey(true, onClose));
    unmount();

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should clean up when isOpen changes to false', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useEscapeKey(isOpen, onClose),
      { initialProps: { isOpen: true } }
    );

    rerender({ isOpen: false });

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should re-register listener when onClose changes', () => {
    const onClose2 = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => useEscapeKey(true, callback),
      { initialProps: { callback: onClose } }
    );

    rerender({ callback: onClose2 });

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
    expect(onClose2).toHaveBeenCalledTimes(1);
  });
});

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper component to test focus trapping
  const FocusTrapTestComponent = ({ isOpen }) => {
    const ref = useFocusTrap(isOpen);
    return (
      <div ref={ref} data-testid="trap-container">
        <button data-testid="btn-first">First</button>
        <input data-testid="input-middle" type="text" />
        <button data-testid="btn-last">Last</button>
      </div>
    );
  };

  it('should return a ref', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toHaveProperty('current');
  });

  it('should focus first focusable element when opened', () => {
    render(<FocusTrapTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.activeElement).toBe(screen.getByTestId('btn-first'));
  });

  it('should not focus anything when closed', () => {
    render(<FocusTrapTestComponent isOpen={false} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.activeElement).not.toBe(screen.getByTestId('btn-first'));
  });

  it('should trap Tab at the last element, wrapping to first', () => {
    render(<FocusTrapTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Focus the last button
    const lastButton = screen.getByTestId('btn-last');
    lastButton.focus();
    expect(document.activeElement).toBe(lastButton);

    // Press Tab — should wrap to first
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(screen.getByTestId('btn-first'));
  });

  it('should trap Shift+Tab at the first element, wrapping to last', () => {
    render(<FocusTrapTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // First button should be focused
    const firstButton = screen.getByTestId('btn-first');
    expect(document.activeElement).toBe(firstButton);

    // Press Shift+Tab — should wrap to last
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(screen.getByTestId('btn-last'));
  });

  it('should allow normal Tab between middle elements', () => {
    render(<FocusTrapTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Focus middle input — Tab should not wrap since we're not at the boundary
    const middleInput = screen.getByTestId('input-middle');
    middleInput.focus();

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    // Focus should stay on middle (no wrapping was triggered)
    expect(document.activeElement).toBe(middleInput);
  });

  it('should ignore non-Tab keys', () => {
    render(<FocusTrapTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    const firstButton = screen.getByTestId('btn-first');
    expect(document.activeElement).toBe(firstButton);

    // Press Enter — should not affect focus
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(enterEvent);

    expect(document.activeElement).toBe(firstButton);
  });

  it('should skip disabled elements', () => {
    const DisabledTestComponent = ({ isOpen }) => {
      const ref = useFocusTrap(isOpen);
      return (
        <div ref={ref}>
          <button data-testid="btn-enabled">Enabled</button>
          <button disabled data-testid="btn-disabled">Disabled</button>
          <button data-testid="btn-second-enabled">Second Enabled</button>
        </div>
      );
    };

    render(<DisabledTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Focus should go to first enabled button
    expect(document.activeElement).toBe(screen.getByTestId('btn-enabled'));

    // Tab from last enabled should wrap to first enabled (skipping disabled)
    const lastEnabled = screen.getByTestId('btn-second-enabled');
    lastEnabled.focus();

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(screen.getByTestId('btn-enabled'));
  });

  it('should skip aria-hidden elements', () => {
    const AriaHiddenTestComponent = ({ isOpen }) => {
      const ref = useFocusTrap(isOpen);
      return (
        <div ref={ref}>
          <button data-testid="btn-visible">Visible</button>
          <div aria-hidden="true">
            <button data-testid="btn-hidden">Hidden</button>
          </div>
          <button data-testid="btn-also-visible">Also Visible</button>
        </div>
      );
    };

    render(<AriaHiddenTestComponent isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.activeElement).toBe(screen.getByTestId('btn-visible'));

    // Tab from last visible should wrap to first visible (skipping aria-hidden)
    const lastVisible = screen.getByTestId('btn-also-visible');
    lastVisible.focus();

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(screen.getByTestId('btn-visible'));
  });

  it('should clean up listeners and restore focus on close', () => {
    const OuterComponent = ({ isOpen }) => {
      const ref = useFocusTrap(isOpen);
      return (
        <>
          <button data-testid="trigger-button">Trigger</button>
          {isOpen && (
            <div ref={ref}>
              <button data-testid="inner-button">Inner</button>
            </div>
          )}
        </>
      );
    };

    // Focus the trigger button first
    const { rerender } = render(<OuterComponent isOpen={false} />);
    screen.getByTestId('trigger-button').focus();
    expect(document.activeElement).toBe(screen.getByTestId('trigger-button'));

    // Open the trap
    rerender(<OuterComponent isOpen={true} />);
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.activeElement).toBe(screen.getByTestId('inner-button'));

    // Close the trap — focus should return to trigger button
    rerender(<OuterComponent isOpen={false} />);

    expect(document.activeElement).toBe(screen.getByTestId('trigger-button'));
  });
});
