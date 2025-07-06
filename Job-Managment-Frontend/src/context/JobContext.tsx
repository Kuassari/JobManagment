import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import signalRService from "../services/signalRService";
import { Job, JobStatus, JobPriority } from "../types/jobTypes";
import { fetchJobs, createJob as apiCreateJob, stopJob, retryJob, deleteJob } from "../services/jobService";

// Define the shape of the context
interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
  createJob: (name: string, priority: JobPriority, scheduledTime?: Date) => Promise<void>;
  stopJobById: (id: string) => Promise<void>;
  retryJobById: (id: string) => Promise<void>;
  deleteJobById: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
  filterJobsByStatus: (status: JobStatus | null) => Job[];
  filterJobsByName: (searchTerm: string) => Job[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// Provider component that wraps your app and makes job data available
export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs when component mounts
  useEffect(() => {
    getJobs();
    
    // Set up listeners for real-time updates
    const cleanupFunctions = [
      signalRService.onJobAdded((newJob) => {
        setJobs(currentJobs => [...currentJobs, newJob]);
      }),
      
      // When a job is updated
      signalRService.onJobUpdated((updatedJob) => {
        setJobs(currentJobs => 
          currentJobs.map(job => 
            job.id === updatedJob.id ? updatedJob : job
          )
        );
      }),
      
      // When a job fails
      signalRService.onJobFailed((failedJob) => {
        setJobs(currentJobs => 
          currentJobs.map(job => 
            job.id === failedJob.id ? failedJob : job
          )
        );
      }),
      
      // When a job is being retried
      signalRService.onJobRetrying((retryingJob) => {
        setJobs(currentJobs => 
          currentJobs.map(job => 
            job.id === retryingJob.id ? retryingJob : job
          )
        );
      }),
      
      // When a job is deleted
      signalRService.onJobDeleted((jobId) => {
        setJobs(currentJobs => 
          currentJobs.filter(job => job.id !== jobId)
        );
      })
    ];

    // Clean up listeners when component unmounts
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  // Function to get all jobs
  const getJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error("Error getting jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Function to create a job
  const createJob = async (name: string, priority: JobPriority, scheduledTime?: Date) => {
    try {
      await apiCreateJob({
        name,
        priority,
        scheduledStartTime: scheduledTime?.toISOString()
      });
      // No need to update jobs - SignalR will handle that
    } catch (err) {
      console.error("Error creating job:", err);
      throw err;
    }
  };

  // Function to stop a job
  const stopJobById = async (id: string) => {
    try {
      await stopJob(id);
      // No need to update jobs - SignalR will handle that
    } catch (err) {
      console.error("Error stopping job:", err);
      throw err;
    }
  };

  // Function to retry a job
  const retryJobById = async (id: string) => {
    try {
      await retryJob(id);
      // No need to update jobs - SignalR will handle that
    } catch (err) {
      console.error("Error retrying job:", err);
      throw err;
    }
  };

  // Function to delete a job
  const deleteJobById = async (id: string) => {
    try {
      await deleteJob(id);
      // No need to update jobs - SignalR will handle that
    } catch (err) {
      console.error("Error deleting job:", err);
      throw err;
    }
  };

  // Find a job by ID
  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  // Filter jobs by status
  const filterJobsByStatus = (status: JobStatus | null) => {
    if (status === null) return jobs;
    return jobs.filter(job => job.status === status);
  };

  // Filter jobs by name
  const filterJobsByName = (searchTerm: string) => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(job => 
      job.name.toLowerCase().includes(term)
    );
  };

  // Create the value object to share
  const value: JobContextType = {
    jobs,
    loading,
    error,
    refreshJobs: getJobs,
    createJob,
    stopJobById,
    retryJobById,
    deleteJobById,
    getJobById,
    filterJobsByStatus,
    filterJobsByName
  };

  // Provide the value to children components
  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}

// Custom hook to use the job context
export function useJobContext(): JobContextType {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobContext must be used within a JobProvider");
  }
  return context;
}