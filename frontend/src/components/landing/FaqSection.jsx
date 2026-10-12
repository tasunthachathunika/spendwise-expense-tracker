import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Is SpendWise free?',
    a: 'Yes, SpendWise is completely free to use. All budgeting, transaction tracking, and analytical features are fully accessible without hidden paywalls or subscription tiers.',
  },
  {
    q: 'How do I set a monthly budget?',
    a: "Once logged in, navigate to the Budgets tab from the sidebar. Click 'Create Budget', select a category (e.g., Food & Dining, Rent, Utilities), and assign your monthly spending cap in rupees.",
  },
  {
    q: 'Can I edit or delete transactions?',
    a: 'Yes, full CRUD operations are supported. You can edit amounts, dates, categories, descriptions, or permanently delete any transaction directly from the Transactions page.',
  },
  {
    q: 'What currency is used by SpendWise?',
    a: 'SpendWise is customized for Sri Lankan Rupees (Rs. / LKR), with clean number formatting that makes it easy to track local living expenses and income streams.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All authentication sessions use cryptographically signed JWT tokens, and user passwords are salted and hashed with bcrypt. Data is securely stored in MongoDB with user-level isolation.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-20 lg:py-28 bg-cream-band dark:bg-[#111827]">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
            Frequently asked questions
          </div>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
            Common questions answered
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-xl mx-auto">
            Everything you need to know about getting started with SpendWise.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-bg-card border border-line rounded-2xl overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 flex items-center justify-between text-left text-base font-semibold text-ink hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-soft transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? 'transform rotate-180 text-brand' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-ink-body leading-relaxed border-t border-line/40 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
