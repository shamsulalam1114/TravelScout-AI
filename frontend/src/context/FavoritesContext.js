import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('travelFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('travelFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((item) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.name === item.name && f.source === item.source
      );
      if (exists) return prev;
      return [...prev, { ...item, savedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFavorite = useCallback((item) => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.name === item.name && f.source === item.source))
    );
  }, []);

  const isFavorite = useCallback(
    (item) => favorites.some((f) => f.name === item.name && f.source === item.source),
    [favorites]
  );

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
