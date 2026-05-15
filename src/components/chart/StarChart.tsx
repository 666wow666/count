import { Palace, GONGWEI_NAMES } from '@/types';

interface StarChartProps {
  palaces: Palace[];
  mingGongIndex: number;
  shenGongIndex: number;
}

export default function StarChart({ palaces, mingGongIndex, shenGongIndex }: StarChartProps) {
  const centerX = 160;
  const centerY = 160;
  const radius = 120;
  const innerRadius = 60;
  
  const getPosition = (index: number, r: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };
  
  const renderPalaceContent = (palace: Palace, index: number) => {
    const pos = getPosition(index, radius);
    const isMingGong = index === mingGongIndex;
    const isShenGong = index === shenGongIndex;
    
    const allStars = [
      ...palace.mainStars,
      ...palace.assistantStars,
      ...palace.maleficStars
    ];
    
    return (
      <g key={index}>
        <text
          x={pos.x}
          y={pos.y - 35}
          textAnchor="middle"
          className={`text-[10px] font-medium ${isMingGong ? 'fill-amber-400' : 'fill-purple-300'}`}
          style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
        >
          {palace.name}
          {isMingGong && ' ★'}
          {isShenGong && ' ◆'}
        </text>
        
        {allStars.length > 0 ? (
          <text
            x={pos.x}
            y={pos.y - 15}
            textAnchor="middle"
            className="text-[9px] fill-pink-300"
            style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
          >
            {allStars.slice(0, 3).join('·')}
          </text>
        ) : null}
        
        {allStars.length > 3 && (
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            className="text-[8px] fill-pink-400/70"
            style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
          >
            {allStars.slice(3, 5).join('·')}
          </text>
        )}
      </g>
    );
  };
  
  return (
    <div className="w-full max-w-[360px] mx-auto">
      <svg viewBox="0 0 320 320" className="w-full">
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 15}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeOpacity="0.5"
          filter="url(#glow)"
        />
        
        {[...Array(12)].map((_, i) => {
          const outer = getPosition(i, radius);
          const inner = getPosition(i, innerRadius);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#6b21a8"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          );
        })}
        
        {[...Array(12)].map((_, i) => {
          const pos = getPosition(i, radius);
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r="25"
              fill={i === mingGongIndex ? 'rgba(251, 191, 36, 0.15)' : 'rgba(88, 28, 135, 0.15)'}
              stroke={i === mingGongIndex ? '#fbbf24' : '#7c3aed'}
              strokeWidth={i === mingGongIndex ? '2' : '1'}
              strokeOpacity="0.6"
            />
          );
        })}
        
        {[...Array(12)].map((_, i) => {
          const pos = getPosition(i, innerRadius);
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r="28"
              fill="none"
              stroke="#6b21a8"
              strokeWidth="1"
              strokeOpacity="0.3"
              strokeDasharray="3,3"
            />
          );
        })}
        
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill="url(#centerGradient)"
          stroke="#8b5cf6"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-[14px] font-bold fill-white"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          紫微
        </text>
        <text
          x={centerX}
          y={centerY + 12}
          textAnchor="middle"
          className="text-[10px] fill-purple-400"
          style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
        >
          星盘
        </text>
        
        {palaces.map((palace, index) => renderPalaceContent(palace, index))}
        
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const labelRadius = radius + 30;
          const labelX = centerX + labelRadius * Math.cos(angle);
          const labelY = centerY + labelRadius * Math.sin(angle);
          
          return (
            <text
              key={i}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-purple-400/60"
              style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
            >
              {GONGWEI_NAMES[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
