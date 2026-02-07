/**
 * Hint engine powered by the constraint-propagation solver.
 * Generates contextual hints from any game state by running the solver
 * and returning the next logical deduction step.
 *
 * @fileoverview Bridge between the solver engine and the game UI hint system.
 */

import { MurdokuSolver } from './solver';
import { getCellsBesideType } from './boardUtils';
import { createCellKey } from '../constants';

/**
 * @typedef {Object} HintResult
 * @property {string} message - Human-readable hint message
 * @property {string[]} highlightCells - Cell keys to highlight on the board
 * @property {string} [suspect] - Suspect ID this hint relates to
 * @property {string} [action] - Optional action: 'place' or 'eliminate'
 * @property {Object} [debugState] - Debug info about solver state
 */

/**
 * Generates the next hint based on the current game state.
 * Uses the puzzle's curated hints array to find the appropriate hint,
 * then uses the solver to determine candidate cells for highlighting.
 *
 * @param {Object} puzzle - The puzzle data
 * @param {Object} placements - Current placements (cellKey -> suspectId)
 * @returns {HintResult}
 */
export function getNextHint(puzzle, placements) {
  // Check if the PLAYER has placed all suspects (not the solver's internal state)
  const playerPlacedCount = Object.keys(placements).length;
  if (playerPlacedCount >= puzzle.suspects.length) {
    return {
      message:
        '🎉 All suspects are placed! Try checking your solution.',
      highlightCells: [],
    };
  }

  // Create two solver instances:
  // rawSolver: only player placements propagated (for skipIfMoreThan checks)
  // solvedSolver: fully solved (for narrowed candidate highlighting)
  const rawSolver = new MurdokuSolver(puzzle);
  rawSolver.initialize(placements);

  const solvedSolver = new MurdokuSolver(puzzle);
  solvedSolver.initialize(placements);
  solvedSolver.solve();

  // Build set of placed suspect IDs from the player's current state
  const placedIds = new Set(Object.values(placements));

  // If the puzzle has curated hints, use them
  if (puzzle.hints && puzzle.hints.length > 0) {
    const result = _findCuratedHint(
      puzzle,
      rawSolver,
      solvedSolver,
      placedIds,
    );
    if (result) return result;
  }

  // Fallback: use solver step directly
  const step = rawSolver.solveStep();
  if (step) {
    return {
      message: step.message,
      highlightCells: step.highlightCells || [],
      suspect: step.suspectId,
      action: step.cellKey ? 'place' : 'eliminate',
    };
  }

  return _fallbackHint(puzzle, rawSolver);
}

/**
 * Finds the next appropriate curated hint from the puzzle's hints array.
 * Matches hints based on prerequisite satisfaction, placement state,
 * and candidate count thresholds.
 *
 * @param {Object} puzzle - The puzzle data
 * @param {MurdokuSolver} rawSolver - Solver with only player placements (for skipIfMoreThan)
 * @param {MurdokuSolver} solvedSolver - Fully solved solver (for narrowed candidates)
 * @param {Set<string>} placedIds - Set of already-placed suspect IDs
 * @returns {HintResult|null}
 * @private
 */
