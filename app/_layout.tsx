import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, Text, View, ScrollView } from 'react-native';
import { useAuth } from '@hooks/useAuth';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }} contentContainerStyle={{ padding: 24 }}>
          <Text style={{ color: '#f87171', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Erreur dans l'app
          </Text>
          <Text selectable style={{ color: '#fca5a5', fontFamily: 'monospace', marginBottom: 12 }}>
            {err.message}
          </Text>
          <Text selectable style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>
            {err.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, height: '100%', backgroundColor: '#0f172a' }}>
        <BottomSheetProvider>
          <AuthGuard>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }} />
          </AuthGuard>
        </BottomSheetProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
