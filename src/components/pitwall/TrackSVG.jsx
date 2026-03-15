const TRACKS = {
  // R1 - Australia (Albert Park) - flowing lake circuit
  'albert park circuit': {
    path: 'M 80 160 L 70 120 Q 68 90 85 70 L 110 55 L 160 48 L 210 52 Q 245 58 258 80 L 265 105 L 258 130 Q 250 155 230 165 L 200 172 L 170 175 Q 130 175 100 165 Z',
    label: 'Albert Park Circuit'
  },
  // R2 - China (Shanghai) - snail shape
  'shanghai international circuit': {
    path: 'M 60 150 L 60 100 Q 60 60 95 45 L 150 38 L 210 42 Q 255 50 268 90 L 270 130 Q 268 165 240 178 L 195 185 L 155 183 Q 110 175 90 155 L 80 135 L 80 115 Q 82 95 100 90 L 130 88 L 160 90 Q 180 95 182 112 L 178 128 Q 170 140 155 140 L 135 138',
    label: 'Shanghai International Circuit'
  },
  // R3 - Japan (Suzuka) - figure-8
  'suzuka circuit': {
    path: 'M 90 75 Q 110 45 150 50 L 190 60 Q 225 75 235 110 L 230 145 Q 220 170 195 178 L 165 182 Q 130 180 112 160 L 100 140 Q 88 118 90 95 M 195 115 Q 220 100 238 118 L 242 138 Q 238 158 220 162',
    label: 'Suzuka Circuit'
  },
  // R4 - Bahrain - desert circuit with hairpins
  'bahrain international circuit': {
    path: 'M 70 155 L 68 110 Q 70 75 95 58 L 130 48 L 175 45 Q 215 48 238 70 L 252 95 L 248 118 Q 240 138 220 145 L 195 148 L 195 165 Q 195 182 178 188 L 155 190 Q 130 188 118 172 L 112 155 L 90 155 Z',
    label: 'Bahrain International Circuit'
  },
  // R5 - Saudi Arabia (Jeddah) - long fast street circuit
  'jeddah corniche circuit': {
    path: 'M 55 170 L 55 60 Q 57 42 72 38 L 95 36 L 95 80 L 115 80 L 115 36 L 200 36 Q 230 38 245 58 L 255 85 L 248 110 Q 238 128 218 132 L 195 133 L 195 155 Q 197 172 215 175 L 248 175 L 248 195 L 80 195 Q 60 192 55 170 Z',
    label: 'Jeddah Corniche Circuit'
  },
  // R6 - Miami - stadium circuit
  'miami international autodrome': {
    path: 'M 65 145 L 65 95 Q 68 68 90 55 L 130 48 L 200 48 Q 240 52 258 78 L 265 108 L 258 138 Q 245 162 215 170 L 175 175 L 140 172 Q 105 165 85 148 Z M 140 120 L 185 120 Q 205 120 205 105 L 205 88 Q 203 75 188 75 L 145 75',
    label: 'Miami International Autodrome'
  },
  // R7 - Imola - classic narrow circuit
  'autodromo enzo e dino ferrari': {
    path: 'M 75 155 L 72 115 Q 72 80 95 62 L 125 50 L 165 48 Q 200 50 220 72 L 235 98 L 228 125 Q 218 148 195 158 L 165 165 L 165 178 Q 163 192 148 195 L 125 195 Q 108 192 100 178 L 98 158 Z',
    label: 'Autodromo Enzo e Dino Ferrari'
  },
  // R8 - Monaco - iconic tight street circuit
  'circuit de monaco': {
    path: 'M 78 158 L 78 105 Q 80 65 115 45 L 175 32 Q 218 28 238 52 L 258 82 L 278 102 L 298 92 Q 318 82 325 102 L 315 142 L 278 160 L 258 180 Q 238 198 198 190 L 158 175 Q 118 165 78 158 Z',
    label: 'Circuit de Monaco'
  },
  // R9 - Spain (Barcelona) - technical circuit
  'circuit de barcelona-catalunya': {
    path: 'M 62 148 L 60 105 Q 62 72 88 55 L 128 44 L 185 42 Q 228 46 250 72 L 265 100 L 268 130 Q 265 158 242 172 L 205 180 L 165 182 Q 118 178 90 158 Z M 185 100 L 215 88 Q 238 82 245 100',
    label: 'Circuit de Barcelona-Catalunya'
  },
  // R10 - Canada (Gilles Villeneuve) - island circuit
  'circuit gilles villeneuve': {
    path: 'M 72 155 L 70 65 Q 72 48 88 44 L 108 42 L 108 95 L 128 95 L 128 42 L 235 42 Q 255 46 262 65 L 262 155 Q 258 175 238 180 L 105 180 Q 80 175 72 155 Z',
    label: 'Circuit Gilles Villeneuve'
  },
  // R11 - Austria (Red Bull Ring) - short punchy
  'red bull ring': {
    path: 'M 95 175 L 88 130 Q 85 100 100 78 L 125 55 L 165 45 Q 200 45 222 68 L 240 95 L 245 125 Q 242 152 222 165 L 195 172 L 155 178 Q 118 178 95 175 Z M 165 100 L 195 88 Q 215 82 222 100',
    label: 'Red Bull Ring'
  },
  // R12 - Britain (Silverstone) - high speed sweepers
  'silverstone circuit': {
    path: 'M 62 132 Q 58 100 82 80 L 122 60 Q 162 46 202 56 L 242 72 Q 272 84 282 112 L 285 150 Q 282 180 258 195 L 218 210 L 175 215 Q 132 212 105 195 L 78 172 Q 58 155 62 132 Z',
    label: 'Silverstone Circuit'
  },
  // R13 - Hungary (Hungaroring) - twisty slow
  'hungaroring': {
    path: 'M 78 152 L 75 112 Q 75 78 98 60 L 135 48 L 178 46 Q 215 50 235 75 L 248 105 L 245 135 Q 238 160 215 172 L 182 180 L 148 182 Q 108 178 88 158 Z M 148 105 L 178 95 Q 198 90 205 108 L 202 128 Q 195 142 178 145',
    label: 'Hungaroring'
  },
  // R14 - Belgium (Spa) - long legendary circuit
  'circuit de spa-francorchamps': {
    path: 'M 55 165 L 55 120 Q 58 90 80 72 L 115 55 L 165 48 L 215 52 Q 248 60 262 88 L 275 118 L 278 148 Q 272 175 248 185 L 205 192 L 155 192 L 105 185 Q 68 172 55 165 Z M 115 120 Q 135 100 165 105 L 195 115',
    label: 'Circuit de Spa-Francorchamps'
  },
  // R15 - Netherlands (Zandvoort) - banked corners
  'circuit zandvoort': {
    path: 'M 82 158 L 80 115 Q 80 80 105 62 L 145 50 L 188 50 Q 222 55 240 80 L 252 108 L 248 140 Q 238 165 212 175 L 175 182 L 138 180 Q 102 172 82 158 Z M 145 105 Q 165 88 188 95 L 205 112',
    label: 'Circuit Zandvoort'
  },
  // R16 - Italy (Monza) - temple of speed
  'autodromo nazionale monza': {
    path: 'M 58 122 L 205 122 Q 255 122 262 92 L 262 62 Q 260 42 238 42 L 78 42 Q 58 42 58 62 L 58 122 M 58 122 Q 58 152 80 162 L 242 162 Q 262 157 272 142 L 298 82 Q 308 62 298 52 L 278 46',
    label: 'Autodromo Nazionale Monza'
  },
  // R17 - Azerbaijan (Baku) - long straight + old city
  'baku city circuit': {
    path: 'M 58 172 L 58 42 Q 60 30 75 28 L 95 28 L 95 100 L 118 100 L 118 28 L 245 28 Q 265 32 270 52 L 270 95 Q 268 118 248 128 L 218 132 L 218 155 Q 220 172 238 175 L 270 175 L 270 195 L 78 195 Q 58 190 58 172 Z',
    label: 'Baku City Circuit'
  },
  // R18 - Singapore (Marina Bay) - night street circuit
  'marina bay street circuit': {
    path: 'M 65 158 L 65 75 Q 68 55 85 50 L 115 48 L 115 90 L 145 90 L 145 48 L 225 48 Q 252 52 262 75 L 265 108 L 258 138 Q 245 162 218 170 L 185 175 L 145 175 L 145 158 L 115 158 L 115 175 L 88 175 Q 68 170 65 158 Z',
    label: 'Marina Bay Street Circuit'
  },
  // R19 - USA (COTA) - dramatic uphill T1
  'circuit of the americas': {
    path: 'M 72 168 L 68 55 Q 70 38 88 35 L 108 35 L 108 80 Q 130 55 165 48 L 210 48 Q 248 55 265 85 L 272 118 L 265 148 Q 252 172 225 180 L 188 185 L 148 182 Q 108 172 88 155 Z',
    label: 'Circuit of the Americas'
  },
  // R20 - Mexico (Hermanos Rodriguez) - high altitude
  'autodromo hermanos rodriguez': {
    path: 'M 68 155 L 65 108 Q 65 72 90 55 L 130 44 L 178 42 Q 220 46 242 72 L 258 100 L 262 132 Q 258 160 235 172 L 198 180 L 158 182 Q 112 178 88 158 Z M 158 105 Q 185 92 210 100 L 225 118 Q 228 135 215 142 L 195 145',
    label: 'Autodromo Hermanos Rodriguez'
  },
  // R21 - Brazil (Interlagos) - anti-clockwise
  'autodromo jose carlos pace': {
    path: 'M 285 155 L 288 108 Q 285 72 260 55 L 220 44 L 172 42 Q 130 46 108 72 L 92 100 L 88 132 Q 92 160 115 172 L 152 180 L 192 182 Q 238 178 262 158 Z M 192 105 Q 165 92 140 100 L 125 118 Q 122 135 135 142 L 155 145',
    label: 'Autodromo Jose Carlos Pace'
  },
  // R22 - Las Vegas - strip circuit
  'las vegas strip circuit': {
    path: 'M 62 172 L 62 42 Q 65 28 82 26 L 102 26 L 102 95 L 125 95 L 125 26 L 238 26 Q 258 30 262 50 L 262 172 Q 258 190 238 194 L 85 194 Q 65 190 62 172 Z',
    label: 'Las Vegas Strip Circuit'
  },
  // R23 - Qatar (Lusail) - high speed flowing
  'lusail international circuit': {
    path: 'M 75 155 L 72 112 Q 72 75 98 58 L 140 46 L 185 44 Q 225 48 248 75 L 262 105 L 258 138 Q 248 165 222 175 L 182 182 L 142 180 Q 100 172 78 152 Z M 142 108 Q 168 92 195 100 L 212 120 Q 215 138 200 145',
    label: 'Lusail International Circuit'
  },
  // R24 - Abu Dhabi (Yas Marina) - twilight circuit
  'yas marina circuit': {
    path: 'M 68 152 L 65 108 Q 65 72 90 55 L 132 44 L 180 42 Q 222 46 245 72 L 260 100 L 265 132 Q 260 160 238 172 L 200 180 L 160 182 Q 115 178 90 158 Z M 160 108 L 195 95 Q 218 88 228 108 L 225 130 Q 218 145 200 148 L 178 148',
    label: 'Yas Marina Circuit'
  },
};

// Normalise lookup key
function findTrack(trackKey) {
  const key = (trackKey || '').toLowerCase().trim();
  if (TRACKS[key]) return TRACKS[key];
  const match = Object.entries(TRACKS).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : null;
}

export default function TrackSVG({ trackKey }) {
  const track = findTrack(trackKey);

  if (!track) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-xs h-40 bg-[#111] rounded-xl flex items-center justify-center">
          <p className="text-gray-600 text-xs">No track map available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 360 240" className="w-full max-w-xs" style={{ filter: 'drop-shadow(0 0 8px #e1060040)' }}>
        {/* Glow layer */}
        <path d={track.path} fill="none" stroke="#e10600" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
        {/* Main track */}
        <path d={track.path} fill="none" stroke="#e10600" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {/* White centre line */}
        <path d={track.path} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" strokeDasharray="6 8" />
        {/* Start/finish box */}
        <rect x="72" y="116" width="14" height="7" fill="#ffd700" opacity="0.9" rx="1" />
      </svg>
      <p className="text-xs text-gray-500">{track.label}</p>
    </div>
  );
}
