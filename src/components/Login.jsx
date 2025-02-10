import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Alert,
  Paper,
  useTheme,
  AppBar,
  Toolbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import wordLogo from '../assets/wordlogo.png';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '15px',
  boxShadow: '0 8px 32px rgba(128, 0, 0, 0.2)',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  position: 'relative',
  zIndex: 1,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(128, 0, 0, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #800000 30%, #a31545 90%)',
  boxShadow: '0 3px 5px 2px rgba(128, 0, 0, .3)',
}));

const LogoImage = styled('img')({
  height: '35px',
  width: 'auto',
  marginLeft: '10px'
});

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #800000 0%, #FFD700 100%)',
  border: 0,
  color: '#ffffff',
  fontWeight: 'bold',
  padding: '12px',
  boxShadow: '0 3px 5px 2px rgba(128, 0, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FFD700 0%, #800000 100%)',
  },
  '&:disabled': {
    background: 'linear-gradient(45deg, #666666 0%, #999999 100%)',
  }
}));

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 30;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const db = getFirestore();

  const startLockoutTimer = () => {
    setIsLocked(true);
    setLockoutTimer(LOCKOUT_TIME);
    
    const timer = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(false);
          setAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      return;
    }

    try {
      console.log('Attempting login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User authenticated:', user.uid);

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('User data:', userDoc.data());

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        console.log('Admin access granted');
        setAttempts(0);
        navigate('/admin-dashboard');
      } else {
        console.log('Not an admin user - User data:', userDoc.data());
        await auth.signOut();
        setAttempts(prev => prev + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          startLockoutTimer();
        }
        setError('Access denied. Only administrators are allowed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= MAX_ATTEMPTS) {
        startLockoutTimer();
      }
      setError(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(8px)',
          zIndex: 0
        }
      }}>
        <StyledAppBar position="static" elevation={0}>
          <Toolbar>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexGrow: 1 
            }}>
              <LogoImage 
                src={wordLogo} 
                alt="WILDCORE" 
                sx={{ 
                  height: '35px'
                }}
              />
            </Box>
          </Toolbar>
        </StyledAppBar>

        <Container 
          component="main" 
          maxWidth="xs" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: -4
          }}
        >
          <StyledPaper elevation={3}>
            <Typography 
              component="h1" 
              variant="h4"
              sx={{ 
                mb: 4,
                fontWeight: 800,
                background: 'linear-gradient(45deg, #800000, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px'
              }}
            >
              Admin Login
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  borderRadius: theme.shape.borderRadius 
                }}
              >
                {error}
                {attempts > 0 && !isLocked && (
                  <Typography variant="caption" display="block">
                    Attempts remaining: {MAX_ATTEMPTS - attempts}
                  </Typography>
                )}
              </Alert>
            )}

            {isLocked && (
              <Alert 
                severity="warning" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  borderRadius: theme.shape.borderRadius 
                }}
              >
                Too many failed attempts. Please wait {lockoutTimer} seconds before trying again.
              </Alert>
            )}
            
            <Box 
              component="form" 
              onSubmit={handleLogin} 
              sx={{ 
                width: '100%',
                mt: 2
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked}
                sx={{ mb: 3 }}
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLocked}
                sx={{ 
                  mt: 3,
                  py: 2,
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(128, 0, 0, 0.4)'
                  }
                }}
              >
                Sign In
              </StyledButton>
            </Box>
          </StyledPaper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;