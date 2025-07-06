import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { JobStatus } from '../types/jobTypes';
import { WorkerStatus } from '../types/workerTypes';

// Combined type for all statuses
type Status = JobStatus | WorkerStatus;

interface StatusChipProps {
  status: Status;
  size?: ChipProps['size'];
}

// Status color mapping
const getStatusColor = (status: Status): ChipProps['color'] => {
  switch (status) {
    case JobStatus.Pending:
      return 'default';
    case JobStatus.InProgress:
      return 'primary';
    case JobStatus.Completed:
      return 'success';
    case JobStatus.Failed:
      return 'error';
    case JobStatus.Stopped:
      return 'warning';
    case WorkerStatus.Available:
      return 'success';
    case WorkerStatus.Busy:
      return 'primary';
    case WorkerStatus.Offline:
      return 'error';
    
    default:
      return 'default';
  }
};

/**
 * StatusChip Component
 * 
 * This component provides a consistent way to display status information
 * across the application with appropriate color coding.
 * 
 * It handles both Job and Worker statuses, applying the correct color
 * and styling for each status type.
 */
const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size={size}
      sx={{ minWidth: '80px' }}
    />
  );
};

export default StatusChip;