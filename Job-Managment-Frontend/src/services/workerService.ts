import axios from "axios";
import { Worker, WorkerRequest, WorkerResponse } from "../types/workerTypes";

const API_URL = "http://localhost:5000/api/workers";

// Fetch all workers
export const fetchWorkers = async (): Promise<Worker[]> => {
  const response = await axios.get<Worker[]>(API_URL);
  return response.data;
};

// Fetch a specific worker by ID
export const fetchWorkerById = async (id: string): Promise<Worker> => {
  const response = await axios.get<Worker>(`${API_URL}/${id}`);
  return response.data;
};

// Register a new worker
export const registerWorker = async (worker: WorkerRequest): Promise<WorkerResponse> => {
  const response = await axios.post<WorkerResponse>(API_URL, worker);
  return response.data;
};

// Assign a job to a worker manually
export const assignJob = async (workerId: string, jobId: string): Promise<any> => {
  const response = await axios.post(`${API_URL}/assign`, null, {
    params: { workerId, jobId }
  });
  return response.data;
};

// Manually trigger job queue processing
export const processQueue = async (): Promise<any> => {
  const response = await axios.post(`${API_URL}/process-queue`);
  return response.data;
};