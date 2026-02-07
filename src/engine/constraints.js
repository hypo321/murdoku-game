/**
 * Constraint evaluation for Murdoku solver.
 * Each constraint type has a function that filters candidate cells.
 * @fileoverview Defines all constraint types and their evaluation logic.
 */

import { getCellsBesideType, parseKey } from './boardUtils';

/**
 * @typedef {Object} Constraint
 * @property {string} type - The constraint type
 * @property {string} [room] - Room name (for inRoom)
 * @property {string[]} [rooms] - Room names (for inRooms)
 * @property {string} [cellType] - Cell type (for onCellType, beside, etc.)
 * @property {string} [suspect] - Suspect ID (for aloneWith, withPerson, relativeRow)
 * @property {string} [gender] - Gender 'male'|'female' (for aloneWithGender)
 * @property {number[]} [columns] - Column indices (for inColumns)
 * @property {number} [rowOffset] - Row offset (for relativeRow: target.row = other.row + offset)
 * @property {number[]} [trackOrder] - Track position ordering data
 */

/**
 * Computes the initial set of candidate cells for a suspect based on their constraints.
 * Only applies "static" constraints that don't depend on other suspects' positions.
 *
 * @param {Object[]} constraints - Array of constraint objects for this suspect
 * @param {Object} board - Precomputed board info from boardUtils
 * @returns {Set<string>} Set of valid cell keys
 */
export function computeInitialCandidates(constraints, board) {
  // Start with all occupiable cells
  let candidates = new Set(board.occupiableCells);

  for (const constraint of constraints) {
    const filter = STATIC_FILTERS[constraint.type];
    if (filter) {
      candidates = filter(candidates, constraint, board);
    }
    // Dynamic constraints (alone, aloneWith, victim, etc.) are handled during propagation
  }

  return candidates;
}

/**
 * Checks if a constraint is "static" (can be evaluated without knowing other suspects' positions).
 *
 * @param {Constraint} constraint
 * @returns {boolean}
 */
export function isStaticConstraint(constraint) {
  return !!STATIC_FILTERS[constraint.type];
}

/**
 * Checks if a constraint is "dynamic" (depends on other suspects' positions).
 *
 * @param {Constraint} constraint
 * @returns {boolean}
 */
export function isDynamicConstraint(constraint) {
  return DYNAMIC_TYPES.has(constraint.type);
}

/**
 * Gets a human-readable description of a constraint.
 *
 * @param {Constraint} constraint
 * @param {Object} puzzle - Puzzle data for room/suspect names
 * @returns {string}
 */
export function describeConstraint(constraint, puzzle) {
  const roomName = (r) => puzzle.rooms[r]?.name || r;
  const suspectName = (id) =>
    puzzle.suspects.find((s) => s.id === id)?.name || id;

  switch (constraint.type) {
    case 'inRoom':
      return `must be in the ${roomName(constraint.room)}`;
    case 'inRooms':
      return `must be in ${constraint.rooms.map(roomName).join(' or ')}`;
    case 'onCellType':
      return `must be on a ${constraint.cellType}`;
    case 'notOnCellType':
      return `cannot be on a ${constraint.cellType}`;
    case 'beside':
      return `must be beside a ${constraint.cellType}`;
    case 'alone':
      return 'must be alone in their room';
    case 'aloneWith':
      return `must be alone with ${suspectName(constraint.suspect)}`;
    case 'aloneWithGender':
      return `must be alone with a ${constraint.gender}`;
    case 'withPerson':
      return `must be with ${suspectName(constraint.suspect)} in the ${roomName(constraint.room)}`;
    case 'inColumns':
      return `must be in column ${constraint.columns.map((c) => c + 1).join(' or ')}`;
    case 'inRow':
      return `must be in row ${constraint.row + 1}`;
    case 'notBeside':
      return `must not be beside a ${constraint.cellType}`;
    case 'inRoomWithPersonOnCellType':
      return `must be in a room where a ${constraint.gender} is on a ${constraint.cellType}`;
    case 'inRoomWithPersonBesideCellType':
      return `must be in a room where someone else is beside a ${constraint.cellType}`;
    case 'onlyPersonOnCellType':
      return `must be the only person on a ${constraint.cellType}`;
    case 'relativeRow':
      return `must be ${constraint.rowOffset < 0 ? Math.abs(constraint.rowOffset) + ' row(s) north of' : constraint.rowOffset + ' row(s) south of'} ${suspectName(constraint.suspect)}`;
    case 'aheadOf':
      return `must be ahead of ${suspectName(constraint.suspect)} on the track`;
    case 'victim':
      return 'was alone with the murderer';
    default:
      return `has constraint: ${constraint.type}`;
  }
}

