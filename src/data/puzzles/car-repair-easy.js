import backgroundImage from '../car-repair-easy.jpg';
import { cellTypes } from '../gameData';

const puzzle = {
  id: 'car-repair-easy',
  name: 'Car Repair',
  subtitle: 'The Car Repair Mystery',
  difficulty: 'Easy',
  gridSize: 6,
  cellSize: 70,
  imageBorder: { top: 13, right: 19, bottom: 19, left: 8 },
  backgroundImage,

  rooms: {
    reception: { name: 'Reception', color: '#9fc5e8' },
    waitingArea: { name: 'Waiting Area', color: '#d5a6bd' },
    storage: { name: 'Storage', color: '#c9daf8' },
    garage: { name: 'Garage', color: '#d9ead3' },
  },

  suspects: [
    {
      id: 'anthony',
      name: 'Anthony',
      color: '#e69500',
      clue: 'He was in a car.',
      avatar: '🧔',
    },
    {
      id: 'brock',
      name: 'Brock',
      color: '#4a86e8',
      clue: 'He was on an oil slick.',
      avatar: '👓',
    },
    {
      id: 'crystal',
      name: 'Crystal',
      color: '#e06666',
      clue: 'She was sitting in a chair.',
      avatar: '👩‍🦰',
    },
    {
      id: 'diane',
      name: 'Diane',
      color: '#6aa84f',
      clue: 'She was alone in the Waiting Area.',
      avatar: '👩‍🦳',
    },
    {
      id: 'emilio',
      name: 'Emilio',
      color: '#8e7cc3',
      clue: 'He was beside a shelf.',
      avatar: '👨‍🦳',
    },
    {
      id: 'vaughn',
      name: 'Vaughn',
      color: '#3c78d8',
      clue: 'The Victim. He was alone with the murderer.',
      avatar: '🧔‍♂️',
      isVictim: true,
    },
  ],

  boardLayout: [
    [
      { room: 'reception', type: cellTypes.TABLE },
      { room: 'reception', type: cellTypes.CHAIR },
      { room: 'reception', type: cellTypes.TABLE },
      { room: 'waitingArea', type: cellTypes.TV },
      { room: 'storage', type: cellTypes.EMPTY },
      { room: 'storage', type: cellTypes.SHELF },
    ],
    [
      { room: 'reception', type: cellTypes.EMPTY },
      { room: 'reception', type: cellTypes.TABLE },
      { room: 'reception', type: cellTypes.TABLE },
      { room: 'waitingArea', type: cellTypes.EMPTY },
      { room: 'waitingArea', type: cellTypes.PLANT },
      { room: 'storage', type: cellTypes.EMPTY },
    ],
    [
      { room: 'reception', type: cellTypes.EMPTY },
      { room: 'reception', type: cellTypes.EMPTY },
      { room: 'reception', type: cellTypes.SHELF },
      { room: 'waitingArea', type: cellTypes.CHAIR },
      { room: 'waitingArea', type: cellTypes.CHAIR },
      { room: 'waitingArea', type: cellTypes.EMPTY },
    ],
    [
      { room: 'reception', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.SHELF },
      { room: 'garage', type: cellTypes.SHELF },
      { room: 'garage', type: cellTypes.EMPTY },
    ],
    [
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.CAR },
      { room: 'garage', type: cellTypes.CAR },
      { room: 'garage', type: cellTypes.OIL_SLICK },
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.EMPTY },
    ],
    [
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.OIL_SLICK },
      { room: 'garage', type: cellTypes.EMPTY },
      { room: 'garage', type: cellTypes.CAR },
      { room: 'garage', type: cellTypes.CAR },
      { room: 'garage', type: cellTypes.EMPTY },
    ],
  ],

  solution: {
    anthony: { row: 5, col: 4 },
    brock: { row: 4, col: 3 },
    crystal: { row: 0, col: 1 },
    diane: { row: 2, col: 5 },
    emilio: { row: 3, col: 2 },
    vaughn: { row: 1, col: 0 },
  },

  victim: 'vaughn',
  murderer: 'crystal',
  crimeRoom: 'reception',

  hints: [
    {
      suspect: 'diane',
      order: 1,
      prerequisites: [],
      target: { type: 'room', room: 'waitingArea' },
      messages: {
        single:
          '💡 Diane was alone in the Waiting Area. Only one spot there can be occupied.',
        multiple:
          '💡 Diane was alone in the Waiting Area. Look for the only available seat there.',
      },
    },
    {
      suspect: 'crystal',
      order: 2,
      prerequisites: ['diane'],
      target: { type: 'cellType', cellType: 'chair' },
      messages: {
        single:
          '💡 Crystal was sitting in a chair. With Diane alone in the Waiting Area, the only remaining chair is in Reception!',
        multiple:
          '💡 Crystal was sitting in a chair. With the Waiting Area occupied, check the chair in Reception.',
      },
    },
    {
      suspect: 'brock',
      order: 3,
      prerequisites: ['crystal'],
      target: { type: 'cellType', cellType: 'oilSlick' },
      messages: {
        single:
          '💡 Brock was on an oil slick. After Crystal blocks her row and column, there is only one oil slick left!',
        multiple:
          '💡 Brock was on an oil slick. With Crystal placed, one of the slicks is blocked – check the remaining one.',
      },
    },
    {
      suspect: 'anthony',
      order: 4,
      prerequisites: ['brock'],
      target: { type: 'cellType', cellType: 'car' },
      messages: {
        single:
          '💡 Anthony was in a car. Brock’s row blocks one car spot, leaving a single open car.',
        multiple:
          '💡 Anthony was in a car. With Brock placed, only one car spot remains open.',
      },
    },
    {
      suspect: 'emilio',
      order: 5,
      prerequisites: ['anthony'],
      target: { type: 'adjacentTo', cellType: 'shelf' },
      messages: {
        single:
          '💡 Emilio was beside a shelf. There is only one available cell adjacent to a shelf now.',
        multiple:
          '💡 Emilio was beside a shelf. Look for free cells touching a shelf.',
      },
    },
    {
      suspect: 'vaughn',
      order: 6,
      prerequisites: ['emilio'],
      target: { type: 'room', room: 'reception' },
      messages: {
        single:
          '💡 Vaughn was alone with the murderer. The only open spot in Reception with Crystal is his.',
        multiple:
          '💡 Vaughn was alone with the murderer. Look for the last available spot in the same room as Crystal.',
      },
    },
  ],
};

export default puzzle;