function _findCuratedHint(
  puzzle,
  rawSolver,
  solvedSolver,
  placedIds,
) {
  const sortedHints = [...puzzle.hints].sort(
    (a, b) => a.order - b.order,
  );

  for (const hint of sortedHints) {
    // Skip if this suspect is already placed
    if (placedIds.has(hint.suspect)) continue;

    // Skip if prerequisites aren't met
    const prereqsMet = (hint.prerequisites || []).every((prereq) =>
      placedIds.has(prereq),
    );
    if (!prereqsMet) continue;

    // Use solver-narrowed candidates for highlighting (these reflect
    // all deductions like row/col claiming, contradiction, etc.)
    const solvedCandidates = solvedSolver.getCandidates(hint.suspect);
    if (!solvedCandidates || solvedCandidates.size === 0) continue;

    const candidates = _filterByTarget(
      solvedCandidates,
      hint.target,
      solvedSolver,
    );
    if (candidates.size === 0) continue;

    // For skipIfMoreThan, check RAW candidates (before solver deductions)
    // so intermediate hints get skipped — their reasoning is folded
    // into the next hint's message
    if (hint.skipIfMoreThan) {
      const rawCandidates = _filterByTarget(
        rawSolver.getCandidates(hint.suspect),
        hint.target,
        rawSolver,
      );
      if (rawCandidates.size > hint.skipIfMoreThan) {
        continue;
      }
    }

    // Choose message based on what the PLAYER can see (raw candidates),
    // not the fully-solved state. The solver may have narrowed to 1
    // through advanced techniques the player hasn't applied yet.
    const rawFiltered = _filterByTarget(
      rawSolver.getCandidates(hint.suspect),
      hint.target,
      rawSolver,
    );
    const isSingle = rawFiltered.size <= 1;
    let message;

    if (isSingle && hint.messages.single) {
      message = hint.messages.single;
    } else if (!isSingle && hint.messages.multiple) {
      message = hint.messages.multiple;
    } else {
      message = hint.messages.single || hint.messages.multiple;
    }

    // For marking hints with room info, substitute room names
    if (!isSingle && hint.messages.roomBlocked) {
      const roomStatus = _checkRoomBlocking(
        hint,
        solvedSolver,
        puzzle,
      );
      if (roomStatus) {
        message = hint.messages.roomBlocked
          .replace('{blockedRooms}', roomStatus.blocked)
          .replace('{availableRoom}', roomStatus.available);
      }
    }

    return {
      message,
      highlightCells: [...candidates],
      suspect: hint.suspect,
      action:
        candidates.size === 1 && isSingle ? 'place' : 'eliminate',
    };
  }

  return null;
}

/**
 * Checks if any rooms in an inRooms constraint are fully blocked.
 * Used for generating contextual room-blocking messages.
 *
 * @param {Object} hint - The hint object
 * @param {MurdokuSolver} solver - Initialized solver
 * @param {Object} puzzle - The puzzle data
 * @returns {{ blocked: string, available: string }|null}
 * @private
 */
function _checkRoomBlocking(hint, solver, puzzle) {
  const suspect = puzzle.suspects.find((s) => s.id === hint.suspect);
  if (!suspect) return null;

  const roomsConstraint = suspect.constraints.find(
    (c) => c.type === 'inRooms',
  );
  if (!roomsConstraint) return null;

  const candidates = solver.getCandidates(hint.suspect);
  const candidateRooms = new Set();
  for (const key of candidates) {
    const info = solver.board.cellInfo.get(key);
    if (info) candidateRooms.add(info.room);
  }

  const blocked = [];
  const available = [];
  for (const room of roomsConstraint.rooms) {
    const roomName = puzzle.rooms[room]?.name || room;
    if (candidateRooms.has(room)) {
      available.push(roomName);
    } else {
      blocked.push(roomName);
    }
  }

  if (blocked.length > 0 && available.length > 0) {
    return {
      blocked: blocked.join(', '),
      available: available.join(', '),
    };
  }

  return null;
}

/**
 * Filters candidate cells using the hint's target specification.
 * This handles dynamic constraints that the solver hasn't applied yet
 * (e.g., withPerson room restriction, alone constraint).
 *
 * @param {Set<string>} candidates - Raw candidates from the solver
 * @param {Object} target - Hint target specification
 * @param {MurdokuSolver} solver - Initialized solver instance
 * @returns {Set<string>} Filtered candidates
 * @private
 */
