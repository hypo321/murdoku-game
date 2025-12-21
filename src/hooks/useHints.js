import { useState, useCallback } from 'react';
import { generateHint } from '../utils/hintGenerator';
import { validateCurrentState } from '../utils/validation';
import { createCellKey } from '../constants';

/**
 * @typedef {import('../types').Placements} Placements
 * @typedef {import('../types').MarkedCells} MarkedCells
 * @typedef {import('../types').HighlightedCells} HighlightedCells
 * @typedef {import('../types').Puzzle} Puzzle
 * @typedef {import('../types').Suspect} Suspect
 * @typedef {import('../types').Hint} Hint
 */

/**
 * Custom hook for managing hints and error/hint cell highlighting.
 *
 * @param {Puzzle} puzzle - The current puzzle
 * @returns {Object} Hint state and actions
 */
export function useHints(puzzle) {
  const { suspects, solution } = puzzle;

  /** @type {[HighlightedCells, Function]} */
  const [errorCells, setErrorCells] = useState({});
  /** @type {[HighlightedCells, Function]} */
  const [hintCells, setHintCells] = useState({});

  /**
   * Clears all highlights (error and hint cells).
   */
  const clearHighlights = useCallback(() => {
    setErrorCells({});
    setHintCells({});
  }, []);

  /**
   * Gets a hint based on current game state.
   * Returns validation errors if any exist, otherwise returns a solving hint.
   *
   * @param {Placements} placements - Current suspect placements
   * @param {MarkedCells} markedCells - Current X marks
   * @returns {{ hint: Hint|null, error: { type: 'wrongPlacement' | 'wrongMarks', data: any } | null, suspectToSelect: Suspect|null }}
   */
  const getHint = useCallback(
    (placements, markedCells) => {
      clearHighlights();

      const errors = validateCurrentState(
        placements,
        markedCells,
        solution,
        suspects
      );

      // Check for wrong placements first
      if (errors.wrongPlacements.length > 0) {
        const first = errors.wrongPlacements[0];
        return {
          hint: null,
          error: {
            type: 'wrongPlacement',
            data: first,
          },
          suspectToSelect: null,
        };
      }

      // Check for wrong X marks
      if (errors.wrongMarks.length > 0) {
        const highlightedCells = {};
        for (const cell of errors.wrongMarks) {
          highlightedCells[createCellKey(cell.row, cell.col)] = true;
        }
        setErrorCells(highlightedCells);

        return {
          hint: null,
          error: {
            type: 'wrongMarks',
            data: errors.wrongMarks,
          },
          suspectToSelect: null,
        };
      }

      // Generate a hint based on current state
      const hint = generateHint(puzzle, placements, markedCells);

      // Highlight cells from the hint
      if (hint.highlightCells && hint.highlightCells.length > 0) {
        const highlighted = {};
        for (const cell of hint.highlightCells) {
          highlighted[createCellKey(cell.row, cell.col)] = true;
        }
        setHintCells(highlighted);
      }

      // Find suspect to auto-select (if not a marking hint)
      let suspectToSelect = null;
      if (hint.suspect && hint.action !== 'mark') {
        suspectToSelect =
          suspects.find((s) => s.id === hint.suspect) || null;
      }

      return {
        hint,
        error: null,
        suspectToSelect,
      };
    },
    [puzzle, solution, suspects, clearHighlights]
  );

  return {
    // State
    errorCells,
    hintCells,

    // Actions
    getHint,
    clearHighlights,
  };
}
