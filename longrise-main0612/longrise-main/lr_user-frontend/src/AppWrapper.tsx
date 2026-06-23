/**
 * App Wrapper with Authentication for Longrise AI Platform
 */
import React from 'react';
import { motion } from 'motion/react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import App from './App'; // Original App component

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-white text-lg">Loading Longrise AI...</p>
    </motion.div>
  </div>
);

// Main App Content
const AppContent: React.FC = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <App />
    </motion.div>
  );
};

// Root App Wrapper
const AppWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppWrapper;