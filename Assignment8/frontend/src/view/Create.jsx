// Context
import {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LayoutContext} from '../App';
import PropTypes from 'prop-types';
// import {useNavigate} from 'react-router-dom';
// import {useLocation} from 'react-router-dom';

// MUI
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

// API Render Fetch
import {apiFetch} from '../api/client';


// MUI Dropdown
// https://mui.com/material-ui/react-select/#BasicSelect.js

// MUI Text Field
// https://mui.com/material-ui/react-text-field/#FullWidthTextField.js

/**
 * @param {number} drawerWidth -
 * @returns {object} Mailbox List
 */
function Create({drawerWidth}) {
  const {isMobile, groupNames} = useContext(LayoutContext);

  // MUI State Changes
  const [content, setContent] = useState('');
  const [isPublic, setPublic] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('none');

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken'); // JWT

  const toggle = () => {
    setPublic((prev) => {
    //   console.log('Public?', !prev);
      return !prev;
    });
  };

  // Set Selected Group
  const handleSelect = (event) => {
    setSelectedGroup(event.target.value);
  };

  const submit = async () => {
    // Set Our GroupValue for Backend Processing
    const groupValue = selectedGroup === 'none' ? null : selectedGroup;

    const newPost = {
      content,
      isPublic,
      groupID: groupValue,
    };

    const response = await apiFetch('/api/v0/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newPost),
    });
    await response.json();
    // console.log(data);

    // Post Created, Go Home
    navigate('/home');
  };

  return (
    <Box
      sx={{
        maxHeight: 'calc(100vh - 63px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
      }}
    >
      <Toolbar />
      <Box sx={{
        fontWeight: 'bold',
        mt: '10px',
      }}>
        {/* Content: */}
        <TextField
          fullWidth
          name="contentField"
          aria-label='contentField'
          label="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </Box>
      <Box sx={{my: 2}}>
        <FormControl fullWidth sx={{mb: 2}}>
          <InputLabel aria-label='selectGroup'>
                Select Group
          </InputLabel>
          <Select
            value={selectedGroup}
            name="selectGroup"
            label="Select Group"
            onChange={handleSelect}
          >
            <MenuItem value={'none'} aria-label='noGroup'>
                None
            </MenuItem>
            {groupNames.map((group) => (
              <MenuItem
                key={group.groupid}
                value={group.groupid}
                aria-label={`group-${group.groupname}`}
              >
                {group.groupname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            Public:
          <Switch
            aria-label= 'togglePublic'
            checked={isPublic}
            onChange={toggle}
            slotProps={{input: {'aria-label': 'controlled'}}}
          />
        </Box>
      </Box>
      <Box
        aria-label='createButton'
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}>
        <Button
          onClick={submit}
          variant="contained" color="success"
        >
            Create Post
        </Button>
      </Box>
    </Box>
  );
}

export default Create;

Create.propTypes = {
  drawerWidth: PropTypes.number.isRequired,
};
