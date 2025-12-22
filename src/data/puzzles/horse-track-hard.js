import backgroundImage from '../horse-track-hard.jpg';
import { cellTypes } from '../gameData';

const puzzle = {
  id: 'horse-track-hard',
  name: 'The Horse Track',
  subtitle: 'The Horse Track Mystery',
  difficulty: 'Hard',
  gridSize: 12,
  cellSize: 50,
  imageBorder: { top: 5, right: 5, bottom: 5, left: 5 },
  backgroundImage,

  rooms: {
    vipArea: { name: 'VIP Area', color: '#d7bde2' },
    jockeysRoom: { name: "Jockeys' Room", color: '#d7bde2' },
    stables: { name: 'Stables', color: '#f5cba7' },
    infield: { name: 'Infield', color: '#82e0aa' },
    horseTrack: { name: 'Horse Track', color: '#f9e79f' },
    concessions: { name: 'Concessions', color: '#f5cba7' },
    stands: { name: 'Stands', color: '#fadbd8' },
    betting: { name: 'Betting', color: '#d7bde2' },
  },

  suspects: [
    {
      id: 'al',
      name: 'Al',
      color: '#8B4513',
      clue: 'Jockey. He was ahead of Blake.',
      avatar: '🧔',
    },
    {
      id: 'blake',
      name: 'Blake',
      color: '#2c3e50',
      clue: 'Jockey. He was ahead of Claire.',
      avatar: '👨🏿',
    },
    {
      id: 'claire',
      name: 'Claire',
      color: '#27ae60',
      clue: 'Jockey. She was ahead of Dale.',
      avatar: '👩',
    },
    {
      id: 'dale',
      name: 'Dale',
      color: '#3498db',
      clue: 'Jockey. He was behind Al, Blake and Claire.',
      avatar: '👨',
    },
    {
      id: 'ella',
      name: 'Ella',
      color: '#9b59b6',
      clue: 'She was either in the first or in the last column.',
      avatar: '👩🏿',
    },
    {
      id: 'frank',
      name: 'Frank',
      color: '#e67e22',
      clue: "He was in the Jockey's Room.",
      avatar: '🧑',
    },
    {
      id: 'glenda',
      name: 'Glenda',
      color: '#e74c3c',
      clue: 'She was beside a TV.',
      avatar: '👩‍🦰',
    },
    {
      id: 'hartley',
      name: 'Hartley',
      color: '#95a5a6',
      clue: 'He was the only person sitting in a chair.',
      avatar: '👴',
    },
    {
      id: 'ignacia',
      name: 'Ignacia',
      color: '#1abc9c',
      clue: 'She was not on a carpet. She was alone with Ella.',
      avatar: '👩🏽',
    },
    {
      id: 'james',
      name: 'James',
      color: '#f39c12',
      clue: 'He was beside a shelf.',
      avatar: '🧑‍🦱',
    },
    {
      id: 'kathryn',
      name: 'Kathryn',
      color: '#c0392b',
      clue: 'She was in the VIP Area.',
      avatar: '👱‍♀️',
    },
    {
      id: 'veronica',
      name: 'Veronica',
      color: '#8e44ad',
      clue: 'The Victim. She was alone with the murderer.',
      avatar: '👧',
      isVictim: true,
    },
  ],

  boardLayout: [
    // Row 0
    [
      { room: 'vipArea', type: cellTypes.CARPET },
      { room: 'vipArea', type: cellTypes.EMPTY },
      { room: 'vipArea', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'jockeysRoom', type: cellTypes.TV },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.TABLE },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'stables', type: cellTypes.EMPTY },
      { room: 'stables', type: cellTypes.TABLE },
      { room: 'stables', type: cellTypes.CARPET },
    ],
    // Row 1
    [
      { room: 'vipArea', type: cellTypes.CARPET },
      { room: 'vipArea', type: cellTypes.CHAIR },
      { room: 'vipArea', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.TABLE },
      { room: 'jockeysRoom', type: cellTypes.CARPET },
      { room: 'jockeysRoom', type: cellTypes.CARPET },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'stables', type: cellTypes.HORSE },
      { room: 'stables', type: cellTypes.TABLE },
      { room: 'stables', type: cellTypes.CARPET },
    ],
    // Row 2
    [
      { room: 'vipArea', type: cellTypes.EMPTY },
      { room: 'vipArea', type: cellTypes.TABLE },
      { room: 'vipArea', type: cellTypes.TABLE },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.EMPTY },
      { room: 'jockeysRoom', type: cellTypes.CHAIR },
      { room: 'jockeysRoom', type: cellTypes.SHELF },
      { room: 'stables', type: cellTypes.EMPTY },
      { room: 'stables', type: cellTypes.EMPTY },
      { room: 'stables', type: cellTypes.HORSE },
    ],
    // Row 3
    [
      { room: 'vipArea', type: cellTypes.EMPTY },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'stables', type: cellTypes.EMPTY },
    ],
    // Row 4
    [
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
    ],
    // Row 5
    [
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'infield', type: cellTypes.TV },
      { room: 'infield', type: cellTypes.TV },
      { room: 'infield', type: cellTypes.TABLE },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'infield', type: cellTypes.TV },
      { room: 'infield', type: cellTypes.TV },
      { room: 'infield', type: cellTypes.TABLE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
    ],
    // Row 6
    [
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'infield', type: cellTypes.CARPET },
      { room: 'infield', type: cellTypes.CARPET },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'infield', type: cellTypes.CARPET },
      { room: 'infield', type: cellTypes.CARPET },
      { room: 'infield', type: cellTypes.EMPTY },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
    ],
    // Row 7
    [
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.FINISHING_LINE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
    ],
    // Row 8
    [
      { room: 'concessions', type: cellTypes.EMPTY },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.FINISHING_LINE },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.TRACK },
      { room: 'horseTrack', type: cellTypes.HORSE },
      { room: 'betting', type: cellTypes.TABLE },
    ],
    // Row 9
    [
      { room: 'concessions', type: cellTypes.EMPTY },
      { room: 'concessions', type: cellTypes.TABLE },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'betting', type: cellTypes.TABLE },
      { room: 'betting', type: cellTypes.CARPET },
      { room: 'betting', type: cellTypes.CARPET },
    ],
    // Row 10
    [
      { room: 'concessions', type: cellTypes.EMPTY },
      { room: 'concessions', type: cellTypes.TABLE },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'betting', type: cellTypes.TABLE },
      { room: 'betting', type: cellTypes.CHAIR },
      { room: 'betting', type: cellTypes.TV },
    ],
    // Row 11
    [
      { room: 'concessions', type: cellTypes.SHELF },
      { room: 'concessions', type: cellTypes.EMPTY },
      { room: 'concessions', type: cellTypes.CARPET },
      { room: 'concessions', type: cellTypes.CARPET },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.CHAIR },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.EMPTY },
      { room: 'stands', type: cellTypes.TV },
      { room: 'betting', type: cellTypes.TABLE },
      { room: 'betting', type: cellTypes.TABLE },
      { room: 'betting', type: cellTypes.EMPTY },
    ],
  ],

  solution: {
    al: { row: 7, col: 3 },
    blake: { row: 6, col: 1 },
    claire: { row: 4, col: 8 },
    dale: { row: 8, col: 10 },
    ella: { row: 3, col: 11 },
    frank: { row: 2, col: 5 },
    glenda: { row: 5, col: 6 },
    hartley: { row: 9, col: 4 },
    ignacia: { row: 0, col: 9 },
    james: { row: 10, col: 0 },
    kathryn: { row: 1, col: 2 },
    veronica: { row: 11, col: 7 },
  },

  // Murder mystery solution metadata
  victim: 'veronica',
  murderer: 'hartley',
  crimeRoom: 'stands',

  /**
   * Hint data for the puzzle solver.
   * This is a hard puzzle with complex deductions.
   */
  hints: [
    // Step 1: Ella and Ignacia must be in Stables (last column)
    // E's clue: first or last column. I's clue: alone with E, not on carpet.
    // If E in first column, K would be forced to R2 VIP and J to R2 beside shelf (impossible).
    // So E must be in last column. I can't be on carpet, so both in Stables.
    {
      suspect: 'ignacia',
      order: 1,
      prerequisites: [],
      target: { type: 'room', room: 'stables' },
      messages: {
        single: `💡 Ignacia was alone with Ella and can't be on a carpet. Through elimination, they must be in the Stables. There's only one spot!`,
        multiple: `💡 Ignacia was alone with Ella and can't be on a carpet. If Ella were in the first column, it would force impossible placements for Kathryn and James. So Ella must be in the last column, and Ignacia must be with her in the Stables (not on carpet or chair).`,
      },
      markingHint: {
        condition: 'sameCol',
        message: `💡 Ignacia and Ella must be in the Stables (last column). Mark X on all other cells in column 12!`,
      },
      skipIfMoreThan: 1,
    },
    {
      suspect: 'ella',
      order: 2,
      prerequisites: ['ignacia'],
      target: { type: 'room', room: 'stables' },
      messages: {
        single: `💡 Ella was with Ignacia in the Stables. There's only one spot left!`,
        multiple: `💡 Ella was with Ignacia. She must be in the first or last column - and since Ignacia is in the Stables, Ella must be there too.`,
      },
    },

    // Step 2: K, F, I, E occupy R1-R4 (rows 0-3). Block Horse Track in R4.
    {
      suspect: 'kathryn',
      order: 3,
      prerequisites: ['ella'],
      target: { type: 'room', room: 'vipArea' },
      messages: {
        single: `💡 Kathryn was in the VIP Area. There's only one spot left!`,
        multiple: `💡 Kathryn was in the VIP Area. With Ella and Ignacia placed, look for available spots there.`,
      },
    },

    // Step 3: Jockeys are on horses (on the track in R5, R7, R8, R9 = rows 4, 6, 7, 8)
    // This isolates a jockey in R7C2 (row 6, col 1)
    {
      suspect: 'blake',
      order: 4,
      prerequisites: ['kathryn'],
      target: { type: 'cellType', cellType: 'horse' },
      messages: {
        single: `💡 The jockeys (Al, Blake, Claire, Dale) were on horses. Blake was ahead of Claire. There's only one horse spot that works!`,
        multiple: `💡 The four jockeys were racing on horses. With K, F, I, E occupying the top rows, look for an isolated horse position. One jockey must be at R7C2!`,
      },
      skipIfMoreThan: 1,
    },

    // Step 4: James beside shelf
    {
      suspect: 'james',
      order: 5,
      prerequisites: ['kathryn'],
      target: { type: 'adjacentTo', cellType: 'shelf' },
      messages: {
        single: `💡 James was beside a shelf. There's only one spot adjacent to a shelf!`,
        multiple: `💡 James was beside a shelf. With the top rows blocked by K, F, I, E, look for cells adjacent to shelves.`,
      },
    },

    // Step 5: Claire on horse in R5 (row 4)
    {
      suspect: 'claire',
      order: 6,
      prerequisites: ['james', 'blake'],
      target: { type: 'cellType', cellType: 'horse' },
      messages: {
        single: `💡 Claire was a jockey on a horse. She was ahead of Dale. There's only one spot!`,
        multiple: `💡 Claire was a jockey on a horse, ahead of Dale but behind Blake. Look for available horse positions.`,
      },
      skipIfMoreThan: 1,
    },

    // Step 6: Glenda beside TV
    {
      suspect: 'glenda',
      order: 7,
      prerequisites: ['claire'],
      target: { type: 'adjacentTo', cellType: 'tv' },
      messages: {
        single: `💡 Glenda was beside a TV. There's only one spot!`,
        multiple: `💡 Glenda was beside a TV. She's the only non-jockey who can be in R6 (since Veronica needs to be alone with the murderer elsewhere).`,
      },
    },

    // Step 7: Frank in Jockey's Room (not on chair per Hartley's clue)
    {
      suspect: 'frank',
      order: 8,
      prerequisites: ['glenda'],
      target: { type: 'room', room: 'jockeysRoom' },
      messages: {
        single: `💡 Frank was in the Jockey's Room. There's only one spot!`,
        multiple: `💡 Frank was in the Jockey's Room. Hartley's clue says he was the ONLY person sitting in a chair, so Frank can't be on a chair.`,
      },
    },

    // Step 8: Hartley on the last chair
    {
      suspect: 'hartley',
      order: 9,
      prerequisites: ['frank'],
      target: { type: 'cellType', cellType: 'chair' },
      messages: {
        single: `💡 Hartley was the only person sitting in a chair. There's only one chair left!`,
        multiple: `💡 Hartley was the only person sitting in a chair. Look for available chair cells.`,
      },
    },

    // Step 9: Al on horse (ahead of Blake)
    {
      suspect: 'al',
      order: 10,
      prerequisites: ['hartley'],
      target: { type: 'cellType', cellType: 'horse' },
      messages: {
        single: `💡 Al was a jockey on a horse, ahead of Blake. There's only one spot!`,
        multiple: `💡 Al was a jockey ahead of Blake. The track runs counter-clockwise from the finishing line - horses closer to R9C6 are in the lead.`,
      },
    },

    // Step 10: Dale on horse (behind everyone)
    {
      suspect: 'dale',
      order: 11,
      prerequisites: ['al'],
      target: { type: 'cellType', cellType: 'horse' },
      messages: {
        single: `💡 Dale was the last jockey, behind Al, Blake, and Claire. There's only one horse left!`,
        multiple: `💡 Dale was behind all other jockeys. Look for remaining horse positions.`,
      },
    },

    // Step 11: Veronica alone with murderer (Hartley)
    {
      suspect: 'veronica',
      order: 12,
      prerequisites: ['dale'],
      target: { type: 'any' },
      messages: {
        single: `💡 Veronica was alone with the murderer. She must be in the same room as Hartley - check the Stands! The murderer is Hartley!`,
        multiple: `💡 Veronica was alone with the murderer. Look for a cell in the same room as one of the placed suspects...`,
      },
    },
  ],
};

export default puzzle;
