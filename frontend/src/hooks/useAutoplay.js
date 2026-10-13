import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook managing step autoplay, pausing on hover/focus/off-screen/hidden,
 * and synchronized restarts on manual interaction.
 */
export function useAutoplay({
  totalSteps = 3,
  interval = 4000,
  containerRef,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusInside, setIsFocusInside] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Time remaining tracking for smooth pause and resume
  const remainingTimeRef = useRef(interval);
  const startTimeRef = useRef(Date.now());
  const timerIdRef = useRef(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect document visibility
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // IntersectionObserver: active when >= 35% visible on screen
  useEffect(() => {
    if (!containerRef?.current || typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      { threshold: 0.35 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  // Combined pause state
  const isPaused =
    prefersReducedMotion ||
    isHovered ||
    isFocusInside ||
    !isIntersecting ||
    isDocHidden;

  const nextStep = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % totalSteps);
    setTimerKey((k) => k + 1);
    remainingTimeRef.current = interval;
    startTimeRef.current = Date.now();
  }, [totalSteps, interval]);

  const selectStep = useCallback((index) => {
    setActiveStep(index);
    setTimerKey((k) => k + 1);
    remainingTimeRef.current = interval;
    startTimeRef.current = Date.now();
  }, [interval]);

  // Handle timer with pause and resume
  useEffect(() => {
    if (isPaused) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
      return;
    }

    startTimeRef.current = Date.now();
    timerIdRef.current = setTimeout(() => {
      nextStep();
    }, remainingTimeRef.current);

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isPaused, activeStep, timerKey, nextStep]);

  return {
    activeStep,
    timerKey,
    isPaused,
    prefersReducedMotion,
    selectStep,
    nextStep,
    setIsHovered,
    setIsFocusInside,
  };
}

export default useAutoplay;
