import React from 'react';
import { Box, Container, Typography, IconButton, Grid, Link, Divider } from '@mui/material';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart, FaCode } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        px: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              TravelScout
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              AI-powered travel comparison platform. Find the best deals on hotels,
              transportation, and discover amazing tourist destinations worldwide.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href="#" underline="hover" color="text.secondary" variant="body2">
                Hotel Comparison
              </Link>
              <Link href="#" underline="hover" color="text.secondary" variant="body2">
                Flight Search
              </Link>
              <Link href="#" underline="hover" color="text.secondary" variant="body2">
                Tourist Places
              </Link>
              <Link href="#" underline="hover" color="text.secondary" variant="body2">
                Price Alerts
              </Link>
            </Box>
          </Grid>

          {/* Tech Stack */}
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Built With
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">React 18 + Material UI</Typography>
              <Typography variant="body2" color="text.secondary">Node.js + Express</Typography>
              <Typography variant="body2" color="text.secondary">Puppeteer + Cheerio</Typography>
              <Typography variant="body2" color="text.secondary">Wikipedia API</Typography>
            </Box>
          </Grid>

          {/* Connect */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Connect
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href="https://github.com"
                target="_blank"
                size="small"
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' },
                }}
              >
                <FaGithub />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                size="small"
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: '#0077b5', color: 'white' },
                }}
              >
                <FaLinkedin />
              </IconButton>
              <IconButton
                href="mailto:hello@example.com"
                size="small"
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'secondary.main', color: 'white' },
                }}
              >
                <FaEnvelope />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} TravelScout. Built for educational purposes.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Made with <FaHeart size={10} color="#e91e63" /> and <FaCode size={10} /> by a passionate developer
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
