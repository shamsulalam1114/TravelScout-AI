import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Slider,
  Paper,
  Button,
} from '@mui/material';
import ResultCard from './ResultCard';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaSortAmountDown, FaSortAmountUp, FaFilter } from 'react-icons/fa';

const NoResultsIllustration = ({ type }) => {
  const messages = {
    transportation: {
      title: 'No Transportation Found',
      subtitle: 'We couldn\'t find any buses or flights for this route.',
      emoji: '🚌✈️',
    },
    hotel: {
      title: 'No Hotels Found',
      subtitle: 'We couldn\'t find hotels at this destination. Try different dates.',
      emoji: '🏨',
    },
    'tourist-place': {
      title: 'No Tourist Places Found',
      subtitle: 'We couldn\'t find attractions for this location.',
      emoji: '🗺️',
    },
  };

  const msg = messages[type] || messages.hotel;

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        color: 'text.secondary',
      }}
    >
      <Typography variant="h1" sx={{ mb: 2, opacity: 0.6 }}>
        {msg.emoji}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {msg.title}
      </Typography>
      <Typography variant="body2">{msg.subtitle}</Typography>
    </Box>
  );
};

const ResultsSection = ({ results, loading, error, activeTab, onTabChange, onRetry }) => {
  const [sortBy, setSortBy] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const tabTypes = ['transportation', 'hotel', 'tourist-place'];

  const getCurrentResults = () => {
    if (!results) return [];
    const { transportation, hotels, touristPlaces } = results;
    return {
      0: transportation || [],
      1: hotels || [],
      2: touristPlaces || [],
    }[activeTab];
  };

  const filteredAndSorted = useMemo(() => {
    const items = getCurrentResults();

    // Filter by price range (only for items with prices)
    let filtered = items.filter((item) => {
      const price = parseFloat(item.price) || 0;
      if (price === 0) return true; // Keep items without price
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter((item) => {
        const rating = parseFloat(item.rating) || 0;
        return rating >= minRating;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'price') {
        valA = parseFloat(a.price) || 0;
        valB = parseFloat(b.price) || 0;
      } else if (sortBy === 'rating') {
        valA = parseFloat(a.rating) || 0;
        valB = parseFloat(b.rating) || 0;
      } else {
        valA = a.name || '';
        valB = b.name || '';
      }

      if (sortDirection === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, activeTab, sortBy, sortDirection, priceRange, minRating]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ py: 4 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton height={200} />
            </Box>
          ))}
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h1" sx={{ mb: 2, opacity: 0.6 }}>
            ⚠️
          </Typography>
          <Typography variant="h6" color="error.main" gutterBottom>
            {error}
          </Typography>
          {onRetry && (
            <Button
              variant="outlined"
              color="primary"
              onClick={onRetry}
              sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
            >
              Try Again
            </Button>
          )}
        </Box>
      );
    }

    if (!results) {
      return null;
    }

    const currentType = tabTypes[activeTab];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filters & Sorting Controls */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.9)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                select
                size="small"
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </TextField>

              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                }
                startIcon={
                  sortDirection === 'asc' ? (
                    <FaSortAmountUp />
                  ) : (
                    <FaSortAmountDown />
                  )
                }
                sx={{ textTransform: 'none', borderRadius: '8px' }}
              >
                {sortDirection === 'asc' ? 'Low to High' : 'High to Low'}
              </Button>

              <Button
                size="small"
                variant={showFilters ? 'contained' : 'outlined'}
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FaFilter />}
                sx={{ textTransform: 'none', borderRadius: '8px', ml: 'auto' }}
              >
                Filters
              </Button>

              <Typography variant="body2" color="text.secondary">
                {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Price Range
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={(_, newValue) => setPriceRange(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={50000}
                      step={500}
                      valueLabelFormat={(v) => `${v.toLocaleString()}`}
                    />
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      select
                      size="small"
                      label="Min Rating"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      fullWidth
                    >
                      <MenuItem value={0}>Any</MenuItem>
                      <MenuItem value={1}>1+ ★</MenuItem>
                      <MenuItem value={2}>2+ ★</MenuItem>
                      <MenuItem value={3}>3+ ★</MenuItem>
                      <MenuItem value={4}>4+ ★</MenuItem>
                    </TextField>
                  </Box>
                </Box>
              </motion.div>
            )}
          </Paper>

          <Box sx={{ py: 2 }}>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((item, index) => (
                <ResultCard
                  key={index}
                  item={item}
                  type={currentType}
                />
              ))
            ) : (
              <NoResultsIllustration type={currentType} />
            )}
          </Box>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        variant="fullWidth"
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          },
        }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Transportation</span>
              {results?.transportation?.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}
                >
                  {results.transportation.length}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Hotels</span>
              {results?.hotels?.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}
                >
                  {results.hotels.length}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Tourist Places</span>
              {results?.touristPlaces?.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}
                >
                  {results.touristPlaces.length}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>

      {renderContent()}
    </Box>
  );
};

export default ResultsSection;
