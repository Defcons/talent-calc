import { ClassTalentData, TalentState, TalentData } from "./types";

function sortTalents(a: TalentData, b: TalentData): number {
  if (a.tier !== b.tier) return a.tier - b.tier;
  return a.column - b.column;
}

function removeTrailing(str: string, char: string): string {
  let i = str.length - 1;
  while (i >= 0 && str[i] === char) i--;
  return str.substring(0, i + 1);
}

export function encodeBuild(
  classData: ClassTalentData,
  state: TalentState
): string {
  const parts: string[] = [];

  for (let treeIdx = 0; treeIdx < classData.trees.length; treeIdx++) {
    const tree = classData.trees[treeIdx];
    const sorted = [...tree.talents].sort(sortTalents);
    const treeState = state[treeIdx] || {};

    let treeStr = "";
    for (const talent of sorted) {
      const key = `${talent.tier}-${talent.column}`;
      const points = treeState[key] || 0;
      treeStr += points.toString();
    }
    parts.push(removeTrailing(treeStr, "0"));
  }

  return removeTrailing(parts.join("-"), "-");
}

export function decodeBuild(
  classData: ClassTalentData,
  buildStr: string
): TalentState {
  const state: TalentState = {};
  const parts = buildStr.split("-");

  for (let treeIdx = 0; treeIdx < classData.trees.length; treeIdx++) {
    const tree = classData.trees[treeIdx];
    const sorted = [...tree.talents].sort(sortTalents);
    const part = parts[treeIdx] || "";
    state[treeIdx] = {};

    for (let i = 0; i < part.length && i < sorted.length; i++) {
      const points = parseInt(part[i], 10);
      if (points > 0) {
        const talent = sorted[i];
        const key = `${talent.tier}-${talent.column}`;
        state[treeIdx][key] = Math.min(points, talent.maxRank);
      }
    }
  }

  return state;
}
