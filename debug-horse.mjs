import { puzzles } from './src/data/puzzles/index.js';
import { getNextHint } from './src/engine/hintEngine.js';

const puzzleId = process.argv[2] || 'backyard-garden-easy';
const puzzle = puzzles[puzzleId];
if (!puzzle) {
  console.error(`Unknown puzzle: ${puzzleId}`);
  console.error(`Available: ${Object.keys(puzzles).join(', ')}`);
  process.exit(1);
}

// Simulate a player clicking "Get Hint" repeatedly, placing each suspect as guided
const placements = {}; // cellKey -> suspectId
const solution = puzzle.solution;

console.log(`\n📋 ${puzzle.name} - Hint System Test\n`);

for (let step = 0; step < 20; step++) {
  const hint = getNextHint(puzzle, placements);

  console.log(`Step ${step + 1}:`);
  console.log(`  Message: ${hint.message}`);
  console.log(`  Suspect: ${hint.suspect || 'none'}`);
  console.log(
    `  Cells: ${hint.highlightCells?.join(', ') || 'none'}`,
  );
  console.log(`  Action: ${hint.action || 'none'}`);

  if (!hint.suspect) {
    console.log('  → No more hints');
    break;
  }

  // If action is 'place' and there's exactly 1 cell, place the suspect
  if (hint.action === 'place' && hint.highlightCells?.length === 1) {
    const cellKey = hint.highlightCells[0];
    placements[cellKey] = hint.suspect;
    const name = puzzle.suspects.find(
      (s) => s.id === hint.suspect,
    )?.name;
    console.log(`  → Placed ${name} at ${cellKey}`);
  } else {
    // Simulate player placing at correct position after getting hint
    const pos = solution[hint.suspect];
    if (pos) {
      const key = `${pos.row}-${pos.col}`;
      placements[key] = hint.suspect;
      const name = puzzle.suspects.find(
        (s) => s.id === hint.suspect,
      )?.name;
      console.log(
        `  → Player places ${name} at ${key} (from solution)`,
      );
    }
  }
  console.log('');
}
