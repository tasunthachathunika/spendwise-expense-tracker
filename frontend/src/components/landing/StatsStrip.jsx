import React, { useState, useEffect, useRef } from 'react';

const STATS = [
  { value: 100, suffix: '%', label: 'Free to use', isNumeric: true },
  { value: 'Real-time', suffix: '', label: 'Budget tracking', isNumeric: false },
  { value: '3-Tier', suffix: '', label: 'Threshold alerts', isNumeric: false },
  { value: 2, suffix: '', label: 'Themes, light & dark', isNumeric: true },
];

const StatsStrip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count4, setCount4] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Simple number count-up on first view
  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount1(Math.floor(easeProgress * 100));
      setCount4(Math.min(2, Math.floor(easeProgress * 2.2)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="-mt-8 sm:-mt-10 lg:-mt-12 relative z-20 max-w-5xl mx-auto px-4 sm:px-6 w-full"
    >
      <div className="bg-card border border-line rounded-2xl shadow-lg py-3.5 sm:py-4 px-4 sm:px-6 backdrop-blur-sm transition-all">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-line/60">
          
          {/* Stat 1: 100% Free */}
          <div className="py-1 px-2 flex flex-col items-center justify-center">
            <div className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-brand tracking-tight leading-tight whitespace-nowrap">
              {isVisible ? count1 : 0}%
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-soft whitespace-nowrap">
              {STATS[0].label}
            </p>
          </div>

          {/* Stat 2: Real-time */}
          <div className="py-1 px-2 flex flex-col items-center justify-center">
            <div className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight leading-tight whitespace-nowrap">
              {STATS[1].value}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-soft whitespace-nowrap">
              {STATS[1].label}
            </p>
          </div>

          {/* Stat 3: 3-Tier Thresholds */}
          <div className="py-1 px-2 flex flex-col items-center justify-center pt-2.5 md:pt-1">
            <div className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight leading-tight whitespace-nowrap">
              {STATS[2].value}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-soft whitespace-nowrap">
              {STATS[2].label}
            </p>
          </div>

          {/* Stat 4: 2 Themes */}
          <div className="py-1 px-2 flex flex-col items-center justify-center pt-2.5 md:pt-1">
            <div className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-brand tracking-tight leading-tight whitespace-nowrap">
              {isVisible ? count4 : 0}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-soft whitespace-nowrap">
              {STATS[3].label}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsStrip;
