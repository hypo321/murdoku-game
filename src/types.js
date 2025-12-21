/**
 * JSDoc Type Definitions for Murdoku Game
 * @fileoverview Central type definitions for puzzle structure, state objects, and component props
 */

// ============================================================================
// Cell Types
// ============================================================================

/**
 * @typedef {'empty' | 'carpet' | 'chair' | 'tv' | 'shelf' | 'table' | 'flowers' | 'lilyPad' | 'tree' | 'bush' | 'bed' | 'couch' | 'pondWater' | 'horse' | 'plant' | 'track'} CellType
 */

/**
 * @typedef {Object} Cell
 * @property {string} room - The room identifier this cell belongs to
 * @property {CellType} type - The type of cell
 */

/**
 * @typedef {Object} CellPosition
 * @property {number} row - Row index (0-indexed)
 * @property {number} col - Column index (0-indexed)
 */

/**
 * @typedef {Object} CellWithPosition
 * @property {number} row - Row index
 * @property {number} col - Column index
 * @property {Cell} cell - The cell data
 */

// ============================================================================
// Room Types
// ============================================================================

/**
 * @typedef {Object} Room
 * @property {string} name - Display name of the room
 * @property {string} color - Hex color code for the room
 */

/**
 * @typedef {Object.<string, Room>} RoomMap
 */

// ============================================================================
// Suspect Types
// ============================================================================

/**
 * @typedef {Object} Suspect
 * @property {string} id - Unique identifier for the suspect
 * @property {string} name - Display name
 * @property {string} color - Hex color code
 * @property {string} clue - The clue text for this suspect
 * @property {string} avatar - Emoji avatar
 * @property {boolean} [isVictim] - Whether this suspect is the victim
 */

// ============================================================================
// Puzzle Types
// ============================================================================

/**
 * @typedef {Object} ImageBorder
 * @property {number} top - Top border offset in pixels
 * @property {number} right - Right border offset in pixels
 * @property {number} bottom - Bottom border offset in pixels
 * @property {number} left - Left border offset in pixels
 */

/**
 * @typedef {Object.<string, CellPosition>} Solution
 */

/**
 * @typedef {Object} Puzzle
 * @property {string} id - Unique puzzle identifier
 * @property {string} name - Display name
 * @property {string} subtitle - Puzzle subtitle
 * @property {string} difficulty - Difficulty level (e.g., 'Easy', 'Hard')
 * @property {number} gridSize - Grid dimensions (e.g., 9 for 9x9)
 * @property {number} cellSize - Cell size in pixels
 * @property {ImageBorder} imageBorder - Border offsets for background image
 * @property {string} backgroundImage - Path to background image
 * @property {RoomMap} rooms - Room definitions
 * @property {Suspect[]} suspects - Array of suspects
 * @property {Cell[][]} boardLayout - 2D array of cells
 * @property {Solution} solution - Correct positions for each suspect
 */

// ============================================================================
// State Types
// ============================================================================

/**
 * Cell key format: "row-col" (e.g., "3-5")
 * @typedef {string} CellKey
 */

/**
 * Maps cell keys to suspect IDs
 * @typedef {Object.<CellKey, string>} Placements
 */

/**
 * Maps cell keys to boolean (X marks)
 * @typedef {Object.<CellKey, boolean>} MarkedCells
 */

/**
 * Maps cell keys to boolean for highlighting
 * @typedef {Object.<CellKey, boolean>} HighlightedCells
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {Placements} placements - Snapshot of placements
 * @property {MarkedCells} markedCells - Snapshot of marked cells
 */

/**
 * @typedef {Object} GameState
 * @property {Placements} placements - Current suspect placements
 * @property {MarkedCells} markedCells - Current X marks
 * @property {Suspect|null} selectedSuspect - Currently selected suspect
 * @property {CellPosition|null} selectedCell - Currently selected cell
 * @property {HistoryEntry[]} history - Undo history stack
 */

// ============================================================================
// Validation Types
// ============================================================================

/**
 * @typedef {Object} WrongPlacement
 * @property {Suspect} suspect - The wrongly placed suspect
 * @property {CellPosition} currentPos - Current position
 * @property {CellPosition} correctPos - Correct position
 */

/**
 * @typedef {Object} ValidationErrors
 * @property {WrongPlacement[]} wrongPlacements - Suspects in wrong positions
 * @property {CellPosition[]} wrongMarks - X marks on cells that should have suspects
 */

// ============================================================================
// Hint Types
// ============================================================================

/**
 * @typedef {Object} Hint
 * @property {string} message - Hint message to display
 * @property {CellWithPosition[]} highlightCells - Cells to highlight
 * @property {string} [suspect] - Suspect ID related to hint
 * @property {'mark' | undefined} [action] - Action type ('mark' for X marking hints)
 */

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * @typedef {Object} CellProps
 * @property {Cell} cell - Cell data
 * @property {number} row - Row index
 * @property {number} col - Column index
 * @property {Suspect|null} suspect - Suspect at this cell or null
 * @property {boolean} isMarked - Whether cell has X mark
 * @property {boolean} isSelected - Whether cell is selected
 * @property {boolean} isError - Whether cell has error highlight
 * @property {boolean} isHint - Whether cell has hint highlight
 * @property {function(number, number): void} onCellClick - Left click handler
 * @property {function(number, number): void} onCellRightClick - Right click handler
 * @property {RoomMap} rooms - Room definitions
 * @property {number} cellSize - Cell size in pixels
 */

/**
 * @typedef {Object} GameBoardProps
 * @property {Puzzle} puzzle - Puzzle data
 * @property {MarkedCells} markedCells - X mark state
 * @property {CellPosition|null} selectedCell - Currently selected cell
 * @property {function(number, number): void} onCellClick - Left click handler
 * @property {function(number, number): void} onCellRightClick - Right click handler
 * @property {function(number, number): Suspect|null} getSuspectAt - Function to get suspect at position
 * @property {HighlightedCells} [errorCells] - Error highlight state
 * @property {HighlightedCells} [hintCells] - Hint highlight state
 */

/**
 * @typedef {Object} SuspectCardProps
 * @property {Suspect} suspect - Suspect data
 * @property {boolean} isSelected - Whether suspect is selected
 * @property {boolean} isPlaced - Whether suspect is placed on board
 * @property {function(Suspect): void} onClick - Click handler
 */

export {};
