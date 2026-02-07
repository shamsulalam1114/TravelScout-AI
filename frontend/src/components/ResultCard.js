import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaWifi,
  FaSwimmingPool,
  FaParking,
  FaCoffee,
  FaDumbbell,
  FaBus,
  FaPlane,
  FaHeart,
  FaRegHeart,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import { useThemeMode } from '../context/ThemeContext';

const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || '৳';

const sourceColors = {
  'Booking.com': { bg: '#003580', text: '#fff' },
  Agoda: { bg: '#5542F6', text: '#fff' },
  MakeMyTrip: { bg: '#E4002B', text: '#fff' },
  Shohoz: { bg: '#FF6B00', text: '#fff' },
  'Bangladesh Railway': { bg: '#006A4E', text: '#fff' },
  'Google Flights': { bg: '#4285F4', text: '#fff' },
  Wikipedia: { bg: '#636466', text: '#fff' },
  Wikivoyage: { bg: '#339966', text: '#fff' },
};

const amenityIcons = {
  WiFi: FaWifi,
  Pool: FaSwimmingPool,
  Parking: FaParking,
  Restaurant: FaCoffee,
  Gym: FaDumbbell,
  bus: FaBus,
  flight: FaPlane,
};

const ResultCard = ({ item, type }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { mode } = useThemeMode();
  const theme = useTheme();
  const liked = isFavorite(item);

  const getAmenityIcon = (amenity) => {
    const IconComponent = amenityIcons[amenity] || FaCoffee;
    return <IconComponent />;
  };

  const handleFavoriteToggle = () => {
    if (liked) removeFavorite(item);
    else addFavorite(item);
  };

  const sourceBadge = item.source ? (
    <Chip
      label={item.source}
      size="small"
      sx={{
        ml: 1,
        fontWeight: 600,
        fontSize: '0.7rem',
        bgcolor: sourceColors[item.source]?.bg || '#666',
        color: sourceColors[item.source]?.text || '#fff',
      }}
    />
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          display: 'flex',
          mb: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          boxShadow: mode === 'light'
            ? '0 2px 12px rgba(0,0,0,0.06)'
            : '0 2px 12px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 8px 30px rgba(0,0,0,0.12)'
              : '0 8px 30px rgba(0,0,0,0.5)',
            transform: 'translateY(-3px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          flexDirection: { xs: 'column', sm: 'row' },
          position: 'relative',
        }}
      >
        {/* Favorite Button */}
        <Tooltip title={liked ? 'Remove from favorites' : 'Save to favorites'}>
          <IconButton
            onClick={handleFavoriteToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.8)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s',
            }}
            size="small"
          >
            {liked ? (
              <FaHeart color="#e91e63" size={16} />
            ) : (
              <FaRegHeart size={16} />
            )}
          </IconButton>
        </Tooltip>

        <CardMedia
          component="img"
          sx={{
            width: { xs: '100%', sm: 220 },
            height: { xs: 180, sm: 'auto' },
            minHeight: { sm: 200 },
            objectFit: 'cover',
          }}
          image={item.imageUrl || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400`}
          alt={item.name}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              {type === 'transportation' && (
                <Box sx={{ mr: 0.5, color: 'primary.main' }}>
                  {item.type === 'bus' ? <FaBus /> : <FaPlane />}
                </Box>
              )}
              <Typography variant="h6" fontWeight={700} sx={{ mr: 'auto', letterSpacing: '-0.3px' }}>
                {item.name || item.provider}
              </Typography>
              {sourceBadge}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
              <Rating
                value={parseFloat(item.rating) || 0}
                readOnly
                precision={0.5}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                ({item.rating || 'N/A'})
              </Typography>
            </Box>

            {type === 'hotel' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                  <FaMapMarkerAlt size={12} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                </Box>

                {item.amenities?.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                    {item.amenities.slice(0, 5).map((amenity, index) => (
                      <Chip
                        key={index}
                        icon={getAmenityIcon(amenity)}
                        label={amenity}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}

            {type === 'transportation' && (
              <Box sx={{ my: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Route</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.from} → {item.to}
                    </Typography>
                  </Box>
                  {item.duration && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FaClock size={11} />
                        <Typography variant="body2" fontWeight={600}>{item.duration}</Typography>
                      </Box>
                    </Box>
                  )}
                  {item.departureTime && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Departure</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.departureTime}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {type === 'tourist-place' && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
                  {item.description?.slice(0, 150)}
                  {item.description?.length > 150 ? '...' : ''}
                </Typography>
                {item.category && (
                  <Chip label={item.category} size="small" variant="outlined" sx={{ mb: 1 }} />
                )}
              </>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 'auto',
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {item.price != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {type === 'hotel' ? 'per night' : 'price'}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">
                    {CURRENCY_SYMBOL}
                    {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                  </Typography>
                </Box>
              )}

              {(item.bookingLink || item.link) && (
                <Button
                  variant="contained"
                  href={item.bookingLink || item.link}
                  target="_blank"
                  endIcon={<FaExternalLinkAlt size={12} />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4296 100%)',
                    },
                  }}
                >
                  {type === 'tourist-place' ? 'View Details' : 'Book Now'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ResultCard;
