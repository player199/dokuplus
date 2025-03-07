import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

interface TimerProps {
  isRunning: boolean;
  isComplete: boolean;
  onTimeUpdate: (elapsedTime: number) => void;
  initialTime?: number;
}

const Timer: React.FC<TimerProps> = ({ 
  isRunning, 
  isComplete,
  onTimeUpdate,
  initialTime = 0 
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(initialTime);
  const firstRenderRef = useRef(true);
  const previousRunningStateRef = useRef(isRunning);

  // Reset the timer when initialTime changes to 0
  useEffect(() => {
    // Skip first render to avoid unwanted resets
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    
    // Only reset if initialTime is 0 (new game)
    if (initialTime === 0) {
      setElapsedTime(0);
    }
  }, [initialTime]);

  // Stop the timer when game is complete
  useEffect(() => {
    if (isComplete) {
      // Ensure we stop the timer when game is complete
      onTimeUpdate(elapsedTime); // Make sure the final time is captured
    }
  }, [isComplete, elapsedTime, onTimeUpdate]);

  // Timer logic
  useEffect(() => {
    let timer: number | null = null;
    
    // If isRunning changed from false to true, save the previous state
    if (isRunning !== previousRunningStateRef.current) {
      previousRunningStateRef.current = isRunning;
    }
    
    if (isRunning && !isComplete) {
      timer = window.setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer !== null) {
        window.clearInterval(timer);
      }
    };
  }, [isRunning, isComplete, onTimeUpdate]);
  
  // Format the time into HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}:` : `${minutes}:`;
    const formattedSeconds = secs < 10 ? `0${secs}` : `${secs}`;
    
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  return (
    <div className="timer">
      <div className="timer-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <span className="timer-text">{formatTime(elapsedTime)}</span>
    </div>
  );
};

export default Timer; 