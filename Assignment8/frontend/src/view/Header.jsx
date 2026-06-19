// MUI Elements
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

// React Stuff
import {useNavigate, useLocation} from 'react-router-dom';

// Context Hooks
import {useContext} from 'react';
import {LayoutContext} from '../App';

/**
 * @returns {object} Returns Header Component
 */
function Header() {
  const {drawerOpen, setDrawerOpen, setToken} = useContext(LayoutContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Adaptable Title
  let title = 'Welcome to MeowlChat';
  if (location.pathname === '/post/mine') title = 'My Posts';
  if (location.pathname === '/createPost') title = 'Create Post';
  if (location.pathname.startsWith('/group/')) title = 'Group Posts';


  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'green',
        // Renders drawer under Header
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{position: 'relative'}}>
        {/* Menu Button: Mobile Only*/}

        {/* Normal Mail View*/}
        <IconButton
          color="inherit"
          aria-label= {drawerOpen ? 'hide groups' : 'show groups'}
          onClick={() => setDrawerOpen((prev) => !prev)}
          edge="start"
          sx={{display: {md: 'none'}}}
        >
          <MenuIcon
            className='menu-icon'
            aria-label = 'menu-icon'
          />
        </IconButton>

        <IconButton
          aria-label= "go-home"
          onClick={() => {
            setDrawerOpen(false);
            navigate('/home');
          }}
          sx={{mr: 2, ml: -1}}>
          <Box
            component="img"
            src="/src/view/meowlAvatar.jpg"
            alt="Avatar"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
            }}
          />
        </IconButton>

        <Box sx={{flexGrow: 1}}/> {/* Spacer*/}


        <Typography variant="h5" component="div"
          aria-label='page-title'
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            fontStyle: 'italic',
            // textDecoration: 'underline',
          }}>
          {title}
        </Typography>

        {/* LogOut Button */}
        <IconButton
          aria-label = 'logout'
          onClick={() => {
            localStorage.removeItem('accessToken');
            setToken(null);
            setDrawerOpen(false);
            navigate('/login');
          }}
          sx={{p: 0.8}}
        >
          <LogoutIcon
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              ml: 'auto',
            }}/>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
