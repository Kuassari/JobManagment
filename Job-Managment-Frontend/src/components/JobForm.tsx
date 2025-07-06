import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Dialog from '../common/Dialog';
import { JobPriority } from '../types/jobTypes';
import { JOB_PRIORITY_OPTIONS } from '../utils/constants';
import { useJobContext } from '../context/JobContext';
import { useNotification } from '../context/NotificationContext';

interface JobFormProps {
  open: boolean;
  onClose: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ open, onClose }) => {
  const { createJob } = useJobContext();
  const { showNotification } = useNotification();
  
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<JobPriority>(JobPriority.Regular);
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(
    new Date(Date.now() + 60 * 60 * 1000)
  );
  
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setName('');
    setPriority(JobPriority.Regular);
    setEnableScheduling(false);
    setScheduledTime(new Date(Date.now() + 60 * 60 * 1000));
    setNameError('');
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Job name is required');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('Job name must be at least 3 characters');
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
      await createJob(
        name.trim(),
        priority,
        enableScheduling && scheduledTime ? scheduledTime : undefined
      );
      showNotification(`Job "${name}" created successfully`, 'success');
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      showNotification('Failed to create job', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create New Job"
      loading={loading}
      submitLabel="Create Job"
      onSubmit={handleSubmit}
      submitDisabled={!name.trim()}>
      <Box sx={{ p: 1 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            required
            label="Job Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            disabled={loading}
            placeholder="Enter a name for the job"/>
          
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as JobPriority)}
              disabled={loading}
              label="Priority">
              {JOB_PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Higher priority jobs will be executed first
            </FormHelperText>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={enableScheduling}
                onChange={(e) => setEnableScheduling(e.target.checked)}
                disabled={loading}/>
            }
            label="Schedule for later"/>
          
          {enableScheduling && (
            <DateTimePicker
              label="Scheduled Time"
              value={scheduledTime}
              onChange={(newValue) => setScheduledTime(newValue)}
              disabled={loading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'When the job should start'
                }
              }}/>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
};

export default JobForm;