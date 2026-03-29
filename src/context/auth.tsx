
import { type AuthUser } from "@/types/user.type";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";

import { router } from 'expo-router';
import * as React from 'react';
import Memory from '../app/api/repositories/memory';

const AuthContext = React.createContext({
  isSignedIn: false,
  signIn: () => { },
  signOut: () => { },
  authUser: null as AuthUser | null,
  isLoading: false,
  errorMessage: null as string | null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSignedIn, setIsSignedIn] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "533746197195-ifbe3ddgp75jf8cn6j3p2s10furm8tec.apps.googleusercontent.com",
      profileImageSize: 150,
    })

    Memory.get("google_user")
      .then(authUser => {
        if (authUser) {
          setAuthUser(authUser);
          setIsSignedIn(true);
        }
      });

  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        idToken && Memory.set("google_idToken", idToken);
        setAuthUser(user);
        Memory.set("google_user", user);
        setIsSignedIn(true);
        router.replace('/home');
      }
      else {
        setErrorMessage('Login com Google foi cancelado');
      }

      setIsLoading(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Login com Google está em progresso");
            break;

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setErrorMessage("Play Services não está disponível");
            break;

          default:
            setErrorMessage(`${error.code}: ${error.message}`);
        }
      }
      else {
        setErrorMessage("Ops, ocorreu um erro");
      }

      setIsLoading(false);
    }
  }


  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setIsSignedIn(false);
      router.replace('/login');
    }
    catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isSignedIn,
        signIn,
        signOut,
        isLoading,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
