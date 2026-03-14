// Simplified iconic track shapes as SVG paths
const TRACKS = {
  monaco: {
    path: "M 80 160 L 80 100 Q 80 60 120 40 L 180 30 Q 220 25 240 50 L 260 80 L 280 100 L 300 90 Q 320 80 330 100 L 320 140 L 280 160 L 260 180 Q 240 200 200 190 L 160 175 Q 120 165 80 160 Z",
    label: "Circuit de Monaco"
  },
  monza: {
    path: "M 60 120 L 200 120 Q 250 120 260 90 L 260 60 Q 260 40 240 40 L 80 40 Q 60 40 60 60 L 60 120 M 60 120 Q 60 150 80 160 L 240 160 Q 260 155 270 140 L 300 80 Q 310 60 300 50 L 280 45",
    label: "Autodromo Nazionale Monza"
  },
  silverstone: {
    path: "M 60 130 Q 55 100 80 80 L 120 60 Q 160 45 200 55 L 240 70 Q 270 80 280 110 L 285 150 Q 285 180 260 195 L 220 210 Q 180 220 150 210 L 110 190 Q 75 170 60 130 Z",
    label: "Silverstone Circuit"
  },
  suzuka: {
    path: "M 100 80 Q 120 50 160 60 L 200 80 Q 230 95 240 130 L 235 160 Q 230 180 210 185 L 180 190 Q 140 192 120 175 L 100 155 Q 80 135 80 110 Q 80 90 100 80 M 190 130 Q 220 110 240 130",
    label: "Suzuka Circuit"
  },
  'circuit de monaco': {
    path: "M 80 160 L 80 100 Q 80 60 120 40 L 180 30 Q 220 25 240 50 L 260 80 L 280 100 L 300 90 Q 320 80 330 100 L 320 140 L 280 160 L 260 180 Q 240 200 200 190 L 160 175 Q 120 165 80 160 Z",
    label: "Circuit de Monaco"
  },
  'autodromo nazionale monza': {
    path: "M 60 120 L 200 120 Q 250 120 260 90 L 260 60 Q 260 40 240 40 L 80 40 Q 60 40 60 60 L 60 120 M 60 120 Q 60 150 80 160 L 240 160 Q 260 155 270 140 L 300 80 Q 310 60 300 50 L 280 45",
    label: "Autodromo Nazionale Monza"
  },
  default: {
    path: "M 100 180 Q 60 170 50 130 L 55 90 Q 65 50 100 40 L 160 35 Q 210 35 240 60 L 265 90 Q 285 115 280 150 L 265 175 Q 240 200 200 205 L 155 205 Q 120 200 100 180 Z",
    label: "F1 Circuit"
  }
};

export default function TrackSVG({ trackKey }) {
  const key = (trackKey || '').toLowerCase();
  const track = TRACKS[key] || Object.entries(TRACKS).find(([k]) => key.includes(k))?.[1] || TRACKS.default;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 360 240" className="w-full max-w-xs" style={{ filter: 'drop-shadow(0 0 8px #e1060040)' }}>
        <path
          d={track.path}
          fill="none"
          stroke="#e10600"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={track.path}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
        {/* Start/Finish line */}
        <rect x="75" y="118" width="12" height="6" fill="#ffd700" opacity="0.8" />
      </svg>
      <p className="text-xs text-gray-500">{track.label}</p>
    </div>
  );
}