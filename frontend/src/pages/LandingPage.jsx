import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import StatsStrip from '../components/landing/StatsStrip';
import FeaturesSection from '../components/landing/FeaturesSection';
import ProductPreview from '../components/landing/ProductPreview';
import HowItWorks from '../components/landing/HowItWorks';
import BudgetSystem from '../components/landing/BudgetSystem';
import SecuritySection from '../components/landing/SecuritySection';
import FaqSection from '../components/landing/FaqSection';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage = () => {
  // Set clean title and scroll to top on mount
  useEffect(() => {
    document.title = 'SpendWise | Personal Expense & Budget Tracker';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0a0e17] text-ink selection:bg-brand selection:text-white flex flex-col font-sans overflow-x-hidden">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section (Uncovered Phone & Woman, Large Fraunces Typography) */}
        <HeroSection />

        {/* 3. Stats Strip (Honest Features, Overlapping Hero Bottom) */}
        <StatsStrip />

        {/* 4. Features Bento Grid */}
        <FeaturesSection />

        {/* 5. Product Preview (Dedicated Browser & Mobile Mockup Section) */}
        <ProductPreview />

        {/* 6. How It Works (3-Step Roadmap) */}
        <HowItWorks />

        {/* 7. Interactive Budget System Simulator */}
        <BudgetSystem />

        {/* 8. Security Highlights */}
        <SecuritySection />

        {/* 9. Frequently Asked Questions Accordion */}
        <FaqSection />

        {/* 10. Final Call to Action */}
        <FinalCta />
      </main>

      {/* 11. Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
