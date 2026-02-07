import React from 'react';
import { Box, Button, Container, Grid, Typography, Card, CardContent, useTheme, useMediaQuery, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { FaPlane, FaHotel, FaMapMarkedAlt, FaSearch, FaShieldAlt, FaBolt, FaGlobe, FaStar, FaArrowRight } from 'react-icons/fa';
import { useThemeMode } from '../context/ThemeContext';

const FeatureCard = ({ icon: Icon, title, description, delay, gradient }) => {
  const { mode } = useThemeMode();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: mode === 'light'
              ? '0 20px 40px rgba(0,0,0,0.12)'
              : '0 20px 40px rgba(0,0,0,0.5)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Icon size={24} color="#fff" />
          </Box>
          <Typography variant="h6" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.3px' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatItem = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="h3"
        fontWeight={800}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

const TechBadge = ({ label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      bgcolor: 'action.hover',
      fontWeight: 500,
      fontSize: '0.75rem',
      '&:hover': { bgcolor: 'primary.main', color: '#fff' },
      transition: 'all 0.2s',
    }}
  />
);

const LandingPage = ({ onGetStarted }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: FaHotel,
      title: 'Smart Hotel Comparison',
      description: 'Real-time scraping from Booking.com, Agoda, and MakeMyTrip. Compare prices, amenities, and ratings across multiple platforms instantly.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: FaPlane,
      title: 'Multi-Modal Transport',
      description: 'Search buses, trains, and flights in one place. Aggregates data from Shohoz, Bangladesh Railway, and Google Flights.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: FaMapMarkedAlt,
      title: 'Tourist Attractions',
      description: 'Discover must-visit destinations powered by Wikipedia and Wikivoyage APIs. Get descriptions, ratings, and direct links.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: FaBolt,
      title: 'Lightning Fast',
      description: 'Parallel scraping with Promise.allSettled(), intelligent caching, and rate limiting ensure blazing-fast results.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      icon: FaShieldAlt,
      title: 'Anti-Detection',
      description: 'Puppeteer with Stealth Plugin, random user agents, and smart retry logic to bypass bot protection systems.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      icon: FaGlobe,
      title: 'Global Coverage',
      description: 'Works internationally — search hotels in Hungary, Japan, or anywhere Booking.com operates. No geographic limits.',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ pt: { xs: 6, md: 12 }, pb: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Chip
              label="Open Source Travel Comparison Platform"
              sx={{
                mb: 3,
                py: 2.5,
                px: 1,
                fontSize: '0.85rem',
                fontWeight: 500,
                bgcolor: mode === 'light' ? 'rgba(103, 126, 234, 0.08)' : 'rgba(103, 126, 234, 0.15)',
                border: '1px solid',
                borderColor: mode === 'light' ? 'rgba(103, 126, 234, 0.2)' : 'rgba(103, 126, 234, 0.3)',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Typography
              variant={isMobile ? 'h3' : 'h1'}
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
                mb: 3,
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              Find the{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Best Travel Deals
              </Box>
              {' '}Across the Web
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Compare hotels, flights, buses, and tourist destinations from multiple
              platforms in real-time using advanced web scraping and API integration.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={onGetStarted}
                endIcon={<FaArrowRight />}
                sx={{
                  py: 1.8,
                  px: 5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4296 100%)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Start Searching
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://github.com"
                target="_blank"
                sx={{
                  py: 1.8,
                  px: 5,
                  fontSize: '1rem',
                  borderColor: 'text.secondary',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                View Source
              </Button>
            </Box>
          </motion.div>

          {/* Tech Stack Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 5 }}>
              {['React 18', 'Node.js', 'Puppeteer', 'Material UI', 'Express', 'Wikipedia API'].map((tech) => (
                <TechBadge key={tech} label={tech} />
              ))}
            </Box>
          </motion.div>
        </Box>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              py: 5,
              px: 4,
              mb: 10,
              borderRadius: 4,
              border: '1px solid',
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <StatItem value="6+" label="Data Sources" delay={0.1} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatItem value="30+" label="Hotels Per Search" delay={0.2} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatItem value="<2min" label="Search Time" delay={0.3} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatItem value="Global" label="Coverage" delay={0.4} />
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Features Section */}
        <Box sx={{ mb: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', textAlign: 'center', mb: 1, letterSpacing: 2 }}>
              FEATURES
            </Typography>
            <Typography
              variant={isMd ? 'h4' : 'h3'}
              align="center"
              fontWeight={800}
              sx={{ mb: 1.5, letterSpacing: '-0.5px' }}
            >
              Everything You Need
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 500, mx: 'auto' }}
            >
              Powerful features built with modern web technologies for the ultimate travel comparison experience.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard {...feature} delay={0.1 + index * 0.08} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', textAlign: 'center', mb: 1, letterSpacing: 2 }}>
              HOW IT WORKS
            </Typography>
            <Typography
              variant={isMd ? 'h4' : 'h3'}
              align="center"
              fontWeight={800}
              sx={{ mb: 6, letterSpacing: '-0.5px' }}
            >
              Three Simple Steps
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Enter Your Trip', desc: 'Set origin, destination, dates and traveler count', icon: FaSearch },
              { step: '02', title: 'We Scrape & Compare', desc: 'Our scrapers fetch real-time data from 6+ sources simultaneously', icon: FaBolt },
              { step: '03', title: 'Pick Your Best Deal', desc: 'Filter, sort, and compare to find the perfect option. Save favorites for later.', icon: FaStar },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography
                      variant="h2"
                      fontWeight={800}
                      sx={{
                        opacity: 0.08,
                        fontSize: '5rem',
                        lineHeight: 1,
                        mb: -3,
                      }}
                    >
                      {item.step}
                    </Typography>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <item.icon size={24} color="#fff" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              },
            }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={800} sx={{ mb: 2, position: 'relative', letterSpacing: '-0.5px' }}>
              Ready to Find Your Best Deal?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 500, mx: 'auto', position: 'relative' }}>
              Start comparing prices across multiple travel platforms now. It's free, fast, and requires no sign-up.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onGetStarted}
              endIcon={<FaArrowRight />}
              sx={{
                py: 1.8,
                px: 5,
                fontSize: '1.1rem',
                bgcolor: '#fff',
                color: '#667eea',
                fontWeight: 700,
                position: 'relative',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                },
              }}
            >
              Get Started — It's Free
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;
