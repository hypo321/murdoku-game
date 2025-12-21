/**
 * Hint generator for Murdoku puzzles.
 * Re-exports the generic hint interpreter which processes hint data stored in puzzle files.
 * @fileoverview Main entry point for hint generation.
 */

export { generateHint } from './hintInterpreter';

export {
  getCellsOfType,
  getOccupiableCellsInRoom,
  getCellsAdjacentToType,
  filterAvailableCells,
  isSuspectPlaced,
  isCellAvailable,
} from './hintInterpreter';
