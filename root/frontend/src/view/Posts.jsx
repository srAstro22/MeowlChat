// Context
import {useState, useEffect, useContext} from 'react';
import {LayoutContext} from '../App';
import PropTypes from 'prop-types';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';

// MUI
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// API Render Fetch
import {apiFetch} from '../api/client';


/**
 * @param {number} drawerWidth -
 * @returns {object} Mailbox List
 */
function Posts({drawerWidth, groupID}) {
  const [posts, setPosts] = useState([]);
  const {isMobile} = useContext(LayoutContext);
  const token = localStorage.getItem('accessToken'); // JWT
  const location = useLocation();
  const navigate = useNavigate();

  // All Posts if No Group Selected
  // Curr Group if Group Seleceted
  useEffect(() => {
    if (!token) return;

    const getPosts = async () => {
      let res;
      if (groupID) {
        res = await apiFetch(`/api/v0/group/${groupID}/post`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (location.pathname === '/post/mine') {
        res = await apiFetch('/api/v0/post/mine', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        res = await apiFetch('/api/v0/post', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!res.ok) {
        if (groupID) navigate('/home');
        return;
      }

      // Extract Posts from Array
      const data = await res.json();
      // console.log(data);
      setPosts(groupID ? data[0].posts : data);
    };

    getPosts();
  }, [groupID, location.pathname, token]);

  const handleLike = async (postID, liked) => {
    const method = liked ? 'DELETE' : 'POST';
    const res = await apiFetch(`/api/v0/post/${postID}/like`, {
      method,
      headers: {Authorization: `Bearer ${token}`},
    });
    const updatedPost = await res.json();

    setPosts((prev) => prev.map((p) =>
      p.postID === postID ? updatedPost : p,
    ));
  };

  return (
    <Box
      aria-label='posts'
      sx={{
        maxHeight: 'calc(100vh - 64px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        bgcolor: '#fafafa',
      }}
    >
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: isMobile ? 1.5 : 3,
          py: 2,
          maxWidth: 680,
          mx: 'auto',
        }}
      >
        {posts.map((post) => (
          <Box
            key={post.postID}
            aria-label={`post-${post.postID}`}
            sx={{
              'bgcolor': '#ffffff',
              'border': '1px solid #dbdbdb',
              'borderRadius': '12px',
              'overflow': 'hidden',
              'transition': 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                {/* Avatar */}
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: '#228B22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 550,
                    fontSize: 14,
                    color: '#ffff',
                    flexShrink: 0,
                  }}
                >
                  {post.username?.[0]?.toUpperCase()}
                </Box>
                {post.isPublic ?
                <PublicIcon aria-label='publicIcon'
                  sx={{fontSize: 15, color: '#8e8e8e'}}/> :
                <LockIcon aria-label='privateIcon'
                  sx={{fontSize: 15, color: '#8e8e8e'}}/>}
                <Box
                  aria-label="post-username"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#262626',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {post.username}
                </Box>
              </Box>
              <Box
                sx={{
                  fontSize: '0.75rem',
                  color: '#8e8e8e',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatEmailDate(post.date)}
              </Box>
            </Box>

            {/* Card Body */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                fontSize: '0.9rem',
                color: '#262626',
                lineHeight: 1.6,
                wordBreak: 'break-word',
              }}
            >
              {post.content}
              {/* Like Section */}
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                <IconButton
                  aria-label={post.likedByMe ? 'unlike' : 'like'}
                  onClick={() => handleLike(post.postID, post.likedByMe)}
                  size="small"
                >
                  {post.likedByMe ?
                    <FavoriteIcon sx={{fontSize: 18, color: 'red'}}/> :
                    <FavoriteBorderIcon sx={{fontSize: 18, color: '#8e8e8e'}}/>
                  }
                </IconButton>
                <Box sx={{fontSize: '0.8rem', color: '#8e8e8e'}}>
                  {post.likes}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 *
 * @param {object} dateStr Converted to Preferred Format
 * @returns {object} formatted Date
 */
function formatEmailDate(dateStr) {
  const emailDate = new Date(dateStr);
  const now = new Date();

  const isToday =
    emailDate.getFullYear() === now.getFullYear() &&
    emailDate.getMonth() === now.getMonth() &&
    emailDate.getDate() === now.getDate();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    emailDate.getFullYear() === yesterday.getFullYear() &&
    emailDate.getMonth() === yesterday.getMonth() &&
    emailDate.getDate() === yesterday.getDate();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const time = emailDate.toLocaleTimeString(
      undefined,
      {hour: '2-digit', minute: '2-digit', hour12: false});

  if (isToday) {
    // show time only
    return time;
  } else if (isYesterday) {
    return `Yesterday @ ${time}`;
  } else if (emailDate > oneYearAgo) {
    const month = emailDate.toLocaleString('default', {month: 'short'});
    const day = String(emailDate.getDate()).padStart(2, '0'); // pad w 0
    return `${month} ${day} @ ${time}`;
  } else {
    // more than a year ago: show year
    return `${emailDate.getFullYear()}`;
  }
}

export default Posts;

Posts.propTypes = {
  drawerWidth: PropTypes.number.isRequired,
  groupID: PropTypes.string,
};
