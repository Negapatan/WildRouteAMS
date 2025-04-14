import React, { Component } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { collection, onSnapshot, query, doc, deleteDoc, getDoc, where, updateDoc } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import wordLogo from '../assets/wordlogo.png';
import { COLLEGES } from '../utils/collegePrograms';
import backgroundImage from '../assets/bg.jpg';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RefreshIcon from '@mui/icons-material/Refresh';

const BackgroundContainer = styled(Box)({
  minHeight: '100vh',
  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.7)), url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #800000 0%, #b71c1c 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)'
}));

const LogoImage = styled('img')({
  height: '70px',
  width: 'auto',
  marginLeft: '0px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'brightness(1.1)'
  }
});

const ContentContainer = styled(Container)(({ theme }) => ({
  padding: '40px 24px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1
}));

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: '28px 32px',
  marginBottom: '32px',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.5)'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 320px)',
  minHeight: '400px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.5)',
  '& .MuiTable-root': {
    minWidth: '1000px',
    tableLayout: 'auto',
  },
  '& .MuiTableHead-root': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  '& .MuiTableCell-root': {
    padding: '18px 16px',
    borderBottom: '1px solid rgba(224, 224, 224, 0.2)',
  },
  '& .MuiTableCell-head': {
    background: 'linear-gradient(90deg, #800000 0%, #b71c1c 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '20px 16px',
    borderBottom: 'none',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    color: '#424242',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    '&:hover': {
      backgroundColor: 'rgba(128, 0, 0, 0.04)',
    }
  },
  '&::-webkit-scrollbar': {
    width: '12px',
    height: '12px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(241, 241, 241, 0.7)',
    borderRadius: '6px',
    margin: '4px 0'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, #800000 0%, #b71c1c 100%)',
    borderRadius: '6px',
    border: '3px solid transparent',
    backgroundClip: 'padding-box',
    '&:hover': {
      background: 'linear-gradient(180deg, #9a0000 0%, #d32f2f 100%)',
      borderWidth: '2px'
    }
  },
  '&::-webkit-scrollbar-corner': {
    background: 'transparent'
  }
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: '10px',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
  },
  '&.MuiIconButton-colorPrimary': {
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(128, 0, 0, 0.1)',
    }
  },
  '&.MuiIconButton-colorError': {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
    }
  }
}));

