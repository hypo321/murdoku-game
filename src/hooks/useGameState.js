import { useState, useCallback, useEffect } from 'react';
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
 * Custom hook for managing game state including placements, marks, history, and selection.
 *
 * @param {Puzzle} puzzle - The current puzzle
 * @returns {Object} Game state and actions
 */
export function useGameState(puzzle) {
  const { suspects, boardLayout, gridSize } = puzzle;

  /** @type {[Placements, Function]} */
  const [placements, setPlacements] = useState({});
  /** @type {[MarkedCells, Function]} */
  const [markedCells, setMarkedCells] = useState({});
  /** @type {[Suspect|null, Function]} */
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  /** @type {[CellPosition|null, Function]} */
  const [selectedCell, setSelectedCell] = useState(null);
  /** @type {[string, Function]} */
  const [message, setMessage] = useState(MESSAGES.INITIAL);
  /** @type {[HistoryEntry[], Function]} */
  const [history, setHistory] = useState([]);

  /**
   * Saves current state to history for undo functionality.
   */
  const saveToHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev,
      {
        placements: { ...placements },
        markedCells: { ...markedCells },
      },
    ]);
  }, [placements, markedCells]);

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
    setMarkedCells(lastState.markedCells);
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
   * Adds X marks to all cells in the same row and column as a placement.
   *
   * @param {number} row - Row of the placement
   * @param {number} col - Column of the placement
   * @param {MarkedCells} currentMarks - Current marked cells
   * @returns {MarkedCells} Updated marked cells
   */
  const addCrossesToRowAndColumn = useCallback(
    (row, col, currentMarks) => {
      const newMarks = { ...currentMarks };

      for (let c = 0; c < gridSize; c++) {
        if (c !== col) {
          const key = createCellKey(row, c);
          if (!placements[key]) {
            newMarks[key] = true;
          }
        }
      }

      for (let r = 0; r < gridSize; r++) {
        if (r !== row) {
          const key = createCellKey(r, col);
          if (!placements[key]) {
            newMarks[key] = true;
          }
        }
      }

      return newMarks;
    },
    [gridSize, placements]
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
          saveToHistory();
          const newPlacements = { ...placements };
          delete newPlacements[cellKey];
          setPlacements(newPlacements);
          setMessage(
            `${existingSuspect.name} removed from the board.`
          );
          setSelectedSuspect(null);
        } else if (selectedSuspect) {
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
          const newMarks = addCrossesToRowAndColumn(
            row,
            col,
            markedCells
          );
          setMarkedCells(newMarks);
          setMessage(
            `${selectedSuspect.name} swapped with ${existingSuspect.name}.`
          );
          setSelectedSuspect(null);
        } else {
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
        const newMarks = addCrossesToRowAndColumn(
          row,
          col,
          markedCells
        );
        setMarkedCells(newMarks);
        setMessage(`${selectedSuspect.name} placed!`);
        setSelectedSuspect(null);
      } else {
        saveToHistory();
        setMarkedCells((prev) => ({
          ...prev,
          [cellKey]: !prev[cellKey],
        }));
      }
    },
    [
      boardLayout,
      getSuspectAt,
      selectedSuspect,
      placements,
      markedCells,
      getPlacementPosition,
      addCrossesToRowAndColumn,
      saveToHistory,
    ]
  );

  /**
   * Handles right-click on a cell (toggle X mark).
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

      setMarkedCells((prev) => ({
        ...prev,
        [cellKey]: !prev[cellKey],
      }));
    },
    [getSuspectAt]
  );

  /**
   * Resets the game state.
   */
  const handleReset = useCallback(() => {
    setPlacements({});
    setMarkedCells({});
    setSelectedSuspect(null);
    setSelectedCell(null);
    setHistory([]);
    setMessage(MESSAGES.GAME_RESET);
  }, []);

  /**
   * Clears all X marks.
   */
  const handleClearMarks = useCallback(() => {
    saveToHistory();
    setMarkedCells({});
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
