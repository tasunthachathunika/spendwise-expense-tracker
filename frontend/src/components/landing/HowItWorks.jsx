import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, PlusCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'Create your free account',
    desc: 'Sign up in seconds with your email and a secure password. No credit card required.',
  },
  {
    number: '2',
    icon: PlusCircle,
    title: 'Add your transactions',
    desc: 'Log income and expenses, and let SpendWise organise them into color-coded categories.',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Track your budget',
    desc: 'Set a monthly spending limit and watch your visual progress in real time.',
  },
];

const HowItWorks = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-cream dark:bg-[#0a0e17] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
            How it works
          </div>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
            Get started in three simple steps
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-2xl mx-auto">
            From zero to complete financial clarity in less than two minutes.
          </p>
        </div>

        {/* 3 Step Cards with connecting line on desktop */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Connecting dashed line on desktop */}
          <div
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] border-t-2 border-dashed border-line z-0"
            aria-hidden="true"
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative z-10 bg-white dark:bg-bg-card border border-line rounded-2xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-md transition duration-200"
              >
                {/* Step Circle with Brand Number */}
                <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-brand/20 mb-6">
                  {step.number}
                </div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-ink-body text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Centered Action Button */}
        <div className="mt-12">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition duration-200"
          >
            <span>{isAuthenticated ? 'Open your dashboard' : 'Create free account'}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
