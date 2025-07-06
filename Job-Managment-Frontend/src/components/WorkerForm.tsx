import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  FormHelperText,
  Stack
} from '@mui/material';
import Dialog from '../common/Dialog';
import { useWorkerContext } from '../context/WorkerContext';
import { useNotification } from '../context/NotificationContext';

interface WorkerFormProps {
  open: boolean;
  onClose: () => void;
}

const WorkerForm: React.FC<WorkerFormProps> = ({ open, onClose }) => {
  const { registerWorker } = useWorkerContext();
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setName('');
    setNameError('');
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Worker name is required');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('Worker name must be at least 3 characters');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await registerWorker(name.trim());
      showNotification(`Worker "${name}" registered successfully`, 'success');
      onClose();
    } catch (error) {
      console.error('Error registering worker:', error);
      showNotification('Failed to register worker', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Register New Worker"
      loading={loading}
      submitLabel="Register Worker"
      onSubmit={handleSubmit}
      submitDisabled={!name.trim()}>
      <Box sx={{ p: 1 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            required
            label="Worker Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            disabled={loading}
            placeholder="Enter a name for the worker"/>
          <FormHelperText>
            Worker process jobs concurrently based on availability
          </FormHelperText>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default WorkerForm;