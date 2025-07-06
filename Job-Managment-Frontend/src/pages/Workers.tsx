import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Paper,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import Table, { Column } from '../common/Table';
import StatusChip from '../common/StatusChip';
import WorkerForm from '../components/WorkerForm';
import { useWorkerContext } from '../context/WorkerContext';
import { useNotification } from '../context/NotificationContext';
import { Worker, WorkerStatus } from '../types/workerTypes';
import { WORKER_STATUS_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';

const Workers: React.FC = () => {
  const { 
    workers, 
    loading, 
    refreshWorkers, 
    processQueue 
  } = useWorkerContext();
  const { showNotification } = useNotification();
  
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | ''>('');
  const [processingQueue, setProcessingQueue] = useState(false);
  
  // Combine filters
  const filteredWorkers = React.useMemo(() => {
    let result = [...workers];
    
    if (statusFilter) {
      result = result.filter(worker => worker.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(worker => 
        worker.name.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [workers, statusFilter, searchTerm]);

  const availableWorkers = workers.filter(w => w.status === WorkerStatus.Available).length;
  const busyWorkers = workers.filter(w => w.status === WorkerStatus.Busy).length;
  const offlineWorkers = workers.filter(w => w.status === WorkerStatus.Offline).length;
  const totalCompletedJobs = workers.reduce((acc, worker) => acc + worker.completedJobCount, 0);
  const totalFailedJobs = workers.reduce((acc, worker) => acc + worker.failedJobCount, 0);
  
  // Define table columns with formatting functions
  const columns: Column<Worker>[] = [
    {
      id: 'name',
      label: 'Worker Name',
      minWidth: 170,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: WorkerStatus) => <StatusChip status={value} />,
    },
    {
      id: 'currentJobId',
      label: 'Current Job',
      minWidth: 150,
      format: (value, row) => (
        value ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinearProgress 
              sx={{ width: '100%', mr: 1 }} 
              variant="indeterminate" 
              color="primary" 
            />
            <Typography variant="body2" color="text.secondary">
              Working
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {row.status === WorkerStatus.Available ? 'Idle' : 'Not available'}
          </Typography>
        )
      ),
    },
    {
      id: 'lastActivityTime',
      label: 'Last Activity',
      minWidth: 160,
      format: (value) => formatDate(value),
    },
    {
      id: 'registeredTime',
      label: 'Registered',
      minWidth: 160,
      format: (value) => formatDate(value),
    },
    {
      id: 'completedJobCount',
      label: 'Completed Jobs',
      minWidth: 140,
      align: 'right',
      format: (value) => value.toLocaleString(),
    },
    {
      id: 'failedJobCount',
      label: 'Failed Jobs',
      minWidth: 140,
      align: 'right',
      format: (value) => value.toLocaleString(),
    }
  ];

  const handleRefresh = () => {
    refreshWorkers();
  };
  
  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      await processQueue();
      showNotification('Job queue processing initiated', 'info');
    } catch (error) {
      console.error('Error processing queue:', error);
      showNotification('Failed to process job queue', 'error');
    } finally {
      setProcessingQueue(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Worker Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Available Workers
            </Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>
              {availableWorkers}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Busy Workers
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {busyWorkers}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Total Completed Jobs
            </Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>
              {totalCompletedJobs}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Total Failed Jobs
            </Typography>
            <Typography variant="h4" sx={{ color: 'error.main' }}>
              {totalFailedJobs}
            </Typography>
          </Paper>
        </Stack>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Workers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}/>
            
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WorkerStatus | '')}
                label="Status">
                {WORKER_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              justifyContent={{ xs: 'flex-end', md: 'flex-end' }} 
              sx={{ flex: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}>
                Refresh
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleProcessQueue}
                disabled={processingQueue}>
                Process Queue
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setWorkerDialogOpen(true)}>
                Register Worker
              </Button>
            </Stack>
          </Stack>
        </Paper>
        
        <Table
          columns={columns}
          data={filteredWorkers}
          title="Workers"
          loading={loading}
          emptyMessage="No workers registered. Register a new worker to get started."
          getRowId={(row) => row.id}
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWorkerDialogOpen(true)}>
              Register Worker
            </Button>
          }/>
        
        <WorkerForm
          open={workerDialogOpen}
          onClose={() => setWorkerDialogOpen(false)}/>
      </Box>
    </Container>
  );
};

export default Workers;