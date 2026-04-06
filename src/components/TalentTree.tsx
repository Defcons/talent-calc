"use client";

import { TalentTreeData, TalentState } from "@/lib/types";
import { getBackgroundUrl } from "@/lib/backgrounds";
import Talent from "./Talent";
import Arrow, { ArrowDefs } from "./Arrow";

import { COL_STEP, ROW_STEP, PAD_LEFT, PAD_TOP } from "@/lib/grid";

interface TalentTreeProps {
  tree: TalentTreeData;
  treeIdx: number;
  state: TalentState;
  treePoints: number;
  onAddPoint: (treeIdx: number, tier: number, column: number) => void;
  onRemovePoint: (treeIdx: number, tier: number, column: number) => void;
  onReset: (treeIdx: number) => void;
}

export default function TalentTree({
  tree,
  treeIdx,
  state,
  treePoints,
  onAddPoint,
  onRemovePoint,
  onReset,
}: TalentTreeProps) {
  const maxTier = Math.max(...tree.talents.map((t) => t.tier));
  const maxCol = Math.max(...tree.talents.map((t) => t.column));
  const width = PAD_LEFT + (maxCol + 1) * COL_STEP + 14;
  const height = PAD_TOP + (maxTier + 1) * ROW_STEP + 14;

  const bgUrl = getBackgroundUrl(tree.background);

  // Collect arrows for prerequisites
  const arrows: { from: { tier: number; column: number }; to: typeof tree.talents[0]; active: boolean }[] = [];
  for (const talent of tree.talents) {
    for (const prereq of talent.prereqs) {
      const prereqKey = `${prereq.tier}-${prereq.column}`;
      const prereqPoints = state[treeIdx]?.[prereqKey] || 0;
      const prereqTalent = tree.talents.find(
        (t) => t.tier === prereq.tier && t.column === prereq.column
      );
      const active = prereqTalent ? prereqPoints >= prereqTalent.maxRank : false;
      arrows.push({ from: prereq, to: talent, active });
    }
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{
      border: "1px solid rgba(212, 175, 55, 0.3)",
      borderRadius: 6,
      background: "var(--card-bg)",
    }}>
      {/* Tree header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--border-color)",
      }}>
        <div className="flex items-center gap-2">
          <img
            src={`https://wow.zamimg.com/images/wow/icons/small/${tree.icon}.jpg`}
            alt={tree.name}
            width={20}
            height={20}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-200">
            {tree.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-accent font-bold">{treePoints}</span>
          {treePoints > 0 && (
            <button
              onClick={() => onReset(treeIdx)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
              title="Reset tree"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Talent grid with background */}
      <div
        className="relative"
        style={{
          width,
          height,
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{ background: "rgba(0, 0, 0, 0.35)" }} />

        {/* Arrow SVG overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={height}
          style={{ zIndex: 1 }}
        >
          <ArrowDefs />
          {arrows.map((a, i) => (
            <Arrow key={i} from={a.from} to={a.to} active={a.active} />
          ))}
        </svg>

        {/* Talents */}
        {tree.talents.map((talent) => {
          const key = `${talent.tier}-${talent.column}`;
          const currentRank = state[treeIdx]?.[key] || 0;

          return (
            <Talent
              key={talent.index}
              talent={talent}
              tree={tree}
              treeIdx={treeIdx}
              state={state}
              currentRank={currentRank}
              onAddPoint={() => onAddPoint(treeIdx, talent.tier, talent.column)}
              onRemovePoint={() =>
                onRemovePoint(treeIdx, talent.tier, talent.column)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
