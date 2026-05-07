import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') return <>{children}</>;
  const { BottomSheetModalProvider } = require('@gorhom/bottom-sheet');
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetProvider>
        <AuthGuard>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthGuard>
      </BottomSheetProvider>
    </GestureHandlerRootView>
  );
}
