import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Accessible confirm dialog modal for destructive actions
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const confirmBtnRef = useRef(null);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the confirm or cancel button when opened
    const timer = setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      aria-hidden="false"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="w-full max-w-md bg-bg-card border border-line rounded-2xl p-6 shadow-2xl relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-band transition"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? 'bg-expense/10 text-expense border border-expense/20'
                : 'bg-warn/10 text-warn border border-warn/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex-1 pr-4">
            <h3 id="alert-dialog-title" className="text-base font-bold text-ink">
              {title}
            </h3>
            <p id="alert-dialog-description" className="text-xs text-ink-soft mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:text-ink hover:bg-cream-band border border-line transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer ${
              isDestructive
                ? 'bg-expense hover:opacity-90 shadow-sm shadow-expense/20'
                : 'bg-brand hover:bg-brand-dark shadow-sm shadow-brand/20'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
