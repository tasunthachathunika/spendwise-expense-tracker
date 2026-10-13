import React, { useId } from 'react';
import { Link } from 'react-router-dom';

/**
 * SpendWise Icon Mark (100% Pixel-Accurate Vector Monogram)
 *
 * Recreates the exact brand icon from the reference image:
 * - Rounded squircle app-icon badge with warm orange gradient (#FF7A45 -> #EA5028)
 * - Inner border highlight ring (white/25)
 * - Stylized "S" financial monogram combining:
 *   1. Upward financial growth arrow (↗) with diagonal shaft and solid triangular arrowhead
 *   2. Inner upper loop hook with smooth rounded return
 *   3. Upper outer protective arch
 *   4. Lower outer sweeping wealth arch with 45° cut terminals
 *   5. Ascending 3-step staircase foundation bar chart + lower inner pill loop
 */
export const SpendWiseIcon = ({ size = 44, className = '' }) => {
  const gradId = useId();
  const shadowId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-hidden="true"
      role="img"
    >
      <defs>
        {/* Warm vibrant orange gradient matching reference image */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="50%" stopColor="#FF6233" />
          <stop offset="100%" stopColor="#EA5028" />
        </linearGradient>

        {/* Soft ambient fintech glow drop shadow */}
        <filter id={shadowId} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#EA5028" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Squircle Badge Container with Ambient Glow */}
      <g filter={`url(#${shadowId})`}>
        {/* Squircle Background */}
        <rect width="100" height="100" rx="26" fill={`url(#${gradId})`} />

        {/* 1.5px Inset Inner Border Ring Highlight */}
        <rect
          x="2.5"
          y="2.5"
          width="95"
          height="95"
          rx="23.5"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          fill="none"
        />

        {/*
          THE 4-PART "S" FINANCIAL GROWTH MONOGRAM:
          Exact vectors extracted from brand identity reference
        */}
        <g fill="white">
          {/* Part 1: Diagonal Growth Arrow (↗) + Upper Inner Hook */}
          <path d="M 80.64,18.0 L 77.46,33.89 L 72.92,29.8 L 55.22,47.96 L 53.86,48.41 L 40.24,48.41 L 36.61,47.05 L 33.89,44.33 L 32.98,42.06 L 32.98,38.43 L 34.34,35.25 L 36.16,33.43 L 38.88,32.07 L 49.32,32.07 L 51.13,32.98 L 52.5,34.34 L 50.23,37.06 L 49.32,37.52 L 48.41,37.06 L 39.79,37.06 L 37.97,38.88 L 37.97,41.15 L 38.43,42.06 L 40.24,43.42 L 52.04,43.42 L 69.29,26.17 L 65.21,21.63 L 71.56,20.27 L 72.01,19.82 L 73.83,19.82 L 76.1,18.91 L 80.18,18.45 L 80.64,18.0 Z" />

          {/* Part 2: Outer Upper Curved Arc of 'S' */}
          <path d="M 38.88,20.72 L 49.32,20.72 L 49.77,21.18 L 51.59,21.18 L 56.13,22.99 L 60.21,26.62 L 56.58,29.8 L 53.86,27.53 L 48.87,25.72 L 39.79,25.72 L 39.33,26.17 L 36.16,26.62 L 33.43,27.99 L 29.35,32.07 L 27.53,35.7 L 27.08,42.06 L 28.89,47.5 L 32.52,51.59 L 34.79,52.95 L 34.34,53.4 L 34.79,53.86 L 34.79,57.94 L 33.89,57.94 L 27.99,54.31 L 25.26,51.13 L 22.54,44.78 L 22.09,37.52 L 22.54,37.06 L 22.54,35.25 L 23.45,32.52 L 25.72,28.44 L 31.16,23.45 L 34.79,21.63 L 38.43,21.18 L 38.88,20.72 Z" />

          {/* Part 3: Outer Lower Curved Arc of 'S' with 45° Angle Slits */}
          <path d="M 64.75,44.33 L 66.57,44.78 L 70.65,47.05 L 74.28,50.68 L 76.55,54.77 L 77.91,59.3 L 77.91,66.11 L 77.01,69.29 L 76.1,70.65 L 76.1,71.56 L 72.92,76.1 L 70.2,78.37 L 66.11,80.64 L 63.39,81.55 L 61.12,81.55 L 60.67,82.0 L 50.68,82.0 L 55.22,77.01 L 62.48,76.55 L 66.57,74.74 L 70.65,70.65 L 72.47,67.02 L 72.92,65.66 L 72.92,59.3 L 70.65,54.31 L 67.02,50.68 L 63.39,48.87 L 60.67,48.41 L 64.75,44.33 Z" />

          {/* Part 4: Financial Staircase Base + Lower Inner Loop */}
          <path d="M 38.88,54.31 L 60.21,54.31 L 60.67,54.77 L 62.03,54.77 L 63.84,55.67 L 65.66,57.49 L 67.02,60.21 L 67.02,64.3 L 65.66,67.48 L 63.84,69.29 L 61.12,70.65 L 32.52,70.65 L 32.07,71.11 L 32.07,74.74 L 32.98,77.01 L 49.77,77.01 L 45.23,82.0 L 20.27,82.0 L 19.36,81.55 L 19.36,77.01 L 26.62,77.01 L 27.08,76.55 L 27.08,66.11 L 27.53,65.66 L 38.43,65.66 L 38.88,65.21 L 38.43,64.75 L 38.88,64.3 L 38.43,63.84 L 38.43,54.77 L 38.88,54.31 Z" />
        </g>
      </g>
    </svg>
  );
};

