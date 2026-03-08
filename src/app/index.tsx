import React from 'react';
import { useAuth } from '../context/auth';
import '../styles/global.css';
import LoadingScreen from './loading';
import LoginScreen from './login';
import PlanTrackerScreen from './plan-tracker';

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <PlanTrackerScreen />;
}
