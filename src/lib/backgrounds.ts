// Maps the background field from talent data to the spec image file
// Background names come from the game: "RogueCombat", "HunterBeastMastery", etc.
// Image files use spec IDs from the original wow-talent-calculator

const BACKGROUND_MAP: Record<string, string> = {
  // Warrior
  WarriorArms: "161",
  WarriorFury: "164",
  WarriorProtection: "163",
  // Paladin
  PaladinHoly: "382",
  PaladinProtection: "383",
  PaladinCombat: "381",
  // Hunter
  HunterBeastMastery: "361",
  HunterMarksmanship: "363",
  HunterSurvival: "362",
  // Rogue
  RogueAssassination: "182",
  RogueCombat: "181",
  RogueSubtlety: "183",
  // Priest
  PriestDiscipline: "201",
  PriestHoly: "202",
  PriestShadow: "203",
  // Shaman
  ShamanElementalCombat: "261",
  ShamanEnhancement: "263",
  ShamanRestoration: "262",
  // Mage
  MageArcane: "81",
  MageFire: "41",
  MageFrost: "61",
  // Warlock
  WarlockCurses: "302",
  WarlockSummoning: "303",
  WarlockDestruction: "301",
  // Druid
  DruidFeralCombat: "281",
  DruidBalance: "283",
  DruidRestoration: "282",
};

export function getBackgroundUrl(background: string): string | null {
  const id = BACKGROUND_MAP[background];
  if (id) return `/images/backgrounds/${id}.jpg`;
  return null;
}
