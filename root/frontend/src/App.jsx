/*
#######################################################################
#
# Copyright (C) 2020-2026  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  // Link
} from 'react-router-dom';

// Components
import Login from './view/Login';
import Home from './view/Home';

// Contexts
import {createContext, useState, useEffect} from 'react';
export const LayoutContext = createContext();
const drawerWidth = 240;

// MUI Elements
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// MUI Imports
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// API Fetch
import {apiFetch} from './api/client';


/**
 * Simple component with no state.
 * @returns {object} JSX
 */
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupNames, setGroupNames] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [backendFailed, setBackendFailed] = useState(false);


  // Determines whether we are in Mobile or Not
  const theme = useTheme();
  const isMobile =
  useMediaQuery(theme.breakpoints.down('md')); // true for mobile

  // Ping Backend / Wait to Spinup
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; // Fail Safe Startup

    const checkBackend = () => {
      apiFetch('/api/v0/health', {method: 'GET'})
          .then((res) => {
            if (res.ok) {
              setCheckingBackend(false);
            } else {
              throw new Error('not ready');
            }
          })
          .catch(() => {
            attempts += 1;
            if (attempts < maxAttempts) {
              setTimeout(checkBackend, 3000);
            } else {
              setCheckingBackend(false);
              setBackendFailed(true);
            }
          });
    };
    checkBackend();
  }, []);

  // GET Users Group Names
  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch('/api/v0/group', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            // console.error('Request failed:', res.status);
            return [];
          }
          return res.json();
        })

        .then((data) => setGroupNames(data));
  }, [token]);

  // Spin Up Loading Bar
  if (checkingBackend) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        px: 4,
      }}>
        <Typography variant="body1" sx={{mb: 2}}>
          Connecting to server, this may take up to a minute...
        </Typography>
        <Box sx={{width: '100%', maxWidth: 400}}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  if (backendFailed) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        px: 4,
        textAlign: 'center',
      }}>
        <Typography variant="h6" sx={{mb: 1}}>
          Unable to connect to server
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please contact the application owner if this issue persists.
        </Typography>
      </Box>
    );
  }

  return (
    <LayoutContext.Provider value = {{
      drawerOpen,
      setDrawerOpen,
      isMobile,
      groupNames,
      setGroupNames,
      token,
      setToken,
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path= "/login" element={<Login/>}/>
          <Route path="/home" element={
            <Home drawerWidth={drawerWidth}/>
          }/>
          <Route path="/post/mine" element={
            <Home drawerWidth={drawerWidth}/>
          }/>
          <Route path= {`/group/:groupID`}
            element={<Home drawerWidth={drawerWidth}/>}/>
          <Route path= {`/createPost`}
            element={<Home drawerWidth={drawerWidth}/>}/>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </LayoutContext.Provider>
  );
}

export default App;
