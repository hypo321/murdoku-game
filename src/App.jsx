/* global __BUILD_TIME__ */
import { useState, useCallback, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import SuspectCard from './components/SuspectCard';
import {
  getPuzzle,
  defaultPuzzleId,
  puzzleList,
} from './data/puzzles';
import { useGameState, useHints, useValidation } from './hooks';

/**
 * Main application component for Murdoku game.
 * Uses custom hooks for game state, hints, and validation.
 */
function App() {
  const [currentPuzzleId, setCurrentPuzzleId] =
    useState(defaultPuzzleId);
  const puzzle = getPuzzle(currentPuzzleId);
  const { suspects } = puzzle;

  // Custom hooks for game logic
  const gameState = useGameState(puzzle);
  const { errorCells, hintCells, getHint, clearHighlights } =
    useHints(puzzle);
  const { checkCurrentSolution } = useValidation(puzzle);

  // Destructure game state for easier access
  const {
    placements,
    markedCells,
    possibilityMarks,
    selectedSuspect,
    selectedCell,
    message,
    history,
    placedCount,
    totalSuspects,
    handleSuspectClick,
    handleCellClick: gameHandleCellClick,
    handleCellRightClick: gameHandleCellRightClick,
    handleUndo,
    handleReset: gameHandleReset,
    handleClearMarks,
    selectSuspect,
    setMessage,
    getSuspectAt,
    isSuspectPlaced,
    // Drag helpers
    addManualMark,
    removeManualMark,
    addPossibilityMark,
    removePossibilityMark,
    hasManualMark,
    hasPossibilityMark,
    saveToHistory,
  } = gameState;

  // Drag state - using ref to avoid re-renders during drag
  const dragStateRef = useRef({
    isDragging: false,
    dragAction: null, // 'addMark', 'removeMark', 'addPossibility', 'removePossibility'
    lastCell: null, // Track last cell to avoid redundant calls with mousemove
    lastActionTime: 0, // Timestamp to prevent click from firing after mousedown/touch
    pendingPossibility: null, // For selected suspect: wait to see if drag occurs
    pendingPlacement: null, // For selected suspect: tap placement fallback
    isPointerDown: false, // Track mouse/touch down state
  });

  /**
   * Handles mouse/touch down on a cell to start drag operation.
   * - With suspect selected on empty cell: arm possibility drag; placement happens if no drag.
   * - With no suspect: start X drag.
   */
  const handleCellMouseDown = useCallback(
    (row, col, button, isTouch = false) => {
      dragStateRef.current.isPointerDown = true;
      if (isTouch) {
        dragStateRef.current.lastActionTime = Date.now();
      }
      clearHighlights();
      const existingSuspect = getSuspectAt(row, col);

      // Left-click (button 0)
      if (button === 0) {
        // Suspect selected on empty cell: arm possibility drag; placement on click/tap if no drag
        if (selectedSuspect && !existingSuspect) {
          const action = hasPossibilityMark(row, col)
            ? 'removePossibility'
            : 'addPossibility';
          dragStateRef.current = {
            ...dragStateRef.current,
            isDragging: false,
            dragAction: null,
            lastCell: null,
            pendingPossibility: { action, row, col },
            pendingPlacement: { row, col },
          };
          return;
        }

        // Clicking on existing suspect – let click handler manage selection/removal
        if (existingSuspect) {
          return;
        }

        // No suspect selected: X drag
        dragStateRef.current.lastActionTime = Date.now();
        saveToHistory();
        if (hasManualMark(row, col)) {
          dragStateRef.current = {
            ...dragStateRef.current,
            isDragging: true,
            dragAction: 'removeMark',
            lastCell: `${row}-${col}`,
          };
          removeManualMark(row, col);
        } else {
          dragStateRef.current = {
            ...dragStateRef.current,
            isDragging: true,
            dragAction: 'addMark',
            lastCell: `${row}-${col}`,
          };
          addManualMark(row, col);
        }
        return;
      }

      // Right-click (button 2)
      if (button === 2) {
        if (existingSuspect) return;
        saveToHistory();

        if (selectedSuspect) {
          if (hasPossibilityMark(row, col)) {
            dragStateRef.current = {
              ...dragStateRef.current,
              isDragging: true,
              dragAction: 'removePossibility',
              lastCell: `${row}-${col}`,
            };
            removePossibilityMark(row, col);
          } else {
            dragStateRef.current = {
              ...dragStateRef.current,
              isDragging: true,
              dragAction: 'addPossibility',
              lastCell: `${row}-${col}`,
            };
            addPossibilityMark(row, col);
          }
        } else {
          if (hasManualMark(row, col)) {
            dragStateRef.current = {
              ...dragStateRef.current,
              isDragging: true,
              dragAction: 'removeMark',
              lastCell: `${row}-${col}`,
            };
            removeManualMark(row, col);
          } else {
            dragStateRef.current = {
              ...dragStateRef.current,
              isDragging: true,
              dragAction: 'addMark',
              lastCell: `${row}-${col}`,
            };
            addManualMark(row, col);
          }
        }
      }
    },
    [
      clearHighlights,
      getSuspectAt,
      saveToHistory,
      selectedSuspect,
      hasPossibilityMark,
      removePossibilityMark,
      addPossibilityMark,
      hasManualMark,
      removeManualMark,
      addManualMark,
    ]
  );

  /**
   * Handles mouse move on a cell during drag operation.
   * Applies the same action determined at drag start.
   */
  const handleCellMouseEnter = useCallback(
    (row, col) => {
      // If a possibility drag is pending (suspect selected, no drag yet), start drag now
      if (dragStateRef.current.pendingPossibility) {
        const {
          action,
          row: startRow,
          col: startCol,
        } = dragStateRef.current.pendingPossibility;
        dragStateRef.current.pendingPossibility = null;
        dragStateRef.current.pendingPlacement = null;
        dragStateRef.current.isDragging = true;
        dragStateRef.current.dragAction = action;
        dragStateRef.current.lastCell = `${startRow}-${startCol}`;
        saveToHistory();
        if (action === 'addPossibility') {
          addPossibilityMark(startRow, startCol);
        } else {
          removePossibilityMark(startRow, startCol);
        }
      }

      if (!dragStateRef.current.isDragging) return;

      // Skip if we're still in the same cell (mousemove fires continuously)
      const cellKey = `${row}-${col}`;
      if (dragStateRef.current.lastCell === cellKey) return;
      dragStateRef.current.lastCell = cellKey;

      const existingSuspect = getSuspectAt(row, col);
      if (existingSuspect) return;

      const { dragAction } = dragStateRef.current;
      switch (dragAction) {
        case 'addMark':
          addManualMark(row, col);
          break;
        case 'removeMark':
          removeManualMark(row, col);
          break;
        case 'addPossibility':
          addPossibilityMark(row, col);
          break;
        case 'removePossibility':
          removePossibilityMark(row, col);
          break;
      }
    },
    [
      getSuspectAt,
      addManualMark,
      removeManualMark,
      addPossibilityMark,
      removePossibilityMark,
    ]
  );

  /**
   * Handles mouse up to end drag operation.
   */
  const handleDragEnd = useCallback(() => {
    // If no drag occurred and a placement was pending (touch tap), place the suspect now
    if (
      !dragStateRef.current.isDragging &&
      dragStateRef.current.pendingPlacement
    ) {
      const { row, col } = dragStateRef.current.pendingPlacement;
      gameHandleCellClick(row, col, clearHighlights);
    }

    dragStateRef.current = {
      ...dragStateRef.current,
      isDragging: false,
      dragAction: null,
      lastCell: null,
      pendingPossibility: null,
      pendingPlacement: null,
      isPointerDown: false,
    };
  }, [clearHighlights, gameHandleCellClick]);

  // Global touchmove handler with debug logging
  useEffect(() => {
    const handleGlobalTouchMove = (e) => {
      // If a possibility drag was armed on touchstart and we move, start the drag now
      if (dragStateRef.current.pendingPossibility) {
        const { action, row, col } =
          dragStateRef.current.pendingPossibility;
        dragStateRef.current.pendingPossibility = null;
        dragStateRef.current.pendingPlacement = null;
        dragStateRef.current.isDragging = true;
        dragStateRef.current.dragAction = action;
        dragStateRef.current.lastCell = `${row}-${col}`;
        saveToHistory();
        if (action === 'addPossibility') {
          addPossibilityMark(row, col);
        } else {
          removePossibilityMark(row, col);
        }
      }

      if (!dragStateRef.current.isDragging) return;

      const touch = e.touches[0];
      let target = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      // Traverse up to find element with data-row/data-col
      while (target && target.dataset?.row === undefined) {
        target = target.parentElement;
      }

      if (target) {
        const row = target.dataset?.row;
        const col = target.dataset?.col;
        if (row !== undefined && col !== undefined) {
          const cellKey = `${row}-${col}`;
          if (dragStateRef.current.lastCell === cellKey) return;
          dragStateRef.current.lastCell = cellKey;

          const rowNum = parseInt(row, 10);
          const colNum = parseInt(col, 10);
          const existingSuspect = getSuspectAt(rowNum, colNum);
          if (existingSuspect) return;

          console.log(
            '[TOUCHMOVE] executing:',
            dragStateRef.current.dragAction,
            'on',
            rowNum,
            colNum
          );
          const { dragAction } = dragStateRef.current;
          switch (dragAction) {
            case 'addMark':
              addManualMark(rowNum, colNum);
              break;
            case 'removeMark':
              removeManualMark(rowNum, colNum);
              break;
            case 'addPossibility':
              addPossibilityMark(rowNum, colNum);
              break;
            case 'removePossibility':
              removePossibilityMark(rowNum, colNum);
              break;
          }
        }
      }
    };

    document.addEventListener('touchmove', handleGlobalTouchMove, {
      passive: true,
    });
    return () =>
      document.removeEventListener(
        'touchmove',
        handleGlobalTouchMove
      );
  }, [
    getSuspectAt,
    addManualMark,
    removeManualMark,
    addPossibilityMark,
    removePossibilityMark,
  ]);

  /**
   * Wraps cell click to clear highlights first.
   * X marks are now handled by mousedown/touchstart, so click only handles:
   * - Clicking on existing suspects (to select/remove them)
   * - Placing selected suspects on cells
   */
  const handleCellClick = useCallback(
    (row, col) => {
      // Skip if mousedown/touchstart just handled this (within 500ms)
      // This prevents touch devices from double-firing (touchstart + click)
      if (Date.now() - dragStateRef.current.lastActionTime < 500) {
        return;
      }

      // If a possibility drag was armed but no drag happened, treat as placement (default)
      if (dragStateRef.current.pendingPossibility) {
        dragStateRef.current.pendingPossibility = null;
        if (dragStateRef.current.pendingPlacement) {
          gameHandleCellClick(row, col, clearHighlights);
          dragStateRef.current.pendingPlacement = null;
          return;
        }
        gameHandleCellClick(row, col, clearHighlights);
        return;
      }

      // If touch/mouse down stored a pending placement and no drag happened, place suspect
      if (dragStateRef.current.pendingPlacement) {
        dragStateRef.current.pendingPlacement = null;
        gameHandleCellClick(row, col, clearHighlights);
        return;
      }

      const existingSuspect = getSuspectAt(row, col);

      // If no suspect selected and no existing suspect, mousedown already handled X marks
      if (!selectedSuspect && !existingSuspect) {
        return;
      }

      // Otherwise, let gameHandleCellClick handle suspect selection/placement
      gameHandleCellClick(row, col, clearHighlights);
    },
    [
      gameHandleCellClick,
      clearHighlights,
      getSuspectAt,
      selectedSuspect,
    ]
  );

  /**
   * Wraps cell right-click to clear highlights first.
   */
  const handleCellRightClick = useCallback(
    (row, col) => {
      gameHandleCellRightClick(row, col, clearHighlights);
    },
    [gameHandleCellRightClick, clearHighlights]
  );

  /**
   * Wraps reset to also clear highlights.
   */
  const handleReset = useCallback(() => {
    clearHighlights();
    gameHandleReset();
  }, [clearHighlights, gameHandleReset]);

  /**
   * Gets a hint and handles the result.
   */
  function handleGetHint() {
    const result = getHint(placements, markedCells);

    if (result.error) {
      if (result.error.type === 'wrongPlacement') {
        const { suspect } = result.error.data;
        setMessage(
          `⚠️ ${suspect.name} is not in the correct position. Try moving them.`
        );
      } else if (result.error.type === 'wrongMarks') {
        const count = result.error.data.length;
        setMessage(
          `⚠️ Something is wrong with the highlighted cell${
            count > 1 ? 's' : ''
          }. Check your X marks.`
        );
      }
      return;
    }

    if (result.hint) {
      setMessage(result.hint.message);
      if (result.suspectToSelect) {
        selectSuspect(result.suspectToSelect);
      }
    }
  }

  /**
   * Gets the congratulations or failure message based on solution result.
   */
  function getSolutionMessage(result) {
    if (result.isComplete) {
      const murdererSuspect = suspects.find(
        (s) => s.id === puzzle.murderer
      );
      const victimSuspect = suspects.find(
        (s) => s.id === puzzle.victim
      );
      const roomName =
        puzzle.rooms[puzzle.crimeRoom]?.name || puzzle.crimeRoom;

      return `🎉 Congratulations, detective! You have caught the killer ${
        murdererSuspect?.name || 'Unknown'
      } who was alone with ${
        victimSuspect?.name || 'the victim'
      } in the ${roomName}!`;
    } else {
      const wrongCount = totalSuspects - result.correctCount;
      return `❌ Not quite right! ${wrongCount} suspect${
        wrongCount > 1 ? 's are' : ' is'
      } in the wrong position. Keep trying!`;
    }
  }

  /**
   * Auto-check solution when all suspects are placed.
   */
  useEffect(() => {
    if (placedCount === totalSuspects && totalSuspects > 0) {
      const result = checkCurrentSolution(placements);
      setMessage(getSolutionMessage(result));
    }
  }, [placedCount, totalSuspects, placements]);

  /**
   * Checks the current solution and displays the result.
   */
  function handleCheckSolution() {
    const result = checkCurrentSolution(placements);

    if (!result.allPlaced) {
      setMessage(
        `Place all ${totalSuspects} suspects before checking! (${placedCount}/${totalSuspects} placed)`
      );
      return;
    }

    setMessage(getSolutionMessage(result));
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-pink-500 mb-2">
          MURDOKU
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          {puzzle.subtitle}
        </p>
        <p className="text-yellow-400 text-xs mt-1">
          Difficulty: {puzzle.difficulty}
        </p>
        {puzzleList.length > 1 && (
          <select
            value={currentPuzzleId}
            onChange={(e) => {
              setCurrentPuzzleId(e.target.value);
              handleReset();
            }}
            className="mt-2 px-3 py-1 bg-gray-700 text-white rounded-lg text-sm"
          >
            {puzzleList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.difficulty})
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Game Board
            </h2>
            <GameBoard
              puzzle={puzzle}
              markedCells={markedCells}
              possibilityMarks={possibilityMarks}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
              onDragEnd={handleDragEnd}
              getSuspectAt={getSuspectAt}
              errorCells={errorCells}
              hintCells={hintCells}
            />

            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-200 text-sm text-center">
                {message}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleClearMarks}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Clear Marks
              </button>
              <button
                onClick={handleCheckSolution}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Check Solution
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Undo
              </button>
              <button
                onClick={handleGetHint}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                💡 Get Hint
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-gray-400">Progress: </span>
              <span className="text-teal-400 font-bold">
                {placedCount}
              </span>
              <span className="text-gray-400">
                {' '}
                / {totalSuspects} suspects placed
              </span>
            </div>
          </div>

          <div className="mt-6 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-lg font-bold text-white mb-3">
              Instructions
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                • <strong>Left-click</strong> a suspect card, then a
                cell to place them
              </li>
              <li>
                • <strong>Right-click</strong> a cell to mark/unmark
                it as eliminated (X)
              </li>
              <li>
                • <strong>Right-click with suspect selected</strong>{' '}
                to mark possible locations (shows initial)
              </li>
              <li>
                • <strong>Rule:</strong> One person per row and column
              </li>
              <li>
                • <strong>&quot;Beside&quot;</strong> means adjacent
                (left, right, up, down) in the same room
              </li>
              <li>
                • Find where Violet was alone with the murderer!
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:w-80">
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-4">
              Suspects & Clues
            </h2>
            <div className="space-y-2">
              {suspects.map((suspect) => (
                <SuspectCard
                  key={suspect.id}
                  suspect={suspect}
                  isSelected={selectedSuspect?.id === suspect.id}
                  isPlaced={isSuspectPlaced(suspect.id)}
                  onClick={handleSuspectClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center mt-8 text-gray-500 text-xs">
        <p>Based on the Murdoku puzzle concept</p>
        <p className="mt-1 text-gray-600">
          Build: {new Date(__BUILD_TIME__).toLocaleString()}
        </p>
      </footer>
    </div>
  );
}

export default App;
