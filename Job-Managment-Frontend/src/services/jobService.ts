import axios from "axios";
import { Job, JobRequest, JobResponse } from "../types/jobTypes";

const API_URL = "http://localhost:5000/api/jobs";

// Fetch all jobs
export const fetchJobs = async (): Promise<Job[]> => {
  const response = await axios.get<Job[]>(API_URL);
  return response.data;
};

// Fetch a specific job by ID
export const fetchJobById = async (id: string): Promise<Job> => {
  const response = await axios.get<Job>(`${API_URL}/${id}`);
  return response.data;
};

// Create a new job
export const createJob = async (job: JobRequest): Promise<JobResponse> => {
  const response = await axios.post<JobResponse>(API_URL, job);
  return response.data;
};

// Stop a running job
export const stopJob = async (id: string): Promise<JobResponse> => {
  const response = await axios.post<JobResponse>(`${API_URL}/stop/${id}`);
  return response.data;
};

// Retry a failed or stopped job
export const retryJob = async (id: string): Promise<JobResponse> => {
  const response = await axios.post<JobResponse>(`${API_URL}/retry/${id}`);
  return response.data;
};

// Delete a job
export const deleteJob = async (id: string): Promise<JobResponse> => {
  const response = await axios.delete<JobResponse>(`${API_URL}/${id}`);
  return response.data;
};