import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box } from '@mui/material';
import { auth, firestore } from '../firebase';

class ProtectedRoute extends Component {
  constructor(props) {
    super(props);
    this._state = {
      isLoading: true,
      isAdmin: false
    };
  }

  // Getters
  get isLoading() { return this._state.isLoading; }
  get isAdmin() { return this._state.isAdmin; }

  // Setters
  set isLoading(value) {
    this._state = { ...this._state, isLoading: value };
    this.forceUpdate();
  }
  set isAdmin(value) {
    this._state = { ...this._state, isAdmin: value };
    this.forceUpdate();
  }

  componentDidMount() {
    this.setupAuthListener();
  }

  setupAuthListener = () => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.isAdmin = false;
        this.isLoading = false;
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        this.isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
      } catch (error) {
        console.error('Error checking admin status:', error);
        this.isAdmin = false;
      }
      this.isLoading = false;
    });
  }

  render() {
    if (this.isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!this.isAdmin) {
      return <Navigate to="/login" replace />;
    }

    return this.props.children;
  }
}

export default ProtectedRoute; 