import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { JOB_HUB_URL, WORKER_HUB_URL } from '../utils/constants';
import { Worker } from '../types/workerTypes';
import { Job } from '../types/jobTypes';

class SignalRService {
  public workerConnection: HubConnection;
  public jobConnection: HubConnection;
  private isWorkerConnected: boolean = false;
  private isJobConnected: boolean = false;

  // Connect to WorkerHub and JobHub for real-time updates
  constructor() {
    this.workerConnection = new HubConnectionBuilder()
      .withUrl(WORKER_HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.jobConnection = new HubConnectionBuilder()
      .withUrl(JOB_HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }

  // Start both SignalR connections
  startConnections = async () => {
    if (!this.isWorkerConnected) {
      try {
        await this.workerConnection.start();
        console.log('WorkerHub Connected');
        this.isWorkerConnected = true;
      } catch (err) {
        console.log('Error while starting WorkerHub connection: ' + err);
        setTimeout(() => this.startConnections(), 5000);
      }
    }

    if (!this.isJobConnected) {
      try {
        await this.jobConnection.start();
        console.log('JobHub Connected');
        this.isJobConnected = true;
      } catch (err) {
        console.log('Error while starting JobHub connection: ' + err);
        setTimeout(() => this.startConnections(), 5000);
      }
    }
  };

  // Stop both connections
  stopConnections = async () => {
    if (this.isWorkerConnected) {
      await this.workerConnection.stop();
      this.isWorkerConnected = false;
    }
    
    if (this.isJobConnected) {
      await this.jobConnection.stop();
      this.isJobConnected = false;
    }
  };

  // Worker hub event handlers
  onWorkerAdded = (callback: (worker: Worker) => void) => {
    this.workerConnection.on('WorkerAdded', callback);
    return () => this.workerConnection.off('WorkerAdded', callback);
  };

  onWorkerUpdated = (callback: (worker: Worker) => void) => {
    this.workerConnection.on('WorkerUpdated', callback);
    return () => this.workerConnection.off('WorkerUpdated', callback);
  };

  // Job hub event handlers
  onJobAdded = (callback: (job: Job) => void) => {
    this.jobConnection.on('JobAdded', callback);
    return () => this.jobConnection.off('JobAdded', callback);
  };

  onJobUpdated = (callback: (job: Job) => void) => {
    this.jobConnection.on('JobUpdated', callback);
    return () => this.jobConnection.off('JobUpdated', callback);
  };

  onJobFailed = (callback: (job: Job) => void) => {
    this.jobConnection.on('JobFailed', callback);
    return () => this.jobConnection.off('JobFailed', callback);
  };

  onJobRetrying = (callback: (job: Job) => void) => {
    this.jobConnection.on('JobRetrying', callback);
    return () => this.jobConnection.off('JobRetrying', callback);
  };

  onJobDeleted = (callback: (jobId: string) => void) => {
    this.jobConnection.on('JobDeleted', callback);
    return () => this.jobConnection.off('JobDeleted', callback);
  };

  onJobCompleted = (callback: (job: Job) => void) => {
    this.jobConnection.on('JobCompleted', callback);
    return () => this.jobConnection.off('JobCompleted', callback);
  };
}

export default new SignalRService();