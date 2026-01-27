// src/components/PrivateRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    // Redirect to login if user is not logged in
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
