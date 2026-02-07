/* global __BUILD_TIME__ */
import { useState, useCallback, useMemo } from 'react';
import { cellTypes, occupiableTypes } from '../data/gameData';
import { puzzles } from '../data/puzzles';

/**
 * Abbreviations for cell types displayed in the grid.
 */
const cellTypeAbbrev = {
  [cellTypes.EMPTY]: '',
  [cellTypes.CARPET]: 'CPT',
  [cellTypes.CHAIR]: 'CHR',
  [cellTypes.CAR]: 'CAR',
  [cellTypes.TV]: 'TV',
  [cellTypes.SHELF]: 'SHF',
  [cellTypes.TABLE]: 'TBL',
  [cellTypes.FLOWERS]: 'FLW',
  [cellTypes.LILY_PAD]: 'LPD',
  [cellTypes.TREE]: 'TRE',
  [cellTypes.BUSH]: 'BSH',
  [cellTypes.BED]: 'BED',
  [cellTypes.COUCH]: 'CCH',
  [cellTypes.POND_WATER]: 'WTR',
  [cellTypes.HORSE]: 'HRS',
  [cellTypes.PLANT]: 'PLT',
  [cellTypes.TRACK]: 'TRK',
  [cellTypes.FINISHING_LINE]: 'FIN',
  [cellTypes.OIL_SLICK]: 'OIL',
  [cellTypes.BONSAI]: 'BON',
  [cellTypes.CACTUS]: 'CAC',
  [cellTypes.SHRUB]: 'SRB',
  [cellTypes.PATH]: 'PTH',
  [cellTypes.BOX]: 'BOX',
};

/**
 * All available cell types for the picker.
 */
const allCellTypes = Object.entries(cellTypes).map(
  ([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' '),
    abbrev: cellTypeAbbrev[value] || value.slice(0, 3).toUpperCase(),
  }),
);

/**
 * Default room colors for new rooms.
 */
const defaultColors = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
  '#d35400',
  '#c0392b',
  '#16a085',
  '#8e44ad',
  '#f1c40f',
  '#27ae60',
  '#2980b9',
];

/**
 * Grid Editor component for visually editing puzzle board layouts.
 * Shows the background image as reference alongside an editable grid.
 *
 * @param {Object} props
 * @param {string} props.puzzleId - ID of the puzzle to edit
 * @param {function} props.onExit - Callback to exit editor mode
 * @returns {JSX.Element}
 */
