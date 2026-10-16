import { useEffect, useRef } from 'react';

/**
 * Hook to provide rAF-throttled cursor-aware proximity effects (spotlight & magnetic pull)
 * for the primary CTA button.
 * Writes directly to CSS custom properties on the target element to avoid React re-renders.
 *
 * @param {React.RefObject} containerRef - Navbar container to track pointer within
 * @param {React.RefObject} targetRef - CTA button element to apply effects to
 * @param {Object} options
 * @param {boolean} options.disabled - Whether effects should be paused (e.g. mobile menu open)
 * @param {number} options.spotlightRadius - Distance in px to trigger spotlight (default 80)
 * @param {number} options.magneticRadius - Distance in px to trigger magnetic pull (default 60)
 * @param {number} options.maxDisplacement - Max displacement in px for magnetic pull (default 3)
 */
export const useProximity = (
  containerRef,
  targetRef,
  {
    disabled = false,
    spotlightRadius = 80,
    magneticRadius = 60,
    maxDisplacement = 3,
  } = {}
) => {
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    // Disable on non-hover / touch devices or if user prefers reduced motion
    const isHoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isHoverFine || prefersReducedMotion) return;

    const container = containerRef?.current;
    const target = targetRef?.current;
    if (!container || !target) return;

    const resetTarget = () => {
      target.style.setProperty('--spotlight-opacity', '0');
      target.style.setProperty('--tx', '0px');
      target.style.setProperty('--ty', '0px');
    };

    const handlePointerMove = (e) => {
      // Ignore touch and pen inputs
      if (e.pointerType && e.pointerType !== 'mouse') return;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        // 1. Spotlight effect (within spotlightRadius of target or hovering over it)
        const isInsideX = e.clientX >= rect.left && e.clientX <= rect.right;
        const isInsideY = e.clientY >= rect.top && e.clientY <= rect.bottom;
        const isOverTarget = isInsideX && isInsideY;

        if (isOverTarget || distance <= spotlightRadius) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          target.style.setProperty('--mx', `${mouseX}px`);
          target.style.setProperty('--my', `${mouseY}px`);
          target.style.setProperty('--spotlight-opacity', '1');
        } else {
          target.style.setProperty('--spotlight-opacity', '0');
        }

        // 2. Subtle Magnetic pull (within magneticRadius, max displacement 3px)
        if (distance <= magneticRadius && distance > 0) {
          const strength = (1 - distance / magneticRadius);
          const pullX = (deltaX / distance) * (strength * maxDisplacement);
          const pullY = (deltaY / distance) * (strength * maxDisplacement);

          // Clamp to maxDisplacement
          const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, pullX));
          const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, pullY));

          target.style.setProperty('--tx', `${clampedX.toFixed(2)}px`);
          target.style.setProperty('--ty', `${clampedY.toFixed(2)}px`);
        } else {
          target.style.setProperty('--tx', '0px');
          target.style.setProperty('--ty', '0px');
        }

        rafIdRef.current = null;
      });
    };

    const handlePointerLeave = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      resetTarget();
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      resetTarget();
    };
  }, [containerRef, targetRef, disabled, spotlightRadius, magneticRadius, maxDisplacement]);
};

export default useProximity;
