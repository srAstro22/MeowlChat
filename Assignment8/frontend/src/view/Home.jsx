import {Component} from 'react';

// Components
import Header from '../view/Header';
import SideBar from '../view/Drawer';
import Posts from '../view/Posts';
import Create from '../view/Create';
import PropTypes from 'prop-types';
import {useParams, useLocation} from 'react-router-dom';

// MUI Elements
import Box from '@mui/material/Box';


/**
 * @param {number} drawerWidth -
 * @returns {Component} HomePage
 */
function Home({drawerWidth}) {
  const {groupID} = useParams();
  const location = useLocation();
  const creation = location.pathname === '/createPost';

  return (
    <Box>
      <Header /> {/* Render Header inside Home */}
      <SideBar drawerWidth={drawerWidth}/>
      {creation ? <Create drawerWidth={drawerWidth}/> :
      <Posts drawerWidth={drawerWidth} groupID={groupID}/>
      }
    </Box>
  );
}

export default Home;

Home.propTypes = {
  drawerWidth: PropTypes.number.isRequired,
};
