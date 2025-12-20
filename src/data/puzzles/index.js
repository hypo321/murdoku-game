import backyardGardenEasy from './backyard-garden-easy';

export const puzzles = {
  'backyard-garden-easy': backyardGardenEasy,
};

export const puzzleList = Object.values(puzzles);

export function getPuzzle(id) {
  return puzzles[id] || null;
}

export const defaultPuzzleId = 'backyard-garden-easy';
