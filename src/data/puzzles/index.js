import backyardGardenEasy from './backyard-garden-easy';
import botanicalGardenHard from './botanical-garden-hard';
import carRepairEasy from './car-repair-easy';
import horseTrackHard from './horse-track-hard';
import preppersMedium from './preppers-medium';

export const puzzles = {
  'backyard-garden-easy': backyardGardenEasy,
  'botanical-garden-hard': botanicalGardenHard,
  'car-repair-easy': carRepairEasy,
  'horse-track-hard': horseTrackHard,
  'preppers-medium': preppersMedium,
};

export const puzzleList = Object.values(puzzles);

export function getPuzzle(id) {
  return puzzles[id] || null;
}

export const defaultPuzzleId = 'backyard-garden-easy';
