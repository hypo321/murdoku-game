import { useRef, useEffect } from 'react';
import Cell from './Cell';

/**
 * @typedef {import('../types').GameBoardProps} GameBoardProps
 * @typedef {import('../types').Puzzle} Puzzle
 * @typedef {import('../types').MarkedCells} MarkedCells
 * @typedef {import('../types').HighlightedCells} HighlightedCells
 * @typedef {import('../types').CellPosition} CellPosition
 * @typedef {import('../types').Suspect} Suspect
 */

/**
 * Renders the game board with background image and cell grid.
 *
 * @param {GameBoardProps} props - Component props
 * @param {Puzzle} props.puzzle - Puzzle data including layout and configuration
 * @param {MarkedCells} props.markedCells - X mark state
 * @param {Object.<string, string[]>} props.possibilityMarks - Possibility marks (cell key -> suspect IDs)
 * @param {CellPosition|null} props.selectedCell - Currently selected cell
 * @param {function(number, number): void} props.onCellClick - Left click handler
 * @param {function(number, number): void} props.onCellRightClick - Right click handler
 * @param {function(number, number): void} props.onCellMouseDown - Mouse down handler
 * @param {function(number, number): void} props.onCellMouseEnter - Mouse enter handler
 * @param {function(): void} props.onDragEnd - Drag end handler
 * @param {function(number, number): Suspect|null} props.getSuspectAt - Function to get suspect at position
 * @param {HighlightedCells} [props.errorCells] - Error highlight state
 * @param {HighlightedCells} [props.hintCells] - Hint highlight state
 * @returns {JSX.Element}
 */
function GameBoard({
  puzzle,
  markedCells,
  possibilityMarks = {},
  selectedCell,
  onCellClick,
  onCellRightClick,
  onCellMouseDown,
  onCellMouseEnter,
  onDragEnd,
  getSuspectAt,
  errorCells = {},
  hintCells = {},
}) {
  const gridRef = useRef(null);
  const {
    boardLayout,
    backgroundImage,
    gridSize,
    cellSize,
    imageBorder,
    rooms,
    suspects,
  } = puzzle;

  // Use ref-based event listener for touchmove with { passive: false }
  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const handleTouchMove = (e) => {
      e.preventDefault();
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
          onCellMouseEnter(parseInt(row, 10), parseInt(col, 10));
        }
      }
    };

    element.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    return () => {
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onCellMouseEnter]);

  /**
   * Gets the suspect objects for a cell's possibility marks.
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Suspect[]} Array of suspect objects sorted alphabetically by name
   */
  function getPossibleSuspectsAt(row, col) {
    const cellKey = `${row}-${col}`;
    const suspectIds = possibilityMarks[cellKey] || [];
    return suspectIds
      .map((id) => suspects.find((s) => s.id === id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="rounded-lg overflow-hidden shadow-2xl"
          style={{
            position: 'relative',
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
          <img
            src={backgroundImage}
            alt="Game board background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div
            ref={gridRef}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchEnd={onDragEnd}
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
                const isSelected =
                  selectedCell &&
                  selectedCell.row === rowIndex &&
                  selectedCell.col === colIndex;
                const isMarked =
                  markedCells[`${rowIndex}-${colIndex}`] || false;
                const isError =
                  errorCells[`${rowIndex}-${colIndex}`] || false;
                const isHint =
                  hintCells[`${rowIndex}-${colIndex}`] || false;
                const suspect = getSuspectAt(rowIndex, colIndex);
                const possibleSuspects = getPossibleSuspectsAt(
                  rowIndex,
                  colIndex
                );

                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    row={rowIndex}
                    col={colIndex}
                    suspect={suspect}
                    isMarked={isMarked}
                    isSelected={isSelected}
                    isError={isError}
                    isHint={isHint}
                    possibleSuspects={possibleSuspects}
                    onCellClick={onCellClick}
                    onCellRightClick={onCellRightClick}
                    onCellMouseDown={onCellMouseDown}
                    onCellMouseEnter={onCellMouseEnter}
                    rooms={rooms}
                    cellSize={cellSize}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
