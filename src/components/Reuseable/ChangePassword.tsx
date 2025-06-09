import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { updatePassword } from '../../services/api';

const ChangePassword: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj.id);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword) errs.oldPassword = 'Old password is required';
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else {
      const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
      if (!strongPattern.test(newPassword)) {
        errs.newPassword =
          'Password must be at least 8 characters, include uppercase, lowercase, number, and symbol';
      }
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || userId === null) return;

    try {
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        resetPassword: false
      };

      await updatePassword(userId, payload);

      setSnack({
        open: true,
        message: 'Password updated successfully!',
        severity: 'success'
      });

      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error(error);
      setSnack({
        open: true,
        message: error?.response?.data?.message || 'Failed to update password',
        severity: 'error'
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1400, mx: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Change Password
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Old Password"
          name="oldPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.oldPassword}
          onChange={handleChange}
          error={!!errors.oldPassword}
          helperText={errors.oldPassword}
        />

        <TextField
          label="New Password"
          name="newPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.newPassword}
          onChange={handleChange}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
        />

        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" type="submit">
            Update Password
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ChangePassword;
