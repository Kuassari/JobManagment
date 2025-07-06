import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import signalRService from "../services/signalRService";
import { Worker, WorkerStatus } from "../types/workerTypes";
import { 
  fetchWorkers, 
  registerWorker as apiRegisterWorker,
  assignJob as apiAssignJob,
  processQueue as apiProcessQueue
} from "../services/workerService";

interface WorkerContextType {
  workers: Worker[];
  loading: boolean;
  error: string | null;
  refreshWorkers: () => Promise<void>;
  registerWorker: (name: string) => Promise<void>;
  assignJob: (workerId: string, jobId: string) => Promise<void>;
  processQueue: () => Promise<void>;
  getWorkerById: (id: string) => Worker | undefined;
  getAvailableWorkers: () => Worker[];
  getBusyWorkers: () => Worker[];
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

// Provider component that wraps your app and makes worker data available
export function WorkerProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load workers when component mounts
  useEffect(() => {
    getWorkers();
    
    // Set up listeners for real-time updates
    const cleanupFunctions = [
      signalRService.onWorkerAdded((newWorker) => {
        setWorkers(currentWorkers => [...currentWorkers, newWorker]);
      }),
      
      // When a worker is updated
      signalRService.onWorkerUpdated((updatedWorker) => {
        setWorkers(currentWorkers => 
          currentWorkers.map(worker => 
            worker.id === updatedWorker.id ? updatedWorker : worker
          )
        );
      })
    ];

    // Clean up listeners when component unmounts
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  const getWorkers = async () => {
    try {
      setLoading(true);
      const data = await fetchWorkers();
      setWorkers(data);
      setError(null);
    } catch (err) {
      console.error("Error getting workers:", err);
      setError("Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  const registerWorker = async (name: string) => {
    try {
      await apiRegisterWorker({ name });
      // No need to update workers - SignalR will handle that
    } catch (err) {
      console.error("Error registering worker:", err);
      throw err;
    }
  };

  const assignJob = async (workerId: string, jobId: string) => {
    try {
      await apiAssignJob(workerId, jobId);
      // No need to update workers - SignalR will handle that
    } catch (err) {
      console.error("Error assigning job:", err);
      throw err;
    }
  };

  const processQueue = async () => {
    try {
      await apiProcessQueue();
    } catch (err) {
      console.error("Error processing queue:", err);
      throw err;
    }
  };

  const getWorkerById = (id: string) => {
    return workers.find(worker => worker.id === id);
  };

  const getAvailableWorkers = () => {
    return workers.filter(worker => worker.status === WorkerStatus.Available);
  };

  const getBusyWorkers = () => {
    return workers.filter(worker => worker.status === WorkerStatus.Busy);
  };

  const value: WorkerContextType = {
    workers,
    loading,
    error,
    refreshWorkers: getWorkers,
    registerWorker,
    assignJob,
    processQueue,
    getWorkerById,
    getAvailableWorkers,
    getBusyWorkers
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
}

// Custom hook to use the worker context
export function useWorkerContext(): WorkerContextType {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error("useWorkerContext must be used within a WorkerProvider");
  }
  return context;
}