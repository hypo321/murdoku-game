/**
 * Board utility functions for the Murdoku solver engine.
 * Provides efficient lookups for cells, rooms, adjacency, etc.
 * @fileoverview Precomputes board data structures for fast constraint evaluation.
 */

import { occupiableTypes } from '../data/gameData';
import { createCellKey } from '../constants';

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/**
 * Precomputes board information for efficient lookups.
 * Call once per puzzle and reuse the result.
 *
 * @param {Array<Array<{room: string, type: string}>>} boardLayout
 * @returns {Object} Precomputed board info
 */
export function precomputeBoard(boardLayout) {
	const rows = boardLayout.length;
	const cols = boardLayout[0].length;

	/** @type {Set<string>} All occupiable cell keys */
	const occupiableCells = new Set();

	/** @type {Map<string, {row: number, col: number, room: string, type: string}>} */
	const cellInfo = new Map();

	/** @type {Map<string, Set<string>>} Room name -> set of occupiable cell keys */
	const roomCells = new Map();

	/** @type {Map<string, Set<string>>} Cell type -> set of cell keys (all, not just occupiable) */
	const typeCells = new Map();

	/** @type {Map<string, Set<string>>} Cell key -> set of adjacent occupiable cell keys (same room) */
	const adjacentSameRoom = new Map();

	/** @type {Map<number, Set<string>>} Row index -> set of occupiable cell keys */
	const rowCells = new Map();

	/** @type {Map<number, Set<string>>} Col index -> set of occupiable cell keys */
	const colCells = new Map();

	// First pass: index all cells
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const cell = boardLayout[r][c];
			const key = createCellKey(r, c);
			const isOccupiable = occupiableTypes.includes(cell.type);

			cellInfo.set(key, { row: r, col: c, room: cell.room, type: cell.type });

			// Type index (all cells, not just occupiable)
			if (!typeCells.has(cell.type)) {
				typeCells.set(cell.type, new Set());
			}
			typeCells.get(cell.type).add(key);

			if (isOccupiable) {
				occupiableCells.add(key);

				// Room index
				if (!roomCells.has(cell.room)) {
					roomCells.set(cell.room, new Set());
				}
				roomCells.get(cell.room).add(key);

				// Row/Col index
				if (!rowCells.has(r)) {
					rowCells.set(r, new Set());
				}
				rowCells.get(r).add(key);

				if (!colCells.has(c)) {
					colCells.set(c, new Set());
				}
				colCells.get(c).add(key);
			}
		}
	}

	// Second pass: compute adjacency (same room, occupiable neighbors)
	for (const key of occupiableCells) {
		const info = cellInfo.get(key);
		const adj = new Set();

		for (const [dr, dc] of DIRECTIONS) {
			const nr = info.row + dr;
			const nc = info.col + dc;
			if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
				const nKey = createCellKey(nr, nc);
				const nInfo = cellInfo.get(nKey);
				if (nInfo && nInfo.room === info.room && occupiableCells.has(nKey)) {
					adj.add(nKey);
				}
			}
		}

		adjacentSameRoom.set(key, adj);
	}

	return {
		rows,
		cols,
		occupiableCells,
		cellInfo,
		roomCells,
		typeCells,
		adjacentSameRoom,
		rowCells,
		colCells,
	};
}

/**
 * Gets all occupiable cells adjacent to cells of a given type (same room).
 * "Beside X" means occupiable cell adjacent to an X cell, in the same room as the X cell.
 *
 * @param {Object} board - Precomputed board info
 * @param {string} cellType - The cell type to be beside
 * @returns {Set<string>} Set of cell keys that are beside the given type
 */
export function getCellsBesideType(board, cellType) {
	const result = new Set();
	const targetCells = board.typeCells.get(cellType);
	if (!targetCells) return result;

	for (const targetKey of targetCells) {
		const targetInfo = board.cellInfo.get(targetKey);
		const { row, col, room } = targetInfo;

		for (const [dr, dc] of DIRECTIONS) {
			const nr = row + dr;
			const nc = col + dc;
			if (nr >= 0 && nr < board.rows && nc >= 0 && nc < board.cols) {
				const nKey = createCellKey(nr, nc);
				const nInfo = board.cellInfo.get(nKey);
				if (nInfo && nInfo.room === room && board.occupiableCells.has(nKey)) {
					result.add(nKey);
				}
			}
		}
	}

	return result;
}

/**
 * Gets cells in a specific row that are occupiable.
 *
 * @param {Object} board - Precomputed board info
 * @param {number} row - Row index
 * @returns {Set<string>} Set of occupiable cell keys in this row
 */
export function getCellsInRow(board, row) {
	return board.rowCells.get(row) || new Set();
}

/**
 * Gets cells in a specific column that are occupiable.
 *
 * @param {Object} board - Precomputed board info
 * @param {number} col - Column index
 * @returns {Set<string>} Set of occupiable cell keys in this column
 */
export function getCellsInCol(board, col) {
	return board.colCells.get(col) || new Set();
}

/**
 * Gets the room name for a cell.
 *
 * @param {Object} board - Precomputed board info
 * @param {string} cellKey - Cell key
 * @returns {string|null} Room name or null
 */
export function getRoomForCell(board, cellKey) {
	const info = board.cellInfo.get(cellKey);
	return info ? info.room : null;
}

/**
 * Gets the cell type for a cell.
 *
 * @param {Object} board - Precomputed board info
 * @param {string} cellKey - Cell key
 * @returns {string|null} Cell type or null
 */
export function getCellType(board, cellKey) {
	const info = board.cellInfo.get(cellKey);
	return info ? info.type : null;
}

/**
 * Gets all room names in the board.
 *
 * @param {Object} board - Precomputed board info
 * @returns {string[]} Array of room names
 */
export function getAllRooms(board) {
	return [...board.roomCells.keys()];
}

/**
 * Gets occupiable cells in a specific room.
 *
 * @param {Object} board - Precomputed board info
 * @param {string} room - Room name
 * @returns {Set<string>} Set of occupiable cell keys in this room
 */
export function getCellsInRoom(board, room) {
	return board.roomCells.get(room) || new Set();
}

/**
 * Parses a cell key into row and column.
 *
 * @param {string} key - Cell key "row-col"
 * @returns {{row: number, col: number}}
 */
export function parseKey(key) {
	const parts = key.split('-');
	return { row: parseInt(parts[0], 10), col: parseInt(parts[1], 10) };
}
