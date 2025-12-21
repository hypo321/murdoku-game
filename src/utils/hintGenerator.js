import { occupiableTypes } from '../data/gameData';

/**
 * Generates hints for the backyard-garden-easy puzzle
 * based on the current game state.
 */

// Helper: Get all cells of a specific room
function getCellsInRoom(boardLayout, roomName) {
  const cells = [];
  boardLayout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.room === roomName) {
        cells.push({ row: rowIndex, col: colIndex, cell });
      }
    });
  });
  return cells;
}

// Helper: Get all occupiable cells in a room
function getOccupiableCellsInRoom(boardLayout, roomName) {
  return getCellsInRoom(boardLayout, roomName).filter(({ cell }) =>
    occupiableTypes.includes(cell.type)
  );
}

// Helper: Get all cells of a specific type
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

// Helper: Get cells adjacent to a specific cell type (same room only)
function getCellsAdjacentToType(boardLayout, cellType) {
  const typeCells = getCellsOfType(boardLayout, cellType);
  const adjacentCells = [];
  const gridSize = boardLayout.length;

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
      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < boardLayout[0].length
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
        }
      }
    }
  }

  return adjacentCells;
}

// Helper: Check if a cell is available (not placed, not in blocked row/col)
function isCellAvailable(row, col, placements, markedCells) {
  const key = `${row}-${col}`;
  if (placements[key]) return false;
  if (markedCells[key]) return false;

  // Check if row or column is blocked by existing placement
  for (const [placedKey] of Object.entries(placements)) {
    const [pRow, pCol] = placedKey.split('-').map(Number);
    if (pRow === row || pCol === col) return false;
  }

  return true;
}

// Helper: Get available cells from a list
function filterAvailableCells(cells, placements, markedCells) {
  return cells.filter(({ row, col }) =>
    isCellAvailable(row, col, placements, markedCells)
  );
}

// Helper: Check if suspect is already placed
function isSuspectPlaced(suspectId, placements) {
  return Object.values(placements).includes(suspectId);
}

