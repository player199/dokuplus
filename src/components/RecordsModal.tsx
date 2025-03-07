import React from 'react';
import './RecordsModal.css';

export interface GameRecord {
  id: string;
  completedAt: string;
  elapsedTime: number;
}

interface RecordsModalProps {
  records: GameRecord[];
  isOpen: boolean;
  onClose: () => void;
}

const RecordsModal: React.FC<RecordsModalProps> = ({ records, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Format time in seconds to a readable format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const formattedHours = hours > 0 ? `${hours}h ` : '';
    const formattedMinutes = minutes > 0 ? `${minutes}m ` : '';
    const formattedSeconds = `${secs}s`;
    
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  // Format date into readable format
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="records-overlay">
      <div className="records-modal">
        <div className="records-header">
          <h2>Your Records</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="records-content">
          {records.length === 0 ? (
            <p className="no-records">No completed games yet. Finish a puzzle to set your first record!</p>
          ) : (
            <>
              <div className="records-summary">
                <div className="best-time">
                  <span className="label">Best Time:</span>
                  <span className="value">
                    {formatTime(Math.min(...records.map(r => r.elapsedTime)))}
                  </span>
                </div>
                <div className="total-games">
                  <span className="label">Games Completed:</span>
                  <span className="value">{records.length}</span>
                </div>
              </div>
              
              <div className="records-list">
                <div className="records-list-header">
                  <span className="date-header">Date</span>
                  <span className="time-header">Time</span>
                </div>
                {records
                  .sort((a, b) => a.elapsedTime - b.elapsedTime)
                  .map(record => (
                    <div key={record.id} className="record-item">
                      <span className="record-date">{formatDate(record.completedAt)}</span>
                      <span className="record-time">{formatTime(record.elapsedTime)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsModal; 