const ViewToggleButton = styled(Button)(({ theme, isActive }) => ({
  backgroundColor: isActive ? theme.palette.primary.main : 'rgba(255,255,255,0.7)',
  color: isActive ? 'white' : theme.palette.primary.main,
  fontWeight: 600,
  padding: '10px 28px',
  borderRadius: '30px',
  border: 'none',
  boxShadow: isActive ? '0 10px 20px rgba(128,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.08)',
  '&:hover': {
    backgroundColor: isActive ? theme.palette.primary.dark : 'rgba(255,255,255,0.9)',
    transform: 'translateY(-3px)',
    boxShadow: isActive ? '0 14px 24px rgba(128,0,0,0.25)' : '0 8px 16px rgba(0,0,0,0.12)',
  },
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  '& .MuiDialogTitle-root': {
    padding: '20px 24px',
  },
  '& .MuiDialogContent-root': {
    padding: '16px 24px 24px',
  },
  '& .MuiDialogActions-root': {
    padding: '16px 24px 24px',
  },
  '@keyframes slideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  }
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '30px',
    padding: '0 16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
  },
  '& .MuiInputAdornment-root': {
    margin: '0 8px 0 0',
  },
}));

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this._state = {
      users: [],
      adminName: '',
      editDialogOpen: false,
      editFormData: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        idNumber: '',
        college: '',
        section: '',
      },
      snackbar: { 
        open: false, 
        message: '', 
        severity: 'success' 
      },
      loading: true,
      filterAnchorEl: null,
      logoutDialogOpen: false,
      viewMode: 'admin',
      instructors: [],
      deleteDialogOpen: false,
      userToDelete: null,
      searchQuery: '',
    };
    this._navigate = props.navigate;
  }

  // Getters
  get users() { return this._state.users; }
  get adminName() { return this._state.adminName; }
  get editDialogOpen() { return this._state.editDialogOpen; }
  get editFormData() { return this._state.editFormData; }
  get snackbar() { return this._state.snackbar; }
  get loading() { return this._state.loading; }
  get filterAnchorEl() { return this._state.filterAnchorEl; }
  get logoutDialogOpen() { return this._state.logoutDialogOpen; }
  get viewMode() { return this._state.viewMode; }
  get instructors() { return this._state.instructors; }
  get deleteDialogOpen() { return this._state.deleteDialogOpen; }
  get userToDelete() { return this._state.userToDelete; }
  get searchQuery() { return this._state.searchQuery; }

  // Setters
  set users(value) {
    this._state = { ...this._state, users: value };
    this.forceUpdate();
  }
  set adminName(value) {
    this._state = { ...this._state, adminName: value };
    this.forceUpdate();
  }
  set editDialogOpen(value) {
    this._state = { ...this._state, editDialogOpen: value };
    this.forceUpdate();
  }
  set editFormData(value) {
    this._state = { ...this._state, editFormData: value };
    this.forceUpdate();
  }
  set snackbar(value) {
    this._state = { ...this._state, snackbar: value };
    this.forceUpdate();
  }
  set loading(value) {
    this._state = { ...this._state, loading: value };
    this.forceUpdate();
  }
  set filterAnchorEl(value) {
    this._state = { ...this._state, filterAnchorEl: value };
    this.forceUpdate();
  }
  set logoutDialogOpen(value) {
    this._state = { ...this._state, logoutDialogOpen: value };
    this.forceUpdate();
  }
  set viewMode(value) {
    this._state = { ...this._state, viewMode: value };
    this.forceUpdate();
  }
  set instructors(value) {
    this._state = { ...this._state, instructors: value };
    this.forceUpdate();
  }
  set deleteDialogOpen(value) {
    this._state = { ...this._state, deleteDialogOpen: value };
    this.forceUpdate();
  }
  set userToDelete(value) {
    this._state = { ...this._state, userToDelete: value };
    this.forceUpdate();
  }
  set searchQuery(value) {
    this._state = { ...this._state, searchQuery: value };
    this.forceUpdate();
  }

  componentDidMount() {
    this.setupAuthListener();
  }

  setupAuthListener = () => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this._navigate('/login');
        return;
      }

      try {
        const adminDoc = await getDoc(doc(firestore, 'users', user.uid));
        const adminData = adminDoc.data();

        if (!adminData || adminData.role !== 'admin') {
          this._navigate('/login');
          return;
        }

        this.adminName = adminData.firstName || 'Admin';
        this.fetchUsers();
      } catch (error) {
        console.error('Error:', error);
        this.snackbar = {
          open: true,
          message: 'Error verifying admin status',
          severity: 'error'
        };
        this._navigate('/login');
      }
    });
  }

  fetchUsers = async () => {
    try {
      this.loading = true;
      const usersQuery = query(
        collection(firestore, 'users'),
        where('role', 'in', ['admin', 'instructor'])
      );
      
      onSnapshot(usersQuery, (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        this.users = allUsers.filter(user => user.role === 'admin');
        this.instructors = allUsers.filter(user => user.role === 'instructor');
        this.loading = false;
      });
      } catch (error) {
      console.error('Error fetching users:', error);
      this.snackbar = {
          open: true,
        message: 'Error loading users',
          severity: 'error'
      };
      this.loading = false;
    }
  }

  handleEditClick = (user) => {
    this.editFormData = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      idNumber: user.idNumber || '',
      college: user.college || '',
      section: user.section || '',
    };
    this.editDialogOpen = true;
  }

  handleEdit = async () => {
    try {
      const userRef = doc(firestore, 'users', this.editFormData.id);
      await updateDoc(userRef, {
        firstName: this.editFormData.firstName,
        lastName: this.editFormData.lastName,
        email: this.editFormData.email,
        phoneNumber: this.editFormData.phoneNumber,
        idNumber: this.editFormData.idNumber,
        college: this.editFormData.college,
        section: this.editFormData.section,
      });
      this.editDialogOpen = false;
      this.snackbar = {
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      this.snackbar = {
          open: true,
        message: 'Error updating user',
          severity: 'error'
      };
    }
  }

  handleDelete = (user) => {
    this.userToDelete = user;
    this.deleteDialogOpen = true;
  }

  handleDeleteConfirm = async () => {
    try {
      this.loading = true;
      const userId = this.userToDelete.id;

      // Delete only from Firestore
      await deleteDoc(doc(firestore, 'users', userId));

      this.snackbar = {
        open: true,
        message: 'User deleted successfully from database',
        severity: 'success'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'An error occurred while deleting the user';
      
      if (error.code === 'not-found') {
        errorMessage = 'User not found. They may have already been deleted.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to delete this user.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.snackbar = {
        open: true,
        message: errorMessage,
        severity: 'error'
      };
    } finally {
      this.loading = false;
      this.deleteDialogOpen = false;
      this.userToDelete = null;
    }
  }

  handleLogoutClick = () => {
    this.logoutDialogOpen = true;
  }

  handleLogoutConfirm = async () => {
    try {
      await auth.signOut();
      this._navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      this.snackbar = {
        open: true,
        message: 'Error signing out',
        severity: 'error'
      };
    }
    this.logoutDialogOpen = false;
  }

  handleLogoutCancel = () => {
    this.logoutDialogOpen = false;
  }

  get displayedUsers() {
    const users = this.viewMode === 'admin' ? this.users : this.instructors;
    return users.filter(user => {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          (user.firstName?.toLowerCase().includes(query)) ||
          (user.lastName?.toLowerCase().includes(query)) ||
          (user.email?.toLowerCase().includes(query)) ||
          (user.idNumber?.toLowerCase().includes(query)) ||
          (user.phoneNumber?.toLowerCase().includes(query)) ||
          (user.college?.toLowerCase().includes(query)) ||
          (user.section?.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }

  // Add this method to handle form submission via Enter key
  handleEditFormKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleEdit();
    }
  }

  // For the delete dialog, add key press handling
  handleDeleteDialogKeyDown = (event) => {
    if (event.key === 'Enter' && !this.loading) {
      event.preventDefault();
      this.handleDeleteConfirm();
    }
  }

  // For the logout dialog, add key press handling
  handleLogoutDialogKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleLogoutConfirm();
    }
  }

  render() {
    if (this.loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      );
    }

  return (
    <ThemeProvider theme={theme}>
        <BackgroundContainer>
          <StyledAppBar position="static">
            <Toolbar sx={{ minHeight: '70px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <LogoImage src={wordLogo} alt="WILD R.O.U.T.E AMS" />
              </Box>
              <Typography 
                sx={{ 
                  mr: 2,
              display: 'flex', 
              alignItems: 'center',
                  gap: 1,
                  fontWeight: 500
                }}
              >
                Welcome, {this.adminName}
              </Typography>
              <Button 
                color="inherit"
                onClick={this.handleLogoutClick}
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
            >
              Logout
              </Button>
          </Toolbar>
        </StyledAppBar>

          <ContentContainer maxWidth="xl">
            <HeaderPaper elevation={0}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: '#800000',
                  textAlign: 'center',
                  mb: 3,
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                User Management Dashboard
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                mb: 3, 
                justifyContent: 'center',
                width: '100%',
                flexWrap: 'wrap'
              }}>
                <ViewToggleButton
                  isActive={this.viewMode === 'admin'}
                  onClick={() => this.viewMode = 'admin'}
                >
                  Admins
                </ViewToggleButton>
                <ViewToggleButton
                  isActive={this.viewMode === 'instructor'}
                  onClick={() => this.viewMode = 'instructor'}
                >
                  Instructors
                </ViewToggleButton>
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: '500px', mb: 1 }}>
                <SearchTextField
                  fullWidth
                  placeholder="Search by name, email, ID, section..."
                  value={this.searchQuery}
                  onChange={(e) => this.searchQuery = e.target.value}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: this.searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => this.searchQuery = ''}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
            </HeaderPaper>

            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        minWidth: '120px',
                        maxWidth: '150px'
                      }}
                    >
                      ID Number
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        minWidth: '180px',
                        maxWidth: '250px'
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        minWidth: '200px',
                        maxWidth: '300px'
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        minWidth: '120px',
                        maxWidth: '150px'
                      }}
                    >
                      Phone
                    </TableCell>
                    {this.viewMode === 'instructor' && (
                      <>
                        <TableCell 
                          sx={{ 
                            minWidth: '140px',
                            maxWidth: '180px'
                          }}
                        >
                          College
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            minWidth: '100px',
                            maxWidth: '120px'
                          }}
                        >
                          Section
                        </TableCell>
                      </>
                    )}
                    <TableCell 
                      align="center" 
                      sx={{ 
                        minWidth: '100px',
                        maxWidth: '120px'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.displayedUsers.length > 0 ? (
                    this.displayedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell align="center">
                          <Tooltip title={user.idNumber} arrow placement="top">
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.idNumber}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={`${user.firstName} ${user.lastName}`} arrow placement="top">
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Typography sx={{ fontWeight: 500 }}>
                                {`${user.firstName} ${user.lastName}`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={user.email} arrow placement="top">
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.email}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={user.phoneNumber} arrow placement="top">
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.phoneNumber}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        {this.viewMode === 'instructor' && (
                          <>
                            <TableCell>
                              <Tooltip title={user.college || 'Not set'} arrow placement="top">
                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {user.college || 'Not set'}
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={user.section || 'Not set'} arrow placement="top">
                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {user.section || 'Not set'}
                                </Box>
                              </Tooltip>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Edit User" arrow>
                              <ActionIconButton
                                size="small"
                                onClick={() => this.handleEditClick(user)}
                              color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </ActionIconButton>
                            </Tooltip>
                            <Tooltip title="Delete User" arrow>
                              <ActionIconButton
                              size="small"
                                onClick={() => this.handleDelete(user)}
                                color="error"
                                disabled={this.loading}
                              >
                                {this.loading ? (
                                  <CircularProgress size={20} color="error" />
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </ActionIconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={this.viewMode === 'instructor' ? 7 : 5} 
                        align="center"
                        sx={{ py: 4 }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <SearchOffIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                          <Typography variant="body1" color="text.secondary">
                            No users found{this.searchQuery ? ' matching your search criteria' : ''}
                          </Typography>
                          {this.searchQuery && (
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => this.searchQuery = ''}
                              startIcon={<RefreshIcon />}
                              sx={{ mt: 1 }}
                            >
                              Clear Search
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </ContentContainer>

        <StyledDialog 
          open={this.editDialogOpen} 
          onClose={() => this.editDialogOpen = false}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            py: 2.5,
            px: 3,
            fontWeight: 600,
            color: '#800000'
          }}>
            Edit User
          </DialogTitle>
          <DialogContent sx={{ py: 3, px: 3 }}>
            <Box 
              component="form" 
              sx={{ mt: 2 }}
              onKeyDown={this.handleEditFormKeyDown}
              noValidate
            >
              <TextField
                fullWidth
                margin="dense"
                label="First Name"
                name="firstName"
                  value={this.editFormData.firstName}
                  onChange={(e) => this.editFormData = {
                    ...this.editFormData,
                    firstName: e.target.value
                  }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Last Name"
                name="lastName"
                  value={this.editFormData.lastName}
                  onChange={(e) => this.editFormData = {
                    ...this.editFormData,
                    lastName: e.target.value
                  }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                name="email"
                  value={this.editFormData.email}
                  onChange={(e) => this.editFormData = {
                    ...this.editFormData,
                    email: e.target.value
                  }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Phone Number"
                name="phoneNumber"
                  value={this.editFormData.phoneNumber}
                  onChange={(e) => this.editFormData = {
                    ...this.editFormData,
                    phoneNumber: e.target.value
                  }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="ID Number"
                name="idNumber"
                  value={this.editFormData.idNumber}
                  onChange={(e) => this.editFormData = {
                    ...this.editFormData,
                    idNumber: e.target.value
                  }}
                />
                {this.viewMode === 'instructor' && (
                  <>
                    <Autocomplete
                      fullWidth
                      options={Object.keys(COLLEGES)}
                      value={this.editFormData.college || null}
                      onChange={(e, newValue) => this.editFormData = {
                        ...this.editFormData,
                        college: newValue
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="dense"
                          label="College"
                          name="college"
                          fullWidth
                        />
                      )}
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      fullWidth
                      margin="dense"
                      label="Section"
                      name="section"
                      value={this.editFormData.section}
                      onChange={(e) => this.editFormData = {
                        ...this.editFormData,
                        section: e.target.value
                      }}
                      sx={{ mt: 1 }}
                    />
                  </>
                )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            pb: 3,
            pt: 2,
          }}>
            <Button 
              onClick={() => this.editDialogOpen = false}
              sx={{ 
                color: 'text.secondary',
                px: 3,
                py: 1,
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={this.handleEdit} 
              variant="contained" 
              color="primary"
              sx={{ 
                ml: 1,
                px: 3,
                py: 1,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(128,0,0,0.2)',
              }}
            >
              Save
            </Button>
          </DialogActions>
        </StyledDialog>

        <Snackbar 
            open={this.snackbar.open}
          autoHideDuration={6000} 
            onClose={() => this.snackbar = { ...this.snackbar, open: false }}
        >
          <Alert 
              onClose={() => this.snackbar = { ...this.snackbar, open: false }}
              severity={this.snackbar.severity}
            sx={{ width: '100%' }}
          >
              {this.snackbar.message}
          </Alert>
        </Snackbar>

          <StyledDialog
            open={this.logoutDialogOpen}
            onClose={this.handleLogoutCancel}
            TransitionProps={{
              timeout: 300,
              onEnter: (node) => {
                node.style.animation = 'slideIn 0.3s ease-out';
              },
              onExit: (node) => {
                node.style.animation = 'none';
                node.style.transform = 'translateY(20px)';
                node.style.opacity = '0';
              }
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                minWidth: '300px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }
            }}
            BackdropProps={{
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                pb: 2,
                fontWeight: 600,
                backgroundColor: '#ffffff',
              }}
            >
              Confirm Logout
            </DialogTitle>
            <DialogContent 
              sx={{ 
                py: 3,
                px: 3,
                typography: 'body1',
                color: 'text.secondary',
                backgroundColor: '#ffffff'
              }}
              onKeyDown={this.handleLogoutDialogKeyDown}
            >
              Are you sure you want to log out of the admin dashboard?
            </DialogContent>
            <DialogActions sx={{ 
              px: 3, 
              pb: 3,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              pt: 2,
              backgroundColor: '#ffffff',
            }}>
              <Button 
                onClick={this.handleLogoutCancel}
                sx={{ 
                  color: 'text.secondary',
                  px: 3,
                  py: 1,
                  '&:hover': { 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={this.handleLogoutConfirm}
                variant="contained"
                color="primary"
                sx={{ 
                  ml: 1,
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  '&:hover': { 
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: '0 4px 12px rgba(128,0,0,0.3)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Logout
              </Button>
            </DialogActions>
          </StyledDialog>

          <StyledDialog
            open={this.deleteDialogOpen}
            onClose={() => {
              this.deleteDialogOpen = false;
              this.userToDelete = null;
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff',
              pb: 2,
              color: theme.palette.error.main,
              fontWeight: 600
            }}>
              Confirm Delete
            </DialogTitle>
            <DialogContent 
              sx={{ 
                py: 3,
                px: 3,
                backgroundColor: '#ffffff'
              }}
              onKeyDown={this.handleDeleteDialogKeyDown}
            >
              <Typography>
                Are you sure you want to delete this user?
                {this.userToDelete && (
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {` ${this.userToDelete.firstName} ${this.userToDelete.lastName}`}
      </Box>
                )}
              </Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                This action cannot be undone. The user will be removed from the database.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ 
              px: 3, 
              pb: 3,
              borderTop: '1px solid rgba(0,0,0,0.1)',
              pt: 2,
              backgroundColor: '#ffffff',
            }}>
              <Button 
                onClick={() => {
                  this.deleteDialogOpen = false;
                  this.userToDelete = null;
                }}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={this.handleDeleteConfirm}
                variant="contained"
                color="error"
                disabled={this.loading}
                sx={{ 
                  ml: 1,
                  px: 3,
                  '&:hover': { backgroundColor: theme.palette.error.dark }
                }}
              >
                {this.loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogActions>
          </StyledDialog>
        </BackgroundContainer>
    </ThemeProvider>
  );
  }
}

// Name the HOC before exporting
const WithNavigateAdminDashboard = (props) => {
  const navigate = useNavigate();
  return <AdminDashboard {...props} navigate={navigate} />;
};

export default WithNavigateAdminDashboard; 