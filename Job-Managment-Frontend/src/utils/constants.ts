import { JobStatus, JobPriority } from '../types/jobTypes';
import { WorkerStatus } from '../types/workerTypes';

// Job Status options for filtering
export const JOB_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: JobStatus.Pending, label: 'Pending' },
  { value: JobStatus.InProgress, label: 'In Progress' },
  { value: JobStatus.Completed, label: 'Completed' },
  { value: JobStatus.Failed, label: 'Failed' },
  { value: JobStatus.Stopped, label: 'Stopped' },
];

// Job Priority options for creation/filtering
export const JOB_PRIORITY_OPTIONS = [
  { value: JobPriority.High, label: 'High' },
  { value: JobPriority.Regular, label: 'Regular' },
  { value: JobPriority.Low, label: 'Low' },
];

// Worker Status options for filtering
export const WORKER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: WorkerStatus.Available, label: 'Available' },
  { value: WorkerStatus.Busy, label: 'Busy' },
  { value: WorkerStatus.Offline, label: 'Offline' },
];

// Application routes
export const ROUTES = {
  DASHBOARD: '/',
  WORKERS: '/workers',
};

// Default refresh interval in milliseconds (5 seconds)
export const DEFAULT_REFRESH_INTERVAL = 5000;

// Number of retries for API calls
export const API_RETRY_COUNT = 3;

// API base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// SignalR hub URLs
export const JOB_HUB_URL = process.env.REACT_APP_JOB_HUB_URL || 'http://localhost:5000/hubs/jobs';
export const WORKER_HUB_URL = process.env.REACT_APP_WORKER_HUB_URL || 'http://localhost:5000/hubs/workers';