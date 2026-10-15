import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Is SpendWise free?',
    answer:
      'Yes, SpendWise is 100% free to use. You can log unlimited income streams and expenses, configure monthly budgets, and access full visual analytics without any subscriptions or credit card requirements.',
  },
  {
    question: 'How do I set a monthly budget?',
    answer:
      'Navigate to the Budgets section from your navigation bar or dashboard. Enter your target monthly cap in LKR (Rs.). SpendWise automatically compares your actual expense logs against this goal, displaying real-time 3-tier color alerts (0-70% Safe Emerald, 70-90% Warning Amber, 90%+ Critical Red).',
  },
  {
    question: 'Can I edit or delete transactions?',
    answer:
      'Yes. On the Transactions page, you have full control over your records. You can modify amounts, change categories, update dates, or delete entries permanently at any time. Your balances update instantly in real-time.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'You can currently filter and inspect your entire financial history by custom date intervals, transaction types, and categories directly in the browser. Direct CSV export utilities are queued for an upcoming release.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. Passwords are salted and hashed using bcrypt before database storage. All API communication requires cryptographically signed JWT authorization headers, ensuring only you have access to your personal financial ledger.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-12 lg:py-16 bg-cream-band border-t border-line/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-brand block mb-1.5">
            Frequently Asked Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Everything you need to know
          </h2>
          <p className="mt-2 text-ink-soft text-sm sm:text-base max-w-xl mx-auto">
            Honest answers regarding data privacy, budget mechanics, and platform capabilities.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-2.5 sm:space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const headingId = `faq-heading-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div
                key={item.question}
                className="bg-card border border-line rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs hover:border-line-light"
              >
                <h3>
                  <button
                    type="button"
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(idx)}
                    className="w-full px-5 py-3.5 sm:py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-ink hover:text-brand transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  >
                    <span>{item.question}</span>
                    <div
                      className={`w-7 h-7 rounded-lg bg-cream flex items-center justify-center text-ink-soft transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-brand bg-brand/10' : ''
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 pt-1 text-ink-body text-xs sm:text-sm leading-relaxed border-t border-line/40">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Faq;
