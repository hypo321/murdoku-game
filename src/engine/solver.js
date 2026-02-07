/**
 * Murdoku constraint-propagation solver.
 * Tracks candidate positions for each suspect and applies elimination techniques
 * to logically deduce placements step by step.
 *
 * @fileoverview Core solver engine with step recording for hint generation.
 */

import { precomputeBoard, parseKey } from './boardUtils';
import {
  computeInitialCandidates,
  describeConstraint,
} from './constraints';

/**
 * @typedef {Object} SolveStep
 * @property {string} technique - Name of the technique used
 * @property {string} suspectId - Suspect that was placed or affected
 * @property {string} [cellKey] - Cell key where suspect was placed
 * @property {string} message - Human-readable explanation
 * @property {string[]} [eliminatedCells] - Cells eliminated this step
 * @property {string[]} [highlightCells] - Cells to highlight for this hint
 */

export class MurdokuSolver {
  /**
   * @param {Object} puzzle - The puzzle data
   */
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.board = precomputeBoard(puzzle.boardLayout);
    this.suspectIds = puzzle.suspects.map((s) => s.id);
    this.suspectMap = new Map(puzzle.suspects.map((s) => [s.id, s]));

    // Build gender map for aloneWithGender constraints
    this.genderMap = new Map();
    for (const s of puzzle.suspects) {
      if (s.gender) {
        this.genderMap.set(s.id, s.gender);
      }
    }

    // Build constraint map: suspectId -> constraints[]
    this.constraintMap = new Map();
    for (const s of puzzle.suspects) {
      this.constraintMap.set(s.id, s.constraints || []);
    }

    /** @type {Map<string, Set<string>>} suspectId -> set of candidate cell keys */
    this.candidates = new Map();

    /** @type {Map<string, string>} suspectId -> cellKey (placed suspects) */
    this.placed = new Map();

