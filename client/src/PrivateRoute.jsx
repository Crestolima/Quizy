// PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { loggedInUser } = useAuth();

  return loggedInUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
