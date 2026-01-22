import { useEffect } from 'react';
import { AppRouter } from './app/router';
import { useAuthStore } from './store/auth.store';
import './App.css';

function App() {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Simulate checking for existing session
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return <AppRouter />;
}

export default App;
