import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  loading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  submitDisabled = false
}) => {
  return (
    <MuiDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      {/* Dialog header with title and close button */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {!loading && (
            <IconButton edge="end" color="inherit" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {children}
      </DialogContent>
      
      <DialogActions>
        {actions ? (
          actions
        ) : (
          <>
            <Button 
              onClick={onClose} 
              color="inherit" 
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button 
                onClick={onSubmit} 
                color="primary" 
                variant="contained" 
                disabled={loading || submitDisabled}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}>
                {loading ? 'Processing...' : submitLabel}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </MuiDialog>
  );
};

export default Dialog;