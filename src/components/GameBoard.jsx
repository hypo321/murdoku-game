import Cell from './Cell';
import { boardLayout } from '../data/gameData';
import backgroundImage from '../data/backyard-garden.jpg';

function GameBoard({
  markedCells,
  selectedCell,
  onCellClick,
  onCellRightClick,
  getSuspectAt,
}) {
  const cellSize = 50;
  const gridSize = 9;
  const imageBorder = { top: 26, right: 20, bottom: 20, left: 18 };

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
