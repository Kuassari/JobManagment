export enum JobStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Stopped = "Stopped",
  Failed = "Failed",
}

export enum JobPriority {
  High = "High",
  Regular = "Regular",
  Low = "Low"
}

export interface Job {
  id: string;
  name: string;
  priority: JobPriority;
  status: JobStatus;
  scheduledStartTime: string;
  actualStartTime?: string;
  endTime?: string;
  progress: number;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
}

export interface JobRequest {
  name: string;
  priority: JobPriority;
  scheduledStartTime?: string;
}

export interface JobResponse {
  jobId: string;
  errorCode: string;
  returnMessage: string;
}