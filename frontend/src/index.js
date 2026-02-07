import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeContextProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { SearchHistoryProvider } from './context/SearchHistoryContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <FavoritesProvider>
        <SearchHistoryProvider>
          <App />
        </SearchHistoryProvider>
      </FavoritesProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);
