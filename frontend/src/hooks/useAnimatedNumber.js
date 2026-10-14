import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to smoothly count up a number once on initial load.
 * Respects prefers-reduced-motion.
 */
export const useAnimatedNumber = (targetValue, duration = 600) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const endVal = Number(targetValue) || 0;

    // Immediately show target if reduced motion is preferred or already animated
    if (
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      hasAnimatedRef.current
    ) {
      setDisplayValue(endVal);
      return;
    }

    if (endVal === 0) {
      setDisplayValue(0);
      return;
    }

    const startVal = 0;
    const startTime = performance.now();
    let frameId;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        hasAnimatedRef.current = true;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return displayValue;
};

export default useAnimatedNumber;
