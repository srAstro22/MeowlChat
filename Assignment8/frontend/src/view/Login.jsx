import * as React from 'react';
import {useRef, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';

import {LayoutContext} from '../App';

// API Render Fetch
import {apiFetch} from '../api/client';


// MUI Login Page
// https://mui.com/material-ui/getting-started/templates/sign-in/

const Card = styled(MuiCard)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow: [
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
    'hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ].join(', '),
  ...theme.applyStyles('dark', {
    boxShadow: [
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px',
      'hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    ].join(', '),
  }),
}));


/**
 * @returns {React.Component} Login page
 */
export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [errorCode, setError] = useState('');
  const navigate = useNavigate();
  const {setToken} = useContext(LayoutContext);

  const handleLogin = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    const res = await apiFetch('/api/v0/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      setToken(data.accessToken);
      navigate('/home');
    } else {
      setError('Invalid Credentials');
    }
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{minHeight: '100vh', padding: 2}}
    >
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontSize: 'clamp(1.5rem, 6vw, 2.15rem)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          <Box component="span" sx={{color: 'green'}}>Meowl</Box>
          <Box component="span" sx={{color: 'black'}}>Chat</Box>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              aria-label="email-box"
              inputRef={emailRef}
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              aria-label="password-box"
              inputRef={passwordRef}
              name="password"
              placeholder="••••••"
              type="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          {errorCode && (
            <Typography
              color="error"
              variant="body2"
              sx={{textAlign: 'center'}}
            >
              {errorCode}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            aria-label="login-button"
          >
              Login
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
