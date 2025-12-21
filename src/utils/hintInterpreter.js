/**
 * Generic hint interpreter for Murdoku puzzles.
 * Interprets hint data stored alongside puzzle definitions.
 * @fileoverview Provides functions to evaluate hint conditions and generate messages.
 */

import { occupiableTypes } from '../data/gameData';
import { createCellKey, parseCellKey } from '../constants';

/**
 * @typedef {Object} HintTarget
 * @property {'cellType'|'room'|'rooms'|'adjacentTo'|'any'} type - The type of target criteria
 * @property {string} [cellType] - Cell type to match (for 'cellType' and 'adjacentTo')
 * @property {string} [room] - Room to filter by (optional for 'cellType', required for 'room')
 * @property {string[]} [rooms] - Multiple rooms (for 'rooms' type)
 */

/**
 * @typedef {Object} HintStep
 * @property {string} suspect - The suspect ID this hint is for
 * @property {number} order - The order in which hints should be evaluated
 * @property {string[]} prerequisites - Suspect IDs that must be placed before this hint activates
 * @property {HintTarget} target - Criteria for finding target cells
 * @property {Object} messages - Hint messages
 * @property {string} messages.single - Message when exactly one cell matches
 * @property {string} messages.multiple - Message when multiple cells match
 * @property {string} [messages.roomBlocked] - Optional message when one room option is blocked
 * @property {Object} [markingHint] - Optional hint for marking X's instead of placing
 * @property {string} [markingHint.condition] - Condition for showing marking hint ('sameRow'|'sameCol')
 * @property {string} markingHint.message - Message for marking hint
 */

/**
 * Gets all cells of a specific type from the board.
 * @param {Array} boardLayout - The board layout
 * @param {string} cellType - The cell type to find
 * @returns {Array} Array of {row, col, cell} objects
 */
function getCellsOfType(boardLayout, cellType) {
  const cells = [];
  boardLayout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.type === cellType) {
        cells.push({ row: rowIndex, col: colIndex, cell });
      }
    });
  });
  return cells;
}

/**
 * Gets all occupiable cells in a specific room.
 * @param {Array} boardLayout - The board layout
 * @param {string} roomName - The room name
 * @returns {Array} Array of {row, col, cell} objects
 */
function getOccupiableCellsInRoom(boardLayout, roomName) {
  const cells = [];
  boardLayout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (
        cell.room === roomName &&
        occupiableTypes.includes(cell.type)
      ) {
        cells.push({ row: rowIndex, col: colIndex, cell });
      }
    });
  });
  return cells;
}

/**
 * Gets cells adjacent to a specific cell type (same room only).
 * @param {Array} boardLayout - The board layout
 * @param {string} cellType - The cell type to be adjacent to
 * @returns {Array} Array of {row, col, cell} objects
 */
function getCellsAdjacentToType(boardLayout, cellType) {
  const typeCells = getCellsOfType(boardLayout, cellType);
  const adjacentCells = [];
  const gridSize = boardLayout.length;
  const seen = new Set();

  for (const typeCell of typeCells) {
    const { row, col } = typeCell;
    const typeRoom = boardLayout[row][col].room;
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = createCellKey(newRow, newCol);

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < boardLayout[0].length &&
        !seen.has(key)
      ) {
        const adjCell = boardLayout[newRow][newCol];
        if (
          adjCell.room === typeRoom &&
          occupiableTypes.includes(adjCell.type)
        ) {
          adjacentCells.push({
            row: newRow,
            col: newCol,
            cell: adjCell,
          });
          seen.add(key);
        }
      }
    }
  }

  return adjacentCells;
}

/**
 * Gets all occupiable cells on the board.
 * @param {Array} boardLayout - The board layout
 * @returns {Array} Array of {row, col, cell} objects
 */
function getAllOccupiableCells(boardLayout) {
  const cells = [];
  boardLayout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (occupiableTypes.includes(cell.type)) {
        cells.push({ row: rowIndex, col: colIndex, cell });
      }
    });
  });
  return cells;
}

/**
 * Checks if a cell is available (not placed, not blocked by row/col).
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {Object} placements - Current placements
 * @param {Object} markedCells - Current marked cells
 * @returns {boolean} Whether the cell is available
 */
function isCellAvailable(row, col, placements, markedCells) {
  const key = createCellKey(row, col);
  if (placements[key]) return false;
  if (markedCells[key]) return false;

  for (const [placedKey] of Object.entries(placements)) {
    const pos = parseCellKey(placedKey);
    if (pos.row === row || pos.col === col) return false;
  }

  return true;
}

