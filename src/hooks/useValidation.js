import { useCallback } from 'react';
import {
  validateCurrentState,
  checkSolution,
} from '../utils/validation';

/**
 * @typedef {import('../types').Placements} Placements
 * @typedef {import('../types').MarkedCells} MarkedCells
 * @typedef {import('../types').Puzzle} Puzzle
 * @typedef {import('../types').ValidationErrors} ValidationErrors
 */

/**
 * Custom hook for validating game state against puzzle solution.
 *
 * @param {Puzzle} puzzle - The current puzzle
 * @returns {Object} Validation functions
 */
export function useValidation(puzzle) {
  const { suspects, solution } = puzzle;

  /**
   * Validates the current game state.
   *
   * @param {Placements} placements - Current suspect placements
   * @param {MarkedCells} markedCells - Current X marks
   * @returns {ValidationErrors} Validation errors
   */
  const validate = useCallback(
    (placements, markedCells) => {
      return validateCurrentState(
        placements,
        markedCells,
        solution,
        suspects
      );
    },
    [solution, suspects]
  );

  /**
   * Checks if the current solution is complete and correct.
   *
   * @param {Placements} placements - Current suspect placements
   * @returns {{ isComplete: boolean, correctCount: number, wrongNames: string[], allPlaced: boolean }}
   */
  const checkCurrentSolution = useCallback(
    (placements) => {
      const result = checkSolution(placements, solution, suspects);
      return {
        ...result,
        allPlaced: Object.keys(placements).length >= suspects.length,
      };
    },
    [solution, suspects]
  );

  return {
    validate,
    checkCurrentSolution,
  };
}
