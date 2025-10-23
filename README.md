## Project Structure

### Backend (.NET Core 8)

- **Models**: Domain entities (Job, Worker) and DTOs 
- **Repositories**: Data access layer for Jobs and Workers
- **Services**: Business logic layer (JobService, WorkerService)
- **Controllers**: API endpoints for Jobs, Workers
- **SignalR Hubs**: Real-time communication (JobHub, WorkerHub)
- **Background Services**: Automated job processing

### Frontend (React + TypeScript + Material UI)

- **Components**: Reusable UI components 
- **Contexts**: State management for Jobs and Workers 
- **Services**: API client services and SignalR service
- **Types**: TypeScript type definitions
- **Pages**: Main application pages

## Features

- **Job Dashboard**: View, filter, and sort jobs
- **Job Creation**: Create new jobs with different priorities
- **Real-Time Updates**: See job progress and status changes as they happen
- **Job Management**: Stop, restart, and delete jobs
- **Worker Management**: View worker status and current jobs
- **Notifications**: Get alerted for important job events

## Setup Instructions

### Backend Setup

1. Clone the repository
2. Open the solution in Visual Studio 2022 or later
3. Ensure .NET 8 SDK is installed
4. Restore NuGet packages
5. Update the database connection string in `appsettings.json` if needed
6. Run the application

### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Jobs API

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/{id}` - Get a specific job
- `POST /api/jobs` - Create a new job
- `POST /api/jobs/stop/{id}` - Stop a running job
- `POST /api/jobs/retry/{id}` - Retry a failed or stopped job
- `DELETE /api/jobs/{id}` - Delete a job

### Workers API

- `GET /api/workers` - Get all workers
- `GET /api/workers/{id}` - Get a specific worker
- `POST /api/workers` - Register a new worker
- `POST /api/workers/process-queue` - Trigger job queue processing

## Technologies Used

### Backend
- ASP.NET Core 8
- Entity Framework Core
- SignalR
- SQLite (for development)

### Frontend
- React 18
- TypeScript
- Material UI
- SignalR Client
- Axios
- date-fns

 
 
