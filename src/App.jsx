import { useState, useCallback } from 'react';
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
  } = gameState;

  /**
   * Wraps cell click to clear highlights first.
   */
  const handleCellClick = useCallback(
    (row, col) => {
      gameHandleCellClick(row, col, clearHighlights);
    },
    [gameHandleCellClick, clearHighlights]
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

    if (result.isComplete) {
      setMessage(
        '🎉 Congratulations! All suspects are correctly placed! You solved the Murdoku!'
      );
    } else {
      setMessage(
        `${
          result.correctCount
        }/${totalSuspects} correct. Wrong placements: ${result.wrongNames.join(
          ', '
        )}`
      );
    }
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
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
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
                it as eliminated
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

      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Based on the Murdoku puzzle concept</p>
      </footer>
    </div>
  );
}

export default App;
