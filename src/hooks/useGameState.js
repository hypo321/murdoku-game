import { useState, useCallback, useEffect, useMemo } from 'react';
import { occupiableTypes } from '../data/gameData';
import { createCellKey, parseCellKey, MESSAGES } from '../constants';

/**
 * @typedef {import('../types').Placements} Placements
 * @typedef {import('../types').MarkedCells} MarkedCells
 * @typedef {import('../types').HistoryEntry} HistoryEntry
 * @typedef {import('../types').Suspect} Suspect
 * @typedef {import('../types').CellPosition} CellPosition
 * @typedef {import('../types').Puzzle} Puzzle
 */

/**
 * @typedef {Object.<string, string[]>} AutoMarks
 * Maps cell keys to arrays of suspect IDs that auto-placed marks on that cell.
 * A cell can have marks from multiple suspects if they share a row/column.
 */

/**
 * @typedef {Object.<string, boolean>} ManualMarks
 * Maps cell keys to boolean for manually placed X marks.
 */

/**
 * @typedef {Object.<string, string[]>} PossibilityMarks
 * Maps cell keys to arrays of suspect IDs that could possibly occupy that cell.
 * Used for tracking potential placements based on clue analysis.
 */

/**
 * Custom hook for managing game state including placements, marks, history, and selection.
 *
 * @param {Puzzle} puzzle - The current puzzle
 * @returns {Object} Game state and actions
 */
