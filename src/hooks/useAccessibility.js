import { useEffect, useRef, useCallback } from 'react';
import { useMotionValue, animate } from 'framer-motion';

/**
 * Closes a modal/sheet when the Escape key is pressed.
 * @param {boolean} isOpen - Whether the modal is currently open
 * @param {Function} onClose - Callback to close the modal
 */
export function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

/**
 * Traps focus within a container element when a modal/sheet is open.
 * Returns a ref to attach to the container element.
 * @param {boolean} isOpen - Whether the modal is currently open
 * @returns {React.RefObject} Ref to attach to the focus trap container
 */
export function useFocusTrap(isOpen) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus the first focusable element after a short delay (for animations)
    const focusTimer = setTimeout(() => {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Enables swipe-down-to-close on a bottom sheet.
 * Returns a motion value for the sheet's Y position and props for the drag handle.
 * Drag is initiated from the handle element; the entire sheet translates.
 *
 * Usage:
 *   const { sheetY, dragZoneProps } = useSwipeToClose(onClose);
 *   <motion.div style={{ y: sheetY }}>
 *     <div {...dragZoneProps}>{handle bar + header}</div>
 *     {content}
 *   </motion.div>
 *
 * @param {Function} onClose - Callback to close the sheet
 * @param {{ threshold?: number }} options - Dismiss threshold in px (default 100)
 * @returns {{ sheetY: MotionValue, handleProps: object, dragZoneProps: object }}
 */
export function useSwipeToClose(onClose, { threshold = 100 } = {}) {
  const sheetY = useMotionValue(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startTime = useRef(0);

  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startTime.current = Date.now();
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const delta = clientY - startY.current;
    // Only allow downward drag (positive delta)
    if (delta > 0) {
      sheetY.set(delta);
    }
  }, [sheetY]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const currentY = sheetY.get();
    const elapsed = Date.now() - startTime.current;
    const velocity = currentY / Math.max(elapsed, 1) * 1000; // px/sec

    if (currentY > threshold || velocity > 800) {
      // Animate off-screen then close
      animate(sheetY, window.innerHeight, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onComplete: onClose,
      });
    } else {
      // Spring back
      animate(sheetY, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  }, [sheetY, threshold, onClose]);

  // Clean up dangling pointer events (e.g. finger drags off-screen)
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging.current) {
        handlePointerUp();
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [handlePointerUp]);

  const pointerHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };

  return {
    sheetY,
    handleProps: {
      ...pointerHandlers,
      style: { touchAction: 'none', cursor: 'grab' },
    },
    // Apply to a wider zone (handle + header) — same gesture, no cursor change
    dragZoneProps: {
      ...pointerHandlers,
      style: { touchAction: 'none' },
    },
  };
}

function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null
  );
}