// ============================================================================
// Static constraint filters (don't depend on other suspects)
// ============================================================================

const STATIC_FILTERS = {
  /**
   * Must be in a specific room.
   */
  inRoom(candidates, constraint, board) {
    const roomCells = board.roomCells.get(constraint.room);
    if (!roomCells) return new Set();
    return intersection(candidates, roomCells);
  },

  /**
   * Must be in one of several rooms.
   */
  inRooms(candidates, constraint, board) {
    const valid = new Set();
    for (const room of constraint.rooms) {
      const roomCells = board.roomCells.get(room);
      if (roomCells) {
        for (const key of roomCells) {
          if (candidates.has(key)) valid.add(key);
        }
      }
    }
    return valid;
  },

  /**
   * Must be on a specific cell type.
   */
  onCellType(candidates, constraint, board) {
    const result = new Set();
    for (const key of candidates) {
      const info = board.cellInfo.get(key);
      if (info && info.type === constraint.cellType) {
        result.add(key);
      }
    }
    return result;
  },

  /**
   * Must NOT be on a specific cell type.
   */
  notOnCellType(candidates, constraint, board) {
    const result = new Set();
    for (const key of candidates) {
      const info = board.cellInfo.get(key);
      if (info && info.type !== constraint.cellType) {
        result.add(key);
      }
    }
    return result;
  },

  /**
   * Must be adjacent to a cell of given type (same room).
   */
  beside(candidates, constraint, board) {
    const besideCells = getCellsBesideType(
      board,
      constraint.cellType,
    );
    return intersection(candidates, besideCells);
  },

  /**
   * Must be in one of the specified columns.
   */
  inColumns(candidates, constraint) {
    const colSet = new Set(constraint.columns);
    const result = new Set();
    for (const key of candidates) {
      const { col } = parseKey(key);
      if (colSet.has(col)) {
        result.add(key);
      }
    }
    return result;
  },

  /**
   * Must be in a specific row.
   */
  inRow(candidates, constraint) {
    const result = new Set();
    for (const key of candidates) {
      if (parseKey(key).row === constraint.row) {
        result.add(key);
      }
    }
    return result;
  },

  /**
   * Must NOT be adjacent to a cell of given type (same room).
   */
  notBeside(candidates, constraint, board) {
    const besideCells = getCellsBesideType(
      board,
      constraint.cellType,
    );
    const result = new Set();
    for (const key of candidates) {
      if (!besideCells.has(key)) result.add(key);
    }
    return result;
  },
};

// ============================================================================
// Dynamic constraint types (depend on other suspects' positions)
// ============================================================================

const DYNAMIC_TYPES = new Set([
  'alone',
  'aloneWith',
  'aloneWithGender',
  'withPerson',
  'onlyPersonOnCellType',
  'relativeRow',
  'aheadOf',
  'victim',
  'inRoomWithPersonOnCellType',
  'inRoomWithPersonBesideCellType',
]);

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Returns the intersection of two sets.
 *
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {Set<string>}
 */
function intersection(a, b) {
  const result = new Set();
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of smaller) {
    if (larger.has(item)) {
      result.add(item);
    }
  }
  return result;
}

export { intersection };
