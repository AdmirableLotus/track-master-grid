const TIRE_CONFIG = {
  soft: { color: '#e10600', label: 'Soft', life: 15, icon: '🔴' },
  medium: { color: '#ffd700', label: 'Medium', life: 25, icon: '🟡' },
  hard: { color: '#e0e0e0', label: 'Hard', life: 35, icon: '⚪' },
};

export default function TireSelector({ value, onChange, compounds = ['soft', 'medium', 'hard'] }) {
  return (
    <div className="flex gap-3">
      {compounds.map(c => {
        const cfg = TIRE_CONFIG[c];
        const selected = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`flex-1 rounded-xl p-3 border-2 transition-all flex flex-col items-center gap-1 ${
              selected ? 'border-opacity-100 bg-opacity-20' : 'border-[#333] bg-[#1a1a1a] hover:border-opacity-60'
            }`}
            style={{
              borderColor: selected ? cfg.color : undefined,
              backgroundColor: selected ? `${cfg.color}20` : undefined,
            }}
          >
            <span className="text-2xl">{cfg.icon}</span>
            <span className="font-black text-white text-sm">{cfg.label}</span>
            <span className="text-xs" style={{ color: cfg.color }}>~{cfg.life} laps</span>
          </button>
        );
      })}
    </div>
  );
}