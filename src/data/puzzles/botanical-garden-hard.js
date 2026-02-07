import backgroundImage from '../the-botanical-garden-hard.jpg';
import { cellTypes } from '../gameData';

const puzzle = {
  id: 'botanical-garden-hard',
  name: 'The Botanical Garden',
  subtitle: 'The Botanical Garden Mystery',
  difficulty: 'Hard',
  gridSize: 12,
  cellSize: 50,
  imageBorder: { top: 19, right: 19, bottom: 19, left: 19 },
  backgroundImage,

  rooms: {
    infoDesk: { name: 'Info Desk', color: '#f9e79f' },
    bonsaiExhibit: { name: 'Bonsai Exhibit', color: '#d5dbdb' },
    arboretum: { name: 'Arboretum', color: '#a9dfbf' },
    gazebo: { name: 'Gazebo', color: '#d7bde2' },
    flowerGarden: { name: 'Flower Garden', color: '#fadbd8' },
    desertExhibit: { name: 'Desert Exhibit', color: '#f5cba7' },
    pond: { name: 'Pond', color: '#85c1e9' },
    restingArea: { name: 'Resting Area', color: '#aed6f1' },
  },

  suspects: [
    {
      id: 'aveline',
      name: 'Aveline',
      gender: 'female',
      color: '#c0392b',
      clue: 'She was one row north of Della.',
      avatar: '👩‍🦰',
      constraints: [
        { type: 'relativeRow', suspect: 'della', rowOffset: -1 },
      ],
    },
    {
      id: 'brielle',
      name: 'Brielle',
      gender: 'female',
      color: '#f5b041',
      clue: 'She was sitting in a chair in the Arboretum.',
      avatar: '👱‍♀️',
      constraints: [
        { type: 'onCellType', cellType: 'chair' },
        { type: 'inRoom', room: 'arboretum' },
      ],
    },
    {
      id: 'collin',
      name: 'Collin',
      gender: 'male',
      color: '#2980b9',
      clue: 'He was beside a table.',
      avatar: '🧔',
      constraints: [{ type: 'beside', cellType: 'table' }],
    },
    {
      id: 'della',
      name: 'Della',
      gender: 'female',
      color: '#8e44ad',
      clue: 'She was on a path. She was alone.',
      avatar: '👩',
      constraints: [
        { type: 'onCellType', cellType: 'path' },
        { type: 'alone' },
      ],
    },
    {
      id: 'evelyn',
      name: 'Evelyn',
      gender: 'female',
      color: '#e74c3c',
      clue: 'She was sitting in a chair. She was alone with a man.',
      avatar: '👩‍🦱',
      constraints: [
        { type: 'onCellType', cellType: 'chair' },
        { type: 'aloneWithGender', gender: 'male' },
      ],
    },
    {
      id: 'florian',
      name: 'Florian',
      gender: 'male',
      color: '#27ae60',
      clue: 'He was alone.',
      avatar: '👨',
      constraints: [{ type: 'alone' }],
    },
    {
      id: 'gary',
      name: 'Gary',
      gender: 'male',
      color: '#34495e',
      clue: 'He was beside a bonsai.',
      avatar: '🧑‍🦲',
      constraints: [{ type: 'beside', cellType: 'bonsai' }],
    },
    {
      id: 'harlow',
      name: 'Harlow',
      gender: 'female',
      color: '#16a085',
      clue: 'She was beside a shrub.',
      avatar: '👩‍🦳',
      constraints: [{ type: 'beside', cellType: 'shrub' }],
    },
    {
      id: 'idara',
      name: 'Idara',
      gender: 'female',
      color: '#d35400',
      clue: 'She was sitting in a chair. She was alone.',
      avatar: '👧',
      constraints: [
        { type: 'onCellType', cellType: 'chair' },
        { type: 'alone' },
      ],
    },
    {
      id: 'joss',
      name: 'Joss',
      gender: 'male',
      color: '#1abc9c',
      clue: 'He was beside a Lily pad.',
      avatar: '👨‍🦱',
      constraints: [{ type: 'beside', cellType: 'lilyPad' }],
    },
    {
      id: 'kaela',
      name: 'Kaela',
      gender: 'female',
      color: '#9b59b6',
      clue: 'She was beside a cactus.',
      avatar: '👩‍🔬',
      constraints: [{ type: 'beside', cellType: 'cactus' }],
    },
    {
      id: 'veronica',
      name: 'Veronica',
      gender: 'female',
      color: '#3498db',
      clue: 'The Victim. She was alone with the murderer.',
      avatar: '👧',
      isVictim: true,
      constraints: [{ type: 'victim' }],
    },
  ],

  boardLayout: [
    // Row 0
    [
      { room: 'bonsaiExhibit', type: cellTypes.CHAIR },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.BONSAI },
      { room: 'bonsaiExhibit', type: cellTypes.TABLE },
      { room: 'bonsaiExhibit', type: cellTypes.TABLE },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'infoDesk', type: cellTypes.EMPTY },
      { room: 'infoDesk', type: cellTypes.CHAIR },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
    ],
    // Row 1
    [
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.BONSAI },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.TABLE },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'infoDesk', type: cellTypes.EMPTY },
      { room: 'infoDesk', type: cellTypes.TABLE },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.CHAIR },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.TREE },
    ],
    // Row 2
    [
      { room: 'bonsaiExhibit', type: cellTypes.BONSAI },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.CHAIR },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.EMPTY },
    ],
    // Row 3
    [
      { room: 'bonsaiExhibit', type: cellTypes.CHAIR },
      { room: 'bonsaiExhibit', type: cellTypes.BONSAI },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'bonsaiExhibit', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.CHAIR },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
    ],
    // Row 4
    [
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.TREE },
    ],
    // Row 5
    [
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.CHAIR },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.PATH },
      { room: 'arboretum', type: cellTypes.EMPTY },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.TREE },
      { room: 'arboretum', type: cellTypes.EMPTY },
    ],
    // Row 6
    [
      { room: 'gazebo', type: cellTypes.EMPTY },
      { room: 'gazebo', type: cellTypes.TABLE },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.EMPTY },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.SHRUB },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.TREE },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.SHRUB },
      { room: 'restingArea', type: cellTypes.EMPTY },
    ],
    // Row 7
    [
      { room: 'gazebo', type: cellTypes.CHAIR },
      { room: 'gazebo', type: cellTypes.EMPTY },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.LILY_PAD },
      { room: 'restingArea', type: cellTypes.TABLE },
      { room: 'restingArea', type: cellTypes.SHRUB },
    ],
    // Row 8
    [
      { room: 'gazebo', type: cellTypes.EMPTY },
      { room: 'gazebo', type: cellTypes.TABLE },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.EMPTY },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.LILY_PAD },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'restingArea', type: cellTypes.CHAIR },
    ],
    // Row 9
    [
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.PATH },
      { room: 'flowerGarden', type: cellTypes.FLOWERS },
      { room: 'flowerGarden', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.LILY_PAD },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'pond', type: cellTypes.POND_WATER },
      { room: 'restingArea', type: cellTypes.CHAIR },
    ],
    // Row 10
    [
      { room: 'desertExhibit', type: cellTypes.CACTUS },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.CACTUS },
      { room: 'restingArea', type: cellTypes.SHRUB },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.CHAIR },
      { room: 'restingArea', type: cellTypes.TABLE },
      { room: 'restingArea', type: cellTypes.TREE },
      { room: 'restingArea', type: cellTypes.EMPTY },
    ],
    // Row 11
    [
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.CACTUS },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'desertExhibit', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.PATH },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.EMPTY },
      { room: 'restingArea', type: cellTypes.EMPTY },
    ],
  ],

  solution: {
    aveline: { row: 4, col: 5 },
    brielle: { row: 2, col: 9 },
    collin: { row: 10, col: 8 },
    della: { row: 5, col: 2 },
    evelyn: { row: 3, col: 0 },
    florian: { row: 7, col: 1 },
    gary: { row: 1, col: 3 },
    harlow: { row: 6, col: 11 },
    idara: { row: 0, col: 7 },
    joss: { row: 8, col: 6 },
    kaela: { row: 11, col: 4 },
    veronica: { row: 9, col: 10 },
  },

  victim: 'veronica',
  murderer: 'joss',
  crimeRoom: 'pond',

  hints: [
    {
      suspect: 'evelyn',
      order: 1,
      prerequisites: [],
      target: {
        type: 'cellType',
        cellType: 'chair',
        room: 'bonsaiExhibit',
      },
      messages: {
        single:
          '💡 Evelyn was in a chair, alone with a man. The only possibility is Gary in the Bonsai Exhibit. Evelyn at (0,3) isolates Idara in the R1C8 chair.',
        multiple:
          '💡 Evelyn was in a chair, alone with a man. Which man can share a room with her while she sits in a chair?',
      },
    },
    {
      suspect: 'idara',
      order: 2,
      prerequisites: ['evelyn'],
      target: { type: 'cellType', cellType: 'chair', room: 'gazebo' },
      messages: {
        single:
          '💡 Idara was in a chair and alone. With Evelyn placed, Idara is isolated in the Gazebo chair at (7,0).',
        multiple:
          '💡 Idara was in a chair and alone. After placing Evelyn, find where Idara must be.',
      },
    },
    {
      suspect: 'florian',
      order: 3,
      prerequisites: ['idara'],
      target: { type: 'room', room: 'infoDesk' },
      messages: {
        single:
          '💡 Florian was alone. With Idara in Gazebo, Florian is isolated in the Info Desk at (1,7).',
        multiple:
          '💡 Florian was alone. Which remaining small room can he occupy alone?',
      },
    },
    {
      suspect: 'della',
      order: 4,
      prerequisites: ['florian'],
      target: {
        type: 'cellType',
        cellType: 'path',
        room: 'flowerGarden',
      },
      messages: {
        single:
          '💡 Della was on a path and alone. She must be in the Flower Garden. At (2,5), all other Flower Garden cells get blocked.',
        multiple:
          '💡 Della was on a path and alone. Find a PATH cell in Flower Garden where she can be isolated.',
      },
    },
    {
      suspect: 'gary',
      order: 5,
      prerequisites: ['della'],
      target: { type: 'adjacentTo', cellType: 'bonsai' },
      messages: {
        single:
          '💡 Gary was beside a bonsai. With previous placements, Gary is isolated at (3,1) beside a bonsai.',
        multiple:
          '💡 Gary was beside a bonsai. He shares the Bonsai Exhibit with Evelyn.',
      },
    },
    {
      suspect: 'kaela',
      order: 6,
      prerequisites: ['gary'],
      target: { type: 'adjacentTo', cellType: 'cactus' },
      messages: {
        single:
          '💡 Kaela was beside a cactus. She is isolated at (4,11) beside a cactus in Desert Exhibit.',
        multiple:
          '💡 Kaela was beside a cactus. Check the Desert Exhibit for available cactus-adjacent cells.',
      },
    },
    {
      suspect: 'brielle',
      order: 7,
      prerequisites: ['kaela'],
      target: {
        type: 'cellType',
        cellType: 'chair',
        room: 'arboretum',
      },
      messages: {
        single:
          '💡 Brielle was in a chair in the Arboretum. She is isolated in the last available Arboretum chair at (9,2).',
        multiple:
          '💡 Brielle was in a chair in the Arboretum. Check which Arboretum chairs are still available.',
      },
    },
    {
      suspect: 'collin',
      order: 8,
      prerequisites: ['brielle'],
      target: { type: 'adjacentTo', cellType: 'table' },
      messages: {
        single:
          '💡 Collin was beside a table. He is isolated at (8,10) beside a table.',
        multiple:
          '💡 Collin was beside a table. Find the last available cell beside a table.',
      },
    },
    {
      suspect: 'joss',
      order: 9,
      prerequisites: ['collin'],
      target: { type: 'adjacentTo', cellType: 'lilyPad' },
      messages: {
        single:
          '💡 Joss was beside a lily pad. He is at (6,8) beside the last available lily pad in the Pond.',
        multiple:
          '💡 Joss was beside a lily pad. Find the last available cell beside a lily pad.',
      },
    },
    {
      suspect: 'aveline',
      order: 10,
      prerequisites: ['joss'],
      target: { type: 'any' },
      messages: {
        single:
          '💡 Aveline was one row north of Della. Della at row 2 means Aveline must be in row 1, but row 1 is taken. Della at R3 means Aveline at R2... Aveline at (5,4) and Della at (2,5) satisfies this - Aveline is one row north!',
        multiple:
          "💡 Aveline was one row north of Della. Her row must be Della's row minus 1.",
      },
    },
    {
      suspect: 'harlow',
      order: 11,
      prerequisites: ['aveline'],
      target: { type: 'adjacentTo', cellType: 'shrub' },
      messages: {
        single:
          '💡 Harlow was beside a shrub. She is isolated at (11,6) beside a shrub in the Resting Area.',
        multiple:
          '💡 Harlow was beside a shrub. Find the last available cell beside a shrub.',
      },
    },
    {
      suspect: 'veronica',
      order: 12,
      prerequisites: ['harlow'],
      target: { type: 'room', room: 'pond' },
      messages: {
        single:
          '💡 Veronica was alone with the murderer. She is isolated at (10,9) in the Pond, alone with Joss. Joss is the murderer!',
        multiple:
          '💡 Veronica was alone with the murderer. Find the last available cell - she must be with the murderer.',
      },
    },
  ],
};

export default puzzle;