/**
 * Filters cells to only available ones.
 * @param {Array} cells - Array of {row, col, cell} objects
 * @param {Object} placements - Current placements
 * @param {Object} markedCells - Current marked cells
 * @returns {Array} Filtered array of available cells
 */
function filterAvailableCells(cells, placements, markedCells) {
  return cells.filter(({ row, col }) =>
    isCellAvailable(row, col, placements, markedCells)
  );
}

/**
 * Checks if a suspect is placed.
 * @param {string} suspectId - The suspect ID
 * @param {Object} placements - Current placements
 * @returns {boolean} Whether the suspect is placed
 */
function isSuspectPlaced(suspectId, placements) {
  return Object.values(placements).includes(suspectId);
}

/**
 * Gets target cells based on hint target criteria.
 * @param {HintTarget} target - The target criteria
 * @param {Array} boardLayout - The board layout
 * @returns {Array} Array of {row, col, cell} objects
 */
function getTargetCells(target, boardLayout) {
  switch (target.type) {
    case 'cellType': {
      let cells = getCellsOfType(boardLayout, target.cellType);
      if (target.room) {
        cells = cells.filter(
          ({ row, col }) => boardLayout[row][col].room === target.room
        );
      }
      return cells;
    }
    case 'room':
      return getOccupiableCellsInRoom(boardLayout, target.room);
    case 'rooms': {
      const allCells = [];
      for (const room of target.rooms) {
        allCells.push(...getOccupiableCellsInRoom(boardLayout, room));
      }
      return allCells;
    }
    case 'adjacentTo':
      return getCellsAdjacentToType(boardLayout, target.cellType);
    case 'any':
      return getAllOccupiableCells(boardLayout);
    default:
      return [];
  }
}

/**
 * Gets cells to mark as X in the same row(s) as target cells.
 * @param {Array} boardLayout - The board layout
 * @param {Array} targetCells - The target cells
 * @param {string} targetRoom - The room to exclude
 * @param {Object} placements - Current placements
 * @param {Object} markedCells - Current marked cells
 * @returns {Array} Cells that can be marked
 */
function getCellsToMarkInRow(
  boardLayout,
  targetCells,
  targetRoom,
  placements,
  markedCells
) {
  const cellsToMark = [];
  const rows = [...new Set(targetCells.map((c) => c.row))];

  for (const row of rows) {
    for (let col = 0; col < boardLayout[row].length; col++) {
      const cell = boardLayout[row][col];
      const key = createCellKey(row, col);

      if (
        cell.room !== targetRoom &&
        occupiableTypes.includes(cell.type) &&
        !placements[key] &&
        !markedCells[key]
      ) {
        cellsToMark.push({ row, col, cell });
      }
    }
  }
  return cellsToMark;
}

/**
 * Gets cells to mark as X in the same column(s) as target cells.
 * @param {Array} boardLayout - The board layout
 * @param {Array} targetCells - The target cells
 * @param {string} targetRoom - The room to exclude
 * @param {Object} placements - Current placements
 * @param {Object} markedCells - Current marked cells
 * @returns {Array} Cells that can be marked
 */
function getCellsToMarkInCol(
  boardLayout,
  targetCells,
  targetRoom,
  placements,
  markedCells
) {
  const cellsToMark = [];
  const cols = [...new Set(targetCells.map((c) => c.col))];

  for (const col of cols) {
    for (let row = 0; row < boardLayout.length; row++) {
      const cell = boardLayout[row][col];
      const key = createCellKey(row, col);

      if (
        cell.room !== targetRoom &&
        occupiableTypes.includes(cell.type) &&
        !placements[key] &&
        !markedCells[key]
      ) {
        cellsToMark.push({ row, col, cell });
      }
    }
  }
  return cellsToMark;
}

/**
 * Generates a hint based on hint data and current game state.
 * @param {Object} puzzle - The puzzle object (must include hints array)
 * @param {Object} placements - Current placements
 * @param {Object} markedCells - Current marked cells
 * @returns {Object} Hint object with message, highlightCells, suspect, and optional action
 */
