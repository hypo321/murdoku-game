import { useRef, useEffect } from 'react';
import { cellTypes, occupiableTypes } from '../data/gameData';

/**
 * @typedef {import('../types').CellProps} CellProps
 * @typedef {import('../types').Cell} CellData
 * @typedef {import('../types').Suspect} Suspect
 * @typedef {import('../types').RoomMap} RoomMap
 */

const cellTypeNames = {
  [cellTypes.CARPET]: 'Carpet',
  [cellTypes.CHAIR]: 'Chair',
  [cellTypes.TV]: 'TV',
  [cellTypes.SHELF]: 'Shelf',
  [cellTypes.TABLE]: 'Table',
  [cellTypes.FLOWERS]: 'Flowers',
  [cellTypes.LILY_PAD]: 'Lily Pad',
  [cellTypes.TREE]: 'Tree',
  [cellTypes.BUSH]: 'Bush',
  [cellTypes.BED]: 'Bed',
  [cellTypes.COUCH]: 'Couch',
  [cellTypes.POND_WATER]: 'Water',
  [cellTypes.EMPTY]: 'Empty',
  [cellTypes.HORSE]: 'Horse',
  [cellTypes.PLANT]: 'Plant',
  [cellTypes.TRACK]: 'Track',
  [cellTypes.FINISHING_LINE]: 'Finishing Line',
};

/**
 * Gets the initial (first letter) of a suspect's name.
 * @param {Suspect} suspect - The suspect
 * @returns {string} The initial
 */
function getSuspectInitial(suspect) {
  return suspect.name.charAt(0).toUpperCase();
}

/**
 * Renders an individual cell on the game board.
 * Displays suspect avatars, X marks, possibility initials, and various highlight states.
 *
 * @param {CellProps} props - Component props
 * @param {CellData} props.cell - Cell data containing room and type
 * @param {number} props.row - Row index (0-indexed)
 * @param {number} props.col - Column index (0-indexed)
 * @param {Suspect|null} props.suspect - Suspect at this cell or null
 * @param {boolean} props.isMarked - Whether cell has X mark
 * @param {boolean} props.isSelected - Whether cell is selected
 * @param {boolean} props.isError - Whether cell has error highlight
 * @param {boolean} props.isHint - Whether cell has hint highlight
 * @param {string[]} props.possibleSuspects - Array of suspects that could possibly be here
 * @param {function(number, number): void} props.onCellClick - Left click handler
 * @param {function(number, number): void} props.onCellRightClick - Right click handler
 * @param {function(number, number): void} props.onCellMouseDown - Mouse down handler
 * @param {function(number, number): void} props.onCellMouseEnter - Mouse enter handler
 * @param {RoomMap} props.rooms - Room definitions
 * @param {number} props.cellSize - Cell size in pixels
 * @returns {JSX.Element}
 */
