import React, { useState, useEffect } from 'react';
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    status: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const adminDoc = await getDoc(doc(firestore, 'users', user.uid));
        const adminData = adminDoc.data();

        if (!adminData || adminData.role !== 'admin') {
          navigate('/login');
          return;
        }

        setAdminName(adminData.firstName || 'Admin');
        fetchUsers();
      } catch (error) {
        console.error('Error:', error);
        setSnackbar({
          open: true,
          message: 'Error verifying admin status',
          severity: 'error'
        });
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    document.title = 'WildCore Account Management';
    return () => {
      document.title = 'WildCore';
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(firestore, 'users'));
      onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error loading users',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditFormData({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      idNumber: user.idNumber || '',
      status: user.status || 'active'
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    try {
      const batch = writeBatch(firestore);
      
      const userRef = doc(firestore, 'users', editFormData.id);
      batch.update(userRef, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        idNumber: editFormData.idNumber,
        status: editFormData.status,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();

      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error updating user',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // First delete from Firestore
        await deleteDoc(doc(firestore, 'users', userId));

        // Call a Cloud Function to delete the user from Authentication
        const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');
        await deleteAuthUser({ uid: userId });

        setSnackbar({
          open: true,
          message: 'User deleted successfully from both Database and Authentication',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting user: ' + error.message,
          severity: 'error'
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbar({
        open: true,
        message: 'Error signing out',
        severity: 'error'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    if (statusFilter === 'all') return true;
    return user.status === statusFilter;
  });

  const displayedUsers = filteredUsers
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
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
              Welcome, {adminName}
            </Typography>
            <Button 
              color="inherit"
              onClick={handleLogout}
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
                  onClick={fetchUsers} 
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
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
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
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => { setStatusFilter('all'); setFilterAnchorEl(null); }}>
              All Users
            </MenuItem>
            <MenuItem onClick={() => { setStatusFilter('active'); setFilterAnchorEl(null); }}>
              Active Users
            </MenuItem>
            <MenuItem onClick={() => { setStatusFilter('inactive'); setFilterAnchorEl(null); }}>
              Inactive Users
            </MenuItem>
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
                {displayedUsers.map((user) => (
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
                            onClick={() => handleEditClick(user)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </ActionIconButton>
                        </Tooltip>
                        <Tooltip title="Delete User" arrow>
                          <ActionIconButton
                            size="small"
                            onClick={() => handleDelete(user.id)}
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
              count={filteredUsers.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
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
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
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
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  firstName: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Last Name"
                name="lastName"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  lastName: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                name="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  email: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Phone Number"
                name="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  phoneNumber: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="dense"
                label="ID Number"
                name="idNumber"
                value={editFormData.idNumber}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  idNumber: e.target.value
                })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </BackgroundContainer>
    </ThemeProvider>
  );
};

export default AdminDashboard; 