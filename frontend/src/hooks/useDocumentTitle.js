import { useEffect } from 'react';

/**
 * Custom hook to update document title per route
 * @param {string} title - Page title prefix
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const fullTitle = title 
      ? `${title} — SpendWise` 
      : 'SpendWise — Personal Finance & Budget Tracker';
    document.title = fullTitle;
  }, [title]);
};

export default useDocumentTitle;