// Helper: Get cells that could be marked as X (cells in same row as shed cells but not in shed)
function getCellsToMarkInRow(
  boardLayout,
  targetCells,
  placements,
  markedCells
) {
  const cellsToMark = [];
  const rows = [...new Set(targetCells.map((c) => c.row))];

  for (const row of rows) {
    for (let col = 0; col < boardLayout[row].length; col++) {
      const cell = boardLayout[row][col];
      const key = `${row}-${col}`;
      const isInTargetCells = targetCells.some(
        (c) => c.row === row && c.col === col
      );

      if (
        !isInTargetCells &&
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
 * Main hint generator function for backyard-garden-easy
 * Follows specific solving order based on logical deductions
 */
export function generateHint(puzzle, placements, markedCells) {
  const { suspects, boardLayout } = puzzle;

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

  // === STEP 1: Elyse - chair in Living Room ===
  if (!isSuspectPlaced('elyse', placements)) {
    const livingRoomChairs = getCellsOfType(
      boardLayout,
      'chair'
    ).filter(
      ({ row, col }) => boardLayout[row][col].room === 'livingRoom'
    );
    const availableChairs = filterAvailableCells(
      livingRoomChairs,
      placements,
      markedCells
    );

    if (availableChairs.length === 1) {
      return {
        message: `💡 Elyse must be sitting in a chair, and Aaron's clue says they're both in the Living Room. There's only one chair in the Living Room!`,
        highlightCells: availableChairs,
        suspect: 'elyse',
      };
    } else if (availableChairs.length > 0) {
      return {
        message: `💡 Elyse must be sitting in a chair. Aaron's clue says they're both in the Living Room. Look for chairs there.`,
        highlightCells: availableChairs,
        suspect: 'elyse',
      };
    }
  }

  // === STEP 2: Aaron - Living Room with Elyse ===
  if (
    !isSuspectPlaced('aaron', placements) &&
    isSuspectPlaced('elyse', placements)
  ) {
    const livingRoomCells = getOccupiableCellsInRoom(
      boardLayout,
      'livingRoom'
    );
    const availableCells = filterAvailableCells(
      livingRoomCells,
      placements,
      markedCells
    );

    if (availableCells.length === 1) {
      return {
        message: `💡 Aaron was with Elyse in the Living Room. There's only one spot left for him!`,
        highlightCells: availableCells,
        suspect: 'aaron',
      };
    } else if (availableCells.length > 0) {
      return {
        message: `💡 Aaron was with Elyse in the Living Room. Look for available spots there.`,
        highlightCells: availableCells,
        suspect: 'aaron',
      };
    }
  }

  // === STEP 3: Franklin - carpet cells (only 1 left after Elyse/Aaron) ===
  if (
    !isSuspectPlaced('franklin', placements) &&
    isSuspectPlaced('elyse', placements) &&
    isSuspectPlaced('aaron', placements)
  ) {
    const carpetCells = getCellsOfType(boardLayout, 'carpet');
    const availableCells = filterAvailableCells(
      carpetCells,
      placements,
      markedCells
    );

    if (availableCells.length === 1) {
      return {
        message: `💡 Franklin was on a carpet. There's only one carpet cell available!`,
        highlightCells: availableCells,
        suspect: 'franklin',
      };
    } else if (availableCells.length > 0) {
      return {
        message: `💡 Franklin was on a carpet. These carpet cells are still available.`,
        highlightCells: availableCells,
        suspect: 'franklin',
      };
    }
  }

  // === STEP 4: Bruce - Shed (2 cells in same row, mark other cells in that row) ===
  // Only show marking hint here; if 2 cells remain and X's are done, skip to Denise
  if (
    !isSuspectPlaced('bruce', placements) &&
    isSuspectPlaced('franklin', placements) &&
    !isSuspectPlaced('denise', placements)
  ) {
    const shedCells = getOccupiableCellsInRoom(boardLayout, 'shed');
    const availableShedCells = filterAvailableCells(
      shedCells,
      placements,
      markedCells
    );

    // Only place Bruce if there's exactly 1 cell left
    if (availableShedCells.length === 1) {
      return {
        message: `💡 Bruce was in the Shed. There's only one spot available!`,
        highlightCells: availableShedCells,
        suspect: 'bruce',
      };
    } else if (availableShedCells.length === 2) {
      // Check if both cells are in the same row - suggest marking X's
      const rows = [...new Set(availableShedCells.map((c) => c.row))];
      if (rows.length === 1) {
        const cellsToMark = getCellsToMarkInRow(
          boardLayout,
          availableShedCells,
          placements,
          markedCells
        );
        if (cellsToMark.length > 0) {
          return {
            message: `💡 Bruce must be in the Shed. Both remaining Shed cells are in the same row - you can mark X on all other cells in that row!`,
            highlightCells: cellsToMark,
            suspect: 'bruce',
            action: 'mark',
          };
        }
        // If X's are marked but still 2 cells, fall through to Denise
      }
    }
    // If more than 1 cell remains and no X's to mark, fall through to Denise
  }

  // === STEP 4b: Bruce with only 1 cell after Denise is placed ===
  if (
    !isSuspectPlaced('bruce', placements) &&
    isSuspectPlaced('denise', placements)
  ) {
    const shedCells = getOccupiableCellsInRoom(boardLayout, 'shed');
    const availableShedCells = filterAvailableCells(
      shedCells,
      placements,
      markedCells
    );

    if (availableShedCells.length === 1) {
      return {
        message: `💡 Bruce was in the Shed. Now there's only one spot left!`,
        highlightCells: availableShedCells,
        suspect: 'bruce',
      };
    } else if (availableShedCells.length > 0) {
      return {
        message: `💡 Bruce was in the Shed. These cells are available.`,
        highlightCells: availableShedCells,
        suspect: 'bruce',
      };
    }
  }

  // === STEP 5: Denise - Bedroom or Sunroom (sunroom blocked, so bedroom) ===
  if (
    !isSuspectPlaced('denise', placements) &&
    isSuspectPlaced('franklin', placements)
  ) {
    const bedroomCells = getOccupiableCellsInRoom(
      boardLayout,
      'bedroom'
    );
    const sunroomCells = getOccupiableCellsInRoom(
      boardLayout,
      'sunroom'
    );
    const availableBedroom = filterAvailableCells(
      bedroomCells,
      placements,
      markedCells
    );
    const availableSunroom = filterAvailableCells(
      sunroomCells,
      placements,
      markedCells
    );
    const allAvailable = [...availableBedroom, ...availableSunroom];

    if (allAvailable.length === 1) {
      return {
        message: `💡 Denise was in the Bedroom or Sunroom. There's only one spot left!`,
        highlightCells: allAvailable,
        suspect: 'denise',
      };
    } else if (
      availableSunroom.length === 0 &&
      availableBedroom.length > 0
    ) {
      return {
        message: `💡 Denise was in the Bedroom or Sunroom. The Sunroom is fully blocked, so she must be in the Bedroom!`,
        highlightCells: availableBedroom,
        suspect: 'denise',
      };
    } else if (allAvailable.length > 0) {
      return {
        message: `💡 Denise was in the Bedroom or the Sunroom. These cells are available.`,
        highlightCells: allAvailable,
        suspect: 'denise',
      };
    }
  }

  // === STEP 7: Carissa - only one space adjacent to tree ===
  if (
    !isSuspectPlaced('carissa', placements) &&
    isSuspectPlaced('bruce', placements)
  ) {
    const adjacentToTree = getCellsAdjacentToType(
      boardLayout,
      'tree'
    );
    const availableCells = filterAvailableCells(
      adjacentToTree,
      placements,
      markedCells
    );

    if (availableCells.length === 1) {
      return {
        message: `💡 Carissa was beside a tree. There's only one spot adjacent to a tree!`,
        highlightCells: availableCells,
        suspect: 'carissa',
      };
    } else if (availableCells.length > 0) {
      return {
        message: `💡 Carissa was beside a tree. These cells are adjacent to trees.`,
        highlightCells: availableCells,
        suspect: 'carissa',
      };
    }
  }

  // === STEP 8: Holden - must be alone, can't be in garden or backyard ===
  if (
    !isSuspectPlaced('holden', placements) &&
    isSuspectPlaced('carissa', placements)
  ) {
    const pondCells = getOccupiableCellsInRoom(boardLayout, 'pond');
    const availablePond = filterAvailableCells(
      pondCells,
      placements,
      markedCells
    );

    if (availablePond.length === 1) {
      return {
        message: `💡 Holden was alone. He can't be in the Garden (Gilbert will be there) or the Backyard (Carissa is there). The only remaining isolated cell is in the Pond area!`,
        highlightCells: availablePond,
        suspect: 'holden',
      };
    } else if (availablePond.length > 0) {
      return {
        message: `💡 Holden was alone. He needs a cell where no one else in the same room could be adjacent. Consider the Pond area.`,
        highlightCells: availablePond,
        suspect: 'holden',
      };
    }
  }

  // === STEP 9: Gilbert - only remaining Garden cell ===
  if (
    !isSuspectPlaced('gilbert', placements) &&
    isSuspectPlaced('holden', placements)
  ) {
    const gardenCells = getOccupiableCellsInRoom(
      boardLayout,
      'garden'
    );
    const availableCells = filterAvailableCells(
      gardenCells,
      placements,
      markedCells
    );

    if (availableCells.length === 1) {
      return {
        message: `💡 Gilbert was in the Garden. There's only one spot left!`,
        highlightCells: availableCells,
        suspect: 'gilbert',
      };
    } else if (availableCells.length > 0) {
      return {
        message: `💡 Gilbert was in the Garden. These cells are available.`,
        highlightCells: availableCells,
        suspect: 'gilbert',
      };
    }
  }

  // === STEP 10: Violet - final cell, find the killer ===
  if (
    !isSuspectPlaced('violet', placements) &&
    isSuspectPlaced('gilbert', placements)
  ) {
    // Find all remaining available cells
    const allCells = [];
    boardLayout.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (occupiableTypes.includes(cell.type)) {
          allCells.push({ row: rowIndex, col: colIndex, cell });
        }
      });
    });
    const availableCells = filterAvailableCells(
      allCells,
      placements,
      markedCells
    );

    if (availableCells.length === 1) {
      const violetCell = availableCells[0];
      const violetRoom =
        boardLayout[violetCell.row][violetCell.col].room;
      return {
        message: `💡 Violet goes in the last remaining cell. She was alone with the murderer - check who else is in the ${violetRoom}!`,
        highlightCells: availableCells,
        suspect: 'violet',
      };
    } else if (availableCells.length > 0) {
      return {
        message: `💡 Violet was alone with the murderer. Place her in the remaining cell.`,
        highlightCells: availableCells,
        suspect: 'violet',
      };
    }
  }

  // Generic fallback for any remaining unplaced suspect
  const nextSuspect = unplacedSuspects[0];
  return {
    message: `💡 Consider ${nextSuspect.name}'s clue: "${nextSuspect.clue}"`,
    highlightCells: [],
    suspect: nextSuspect.id,
  };
}
