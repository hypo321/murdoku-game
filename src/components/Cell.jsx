import { cellTypes, occupiableTypes } from '../data/gameData';

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
};

function Cell({
  cell,
  row,
  col,
  suspect,
  isMarked,
  isSelected,
  isError,
  isHint,
  onCellClick,
  onCellRightClick,
  rooms,
  cellSize,
}) {
  const roomData = rooms[cell.room];
  const isOccupiable = occupiableTypes.includes(cell.type);
  const hasSuspect = suspect !== null;

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
    onCellRightClick(row, col);
  }

  return (
    <div
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
      }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-red-600 text-4xl font-bold drop-shadow-lg"
            style={{
              textShadow: '1px 1px 2px white, -1px -1px 2px white',
            }}
          >
            ✕
          </span>
        </div>
      )}
    </div>
  );
}

export default Cell;
