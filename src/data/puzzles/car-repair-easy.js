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
      suspect: 'crystal',
      order: 1,
      prerequisites: [],
      target: { type: 'cellType', cellType: 'chair' },
      messages: {
        single:
          '💡 Crystal was sitting in a chair. Diane must be alone in the Waiting Area, so the only chair left for Crystal is in Reception.',
        multiple:
          '💡 Crystal was sitting in a chair. The Waiting Area is off-limits to everyone else, so check the chair in Reception.',
      },
    },
    {
      suspect: 'brock',
      order: 2,
      prerequisites: ['crystal'],
      target: { type: 'cellType', cellType: 'oilSlick' },
      messages: {
        single:
          '💡 Brock was on an oil slick. With Crystal placed, only one oil slick cell remains open.',
        multiple:
          '💡 Brock was on an oil slick. Crystal’s placement blocks one slick, leaving a single option.',
      },
    },
    {
      suspect: 'anthony',
      order: 3,
      prerequisites: ['brock'],
      target: { type: 'cellType', cellType: 'car' },
      messages: {
        single:
          '💡 Anthony was in a car. After Brock blocks his row and column, only one car cell is free.',
        multiple:
          '💡 Anthony was in a car. With Brock placed, just one car spot remains available.',
      },
    },
    {
      suspect: 'diane',
      order: 4,
      prerequisites: ['anthony'],
      target: { type: 'room', room: 'waitingArea' },
      messages: {
        single:
          '💡 Diane was alone in the Waiting Area. With rows and columns blocked, only one cell there is free.',
        multiple:
          '💡 Diane was alone in the Waiting Area. Check the last open cell in that room.',
      },
    },
    {
      suspect: 'emilio',
      order: 5,
      prerequisites: ['diane'],
      target: { type: 'adjacentTo', cellType: 'shelf' },
      messages: {
        single:
          '💡 Emilio was beside a shelf. There is only one available cell adjacent to a shelf now.',
        multiple:
          '💡 Emilio was beside a shelf. Look for the remaining free shelf-adjacent spot.',
      },
    },
    {
      suspect: 'vaughn',
      order: 6,
      prerequisites: ['emilio'],
      target: { type: 'any' },
      messages: {
        single:
          '💡 Vaughn was alone with the murderer. Only one cell is left—place Vaughn there with Crystal.',
        multiple:
          '💡 Vaughn was alone with the murderer. Place him in the last remaining cell, in the same room as Crystal.',
      },
    },
  ],
};

export default puzzle;
