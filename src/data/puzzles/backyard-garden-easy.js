import backgroundImage from '../backyard-garden.jpg';
import { cellTypes } from '../gameData';

const puzzle = {
  id: 'backyard-garden-easy',
  name: 'Backyard Garden',
  subtitle: 'The Backyard Garden Mystery',
  difficulty: 'Easy',
  gridSize: 9,
  cellSize: 50,
  imageBorder: { top: 26, right: 20, bottom: 20, left: 18 },
  backgroundImage,

  rooms: {
    pond: { name: 'Pond', color: '#5dade2' },
    garden: { name: 'Garden', color: '#82e0aa' },
    shed: { name: 'Shed', color: '#d5dbdb' },
    backyard: { name: 'Backyard', color: '#a9dfbf' },
    sunroom: { name: 'Sunroom', color: '#f9e79f' },
    bedroom: { name: 'Bedroom', color: '#f5cba7' },
    livingRoom: { name: 'Living Room', color: '#d7bde2' },
    kitchen: { name: 'Kitchen', color: '#fadbd8' },
  },

  suspects: [
    {
      id: 'aaron',
      name: 'Aaron',
      color: '#e74c3c',
      clue: 'He was with Elyse in the Living Room.',
      avatar: '👨‍🦰',
    },
    {
      id: 'bruce',
      name: 'Bruce',
      color: '#3498db',
      clue: 'He was in the Shed.',
      avatar: '👨',
    },
    {
      id: 'carissa',
      name: 'Carissa',
      color: '#9b59b6',
      clue: 'She was beside a tree.',
      avatar: '👩',
    },
    {
      id: 'denise',
      name: 'Denise',
      color: '#e67e22',
      clue: 'She was in the Bedroom or in the Sunroom.',
      avatar: '👩‍🦰',
    },
    {
      id: 'elyse',
      name: 'Elyse',
      color: '#1abc9c',
      clue: 'She was sitting in a chair.',
      avatar: '👱‍♀️',
    },
    {
      id: 'franklin',
      name: 'Franklin',
      color: '#34495e',
      clue: 'He was on a carpet.',
      avatar: '🧔',
    },
    {
      id: 'gilbert',
      name: 'Gilbert',
      color: '#27ae60',
      clue: 'He was in the Garden.',
      avatar: '👴',
    },
    {
      id: 'holden',
      name: 'Holden',
      color: '#f39c12',
      clue: 'He was alone.',
      avatar: '🧑',
    },
    {
      id: 'violet',
      name: 'Violet',
      color: '#8e44ad',
      clue: 'The Victim. She was alone with the murderer.',
      avatar: '👧',
      isVictim: true,
    },
  ],

  boardLayout: [
    // Row 0
    [
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.TREE },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.LILY_PAD },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'garden', type: cellTypes.EMPTY },
      { room: 'garden', type: cellTypes.FLOWERS },
    ],
    // Row 1
    [
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'pond', type: cellTypes.LILY_PAD },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'garden', type: cellTypes.EMPTY },
      { room: 'garden', type: cellTypes.EMPTY },
    ],
    // Row 2
    [
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.TREE },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'garden', type: cellTypes.FLOWERS },
      { room: 'garden', type: cellTypes.EMPTY },
    ],
    // Row 3
    [
      { room: 'backyard', type: cellTypes.FLOWERS },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.TREE },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.FLOWERS },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.TABLE },
    ],
    // Row 4
    [
      { room: 'shed', type: cellTypes.SHELF },
      { room: 'shed', type: cellTypes.EMPTY },
      { room: 'shed', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'sunroom', type: cellTypes.EMPTY },
      { room: 'sunroom', type: cellTypes.EMPTY },
      { room: 'sunroom', type: cellTypes.CHAIR },
      { room: 'sunroom', type: cellTypes.TABLE },
      { room: 'sunroom', type: cellTypes.CHAIR },
    ],
    // Row 5
    [
      { room: 'shed', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'sunroom', type: cellTypes.CHAIR },
      { room: 'sunroom', type: cellTypes.CARPET },
      { room: 'sunroom', type: cellTypes.CARPET },
      { room: 'sunroom', type: cellTypes.EMPTY },
      { room: 'sunroom', type: cellTypes.EMPTY },
    ],
    // Row 6
    [
      { room: 'backyard', type: cellTypes.EMPTY },
      { room: 'backyard', type: cellTypes.FLOWERS },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.SHELF },
      { room: 'livingRoom', type: cellTypes.TV },
      { room: 'livingRoom', type: cellTypes.SHELF },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.EMPTY },
    ],
    // Row 7
    [
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'bedroom', type: cellTypes.TABLE },
      { room: 'bedroom', type: cellTypes.CARPET },
      { room: 'livingRoom', type: cellTypes.TABLE },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.CARPET },
      { room: 'kitchen', type: cellTypes.CARPET },
      { room: 'kitchen', type: cellTypes.TABLE },
    ],
    // Row 8
    [
      { room: 'bedroom', type: cellTypes.BED },
      { room: 'bedroom', type: cellTypes.BED },
      { room: 'bedroom', type: cellTypes.CARPET },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.CHAIR },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.CARPET },
      { room: 'kitchen', type: cellTypes.SHELF },
      { room: 'kitchen', type: cellTypes.TABLE },
    ],
  ],

  solution: {
    aaron: { row: 7, col: 5 },
    bruce: { row: 4, col: 1 },
    carissa: { row: 0, col: 0 },
    denise: { row: 6, col: 2 },
    elyse: { row: 8, col: 4 },
    franklin: { row: 5, col: 6 },
    gilbert: { row: 2, col: 8 },
    holden: { row: 1, col: 3 },
    violet: { row: 3, col: 7 },
  },

  /**
   * Hint data for the puzzle solver.
   * Each hint step defines:
   * - suspect: The suspect this hint helps place
   * - order: Priority order (lower = earlier)
   * - prerequisites: Suspects that must be placed first
   * - target: Criteria for finding target cells
   * - messages: Hint text for single/multiple cell scenarios
   * - markingHint: Optional hint for suggesting X marks
   */
  hints: [
    {
      suspect: 'elyse',
      order: 1,
      prerequisites: [],
      target: {
        type: 'cellType',
        cellType: 'chair',
        room: 'livingRoom',
      },
      messages: {
        single: `💡 Elyse must be sitting in a chair, and Aaron's clue says they're both in the Living Room. There's only one chair in the Living Room!`,
        multiple: `💡 Elyse must be sitting in a chair. Aaron's clue says they're both in the Living Room. Look for chairs there.`,
      },
    },
    {
      suspect: 'aaron',
      order: 2,
      prerequisites: ['elyse'],
      target: { type: 'room', room: 'livingRoom' },
      messages: {
        single: `💡 Aaron was with Elyse in the Living Room. There's only one spot left for him!`,
        multiple: `💡 Aaron was with Elyse in the Living Room. Look for available spots there.`,
      },
    },
    {
      suspect: 'franklin',
      order: 3,
      prerequisites: ['elyse', 'aaron'],
      target: { type: 'cellType', cellType: 'carpet' },
      messages: {
        single: `💡 Franklin was on a carpet. There's only one carpet cell available!`,
        multiple: `💡 Franklin was on a carpet. These carpet cells are still available.`,
      },
    },
    {
      suspect: 'bruce',
      order: 4,
      prerequisites: ['franklin'],
      target: { type: 'room', room: 'shed' },
      messages: {
        single: `💡 Bruce was in the Shed. There's only one spot available!`,
        multiple: `💡 Bruce was in the Shed. These cells are available.`,
      },
      markingHint: {
        condition: 'sameRow',
        message: `💡 Bruce must be in the Shed. Both remaining Shed cells are in the same row - you can mark X on all other cells in that row!`,
      },
      // Skip to Denise hint when marking is done but 2 cells remain
      skipIfMoreThan: 1,
    },
    {
      suspect: 'denise',
      order: 5,
      prerequisites: ['franklin'],
      target: { type: 'rooms', rooms: ['bedroom', 'sunroom'] },
      messages: {
        single: `💡 Denise was in the Bedroom or Sunroom. There's only one spot left!`,
        multiple: `💡 Denise was in the Bedroom or the Sunroom. These cells are available.`,
        roomBlocked: `💡 Denise was in the Bedroom or Sunroom. The {blockedRooms} is fully blocked, so she must be in the {availableRoom}!`,
      },
    },
    {
      suspect: 'bruce',
      order: 6,
      prerequisites: ['denise'],
      target: { type: 'room', room: 'shed' },
      messages: {
        single: `💡 Bruce was in the Shed. Now there's only one spot left!`,
        multiple: `💡 Bruce was in the Shed. These cells are available.`,
      },
    },
    {
      suspect: 'carissa',
      order: 7,
      prerequisites: ['bruce'],
      target: { type: 'adjacentTo', cellType: 'tree' },
      messages: {
        single: `💡 Carissa was beside a tree. There's only one spot adjacent to a tree!`,
        multiple: `💡 Carissa was beside a tree. These cells are adjacent to trees.`,
      },
    },
    {
      suspect: 'holden',
      order: 8,
      prerequisites: ['carissa'],
      target: { type: 'room', room: 'pond' },
      messages: {
        single: `💡 Holden was alone. He can't be in the Garden (Gilbert will be there) or the Backyard (Carissa is there). The only remaining isolated cell is in the Pond area!`,
        multiple: `💡 Holden was alone. He needs a cell where no one else in the same room could be adjacent. Consider the Pond area.`,
      },
    },
    {
      suspect: 'gilbert',
      order: 9,
      prerequisites: ['holden'],
      target: { type: 'room', room: 'garden' },
      messages: {
        single: `💡 Gilbert was in the Garden. There's only one spot left!`,
        multiple: `💡 Gilbert was in the Garden. These cells are available.`,
      },
    },
    {
      suspect: 'violet',
      order: 10,
      prerequisites: ['gilbert'],
      target: { type: 'any' },
      messages: {
        single: `💡 Violet goes in the last remaining cell. She was alone with the murderer - check who else is in that room!`,
        multiple: `💡 Violet was alone with the murderer. Place her in the remaining cell.`,
      },
    },
  ],
};

export default puzzle;
