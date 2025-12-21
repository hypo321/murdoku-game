import { useState, useCallback, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import SuspectCard from './components/SuspectCard';
import { occupiableTypes } from './data/gameData';
import {
  getPuzzle,
  defaultPuzzleId,
  puzzleList,
} from './data/puzzles';
import { generateHint } from './utils/hintGenerator';

function App() {
  const [currentPuzzleId, setCurrentPuzzleId] =
    useState(defaultPuzzleId);
  const puzzle = getPuzzle(currentPuzzleId);

  const [placements, setPlacements] = useState({});
  const [markedCells, setMarkedCells] = useState({});
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [message, setMessage] = useState(
    'Select a suspect, then click a cell to place them.'
  );
  const [history, setHistory] = useState([]);
  const [errorCells, setErrorCells] = useState({});
  const [hintCells, setHintCells] = useState({});

  const { suspects, boardLayout, solution, gridSize } = puzzle;

  function saveToHistory() {
    setHistory((prev) => [
      ...prev,
      {
        placements: { ...placements },
        markedCells: { ...markedCells },
      },
    ]);
  }

  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      setMessage('Nothing to undo.');
      return;
    }
    const lastState = history[history.length - 1];
    setPlacements(lastState.placements);
    setMarkedCells(lastState.markedCells);
    setHistory((prev) => prev.slice(0, -1));
    setMessage('Undo successful.');
  }, [history]);

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

  const getSuspectAt = useCallback(
    (row, col) => {
      const key = `${row}-${col}`;
      const suspectId = placements[key];
      if (suspectId) {
        return suspects.find((s) => s.id === suspectId);
      }
      return null;
    },
    [placements, suspects]
  );

  const isSuspectPlaced = useCallback(
    (suspectId) => {
      return Object.values(placements).includes(suspectId);
    },
    [placements]
  );

  const getPlacementPosition = useCallback(
    (suspectId) => {
      for (const [key, id] of Object.entries(placements)) {
        if (id === suspectId) {
          const [row, col] = key.split('-').map(Number);
          return { row, col };
        }
      }
      return null;
    },
    [placements]
  );

  function handleSuspectClick(suspect) {
    if (selectedSuspect?.id === suspect.id) {
      setSelectedSuspect(null);
      setMessage('Suspect deselected.');
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
  }

  function addCrossesToRowAndColumn(row, col, currentMarks) {
    const newMarks = { ...currentMarks };

    for (let c = 0; c < gridSize; c++) {
      if (c !== col) {
        const key = `${row}-${c}`;
        if (!placements[key]) {
          newMarks[key] = true;
        }
      }
    }

    for (let r = 0; r < gridSize; r++) {
      if (r !== row) {
        const key = `${r}-${col}`;
        if (!placements[key]) {
          newMarks[key] = true;
        }
      }
    }

    return newMarks;
  }

  function handleCellClick(row, col) {
    setErrorCells({});
    setHintCells({});
    const cellKey = `${row}-${col}`;
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
        setMessage(`${existingSuspect.name} removed from the board.`);
        setSelectedSuspect(null);
      } else if (selectedSuspect) {
        saveToHistory();
        const newPlacements = { ...placements };
        const oldPosition = getPlacementPosition(selectedSuspect.id);
        if (oldPosition) {
          delete newPlacements[
            `${oldPosition.row}-${oldPosition.col}`
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
        delete newPlacements[`${oldPosition.row}-${oldPosition.col}`];
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
  }

  function handleCellRightClick(row, col) {
    setErrorCells({});
    setHintCells({});
    const cellKey = `${row}-${col}`;
    const existingSuspect = getSuspectAt(row, col);

    if (existingSuspect) {
      return;
    }

    setMarkedCells((prev) => ({
      ...prev,
      [cellKey]: !prev[cellKey],
    }));
  }

  function handleReset() {
    setPlacements({});
    setMarkedCells({});
    setSelectedSuspect(null);
    setSelectedCell(null);
    setHistory([]);
    setErrorCells({});
    setHintCells({});
    setMessage('Game reset! Select a suspect to begin.');
  }

  function handleClearMarks() {
    saveToHistory();
    setMarkedCells({});
    setMessage('All marks cleared.');
  }

  function validateCurrentState() {
    const errors = {
      wrongPlacements: [],
      wrongMarks: [],
    };

    // Check for wrongly placed suspects
    for (const [cellKey, suspectId] of Object.entries(placements)) {
      const [row, col] = cellKey.split('-').map(Number);
      const correctPos = solution[suspectId];
      if (correctPos.row !== row || correctPos.col !== col) {
        const suspect = suspects.find((s) => s.id === suspectId);
        errors.wrongPlacements.push({
          suspect,
          currentPos: { row, col },
          correctPos,
        });
      }
    }

    // Check for X marks on cells that should have suspects
    for (const cellKey of Object.keys(markedCells)) {
      if (!markedCells[cellKey]) continue;
      const [row, col] = cellKey.split('-').map(Number);
      for (const [, pos] of Object.entries(solution)) {
        if (pos.row === row && pos.col === col) {
          errors.wrongMarks.push({ row, col });
          break;
        }
      }
    }

    return errors;
  }

  function handleGetHint() {
    setErrorCells({});
    setHintCells({});
    const errors = validateCurrentState();

    if (errors.wrongPlacements.length > 0) {
      const first = errors.wrongPlacements[0];
      setMessage(
        `⚠️ ${first.suspect.name} is not in the correct position. Try moving them.`
      );
      return;
    }

    if (errors.wrongMarks.length > 0) {
      const highlightedCells = {};
      for (const cell of errors.wrongMarks) {
        highlightedCells[`${cell.row}-${cell.col}`] = true;
      }
      setErrorCells(highlightedCells);
      setMessage(
        `⚠️ Something is wrong with the highlighted cell${
          errors.wrongMarks.length > 1 ? 's' : ''
        }. Check your X marks.`
      );
      return;
    }

    // Generate a hint based on current state
    const hint = generateHint(puzzle, placements, markedCells);
    setMessage(hint.message);

    if (hint.highlightCells && hint.highlightCells.length > 0) {
      const highlighted = {};
      for (const cell of hint.highlightCells) {
        highlighted[`${cell.row}-${cell.col}`] = true;
      }
      setHintCells(highlighted);
    }

    // Auto-select the suspect if the hint is for placement (not marking X's)
    if (hint.suspect && hint.action !== 'mark') {
      const suspectToSelect = suspects.find(
        (s) => s.id === hint.suspect
      );
      if (suspectToSelect) {
        setSelectedSuspect(suspectToSelect);
      }
    }
  }

  function handleCheckSolution() {
    const totalSuspects = suspects.length;
    const placedCount = Object.keys(placements).length;

    if (placedCount < totalSuspects) {
      setMessage(
        `Place all ${totalSuspects} suspects before checking! (${placedCount}/${totalSuspects} placed)`
      );
      return;
    }

    let correctCount = 0;
    const wrongPlacements = [];

    for (const suspect of suspects) {
      const correctPos = solution[suspect.id];
      const correctKey = `${correctPos.row}-${correctPos.col}`;
      const placedKey = Object.entries(placements).find(
        ([, id]) => id === suspect.id
      )?.[0];

      if (placedKey === correctKey) {
        correctCount++;
      } else {
        wrongPlacements.push(suspect.name);
      }
    }

    if (correctCount === totalSuspects) {
      setMessage(
        '🎉 Congratulations! All suspects are correctly placed! You solved the Murdoku!'
      );
    } else {
      setMessage(
        `${correctCount}/${totalSuspects} correct. Wrong placements: ${wrongPlacements.join(
          ', '
        )}`
      );
    }
  }

  const placedCount = Object.keys(placements).length;
  const totalSuspects = suspects.length;

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
