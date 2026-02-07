import backgroundImage from '../preppers-medium.jpg';
import { cellTypes } from '../gameData';

const puzzle = {
  id: 'preppers-medium',
  name: 'Preppers',
  subtitle: 'The Preppers Mystery',
  difficulty: 'Medium',
  gridSize: 9,
  cellSize: 50,
  imageBorder: { top: 2, right: 2, bottom: 2, left: 1 },
  backgroundImage,

  rooms: {
    yard: { name: 'Yard', color: '#82e0aa' },
    kitchen: { name: 'Kitchen', color: '#fadbd8' },
    livingRoom: { name: 'Living Room', color: '#d7bde2' },
    bathroom: { name: 'Bathroom', color: '#aed6f1' },
    bedroom: { name: 'Bedroom', color: '#f5cba7' },
    secretStairs: { name: 'Secret Stairs', color: '#d5dbdb' },
    safeRoom: { name: 'Safe Room', color: '#c39bd3' },
    supply: { name: 'Supply', color: '#a9cce3' },
  },

  suspects: [
    {
      id: 'angelo',
      name: 'Angelo',
      gender: 'male',
      color: '#e74c3c',
      clue: 'There was a box in his area. He was not beside any box.',
      avatar: '👨‍🦰',
      constraints: [
        { type: 'inRooms', rooms: ['yard', 'supply', 'safeRoom'] },
        { type: 'notBeside', cellType: 'box' },
      ],
    },
    {
      id: 'blake',
      name: 'Blake',
      gender: 'male',
      color: '#3498db',
      clue: 'He was in the Bedroom.',
      avatar: '🧔',
      constraints: [{ type: 'inRoom', room: 'bedroom' }],
    },
    {
      id: 'carolina',
      name: 'Carolina',
      gender: 'female',
      color: '#9b59b6',
      clue: 'There was a man on the bed in her area.',
      avatar: '👩',
      constraints: [
        { type: 'inRooms', rooms: ['bedroom', 'safeRoom'] },
        {
          type: 'inRoomWithPersonOnCellType',
          gender: 'male',
          cellType: 'bed',
        },
      ],
    },
    {
      id: 'daryl',
      name: 'Daryl',
      gender: 'female',
      color: '#e67e22',
      clue: 'Someone else was beside a shelf in her area.',
      avatar: '👩‍🦰',
      constraints: [
        {
          type: 'inRooms',
          rooms: ['livingRoom', 'bedroom', 'supply', 'safeRoom'],
        },
        { type: 'inRoomWithPersonBesideCellType', cellType: 'shelf' },
      ],
    },
    {
      id: 'edna',
      name: 'Edna',
      gender: 'female',
      color: '#1abc9c',
      clue: 'She was in the bottom row.',
      avatar: '👵',
      constraints: [{ type: 'inRow', row: 8 }],
    },
    {
      id: 'friedrich',
      name: 'Friedrich',
      gender: 'male',
      color: '#34495e',
      clue: 'He was beside a TV.',
      avatar: '👨',
      constraints: [{ type: 'beside', cellType: 'tv' }],
    },
    {
      id: 'greg',
      name: 'Greg',
      gender: 'male',
      color: '#27ae60',
      clue: 'He was sitting in a chair.',
      avatar: '🧑',
      constraints: [{ type: 'onCellType', cellType: 'chair' }],
    },
    {
      id: 'howie',
      name: 'Howie',
      gender: 'male',
      color: '#f39c12',
      clue: 'He was in the Bathroom.',
      avatar: '👴',
      constraints: [{ type: 'inRoom', room: 'bathroom' }],
    },
    {
      id: 'vivianna',
      name: 'Vivianna',
      gender: 'female',
      color: '#8e44ad',
      clue: 'The Victim. She was alone with the murderer.',
      avatar: '👧',
      isVictim: true,
      constraints: [{ type: 'victim' }],
    },
  ],

  boardLayout: [
    // Row 0
    [
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.CAR },
      { room: 'yard', type: cellTypes.CAR },
      { room: 'yard', type: cellTypes.EMPTY },
    ],
    // Row 1
    [
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.TABLE },
      { room: 'kitchen', type: cellTypes.TABLE },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.CHAIR },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.BOX },
      { room: 'yard', type: cellTypes.EMPTY },
    ],
    // Row 2
    [
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.TABLE },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.TABLE },
      { room: 'livingRoom', type: cellTypes.CHAIR },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.TV },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.SHRUB },
    ],
    // Row 3
    [
      { room: 'yard', type: cellTypes.SHRUB },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.EMPTY },
      { room: 'kitchen', type: cellTypes.CHAIR },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.EMPTY },
      { room: 'livingRoom', type: cellTypes.SHELF },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
    ],
    // Row 4
    [
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'bathroom', type: cellTypes.EMPTY },
      { room: 'bathroom', type: cellTypes.EMPTY },
      { room: 'bedroom', type: cellTypes.TABLE },
      { room: 'bedroom', type: cellTypes.BED },
      { room: 'bedroom', type: cellTypes.BED },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'yard', type: cellTypes.EMPTY },
    ],
    // Row 5
    [
      { room: 'yard', type: cellTypes.EMPTY },
      { room: 'bathroom', type: cellTypes.CHAIR },
      { room: 'bathroom', type: cellTypes.TABLE },
      { room: 'bedroom', type: cellTypes.SHELF },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.SHELF },
      { room: 'supply', type: cellTypes.BOX },
    ],
    // Row 6
    [
      { room: 'safeRoom', type: cellTypes.TABLE },
      { room: 'safeRoom', type: cellTypes.TV },
      { room: 'safeRoom', type: cellTypes.TABLE },
      { room: 'secretStairs', type: cellTypes.EMPTY },
      { room: 'bedroom', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.SHELF },
      { room: 'supply', type: cellTypes.BOX },
      { room: 'supply', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.EMPTY },
    ],
    // Row 7
    [
      { room: 'safeRoom', type: cellTypes.BED },
      { room: 'safeRoom', type: cellTypes.CHAIR },
      { room: 'safeRoom', type: cellTypes.BOX },
      { room: 'secretStairs', type: cellTypes.EMPTY },
      { room: 'secretStairs', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.BOX },
      { room: 'supply', type: cellTypes.BOX },
    ],
    // Row 8
    [
      { room: 'safeRoom', type: cellTypes.BED },
      { room: 'safeRoom', type: cellTypes.SHELF },
      { room: 'safeRoom', type: cellTypes.EMPTY },
      { room: 'safeRoom', type: cellTypes.EMPTY },
      { room: 'safeRoom', type: cellTypes.BOX },
      { room: 'supply', type: cellTypes.EMPTY },
      { room: 'supply', type: cellTypes.BOX },
      { room: 'supply', type: cellTypes.SHELF },
      { room: 'supply', type: cellTypes.EMPTY },
    ],
  ],

  solution: {
    angelo: { row: 0, col: 8 },
    blake: { row: 4, col: 5 },
    carolina: { row: 6, col: 4 },
    daryl: { row: 7, col: 0 },
    edna: { row: 8, col: 2 },
    friedrich: { row: 1, col: 6 },
    greg: { row: 3, col: 3 },
    howie: { row: 5, col: 1 },
    vivianna: { row: 2, col: 7 },
  },

  victim: 'vivianna',
  murderer: 'angelo',
  crimeRoom: 'yard',

  hints: [
    {
      suspect: 'howie',
      order: 1,
      prerequisites: [],
      target: { type: 'room', room: 'bathroom' },
      messages: {
        single: `💡 Howie is isolated in the Bathroom — only one cell works!`,
        multiple: `💡 Edna must be in the bottom row. This means no man can reach the Safe Room beds, so Carolina must be in the Bedroom. A man is on a bed in the Bedroom (row 5), blocking that row. This isolates Howie in the Bathroom.`,
      },
    },
    {
      suspect: 'carolina',
      order: 2,
      prerequisites: ['howie'],
      target: { type: 'rooms', rooms: ['bedroom', 'safeRoom'] },
      messages: {
        single: `💡 Carolina is isolated in the Bedroom — only one cell works!`,
        multiple: `💡 A man was on the bed in Carolina's area. Since Edna blocks the bottom row, no man can reach the Safe Room beds. Carolina must be in the Bedroom.`,
      },
    },
    {
      suspect: 'greg',
      order: 3,
      prerequisites: ['carolina'],
      target: { type: 'cellType', cellType: 'chair' },
      messages: {
        single: `💡 Greg is isolated on the last available chair!`,
        multiple: `💡 Greg was on a chair. With rows and columns now blocked by placed suspects, check which chairs are still available.`,
      },
    },
    {
      suspect: 'blake',
      order: 4,
      prerequisites: ['greg'],
      target: { type: 'room', room: 'bedroom' },
      messages: {
        single: `💡 Blake is the man on the bed in the Bedroom — only one spot left!`,
        multiple: `💡 Blake was in the Bedroom. He must be the man on the bed in Carolina's area. Check which Bedroom cells are still available.`,
      },
    },
    {
      suspect: 'friedrich',
      order: 5,
      prerequisites: ['blake'],
      target: { type: 'adjacentTo', cellType: 'tv' },
      messages: {
        single: `💡 Friedrich is isolated beside the TV — only one cell works!`,
        multiple: `💡 Friedrich was beside a TV. Find the TV cells and check which adjacent cells are still available after row and column eliminations.`,
      },
    },
    {
      suspect: 'daryl',
      order: 6,
      prerequisites: ['friedrich'],
      target: {
        type: 'rooms',
        rooms: ['safeRoom', 'bedroom', 'supply', 'livingRoom'],
      },
      messages: {
        single: `💡 Daryl is isolated on the Safe Room bed!`,
        multiple: `💡 Someone else was beside a shelf in Daryl's area. Check which rooms have shelves where another suspect could be adjacent to one.`,
      },
    },
    {
      suspect: 'edna',
      order: 7,
      prerequisites: ['daryl'],
      target: { type: 'room', room: 'safeRoom' },
      messages: {
        single: `💡 Daryl needs someone beside a shelf in the Safe Room. Edna is in the bottom row — she's the only one who fits!`,
        multiple: `💡 Daryl needs someone beside a shelf in the Safe Room. Edna must be in the bottom row — check which Safe Room cell is beside a shelf.`,
      },
    },
    {
      suspect: 'angelo',
      order: 8,
      prerequisites: ['edna'],
      target: {
        type: 'rooms',
        rooms: ['yard', 'supply', 'safeRoom'],
      },
      messages: {
        single: `💡 Angelo is isolated in the last square not beside a box!`,
        multiple: `💡 Angelo was in an area with boxes but not beside any. Check which remaining cells satisfy this constraint.`,
      },
    },
    {
      suspect: 'vivianna',
      order: 9,
      prerequisites: ['angelo'],
      target: { type: 'any' },
      messages: {
        single: `💡 Vivianna goes in the last remaining cell in the Yard. She was alone with Angelo — Angelo is the murderer!`,
        multiple: `💡 Vivianna was alone with the murderer. She must be in a room with exactly one other suspect. Look for where she fits.`,
      },
    },
  ],
};

export default puzzle;
