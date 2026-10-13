import React, { useRef } from 'react';
import { PlusCircle, Gauge, BarChart3 } from 'lucide-react';
import useAutoplay from '../../hooks/useAutoplay';
import DashboardMockup from './DashboardMockup';

const STEPS = [
  {
    id: 0,
    number: '1',
    title: 'Instant transaction logging',
    description:
      'Categorise expenses and income with instant rupee calculation.',
    icon: PlusCircle,
    highlights: ['transactions', 'income', 'expenses'],
  },
  {
    id: 1,
    number: '2',
    title: 'Dynamic budget thresholds',
    description:
      'Visual alerts as you approach your monthly limit: amber from 70% used, red from 90% used.',
    icon: Gauge,
    highlights: ['budget', 'monthlyBudget'],
  },
  {
    id: 2,
    number: '3',
    title: 'Automated monthly reports',
    description:
      'Visual breakdown of cash flow, balance and savings.',
    icon: BarChart3,
    highlights: ['chart', 'balance'],
  },
];

const FeatureShowcaseSection = () => {
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);

  const {
    activeStep,
    timerKey,
    isPaused,
    selectStep,
    setIsHovered,
    setIsFocusInside,
  } = useAutoplay({
    totalSteps: STEPS.length,
    interval: 4000,
    containerRef: sectionRef,
  });

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % STEPS.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + STEPS.length) % STEPS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = STEPS.length - 1;
    }

    if (nextIndex !== null) {
      selectStep(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="showcase-title"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocusInside(true)}
      onBlur={(e) => {
        if (!sectionRef.current?.contains(e.relatedTarget)) {
          setIsFocusInside(false);
        }
      }}
      className="scroll-mt-24 bg-cream-band py-20 lg:py-28 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header, centered, max-w-3xl */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand block mb-3">
            How SpendWise works
          </span>
          <h2
            id="showcase-title"
            className="font-serif text-4xl lg:text-5xl font-bold text-ink text-balance tracking-tight leading-[1.15]"
          >
            Master your cash flow in three simple steps
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-2xl mx-auto leading-relaxed">
            Watch your personal financial ledger update automatically with each entry.
          </p>
        </div>

        {/* Body Grid: Mobile steps on top, mockup below. Desktop steps left, mockup right */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-14 items-center mt-14">
          
          {/* LEFT: Step Switcher */}
          <div className="flex flex-col gap-3">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="Workflow steps"
              className="flex flex-col gap-3"
            >
              {STEPS.map((step, index) => {
                const isActive = activeStep === index;
                const IconComponent = step.icon;

                return (
                  <button
                    key={step.id}
                    ref={(el) => (tabRefs.current[index] = el)}
                    role="tab"
                    id={`tab-${index}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${index}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectStep(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    type="button"
                    className={`w-full text-left rounded-2xl p-5 border transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 ${
                      isActive
                        ? 'bg-card border-line shadow-lg text-ink'
                        : 'border-transparent text-ink-soft hover:bg-card/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Step Number Circle */}
                      <span
                        className={`w-9 h-9 rounded-full font-mono font-bold flex items-center justify-center text-sm flex-shrink-0 transition-colors duration-300 ${
                          isActive
                            ? 'bg-brand text-white shadow-sm'
                            : 'bg-cream dark:bg-card/80 border border-line text-ink-soft'
                        }`}
                      >
                        {step.number}
                      </span>

                      {/* Title + Small Icon */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <IconComponent
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive ? 'text-brand' : 'text-ink-soft'
                          }`}
                        />
                        <span
                          className={`text-base sm:text-lg font-semibold truncate ${
                            isActive ? 'text-ink font-bold' : 'text-ink-soft'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </div>

                    {/* Smooth expanding description (grid-template-rows 0fr to 1fr) */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                        isActive
                          ? 'grid-rows-[1fr] opacity-100 mt-2.5 pl-12.5'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm text-ink-body leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Thin Progress Bar (Restarted with key on change, fills in 4s) */}
                    {isActive && (
                      <div className="w-full bg-cream-band dark:bg-line/40 h-1 rounded-full mt-4 overflow-hidden">
                        <div
                          key={`step-progress-${activeStep}-${timerKey}`}
                          className="h-full bg-brand rounded-full animate-step-progress"
                          style={{
                            animationPlayState: isPaused ? 'paused' : 'running',
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider Dots Under the List */}
            <div
              className="flex items-center gap-2 mt-2 px-2"
              role="group"
              aria-label="Step slider navigation"
            >
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 cursor-pointer ${
                    activeStep === i
                      ? 'w-7 bg-brand'
                      : 'w-2.5 bg-line hover:bg-ink-soft'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Dashboard Mockup */}
          <div className="w-full">
            <DashboardMockup activeStep={activeStep} />
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeatureShowcaseSection;
