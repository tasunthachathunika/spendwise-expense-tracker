import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track scroll direction and scroll position for smart navbar behavior.
 * Throttled using requestAnimationFrame to prevent layout thrashing and unnecessary re-renders.
 *
 * @param {Object} options
 * @param {number} options.threshold - Minimum delta in pixels to trigger a direction change (default: 8)
 * @param {number} options.topOffset - Scroll offset before navbar can hide (default: 80)
 * @returns {{ isVisible: boolean, isScrolled: boolean, isAtTop: boolean, scrollProgress: number }}
 */
export const useScrollDirection = ({ threshold = 8, topOffset = 80 } = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lastScrollYRef = useRef(0);
  const lastDirectionRef = useRef('up');
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial measurement
    const initialY = window.scrollY;
    lastScrollYRef.current = initialY;
    setIsAtTop(initialY < 8);
    setIsScrolled(initialY > 10);
    setIsVisible(true);

    const updateScroll = () => {
      const currentY = window.scrollY;
      const lastY = lastScrollYRef.current;
      const diff = currentY - lastY;

      // 1. Calculate scroll progress (0% to 100%)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (currentY / docHeight) * 100)) : 0;
      setScrollProgress(progress);

      // 2. Check top of page and border status
      const atTop = currentY < 8;
      const scrolled = currentY > 10;
      setIsAtTop(atTop);
      setIsScrolled(scrolled);

      // 3. Check visibility based on scroll direction and offsets
      if (atTop || currentY <= topOffset) {
        setIsVisible(true);
        lastDirectionRef.current = 'up';
        lastScrollYRef.current = currentY;
      } else if (Math.abs(diff) >= threshold) {
        if (diff > 0 && currentY > topOffset) {
          // Scrolling down past topOffset -> hide
          if (lastDirectionRef.current !== 'down') {
            setIsVisible(false);
            lastDirectionRef.current = 'down';
          }
        } else if (diff < 0) {
          // Scrolling up -> reveal
          if (lastDirectionRef.current !== 'up') {
            setIsVisible(true);
            lastDirectionRef.current = 'up';
          }
        }
        lastScrollYRef.current = currentY;
      }

      rafIdRef.current = null;
    };

    const handleScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [threshold, topOffset]);

  return { isVisible, isScrolled, isAtTop, scrollProgress };
};

export default useScrollDirection;
