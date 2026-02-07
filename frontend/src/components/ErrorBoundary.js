import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // You could report to an error-tracking service here
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              maxWidth: 520,
              textAlign: 'center',
              borderRadius: '16px',
            }}
          >
            <Typography variant="h1" sx={{ mb: 2, opacity: 0.65 }}>
              😵
            </Typography>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Something went wrong
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred. Please try reloading.'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Reload Page
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' &&
              this.state.errorInfo && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: '8px',
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
