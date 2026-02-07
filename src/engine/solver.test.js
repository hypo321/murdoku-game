/**
 * Solver verification test.
 * Run with: node --experimental-vm-modules src/engine/solver.test.js
 * Or import from browser console via the dev server.
 */

import { MurdokuSolver } from './solver.js';
import { createCellKey } from '../constants.js';

/**
 * Creates a minimal puzzle for testing without image imports.
 * Tests the solver against the known solution.
 *
 * @param {Object} puzzle - Puzzle data (must have suspects, rooms, boardLayout, solution, gridSize)
 * @returns {{ solved: boolean, steps: number, correct: boolean, errors: string[] }}
 */
export function testSolver(puzzle) {
	const solver = new MurdokuSolver(puzzle);
	solver.initialize({});
	const steps = solver.solve();

	const errors = [];

	// Check if solved
	if (!solver.isSolved()) {
		const unplaced = puzzle.suspects
			.filter((s) => !solver.placed.has(s.id))
			.map((s) => {
				const cands = solver.getCandidates(s.id);
				return `${s.name} (${cands.size} candidates)`;
			});
		errors.push(`Not fully solved. Unplaced: ${unplaced.join(', ')}`);
	}

	// Check correctness against known solution
	let allCorrect = true;
	for (const [sid, cellKey] of solver.placed) {
		const expected = puzzle.solution[sid];
		if (!expected) {
			errors.push(`${sid}: no solution entry`);
			allCorrect = false;
			continue;
		}
		const expectedKey = createCellKey(expected.row, expected.col);
		if (cellKey !== expectedKey) {
			const suspect = puzzle.suspects.find((s) => s.id === sid);
			errors.push(`${suspect?.name || sid}: placed at ${cellKey}, expected ${expectedKey}`);
			allCorrect = false;
		}
	}

	return {
		solved: solver.isSolved(),
		steps: steps.length,
		correct: allCorrect,
		errors,
		stepDetails: steps,
	};
}

/**
 * Runs solver test on all provided puzzles.
 *
 * @param {Object} puzzles - Map of puzzleId -> puzzle data
 */
export function testAllPuzzles(puzzles) {
	const results = {};
	let allPass = true;

	for (const [id, puzzle] of Object.entries(puzzles)) {
		const result = testSolver(puzzle);
		results[id] = result;

		const icon = result.solved && result.correct ? '✅' : '❌';
		console.log(`${icon} ${id}: ${result.solved ? 'SOLVED' : 'INCOMPLETE'} in ${result.steps} steps${result.correct ? '' : ' (INCORRECT PLACEMENTS)'}`);

		if (result.errors.length > 0) {
			allPass = false;
			for (const err of result.errors) {
				console.log(`   ⚠️ ${err}`);
			}
		}

		// Log step summary
		for (const step of result.stepDetails) {
			console.log(`   ${step.technique}: ${step.suspectId} → ${step.cellKey || 'elimination'}`);
		}
	}

	console.log(`\n${allPass ? '✅ All puzzles pass!' : '❌ Some puzzles failed.'}`);
	return results;
}
