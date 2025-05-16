
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSocketConnection from '@/hooks/useSocketConnection';

export function ConnectionStatus() {
  const { isConnected } = useSocketConnection();
  const [showDisconnected, setShowDisconnected] = useState(false);
  
  useEffect(() => {
    if (!isConnected) {
      setShowDisconnected(true);
    } else if (showDisconnected) {
      // Add a small delay before hiding the disconnected banner
      const timer = setTimeout(() => {
        setShowDisconnected(false);
        toast.success('Se ha restablecido la conexión');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, showDisconnected]);
  
  if (!showDisconnected) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-white py-1 px-4 text-center z-50 animate-fade-in">
      <p className="text-sm font-medium">
        Sin conexión. Intentando reconectar...
      </p>
    </div>
  );
}

export default ConnectionStatus;
