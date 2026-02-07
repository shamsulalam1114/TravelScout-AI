import React, { useState, useCallback, useRef } from 'react';
import { Container, Box } from '@mui/material';
import SearchForm from './components/SearchForm';
import ResultsSection from './components/ResultsSection';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { motion } from 'framer-motion';
import { searchTravel, cancelSearch } from './utils/api';
import { useSearchHistory } from './context/SearchHistoryContext';
import { useThemeMode } from './context/ThemeContext';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'search'
  const [prefillData, setPrefillData] = useState(null);
  const lastSearchRef = useRef(null);

  const { addSearch } = useSearchHistory();
  const { mode } = useThemeMode();

  const handleSearch = useCallback(async (searchData) => {
    setLoading(true);
    setError(null);
    lastSearchRef.current = searchData;
    setCurrentView('search');

    try {
      const data = await searchTravel(searchData);
      setResults(data);

      // Save to search history
      addSearch(searchData, {
        hotels: data?.hotels?.length || 0,
        transportation: data?.transportation?.length || 0,
        touristPlaces: data?.touristPlaces?.length || 0,
      });

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      if (err.message === 'Search cancelled') return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [addSearch]);

  const handleRetry = useCallback(() => {
    if (lastSearchRef.current) handleSearch(lastSearchRef.current);
  }, [handleSearch]);

  const handleNavigate = useCallback((view, data) => {
    cancelSearch();
    setLoading(false);

    if (view === 'landing') {
      setCurrentView('landing');
      setResults(null);
      setError(null);
      setPrefillData(null);
    } else if (view === 'search') {
      setCurrentView('search');
      setResults(null);
      setError(null);
      if (data) {
        // Pre-fill from search history
        setPrefillData(data);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: mode === 'light'
            ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          transition: 'background 0.3s ease',
        }}
      >
        <Navbar onNavigate={handleNavigate} currentView={currentView} />

        <Box sx={{ flex: 1, pt: '64px' }}>
          {currentView === 'landing' ? (
            <LandingPage onGetStarted={() => setCurrentView('search')} />
          ) : (
            <Container maxWidth="lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ pt: 4, pb: 8 }}>
                  <SearchForm
                    onSearch={handleSearch}
                    loading={loading}
                    prefillData={prefillData}
                  />

                  {(results || loading || error) && (
                    <Box id="results-section" sx={{ mt: 4 }}>
                      <ResultsSection
                        results={results}
                        loading={loading}
                        error={error}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onRetry={handleRetry}
                      />
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Container>
          )}
        </Box>

        <Footer />
      </Box>
    </ErrorBoundary>
  );
}

export default App;