function _filterByTarget(candidates, target, solver) {
  if (!target) return candidates;

  const result = new Set();

  switch (target.type) {
    case 'room': {
      const roomCells = solver.board.roomCells.get(target.room);
      if (!roomCells) return candidates;
      for (const key of candidates) {
        if (roomCells.has(key)) result.add(key);
      }
      return result;
    }

    case 'rooms': {
      for (const key of candidates) {
        const info = solver.board.cellInfo.get(key);
        if (info && target.rooms.includes(info.room)) {
          result.add(key);
        }
      }
      return result;
    }

    case 'cellType': {
      for (const key of candidates) {
        const info = solver.board.cellInfo.get(key);
        if (info && info.type === target.cellType) {
          // If target also specifies a room, filter by that too
          if (target.room && info.room !== target.room) continue;
          result.add(key);
        }
      }
      return result;
    }

    case 'adjacentTo': {
      const besideCells = getCellsBesideType(
        solver.board,
        target.cellType,
      );
      for (const key of candidates) {
        if (besideCells.has(key)) result.add(key);
      }
      return result;
    }

    case 'row': {
      for (const key of candidates) {
        const info = solver.board.cellInfo.get(key);
        if (info && info.row === target.row) result.add(key);
      }
      return result;
    }

    case 'any':
    default:
      return candidates;
  }
}

/**
 * Solves the entire puzzle from the current state and returns all steps.
 * Useful for debugging and verifying the solver works correctly.
 *
 * @param {Object} puzzle - The puzzle data
 * @param {Object} placements - Current placements (cellKey -> suspectId)
 * @returns {{ steps: Object[], solved: boolean, unplaced: string[] }}
 */
export function solveFromState(puzzle, placements = {}) {
  const solver = new MurdokuSolver(puzzle);
  solver.initialize(placements);
  const steps = solver.solve();

  const unplaced = puzzle.suspects
    .filter((s) => !solver.placed.has(s.id))
    .map((s) => s.name);

  return {
    steps,
    solved: solver.isSolved(),
    unplaced,
  };
}

/**
 * Gets the full candidate state for debug mode visualization.
 * Returns which suspects can go in each cell, and which cells each suspect can go in.
 *
 * @param {Object} puzzle - The puzzle data
 * @param {Object} placements - Current placements (cellKey -> suspectId)
 * @returns {Object} Debug state with candidateMap and cellCandidates
 */
export function getDebugState(puzzle, placements = {}) {
  const solver = new MurdokuSolver(puzzle);
  solver.initialize(placements);

  // Build per-cell candidate info
  const cellCandidates = {};
  const gridSize = puzzle.gridSize;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const key = createCellKey(r, c);
      const suspects = solver.getCellCandidates(key);
      if (suspects.length > 0) {
        cellCandidates[key] = suspects;
      }
    }
  }

  // Build per-suspect candidate info
  const suspectCandidates = {};
  for (const s of puzzle.suspects) {
    if (!solver.placed.has(s.id)) {
      const cands = solver.getCandidates(s.id);
      suspectCandidates[s.id] = [...cands];
    }
  }

  return {
    cellCandidates,
    suspectCandidates,
    placed: Object.fromEntries(solver.placed),
  };
}

/**
 * Provides a fallback hint when the solver can't make progress.
 * Lists unplaced suspects with the fewest remaining candidates.
 *
 * @param {Object} puzzle
 * @param {MurdokuSolver} solver
 * @returns {HintResult}
 * @private
 */
function _fallbackHint(puzzle, solver) {
  let bestSid = null;
  let bestCount = Infinity;
  let bestCands = [];

  for (const s of puzzle.suspects) {
    if (solver.placed.has(s.id)) continue;
    const cands = solver.getCandidates(s.id);
    if (cands.size < bestCount && cands.size > 0) {
      bestCount = cands.size;
      bestSid = s.id;
      bestCands = [...cands];
    }
  }

  if (bestSid) {
    const suspect = puzzle.suspects.find((s) => s.id === bestSid);
    if (bestCount <= 3) {
      return {
        message: `💡 ${suspect.name} has only ${bestCount} possible position${bestCount > 1 ? 's' : ''}. Clue: "${suspect.clue}"`,
        highlightCells: bestCands,
        suspect: bestSid,
      };
    }
    return {
      message: `💡 Consider ${suspect.name}'s clue: "${suspect.clue}" — they have ${bestCount} possible positions remaining.`,
      highlightCells: bestCands,
      suspect: bestSid,
    };
  }

  return {
    message:
      '💡 Try examining the clues more carefully and look for suspects with limited options.',
    highlightCells: [],
  };
}
