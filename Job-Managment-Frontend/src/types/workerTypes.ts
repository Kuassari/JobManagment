export enum WorkerStatus {
  Busy = "Busy",
  Available = "Available",
  Offline = "Offline"
}

export interface Worker {
  id: string;
  name: string;
  status: WorkerStatus;
  currentJobId?: string;
  lastActivityTime: string;
  registeredTime: string;
  completedJobCount: number;
  failedJobCount: number;
}

export interface WorkerRequest {
  name: string;
}

export interface WorkerResponse {
  workerId: string;
  errorCode: string;
  returnMessage: string;
}