export function useGameState(puzzle) {
  const { suspects, boardLayout, gridSize } = puzzle;

  /** @type {[Placements, Function]} */
  const [placements, setPlacements] = useState({});
  /** @type {[AutoMarks, Function]} */
  const [autoMarks, setAutoMarks] = useState({});
  /** @type {[ManualMarks, Function]} */
  const [manualMarks, setManualMarks] = useState({});
  /** @type {[PossibilityMarks, Function]} */
  const [possibilityMarks, setPossibilityMarks] = useState({});
  /** @type {[Suspect|null, Function]} */
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  /** @type {[CellPosition|null, Function]} */
  const [selectedCell, setSelectedCell] = useState(null);
  /** @type {[string, Function]} */
  const [message, setMessage] = useState(MESSAGES.INITIAL);
  /** @type {[HistoryEntry[], Function]} */
  const [history, setHistory] = useState([]);

  /**
   * Computed markedCells - combines autoMarks and manualMarks.
   * A cell is marked if it has any auto-marks OR is manually marked.
   * @type {MarkedCells}
   */
  const markedCells = useMemo(() => {
    const combined = {};
    // Add all cells with auto-marks
    for (const cellKey of Object.keys(autoMarks)) {
      if (autoMarks[cellKey] && autoMarks[cellKey].length > 0) {
        combined[cellKey] = true;
      }
    }
    // Add all manually marked cells
    for (const cellKey of Object.keys(manualMarks)) {
      if (manualMarks[cellKey]) {
        combined[cellKey] = true;
      }
    }
    return combined;
  }, [autoMarks, manualMarks]);

  /**
   * Saves current state to history for undo functionality.
   */
  const saveToHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev,
      {
        placements: { ...placements },
        autoMarks: JSON.parse(JSON.stringify(autoMarks)),
        manualMarks: { ...manualMarks },
        possibilityMarks: JSON.parse(
          JSON.stringify(possibilityMarks)
        ),
      },
    ]);
  }, [placements, autoMarks, manualMarks, possibilityMarks]);

  /**
   * Undoes the last action.
   */
  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      setMessage(MESSAGES.UNDO_EMPTY);
      return;
    }
    const lastState = history[history.length - 1];
    setPlacements(lastState.placements);
    setAutoMarks(lastState.autoMarks);
    setManualMarks(lastState.manualMarks);
    setPossibilityMarks(lastState.possibilityMarks || {});
    setHistory((prev) => prev.slice(0, -1));
    setMessage(MESSAGES.UNDO_SUCCESS);
  }, [history]);

  // Keyboard shortcut for undo (Ctrl/Cmd + Z)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  /**
   * Gets the suspect at a specific cell position.
   *
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Suspect|null} The suspect at that position or null
   */
  const getSuspectAt = useCallback(
    (row, col) => {
      const key = createCellKey(row, col);
      const suspectId = placements[key];
      if (suspectId) {
        return suspects.find((s) => s.id === suspectId) || null;
      }
      return null;
    },
    [placements, suspects]
  );

  /**
   * Checks if a suspect is currently placed on the board.
   *
   * @param {string} suspectId - The suspect ID to check
   * @returns {boolean} True if the suspect is placed
   */
  const isSuspectPlaced = useCallback(
    (suspectId) => {
      return Object.values(placements).includes(suspectId);
    },
    [placements]
  );

  /**
   * Gets the current position of a placed suspect.
   *
   * @param {string} suspectId - The suspect ID
   * @returns {CellPosition|null} The position or null if not placed
   */
  const getPlacementPosition = useCallback(
    (suspectId) => {
      for (const [key, id] of Object.entries(placements)) {
        if (id === suspectId) {
          return parseCellKey(key);
        }
      }
      return null;
    },
    [placements]
  );

  /**
   * Adds auto X marks for a suspect placement and tracks which suspect placed them.
   *
   * @param {string} suspectId - The suspect being placed
   * @param {number} row - Row of the placement
   * @param {number} col - Column of the placement
   * @param {AutoMarks} currentAutoMarks - Current auto marks
   * @param {Placements} currentPlacements - Current placements (to avoid marking occupied cells)
   * @returns {AutoMarks} Updated auto marks
   */
  const addAutoMarksForSuspect = useCallback(
    (suspectId, row, col, currentAutoMarks, currentPlacements) => {
      const newAutoMarks = JSON.parse(
        JSON.stringify(currentAutoMarks)
      );

      // Mark all cells in the same row
      for (let c = 0; c < gridSize; c++) {
        if (c !== col) {
          const key = createCellKey(row, c);
          if (!currentPlacements[key]) {
            if (!newAutoMarks[key]) {
              newAutoMarks[key] = [];
            }
            if (!newAutoMarks[key].includes(suspectId)) {
              newAutoMarks[key].push(suspectId);
            }
          }
        }
      }

      // Mark all cells in the same column
      for (let r = 0; r < gridSize; r++) {
        if (r !== row) {
          const key = createCellKey(r, col);
          if (!currentPlacements[key]) {
            if (!newAutoMarks[key]) {
              newAutoMarks[key] = [];
            }
            if (!newAutoMarks[key].includes(suspectId)) {
              newAutoMarks[key].push(suspectId);
            }
          }
        }
      }

      return newAutoMarks;
    },
    [gridSize]
  );

  /**
   * Removes auto X marks that were placed by a specific suspect.
   *
   * @param {string} suspectId - The suspect being removed/moved
   * @param {AutoMarks} currentAutoMarks - Current auto marks
   * @returns {AutoMarks} Updated auto marks with suspect's marks removed
   */
  const removeAutoMarksForSuspect = useCallback(
    (suspectId, currentAutoMarks) => {
      const newAutoMarks = {};

      for (const [cellKey, suspectIds] of Object.entries(
        currentAutoMarks
      )) {
        const filtered = suspectIds.filter((id) => id !== suspectId);
        if (filtered.length > 0) {
          newAutoMarks[cellKey] = filtered;
        }
        // If array is empty, we don't add the key (mark disappears)
      }

      return newAutoMarks;
    },
    []
  );

  /**
   * Handles clicking on a suspect card.
   *
   * @param {Suspect} suspect - The clicked suspect
   */
  const handleSuspectClick = useCallback(
    (suspect) => {
      if (selectedSuspect?.id === suspect.id) {
        setSelectedSuspect(null);
        setMessage(MESSAGES.SUSPECT_DESELECTED);
      } else {
        setSelectedSuspect(suspect);
        const placed = isSuspectPlaced(suspect.id);
        if (placed) {
          setMessage(
            `${suspect.name} is already placed. Click their cell to remove, or select another cell to move.`
          );
        } else {
          setMessage(
            `${suspect.name} selected. Click a cell on the board to place them.`
          );
        }
      }
    },
    [selectedSuspect, isSuspectPlaced]
  );

  /**
   * Handles left-click on a cell.
   *
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {Function} [onClearHighlights] - Optional callback to clear highlights
   */
  const handleCellClick = useCallback(
    (row, col, onClearHighlights) => {
      if (onClearHighlights) {
        onClearHighlights();
      }

      const cellKey = createCellKey(row, col);
      const cell = boardLayout[row][col];
      const isOccupiable = occupiableTypes.includes(cell.type);
      const existingSuspect = getSuspectAt(row, col);

      if (existingSuspect) {
        if (
          selectedSuspect &&
          selectedSuspect.id === existingSuspect.id
        ) {
          // Remove the suspect from the board
          saveToHistory();
          const newPlacements = { ...placements };
          delete newPlacements[cellKey];
          setPlacements(newPlacements);
          // Remove auto-marks for this suspect
          const newAutoMarks = removeAutoMarksForSuspect(
            existingSuspect.id,
            autoMarks
          );
          setAutoMarks(newAutoMarks);
          setMessage(
            `${existingSuspect.name} removed from the board.`
          );
          setSelectedSuspect(null);
        } else if (selectedSuspect) {
          // Swap: move selected suspect to this cell (displacing existing)
          saveToHistory();
          const newPlacements = { ...placements };
          const oldPosition = getPlacementPosition(
            selectedSuspect.id
          );
          if (oldPosition) {
            delete newPlacements[
              createCellKey(oldPosition.row, oldPosition.col)
            ];
          }
          delete newPlacements[cellKey];
          newPlacements[cellKey] = selectedSuspect.id;
          setPlacements(newPlacements);
          // Remove old auto-marks for the moving suspect, then add new ones
          let newAutoMarks = removeAutoMarksForSuspect(
            selectedSuspect.id,
            autoMarks
          );
          newAutoMarks = addAutoMarksForSuspect(
            selectedSuspect.id,
            row,
            col,
            newAutoMarks,
            newPlacements
          );
          setAutoMarks(newAutoMarks);
          setMessage(
            `${selectedSuspect.name} swapped with ${existingSuspect.name}.`
          );
          setSelectedSuspect(null);
        } else {
          // Select the existing suspect
          setSelectedSuspect(existingSuspect);
          setMessage(
            `${existingSuspect.name} selected. Click another cell to move, or click again to remove.`
          );
        }
        return;
      }

      if (selectedSuspect) {
        if (!isOccupiable) {
          setMessage(
            `Cannot place suspects on ${cell.type}. Try a carpet, chair, or empty space.`
          );
          return;
        }
        saveToHistory();
        const newPlacements = { ...placements };
        const oldPosition = getPlacementPosition(selectedSuspect.id);
        if (oldPosition) {
          delete newPlacements[
            createCellKey(oldPosition.row, oldPosition.col)
          ];
        }
        newPlacements[cellKey] = selectedSuspect.id;
        setPlacements(newPlacements);
        // Remove old auto-marks (if moving) and add new ones
        let newAutoMarks = removeAutoMarksForSuspect(
          selectedSuspect.id,
          autoMarks
        );
        newAutoMarks = addAutoMarksForSuspect(
          selectedSuspect.id,
          row,
          col,
          newAutoMarks,
          newPlacements
        );
        setAutoMarks(newAutoMarks);
        setMessage(`${selectedSuspect.name} placed!`);
        setSelectedSuspect(null);
      } else {
        // Toggle manual mark
        saveToHistory();
        setManualMarks((prev) => {
          const newMarks = { ...prev };
          if (newMarks[cellKey]) {
            delete newMarks[cellKey];
          } else {
            newMarks[cellKey] = true;
          }
          return newMarks;
        });
      }
    },
    [
      boardLayout,
      getSuspectAt,
      selectedSuspect,
      placements,
      autoMarks,
      getPlacementPosition,
      addAutoMarksForSuspect,
      removeAutoMarksForSuspect,
      saveToHistory,
    ]
  );

  /**
   * Handles right-click on a cell.
   * If a suspect is selected, toggles that suspect's possibility mark on the cell.
   * Otherwise, toggles the manual X mark.
   *
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {Function} [onClearHighlights] - Optional callback to clear highlights
   */
  const handleCellRightClick = useCallback(
    (row, col, onClearHighlights) => {
      if (onClearHighlights) {
        onClearHighlights();
      }

      const cellKey = createCellKey(row, col);
      const existingSuspect = getSuspectAt(row, col);

      if (existingSuspect) {
        return;
      }

      // If a suspect is selected, toggle their possibility mark
      if (selectedSuspect) {
        saveToHistory();
        setPossibilityMarks((prev) => {
          const newMarks = { ...prev };
          const currentMarks = newMarks[cellKey] || [];

          if (currentMarks.includes(selectedSuspect.id)) {
            // Remove the suspect from this cell's possibility marks
            newMarks[cellKey] = currentMarks.filter(
              (id) => id !== selectedSuspect.id
            );
            if (newMarks[cellKey].length === 0) {
              delete newMarks[cellKey];
            }
          } else {
            // Add the suspect to this cell's possibility marks
            newMarks[cellKey] = [
              ...currentMarks,
              selectedSuspect.id,
            ].sort();
          }
          return newMarks;
        });
        return;
      }

      // No suspect selected - toggle manual X mark
      saveToHistory();
      setManualMarks((prev) => {
        const newMarks = { ...prev };
        if (newMarks[cellKey]) {
          delete newMarks[cellKey];
        } else {
          newMarks[cellKey] = true;
        }
        return newMarks;
      });
    },
    [getSuspectAt, selectedSuspect, saveToHistory]
  );

  /**
   * Resets the game state.
   */
  const handleReset = useCallback(() => {
    setPlacements({});
    setAutoMarks({});
    setManualMarks({});
    setPossibilityMarks({});
    setSelectedSuspect(null);
    setSelectedCell(null);
    setHistory([]);
    setMessage(MESSAGES.GAME_RESET);
  }, []);

  /**
   * Clears all X marks (both auto and manual).
   */
  const handleClearMarks = useCallback(() => {
    saveToHistory();
    setAutoMarks({});
    setManualMarks({});
    setMessage(MESSAGES.MARKS_CLEARED);
  }, [saveToHistory]);

  /**
   * Selects a suspect programmatically.
   *
   * @param {Suspect|null} suspect - The suspect to select or null to deselect
   */
  const selectSuspect = useCallback((suspect) => {
    setSelectedSuspect(suspect);
  }, []);

  return {
    // State
    placements,
    markedCells,
    possibilityMarks,
    selectedSuspect,
    selectedCell,
    message,
    history,

    // Derived values
    placedCount: Object.keys(placements).length,
    totalSuspects: suspects.length,

    // Actions
    handleSuspectClick,
    handleCellClick,
    handleCellRightClick,
    handleUndo,
    handleReset,
    handleClearMarks,
    selectSuspect,
    setMessage,

    // Helpers
    getSuspectAt,
    isSuspectPlaced,
    getPlacementPosition,
  };
}
