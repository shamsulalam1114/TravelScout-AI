import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
} from '@mui/material';
import {
  FaSun,
  FaMoon,
  FaHeart,
  FaHistory,
  FaHome,
  FaGithub,
  FaBars,
  FaTrash,
  FaTimes,
  FaSearch,
  FaRobot,
} from 'react-icons/fa';
import { useThemeMode } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onNavigate, currentView }) => {
  const { mode, toggleTheme } = useThemeMode();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const { history, clearHistory, removeEntry } = useSearchHistory();
  const [favDrawer, setFavDrawer] = useState(false);
  const [historyDrawer, setHistoryDrawer] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            mode === 'light'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(13,33,55,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${
            mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
          }`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => onNavigate('landing')}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              TravelScout
            </Typography>
            <Chip
              label="BETA"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: 'secondary.main',
                color: '#fff',
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                startIcon={<FaHome />}
                onClick={() => onNavigate('landing')}
                sx={{
                  color: 'text.primary',
                  fontWeight: currentView === 'landing' ? 700 : 400,
                }}
              >
                Home
              </Button>
              <Button
                startIcon={<FaSearch />}
                onClick={() => onNavigate('search')}
                sx={{
                  color: 'text.primary',
                  fontWeight: currentView === 'search' ? 700 : 400,
                }}
              >
                Search
              </Button>
              <Button
                startIcon={<FaRobot />}
                onClick={() => onNavigate('tripPlanner')}
                sx={{
                  color: 'text.primary',
                  fontWeight: currentView === 'tripPlanner' ? 700 : 400,
                  background: currentView === 'tripPlanner'
                    ? 'linear-gradient(135deg, rgba(102,126,234,0.12), rgba(118,75,162,0.12))'
                    : 'none',
                }}
              >
                AI Planner
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              <Tooltip title="Search History">
                <IconButton onClick={() => setHistoryDrawer(true)} sx={{ color: 'text.primary' }}>
                  <Badge badgeContent={history.length} color="primary" max={9}>
                    <FaHistory />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Saved Favorites">
                <IconButton onClick={() => setFavDrawer(true)} sx={{ color: 'text.primary' }}>
                  <Badge badgeContent={favorites.length} color="error" max={9}>
                    <FaHeart />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
                <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
                  {mode === 'light' ? <FaMoon /> : <FaSun />}
                </IconButton>
              </Tooltip>

              <Tooltip title="GitHub">
                <IconButton
                  href="https://github.com"
                  target="_blank"
                  sx={{ color: 'text.primary' }}
                >
                  <FaGithub />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
                {mode === 'light' ? <FaMoon /> : <FaSun />}
              </IconButton>
              <IconButton onClick={() => setMobileMenu(true)} sx={{ color: 'text.primary' }}>
                <FaBars />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer anchor="right" open={mobileMenu} onClose={() => setMobileMenu(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Menu</Typography>
            <IconButton onClick={() => setMobileMenu(false)}>
              <FaTimes />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={() => { onNavigate('landing'); setMobileMenu(false); }}>
              <ListItemIcon><FaHome /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => { onNavigate('search'); setMobileMenu(false); }}>
              <ListItemIcon><FaSearch /></ListItemIcon>
              <ListItemText primary="Search" />
            </ListItem>
            <ListItem button onClick={() => { onNavigate('tripPlanner'); setMobileMenu(false); }}>
              <ListItemIcon><FaRobot /></ListItemIcon>
              <ListItemText primary="AI Trip Planner" />
            </ListItem>
            <ListItem button onClick={() => { setHistoryDrawer(true); setMobileMenu(false); }}>
              <ListItemIcon>
                <Badge badgeContent={history.length} color="primary" max={9}>
                  <FaHistory />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
            <ListItem button onClick={() => { setFavDrawer(true); setMobileMenu(false); }}>
              <ListItemIcon>
                <Badge badgeContent={favorites.length} color="error" max={9}>
                  <FaHeart />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Favorites" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Favorites Drawer */}
      <Drawer anchor="right" open={favDrawer} onClose={() => setFavDrawer(false)}>
        <Box sx={{ width: 380, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              <FaHeart style={{ marginRight: 8, color: '#e91e63' }} />
              Saved ({favorites.length})
            </Typography>
            {favorites.length > 0 && (
              <Button size="small" color="error" onClick={clearFavorites} startIcon={<FaTrash />}>
                Clear All
              </Button>
            )}
          </Box>
          <AnimatePresence>
            {favorites.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography variant="h3" sx={{ mb: 2, opacity: 0.4 }}>💔</Typography>
                <Typography variant="body2">No favorites saved yet</Typography>
              </Box>
            ) : (
              favorites.map((fav, i) => (
                <motion.div
                  key={`${fav.name}-${fav.source}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'start',
                    }}
                  >
                    {fav.imageUrl && (
                      <Box
                        component="img"
                        src={fav.imageUrl}
                        sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {fav.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fav.source} {fav.price ? `• ৳${fav.price}` : ''}
                      </Typography>
                      {fav.bookingLink && (
                        <Box sx={{ mt: 0.5 }}>
                          <Button
                            size="small"
                            variant="text"
                            href={fav.bookingLink}
                            target="_blank"
                            sx={{ p: 0, minWidth: 0, fontSize: '0.7rem' }}
                          >
                            View →
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <IconButton size="small" onClick={() => removeFavorite(fav)}>
                      <FaTimes size={12} />
                    </IconButton>
                  </Box>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </Box>
      </Drawer>

      {/* History Drawer */}
      <Drawer anchor="right" open={historyDrawer} onClose={() => setHistoryDrawer(false)}>
        <Box sx={{ width: 380, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              <FaHistory style={{ marginRight: 8 }} />
              Recent Searches
            </Typography>
            {history.length > 0 && (
              <Button size="small" color="error" onClick={clearHistory} startIcon={<FaTrash />}>
                Clear
              </Button>
            )}
          </Box>
          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography variant="h3" sx={{ mb: 2, opacity: 0.4 }}>🔍</Typography>
              <Typography variant="body2">No searches yet</Typography>
            </Box>
          ) : (
            history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Box
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                    position: 'relative',
                  }}
                  onClick={() => {
                    onNavigate('search', entry);
                    setHistoryDrawer(false);
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {entry.from} → {entry.to}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.checkIn} to {entry.checkOut}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {entry.resultCounts && (
                      <>
                        <Chip label={`${entry.resultCounts.hotels || 0} hotels`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        <Chip label={`${entry.resultCounts.transportation || 0} transport`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      </>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {formatDate(entry.timestamp)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <FaTimes size={10} />
                  </IconButton>
                </Box>
              </motion.div>
            ))
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
