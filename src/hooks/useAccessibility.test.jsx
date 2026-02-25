import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from './useAccessibility';

// Mock framer-motion's useMotionValue and animate
const mockMotionValue = { get: vi.fn(() => 0), set: vi.fn() };
const mockAnimate = vi.fn();
vi.mock('framer-motion', () => ({
  useMotionValue: () => mockMotionValue,
  animate: (...args) => mockAnimate(...args),
}));

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

describe('useSwipeToClose', () => {
  let onClose;

  beforeEach(() => {
    onClose = vi.fn();
    mockMotionValue.get.mockReturnValue(0);
    mockMotionValue.set.mockClear();
    mockAnimate.mockClear();
    // By default, simulate animate completing immediately when it has onComplete
    mockAnimate.mockImplementation((_target, _to, opts) => {
      if (opts?.onComplete) opts.onComplete();
    });
  });

  it('should return sheetY motion value, handleProps and dragZoneProps', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    expect(result.current).toHaveProperty('sheetY');
    expect(result.current).toHaveProperty('handleProps');
    expect(result.current.handleProps).toHaveProperty('onPointerDown');
    expect(result.current.handleProps).toHaveProperty('onPointerMove');
    expect(result.current.handleProps).toHaveProperty('onPointerUp');
    expect(result.current.handleProps.style).toEqual({ touchAction: 'none', cursor: 'grab' });

    // dragZoneProps — same handlers, no cursor style
    expect(result.current).toHaveProperty('dragZoneProps');
    expect(result.current.dragZoneProps).toHaveProperty('onPointerDown');
    expect(result.current.dragZoneProps).toHaveProperty('onPointerMove');
    expect(result.current.dragZoneProps).toHaveProperty('onPointerUp');
    expect(result.current.dragZoneProps.style).toEqual({ touchAction: 'none' });
  });

  it('should track downward drag and update sheetY', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    act(() => {
      result.current.handleProps.onPointerMove({ clientY: 150 });
    });

    // Should set sheetY to delta (50px down)
    expect(mockMotionValue.set).toHaveBeenCalledWith(50);
  });

  it('should not track upward drag (negative delta)', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    act(() => {
      result.current.handleProps.onPointerMove({ clientY: 50 });
    });

    // sheetY.set should NOT be called for upward movement
    expect(mockMotionValue.set).not.toHaveBeenCalled();
  });

  it('should not move when not dragging', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    // Move without starting drag
    act(() => {
      result.current.handleProps.onPointerMove({ clientY: 200 });
    });

    expect(mockMotionValue.set).not.toHaveBeenCalled();
  });

  it('should close when dragged past threshold', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    // Simulate dragging past default threshold (100px)
    mockMotionValue.get.mockReturnValue(150);

    act(() => {
      result.current.handleProps.onPointerUp();
    });

    // onClose should be called (via animate's onComplete)
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should spring back when drag distance and velocity are both low', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    // No movement at all (distance=0, velocity=0)
    mockMotionValue.get.mockReturnValue(0);

    act(() => {
      result.current.handleProps.onPointerUp();
    });

    // distance=0 and velocity=0, should spring back (animate to 0, no onComplete)
    expect(onClose).not.toHaveBeenCalled();
    expect(mockAnimate).toHaveBeenCalledWith(
      expect.anything(),
      0,
      expect.objectContaining({ type: 'spring' })
    );
  });

  it('should accept custom threshold', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose, { threshold: 50 }));

    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    // Drag past custom threshold (50px)
    mockMotionValue.get.mockReturnValue(60);

    act(() => {
      result.current.handleProps.onPointerUp();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on fast swipe (high velocity) even below threshold', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    // Start pointer
    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    // Simulate a quick swipe: small distance but fast
    // velocity = distance / elapsed * 1000 > 800
    // e.g. 50px in 50ms = 1000px/s
    mockMotionValue.get.mockReturnValue(50);

    // We can't directly mock Date.now in the hook, but the velocity calc
    // uses Date.now() - startTime.  Since the pointerDown and pointerUp
    // happen almost instantly in tests (elapsed ~0ms), velocity will be
    // very high (50 / ~1 * 1000 = 50000). This should exceed 800.
    act(() => {
      result.current.handleProps.onPointerUp();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle global pointerup to catch drags that end off-element', () => {
    const { result } = renderHook(() => useSwipeToClose(onClose));

    // Start drag
    act(() => {
      result.current.handleProps.onPointerDown({ clientY: 100 });
    });

    // Simulate finger moving off the handle and releasing
    mockMotionValue.get.mockReturnValue(200);

    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should clean up global listeners on unmount', () => {
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useSwipeToClose(onClose));
    unmount();

    // Should have removed pointerup and pointercancel listeners
    const removedEvents = removeEventSpy.mock.calls.map(([event]) => event);
    expect(removedEvents).toContain('pointerup');
    expect(removedEvents).toContain('pointercancel');

    removeEventSpy.mockRestore();
  });
});