export function generateHint(puzzle, placements, markedCells) {
  const { suspects, boardLayout, hints } = puzzle;

  if (!hints || hints.length === 0) {
    return {
      message: '💡 No hints available for this puzzle.',
      highlightCells: [],
    };
  }

  // Find unplaced suspects
  const unplacedSuspects = suspects.filter(
    (s) => !isSuspectPlaced(s.id, placements)
  );

  if (unplacedSuspects.length === 0) {
    return {
      message:
        '🎉 All suspects are placed! Try checking your solution.',
      highlightCells: [],
    };
  }

  // Sort hints by order
  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  // Find the first applicable hint
  for (const hint of sortedHints) {
    // Skip if suspect is already placed
    if (isSuspectPlaced(hint.suspect, placements)) {
      continue;
    }

    // Check prerequisites
    const prerequisitesMet = hint.prerequisites.every((prereq) =>
      isSuspectPlaced(prereq, placements)
    );
    if (!prerequisitesMet) {
      continue;
    }

    // Get target cells
    const targetCells = getTargetCells(hint.target, boardLayout);
    const availableCells = filterAvailableCells(
      targetCells,
      placements,
      markedCells
    );

    // Handle marking hints (e.g., "mark X on same row" or "mark X on same col")
    let markingHintApplied = false;
    if (hint.markingHint && availableCells.length > 1) {
      const targetRoom =
        hint.target.room ||
        boardLayout[availableCells[0].row][availableCells[0].col]
          .room;

      if (hint.markingHint.condition === 'sameRow') {
        const rows = [...new Set(availableCells.map((c) => c.row))];
        if (rows.length === 1) {
          const cellsToMark = getCellsToMarkInRow(
            boardLayout,
            availableCells,
            targetRoom,
            placements,
            markedCells
          );
          if (cellsToMark.length > 0) {
            return {
              message: hint.markingHint.message,
              highlightCells: cellsToMark,
              suspect: hint.suspect,
              action: 'mark',
            };
          }
          markingHintApplied = true;
        }
      } else if (hint.markingHint.condition === 'sameCol') {
        const cols = [...new Set(availableCells.map((c) => c.col))];
        if (cols.length === 1) {
          const cellsToMark = getCellsToMarkInCol(
            boardLayout,
            availableCells,
            targetRoom,
            placements,
            markedCells
          );
          if (cellsToMark.length > 0) {
            return {
              message: hint.markingHint.message,
              highlightCells: cellsToMark,
              suspect: hint.suspect,
              action: 'mark',
            };
          }
          markingHintApplied = true;
        }
      }
    }

    // Skip to next hint if marking is exhausted and we have too many cells
    // This allows hints like "Bruce in shed" to fall through to "Denise" when
    // the row marking is done but there are still 2 cells available
    if (
      hint.skipIfMoreThan !== undefined &&
      availableCells.length > hint.skipIfMoreThan &&
      (markingHintApplied || !hint.markingHint)
    ) {
      continue;
    }

    // Handle special "rooms" type with roomBlocked message
    if (hint.target.type === 'rooms' && hint.messages.roomBlocked) {
      const roomAvailability = {};
      for (const room of hint.target.rooms) {
        const roomCells = getOccupiableCellsInRoom(boardLayout, room);
        const available = filterAvailableCells(
          roomCells,
          placements,
          markedCells
        );
        roomAvailability[room] = available;
      }

      // Check if only one room has available cells
      const roomsWithCells = Object.entries(roomAvailability).filter(
        ([, cells]) => cells.length > 0
      );
      if (roomsWithCells.length === 1) {
        const [availableRoom, cells] = roomsWithCells[0];
        const blockedRooms = hint.target.rooms.filter(
          (r) => r !== availableRoom
        );
        const message = hint.messages.roomBlocked
          .replace(
            '{availableRoom}',
            puzzle.rooms[availableRoom]?.name || availableRoom
          )
          .replace(
            '{blockedRooms}',
            blockedRooms
              .map((r) => puzzle.rooms[r]?.name || r)
              .join(', ')
          );
        return {
          message,
          highlightCells: cells,
          suspect: hint.suspect,
        };
      }
    }

    // Standard hint generation
    if (availableCells.length === 1) {
      return {
        message: hint.messages.single,
        highlightCells: availableCells,
        suspect: hint.suspect,
      };
    } else if (availableCells.length > 0) {
      return {
        message: hint.messages.multiple,
        highlightCells: availableCells,
        suspect: hint.suspect,
      };
    }
  }

  // Generic fallback
  const nextSuspect = unplacedSuspects[0];
  return {
    message: `💡 Consider ${nextSuspect.name}'s clue: "${nextSuspect.clue}"`,
    highlightCells: [],
    suspect: nextSuspect.id,
  };
}

export {
  getCellsOfType,
  getOccupiableCellsInRoom,
  getCellsAdjacentToType,
  filterAvailableCells,
  isSuspectPlaced,
  isCellAvailable,
};
