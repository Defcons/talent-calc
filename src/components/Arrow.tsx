"use client";

import { TalentData } from "@/lib/types";

interface ArrowProps {
  from: { tier: number; column: number };
  to: TalentData;
  active: boolean;
}

import { ICON_SIZE, COL_STEP, ROW_STEP, PAD_LEFT, PAD_TOP } from "@/lib/grid";

function getEdge(tier: number, column: number, side: "top" | "bottom" | "left" | "right") {
  const x = PAD_LEFT + column * COL_STEP + ICON_SIZE / 2;
  const y = PAD_TOP + tier * ROW_STEP + ICON_SIZE / 2;

  switch (side) {
    case "top":    return { x, y: y - ICON_SIZE / 2 };
    case "bottom": return { x, y: y + ICON_SIZE / 2 };
    case "left":   return { x: x - ICON_SIZE / 2, y };
    case "right":  return { x: x + ICON_SIZE / 2, y };
  }
}

export default function Arrow({ from, to, active }: ArrowProps) {
  const color = active ? "#f5c518" : "#444466";

  let path: string;

  if (from.column === to.column) {
    // Same column: straight down from bottom to top
    const start = getEdge(from.tier, from.column, "bottom");
    const end = getEdge(to.tier, to.column, "top");
    path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else {
    // Different column: exit right (or left) side, go horizontal, then down to top of target
    const goRight = to.column > from.column;
    const start = getEdge(from.tier, from.column, goRight ? "right" : "left");
    const end = getEdge(to.tier, to.column, "top");

    // Go horizontal to align with target column, then straight down
    path = `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
  }

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
      markerEnd={`url(#arrow-${active ? "active" : "inactive"})`}
    />
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker
        id="arrow-active"
        markerWidth="6"
        markerHeight="5"
        refX="5"
        refY="2.5"
        orient="auto"
      >
        <polygon points="0 0, 6 2.5, 0 5" fill="#f5c518" />
      </marker>
      <marker
        id="arrow-inactive"
        markerWidth="6"
        markerHeight="5"
        refX="5"
        refY="2.5"
        orient="auto"
      >
        <polygon points="0 0, 6 2.5, 0 5" fill="#444466" />
      </marker>
    </defs>
  );
}
