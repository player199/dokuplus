import { GameRecord } from '../components/RecordsModal';

const RECORDS_STORAGE_KEY = 'dokuplus_game_records';

// Get all game records from localStorage
export const getGameRecords = (): GameRecord[] => {
  try {
    const storedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!storedRecords) return [];
    
    return JSON.parse(storedRecords) as GameRecord[];
  } catch (error) {
    console.error('Error retrieving game records from localStorage:', error);
    return [];
  }
};

// Save a new game record to localStorage
export const saveGameRecord = (elapsedTime: number): GameRecord => {
  try {
    const records = getGameRecords();
    
    // Create a new record object
    const newRecord: GameRecord = {
      id: generateRecordId(),
      completedAt: new Date().toISOString(),
      elapsedTime,
    };
    
    // Add the new record to the list
    records.push(newRecord);
    
    // Save back to localStorage
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    
    return newRecord;
  } catch (error) {
    console.error('Error saving game record to localStorage:', error);
    throw error;
  }
};

// Clear all game records (mainly for testing)
export const clearGameRecords = (): void => {
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game records from localStorage:', error);
  }
};

// Generate a unique ID for records
const generateRecordId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 