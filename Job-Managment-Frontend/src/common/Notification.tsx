import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  open: boolean;
  message: string;
  type?: NotificationType;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  type = 'info',
  onClose,
  autoHideDuration = 5000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert 
        onClose={onClose} 
        severity={type as AlertColor} 
        variant="filled"
        sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;