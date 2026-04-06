import {
  TalentData,
  TalentTreeData,
  TalentState,
  MAX_POINTS,
  POINTS_PER_TIER,
} from "./types";

export function getTotalPoints(state: TalentState): number {
  let total = 0;
  for (const treeIdx in state) {
    for (const key in state[treeIdx]) {
      total += state[treeIdx][key];
    }
  }
  return total;
}

export function getTreePoints(state: TalentState, treeIdx: number): number {
  let total = 0;
  const treeState = state[treeIdx];
  if (!treeState) return 0;
  for (const key in treeState) {
    total += treeState[key];
  }
  return total;
}

export function getPointsInTiersBelow(
  state: TalentState,
  treeIdx: number,
  tier: number
): number {
  let total = 0;
  const treeState = state[treeIdx];
  if (!treeState) return 0;
  for (const key in treeState) {
    const [t] = key.split("-").map(Number);
    if (t < tier) total += treeState[key];
  }
  return total;
}

function findTalentByPosition(
  tree: TalentTreeData,
  tier: number,
  column: number
): TalentData | undefined {
  return tree.talents.find((t) => t.tier === tier && t.column === column);
}

export function canAddPoint(
  state: TalentState,
  treeIdx: number,
  talent: TalentData,
  tree: TalentTreeData
): boolean {
  const key = `${talent.tier}-${talent.column}`;
  const currentPoints = state[treeIdx]?.[key] || 0;

  // Already maxed
  if (currentPoints >= talent.maxRank) return false;

  // Total points cap
  if (getTotalPoints(state) >= MAX_POINTS) return false;

  // Tier requirement: need tier * POINTS_PER_TIER spent in lower tiers
  const pointsBelow = getPointsInTiersBelow(state, treeIdx, talent.tier);
  if (pointsBelow < talent.tier * POINTS_PER_TIER) return false;

  // Prerequisite check
  for (const prereq of talent.prereqs) {
    const prereqTalent = findTalentByPosition(tree, prereq.tier, prereq.column);
    if (!prereqTalent) return false;
    const prereqKey = `${prereq.tier}-${prereq.column}`;
    const prereqPoints = state[treeIdx]?.[prereqKey] || 0;
    if (prereqPoints < prereqTalent.maxRank) return false;
  }

  return true;
}

export function canRemovePoint(
  state: TalentState,
  treeIdx: number,
  talent: TalentData,
  tree: TalentTreeData
): boolean {
  const key = `${talent.tier}-${talent.column}`;
  const currentPoints = state[treeIdx]?.[key] || 0;
  if (currentPoints <= 0) return false;

  // Simulate removing the point
  const newState = structuredClone(state);
  newState[treeIdx][key] = currentPoints - 1;
  if (newState[treeIdx][key] === 0) delete newState[treeIdx][key];

  // Check if any talent in higher tiers would break
  for (const t of tree.talents) {
    const tKey = `${t.tier}-${t.column}`;
    const tPoints = newState[treeIdx]?.[tKey] || 0;
    if (tPoints <= 0) continue;

    // Check tier requirement still met
    const pointsBelow = getPointsInTiersBelow(newState, treeIdx, t.tier);
    if (pointsBelow < t.tier * POINTS_PER_TIER) return false;

    // Check prereq still met
    for (const prereq of t.prereqs) {
      const prereqTalent = findTalentByPosition(tree, prereq.tier, prereq.column);
      if (!prereqTalent) return false;
      const prereqKey = `${prereq.tier}-${prereq.column}`;
      const prereqPoints = newState[treeIdx]?.[prereqKey] || 0;
      if (prereqPoints < prereqTalent.maxRank) return false;
    }
  }

  return true;
}
