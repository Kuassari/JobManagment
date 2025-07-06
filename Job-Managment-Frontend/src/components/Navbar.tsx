import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Button,
  Container,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as WorkersIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useJobContext } from '../context/JobContext';
import { useWorkerContext } from '../context/WorkerContext';
import { JobStatus } from '../types/jobTypes';
import { WorkerStatus } from '../types/workerTypes';
import { ROUTES } from '../utils/constants';

const Navbar: React.FC = () => {
  const { jobs, refreshJobs } = useJobContext();
  const { workers, refreshWorkers } = useWorkerContext();
  const location = useLocation();

  const availableWorkers = workers.filter(w => w.status === WorkerStatus.Available).length;
  const busyWorkers = workers.filter(w => w.status === WorkerStatus.Busy).length;
  const pendingJobs = jobs.filter(j => j.status === JobStatus.Pending).length;
  const inProgressJobs = jobs.filter(j => j.status === JobStatus.InProgress).length;
  
  const handleRefresh = async () => {
    await Promise.all([refreshJobs(), refreshWorkers()]);
  };

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, mr: 4 }}>
            Job Management System
          </Typography>
          
          {/* Navigation tabs */}
          <Tabs 
            value={location.pathname} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1 }}>
            <Tab
              label="Dashboard"
              value={ROUTES.DASHBOARD}
              icon={<DashboardIcon />}
              iconPosition="start"
              component={Link}
              to={ROUTES.DASHBOARD}/>
            <Tab
              label="Workers"
              value={ROUTES.WORKERS}
              icon={<WorkersIcon />}
              iconPosition="start"
              component={Link}
              to={ROUTES.WORKERS}/>
          </Tabs>
          
          {/* Status chips */}
          <Box mr={2} display="flex" alignItems="center">
            <Tooltip title="Jobs Status">
              <Box mx={1}>
                <Badge badgeContent={pendingJobs + inProgressJobs} color="error" max={99}>
                  <Chip 
                    label={`Pending: ${pendingJobs}`} 
                    color="default" 
                    size="small" 
                    sx={{ mr: 1 }}/>
                </Badge>
                <Chip 
                  label={`Running: ${inProgressJobs}`} 
                  color="primary" 
                  size="small" />
              </Box>
            </Tooltip>
          </Box>
          
          <Box mr={2} display="flex" alignItems="center">
            <Tooltip title="Workers Status">
              <Box>
                <Chip 
                  label={`Available: ${availableWorkers}`} 
                  color="success" 
                  size="small" 
                  sx={{ mr: 1 }}/>
                <Chip 
                  label={`Busy: ${busyWorkers}`} 
                  color="secondary" 
                  size="small" />
              </Box>
            </Tooltip>
          </Box>
          
          <Tooltip title="Refresh Data">
            <IconButton 
              color="inherit" 
              onClick={handleRefresh}
              size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;