/**
 * Standalone solver verification test.
 * Run with: node --loader ./test-loader.mjs test-solver.mjs
 */

import { puzzles } from './src/data/puzzles/index.js';
import { MurdokuSolver } from './src/engine/solver.js';
import { createCellKey } from './src/constants.js';

console.log('🔍 Murdoku Solver Verification\n');
console.log('='.repeat(60));

let allPass = true;

for (const [id, puzzle] of Object.entries(puzzles)) {
	console.log(`\n📋 ${puzzle.name} (${puzzle.difficulty}, ${puzzle.gridSize}×${puzzle.gridSize})`);
	console.log('-'.repeat(40));

	const solver = new MurdokuSolver(puzzle);
	solver.initialize({});
	const steps = solver.solve();

	const solved = solver.isSolved();
	const unplaced = puzzle.suspects
		.filter((s) => !solver.placed.has(s.id))
		.map((s) => {
			const cands = solver.getCandidates(s.id);
			return `${s.name}(${cands.size})`;
		});

	let correctCount = 0;
	const errors = [];
	for (const [sid, cellKey] of solver.placed) {
		const expected = puzzle.solution[sid];
		const expectedKey = createCellKey(expected.row, expected.col);
		if (cellKey === expectedKey) {
			correctCount++;
		} else {
			const name = puzzle.suspects.find((s) => s.id === sid)?.name || sid;
			errors.push(`  ❌ ${name}: placed at ${cellKey}, expected ${expectedKey}`);
		}
	}

	for (let i = 0; i < steps.length; i++) {
		const s = steps[i];
		const name = puzzle.suspects.find((x) => x.id === s.suspectId)?.name || s.suspectId;
		console.log(`  ${i + 1}. [${s.technique}] ${name} → ${s.cellKey || 'elimination'}`);
	}

	const icon = solved && errors.length === 0 ? '✅' : '❌';
	console.log(`\n  ${icon} ${solved ? 'SOLVED' : 'INCOMPLETE'} | ${steps.length} steps | ${correctCount}/${puzzle.suspects.length} correct`);

	if (unplaced.length > 0) {
		console.log(`  ⚠️  Unplaced: ${unplaced.join(', ')}`);
	}
	if (errors.length > 0) {
		errors.forEach((e) => console.log(e));
	}

	if (!solved || errors.length > 0) allPass = false;
}

console.log('\n' + '='.repeat(60));
console.log(allPass ? '✅ ALL PUZZLES PASS!' : '❌ SOME PUZZLES FAILED');
console.log('='.repeat(60));

process.exit(allPass ? 0 : 1);
