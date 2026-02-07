import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SearchHistoryContext = createContext();

export const useSearchHistory = () => useContext(SearchHistoryContext);

const MAX_HISTORY = 20;

export const SearchHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  const addSearch = useCallback((searchParams, resultCounts) => {
    setHistory((prev) => {
      const entry = {
        id: Date.now(),
        ...searchParams,
        resultCounts,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <SearchHistoryContext.Provider value={{ history, addSearch, clearHistory, removeEntry }}>
      {children}
    </SearchHistoryContext.Provider>
  );
};
