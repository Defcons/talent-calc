"use client";

import { TalentData } from "@/lib/types";

interface TalentTooltipProps {
  talent: TalentData;
  currentRank: number;
  x: number;
  y: number;
}

/**
 * Scale numeric values in a tooltip description line.
 *
 * The captured tooltip shows values for `capturedRank` (or rank 1 if capturedRank is 0).
 * To display rank N, we calculate: value_at_N = (captured_value / sourceRank) * targetRank
 */
function scaleDescription(line: string, sourceRank: number, targetRank: number): string {
  if (sourceRank === targetRank || sourceRank <= 0 || targetRank <= 0) return line;

  return line.replace(/(\d+(?:\.\d+)?)([\s]*%|[\s]+(?:Energy|energy|point|points|yard|yards))/g, (_match, num, suffix) => {
    const base = parseFloat(num);
    const scaled = (base / sourceRank) * targetRank;
    const formatted = num.includes('.') ? scaled.toFixed(1) : Math.round(scaled).toString();
    return formatted + suffix;
  });
}

function getDescLines(lines: string[]): string[] {
  return lines.slice(2).filter(line => !line.startsWith("Requires"));
}

function getRequiresLine(lines: string[]): string | null {
  const req = lines.slice(2).find(line => line.startsWith("Requires"));
  return req || null;
}

export default function TalentTooltip({
  talent,
  currentRank,
  x,
  y,
}: TalentTooltipProps) {
  const name = talent.name;
  const rankText = `Rank ${currentRank}/${talent.maxRank}`;
  const baseLines = talent.tooltipLines;
  const requires = getRequiresLine(baseLines);
  const descLines = getDescLines(baseLines);

  // The captured tooltip was taken at this rank
  // capturedRank 0 means talent was unlearned, tooltip shows rank 1 values
  const sourceRank = (talent.capturedRank ?? 0) > 0 ? talent.capturedRank! : 1;

  // Display rank: if user has 0 points, show rank 1 preview; otherwise show current
  const displayRank = currentRank > 0 ? currentRank : 1;
  const scaledDesc = descLines.map(line => scaleDescription(line, sourceRank, displayRank));

  // Next rank preview
  const nextRank = currentRank + 1;
  const nextDesc = nextRank <= talent.maxRank
    ? descLines.map(line => scaleDescription(line, sourceRank, nextRank))
    : null;

  return (
    <div
      className="fixed z-50 pointer-events-none max-w-xs"
      style={{
        left: `${x + 16}px`,
        top: `${y - 8}px`,
      }}
    >
      <div className="rounded-md p-3 shadow-xl" style={{
        background: "var(--tooltip-bg)",
        border: "1px solid var(--tooltip-border)",
      }}>
        <div className="text-accent font-bold text-sm mb-1">{name}</div>
        <div className="text-gray-400 text-xs mb-2">{rankText}</div>

        {requires && (
          <p className="text-gray-500 text-xs mb-1">{requires}</p>
        )}

        {scaledDesc.map((line, i) => (
          <p key={i} className="text-yellow-100 text-xs leading-relaxed">
            {line}
          </p>
        ))}

        {nextDesc && currentRank > 0 && currentRank < talent.maxRank && (
          <div className="mt-2 pt-2 border-t border-tree-border">
            <div className="text-gray-400 text-xs mb-1">Next rank:</div>
            {nextDesc.map((line, i) => (
              <p key={i} className="text-green-300 text-xs leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {currentRank < talent.maxRank && (
          <p className="text-green-400 text-xs mt-2">Click to learn</p>
        )}
        {currentRank > 0 && (
          <p className="text-gray-500 text-xs mt-1">Right-click to unlearn</p>
        )}
      </div>
    </div>
  );
}
