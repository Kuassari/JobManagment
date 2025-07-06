import React, { useEffect } from 'react';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import { JobProvider } from './context/JobContext';
import { WorkerProvider } from './context/WorkerContext';
import { NotificationProvider } from './context/NotificationContext';
import signalRService from './services/signalRService';
import theme from './styles/theme';
import { ROUTES } from './utils/constants';

function App() {
  useEffect(() => {
    if (signalRService && signalRService.startConnections) {
      signalRService.startConnections();
      return () => {
        if (signalRService.stopConnections) {
          signalRService.stopConnections();
        }
      };
    }
    return undefined;
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <NotificationProvider>
          <JobProvider>
            <WorkerProvider>
              <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Navbar />
                  <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
                    <Routes>
                      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                      <Route path={ROUTES.WORKERS} element={<Workers />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </Box>
                </Box>
              </Router>
            </WorkerProvider>
          </JobProvider>
        </NotificationProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;