"use client";

import { useState, useCallback } from "react";
import { TalentData, TalentTreeData, TalentState } from "@/lib/types";
import { canAddPoint, canRemovePoint } from "@/lib/validation";
import TalentTooltip from "./TalentTooltip";

import { ICON_SIZE, COL_STEP, ROW_STEP, PAD_LEFT, PAD_TOP } from "@/lib/grid";

interface TalentProps {
  talent: TalentData;
  tree: TalentTreeData;
  treeIdx: number;
  state: TalentState;
  currentRank: number;
  onAddPoint: () => void;
  onRemovePoint: () => void;
}

export default function Talent({
  talent,
  tree,
  treeIdx,
  state,
  currentRank,
  onAddPoint,
  onRemovePoint,
}: TalentProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(
    null
  );

  const canAdd = canAddPoint(state, treeIdx, talent, tree);
  const canRemove = canRemovePoint(state, treeIdx, talent, tree);
  const isMaxed = currentRank >= talent.maxRank;
  const hasPoints = currentRank > 0;
  const dimmed = !canAdd && !hasPoints;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (canAdd) onAddPoint();
    },
    [canAdd, onAddPoint]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (canRemove) onRemovePoint();
    },
    [canRemove, onRemovePoint]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // WoW-style border/glow
  let borderFrame = "/images/borders/default.png";
  let glowStyle = "none";

  if (isMaxed) {
    borderFrame = "/images/borders/gold.png";
    glowStyle = "inset 0 0 6px 2px rgba(245, 197, 24, 0.7)";
  } else if (hasPoints) {
    glowStyle = "inset 0 0 6px 2px rgba(30, 255, 30, 0.6)";
  } else if (canAdd) {
    glowStyle = "inset 0 0 5px 2px rgba(30, 255, 30, 0.4)";
  }

  return (
    <>
      <div
        className="talent-icon absolute cursor-pointer transition-transform hover:scale-110"
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          left: PAD_LEFT + talent.column * COL_STEP,
          top: PAD_TOP + talent.tier * ROW_STEP,
          zIndex: 2,
        }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Icon image — inset inside the border frame */}
        <img
          src={`https://wow.zamimg.com/images/wow/icons/large/${talent.icon}.jpg`}
          alt={talent.name}
          className={`absolute rounded-[3px] ${dimmed ? "opacity-40 grayscale" : ""}`}
          style={{
            width: ICON_SIZE - 8,
            height: ICON_SIZE - 8,
            top: 4,
            left: 4,
          }}
          draggable={false}
        />

        {/* WoW-style border frame overlay (source is 68x68, render at container size) */}
        <img
          src={borderFrame}
          alt=""
          className="absolute pointer-events-none"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            top: 0,
            left: 0,
          }}
          draggable={false}
        />

        {/* Inner glow overlay */}
        {!dimmed && (
          <div
            className="absolute rounded-[4px]"
            style={{
              inset: 0,
              boxShadow: glowStyle,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Rank counter */}
        {hasPoints && (
          <span
            className="absolute font-bold text-center"
            style={{
              bottom: -6,
              right: -6,
              minWidth: 16,
              fontSize: 11,
              padding: "1px 3px",
              borderRadius: 4,
              background: "#111",
              color: isMaxed ? "#f5c518" : hasPoints ? "#3f3" : "#999",
              zIndex: 3,
            }}
          >
            {currentRank}
          </span>
        )}
      </div>

      {tooltip && (
        <TalentTooltip
          talent={talent}
          currentRank={currentRank}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </>
  );
}