function GridEditor({ puzzleId, onExit }) {
  const originalPuzzle = puzzles[puzzleId];

  // Editable state
  const [boardLayout, setBoardLayout] = useState(() =>
    JSON.parse(JSON.stringify(originalPuzzle.boardLayout)),
  );
  const [rooms, setRooms] = useState(() =>
    JSON.parse(JSON.stringify(originalPuzzle.rooms)),
  );
  const [gridSize] = useState(originalPuzzle.gridSize);
  const [cellSize] = useState(originalPuzzle.cellSize);
  const [imageBorder] = useState(originalPuzzle.imageBorder);

  // Paint mode state
  const [paintMode, setPaintMode] = useState('room'); // 'room', 'cellType', or 'solution'
  const [selectedRoom, setSelectedRoom] = useState(
    () => Object.keys(originalPuzzle.rooms)[0],
  );
  const [selectedCellType, setSelectedCellType] = useState(
    cellTypes.EMPTY,
  );

  // Solution editing state
  const [solution, setSolution] = useState(() => {
    const initial = {};
    if (originalPuzzle.solution) {
      for (const [suspectId, pos] of Object.entries(
        originalPuzzle.solution,
      )) {
        initial[suspectId] = { row: pos.row, col: pos.col };
      }
    }
    return initial;
  });
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copiedExport, setCopiedExport] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [imageOpacity, setImageOpacity] = useState(0.6);

  // Sorted room entries for display
  const roomEntries = useMemo(
    () =>
      Object.entries(rooms).sort((a, b) =>
        a[1].name.localeCompare(b[1].name),
      ),
    [rooms],
  );

  // Reverse lookup: cell key -> suspect id for grid display
  const solutionByCell = useMemo(() => {
    const map = {};
    for (const [suspectId, pos] of Object.entries(solution)) {
      map[`${pos.row}-${pos.col}`] = suspectId;
    }
    return map;
  }, [solution]);

  /**
   * Gets a suspect object by ID.
   */
  const getSuspectById = useCallback(
    (id) => originalPuzzle.suspects.find((s) => s.id === id) || null,
    [originalPuzzle.suspects],
  );

  /**
   * Applies paint to a single cell based on current paint mode.
   */
  const paintCell = useCallback(
    (row, col) => {
      if (paintMode === 'solution') {
        // Solution mode: handled in handleCellMouseDown, no drag
        return;
      }
      setBoardLayout((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (paintMode === 'room') {
          next[row][col].room = selectedRoom;
        } else {
          next[row][col].type = selectedCellType;
        }
        return next;
      });
    },
    [paintMode, selectedRoom, selectedCellType],
  );

  /**
   * Places or removes a suspect on the grid in solution mode.
   */
  const handleSolutionClick = useCallback(
    (row, col) => {
      const cellKey = `${row}-${col}`;
      const existingSuspect = solutionByCell[cellKey];

      // Clicking on a placed suspect removes them
      if (existingSuspect) {
        setSolution((prev) => {
          const next = { ...prev };
          delete next[existingSuspect];
          return next;
        });
        setSelectedSuspect(existingSuspect);
        return;
      }

      // If no suspect selected, do nothing
      if (!selectedSuspect) return;

      // Check cell is occupiable
      const cell = boardLayout[row]?.[col];
      if (cell && !occupiableTypes.includes(cell.type)) return;

      // Place the selected suspect
      setSolution((prev) => ({
        ...prev,
        [selectedSuspect]: { row, col },
      }));

      // Auto-advance to next unplaced suspect
      const suspectIds = originalPuzzle.suspects.map((s) => s.id);
      const currentIdx = suspectIds.indexOf(selectedSuspect);
      const updatedSolution = {
        ...solution,
        [selectedSuspect]: { row, col },
      };
      let nextSuspect = null;
      for (let i = 1; i < suspectIds.length; i++) {
        const candidate =
          suspectIds[(currentIdx + i) % suspectIds.length];
        if (!updatedSolution[candidate]) {
          nextSuspect = candidate;
          break;
        }
      }
      setSelectedSuspect(nextSuspect);
    },
    [
      selectedSuspect,
      solutionByCell,
      boardLayout,
      originalPuzzle.suspects,
      solution,
    ],
  );

  /**
   * Handles mouse down on a grid cell.
   */
  const handleCellMouseDown = useCallback(
    (row, col, e) => {
      e.preventDefault();
      if (paintMode === 'solution') {
        handleSolutionClick(row, col);
        return;
      }
      setIsDragging(true);
      paintCell(row, col);
    },
    [paintCell, paintMode, handleSolutionClick],
  );

  /**
   * Handles mouse enter during drag.
   */
  const handleCellMouseEnter = useCallback(
    (row, col) => {
      if (!isDragging) return;
      paintCell(row, col);
    },
    [isDragging, paintCell],
  );

  /**
   * Handles drag end.
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Adds a new room to the room list.
   */
  const handleAddRoom = useCallback(() => {
    const id = newRoomId.trim();
    const name = newRoomName.trim();
    if (!id || !name) return;
    if (rooms[id]) {
      alert(`Room ID "${id}" already exists.`);
      return;
    }
    const colorIndex =
      Object.keys(rooms).length % defaultColors.length;
    setRooms((prev) => ({
      ...prev,
      [id]: { name, color: defaultColors[colorIndex] },
    }));
    setSelectedRoom(id);
    setNewRoomId('');
    setNewRoomName('');
  }, [newRoomId, newRoomName, rooms]);

  /**
   * Updates a room's color.
   */
  const handleRoomColorChange = useCallback((roomId, color) => {
    setRooms((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], color },
    }));
  }, []);

  /**
   * Generates the exportable boardLayout code string.
   */
  const generateBoardLayoutCode = useCallback(() => {
    const lines = ['boardLayout: ['];
    boardLayout.forEach((row, rowIndex) => {
      lines.push(`\t\t// Row ${rowIndex}`);
      lines.push('\t\t[');
      row.forEach((cell) => {
        const typeKey = Object.entries(cellTypes).find(
          ([, v]) => v === cell.type,
        )?.[0];
        lines.push(
          `\t\t\t{ room: '${cell.room}', type: cellTypes.${typeKey} },`,
        );
      });
      lines.push('\t\t],');
    });
    lines.push('\t],');
    return lines.join('\n');
  }, [boardLayout]);

  /**
   * Generates the exportable rooms code string.
   */
  const generateRoomsCode = useCallback(() => {
    const lines = ['rooms: {'];
    Object.entries(rooms).forEach(([id, room]) => {
      lines.push(
        `\t\t${id}: { name: '${room.name}', color: '${room.color}' },`,
      );
    });
    lines.push('\t},');
    return lines.join('\n');
  }, [rooms]);

  /**
   * Generates the exportable solution code string.
   */
  const generateSolutionCode = useCallback(() => {
    const lines = ['solution: {'];
    const suspectIds = originalPuzzle.suspects.map((s) => s.id);
    for (const id of suspectIds) {
      const pos = solution[id];
      if (pos) {
        lines.push(
          `\t\t${id}: { row: ${pos.row}, col: ${pos.col} },`,
        );
      } else {
        lines.push(`\t\t// ${id}: NOT PLACED`);
      }
    }
    lines.push('\t},');
    return lines.join('\n');
  }, [solution, originalPuzzle.suspects]);

  /**
   * Copies text to clipboard.
   */
  const copyToClipboard = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExport(label);
      setTimeout(() => setCopiedExport(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedExport(label);
      setTimeout(() => setCopiedExport(null), 2000);
    }
  }, []);

  /**
   * Gets the background color for a cell based on its room.
   */
  const getCellBgColor = useCallback(
    (cell) => {
      const room = rooms[cell.room];
      return room?.color || '#666';
    },
    [rooms],
  );

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-pink-500 mb-1">
          MURDOKU Grid Editor
        </h1>
        <p className="text-gray-400 text-sm">
          Editing:{' '}
          <strong className="text-white">
            {originalPuzzle.name}
          </strong>{' '}
          ({originalPuzzle.difficulty})
        </p>
        <button
          onClick={onExit}
          className="mt-2 px-4 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
        >
          Back to Game
        </button>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-6">
        {/* Left panel: Controls */}
        <div className="xl:w-72 shrink-0 space-y-4">
          {/* Paint mode toggle */}
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-white font-bold mb-2">Paint Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPaintMode('room')}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  paintMode === 'room'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Room
              </button>
              <button
                onClick={() => setPaintMode('cellType')}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  paintMode === 'cellType'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Cell Type
              </button>
              <button
                onClick={() => setPaintMode('solution')}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  paintMode === 'solution'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Solution
              </button>
            </div>
          </div>

          {/* Room picker */}
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-white font-bold mb-2">Rooms</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {roomEntries.map(([id, room]) => (
                <div
                  key={id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    selectedRoom === id && paintMode === 'room'
                      ? 'ring-2 ring-teal-400 bg-gray-700'
                      : 'hover:bg-gray-700/50'
                  }`}
                  onClick={() => {
                    setSelectedRoom(id);
                    setPaintMode('room');
                  }}
                >
                  <input
                    type="color"
                    value={room.color}
                    onChange={(e) =>
                      handleRoomColorChange(id, e.target.value)
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                    title="Change room color"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-200 text-sm flex-1">
                    {room.name}
                  </span>
                  <span className="text-gray-500 text-xs font-mono">
                    {id}
                  </span>
                </div>
              ))}
            </div>

            {/* Add new room */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs mb-2">Add Room</p>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Room ID (camelCase)"
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded"
                />
                <input
                  type="text"
                  placeholder="Room Name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded"
                />
                <button
                  onClick={handleAddRoom}
                  disabled={!newRoomId.trim() || !newRoomName.trim()}
                  className="w-full px-2 py-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded"
                >
                  Add Room
                </button>
              </div>
            </div>
          </div>

          {/* Cell type picker */}
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-white font-bold mb-2">Cell Types</h3>
            <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
              {allCellTypes.map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => {
                    setSelectedCellType(ct.value);
                    setPaintMode('cellType');
                  }}
                  className={`px-2 py-1.5 rounded text-xs font-semibold transition-colors text-left ${
                    selectedCellType === ct.value &&
                    paintMode === 'cellType'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={ct.label}
                >
                  <span className="font-mono">
                    {ct.abbrev || '---'}
                  </span>
                  <span className="block text-[10px] text-gray-400 truncate">
                    {ct.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Suspect picker (shown when solution mode active) */}
          {paintMode === 'solution' && (
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
              <h3 className="text-white font-bold mb-2">Suspects</h3>
              <p className="text-gray-400 text-xs mb-2">
                Select a suspect, then click a cell to place them.
                Click a placed suspect to remove them.
              </p>
              <div className="space-y-1">
                {originalPuzzle.suspects.map((suspect) => {
                  const isPlaced = !!solution[suspect.id];
                  const isSelected = selectedSuspect === suspect.id;
                  const pos = solution[suspect.id];
                  return (
                    <div
                      key={suspect.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'ring-2 ring-orange-400 bg-gray-700'
                          : 'hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedSuspect(suspect.id)}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: suspect.color }}
                      >
                        {suspect.name.charAt(0)}
                      </div>
                      <span className="text-gray-200 text-sm flex-1">
                        {suspect.name}
                        {suspect.isVictim && (
                          <span className="text-red-400 text-xs ml-1">
                            (victim)
                          </span>
                        )}
                      </span>
                      {isPlaced ? (
                        <span className="text-green-400 text-xs font-mono">
                          [{pos.row},{pos.col}]
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          ---
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-xs">
                  Placed: {Object.keys(solution).length} /{' '}
                  {originalPuzzle.suspects.length}
                </p>
                <button
                  onClick={() => {
                    setSolution({});
                    setSelectedSuspect(
                      originalPuzzle.suspects[0]?.id || null,
                    );
                  }}
                  className="mt-2 w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Clear All Placements
                </button>
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-white font-bold mb-2">Export</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowExport(!showExport)}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
              >
                {showExport ? 'Hide Export' : 'Show Export Code'}
              </button>
              <button
                onClick={() =>
                  copyToClipboard(generateBoardLayoutCode(), 'layout')
                }
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
              >
                {copiedExport === 'layout'
                  ? 'Copied!'
                  : 'Copy boardLayout'}
              </button>
              <button
                onClick={() =>
                  copyToClipboard(generateRoomsCode(), 'rooms')
                }
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
              >
                {copiedExport === 'rooms' ? 'Copied!' : 'Copy rooms'}
              </button>
              <button
                onClick={() =>
                  copyToClipboard(generateSolutionCode(), 'solution')
                }
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
              >
                {copiedExport === 'solution'
                  ? 'Copied!'
                  : 'Copy solution'}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Editable grid with image overlay */}
        <div className="flex-1">
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">
                Editable Grid
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-xs">
                  Image opacity:
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={imageOpacity}
                  onChange={(e) =>
                    setImageOpacity(parseFloat(e.target.value))
                  }
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: `${
                    cellSize * gridSize +
                    imageBorder.left +
                    imageBorder.right
                  }px`,
                  height: `${
                    cellSize * gridSize +
                    imageBorder.top +
                    imageBorder.bottom
                  }px`,
                }}
              >
                {/* Background image overlay */}
                <img
                  src={originalPuzzle.backgroundImage}
                  alt="Grid reference"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    pointerEvents: 'none',
                    zIndex: 2,
                    opacity: imageOpacity,
                  }}
                />

                {/* Editable grid */}
                <div
                  style={{
                    position: 'absolute',
                    top: imageBorder.top,
                    left: imageBorder.left,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                    zIndex: 1,
                  }}
                >
                  {boardLayout.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const abbrev =
                        cellTypeAbbrev[cell.type] ??
                        cell.type.slice(0, 3).toUpperCase();
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const placedSuspectId = solutionByCell[cellKey];
                      const placedSuspect = placedSuspectId
                        ? getSuspectById(placedSuspectId)
                        : null;
                      const isSolutionMode = paintMode === 'solution';
                      return (
                        <div
                          key={cellKey}
                          className={`border border-black/30 flex items-center justify-center select-none relative ${
                            isSolutionMode
                              ? 'cursor-pointer'
                              : 'cursor-crosshair'
                          }`}
                          style={{
                            backgroundColor: getCellBgColor(cell),
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                          }}
                          onMouseDown={(e) =>
                            handleCellMouseDown(rowIndex, colIndex, e)
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(rowIndex, colIndex)
                          }
                          title={`[${rowIndex},${colIndex}] ${rooms[cell.room]?.name || cell.room} - ${cell.type}${
                            placedSuspect
                              ? ` (${placedSuspect.name})`
                              : ''
                          }`}
                        >
                          {/* Suspect avatar overlay */}
                          {placedSuspect && isSolutionMode && (
                            <div
                              className="absolute inset-1 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/80 pointer-events-none"
                              style={{
                                backgroundColor: placedSuspect.color,
                                zIndex: 3,
                              }}
                            >
                              {placedSuspect.name.charAt(0)}
                            </div>
                          )}
                          {/* Cell type abbreviation (dimmed when suspect placed) */}
                          {abbrev &&
                            !(placedSuspect && isSolutionMode) && (
                              <span
                                className="text-[10px] font-bold text-black/70 pointer-events-none leading-none"
                                style={{
                                  textShadow:
                                    '0 0 2px rgba(255,255,255,0.8)',
                                }}
                              >
                                {abbrev}
                              </span>
                            )}
                          {/* Row/col label in corner */}
                          <span className="absolute top-0 left-0.5 text-[7px] text-black/40 pointer-events-none">
                            {rowIndex},{colIndex}
                          </span>
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export code display */}
          {showExport && (
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
              <h3 className="text-white font-bold mb-2">
                boardLayout Code
              </h3>
              <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre font-mono">
                {generateBoardLayoutCode()}
              </pre>
              <h3 className="text-white font-bold mt-4 mb-2">
                rooms Code
              </h3>
              <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre font-mono">
                {generateRoomsCode()}
              </pre>
              <h3 className="text-white font-bold mt-4 mb-2">
                solution Code
              </h3>
              <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre font-mono">
                {generateSolutionCode()}
              </pre>
            </div>
          )}
        </div>

        {/* Right panel: Full reference image */}
        <div className="xl:w-[500px] shrink-0">
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-3">
              Reference Image
            </h2>
            <div className="rounded-lg overflow-hidden">
              <img
                src={originalPuzzle.backgroundImage}
                alt="Reference"
                className="w-full h-auto"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Room legend */}
          <div className="mt-4 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <h3 className="text-white font-bold mb-2">Room Legend</h3>
            <div className="grid grid-cols-2 gap-1">
              {roomEntries.map(([id, room]) => (
                <div
                  key={id}
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: room.color }}
                  />
                  <span className="text-gray-300 text-xs">
                    {room.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center mt-6 text-gray-500 text-xs">
        <p>Murdoku Grid Editor</p>
        <p className="mt-1 text-gray-600">
          Build: {new Date(__BUILD_TIME__).toLocaleString()}
        </p>
      </footer>
    </div>
  );
}

export default GridEditor;