/**
 * SpendWise Full Brand Logo Component
 *
 * @param {'sm' | 'md' | 'lg'} size - 'sm' (navbar), 'md' (header), 'lg' (hero/auth)
 * @param {boolean} showTagline - Displays 'PERSONAL FINANCE' subtitle when true
 * @param {'light' | 'dark' | 'auto'} theme - Explicit light/dark theme override or auto-adaptive
 * @param {boolean} onDark - If true, forces light text for dark brand panels (#fdf9ef)
 * @param {boolean} asLink - If true, wraps in a React Router Link to "/"
 * @param {boolean} iconOnly - Renders only the squircle icon badge
 * @param {string} className - Optional outer class overrides
 */
const SpendWiseLogo = ({
  size = 'md',
  showTagline = true,
  theme = 'auto',
  onDark = false,
  asLink = false,
  iconOnly = false,
  className = '',
}) => {
  const SIZES = {
    sm: {
      icon: 36,
      title: 'text-xl',
      tagline: 'text-[9px]',
      gap: 'gap-3',
      taglineMargin: 'mt-0.5',
    },
    md: {
      icon: 46,
      title: 'text-2xl',
      tagline: 'text-[10px]',
      gap: 'gap-3.5',
      taglineMargin: 'mt-1',
    },
    lg: {
      icon: 60,
      title: 'text-3xl sm:text-4xl',
      tagline: 'text-[12px]',
      gap: 'gap-4',
      taglineMargin: 'mt-1.5',
    },
  };

  const currentSize = SIZES[size] || SIZES.md;
  const isDarkContext = onDark || theme === 'dark';

  const getSpendColorClass = () => {
    if (isDarkContext) return 'text-[#fdf9ef]';
    if (theme === 'light') return 'text-[#1A2332]';
    return 'text-[#1A2332] dark:text-[#fdf9ef]';
  };

  const content = (
    <span
      className={`inline-flex items-center ${currentSize.gap} select-none group focus-visible:outline-none ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Brand Icon Mark */}
      <SpendWiseIcon size={currentSize.icon} />

      {/* Typography Wordmark */}
      <span className="flex flex-col leading-none justify-center">
        {/* Primary Wordmark "SpendWise" */}
        <span
          className={`font-extrabold tracking-tight ${currentSize.title} leading-none flex items-center transition-colors duration-200`}
        >
          <span className={getSpendColorClass()}>Spend</span>
          <span className="text-[#FF6233]">Wise</span>
        </span>

        {/* Subtitle "PERSONAL FINANCE" */}
        {showTagline && (
          <span
            className={`font-semibold tracking-[0.28em] ${
              isDarkContext ? 'text-[#d6cdbd]' : 'text-[#64748B] dark:text-[#94A3B8]'
            } uppercase ${currentSize.tagline} ${currentSize.taglineMargin} block`}
          >
            PERSONAL FINANCE
          </span>
        )}
      </span>
    </span>
  );

  if (iconOnly) {
    return <SpendWiseIcon size={currentSize.icon} className={className} />;
  }

  if (asLink) {
    return (
      <Link
        to="/"
        aria-label="SpendWise home"
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default SpendWiseLogo;
