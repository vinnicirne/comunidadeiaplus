import React from 'react';

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Chip Central Octogonal (Exterior) */}
        <polygon 
          points="76,64 124,64 136,76 136,124 124,136 76,136 64,124 64,76" 
          className="text-primary" 
        />
        
        {/* Chip Central Octogonal (Interior) */}
        <polygon 
          points="82,72 118,72 128,82 128,118 118,128 82,128 72,118 72,82" 
          strokeWidth="1.8" 
          className="text-primary/70"
        />
        
        {/* Núcleo Central: Circuito Tecnológico */}
        <line x1="100" y1="88" x2="100" y2="112" strokeWidth="2.4" className="text-primary" />
        <line x1="88" y1="100" x2="112" y2="100" strokeWidth="2.4" className="text-primary" />
        <circle cx="100" cy="100" r="3.5" fill="currentColor" className="text-primary" stroke="none" />

        {/* Pinos Topo */}
        <line x1="84" y1="64" x2="84" y2="52" />
        <line x1="94" y1="64" x2="94" y2="40" />
        <line x1="106" y1="64" x2="106" y2="40" />
        <line x1="116" y1="64" x2="116" y2="52" />

        {/* Pinos Base */}
        <line x1="84" y1="136" x2="84" y2="148" />
        <line x1="94" y1="136" x2="94" y2="160" />
        <line x1="106" y1="136" x2="106" y2="160" />
        <line x1="116" y1="136" x2="116" y2="148" />

        {/* Pinos Esquerda */}
        <line x1="64" y1="84" x2="52" y2="84" />
        <line x1="64" y1="94" x2="40" y2="94" />
        <line x1="64" y1="106" x2="40" y2="106" />
        <line x1="64" y1="116" x2="52" y2="116" />

        {/* Pinos Direita */}
        <line x1="136" y1="84" x2="148" y2="84" />
        <line x1="136" y1="94" x2="160" y2="94" />
        <line x1="136" y1="106" x2="160" y2="106" />
        <line x1="136" y1="116" x2="148" y2="116" />

        {/* Trilhas Circuito: Topo */}
        <path d="M 84,52 L 72,40 L 72,26" />
        <circle cx="72" cy="24" r="5" strokeWidth="1.8" />
        <circle cx="72" cy="24" r="2" fill="currentColor" stroke="none" />

        <path d="M 100,64 L 100,24" />
        <circle cx="100" cy="20" r="6" strokeWidth="1.8" />
        <circle cx="100" cy="20" r="2" fill="currentColor" stroke="none" />

        <path d="M 116,52 L 128,40 L 128,26" />
        <circle cx="128" cy="24" r="5" strokeWidth="1.8" />
        <circle cx="128" cy="24" r="2" fill="currentColor" stroke="none" />

        {/* Trilhas Circuito: Base */}
        <path d="M 84,148 L 72,160 L 72,174" />
        <circle cx="72" cy="176" r="5" strokeWidth="1.8" />
        <circle cx="72" cy="176" r="2" fill="currentColor" stroke="none" />

        <path d="M 100,136 L 100,176" />
        <circle cx="100" cy="180" r="6" strokeWidth="1.8" />
        <circle cx="100" cy="180" r="2" fill="currentColor" stroke="none" />

        <path d="M 116,148 L 128,160 L 128,174" />
        <circle cx="128" cy="176" r="5" strokeWidth="1.8" />
        <circle cx="128" cy="176" r="2" fill="currentColor" stroke="none" />

        {/* Trilhas Circuito: Esquerda */}
        <path d="M 52,84 L 40,72 L 26,72" />
        <circle cx="24" cy="72" r="5" strokeWidth="1.8" />
        <circle cx="24" cy="72" r="2" fill="currentColor" stroke="none" />

        <path d="M 64,100 L 24,100" />
        <circle cx="20" cy="100" r="6" strokeWidth="1.8" />
        <circle cx="20" cy="100" r="2" fill="currentColor" stroke="none" />

        <path d="M 52,116 L 40,128 L 26,128" />
        <circle cx="24" cy="128" r="5" strokeWidth="1.8" />
        <circle cx="24" cy="128" r="2" fill="currentColor" stroke="none" />

        {/* Trilhas Circuito: Direita */}
        <path d="M 148,84 L 160,72 L 174,72" />
        <circle cx="176" cy="72" r="5" strokeWidth="1.8" />
        <circle cx="176" cy="72" r="2" fill="currentColor" stroke="none" />

        <path d="M 136,100 L 176,100" />
        <circle cx="180" cy="100" r="6" strokeWidth="1.8" />
        <circle cx="180" cy="100" r="2" fill="currentColor" stroke="none" />

        <path d="M 148,116 L 160,128 L 174,128" />
        <circle cx="176" cy="128" r="5" strokeWidth="1.8" />
        <circle cx="176" cy="128" r="2" fill="currentColor" stroke="none" />

        {/* Conexões Diagonais Secundárias */}
        <line x1="68" y1="68" x2="52" y2="52" />
        <circle cx="48" cy="48" r="6" strokeWidth="1.8" />
        <circle cx="48" cy="48" r="2.5" fill="currentColor" stroke="none" />
        
        <line x1="60" y1="56" x2="44" y2="40" />
        <circle cx="40" cy="36" r="3.5" />

        <line x1="132" y1="68" x2="148" y2="52" />
        <circle cx="152" cy="48" r="6" strokeWidth="1.8" />
        <circle cx="152" cy="48" r="2.5" fill="currentColor" stroke="none" />

        <line x1="140" y1="56" x2="156" y2="40" />
        <circle cx="160" cy="36" r="3.5" />

        <line x1="68" y1="132" x2="52" y2="148" />
        <circle cx="48" cy="152" r="6" strokeWidth="1.8" />
        <circle cx="48" cy="152" r="2.5" fill="currentColor" stroke="none" />

        <line x1="60" y1="144" x2="44" y2="160" />
        <circle cx="40" cy="164" r="3.5" />

        <line x1="132" y1="132" x2="148" y2="148" />
        <circle cx="152" cy="152" r="6" strokeWidth="1.8" />
        <circle cx="152" cy="152" r="2.5" fill="currentColor" stroke="none" />

        <line x1="140" y1="144" x2="156" y2="160" />
        <circle cx="160" cy="164" r="3.5" />

        {/* Pontos Radiais Satélites */}
        <circle cx="88" cy="34" r="3" strokeWidth="1.5" />
        <circle cx="112" cy="34" r="3" strokeWidth="1.5" />
        <circle cx="88" cy="166" r="3" strokeWidth="1.5" />
        <circle cx="112" cy="166" r="3" strokeWidth="1.5" />
        <circle cx="34" cy="88" r="3" strokeWidth="1.5" />
        <circle cx="34" cy="112" r="3" strokeWidth="1.5" />
        <circle cx="166" cy="88" r="3" strokeWidth="1.5" />
        <circle cx="166" cy="112" r="3" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
