import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsStrip from '../components/landing/StatsStrip';
import FeatureShowcaseSection from '../components/landing/FeatureShowcaseSection';
import Features from '../components/landing/Features';
import BudgetDemo from '../components/landing/BudgetDemo';
import Security from '../components/landing/Security';
import Faq from '../components/landing/Faq';
import FinalCta from '../components/landing/FinalCta';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-cream text-ink selection:bg-brand selection:text-white flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <FeatureShowcaseSection />
        <Features />
        <BudgetDemo />
        <Security />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
