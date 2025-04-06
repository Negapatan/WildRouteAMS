import React, { Component } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Alert,
  Paper,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { ThemeProvider } from '@mui/material/styles';
import wordLogo from '../assets/wordlogo.png';
import theme from '../theme';

const BackgroundContainer = styled(Box)({
  minHeight: '100vh',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url(/src/assets/bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.4) blur(8px)',
    zIndex: -1
  },
  '&::after': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: -1
  }
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  background: 'rgba(255, 255, 255, 0.95)',
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
  height: '64px',
}));

const LogoImage = styled('img')({
  height: '50px',
  width: 'auto',
  marginLeft: '20px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
});

// const StyledButton = styled(Button)(({ theme }) => ({
//   background: 'linear-gradient(45deg, #800000 0%, #FFD700 100%)',
//   border: 0,
//   color: '#ffffff',
//   fontWeight: 'bold',
//   padding: '12px',
//   boxShadow: '0 3px 5px 2px rgba(128, 0, 0, 0.3)',
//   '&:hover': {
//     background: 'linear-gradient(45deg, #FFD700 0%, #800000 100%)',
//   },
//   '&:disabled': {
//     background: 'linear-gradient(45deg, #666666 0%, #999999 100%)',
//   }
// }));

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      loading: false,
      attempts: 0,
      isLocked: false,
      lockoutTimer: 0
    };
    this._MAX_ATTEMPTS = 3;
    this._LOCKOUT_TIME = 30;
    this._db = getFirestore();
    this._navigate = props.navigate;
  }

  // Getters
  get email() { return this.state.email; }
  get password() { return this.state.password; }
  get error() { return this.state.error; }
  get attempts() { return this.state.attempts; }
  get isLocked() { return this.state.isLocked; }
  get lockoutTimer() { return this.state.lockoutTimer; }

  // Setters
  set email(value) { 
    this.setState({ ...this.state, email: value });
  }
  set password(value) { 
    this.setState({ ...this.state, password: value });
  }
  set error(value) { 
    this.setState({ ...this.state, error: value });
  }
  set attempts(value) { 
    this.setState({ ...this.state, attempts: value });
  }
  set isLocked(value) { 
    this.setState({ ...this.state, isLocked: value });
  }
  set lockoutTimer(value) { 
    this.setState({ ...this.state, lockoutTimer: value });
  }

  startLockoutTimer = () => {
    this.isLocked = true;
    this.lockoutTimer = this._LOCKOUT_TIME;
    
    const timer = setInterval(() => {
      this.lockoutTimer = this.lockoutTimer <= 1 ? (() => {
        clearInterval(timer);
        this.isLocked = false;
        this.attempts = 0;
        return 0;
      })() : this.lockoutTimer - 1;
    }, 1000);
  }

  handleLogin = async (e) => {
    e.preventDefault();
    if (this.isLocked) return;

    this.setState({ error: null, loading: true });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(this._db, 'users', user.uid));

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        this.attempts = 0;
        this._navigate('/admin-dashboard');
      } else {
        await auth.signOut();
        this.attempts++;
        if (this.attempts >= this._MAX_ATTEMPTS) {
          this.startLockoutTimer();
        }
        this.error = 'Access denied. Only administrators are allowed.';
      }
    } catch (error) {
      this.attempts++;
      if (this.attempts >= this._MAX_ATTEMPTS) {
        this.startLockoutTimer();
      }
      this.error = error.message;
    } finally {
      this.setState({ loading: false });
    }
  }

  componentDidMount() {
    document.title = 'CIT-U WILDCORE AMS';
  }

  componentWillUnmount() {
    document.title = 'CIT-U WILDCORE AMS';
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <BackgroundContainer>
          <StyledAppBar position="static" elevation={0}>
            <Toolbar sx={{ minHeight: '64px' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexGrow: 1 
              }}>
                <LogoImage src={wordLogo} alt="WILDCORE" />
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
              mt: 4
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
              
              {this.error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: theme.shape.borderRadius 
                  }}
                >
                  {this.error}
                  {this.attempts > 0 && !this.isLocked && (
                    <Typography variant="caption" display="block">
                      Attempts remaining: {this._MAX_ATTEMPTS - this.attempts}
                    </Typography>
                  )}
                </Alert>
              )}

              {this.isLocked && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: theme.shape.borderRadius 
                  }}
                >
                  Too many failed attempts. Please wait {this.lockoutTimer} seconds before trying again.
                </Alert>
              )}
              
              <Box 
                component="form" 
                onSubmit={this.handleLogin} 
                sx={{ width: '100%', mt: 2 }}
                noValidate
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
                  value={this.email}
                  onChange={(e) => this.email = e.target.value}
                  disabled={this.isLocked}
                  sx={{ mb: 2 }}
                  error={!!this.error}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('password').focus();
                    }
                  }}
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
                  value={this.password}
                  onChange={(e) => this.password = e.target.value}
                  disabled={this.isLocked}
                  sx={{ mb: 3 }}
                  error={!!this.error}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      this.handleLogin(e);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  disabled={this.state.loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    backgroundColor: '#800000',
                    '&:hover': {
                      backgroundColor: '#6b0000'
                    },
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(128,0,0,0.2)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {this.state.loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Login'
                  )}
                </Button>
              </Box>
            </StyledPaper>
          </Container>
        </BackgroundContainer>
      </ThemeProvider>
    );
  }
}

// Name the HOC before exporting
const WithNavigateLogin = (props) => {
  const navigate = useNavigate();
  return <Login {...props} navigate={navigate} />;
};

export default WithNavigateLogin;