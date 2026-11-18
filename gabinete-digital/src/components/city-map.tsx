"use client";

import { useRef, useState } from "react";
import { BAIRROS, CATEGORY_BY_ID, MUNICIPIO } from "@/lib/constants";
import type { CategoryId } from "@/lib/types";

export interface MapMarker { id: string; x: number; y: number; categoria: CategoryId; label: string }

const H = 80;

/** Mapa ilustrativo de Taubaté-SP (SVG próprio, sem API externa). Localizações fictícias. */
export function CityMap({
  markers = [], onSelect, onPick, pin, heat = false, showLabels = true, className = "",
}: {
  markers?: MapMarker[];
  onSelect?: (id: string) => void;
  onPick?: (p: { x: number; y: number; bairro: string }) => void;
  pin?: { x: number; y: number } | null;
  heat?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const Y = (y: number) => (y / 100) * H;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPick || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    let best = BAIRROS[0], d = Infinity;
    for (const b of BAIRROS) { const dd = (b.x - x) ** 2 + (b.y - y) ** 2; if (dd < d) { d = dd; best = b; } }
    onPick({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, bairro: best.nome });
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 100 ${H}`}
      role="img"
      aria-label={`Mapa ilustrativo de ${MUNICIPIO}-SP com marcadores fictícios`}
      className={`w-full select-none rounded-2xl bg-[#e9eef5] ${onPick ? "cursor-crosshair" : ""} ${className}`}
      onClick={handleClick}
    >
      {/* áreas verdes / relevo */}
      <rect width="100" height={H} fill="#eaf0f6" />
      <path d="M0 0 H30 Q24 14 10 18 Q2 20 0 28Z" fill="#dcebe0" />
      <path d="M100 0 V24 Q86 20 78 8 Q76 3 80 0Z" fill="#dcebe0" />
      <path d="M100 80 V62 Q88 58 78 66 Q70 74 74 80Z" fill="#dcebe0" />
      {/* rio */}
      <path d="M-2 56 C14 50 22 62 38 58 S60 48 76 56 S92 62 102 52" fill="none" stroke="#bcd7f2" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M-2 56 C14 50 22 62 38 58 S60 48 76 56 S92 62 102 52" fill="none" stroke="#d6e8fa" strokeWidth="1.4" strokeLinecap="round" />
      {/* vias */}
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M0 30 C25 28 55 34 100 22" strokeWidth="2.2" />
        <path d="M50 0 C48 24 52 44 50 80" strokeWidth="1.6" />
        <path d="M10 70 C30 56 60 52 96 62" strokeWidth="1.4" />
        <path d="M20 0 C28 24 34 44 24 80" strokeWidth="1" />
        <path d="M78 0 C74 26 82 48 80 80" strokeWidth="1" />
      </g>
      <text x="4" y="27.5" fontSize="2.2" fill="#94a3b8" fontStyle="italic">Via Dutra (ilustrativo)</text>
      <text x="60" y="47.4" fontSize="2.1" fill="#7aa3cf" fontStyle="italic">Rio Paraíba do Sul</text>

      {/* bairros */}
      {BAIRROS.map((b) => (
        <g key={b.nome}>
          <circle cx={b.x} cy={Y(b.y)} r="9" fill="#14283F" opacity=".035" />
          {showLabels && <text x={b.x} y={Y(b.y) - 9.6} fontSize="2.2" textAnchor="middle" fill="#64748b" fontWeight="600">{b.nome}</text>}
        </g>
      ))}

      {heat && markers.map((m) => <circle key={"h" + m.id} cx={m.x} cy={Y(m.y)} r="6" fill="#ef4444" opacity=".13" />)}

      {markers.map((m) => {
        const c = CATEGORY_BY_ID[m.categoria].color;
        const on = hover === m.id;
        return (
          <g
            key={m.id}
            tabIndex={onSelect ? 0 : -1}
            role={onSelect ? "button" : undefined}
            aria-label={m.label}
            onClick={(e) => { if (onSelect) { e.stopPropagation(); onSelect(m.id); } }}
            onKeyDown={(e) => { if (onSelect && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelect(m.id); } }}
            onMouseEnter={() => setHover(m.id)}
            onMouseLeave={() => setHover(null)}
            className={onSelect ? "cursor-pointer" : ""}
          >
            <circle cx={m.x} cy={Y(m.y)} r={on ? 2.6 : 1.8} fill={c} stroke="#fff" strokeWidth=".6" style={{ transition: "r .15s" }} />
          </g>
        );
      })}

      {pin && (
        <g transform={`translate(${pin.x} ${Y(pin.y)})`} className="animate-pop">
          <circle r="4.4" fill="#2563EB" opacity=".18" />
          <path d="M0 0 C-3.4 -4 -3.2 -8.6 0 -8.6 S3.4 -4 0 0Z" fill="#2563EB" stroke="#fff" strokeWidth=".5" transform="translate(0 0)" />
          <circle cy="-6.2" r="1.2" fill="#fff" />
        </g>
      )}
      <text x="99" y="78.6" fontSize="1.9" textAnchor="end" fill="#94a3b8">Mapa ilustrativo · localizações simuladas</text>
    </svg>
  );
}
