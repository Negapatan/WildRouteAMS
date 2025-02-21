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
  TablePagination,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, functions } from '../firebase';
import { collection, onSnapshot, query, doc, deleteDoc, getDoc, writeBatch, where, updateDoc } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import wordLogo from '../assets/wordlogo.png';
import { COLLEGES } from '../utils/collegePrograms';

const BackgroundContainer = styled(Box)({
  minHeight: '100vh',
  position: 'relative',
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

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #800000 30%, #a31545 90%)',
  boxShadow: '0 3px 5px 2px rgba(128, 0, 0, .3)',
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderRadius: '20px',
  background: '#ffffff',
  overflow: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 200px)',
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '16px',
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
  },
  '& .MuiTableCell-head': {
    backgroundColor: '#800000',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: 'none',
    padding: '20px 16px',
  },
  '& .MuiTableCell-body': {
    fontSize: '0.9rem',
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    '&:nth-of-type(odd)': {
      backgroundColor: '#fafafa',
    },
    '&:hover': {
      backgroundColor: '#f5f5f5',
    }
  },
  '& .MuiTablePagination-root': {
    backgroundColor: '#ffffff',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
    position: 'sticky',
    bottom: 0,
    zIndex: 2
  },
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
    '&:hover': {
      background: '#666'
    }
  }
}));

const StyledChip = styled(Chip)(({ theme, color }) => ({
  fontWeight: 500,
  color: 'white',
  padding: '0 8px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  textTransform: 'capitalize',
  backgroundColor: 
    color === 'active' ? '#2e7d32' :
    color === 'inactive' ? '#d32f2f' :
    '#ed6c02',
  boxShadow: 'none'
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  marginRight: '4px',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease-out !important',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    transition: 'opacity 0.3s ease-out !important',
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateY(20px)',
      opacity: 0
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1
    }
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  }
}));

const ViewToggleButton = styled(Button)(({ theme, isActive }) => ({
  backgroundColor: isActive ? theme.palette.primary.main : '#ffffff',
  color: isActive ? '#ffffff' : theme.palette.primary.main,
  fontWeight: 600,
  padding: '10px 32px',
  borderRadius: '8px',
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: isActive ? '0 4px 12px rgba(128,0,0,0.2)' : 'none',
  '&:hover': {
    backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.primary.light,
    color: '#ffffff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(128,0,0,0.3)',
  },
  transition: 'all 0.2s ease'
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: theme.palette.primary.main,
  padding: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(128,0,0,0.2)',
  },
  transition: 'all 0.2s ease'
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
        status: '',
        college: '',
      },
      snackbar: { 
        open: false, 
        message: '', 
        severity: 'success' 
      },
      loading: true,
      page: 0,
      rowsPerPage: 7,
      filterAnchorEl: null,
      statusFilter: 'all',
      logoutDialogOpen: false,
      viewMode: 'admin',
      instructors: [],
      deleteDialogOpen: false,
      userToDelete: null,
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
  get page() { return this._state.page; }
  get rowsPerPage() { return this._state.rowsPerPage; }
  get filterAnchorEl() { return this._state.filterAnchorEl; }
  get statusFilter() { return this._state.statusFilter; }
  get logoutDialogOpen() { return this._state.logoutDialogOpen; }
  get viewMode() { return this._state.viewMode; }
  get instructors() { return this._state.instructors; }
  get deleteDialogOpen() { return this._state.deleteDialogOpen; }
  get userToDelete() { return this._state.userToDelete; }

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
  set page(value) {
    this._state = { ...this._state, page: value };
    this.forceUpdate();
  }
  set rowsPerPage(value) {
    this._state = { ...this._state, rowsPerPage: value };
    this.forceUpdate();
  }
  set filterAnchorEl(value) {
    this._state = { ...this._state, filterAnchorEl: value };
    this.forceUpdate();
  }
  set statusFilter(value) {
    this._state = { ...this._state, statusFilter: value };
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
      status: user.status || 'active',
      college: user.college || '',
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
        status: this.editFormData.status,
        college: this.editFormData.college,
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

  get filteredUsers() {
    return this.users.filter(user => {
      if (this.statusFilter === 'all') return true;
      return user.status === this.statusFilter;
    });
  }

  get displayedUsers() {
    const users = this.viewMode === 'admin' ? this.users : this.instructors;
    return users
      .filter(user => {
        if (this.statusFilter === 'all') return true;
        return user.status === this.statusFilter;
      })
      .slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage);
  }

  handleFilterSelect = (status) => {
    this.statusFilter = status;
    this.filterAnchorEl = null;
    this.page = 0;
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
                <LogoImage src={wordLogo} alt="WILDCORE" />
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

          <Container maxWidth="xl" sx={{ 
            height: 'calc(100vh - 64px)',
            pt: 3,
            pb: 3,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
              alignItems: 'center',
              mb: 4 
            }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            User Management
          </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
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

            <Menu
              anchorEl={this.filterAnchorEl}
              open={Boolean(this.filterAnchorEl)}
              onClose={() => this.filterAnchorEl = null}
            >
              <MenuItem onClick={() => this.handleFilterSelect('all')}>All Users</MenuItem>
              <MenuItem onClick={() => this.handleFilterSelect('active')}>Active Users</MenuItem>
              <MenuItem onClick={() => this.handleFilterSelect('inactive')}>Inactive Users</MenuItem>
            </Menu>

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
                      <TableCell 
                        sx={{ 
                          minWidth: '180px',
                          maxWidth: '250px'
                        }}
                      >
                        College
                      </TableCell>
                    )}
                    <TableCell 
                      align="center" 
                      sx={{ 
                        minWidth: '100px',
                        maxWidth: '120px'
                      }}
                    >
                      Status
                    </TableCell>
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
                  {this.displayedUsers.map((user) => (
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
                        <TableCell>
                          <Tooltip title={user.college || 'Not set'} arrow placement="top">
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.college || 'Not set'}
                            </Box>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <StyledChip
                          label={user.status || 'active'}
                          color={user.status || 'active'}
                          size="small"
                        />
                      </TableCell>
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
                  ))}
                </TableBody>
              </Table>
            <TablePagination
              component="div"
                count={this.filteredUsers.length}
                page={this.page}
                onPageChange={(e, newPage) => this.page = newPage}
                rowsPerPage={this.rowsPerPage}
                onRowsPerPageChange={(e) => {
                  this.rowsPerPage = parseInt(e.target.value, 10);
                  this.page = 0;
                }}
                rowsPerPageOptions={[7, 14, 25]}
              sx={{
                  '.MuiTablePagination-select': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                  },
                  '.MuiTablePagination-selectIcon': {
                    color: theme.palette.primary.main
                  }
              }}
            />
          </StyledTableContainer>
        </Container>

        <Dialog 
            open={this.editDialogOpen} 
            onClose={() => this.editDialogOpen = false}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }
            }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
            pb: 2 
          }}>
            Edit User
          </DialogTitle>
          <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
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
                )}
            </Box>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => this.editDialogOpen = false}>Cancel</Button>
              <Button onClick={this.handleEdit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

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
            <DialogContent sx={{ 
              py: 3,
              px: 3,
              typography: 'body1',
              color: 'text.secondary',
              backgroundColor: '#ffffff'
            }}>
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
            <DialogContent sx={{ 
              py: 3,
              px: 3,
              backgroundColor: '#ffffff'
            }}>
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