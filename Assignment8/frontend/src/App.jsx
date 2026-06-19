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

  // Chat Generated
  // Determines whether we are in Mobile or Not
  const theme = useTheme();
  const isMobile =
  useMediaQuery(theme.breakpoints.down('md')); // true for mobile

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
