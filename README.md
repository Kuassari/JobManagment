# 🔧 Distributed Job Management System

A full-stack real-time job management application with priority-based queuing, worker node orchestration, and live monitoring.

> 🎯 **Take-Home Assignment** | Company interview process (2024)  
> **Time Given:** 3 days | React (TypeScript) + .NET Core 8 (C#)

## 📋 Assignment Background

This was a 3-day take-home full-stack challenge during a company's interview process. While I didn't advance to the next round, I'm proud of what I accomplished, especially learning SignalR from scratch and working with TypeScript (primarily a JavaScript developer) during the assignment.

## ✨ Features Implemented

**Frontend (React + TypeScript + Material-UI)**
- ✅ Job dashboard with real-time updates via SignalR
- ✅ Create jobs with priority levels (High/Regular)
- ✅ Filter/sort jobs by name, status, priority, time
- ✅ Stop, retry, and delete jobs with confirmation dialogs
- ✅ Toast notifications for job events
- ✅ Worker management page (bonus)
- ✅ Custom Material-UI theming

**Backend (.NET Core 8 Web API)**
- ✅ Custom priority-based job queue
- ✅ Multiple worker node simulation
- ✅ Entity Framework Core with PostgreSQL
- ✅ SignalR hubs for real-time communication
- ✅ Background service for job processing
- ✅ Automatic retry for failed jobs
- ✅ Repository pattern with clean architecture

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Material-UI (MUI) with custom theming
- Context API for state management
- SignalR client for real-time updates
- Axios for HTTP requests

**Backend:**
- .NET Core 8 Web API (C#)
- Entity Framework Core + PostgreSQL
- SignalR for WebSocket communication
- Background services (IHostedService)
- Repository pattern

## 🏗️ Architecture

### Backend Structure
```
Job-Managment-Backend/
├── Controllers/          # API endpoints (Jobs, Workers)
├── Services/            # Business logic
├── Repositories/        # Data access layer
├── BackgroundServices/  # Job queue processor
├── Hubs/               # SignalR hubs (JobHub, WorkerHub)
├── Models/             # Domain entities (Job, Worker, Enums)
├── DTOs/               # Request/Response models
├── Data/               # EF Core context and seeding
└── Tests/              # Unit tests (xUnit)
```

### Frontend Structure
```
Job-Managment-Frontend/
├── components/         # JobActions, JobForm, WorkerForm, Navbar
├── pages/             # Dashboard, Workers
├── context/           # JobContext, WorkerContext, NotificationContext
├── services/          # API calls and SignalR connection
├── common/            # Reusable components (Table, Dialog, StatusChip)
├── types/             # TypeScript type definitions
└── utils/             # Constants and helper functions
```

## 🚀 Getting Started

### Backend
```bash
cd Job-Managment-Backend
dotnet restore
# Update connection string in appsettings.json for PostgreSQL
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd Job-Managment-Frontend
npm install
npm start
```

## 💭 Learning & Challenges

### New Technologies (3 days)
- **SignalR**: Learned from scratch and implemented real-time WebSocket communication
- **TypeScript with React**: Less familiar than JavaScript, created comprehensive type definitions
- **Background Services**: First time implementing .NET IHostedService
- **PostgreSQL**: First time using Postgres (previously SQL Server/MySQL)

### Main Technical Challenge

**Background Job Processing Issue:**

The background job queue processor (`JobQueueProcessor`) had issues with status transitions and progress updates. Jobs were created and assigned to workers correctly, and the database received updates, but the background service wasn't properly updating job status to "Completed" or incrementing progress percentages over time.

**What worked:**
- Job CRUD operations and database persistence ✅
- Job assignment to available workers ✅
- Database updates were being saved ✅
- SignalR real-time communication framework ✅
- Manual job actions (stop, retry, delete) ✅
- Frontend UI and all interactions ✅

**What didn't work:**
- Background service not updating job status to "Completed"
- Progress bar stuck at 0% (not incrementing during job execution)
- Since status/progress weren't updating, SignalR had nothing new to broadcast

**Root Issue:**
The problem was in the background job execution flow, not SignalR itself. The `JobQueueProcessor` runs every 10 seconds to assign jobs, but the actual job execution logic wasn't properly updating the job's status from "InProgress" → "Completed" or incrementing the progress field from 0% → 100%. Without these updates, SignalR (which was working correctly) had no status changes to push to the frontend.

**Possible causes:**
- Job execution logic not completing the status update workflow
- Progress increment logic not being called during job processing
- Missing or incomplete job completion handler in `WorkerService`
- Async timing issues in the execution loop

Despite extensive debugging, I couldn't pinpoint the exact issue within the 3-day constraint. **This was my first experience with background job processing** (different from async/await which I'm familiar with), so there was a learning curve on proper implementation patterns for background services and job lifecycle management.

## 🎯 Key Design Decisions

**Context API vs Redux**
- Used Context API for simpler state management
- Separate contexts: Jobs, Workers, Notifications
- Sufficient for this scope without Redux complexity

**Material-UI Customization**
- Custom theme configuration
- Reusable common components (Table, Dialog, StatusChip)
- Responsive design throughout

**Repository Pattern**
- Clean separation of data access from business logic
- Interface-based for testability
- Async operations with EF Core

**SignalR Architecture**
- Separate hubs for Jobs and Workers
- Real-time broadcasting to all connected clients
- Event-based updates (JobAdded, JobUpdated, JobFailed, etc.)

## 📝 Reflection

**What I Accomplished:**
- Built full-stack real-time application in 3 days
- **Learned SignalR** in a few hours and integrated it successfully
- Created type-safe React app with **TypeScript** (normally use JavaScript)
- Implemented clean architecture with proper layering
- Custom Material-UI theme and responsive design
- Comprehensive error handling and user feedback

**What I'd Improve:**
- Resolve background job processing synchronization
- Add comprehensive integration tests
- Implement JWT authentication (was a bonus requirement)
- Add metrics dashboard (was a bonus requirement)
- Better logging with Serilog
- Docker containerization

---

**Note:** This was a 3-day take-home assignment for a company interview (2024). While I didn't receive an offer, this project demonstrates my ability to rapidly learn new technologies (SignalR, TypeScript, background services), build full-stack applications, and deliver working software under time constraints. The background processing issue represents an honest technical challenge - my first experience with .NET background services - that would be resolved with more debugging time and potentially architectural refactoring.
