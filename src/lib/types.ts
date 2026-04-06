export interface TalentPrereq {
  tier: number;
  column: number;
}

export interface TalentData {
  index: number;
  name: string;
  icon: string;
  tier: number;    // row (0-indexed in data, 1-indexed from game)
  column: number;  // col (0-indexed in data, 1-indexed from game)
  maxRank: number;
  isExceptional: boolean;
  prereqs: TalentPrereq[];
  tooltipLines: string[];
  capturedRank?: number; // rank the tooltip was captured at (0 = unlearned, shows rank 1 values)
  rankDescriptions?: Record<number, string[]>; // per-rank tooltip lines keyed by rank (1-indexed)
}

export interface TalentTreeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  background: string;
  talents: TalentData[];
}

export interface ClassTalentData {
  class: string;
  trees: TalentTreeData[];
}

export interface TalentState {
  [treeIndex: number]: {
    [talentKey: string]: number; // "tier-column" -> points spent
  };
}

export const CLASS_LIST = [
  { slug: "warrior", name: "Warrior", icon: "class_warrior" },
  { slug: "paladin", name: "Paladin", icon: "class_paladin" },
  { slug: "hunter", name: "Hunter", icon: "class_hunter" },
  { slug: "rogue", name: "Rogue", icon: "class_rogue" },
  { slug: "priest", name: "Priest", icon: "class_priest" },
  { slug: "shaman", name: "Shaman", icon: "class_shaman" },
  { slug: "mage", name: "Mage", icon: "class_mage" },
  { slug: "warlock", name: "Warlock", icon: "class_warlock" },
  { slug: "druid", name: "Druid", icon: "class_druid" },
] as const;

export const MAX_POINTS = 61;
export const POINTS_PER_TIER = 5;
