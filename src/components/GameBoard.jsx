import Cell from './Cell';

function GameBoard({
  puzzle,
  markedCells,
  selectedCell,
  onCellClick,
  onCellRightClick,
  getSuspectAt,
}) {
  const {
    boardLayout,
    backgroundImage,
    gridSize,
    cellSize,
    imageBorder,
    rooms,
  } = puzzle;

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
                const suspect = getSuspectAt(rowIndex, colIndex);

                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    row={rowIndex}
                    col={colIndex}
                    suspect={suspect}
                    isMarked={isMarked}
                    isSelected={isSelected}
                    onCellClick={onCellClick}
                    onCellRightClick={onCellRightClick}
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
