/**
 * @typedef {import('../types').SuspectCardProps} SuspectCardProps
 * @typedef {import('../types').Suspect} Suspect
 */

/**
 * Renders a suspect information card.
 * Shows avatar, name, clue text, selection state, and placed indicator.
 *
 * @param {SuspectCardProps} props - Component props
 * @param {Suspect} props.suspect - Suspect data
 * @param {boolean} props.isSelected - Whether suspect is currently selected
 * @param {boolean} props.isPlaced - Whether suspect is placed on board
 * @param {function(Suspect): void} props.onClick - Click handler
 * @returns {JSX.Element}
 */
function SuspectCard({ suspect, isSelected, isPlaced, onClick }) {
  return (
    <div
      className={`
				relative p-3 rounded-lg cursor-pointer transition-all duration-200
				border-2 shadow-lg
				${
          isSelected
            ? 'ring-2 ring-yellow-400 scale-105 border-yellow-400'
            : 'border-transparent'
        }
				${isPlaced ? 'opacity-50' : 'hover:scale-105'}
			`}
      style={{ backgroundColor: suspect.color + '33' }}
      onClick={() => onClick(suspect)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-md"
          style={{ backgroundColor: suspect.color }}
        >
          {suspect.avatar}
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-white ${
              suspect.isVictim ? 'text-red-300' : ''
            }`}
          >
            {suspect.name}
            {suspect.isVictim && (
              <span className="ml-2 text-xs bg-red-600 px-2 py-0.5 rounded">
                VICTIM
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-300 mt-1 leading-tight">
            {suspect.clue}
          </p>
        </div>
      </div>

      {isPlaced && (
        <div className="absolute top-1 right-1">
          <span className="text-green-400 text-lg">✓</span>
        </div>
      )}
    </div>
  );
}

export default SuspectCard;
