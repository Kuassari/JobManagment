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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Table, { Column } from '../common/Table';
import StatusChip from '../common/StatusChip';
import JobForm from '../components/JobForm';
import JobActions from '../components/JobActions';
import { useJobContext } from '../context/JobContext';
import { Job, JobStatus, JobPriority } from '../types/jobTypes';
import { JOB_STATUS_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { jobs, loading, refreshJobs, filterJobsByStatus, filterJobsByName } = useJobContext();
  
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-render

  // Combine filters
  const filteredJobs = React.useMemo(() => {
    let result = [...jobs];
    
    if (statusFilter) {
      result = result.filter(job => job.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.name.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [jobs, statusFilter, searchTerm]);

  // Define table columns with formatting functions
  const columns: Column<Job>[] = [
    {
      id: 'name',
      label: 'Job Name',
      minWidth: 170,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value: JobPriority) => (
        <Typography
          sx={{
            color: value === JobPriority.High ? 'error.main' : 
                 value === JobPriority.Regular ? 'primary.main' : 'text.secondary'
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: JobStatus) => <StatusChip status={value} />,
    },
    {
      id: 'scheduledStartTime',
      label: 'Scheduled Start',
      minWidth: 160,
      format: (value) => formatDate(value),
    },
    {
      id: 'actualStartTime',
      label: 'Actual Start',
      minWidth: 160,
      format: (value) => formatDate(value),
    },
    {
      id: 'endTime',
      label: 'End Time',
      minWidth: 160,
      format: (value) => formatDate(value),
    },
    {
      id: 'progress',
      label: 'Progress',
      minWidth: 170,
      format: (value: number, row: Job) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={value} 
              color={
                row.status === JobStatus.Failed ? 'error' :
                row.status === JobStatus.Completed ? 'success' :
                row.status === JobStatus.Stopped ? 'warning' :
                'primary'
              }
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      sortable: false,
      format: (_, row: Job) => <JobActions job={row} />,
    },
  ];

  const handleRefresh = () => {
    refreshJobs();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Dashboard
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Jobs"
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
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
                label="Status">
                {JOB_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', md: 'flex-end' }} sx={{ flex: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}>
                Refresh
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setJobDialogOpen(true)}>
                New Job
              </Button>
            </Stack>
          </Stack>
        </Paper>
        
        <Table
          columns={columns}
          data={filteredJobs}
          title="Jobs"
          loading={loading}
          emptyMessage="No jobs found. Create a new job to get started."
          getRowId={(row) => row.id}
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setJobDialogOpen(true)}>
              New Job
            </Button>
          }/>
        
        <JobForm
          open={jobDialogOpen}
          onClose={() => setJobDialogOpen(false)}/>
      </Box>
    </Container>
  );
};

export default Dashboard;