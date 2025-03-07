# Cosmic Sudoku

A space-themed Sudoku game built with React and TypeScript.

## Features

- Classic Sudoku gameplay with a cosmic space theme
- Clean, responsive UI design
- Notes and candidates system for solving strategies
- Automated candidates feature
- Keyboard navigation support
- Conflict detection
- Game completion detection and celebration

## Technologies Used

- React
- TypeScript
- CSS
- Vite

## Project Structure

```
src/
├── components/       # UI components
│   ├── Game.tsx         # Main game component
│   ├── SudokuBoard.tsx  # Board component
│   ├── SudokuCell.tsx   # Cell component
│   ├── NumberPad.tsx    # Number input component
│   └── *.css            # Component styles
├── hooks/            # Custom React hooks
│   └── useSudokuGame.ts # Game logic and state management
├── utils/            # Utility functions
│   └── sudokuUtils.ts   # Sudoku-specific functions
├── assets/           # Static assets
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

## Game Instructions

1. Click on a cell to select it
2. Click a number in the number pad or press a number key (1-9) to enter a number
3. Use the "Notes" mode to mark potential numbers in cells
4. Use "Candidates" to automatically calculate and fill in all possible candidates
5. Use arrow keys for keyboard navigation
6. Press Delete or Backspace to clear a cell

## License

This project is licensed under the MIT License - see the LICENSE file for details.
