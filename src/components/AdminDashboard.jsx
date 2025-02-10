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
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, functions } from '../firebase';
import { collection, onSnapshot, query, doc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import wordLogo from '../assets/wordlogo.png';
import { httpsCallable } from 'firebase/functions';

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
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(12px)',
  overflow: 'hidden',
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    padding: '16px',
    borderBottom: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  '& .MuiTableCell-body': {
    fontSize: '0.9rem',
    padding: '16px',
    color: theme.palette.text.primary
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.05)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
    }
  },
  '& .MuiTablePagination-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTop: '1px solid rgba(224, 224, 224, 0.5)'
  }
}));

const StyledChip = styled(Chip)(({ theme, color }) => ({
  fontWeight: 'bold',
  color: 'white',
  padding: '0 8px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  textTransform: 'capitalize',
  backgroundColor: 
    color === 'active' ? theme.palette.success.main :
    color === 'inactive' ? theme.palette.error.main :
    theme.palette.warning.main,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  marginRight: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
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
        status: ''
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
      statusFilter: 'all'
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
      const usersQuery = query(collection(firestore, 'users'));
      onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.users = usersList;
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
      status: user.status || 'active'
    };
    this.editDialogOpen = true;
  }

  handleEdit = async () => {
    try {
      const batch = writeBatch(firestore);
      
      const userRef = doc(firestore, 'users', this.editFormData.id);
      batch.update(userRef, {
        ...this.editFormData,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();

      this.snackbar = {
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      };
      this.editDialogOpen = false;
    } catch (error) {
      console.error('Error:', error);
      this.snackbar = {
        open: true,
        message: 'Error updating user',
        severity: 'error'
      };
    }
  }

  handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(firestore, 'users', userId));
        const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');
        await deleteAuthUser({ uid: userId });

        this.snackbar = {
          open: true,
          message: 'User deleted successfully from both Database and Authentication',
          severity: 'success'
        };
      } catch (error) {
        console.error('Error deleting user:', error);
        this.snackbar = {
          open: true,
          message: 'Error deleting user: ' + error.message,
          severity: 'error'
        };
      }
    }
  }

  handleLogout = async () => {
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
  }

  get filteredUsers() {
    return this.users.filter(user => {
      if (this.statusFilter === 'all') return true;
      return user.status === this.statusFilter;
    });
  }

  get displayedUsers() {
    return this.filteredUsers
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
                onClick={this.handleLogout}
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Logout
              </Button>
            </Toolbar>
          </StyledAppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={this.fetchUsers} 
                    sx={{ 
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter">
                  <IconButton 
                    onClick={(e) => this.filterAnchorEl = e.currentTarget}
                    sx={{ 
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
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
                    <TableCell align="center" width="15%">ID Number</TableCell>
                    <TableCell width="25%">Name</TableCell>
                    <TableCell width="25%">Email</TableCell>
                    <TableCell width="15%">Phone</TableCell>
                    <TableCell align="center" width="10%">Status</TableCell>
                    <TableCell align="center" width="10%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.displayedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell align="center">{user.idNumber}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column'
                        }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            {`${user.firstName} ${user.lastName}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
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
                              onClick={() => this.handleDelete(user.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
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
          >
            <DialogTitle>Edit User</DialogTitle>
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
        </BackgroundContainer>
      </ThemeProvider>
    );
  }
}

// Wrap with navigate
export default (props) => {
  const navigate = useNavigate();
  return <AdminDashboard {...props} navigate={navigate} />;
}; 