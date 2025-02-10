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
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, functions } from '../firebase';
import { collection, onSnapshot, query, doc, deleteDoc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import wordLogo from '../assets/wordlogo.png';

// Styled components using MUI system
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  background: 'rgba(255, 255, 255, 0.95)',
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontWeight: theme.typography.fontWeightBold,
    padding: '16px',
    textAlign: 'center',
    fontSize: '1rem',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    '&:last-child': {
      borderRight: 'none',
    }
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #800000 30%, #a31545 90%)',
  boxShadow: '0 3px 5px 2px rgba(128, 0, 0, .3)',
}));

const GoldButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFD700 30%, #FDB931 90%)',
  border: 0,
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  padding: '8px 16px',
  boxShadow: '0 3px 5px 2px rgba(255, 215, 0, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FDB931 30%, #FFD700 90%)',
  },
}));

const LogoImage = styled('img')({
  height: '35px',
  width: 'auto',
  marginLeft: '10px'
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const rowsPerContainer = 7; // Maximum visible rows before scrolling

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verify user is admin
      try {
        const adminDoc = await getDoc(doc(firestore, 'users', user.uid));
        const adminData = adminDoc.data();

        if (!adminData || adminData.role !== 'admin') {
          navigate('/login');
          return;
        }

        setAdminEmail(user.email);

        // Subscribe to users collection
        const usersQuery = query(collection(firestore, 'users'));
        const unsubscribeSnapshot = onSnapshot(usersQuery, (snapshot) => {
          const usersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersList);
        });

        return () => unsubscribeSnapshot();
      } catch (error) {
        console.error('Error verifying admin status:', error);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleEditClick = (user) => {
    setEditFormData({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      idNumber: user.idNumber
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    try {
      // First verify the current user is still an admin
      const adminDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      const adminData = adminDoc.data();

      if (!adminData || adminData.role !== 'admin') {
        setSnackbar({
          open: true,
          message: 'You no longer have admin privileges',
          severity: 'error'
        });
        navigate('/login');
        return;
      }

      // Get the current user data
      const userDoc = await getDoc(doc(firestore, 'users', editFormData.id));
      const currentData = userDoc.data();

      // Prepare the update data with all required fields
      const updateData = {
        firstName: editFormData.firstName || currentData.firstName,
        lastName: editFormData.lastName || currentData.lastName,
        email: editFormData.email || currentData.email,
        role: currentData.role, // Preserve the role
        idNumber: editFormData.idNumber || currentData.idNumber,
        phoneNumber: editFormData.phoneNumber || currentData.phoneNumber,
        createdAt: currentData.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.uid
      };

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'role', 'idNumber', 'phoneNumber', 'createdAt'];
      const missingFields = requiredFields.filter(field => !updateData[field]);

      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      // Use batch write to update both user and profile
      const batch = writeBatch(firestore);
      
      // Update user document
      const userRef = doc(firestore, 'users', editFormData.id);
      batch.update(userRef, updateData);

      // Update profile document
      const profileRef = doc(firestore, 'profile', editFormData.id);
      const profileUpdateData = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        idNumber: updateData.idNumber,
        updatedAt: updateData.updatedAt,
        updatedBy: updateData.updatedBy
      };
      batch.update(profileRef, profileUpdateData);

      // Commit the batch
      await batch.commit();

      setSnackbar({
        open: true,
        message: 'User and profile updated successfully',
        severity: 'success'
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: `Error updating user: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
            <GoldButton 
              onClick={handleLogout}
              variant="contained"
            >
              Logout
            </GoldButton>
          </Toolbar>
        </StyledAppBar>

        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 4, 
            mb: 4, 
            flexGrow: 1,
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              color: theme.palette.primary.main,
              WebkitTextStroke: '1px black',
              textStroke: '1px black',
              letterSpacing: '1px',
            }}
          >
            User Management
          </Typography>
          
          <StyledTableContainer 
            component={Paper} 
            sx={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(128, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              height: users.length > 7 ? `${7 * 53}px` : 'auto', // Fixed height for 7 rows, auto if less
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="15%">ID Number</TableCell>
                    <TableCell width="20%">Name</TableCell>
                    <TableCell width="20%">Email</TableCell>
                    <TableCell width="10%">Role</TableCell>
                    <TableCell width="15%">Phone Number</TableCell>
                    <TableCell width="12%">Created At</TableCell>
                    <TableCell width="8%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.idNumber}</TableCell>
                        <TableCell>
                          {`${user.firstName} ${user.lastName}`}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: user.role === 'admin' 
                                ? theme.palette.primary.main 
                                : theme.palette.text.primary,
                              fontWeight: user.role === 'admin' 
                                ? theme.typography.fontWeightMedium 
                                : theme.typography.fontWeightRegular,
                              textTransform: 'capitalize'
                            }}
                          >
                            {user.role}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => handleEditClick(user)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={7} 
                        align="center"
                        sx={{ py: 3 }}
                      >
                        <Typography color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={2000}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[20]}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderTop: '1px solid rgba(224, 224, 224, 1)',
                position: 'sticky',
                bottom: 0,
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease-in-out',
                '& .MuiToolbar-root': {
                  padding: '0px',
                  minHeight: '52px',
                  transition: 'all 0.3s ease-in-out',
                },
                '& .MuiTablePagination-select': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transition: 'background-color 0.3s ease',
                },
                '& .MuiTablePagination-selectIcon': {
                  color: theme.palette.primary.main,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                },
                '& .MuiTablePagination-displayedRows': {
                  margin: '0 auto',
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  transition: 'color 0.3s ease',
                },
                '& .MuiButtonBase-root': {
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&.Mui-disabled': {
                    color: 'rgba(128, 0, 0, 0.3)',
                    transition: 'color 0.3s ease',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(128, 0, 0, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                },
              }}
            />
          </StyledTableContainer>
        </Container>

        {/* Edit User Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          PaperProps={{
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(128, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                fullWidth
                margin="dense"
                label="First Name"
                name="firstName"
                value={editFormData.firstName || ''}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Last Name"
                name="lastName"
                value={editFormData.lastName || ''}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                name="email"
                value={editFormData.email || ''}
                onChange={handleEditFormChange}
                type="email"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Phone Number"
                name="phoneNumber"
                value={editFormData.phoneNumber || ''}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="ID Number"
                name="idNumber"
                value={editFormData.idNumber || ''}
                onChange={handleEditFormChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard; 