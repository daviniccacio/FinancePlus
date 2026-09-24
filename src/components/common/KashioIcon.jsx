// src/components/common/KashioIcon.jsx
import React from 'react';

/**
 * Componente Vetorial (SVG) da Logo Kashio.
 * Possui máscara de espaço negativo invertido na alça e no ponto do fecho,
 * e espaçamento corrigido entre gráfico e seta.
 * 
 * @param {Object} props - Propriedades de personalização
 * @param {number|string} [props.size=120] - Dimensão do ícone em píxeis
 * @param {string} [props.walletColor='#f7dcf2'] - Cor do corpo da carteira e alça
 * @param {string} [props.accentColor='#FFFFFF'] - Cor do gráfico e da seta
 * @param {string} [props.className=''] - Classes Tailwind adicionais
 */
export default function KashioIcon({ 
  size = 120, 
  walletColor = '#1b3022', 
  accentColor = '#2f4e39', 
  className = '' 
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform hover:scale-105 inline-block ${className}`}
    >
      {/* 🌟 1. MÁSCARA DE ESPAÇO NEGATIVO INVERTIDO */}
      <defs>
        <mask id="kashio-inverted-mask">
          {/* Fundo Branco = Mantém visível todo o corpo da carteira e alça */}
          <rect x="0" y="0" width="200" height="200" fill="#FFFFFF" />

          {/* Formas Pretas = Perfuram a imagem (criam o fundo falso) */}
          {/* A. Borda/Contorno da alça que perfura o formato */}
          <rect
            x="128"
            y="122"
            width="36"
            height="22"
            rx="11"
            fill="none"
            stroke="#000000"
            strokeWidth="3.5"
          />
          {/* B. Bolinha/Botão interior que perfura o centro */}
          <circle cx="141" cy="133" r="3.5" fill="#000000" />
        </mask>
      </defs>

      {/* 🌟 2. LINHA DE TENDÊNCIA E SETA (COM ESPAÇAMENTO AUMENTADO NO TOPO) */}
      <path
        d="M 60 62 L 90 38 L 108 50 L 144 18"
        stroke={accentColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 126 18 H 144 V 36"
        stroke={accentColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 🌟 3. BARRAS DO GRÁFICO (CENTRALIZADAS E SEPARADAS DA SETA) */}
      <rect x="71" y="78" width="16" height="24" rx="4" fill={accentColor} />
      <rect x="92" y="66" width="16" height="36" rx="4" fill={accentColor} />
      <rect x="113" y="52" width="16" height="50" rx="4" fill={accentColor} />

      {/* 🌟 4. CARTEIRA E ALÇA UNIFICADAS COM MÁSCARA APLICADA */}
      <g mask="url(#kashio-inverted-mask)">
        {/* Corpo da Carteira */}
        <path
          d="M 45 102 C 45 93 53 85 63 85 H 64 C 64 93 70 98 78 98 H 122 C 130 98 136 93 136 85 H 137 C 147 85 155 93 155 102 V 158 C 155 168 147 176 137 176 H 63 C 53 176 45 168 45 158 Z"
          fill={walletColor}
        />
        {/* Alça Encaixada (sem estar afastada) */}
        <rect
          x="122"
          y="118"
          width="46"
          height="30"
          rx="15"
          fill={walletColor}
        />
      </g>
    </svg>
  );
}