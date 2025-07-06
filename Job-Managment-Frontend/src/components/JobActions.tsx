import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Job, JobStatus } from '../types/jobTypes';
import { useJobContext } from '../context/JobContext';
import { useNotification } from '../context/NotificationContext';

interface JobActionsProps {
  job: Job;
}

const JobActions: React.FC<JobActionsProps> = ({ job }) => {
  const { stopJobById, retryJobById, deleteJobById } = useJobContext();
  const { showNotification } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check which actions are available based on job status
  const canStop = job.status === JobStatus.InProgress || job.status === JobStatus.Pending;
  const canRetry = job.status === JobStatus.Failed || job.status === JobStatus.Stopped;
  const canDelete = job.status === JobStatus.Completed || job.status === JobStatus.Failed || job.status === JobStatus.Stopped;

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setLoading(true);
    try {
      await stopJobById(job.id);
      showNotification(`Job "${job.name}" stopped`, 'info');
    } catch (error) {
      console.error('Error stopping job:', error);
      showNotification('Failed to stop job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setLoading(true);
    try {
      await retryJobById(job.id);
      showNotification(`Job "${job.name}" retrying`, 'info');
    } catch (error) {
      console.error('Error retrying job:', error);
      showNotification('Failed to retry job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteJobById(job.id);
      showNotification(`Job "${job.name}" deleted`, 'success');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting job:', error);
      showNotification('Failed to delete job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {canStop && (
          <Tooltip title="Stop Job">
            <span>
              <IconButton
                size="small"
                color="warning"
                onClick={handleStop}
                disabled={loading}>
                <StopIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {canRetry && (
          <Tooltip title="Retry Job">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={handleRetry}
                disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip title="Delete Job">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={openDeleteDialog}
                disabled={loading}>
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !loading && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the job "{job.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="inherit"
            disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JobActions;