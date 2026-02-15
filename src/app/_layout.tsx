import { AuthProvider } from '@/src/context/auth';
import { Slot } from 'expo-router';
import '../styles/global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
