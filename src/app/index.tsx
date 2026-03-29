import { GoogleSignin } from "@react-native-google-signin/google-signin";
import React, { useEffect } from 'react';
import { useAuth } from '../context/auth';
import '../styles/global.css';
import LoadingScreen from './loading';
import LoginScreen from './login';
import PlanTrackerScreen from './plan-tracker';

export default function App() {
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "533746197195-ifbe3ddgp75jf8cn6j3p2s10furm8tec.apps.googleusercontent.com",
      profileImageSize: 150,
    })
  }, []);

  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <PlanTrackerScreen />;
}
