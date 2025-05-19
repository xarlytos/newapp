import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Exercises from '../pages/Exercises';
import Nutrition from '../pages/Nutrition';
import Questionnaires from '../pages/Questionnaires';
import Profile from '../pages/Profile';
import ChatPage from '../pages/ChatPage'; // Importa la nueva página de chat

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
            <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/exercises" 
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/nutrition" 
        element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/questionnaires" 
        element={
          <ProtectedRoute>
            <Questionnaires />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Default redirect to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all route - redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;