function Cell({
  cell,
  row,
  col,
  suspect,
  isMarked,
  isSelected,
  isError,
  isHint,
  possibleSuspects = [],
  onCellClick,
  onCellRightClick,
  onCellMouseDown,
  onCellMouseEnter,
  rooms,
  cellSize,
}) {
  const cellRef = useRef(null);
  const roomData = rooms[cell.room];
  const isOccupiable = occupiableTypes.includes(cell.type);
  const hasSuspect = suspect !== null;

  // Use ref-based event listeners for touch with { passive: false }
  // This allows preventDefault() to work and prevent click from firing
  useEffect(() => {
    const element = cellRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      // Pass isTouch=true so App handles touch placement/drag correctly
      onCellMouseDown(row, col, 0, true);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      // Touch events stay on the original element, so we need to find
      // which cell is actually under the touch point
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
        const targetRow = target.dataset?.row;
        const targetCol = target.dataset?.col;
        if (targetRow !== undefined && targetCol !== undefined) {
          onCellMouseEnter(
            parseInt(targetRow, 10),
            parseInt(targetCol, 10)
          );
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [row, col, onCellMouseDown, onCellMouseEnter]);

  function getTooltip() {
    if (hasSuspect) {
      return suspect.name;
    }
    const typeName = cellTypeNames[cell.type] || cell.type;
    const occupyStatus = isOccupiable
      ? 'Can be occupied'
      : 'Cannot be occupied';
    return `${roomData.name} - ${typeName}: ${occupyStatus}`;
  }

  function handleClick(e) {
    e.preventDefault();
    onCellClick(row, col);
  }

  function handleRightClick(e) {
    e.preventDefault();
    // Right click is handled by mousedown for drag support
  }

  function handleMouseDown(e) {
    e.preventDefault();
    onCellMouseDown(row, col, e.button);
  }

  function handleMouseMove() {
    onCellMouseEnter(row, col);
  }

  return (
    <div
      ref={cellRef}
      className={`
				relative border flex items-center justify-center
				cursor-pointer transition-all duration-200 select-none
				${
          isSelected
            ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800'
            : ''
        }
				${
          isError
            ? 'border-4 border-orange-500 bg-orange-500/30'
            : isHint
            ? 'border-4 border-green-400 bg-green-400/30'
            : 'border-gray-600/50'
        }
				hover:bg-white/20
			`}
      style={{
        backgroundColor: 'transparent',
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        minWidth: `${cellSize}px`,
        minHeight: `${cellSize}px`,
        zIndex: 1,
        touchAction: 'none',
      }}
      data-row={row}
      data-col={col}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      title={getTooltip()}
    >
      {hasSuspect && (
        <div
          className="absolute inset-1 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white"
          style={{ backgroundColor: suspect.color }}
        >
          <span className="text-lg">{suspect.avatar}</span>
        </div>
      )}

      {isMarked && !hasSuspect && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="text-red-600 text-4xl font-bold drop-shadow-lg"
            style={{
              textShadow: '1px 1px 2px white, -1px -1px 2px white',
              pointerEvents: 'none',
            }}
          >
            ✕
          </span>
        </div>
      )}

      {/* Possibility marks - show suspect initials in corners (hidden when cell has X mark) */}
      {!hasSuspect && !isMarked && possibleSuspects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top left - first suspect */}
          {possibleSuspects[0] && (
            <span
              className="absolute top-0 left-0.5 text-xs font-bold"
              style={{
                color: possibleSuspects[0].color,
                textShadow: '0px 0px 2px white, 0px 0px 2px white',
                fontSize: cellSize < 40 ? '8px' : '10px',
                lineHeight: 1,
              }}
            >
              {getSuspectInitial(possibleSuspects[0])}
            </span>
          )}
          {/* Top right - second suspect */}
          {possibleSuspects[1] && (
            <span
              className="absolute top-0 right-0.5 text-xs font-bold"
              style={{
                color: possibleSuspects[1].color,
                textShadow: '0px 0px 2px white, 0px 0px 2px white',
                fontSize: cellSize < 40 ? '8px' : '10px',
                lineHeight: 1,
              }}
            >
              {getSuspectInitial(possibleSuspects[1])}
            </span>
          )}
          {/* Bottom left - third suspect */}
          {possibleSuspects[2] && (
            <span
              className="absolute bottom-0 left-0.5 text-xs font-bold"
              style={{
                color: possibleSuspects[2].color,
                textShadow: '0px 0px 2px white, 0px 0px 2px white',
                fontSize: cellSize < 40 ? '8px' : '10px',
                lineHeight: 1,
              }}
            >
              {getSuspectInitial(possibleSuspects[2])}
            </span>
          )}
          {/* Bottom right - fourth suspect */}
          {possibleSuspects[3] && (
            <span
              className="absolute bottom-0 right-0.5 text-xs font-bold"
              style={{
                color: possibleSuspects[3].color,
                textShadow: '0px 0px 2px white, 0px 0px 2px white',
                fontSize: cellSize < 40 ? '8px' : '10px',
                lineHeight: 1,
              }}
            >
              {getSuspectInitial(possibleSuspects[3])}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Cell;
