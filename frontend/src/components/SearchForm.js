import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Stack, Typography, Alert } from '@mui/material';
import ReactDatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import { FaPlane, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaDoorOpen } from 'react-icons/fa';

const SearchForm = ({ onSearch, loading }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (!from.trim()) {
      setValidationError('Please enter origin location.');
      return false;
    }
    if (!to.trim()) {
      setValidationError('Please enter destination location.');
      return false;
    }
    if (!checkIn) {
      setValidationError('Please select a check-in date.');
      return false;
    }
    if (!checkOut) {
      setValidationError('Please select a check-out date.');
      return false;
    }
    if (checkOut <= checkIn) {
      setValidationError('Check-out date must be after check-in date.');
      return false;
    }
    if (guests < 1 || guests > 20) {
      setValidationError('Guests must be between 1 and 20.');
      return false;
    }
    if (rooms < 1 || rooms > 10) {
      setValidationError('Rooms must be between 1 and 10.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSearch({
      from,
      to,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests,
      rooms,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Find Your Perfect Trip
            </Typography>

            {validationError && (
              <Alert severity="error" onClose={() => setValidationError('')}>
                {validationError}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <FaMapMarkerAlt style={{ marginRight: 8 }} />
                  }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <FaPlane style={{ marginRight: 8 }} />
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <div className="custom-datepicker-wrapper">
                  <ReactDatePicker
                    selected={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      // Auto-adjust check-out if it's before new check-in
                      if (checkOut && date >= checkOut) {
                        const nextDay = new Date(date);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setCheckOut(nextDay);
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    customInput={
                      <TextField
                        fullWidth
                        label="Check-in"
                        InputProps={{
                          startAdornment: <FaCalendarAlt style={{ marginRight: 8 }} />
                        }}
                      />
                    }
                  />
                </div>
              </Box>

              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <div className="custom-datepicker-wrapper">
                  <ReactDatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    dateFormat="yyyy-MM-dd"
                    minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                    customInput={
                      <TextField
                        fullWidth
                        label="Check-out"
                        InputProps={{
                          startAdornment: <FaCalendarAlt style={{ marginRight: 8 }} />
                        }}
                      />
                    }
                  />
                </div>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '140px' }}>
                <TextField
                  fullWidth
                  label="Guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  inputProps={{ min: 1, max: 20 }}
                  InputProps={{
                    startAdornment: <FaUsers style={{ marginRight: 8 }} />
                  }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: '140px' }}>
                <TextField
                  fullWidth
                  label="Rooms"
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  inputProps={{ min: 1, max: 10 }}
                  InputProps={{
                    startAdornment: <FaDoorOpen style={{ marginRight: 8 }} />
                  }}
                />
              </Box>
            </Box>

            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                }
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </motion.div>
  );
};

export default SearchForm;
