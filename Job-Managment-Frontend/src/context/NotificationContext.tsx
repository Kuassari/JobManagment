import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Notification, { NotificationType } from '../common/Notification';
import signalRService from '../services/signalRService';
import { JobStatus } from '../types/jobTypes';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: NotificationType;
  }>({
    open: false,
    message: '',
    type: 'info',
  });

  // Set up SignalR listeners for job status changes
  useEffect(() => {
    const cleanupJobCompleted = signalRService.onJobCompleted((job) => {
      showNotification(`Job "${job.name}" completed successfully`, 'success');
    });
    
    const cleanupJobFailed = signalRService.onJobFailed((job) => {
      showNotification(`Job "${job.name}" failed: ${job.errorMessage || 'Unknown error'}`, 'error');
    });
    
    const cleanupJobUpdated = signalRService.onJobUpdated((job) => {
      if (job.status === JobStatus.InProgress) {
        showNotification(`Job "${job.name}" is now in progress`, 'info');
      }
    });
    
    const cleanupJobDeleted = signalRService.onJobDeleted((jobId) => {
      showNotification(`Job deleted`, 'info');
    });

    // Clean up when component unmounts
    return () => {
      cleanupJobCompleted();
      cleanupJobFailed();
      cleanupJobUpdated();
      cleanupJobDeleted();
    };
  }, []);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });
  };

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};