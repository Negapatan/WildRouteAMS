import React, { Component } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

class AnimatedRoutes extends Component {
  constructor(props) {
    super(props);
    this._location = props.location;
  }

  render() {
    return (
      <AnimatePresence mode="wait">
        <Routes location={this._location} key={this._location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AnimatePresence>
    );
  }
}

// Name the HOC before exporting
const WithLocationAnimatedRoutes = (props) => {
  const location = useLocation();
  return <AnimatedRoutes {...props} location={location} />;
};

export default WithLocationAnimatedRoutes; 