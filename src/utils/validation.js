/**
 * Validation utilities for Murdoku game state
 * @fileoverview Validates current game state against the puzzle solution
 */

import { parseCellKey, createCellKey } from '../constants';

/**
 * @typedef {import('../types').Placements} Placements
 * @typedef {import('../types').MarkedCells} MarkedCells
 * @typedef {import('../types').Solution} Solution
 * @typedef {import('../types').Suspect} Suspect
 * @typedef {import('../types').ValidationErrors} ValidationErrors
 * @typedef {import('../types').WrongPlacement} WrongPlacement
 * @typedef {import('../types').CellPosition} CellPosition
 */

/**
 * Validates the current game state against the puzzle solution.
 * Checks for wrongly placed suspects and X marks on cells that should have suspects.
 *
 * @param {Placements} placements - Current suspect placements
 * @param {MarkedCells} markedCells - Current X marks
 * @param {Solution} solution - Correct positions for each suspect
 * @param {Suspect[]} suspects - Array of suspects
 * @returns {ValidationErrors} Object containing wrong placements and wrong marks
 */
export function validateCurrentState(
  placements,
  markedCells,
  solution,
  suspects
) {
  /** @type {ValidationErrors} */
  const errors = {
    wrongPlacements: [],
    wrongMarks: [],
  };

  // Check for wrongly placed suspects
  for (const [cellKey, suspectId] of Object.entries(placements)) {
    const { row, col } = parseCellKey(cellKey);
    const correctPos = solution[suspectId];
    if (correctPos.row !== row || correctPos.col !== col) {
      const suspect = suspects.find((s) => s.id === suspectId);
      if (suspect) {
        errors.wrongPlacements.push({
          suspect,
          currentPos: { row, col },
          correctPos,
        });
      }
    }
  }

  // Check for X marks on cells that should have suspects
  for (const cellKey of Object.keys(markedCells)) {
    if (!markedCells[cellKey]) continue;
    const { row, col } = parseCellKey(cellKey);
    for (const [, pos] of Object.entries(solution)) {
      if (pos.row === row && pos.col === col) {
        errors.wrongMarks.push({ row, col });
        break;
      }
    }
  }

  return errors;
}

/**
 * Checks if the current state has any validation errors.
 *
 * @param {ValidationErrors} errors - Validation errors object
 * @returns {boolean} True if there are any errors
 */
export function hasErrors(errors) {
  return (
    errors.wrongPlacements.length > 0 || errors.wrongMarks.length > 0
  );
}

/**
 * Checks if all suspects are correctly placed.
 *
 * @param {Placements} placements - Current suspect placements
 * @param {Solution} solution - Correct positions for each suspect
 * @param {Suspect[]} suspects - Array of suspects
 * @returns {{ isComplete: boolean, correctCount: number, wrongNames: string[] }}
 */
export function checkSolution(placements, solution, suspects) {
  const totalSuspects = suspects.length;
  const placedCount = Object.keys(placements).length;

  if (placedCount < totalSuspects) {
    return {
      isComplete: false,
      correctCount: placedCount,
      wrongNames: [],
    };
  }

  let correctCount = 0;
  const wrongNames = [];

  for (const suspect of suspects) {
    const correctPos = solution[suspect.id];
    const correctKey = createCellKey(correctPos.row, correctPos.col);
    const placedKey = Object.entries(placements).find(
      ([, id]) => id === suspect.id
    )?.[0];

    if (placedKey === correctKey) {
      correctCount++;
    } else {
      wrongNames.push(suspect.name);
    }
  }

  return {
    isComplete: correctCount === totalSuspects,
    correctCount,
    wrongNames,
  };
}