    /** @type {SolveStep[]} */
    this.steps = [];
  }

  /**
   * Initializes the solver from a given game state.
   * Places already-placed suspects and computes initial candidates for unplaced ones.
   *
   * @param {Object} placements - Map of cellKey -> suspectId for already-placed suspects
   */
  initialize(placements = {}) {
    this.placed.clear();
    this.candidates.clear();
    this.steps = [];

    // Compute initial candidates from static constraints
    for (const sid of this.suspectIds) {
      const constraints = this.constraintMap.get(sid) || [];
      const initial = computeInitialCandidates(
        constraints,
        this.board,
      );
      this.candidates.set(sid, initial);
    }

    // Apply already-placed suspects
    const placedEntries = Object.entries(placements);
    for (const [cellKey, suspectId] of placedEntries) {
      this._placeSuspect(suspectId, cellKey, false);
    }

    // Run initial propagation to clean up after placing
    this._propagateBasic();
  }

  /**
   * Gets current candidates for a suspect.
   *
   * @param {string} suspectId
   * @returns {Set<string>}
   */
  getCandidates(suspectId) {
    return this.candidates.get(suspectId) || new Set();
  }

  /**
   * Gets all candidate suspects for a specific cell.
   *
   * @param {string} cellKey
   * @returns {string[]} Array of suspect IDs that could go in this cell
   */
  getCellCandidates(cellKey) {
    const result = [];
    for (const [sid, cands] of this.candidates) {
      if (!this.placed.has(sid) && cands.has(cellKey)) {
        result.push(sid);
      }
    }
    return result;
  }

  /**
   * Returns whether the puzzle is fully solved.
   *
   * @returns {boolean}
   */
  isSolved() {
    return this.placed.size === this.suspectIds.length;
  }

  /**
   * Runs the solver to completion, recording each step.
   * Returns all steps taken.
   *
   * @returns {SolveStep[]}
   */
  solve() {
    let maxIterations = 200;
    while (!this.isSolved() && maxIterations-- > 0) {
      const step = this.solveStep();
      if (!step) break;
    }
    return this.steps;
  }

  /**
   * Performs one logical deduction step.
   * Returns the step taken, or null if no progress can be made.
   *
   * @returns {SolveStep|null}
   */
  solveStep() {
    // Technique 1: Naked single (suspect has exactly 1 candidate)
    const nakedSingle = this._findNakedSingle();
    if (nakedSingle) return nakedSingle;

    // Technique 2: Row/Column singles (only 1 suspect can go in a row/col)
    const rowSingle = this._findRowSingle();
    if (rowSingle) return rowSingle;
    const colSingle = this._findColSingle();
    if (colSingle) return colSingle;

    // Technique 3: Row/Column claiming (all candidates in one row/col)
    const rowClaim = this._findRowClaiming();
    if (rowClaim) return rowClaim;
    const colClaim = this._findColClaiming();
    if (colClaim) return colClaim;

    // Technique 3b: Naked row/col sets (group claiming)
    const nakedRow = this._findNakedRowSet();
    if (nakedRow) return nakedRow;
    const nakedCol = this._findNakedColSet();
    if (nakedCol) return nakedCol;

    // Technique 4: Room-based constraints (alone, aloneWith, etc.)
    const roomElim = this._applyRoomConstraints();
    if (roomElim) return roomElim;

    // Technique 5: Only-person-on-cell-type constraint
    const onlyPerson = this._applyOnlyPersonConstraint();
    if (onlyPerson) return onlyPerson;

    // Technique 6: Relative row constraint
    const relRow = this._applyRelativeRowConstraint();
    if (relRow) return relRow;

    // Technique 7: Pointing pair/group (all candidates in a room share a row or col)
    const pointing = this._findPointingGroup();
    if (pointing) return pointing;

    // Technique 8: Hypothetical testing (try placements, check for contradictions)
    const hypo = this._findByContradiction();
    if (hypo) return hypo;

    // No progress possible
    return null;
  }

  // =========================================================================
  // Internal: Placement and basic propagation
  // =========================================================================

  /**
   * Places a suspect at a cell and propagates row/col eliminations.
   *
   * @param {string} suspectId
   * @param {string} cellKey
   * @param {boolean} [recordStep=true]
   * @private
   */
  _placeSuspect(suspectId, cellKey, recordStep = true) {
    this.placed.set(suspectId, cellKey);
    this.candidates.set(suspectId, new Set([cellKey]));

    const { row, col } = parseKey(cellKey);

    // Eliminate this cell from all other suspects
    for (const [sid, cands] of this.candidates) {
      if (sid !== suspectId) {
        cands.delete(cellKey);
      }
    }

    // Eliminate row and col from all other unplaced suspects
    for (const [sid, cands] of this.candidates) {
      if (sid !== suspectId && !this.placed.has(sid)) {
        for (const key of [...cands]) {
          const pos = parseKey(key);
          if (pos.row === row || pos.col === col) {
            cands.delete(key);
          }
        }
      }
    }

    if (recordStep) {
      this._propagateBasic();
    }
  }

  /**
   * Runs basic propagation: repeatedly check for naked singles until stable.
   *
   * @private
   */
  _propagateBasic() {
    let changed = true;
    let safety = 100;
    while (changed && safety-- > 0) {
      changed = false;
      for (const sid of this.suspectIds) {
        if (this.placed.has(sid)) continue;
        const cands = this.candidates.get(sid);
        if (cands.size === 1) {
          const cellKey = [...cands][0];
          this._placeSuspect(sid, cellKey, false);
          changed = true;
        }
      }
    }
  }

  // =========================================================================
  // Technique 1: Naked Single
  // =========================================================================

  /**
   * Finds a suspect with exactly 1 candidate cell.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findNakedSingle() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const cands = this.candidates.get(sid);
      if (cands.size === 1) {
        const cellKey = [...cands][0];
        const suspect = this.suspectMap.get(sid);
        const { row, col } = parseKey(cellKey);
        const room = this.board.cellInfo.get(cellKey)?.room;
        const roomName = this.puzzle.rooms[room]?.name || room;
        const constraints = this.constraintMap.get(sid) || [];

        const constraintDesc =
          constraints.length > 0
            ? constraints
                .map((c) => describeConstraint(c, this.puzzle))
                .join('; ')
            : 'no specific constraints';

        const step = {
          technique: 'nakedSingle',
          suspectId: sid,
          cellKey,
          message: `💡 ${suspect.name} can only go at R${row + 1}C${col + 1} (${roomName}). Clue: "${suspect.clue}" — ${constraintDesc}. All other cells eliminated by row/column constraints.`,
          highlightCells: [cellKey],
        };

        this._placeSuspect(sid, cellKey);
        this.steps.push(step);
        return step;
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 2: Row/Column singles
  // In Murdoku, every row and column must have exactly 1 suspect.
  // If only 1 unplaced suspect can go in a row/col, they must go there.
  // =========================================================================

  /**
   * If only 1 unplaced suspect has candidates in a row, they must be in that row.
   * If they have only 1 candidate in that row, place them directly.
   * Otherwise, eliminate their candidates from other rows.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findRowSingle() {
    for (let r = 0; r < this.board.rows; r++) {
      // Skip rows already claimed by a placed suspect
      let rowTaken = false;
      for (const [, placedKey] of this.placed) {
        if (parseKey(placedKey).row === r) {
          rowTaken = true;
          break;
        }
      }
      if (rowTaken) continue;

      // Find which unplaced suspects have candidates in this row
      const suspectsInRow = [];
      for (const sid of this.suspectIds) {
        if (this.placed.has(sid)) continue;
        const cands = this.candidates.get(sid);
        for (const key of cands) {
          if (parseKey(key).row === r) {
            suspectsInRow.push(sid);
            break;
          }
        }
      }

      if (suspectsInRow.length === 1) {
        const sid = suspectsInRow[0];
        const cands = this.candidates.get(sid);

        // Get only the candidates in this row
        const candsInRow = [];
        const eliminated = [];
        for (const key of [...cands]) {
          if (parseKey(key).row === r) {
            candsInRow.push(key);
          } else {
            cands.delete(key);
            eliminated.push(key);
          }
        }

        if (candsInRow.length === 1) {
          // Direct placement
          const cellKey = candsInRow[0];
          const suspect = this.suspectMap.get(sid);
          const { row, col } = parseKey(cellKey);
          const room = this.board.cellInfo.get(cellKey)?.room;
          const roomName = this.puzzle.rooms[room]?.name || room;

          const step = {
            technique: 'rowSingle',
            suspectId: sid,
            cellKey,
            message: `💡 Only ${suspect.name} can go in row ${row + 1}, at R${row + 1}C${col + 1} (${roomName}). "${suspect.clue}"`,
            highlightCells: [cellKey],
          };

          this._placeSuspect(sid, cellKey);
          this.steps.push(step);
          return step;
        } else if (eliminated.length > 0) {
          const suspect = this.suspectMap.get(sid);
          const step = {
            technique: 'rowSingle',
            suspectId: sid,
            message: `💡 Only ${suspect.name} can go in row ${r + 1}. Eliminated ${eliminated.length} candidate(s) from other rows.`,
            highlightCells: candsInRow,
            eliminatedCells: eliminated,
          };
          this.steps.push(step);
          this._propagateBasic();
          return step;
        }
      }
    }
    return null;
  }

  /**
   * If only 1 unplaced suspect has candidates in a column, they must be there.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findColSingle() {
    for (let c = 0; c < this.board.cols; c++) {
      // Skip columns already claimed
      let colTaken = false;
      for (const [, placedKey] of this.placed) {
        if (parseKey(placedKey).col === c) {
          colTaken = true;
          break;
        }
      }
      if (colTaken) continue;

      const suspectsInCol = [];
      for (const sid of this.suspectIds) {
        if (this.placed.has(sid)) continue;
        const cands = this.candidates.get(sid);
        for (const key of cands) {
          if (parseKey(key).col === c) {
            suspectsInCol.push(sid);
            break;
          }
        }
      }

      if (suspectsInCol.length === 1) {
        const sid = suspectsInCol[0];
        const cands = this.candidates.get(sid);

        const candsInCol = [];
        const eliminated = [];
        for (const key of [...cands]) {
          if (parseKey(key).col === c) {
            candsInCol.push(key);
          } else {
            cands.delete(key);
            eliminated.push(key);
          }
        }

        if (candsInCol.length === 1) {
          const cellKey = candsInCol[0];
          const suspect = this.suspectMap.get(sid);
          const { row, col } = parseKey(cellKey);
          const room = this.board.cellInfo.get(cellKey)?.room;
          const roomName = this.puzzle.rooms[room]?.name || room;

          const step = {
            technique: 'colSingle',
            suspectId: sid,
            cellKey,
            message: `💡 Only ${suspect.name} can go in column ${col + 1}, at R${row + 1}C${col + 1} (${roomName}). "${suspect.clue}"`,
            highlightCells: [cellKey],
          };

          this._placeSuspect(sid, cellKey);
          this.steps.push(step);
          return step;
        } else if (eliminated.length > 0) {
          const suspect = this.suspectMap.get(sid);
          const step = {
            technique: 'colSingle',
            suspectId: sid,
            message: `💡 Only ${suspect.name} can go in column ${c + 1}. Eliminated ${eliminated.length} candidate(s) from other columns.`,
            highlightCells: candsInCol,
            eliminatedCells: eliminated,
          };
          this.steps.push(step);
          this._propagateBasic();
          return step;
        }
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 3: Row/Column claiming
  // =========================================================================

  /**
   * If all of a suspect's candidates are in the same row,
   * eliminate all other suspects' candidates from that row.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findRowClaiming() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const cands = this.candidates.get(sid);
      if (cands.size === 0) continue;

      // Check if all candidates share a row
      const rows = new Set();
      for (const key of cands) {
        rows.add(parseKey(key).row);
      }
      if (rows.size !== 1) continue;

      const claimedRow = [...rows][0];
      let totalEliminated = 0;

      // Eliminate other suspects from this row
      for (const otherSid of this.suspectIds) {
        if (otherSid === sid || this.placed.has(otherSid)) continue;
        const otherCands = this.candidates.get(otherSid);
        for (const key of [...otherCands]) {
          if (parseKey(key).row === claimedRow) {
            otherCands.delete(key);
            totalEliminated++;
          }
        }
      }

      if (totalEliminated > 0) {
        const suspect = this.suspectMap.get(sid);
        const step = {
          technique: 'rowClaiming',
          suspectId: sid,
          message: `💡 ${suspect.name} must be in row ${claimedRow + 1}. Eliminated ${totalEliminated} candidate(s) from other suspects in that row.`,
          highlightCells: [...cands],
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
    }
    return null;
  }

  /**
   * If all of a suspect's candidates are in the same column,
   * eliminate all other suspects' candidates from that column.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findColClaiming() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const cands = this.candidates.get(sid);
      if (cands.size === 0) continue;

      // Check if all candidates share a column
      const cols = new Set();
      for (const key of cands) {
        cols.add(parseKey(key).col);
      }
      if (cols.size !== 1) continue;

      const claimedCol = [...cols][0];
      let totalEliminated = 0;

      // Eliminate other suspects from this column
      for (const otherSid of this.suspectIds) {
        if (otherSid === sid || this.placed.has(otherSid)) continue;
        const otherCands = this.candidates.get(otherSid);
        for (const key of [...otherCands]) {
          if (parseKey(key).col === claimedCol) {
            otherCands.delete(key);
            totalEliminated++;
          }
        }
      }

      if (totalEliminated > 0) {
        const suspect = this.suspectMap.get(sid);
        const step = {
          technique: 'colClaiming',
          suspectId: sid,
          message: `💡 ${suspect.name} must be in column ${claimedCol + 1}. Eliminated ${totalEliminated} candidate(s) from other suspects in that column.`,
          highlightCells: [...cands],
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 3b: Naked Row/Column Sets (group claiming)
  // If N suspects can only be in N rows, those rows belong to them exclusively.
  // Also detects "forced cells": if within a claimed row the group has
  // candidates in only one column, that column is blocked for all others.
  // =========================================================================

  /**
   * Finds a group of N unplaced suspects whose candidates span exactly N rows.
   * Eliminates those rows from all suspects NOT in the group.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findNakedRowSet() {
    const suspectRows = [];
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const rows = new Set();
      for (const key of this.candidates.get(sid)) {
        rows.add(parseKey(key).row);
      }
      suspectRows.push({ sid, rows });
    }

    suspectRows.sort((a, b) => a.rows.size - b.rows.size);

    const maxSize = Math.min(suspectRows.length - 1, 6);
    for (let size = 2; size <= maxSize; size++) {
      const result = this._searchRowGroup(
        suspectRows,
        size,
        0,
        [],
        new Set(),
      );
      if (result) return result;
    }
    return null;
  }

  /**
   * Recursive search for a naked row set of the given target size.
   *
   * @param {Array} suspects - Sorted array of {sid, rows}
   * @param {number} targetSize - Group size to find
   * @param {number} startIdx - Start index for combination search
   * @param {string[]} group - Current group of suspect IDs
   * @param {Set<number>} rowUnion - Union of rows in the current group
   * @returns {SolveStep|null}
   * @private
   */
  _searchRowGroup(suspects, targetSize, startIdx, group, rowUnion) {
    if (group.length === targetSize) {
      if (rowUnion.size !== targetSize) return null;

      const groupSet = new Set(group);
      let totalEliminated = 0;

      // Eliminate claimed rows from non-group suspects
      for (const { sid } of suspects) {
        if (groupSet.has(sid)) continue;
        const cands = this.candidates.get(sid);
        for (const key of [...cands]) {
          if (rowUnion.has(parseKey(key).row)) {
            cands.delete(key);
            totalEliminated++;
          }
        }
      }

      // Forced cell detection: if group has candidates in only 1 column
      // within a claimed row, that column is blocked for everyone else
      for (const claimedRow of rowUnion) {
        const colsInRow = new Set();
        for (const sid of group) {
          for (const key of this.candidates.get(sid)) {
            const { row, col } = parseKey(key);
            if (row === claimedRow) colsInRow.add(col);
          }
        }
        if (colsInRow.size === 1) {
          const forcedCol = [...colsInRow][0];
          for (const { sid } of suspects) {
            if (groupSet.has(sid)) continue;
            const cands = this.candidates.get(sid);
            for (const key of [...cands]) {
              if (parseKey(key).col === forcedCol) {
                cands.delete(key);
                totalEliminated++;
              }
            }
          }
        }
      }

      if (totalEliminated > 0) {
        const names = group.map(
          (sid) => this.suspectMap.get(sid).name,
        );
        const rowList = [...rowUnion]
          .sort((a, b) => a - b)
          .map((r) => r + 1);
        const step = {
          technique: 'nakedRowSet',
          suspectId: group[0],
          message: `💡 ${names.join(', ')} must occupy rows ${rowList.join(', ')}. Eliminated ${totalEliminated} candidate(s) from other suspects.`,
          highlightCells: [],
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
      return null;
    }

    for (let i = startIdx; i < suspects.length; i++) {
      const { sid, rows } = suspects[i];
      const newUnion = new Set([...rowUnion, ...rows]);
      if (newUnion.size <= targetSize) {
        group.push(sid);
        const result = this._searchRowGroup(
          suspects,
          targetSize,
          i + 1,
          group,
          newUnion,
        );
        if (result) return result;
        group.pop();
      }
    }
    return null;
  }

  /**
   * Finds a group of N unplaced suspects whose candidates span exactly N columns.
   * Eliminates those columns from all suspects NOT in the group.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findNakedColSet() {
    const suspectCols = [];
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const cols = new Set();
      for (const key of this.candidates.get(sid)) {
        cols.add(parseKey(key).col);
      }
      suspectCols.push({ sid, cols });
    }

    suspectCols.sort((a, b) => a.cols.size - b.cols.size);

    const maxSize = Math.min(suspectCols.length - 1, 6);
    for (let size = 2; size <= maxSize; size++) {
      const result = this._searchColGroup(
        suspectCols,
        size,
        0,
        [],
        new Set(),
      );
      if (result) return result;
    }
    return null;
  }

  /**
   * Recursive search for a naked column set of the given target size.
   *
   * @param {Array} suspects - Sorted array of {sid, cols}
   * @param {number} targetSize
   * @param {number} startIdx
   * @param {string[]} group
   * @param {Set<number>} colUnion
   * @returns {SolveStep|null}
   * @private
   */
  _searchColGroup(suspects, targetSize, startIdx, group, colUnion) {
    if (group.length === targetSize) {
      if (colUnion.size !== targetSize) return null;

      const groupSet = new Set(group);
      let totalEliminated = 0;

      for (const { sid } of suspects) {
        if (groupSet.has(sid)) continue;
        const cands = this.candidates.get(sid);
        for (const key of [...cands]) {
          if (colUnion.has(parseKey(key).col)) {
            cands.delete(key);
            totalEliminated++;
          }
        }
      }

      // Forced cell: if group has candidates in only 1 row within a
      // claimed column, that row is blocked for everyone else
      for (const claimedCol of colUnion) {
        const rowsInCol = new Set();
        for (const sid of group) {
          for (const key of this.candidates.get(sid)) {
            const { row, col } = parseKey(key);
            if (col === claimedCol) rowsInCol.add(row);
          }
        }
        if (rowsInCol.size === 1) {
          const forcedRow = [...rowsInCol][0];
          for (const { sid } of suspects) {
            if (groupSet.has(sid)) continue;
            const cands = this.candidates.get(sid);
            for (const key of [...cands]) {
              if (parseKey(key).row === forcedRow) {
                cands.delete(key);
                totalEliminated++;
              }
            }
          }
        }
      }

      if (totalEliminated > 0) {
        const names = group.map(
          (sid) => this.suspectMap.get(sid).name,
        );
        const colList = [...colUnion]
          .sort((a, b) => a - b)
          .map((c) => c + 1);
        const step = {
          technique: 'nakedColSet',
          suspectId: group[0],
          message: `💡 ${names.join(', ')} must occupy columns ${colList.join(', ')}. Eliminated ${totalEliminated} candidate(s) from other suspects.`,
          highlightCells: [],
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
      return null;
    }

    for (let i = startIdx; i < suspects.length; i++) {
      const { sid, cols } = suspects[i];
      const newUnion = new Set([...colUnion, ...cols]);
      if (newUnion.size <= targetSize) {
        group.push(sid);
        const result = this._searchColGroup(
          suspects,
          targetSize,
          i + 1,
          group,
          newUnion,
        );
        if (result) return result;
        group.pop();
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 4: Room constraints (alone, aloneWith, withPerson, victim)
  // =========================================================================

  /**
   * Applies room-based dynamic constraints to eliminate candidates.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _applyRoomConstraints() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const constraints = this.constraintMap.get(sid) || [];

      for (const constraint of constraints) {
        let result = null;

        switch (constraint.type) {
          case 'alone':
            result = this._handleAloneConstraint(sid);
            break;
          case 'aloneWith':
            result = this._handleAloneWithConstraint(
              sid,
              constraint.suspect,
            );
            break;
          case 'aloneWithGender':
            result = this._handleAloneWithGenderConstraint(
              sid,
              constraint.gender,
            );
            break;
          case 'withPerson':
            result = this._handleWithPersonConstraint(
              sid,
              constraint.suspect,
              constraint.room,
            );
            break;
          case 'aheadOf':
            result = this._handleAheadOfConstraint(
              sid,
              constraint.suspect,
            );
            break;
          case 'victim':
            result = this._handleVictimConstraint(sid);
            break;
          case 'inRoomWithPersonOnCellType':
            result = this._handleInRoomWithPersonOnCellType(
              sid,
              constraint.gender,
              constraint.cellType,
            );
            break;
          case 'inRoomWithPersonBesideCellType':
            result = this._handleInRoomWithPersonBesideCellType(
              sid,
              constraint.cellType,
            );
            break;
        }

        if (result) return result;
      }
    }
    return null;
  }

  /**
   * Handles "alone" constraint: suspect must be sole occupant of their room.
   * Eliminates candidates in rooms where being alone is impossible.
   *
   * @param {string} sid
   * @returns {SolveStep|null}
   * @private
   */
  _handleAloneConstraint(sid) {
    const cands = this.candidates.get(sid);
    const eliminated = [];

    // For each candidate cell, check if suspect could be alone in that room
    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      if (!room) continue;

      if (!this._canBeAloneInRoom(sid, cellKey, room)) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const step = {
        technique: 'aloneElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} must be alone. Eliminated ${eliminated.length} cell(s) from rooms where being alone is impossible.`,
        highlightCells: [...cands],
        eliminatedCells: eliminated,
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  /**
   * Checks if suspect can be alone at cellKey in the given room.
   * Returns false only when we can PROVE being alone here is impossible:
   * - Another suspect is already placed in this room
   * - Another suspect is FORCED into this room (all candidates in-room)
   *   AND has candidates that survive our row/col (they'd share the room)
   * - Placing us here would leave another suspect with 0 total candidates
   *
   * @param {string} sid
   * @param {string} cellKey
   * @param {string} room
   * @returns {boolean}
   * @private
   */
  _canBeAloneInRoom(sid, cellKey, room) {
    const { row, col } = parseKey(cellKey);

    for (const otherSid of this.suspectIds) {
      if (otherSid === sid) continue;

      // If another suspect is already placed in this room, can't be alone
      if (this.placed.has(otherSid)) {
        const placedKey = this.placed.get(otherSid);
        const placedRoom = this.board.cellInfo.get(placedKey)?.room;
        if (placedRoom === room) return false;
        continue;
      }

      // Categorize other suspect's candidates
      const otherCands = this.candidates.get(otherSid);
      let hasOutsideRoom = false;
      let hasSurvivingInRoom = false;

      for (const otherKey of otherCands) {
        const otherRoom = this.board.cellInfo.get(otherKey)?.room;
        if (otherRoom !== room) {
          hasOutsideRoom = true;
        } else {
          // In our room - would it survive our row/col placement?
          const otherPos = parseKey(otherKey);
          if (
            otherPos.row !== row &&
            otherPos.col !== col &&
            otherKey !== cellKey
          ) {
            hasSurvivingInRoom = true;
          }
        }

        // Early exit: if they have options outside, they're not forced into our room
        if (hasOutsideRoom) break;
      }

      // If other suspect has no candidates outside this room...
      if (!hasOutsideRoom) {
        if (hasSurvivingInRoom) {
          // They're forced into our room AND have cells that survive our placement
          // → they WILL be in our room, so we can't be alone
          return false;
        }
        // All their in-room candidates are blocked by our row/col
        // → placing us here would leave them with 0 candidates (invalid)
        return false;
      }
      // They have options outside → they're not forced into our room, OK
    }

    return true;
  }

  /**
   * Handles "aloneWith" constraint: two suspects must be the only ones in a room.
   *
   * @param {string} sid - The suspect with the constraint
   * @param {string} otherSid - The suspect they must be with
   * @returns {SolveStep|null}
   * @private
   */
  _handleAloneWithConstraint(sid, otherSid) {
    const cands = this.candidates.get(sid);
    const otherCands = this.candidates.get(otherSid);
    const eliminated = [];
    const allowedSet = new Set([sid, otherSid]);

    // Eliminate cells in rooms where the pair can't be alone together
    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      // Partner must have candidates in this room
      let partnerInRoom = false;
      for (const k of otherCands) {
        if (this.board.cellInfo.get(k)?.room === room) {
          partnerInRoom = true;
          break;
        }
      }
      if (
        !partnerInRoom ||
        !this._isRoomViableForGroup(room, allowedSet)
      ) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    // Also restrict partner to viable shared rooms
    const otherEliminated = [];
    for (const cellKey of [...otherCands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      let meInRoom = false;
      for (const k of cands) {
        if (this.board.cellInfo.get(k)?.room === room) {
          meInRoom = true;
          break;
        }
      }
      if (
        !meInRoom ||
        !this._isRoomViableForGroup(room, allowedSet)
      ) {
        otherCands.delete(cellKey);
        otherEliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0 || otherEliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const other = this.suspectMap.get(otherSid);
      const step = {
        technique: 'aloneWithElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} must be alone with ${other.name}. Eliminated cells from rooms where they can't be alone together.`,
        highlightCells: [...cands],
        eliminatedCells: [...eliminated, ...otherEliminated],
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  /**
   * Handles "aloneWithGender" constraint.
   * Checks room viability: the room must have a valid partner AND no other
   * suspect forced into it.
   *
   * @param {string} sid
   * @param {string} gender - 'male' or 'female'
   * @returns {SolveStep|null}
   * @private
   */
  _handleAloneWithGenderConstraint(sid, gender) {
    const cands = this.candidates.get(sid);
    const eliminated = [];

    // Find suspects of the specified gender who can actually be partners
    // Exclude suspects with "alone" constraint (they must be sole occupant)
    const genderSuspects = this.suspectIds.filter((s) => {
      if (s === sid) return false;
      if (this.genderMap.get(s) !== gender) return false;
      const constraints = this.constraintMap.get(s) || [];
      const hasAlone = constraints.some((c) => c.type === 'alone');
      if (hasAlone) return false;
      return true;
    });

    if (genderSuspects.length === 0) return null;

    // For each candidate cell, check if the room is viable
    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;

      // Check if at least one gender-matching suspect has candidates in this room
      let hasPartnerInRoom = false;
      for (const gs of genderSuspects) {
        if (this.placed.has(gs)) {
          const placedRoom = this.board.cellInfo.get(
            this.placed.get(gs),
          )?.room;
          if (placedRoom === room) {
            hasPartnerInRoom = true;
            break;
          }
          continue;
        }
        const gsCands = this.candidates.get(gs);
        for (const k of gsCands) {
          if (this.board.cellInfo.get(k)?.room === room) {
            hasPartnerInRoom = true;
            break;
          }
        }
        if (hasPartnerInRoom) break;
      }

      // Check room viability: no non-allowed suspect forced into room
      const allowedInRoom = new Set([sid, ...genderSuspects]);
      const roomViable =
        hasPartnerInRoom &&
        this._isRoomViableForGroup(room, allowedInRoom);

      if (!roomViable) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const step = {
        technique: 'aloneWithGenderElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} must be alone with a ${gender}. Eliminated cells from rooms where this is impossible.`,
        highlightCells: [...cands],
        eliminatedCells: eliminated,
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  /**
   * Checks if a room is viable for a group of allowed suspects.
   * Returns false if any suspect NOT in the allowed set is forced into this room
   * (all their candidates are in this room).
   *
   * @param {string} room - Room name
   * @param {Set<string>} allowedSuspects - Set of suspect IDs allowed in room
   * @returns {boolean}
   * @private
   */
  _isRoomViableForGroup(room, allowedSuspects) {
    for (const otherSid of this.suspectIds) {
      if (allowedSuspects.has(otherSid)) continue;

      if (this.placed.has(otherSid)) {
        const placedRoom = this.board.cellInfo.get(
          this.placed.get(otherSid),
        )?.room;
        if (placedRoom === room) return false;
        continue;
      }

      // Check if this suspect is forced into the room
      const otherCands = this.candidates.get(otherSid);
      let hasOutside = false;
      for (const k of otherCands) {
        if (this.board.cellInfo.get(k)?.room !== room) {
          hasOutside = true;
          break;
        }
      }
      if (!hasOutside && otherCands.size > 0) {
        // This non-allowed suspect is forced into the room
        return false;
      }
    }
    return true;
  }

  /**
   * Handles "withPerson" constraint: must be in same room with a specific person.
   *
   * @param {string} sid
   * @param {string} otherSid
   * @param {string} room
   * @returns {SolveStep|null}
   * @private
   */
  _handleWithPersonConstraint(sid, otherSid, room) {
    // This is similar to inRoom but also constrains the other person
    const cands = this.candidates.get(sid);
    const otherCands = this.candidates.get(otherSid);
    const eliminated = [];

    // Restrict both to the specified room
    for (const cellKey of [...cands]) {
      const cellRoom = this.board.cellInfo.get(cellKey)?.room;
      if (cellRoom !== room) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    const otherEliminated = [];
    for (const cellKey of [...otherCands]) {
      const cellRoom = this.board.cellInfo.get(cellKey)?.room;
      if (cellRoom !== room) {
        otherCands.delete(cellKey);
        otherEliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0 || otherEliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const other = this.suspectMap.get(otherSid);
      const roomName = this.puzzle.rooms[room]?.name || room;
      const step = {
        technique: 'withPersonElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} must be with ${other.name} in the ${roomName}.`,
        highlightCells: [...cands],
        eliminatedCells: [...eliminated, ...otherEliminated],
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  /**
   * Handles "inRoomWithPersonOnCellType" constraint:
   * suspect must be in a room where a person of specified gender occupies
   * a cell of specified type.
   *
   * @param {string} sid - The suspect with the constraint
   * @param {string} gender - Required gender of the person on the cell type
   * @param {string} cellType - The cell type that must be occupied
   * @returns {SolveStep|null}
   * @private
   */
  _handleInRoomWithPersonOnCellType(sid, gender, cellType) {
    const cands = this.candidates.get(sid);
    const eliminated = [];

    // Find all cells of the target type, grouped by room
    const typeCells = this.board.typeCells.get(cellType) || new Set();
    const typeCellsByRoom = new Map();
    for (const key of typeCells) {
      const info = this.board.cellInfo.get(key);
      if (!info || !this.board.occupiableCells.has(key)) continue;
      if (!typeCellsByRoom.has(info.room)) {
        typeCellsByRoom.set(info.room, new Set());
      }
      typeCellsByRoom.get(info.room).add(key);
    }

    // Find suspects of the required gender (excluding self)
    const genderSuspects = this.suspectIds.filter((s) => {
      if (s === sid) return false;
      return this.genderMap.get(s) === gender;
    });

    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      if (!room) continue;

      const roomTypeCells = typeCellsByRoom.get(room);
      if (!roomTypeCells || roomTypeCells.size === 0) {
        // Room has no occupiable cells of this type
        cands.delete(cellKey);
        eliminated.push(cellKey);
        continue;
      }

      // Check if any gender-matching suspect can be on a target-type cell in this room
      let canHavePersonOnType = false;
      for (const gs of genderSuspects) {
        if (this.placed.has(gs)) {
          const placedKey = this.placed.get(gs);
          if (roomTypeCells.has(placedKey)) {
            canHavePersonOnType = true;
            break;
          }
          continue;
        }
        const gsCands = this.candidates.get(gs);
        for (const k of gsCands) {
          if (roomTypeCells.has(k)) {
            canHavePersonOnType = true;
            break;
          }
        }
        if (canHavePersonOnType) break;
      }

      if (!canHavePersonOnType) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const step = {
        technique: 'inRoomWithPersonOnCellType',
        suspectId: sid,
        message: `💡 ${suspect.name} must be in a room where a ${gender} is on a ${cellType}. Eliminated ${eliminated.length} cell(s).`,
        highlightCells: [...cands],
        eliminatedCells: eliminated,
      };
      this.steps.push(step);
      this._propagateBasic();
      return step;
    }
    return null;
  }

  /**
   * Handles "inRoomWithPersonBesideCellType" constraint:
   * suspect must be in a room where another person is adjacent to
   * a cell of specified type (same room adjacency).
   *
   * @param {string} sid - The suspect with the constraint
   * @param {string} cellType - The cell type someone must be beside
   * @returns {SolveStep|null}
   * @private
   */
  _handleInRoomWithPersonBesideCellType(sid, cellType) {
    const cands = this.candidates.get(sid);
    const eliminated = [];

    // Find occupiable cells beside the target type, grouped by room.
    // Must use manual direction checks since target cells may not be occupiable
    // (e.g. SHELF) and thus won't be in adjacentSameRoom.
    const DIRS = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const typeCells = this.board.typeCells.get(cellType) || new Set();
    const besideCellsByRoom = new Map();
    for (const targetKey of typeCells) {
      const targetInfo = this.board.cellInfo.get(targetKey);
      if (!targetInfo) continue;
      const { row, col, room } = targetInfo;
      for (const [dr, dc] of DIRS) {
        const nr = row + dr;
        const nc = col + dc;
        if (
          nr < 0 ||
          nr >= this.board.rows ||
          nc < 0 ||
          nc >= this.board.cols
        )
          continue;
        const nKey = `${nr}-${nc}`;
        const nInfo = this.board.cellInfo.get(nKey);
        if (
          nInfo &&
          nInfo.room === room &&
          this.board.occupiableCells.has(nKey)
        ) {
          if (!besideCellsByRoom.has(room)) {
            besideCellsByRoom.set(room, new Set());
          }
          besideCellsByRoom.get(room).add(nKey);
        }
      }
    }

    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      if (!room) continue;

      const roomBesideCells = besideCellsByRoom.get(room);
      if (!roomBesideCells || roomBesideCells.size === 0) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
        continue;
      }

      // Check if any OTHER suspect can be beside the target type in this room
      let canHavePersonBeside = false;
      for (const otherSid of this.suspectIds) {
        if (otherSid === sid) continue;

        if (this.placed.has(otherSid)) {
          const placedKey = this.placed.get(otherSid);
          if (roomBesideCells.has(placedKey)) {
            canHavePersonBeside = true;
            break;
          }
          continue;
        }

        const otherCands = this.candidates.get(otherSid);
        for (const k of otherCands) {
          if (roomBesideCells.has(k)) {
            canHavePersonBeside = true;
            break;
          }
        }
        if (canHavePersonBeside) break;
      }

      if (!canHavePersonBeside) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const step = {
        technique: 'inRoomWithPersonBesideCellType',
        suspectId: sid,
        message: `💡 ${suspect.name} must be in a room where someone is beside a ${cellType}. Eliminated ${eliminated.length} cell(s).`,
        highlightCells: [...cands],
        eliminatedCells: eliminated,
      };
      this.steps.push(step);
      this._propagateBasic();
      return step;
    }
    return null;
  }

  /**
   * Handles victim constraint: suspect was alone with the murderer.
   * This means the victim and one other suspect are the only two in a room.
   *
   * @param {string} sid - The victim suspect
   * @returns {SolveStep|null}
   * @private
   */
  _handleVictimConstraint(sid) {
    // The victim was alone with the murderer (unknown identity).
    // This means: exactly 2 people in the victim's room.
    // We eliminate rooms where:
    //   - No other suspect can be present (victim would be alone)
    //   - 2+ other suspects are forced into the room (too many people)
    const cands = this.candidates.get(sid);
    const eliminated = [];

    for (const cellKey of [...cands]) {
      const room = this.board.cellInfo.get(cellKey)?.room;
      if (!room) continue;

      // Count how many other suspects CAN be in this room
      let canBeInRoom = 0;
      // Count how many other suspects are FORCED into this room
      let forcedInRoom = 0;

      for (const otherSid of this.suspectIds) {
        if (otherSid === sid) continue;

        if (this.placed.has(otherSid)) {
          const placedRoom = this.board.cellInfo.get(
            this.placed.get(otherSid),
          )?.room;
          if (placedRoom === room) {
            canBeInRoom++;
            forcedInRoom++;
          }
          continue;
        }

        const otherCands = this.candidates.get(otherSid);
        let hasInRoom = false;
        let hasOutside = false;
        for (const k of otherCands) {
          const r = this.board.cellInfo.get(k)?.room;
          if (r === room) hasInRoom = true;
          else hasOutside = true;
          if (hasInRoom && hasOutside) break;
        }

        if (hasInRoom) canBeInRoom++;
        if (hasInRoom && !hasOutside && otherCands.size > 0)
          forcedInRoom++;
      }

      // Victim can't be alone (need at least 1 other person)
      // Victim was alone WITH someone (at most 1 other forced)
      if (canBeInRoom === 0 || forcedInRoom >= 2) {
        cands.delete(cellKey);
        eliminated.push(cellKey);
      }
    }

    if (eliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const step = {
        technique: 'victimElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} was alone with the murderer. Eliminated ${eliminated.length} cell(s) from rooms where this is impossible.`,
        highlightCells: [...cands],
        eliminatedCells: eliminated,
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  /**
   * Handles "aheadOf" constraint: suspect must be at a higher track position
   * than the other suspect. Uses puzzle.trackPositions map.
   *
   * @param {string} sid - Suspect who is ahead
   * @param {string} behindSid - Suspect who is behind
   * @returns {SolveStep|null}
   * @private
   */
  _handleAheadOfConstraint(sid, behindSid) {
    const trackPositions = this.puzzle.trackPositions;
    if (!trackPositions) return null;

    const myCands = this.candidates.get(sid);
    const otherCands = this.candidates.get(behindSid);
    const eliminated = [];
    const otherEliminated = [];

    // Get max track position the behind suspect could be at
    let maxBehindPos = -Infinity;
    for (const key of otherCands) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos > maxBehindPos) maxBehindPos = pos;
    }

    // Get min track position this suspect could be at
    let minAheadPos = Infinity;
    for (const key of myCands) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos < minAheadPos) minAheadPos = pos;
    }

    // Eliminate my candidates at positions <= min possible behind position
    let minBehindPos = Infinity;
    for (const key of otherCands) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos < minBehindPos) minBehindPos = pos;
    }

    for (const key of [...myCands]) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos <= minBehindPos) {
        myCands.delete(key);
        eliminated.push(key);
      }
    }

    // Eliminate behind suspect's candidates at positions >= max possible ahead position
    let maxAheadPos = -Infinity;
    for (const key of myCands) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos > maxAheadPos) maxAheadPos = pos;
    }

    for (const key of [...otherCands]) {
      const pos = trackPositions[key];
      if (pos !== undefined && pos >= maxAheadPos) {
        otherCands.delete(key);
        otherEliminated.push(key);
      }
    }

    if (eliminated.length > 0 || otherEliminated.length > 0) {
      const suspect = this.suspectMap.get(sid);
      const other = this.suspectMap.get(behindSid);
      const step = {
        technique: 'aheadOfElimination',
        suspectId: sid,
        message: `💡 ${suspect.name} must be ahead of ${other.name} on the track. Eliminated ${eliminated.length + otherEliminated.length} position(s).`,
        highlightCells: [...myCands],
        eliminatedCells: [...eliminated, ...otherEliminated],
      };

      this.steps.push(step);
      this._propagateBasic();
      return step;
    }

    return null;
  }

  // =========================================================================
  // Technique 5: Only person on cell type
  // =========================================================================

  /**
   * Applies "onlyPersonOnCellType" constraint.
   * If suspect X is the only one allowed on cell type T, eliminate T cells from all other suspects.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _applyOnlyPersonConstraint() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const constraints = this.constraintMap.get(sid) || [];

      for (const constraint of constraints) {
        if (constraint.type !== 'onlyPersonOnCellType') continue;

        const cellType = constraint.cellType;
        let totalEliminated = 0;

        // Eliminate this cell type from all OTHER suspects' candidates
        for (const otherSid of this.suspectIds) {
          if (otherSid === sid || this.placed.has(otherSid)) continue;

          // Check if other suspect has constraint requiring this cell type
          const otherConstraints =
            this.constraintMap.get(otherSid) || [];
          const requiresType = otherConstraints.some(
            (c) => c.type === 'onCellType' && c.cellType === cellType,
          );
          if (requiresType) continue; // Can't eliminate - they need it too (contradiction)

          const otherCands = this.candidates.get(otherSid);
          for (const key of [...otherCands]) {
            const info = this.board.cellInfo.get(key);
            if (info && info.type === cellType) {
              otherCands.delete(key);
              totalEliminated++;
            }
          }
        }

        if (totalEliminated > 0) {
          const suspect = this.suspectMap.get(sid);
          const step = {
            technique: 'onlyPersonOnType',
            suspectId: sid,
            message: `💡 ${suspect.name} is the only person allowed on a ${cellType}. Eliminated ${totalEliminated} ${cellType} cell(s) from other suspects.`,
            highlightCells: [...this.candidates.get(sid)],
          };

          this.steps.push(step);
          this._propagateBasic();
          return step;
        }
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 6: Relative row constraint
  // =========================================================================

  /**
   * Applies relative row constraints (e.g., "one row north of Della").
   *
   * @returns {SolveStep|null}
   * @private
   */
  _applyRelativeRowConstraint() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const constraints = this.constraintMap.get(sid) || [];

      for (const constraint of constraints) {
        if (constraint.type !== 'relativeRow') continue;

        const otherSid = constraint.suspect;
        const offset = constraint.rowOffset;
        const otherCands = this.candidates.get(otherSid);
        const myCands = this.candidates.get(sid);
        let eliminated = [];

        if (this.placed.has(otherSid)) {
          // Other is placed: my row must be other's row + offset
          const otherKey = this.placed.get(otherSid);
          const targetRow = parseKey(otherKey).row + offset;

          for (const key of [...myCands]) {
            if (parseKey(key).row !== targetRow) {
              myCands.delete(key);
              eliminated.push(key);
            }
          }
        } else {
          // Restrict my candidates to rows that have valid other candidates
          const validRows = new Set();
          for (const otherKey of otherCands) {
            validRows.add(parseKey(otherKey).row + offset);
          }

          for (const key of [...myCands]) {
            if (!validRows.has(parseKey(key).row)) {
              myCands.delete(key);
              eliminated.push(key);
            }
          }

          // Also restrict other's candidates
          const myValidRows = new Set();
          for (const key of myCands) {
            myValidRows.add(parseKey(key).row - offset);
          }

          for (const otherKey of [...otherCands]) {
            if (!myValidRows.has(parseKey(otherKey).row)) {
              otherCands.delete(otherKey);
              eliminated.push(otherKey);
            }
          }
        }

        if (eliminated.length > 0) {
          const suspect = this.suspectMap.get(sid);
          const other = this.suspectMap.get(otherSid);
          const step = {
            technique: 'relativeRowElimination',
            suspectId: sid,
            message: `💡 ${suspect.name} must be ${Math.abs(offset)} row(s) ${offset < 0 ? 'north' : 'south'} of ${other.name}. Eliminated incompatible positions.`,
            highlightCells: [...myCands],
            eliminatedCells: eliminated,
          };

          this.steps.push(step);
          this._propagateBasic();
          return step;
        }
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 7: Pointing group
  // =========================================================================

  /**
   * If all of a suspect's candidates in a room share a row or column,
   * eliminate that suspect from other rooms in that row/column.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findPointingGroup() {
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      const cands = this.candidates.get(sid);
      if (cands.size <= 1) continue;

      // Group candidates by room
      const byRoom = new Map();
      for (const key of cands) {
        const room = this.board.cellInfo.get(key)?.room;
        if (!byRoom.has(room)) byRoom.set(room, []);
        byRoom.get(room).push(key);
      }

      for (const [room, roomKeys] of byRoom) {
        if (roomKeys.length < 2) continue;

        // Check if all share a row
        const rows = new Set(roomKeys.map((k) => parseKey(k).row));
        if (rows.size === 1) {
          const sharedRow = [...rows][0];
          const eliminated = [];
          // Eliminate this suspect from other cells in this row OUTSIDE this room
          for (const key of [...cands]) {
            const pos = parseKey(key);
            if (
              pos.row === sharedRow &&
              this.board.cellInfo.get(key)?.room !== room
            ) {
              cands.delete(key);
              eliminated.push(key);
            }
          }
          if (eliminated.length > 0) {
            const suspect = this.suspectMap.get(sid);
            const roomName = this.puzzle.rooms[room]?.name || room;
            const step = {
              technique: 'pointingRow',
              suspectId: sid,
              message: `💡 ${suspect.name}'s candidates in the ${roomName} are all in row ${sharedRow + 1}. Eliminated from other rooms in that row.`,
              highlightCells: roomKeys,
              eliminatedCells: eliminated,
            };
            this.steps.push(step);
            this._propagateBasic();
            return step;
          }
        }

        // Check if all share a column
        const cols = new Set(roomKeys.map((k) => parseKey(k).col));
        if (cols.size === 1) {
          const sharedCol = [...cols][0];
          const eliminated = [];
          for (const key of [...cands]) {
            const pos = parseKey(key);
            if (
              pos.col === sharedCol &&
              this.board.cellInfo.get(key)?.room !== room
            ) {
              cands.delete(key);
              eliminated.push(key);
            }
          }
          if (eliminated.length > 0) {
            const suspect = this.suspectMap.get(sid);
            const roomName = this.puzzle.rooms[room]?.name || room;
            const step = {
              technique: 'pointingCol',
              suspectId: sid,
              message: `💡 ${suspect.name}'s candidates in the ${roomName} are all in column ${sharedCol + 1}. Eliminated from other rooms in that column.`,
              highlightCells: roomKeys,
              eliminatedCells: eliminated,
            };
            this.steps.push(step);
            this._propagateBasic();
            return step;
          }
        }
      }
    }
    return null;
  }

  // =========================================================================
  // Technique 8: Hypothetical testing (contradiction-based elimination)
  // =========================================================================

  /**
   * For the suspect with fewest candidates (>1), try each candidate.
   * If placing them there leads to a contradiction (any suspect gets 0 candidates),
   * eliminate that candidate.
   *
   * @returns {SolveStep|null}
   * @private
   */
  _findByContradiction() {
    // Try all unplaced suspects sorted by candidate count (smallest first)
    const sorted = this.suspectIds
      .filter(
        (sid) =>
          !this.placed.has(sid) && this.candidates.get(sid).size > 1,
      )
      .sort(
        (a, b) =>
          this.candidates.get(a).size - this.candidates.get(b).size,
      );

    for (const testSid of sorted) {
      const testKeys = [...this.candidates.get(testSid)];
      const eliminated = [];

      for (const testKey of testKeys) {
        if (this._leadsToContradiction(testSid, testKey)) {
          eliminated.push(testKey);
        }
      }

      if (eliminated.length > 0) {
        const cands = this.candidates.get(testSid);
        for (const key of eliminated) {
          cands.delete(key);
        }
        const suspect = this.suspectMap.get(testSid);
        const step = {
          technique: 'contradiction',
          suspectId: testSid,
          message: `💡 By testing possibilities for ${suspect.name}, eliminated ${eliminated.length} cell(s) that lead to contradictions.`,
          highlightCells: [...cands],
          eliminatedCells: eliminated,
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
    }

    return null;
  }

  /**
   * Tests if placing suspect at cellKey leads to a contradiction.
   * Creates a snapshot, places the suspect, runs full solver techniques,
   * and checks if any suspect ends up with 0 candidates.
   *
   * @param {string} sid
   * @param {string} cellKey
   * @returns {boolean} true if contradiction found
   * @private
   */
  _leadsToContradiction(sid, cellKey, depth = 1) {
    // Snapshot current state
    const savedCandidates = new Map();
    for (const [s, c] of this.candidates) {
      savedCandidates.set(s, new Set(c));
    }
    const savedPlaced = new Map(this.placed);
    const savedSteps = this.steps.length;

    // Try placing
    this._placeSuspect(sid, cellKey, false);

    // Run full solver techniques
    let contradiction = false;
    let safety = 100;
    while (!contradiction && safety-- > 0) {
      contradiction = this._hasContradiction();
      if (contradiction) break;

      // Room constraints FIRST to eliminate invalid candidates before placement
      let step =
        this._applyRoomConstraints() ||
        this._applyOnlyPersonConstraint() ||
        this._applyRelativeRowConstraint() ||
        this._findNakedSingle() ||
        this._findRowSingle() ||
        this._findColSingle() ||
        this._findRowClaiming() ||
        this._findColClaiming() ||
        this._findNakedRowSet() ||
        this._findNakedColSet() ||
        this._findPointingGroup();

      // At depth > 0, also try nested contradiction testing
      if (!step && depth > 0) {
        step = this._findByContradictionAtDepth(depth - 1);
      }

      if (!step) break;
    }

    // Final contradiction check
    if (!contradiction) {
      contradiction = this._hasContradiction();
    }

    // Restore state
    for (const [s, c] of savedCandidates) {
      this.candidates.set(s, c);
    }
    this.placed = savedPlaced;
    this.steps.length = savedSteps;

    return contradiction;
  }

  /**
   * Contradiction testing at a specific depth (used in nested hypothetical tests).
   *
   * @param {number} depth
   * @returns {SolveStep|null}
   * @private
   */
  _findByContradictionAtDepth(depth) {
    const sorted = this.suspectIds
      .filter(
        (sid) =>
          !this.placed.has(sid) && this.candidates.get(sid).size > 1,
      )
      .sort(
        (a, b) =>
          this.candidates.get(a).size - this.candidates.get(b).size,
      );

    for (const testSid of sorted) {
      if (this.candidates.get(testSid).size > 6) break; // limit search space
      const testKeys = [...this.candidates.get(testSid)];
      const eliminated = [];

      for (const testKey of testKeys) {
        if (this._leadsToContradiction(testSid, testKey, depth)) {
          eliminated.push(testKey);
        }
      }

      if (eliminated.length > 0) {
        const cands = this.candidates.get(testSid);
        for (const key of eliminated) {
          cands.delete(key);
        }
        const suspect = this.suspectMap.get(testSid);
        const step = {
          technique: 'contradiction',
          suspectId: testSid,
          message: `💡 Deep testing for ${suspect.name}: eliminated ${eliminated.length} cell(s).`,
          highlightCells: [...cands],
          eliminatedCells: eliminated,
        };
        this.steps.push(step);
        this._propagateBasic();
        return step;
      }
    }
    return null;
  }

  /**
   * Checks if the current state has any contradiction:
   * - Any unplaced suspect with 0 candidates
   * - Any unfilled row with no unplaced suspect having candidates in it
   * - Any unfilled column with no unplaced suspect having candidates in it
   *
   * @returns {boolean}
   * @private
   */
  _hasContradiction() {
    // Check for 0-candidate suspects
    for (const sid of this.suspectIds) {
      if (this.placed.has(sid)) continue;
      if (this.candidates.get(sid).size === 0) return true;
    }

    // Check for orphaned rows (unfilled rows with no candidates)
    const filledRows = new Set();
    const filledCols = new Set();
    for (const [, key] of this.placed) {
      const { row, col } = parseKey(key);
      filledRows.add(row);
      filledCols.add(col);
    }

    for (let r = 0; r < this.board.rows; r++) {
      if (filledRows.has(r)) continue;
      let hasCand = false;
      for (const sid of this.suspectIds) {
        if (this.placed.has(sid)) continue;
        for (const key of this.candidates.get(sid)) {
          if (parseKey(key).row === r) {
            hasCand = true;
            break;
          }
        }
        if (hasCand) break;
      }
      if (!hasCand) return true;
    }

    for (let c = 0; c < this.board.cols; c++) {
      if (filledCols.has(c)) continue;
      let hasCand = false;
      for (const sid of this.suspectIds) {
        if (this.placed.has(sid)) continue;
        for (const key of this.candidates.get(sid)) {
          if (parseKey(key).col === c) {
            hasCand = true;
            break;
          }
        }
        if (hasCand) break;
      }
      if (!hasCand) return true;
    }

    return false;
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Gets the set of rooms where a suspect has candidates.
   *
   * @param {string} sid
   * @returns {Set<string>}
   * @private
   */
  _getRoomsForCandidates(sid) {
    const rooms = new Set();
    const cands = this.candidates.get(sid);
    for (const key of cands) {
      rooms.add(this.board.cellInfo.get(key)?.room);
    }
    return rooms;
  }

  /**
   * Checks if a cell is available for a suspect (not claimed by another placed suspect).
   *
   * @param {string} cellKey
   * @param {string} sid
   * @returns {boolean}
   * @private
   */
  _isCellAvailableForSuspect(cellKey, sid) {
    for (const [placedSid, placedKey] of this.placed) {
      if (placedSid === sid) continue;
      if (placedKey === cellKey) return false;
      const placedPos = parseKey(placedKey);
      const cellPos = parseKey(cellKey);
      if (
        placedPos.row === cellPos.row ||
        placedPos.col === cellPos.col
      )
        return false;
    }
    return true;
  }
}
