import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [progressState, setProgressState] = useState(null); // 'started', 'parsing', 'ai_processing', 'risk_check', 'ready', 'error'
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

  useEffect(() => {
    // Connect to websocket with withCredentials enabled to forward cookies
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to resolution socket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Connection authorization error: Login required or socket server offline');
      setIsConnected(false);
    });

    // Real-time Event Subscriptions
    socketInstance.on('analysis_started', (data) => {
      setProgressState('started');
      setProgressMessage(data.message);
    });

    socketInstance.on('parsing', (data) => {
      setProgressState('parsing');
      setProgressMessage(data.message);
    });

    socketInstance.on('ai_processing', (data) => {
      setProgressState('ai_processing');
      setProgressMessage(data.message);
    });

    socketInstance.on('risk_check', (data) => {
      setProgressState('risk_check');
      setProgressMessage(data.message);
    });

    socketInstance.on('result_ready', (data) => {
      setProgressState('ready');
      setProgressMessage('Merge conflict resolved successfully!');
      setResult(data.analysis);
    });

    socketInstance.on('error', (data) => {
      setProgressState('error');
      setProgressMessage('');
      setError(data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [socketUrl]);

  const sendConflict = useCallback((baseCode, branchA, branchB) => {
    if (!socket || !isConnected) {
      setError('Cannot resolve conflict: Socket connection offline');
      return;
    }
    setError(null);
    setResult(null);
    setProgressState('started');
    setProgressMessage('Sending conflict resolution request...');
    socket.emit('send_conflict', { baseCode, branchA, branchB });
  }, [socket, isConnected]);

  const resetProgress = useCallback(() => {
    setProgressState(null);
    setProgressMessage('');
    setResult(null);
    setError(null);
  }, []);

  return {
    isConnected,
    progressState,
    progressMessage,
    result,
    error,
    sendConflict,
    resetProgress,
  };
};
