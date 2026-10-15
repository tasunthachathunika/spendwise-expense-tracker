import { useEffect } from 'react';

// Global counter for active locks across nested or concurrent modals/drawers
let activeLockCount = 0;
let originalScrollerOverflow = '';
let originalBodyOverflow = '';

/**
 * Hook to lock background scrolling on #app-scroll and document.body
 * @param {boolean} isLocked - Whether scrolling should be locked
 */
export const useScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    const scroller = document.getElementById('app-scroll');

    if (activeLockCount === 0) {
      if (scroller) {
        originalScrollerOverflow = scroller.style.overflow;
        scroller.style.overflow = 'hidden';
      }
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    activeLockCount += 1;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);

      if (activeLockCount === 0) {
        const currentScroller = document.getElementById('app-scroll') || scroller;
        if (currentScroller) {
          currentScroller.style.overflow = originalScrollerOverflow;
        }
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [isLocked]);
};

export default useScrollLock;
