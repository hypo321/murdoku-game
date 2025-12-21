# Murdoku Game Documentation

Murdoku is a logic puzzle game inspired by Sudoku, where players must deduce the correct positions of suspects on a game board using clues. Each suspect has a unique clue that helps narrow down their location, and players must use logical reasoning to solve the mystery.

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [How to Play](#how-to-play)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Puzzle System](#puzzle-system)
6. [Hint System](#hint-system)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Suggestions for Improvement](#suggestions-for-improvement)

---

## Game Overview

### Concept

Murdoku combines elements of:
- **Sudoku**: Each row and column can only contain one suspect
- **Logic puzzles**: Clues about rooms, cell types, and relationships between suspects
- **Mystery games**: A victim and a murderer to identify

### Objective

Place all suspects on the board in their correct positions by:
1. Reading each suspect's clue
2. Using logical deduction to eliminate impossible positions
3. Identifying the murderer (the person alone with the victim)

---

## How to Play

### Basic Controls

| Action | Control |
|--------|---------|
| Place suspect | Select suspect → Click cell |
| Mark cell with X | Click empty cell (no suspect selected) OR Right-click |
| Remove suspect | Select placed suspect → Click their cell |
| Move suspect | Select placed suspect → Click new cell |
| Swap suspects | Select suspect → Click cell with another suspect |
| Undo | Ctrl/Cmd + Z or Undo button |
| Get hint | Click "Get Hint" button |

### Game Rules

1. **One suspect per row**: No two suspects can share the same row
2. **One suspect per column**: No two suspects can share the same column
3. **Clue constraints**: Each suspect must be placed according to their clue
4. **Cell types**: Suspects can only be placed on "occupiable" cell types

### Occupiable Cell Types

- `empty` - Empty floor space
- `carpet` - Carpeted area
- `chair` - Chairs (suspects can sit)
- `pondWater` - Water in ponds
- `horse` - Horse cells (for horse-track puzzle)

### Non-Occupiable Cell Types

- `shelf`, `table`, `tv`, `bed`, `couch` - Furniture
- `tree`, `bush`, `flowers`, `plant` - Vegetation
- `lilyPad`, `track` - Special terrain

---

## Project Structure

```
murdoku-game/
├── src/
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── index.css               # Global styles (Tailwind)
│   ├── main.jsx                # React entry point
│   ├── types.js                # JSDoc type definitions
│   ├── constants.js             # Magic strings and numbers
│   ├── components/
│   │   ├── Cell.jsx            # Individual board cell
│   │   ├── GameBoard.jsx       # Game board grid
│   │   └── SuspectCard.jsx     # Suspect info card
│   ├── data/
│   │   ├── gameData.js         # Cell types & occupiable types
│   │   ├── backyard-garden.jpg # Puzzle background image
│   │   ├── horse-track-hard.jpg
│   │   └── puzzles/
│   │       ├── index.js              # Puzzle registry
│   │       ├── backyard-garden-easy.js
│   │       └── horse-track-hard.js
│   ├── hooks/
│   │   ├── index.js            # Hook exports
│   │   ├── useGameState.js     # Game state management hook
│   │   ├── useHints.js         # Hint generation hook
│   │   └── useValidation.js    # Validation hook
│   └── utils/
│       ├── hintGenerator.js    # Hint system logic
│       └── validation.js       # State validation utilities
├── public/
├── package.json
└── DOCUMENTATION.md
```

---

## Core Concepts

### Cell Keys

Cells are identified by a string key in the format `"row-col"`:
```javascript
const cellKey = `${row}-${col}`;  // e.g., "3-5"
```

### State Objects

**Placements** - Maps cell keys to suspect IDs:
```javascript
{
  "3-5": "aaron",
  "7-2": "bruce"
}
```

**MarkedCells** - Maps cell keys to boolean (X marks):
```javascript
{
  "0-0": true,
  "1-3": true
}
```

### Automatic X Marking

When a suspect is placed, the game automatically marks X on all other cells in that row and column (excluding cells with existing placements). This enforces the Sudoku-like constraint.

```javascript
function addCrossesToRowAndColumn(row, col, currentMarks) {
  const newMarks = { ...currentMarks };
  // Mark all cells in the row (except the placement cell)
  for (let c = 0; c < gridSize; c++) {
    if (c !== col && !placements[`${row}-${c}`]) {
      newMarks[`${row}-${c}`] = true;
    }
  }
  // Mark all cells in the column (except the placement cell)
  for (let r = 0; r < gridSize; r++) {
    if (r !== row && !placements[`${r}-${col}`]) {
      newMarks[`${r}-${col}`] = true;
    }
  }
  return newMarks;
}
```

---

## Puzzle System

### Puzzle Definition Structure

Each puzzle is defined as a JavaScript object with the following properties:

```javascript
const puzzle = {
  // Metadata
  id: 'puzzle-id',              // Unique identifier
  name: 'Puzzle Name',          // Display name
  subtitle: 'The Mystery',      // Subtitle
  difficulty: 'Easy',           // Difficulty level

  // Board configuration
  gridSize: 9,                  // Grid dimensions (9x9)
  cellSize: 50,                 // Cell size in pixels
  imageBorder: {                // Border offsets for background image
    top: 26,
    right: 20,
    bottom: 20,
    left: 18
  },
  backgroundImage: image,       // Imported background image

  // Room definitions
  rooms: {
    roomId: {
      name: 'Room Name',
      color: '#hexcolor'
    },
    // ... more rooms
  },

  // Suspect definitions
  suspects: [
    {
      id: 'suspect-id',
      name: 'Suspect Name',
      color: '#hexcolor',
      clue: 'Their clue text.',
      avatar: '👨',             // Emoji avatar
      isVictim: false           // Optional: true for the victim
    },
    // ... more suspects
  ],

  // Board layout (2D array)
  boardLayout: [
    // Row 0
    [
      { room: 'roomId', type: cellTypes.EMPTY },
      { room: 'roomId', type: cellTypes.TREE },
      // ... more cells
    ],
    // ... more rows
  ],

  // Solution (correct positions)
  solution: {
    'suspect-id': { row: 3, col: 5 },
    // ... more positions
  }
};
```

### Adding a New Puzzle

1. **Create the puzzle file** in `src/data/puzzles/`:
   ```javascript
   // src/data/puzzles/my-new-puzzle.js
   import backgroundImage from '../my-background.jpg';
   import { cellTypes } from '../gameData';

   const puzzle = {
     // ... puzzle definition
   };

   export default puzzle;
   ```

2. **Add the background image** to `src/data/`

3. **Register the puzzle** in `src/data/puzzles/index.js`:
   ```javascript
   import myNewPuzzle from './my-new-puzzle';

   export const puzzles = {
     // ... existing puzzles
     'my-new-puzzle': myNewPuzzle,
   };
   ```

4. **Create hint logic** (optional) in `src/utils/hintGenerator.js`

### Current Puzzles

| Puzzle ID | Name | Grid | Suspects | Difficulty |
|-----------|------|------|----------|------------|
| `backyard-garden-easy` | Backyard Garden | 9x9 | 9 | Easy |
| `horse-track-hard` | Horse Track | 12x12 | 12 | Hard |

---

## Hint System

The hint system provides contextual guidance based on the current game state.

### Architecture

The hint system is located in `src/utils/hintGenerator.js` and exports:

```javascript
export function generateHint(puzzle, placements, markedCells) {
  return {
    message: 'Hint message to display',
    highlightCells: [{ row, col, cell }],  // Cells to highlight
    suspect: 'suspect-id',                  // Suspect related to hint
    action: 'mark' | undefined              // 'mark' for X marking hints
  };
}
```

### Validation Before Hints

Before providing a hint, the system validates the current state:

1. **Wrong placements**: Checks if any placed suspects are in incorrect positions
2. **Wrong X marks**: Checks if any X marks are on cells that should have suspects

If validation fails, an error is shown instead of a hint.

### Hint Priority Order (backyard-garden-easy)

The hint system follows a specific solving order:

| Step | Suspect | Logic |
|------|---------|-------|
| 1 | **Elyse** | Only chair in Living Room |
| 2 | **Aaron** | Must be in Living Room with Elyse |
| 3 | **Franklin** | Only carpet cell remaining |
| 4 | **Bruce** | Shed cells in same row → mark X on other row cells |
| 5 | **Denise** | Bedroom or Sunroom (Sunroom blocked → Bedroom) |
| 4b | **Bruce** | Now only 1 Shed cell remains |
| 6 | **Carissa** | Only cell adjacent to tree |
| 7 | **Holden** | Must be alone → Pond (can't be Garden/Backyard) |
| 8 | **Gilbert** | Only remaining Garden cell |
| 9 | **Violet** | Final cell + identify murderer |

### Helper Functions

```javascript
// Get all cells in a room
getCellsInRoom(boardLayout, roomName)

// Get occupiable cells in a room
getOccupiableCellsInRoom(boardLayout, roomName)

// Get cells of a specific type
getCellsOfType(boardLayout, cellType)

// Get cells adjacent to a type (same room only)
getCellsAdjacentToType(boardLayout, cellType)

// Check if a cell is available (not blocked)
isCellAvailable(row, col, placements, markedCells)

// Filter to only available cells
filterAvailableCells(cells, placements, markedCells)

// Check if suspect is placed
isSuspectPlaced(suspectId, placements)

// Get cells to mark as X in a row (for constrained placement hints)
getCellsToMarkInRow(boardLayout, targetCells, targetRoom, placements, markedCells)
```

### Visual Feedback

- **Green highlight**: Cells suggested by hints
- **Orange highlight**: Cells with errors (wrong X marks)
- **Auto-select**: When a placement hint is shown, the suspect is automatically selected

---

## State Management

The game uses React's `useState` for state management:

```javascript
// Current puzzle
const [currentPuzzleId, setCurrentPuzzleId] = useState(defaultPuzzleId);

// Game state
const [placements, setPlacements] = useState({});      // Suspect positions
const [markedCells, setMarkedCells] = useState({});   // X marks
const [selectedSuspect, setSelectedSuspect] = useState(null);
const [selectedCell, setSelectedCell] = useState(null);

// UI state
const [message, setMessage] = useState('...');        // Status message
const [history, setHistory] = useState([]);           // Undo history
const [errorCells, setErrorCells] = useState({});     // Error highlights
const [hintCells, setHintCells] = useState({});       // Hint highlights
```

### Undo System

The undo system stores snapshots of `placements` and `markedCells`:

```javascript
function saveToHistory() {
  setHistory((prev) => [
    ...prev,
    {
      placements: { ...placements },
      markedCells: { ...markedCells },
    },
  ]);
}
```

Undo is triggered by `Ctrl/Cmd + Z` or the Undo button.

---

## Component Architecture

### App.jsx

The main component that manages:
- Game state (placements, marks, selection)
- Event handlers (cell clicks, suspect selection)
- Validation and hint generation
- UI layout and controls

### GameBoard.jsx

Renders the game board with:
- Background image positioning
- CSS Grid for cell layout
- Cell component mapping

**Props:**
```javascript
{
  puzzle,           // Puzzle data
  markedCells,      // X mark state
  selectedCell,     // Currently selected cell
  onCellClick,      // Left-click handler
  onCellRightClick, // Right-click handler
  getSuspectAt,     // Function to get suspect at position
  errorCells,       // Error highlight state
  hintCells         // Hint highlight state
}
```

### Cell.jsx

Renders individual cells with:
- Suspect avatars
- X marks
- Selection, error, and hint highlights
- Tooltips

**Props:**
```javascript
{
  cell,             // Cell data { room, type }
  row, col,         // Position
  suspect,          // Suspect object or null
  isMarked,         // Has X mark
  isSelected,       // Is selected
  isError,          // Has error highlight
  isHint,           // Has hint highlight
  onCellClick,      // Click handler
  onCellRightClick, // Right-click handler
  rooms,            // Room definitions
  cellSize          // Cell dimensions
}
```

### SuspectCard.jsx

Renders suspect information cards with:
- Avatar and name
- Clue text
- Selection state
- Placed indicator

**Props:**
```javascript
{
  suspect,          // Suspect object
  isSelected,       // Is currently selected
  isPlaced,         // Is placed on board
  onClick           // Click handler
}
```

---

## Suggestions for Improvement

### Code Quality

1. ~~**Extract validation logic**~~: ✅ Moved to `src/utils/validation.js` with `validateCurrentState()`, `hasErrors()`, and `checkSolution()` functions.

2. ~~**Type definitions**~~: ✅ Added JSDoc type definitions in `src/types.js` for:
   - Cell types (`Cell`, `CellPosition`, `CellWithPosition`, `CellType`)
   - Room types (`Room`, `RoomMap`)
   - Suspect types (`Suspect`)
   - Puzzle types (`Puzzle`, `ImageBorder`, `Solution`)
   - State types (`Placements`, `MarkedCells`, `HighlightedCells`, `HistoryEntry`, `GameState`)
   - Validation types (`ValidationErrors`, `WrongPlacement`)
   - Hint types (`Hint`)
   - Component props (`CellProps`, `GameBoardProps`, `SuspectCardProps`)

3. ~~**Custom hooks**~~: ✅ Extracted game logic into custom hooks in `src/hooks/`:
   ```javascript
   useGameState(puzzle)      // Placements, marks, history, selection, actions
   useHints(puzzle)          // Hint generation, error/hint cell highlighting
   useValidation(puzzle)     // State validation against solution
   ```

4. ~~**Constants file**~~: ✅ Created `src/constants.js` with:
   - Cell key utilities (`CELL_KEY_SEPARATOR`, `createCellKey()`, `parseCellKey()`)
   - Default values (`DEFAULT_CELL_SIZE`, `DEFAULT_GRID_SIZE`)
   - UI messages (`MESSAGES` object)
   - Keyboard shortcuts (`KEYBOARD_SHORTCUTS`)
   - CSS classes (`CSS_CLASSES`)

### Features

1. **Puzzle-specific hint generators**: Create separate hint files for each puzzle:
   ```
   utils/hints/
   ├── index.js
   ├── backyard-garden-easy.js
   └── horse-track-hard.js
   ```

2. **Difficulty progression**: Track solved puzzles and unlock harder ones.

3. **Timer and scoring**: Add a timer and scoring system based on:
   - Time taken
   - Number of hints used
   - Number of incorrect placements

4. **Save/Load**: Persist game state to localStorage:
   ```javascript
   // Save progress
   localStorage.setItem('murdoku-state', JSON.stringify({
     puzzleId,
     placements,
     markedCells
   }));
   ```

5. **Tutorial mode**: Interactive tutorial for first-time players.

6. **Puzzle editor**: Allow users to create custom puzzles.

### Performance

1. **Memoization**: Use `useMemo` for expensive calculations:
   ```javascript
   const availableCells = useMemo(() =>
     filterAvailableCells(cells, placements, markedCells),
     [cells, placements, markedCells]
   );
   ```

2. **Component optimization**: Use `React.memo` for Cell and SuspectCard:
   ```javascript
   export default React.memo(Cell);
   ```

### Accessibility

1. **Keyboard navigation**: Add keyboard controls for cell selection.

2. **Screen reader support**: Add ARIA labels and roles.

3. **Color contrast**: Ensure sufficient contrast for colorblind users.

4. **Focus indicators**: Clear focus states for keyboard users.

### Testing

1. **Unit tests**: Test hint generation logic, validation, and helper functions.

2. **Integration tests**: Test user interactions and game flow.

3. **Puzzle validation**: Automated tests to verify puzzle solutions are valid.

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **ESLint** - Code linting

---

## License

This project is for educational and entertainment purposes.

---

*Documentation last updated: December 21, 2024*
