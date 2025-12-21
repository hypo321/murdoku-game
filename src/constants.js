/**
 * Constants for Murdoku game
 * @fileoverview Central location for magic strings and numbers
 */

// ============================================================================
// Cell Key Constants
// ============================================================================

/**
 * Separator used in cell keys (e.g., "3-5" for row 3, col 5)
 */
export const CELL_KEY_SEPARATOR = '-';

/**
 * Creates a cell key from row and column indices.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string} Cell key in format "row-col"
 */
export function createCellKey(row, col) {
  return `${row}${CELL_KEY_SEPARATOR}${col}`;
}

/**
 * Parses a cell key into row and column indices.
 * @param {string} cellKey - Cell key in format "row-col"
 * @returns {{ row: number, col: number }} Parsed position
 */
export function parseCellKey(cellKey) {
  const [row, col] = cellKey.split(CELL_KEY_SEPARATOR).map(Number);
  return { row, col };
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default cell size in pixels
 */
export const DEFAULT_CELL_SIZE = 50;

/**
 * Default grid size (9x9)
 */
export const DEFAULT_GRID_SIZE = 9;

// ============================================================================
// UI Messages
// ============================================================================

export const MESSAGES = {
  INITIAL: 'Select a suspect, then click a cell to place them.',
  UNDO_SUCCESS: 'Undo successful.',
  UNDO_EMPTY: 'Nothing to undo.',
  GAME_RESET: 'Game reset! Select a suspect to begin.',
  MARKS_CLEARED: 'All marks cleared.',
  SUSPECT_DESELECTED: 'Suspect deselected.',
  ALL_PLACED:
    '🎉 All suspects are placed! Try checking your solution.',
  PUZZLE_SOLVED:
    '🎉 Congratulations! All suspects are correctly placed! You solved the Murdoku!',
};

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  UNDO: 'z',
};

// ============================================================================
// CSS Classes (commonly used)
// ============================================================================

export const CSS_CLASSES = {
  HIGHLIGHT_ERROR: 'border-4 border-orange-500 bg-orange-500/30',
  HIGHLIGHT_HINT: 'border-4 border-green-400 bg-green-400/30',
  HIGHLIGHT_SELECTED:
    'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800',
};
