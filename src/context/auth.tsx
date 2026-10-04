
import { type AuthUser } from "@/types/user.type";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";

import Memory from '@/src/api/memory';
import * as React from 'react';
import useNavigation from "../hooks/useNavigation";
import { toastErrorMessage, toastInfoMessage } from "../utils/toastUtils";

const AuthContext = React.createContext({
  isSignedIn: false,
  signIn: () => { },
  signOut: () => { },
  authUser: null as AuthUser | null,
  isLoading: false,
  errorMessage: null as string | null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigation = useNavigation();  

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
      const success = isSuccessResponse(response);
      const hasIdToken = success ? Boolean(response.data.idToken) : false;
      const hasUser = success ? Boolean(response.data.user) : false;
      // #region agent log
      fetch('http://127.0.0.1:7592/ingest/3ca86e35-fb03-43a9-869d-50a6c2ae00ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f797c0'},body:JSON.stringify({sessionId:'f797c0',runId:'pre',hypothesisId:'A-B',location:'auth.tsx:signIn',message:'google sign-in returned',data:{success,type:response.type,hasIdToken,hasUser},timestamp:Date.now()})}).catch(()=>{});
      console.log('[debug-f797c0]', JSON.stringify({hypothesisId:'A-B',message:'google sign-in returned',success,type:response.type,hasIdToken,hasUser}));
      // #endregion
      if (success) {
        const { idToken, user } = response.data;
        idToken && Memory.set("google_idToken", idToken);
        setAuthUser(user);
        Memory.set("google_user", user);
        setIsSignedIn(true);
        navigation.replace('/home');
      }
      else {
        setErrorMessage('Login com Google foi cancelado');
      }

      setIsLoading(false);
    } catch (error) {
      // #region agent log
      const code = isErrorWithCode(error) ? error.code : null;
      const message = error instanceof Error ? error.message : String(error);
      fetch('http://127.0.0.1:7592/ingest/3ca86e35-fb03-43a9-869d-50a6c2ae00ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f797c0'},body:JSON.stringify({sessionId:'f797c0',runId:'post-fix',hypothesisId:'A',location:'auth.tsx:signIn:catch',message:'google sign-in threw',data:{code,message},timestamp:Date.now()})}).catch(()=>{});
      console.log('[debug-f797c0]', JSON.stringify({runId:'post-fix',hypothesisId:'A',message:'google sign-in threw',code,errorMessage:message}));
      // #endregion
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            toastInfoMessage("Login com Google está em progresso");
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
      navigation.replace('/login');
    }
    catch (error) {
      toastErrorMessage(String(error));
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
