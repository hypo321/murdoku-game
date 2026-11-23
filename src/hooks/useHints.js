import { useState, useCallback, useRef } from 'react';
import { getNextHint } from '../engine/hintEngine';
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

  // Tracks a pending hint waiting for the second click to reveal cells
  const pendingHintRef = useRef(null);
  // Tracks IDs of consumed deduction hints so they don't repeat
  const consumedHintIdsRef = useRef(new Set());

  /**
   * Clears all highlights (error and hint cells) and any pending hint.
   */
  const clearHighlights = useCallback(() => {
    setErrorCells({});
    setHintCells({});
    pendingHintRef.current = null;
  }, []);

  /**
   * Full reset: clears highlights and consumed deduction hints.
   * Call this on puzzle reset or puzzle change.
   */
  const resetHints = useCallback(() => {
    clearHighlights();
    consumedHintIdsRef.current = new Set();
  }, [clearHighlights]);

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
      // Save pending hint before clearHighlights wipes it
      const pendingHint = pendingHintRef.current;
      clearHighlights();

      const errors = validateCurrentState(
        placements,
        markedCells,
        solution,
        suspects,
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

      // Stage 2: if there's a pending hint, reveal its highlighted cells
      if (pendingHint) {
        // Mark deduction hints as consumed so they don't repeat
        if (pendingHint.action === 'deduce' && pendingHint.id) {
          consumedHintIdsRef.current.add(pendingHint.id);
        }

        if (
          pendingHint.highlightCells &&
          pendingHint.highlightCells.length > 0
        ) {
          const highlighted = {};
          for (const cellKey of pendingHint.highlightCells) {
            highlighted[cellKey] = true;
          }
          setHintCells(highlighted);
        }

        let suspectToSelect = null;
        if (pendingHint.suspect && pendingHint.action !== 'mark') {
          suspectToSelect =
            suspects.find((s) => s.id === pendingHint.suspect) ||
            null;
        }

        return {
          hint: pendingHint,
          error: null,
          suspectToSelect,
        };
      }

      // Stage 1: generate a new hint, show message only (no cell highlights)
      const hint = getNextHint(
        puzzle,
        placements,
        consumedHintIdsRef.current,
      );
      pendingHintRef.current = hint;

      return {
        hint,
        error: null,
        suspectToSelect: null,
      };
    },
    [puzzle, solution, suspects, clearHighlights],
  );

  return {
    // State
    errorCells,
    hintCells,

    // Actions
    getHint,
    clearHighlights,
    resetHints,
  };
}
