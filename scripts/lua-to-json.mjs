#!/usr/bin/env node
/**
 * Converts TalentExport SavedVariables Lua table to JSON files.
 *
 * Usage:
 *   node scripts/lua-to-json.mjs [path-to-TalentExport.lua]
 *
 * Default path:
 *   <wow-install>/WTF/Account/<ACCOUNT>/SavedVariables/TalentExport.lua
 *
 * Output: public/data/<class>.json for each exported class
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "..", "public", "data");

// Simple Lua table parser for SavedVariables format
function parseLuaTable(input) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < input.length && /\s/.test(input[pos])) pos++;
    // Skip Lua comments
    if (input[pos] === "-" && input[pos + 1] === "-") {
      while (pos < input.length && input[pos] !== "\n") pos++;
      skipWhitespace();
    }
  }

  function parseValue() {
    skipWhitespace();
    const ch = input[pos];

    if (ch === "{") return parseTable();
    if (ch === '"' || ch === "'") return parseString(ch);
    if (ch === "t" && input.substring(pos, pos + 4) === "true") {
      pos += 4;
      return true;
    }
    if (ch === "f" && input.substring(pos, pos + 5) === "false") {
      pos += 5;
      return false;
    }
    if (ch === "n" && input.substring(pos, pos + 3) === "nil") {
      pos += 3;
      return null;
    }
    // Number
    const numMatch = input.substring(pos).match(/^-?\d+(\.\d+)?/);
    if (numMatch) {
      pos += numMatch[0].length;
      return parseFloat(numMatch[0]);
    }
    throw new Error(`Unexpected char '${ch}' at pos ${pos}: ...${input.substring(pos, pos + 20)}...`);
  }

  function parseString(quote) {
    pos++; // skip opening quote
    let str = "";
    while (pos < input.length && input[pos] !== quote) {
      if (input[pos] === "\\") {
        pos++;
        if (input[pos] === "n") str += "\n";
        else if (input[pos] === "t") str += "\t";
        else if (input[pos] === "\\") str += "\\";
        else if (input[pos] === quote) str += quote;
        else str += input[pos];
      } else {
        str += input[pos];
      }
      pos++;
    }
    pos++; // skip closing quote
    return str;
  }

  function parseTable() {
    pos++; // skip {
    skipWhitespace();

    const result = {};
    let arrayIndex = 1;
    let isArray = true;

    while (pos < input.length && input[pos] !== "}") {
      skipWhitespace();
      if (input[pos] === "}") break;

      let key, value;

      // [key] = value
      if (input[pos] === "[") {
        pos++; // skip [
        skipWhitespace();
        if (input[pos] === '"' || input[pos] === "'") {
          key = parseString(input[pos]);
          isArray = false;
        } else {
          // numeric key
          const numMatch = input.substring(pos).match(/^-?\d+/);
          if (numMatch) {
            key = parseInt(numMatch[0]);
            pos += numMatch[0].length;
          }
        }
        skipWhitespace();
        pos++; // skip ]
        skipWhitespace();
        pos++; // skip =
        skipWhitespace();
        value = parseValue();
      }
      // key = value (string key without brackets)
      else if (/[a-zA-Z_]/.test(input[pos])) {
        const keyMatch = input.substring(pos).match(/^[a-zA-Z_]\w*/);
        if (keyMatch) {
          const potentialKey = keyMatch[0];
          const afterKey = pos + potentialKey.length;
          let tempPos = afterKey;
          while (tempPos < input.length && /\s/.test(input[tempPos])) tempPos++;

          if (input[tempPos] === "=") {
            key = potentialKey;
            isArray = false;
            pos = tempPos + 1; // skip =
            skipWhitespace();
            value = parseValue();
          } else {
            // It's an array value
            key = arrayIndex++;
            value = parseValue();
          }
        }
      } else {
        // Array value
        key = arrayIndex++;
        value = parseValue();
      }

      result[key] = value;

      skipWhitespace();
      if (input[pos] === ",") pos++;
      skipWhitespace();
    }

    pos++; // skip }

    // Convert to array if all keys are sequential integers
    if (isArray && Object.keys(result).length > 0) {
      const keys = Object.keys(result).map(Number).sort((a, b) => a - b);
      if (keys[0] === 1 && keys[keys.length - 1] === keys.length) {
        return keys.map((k) => result[k]);
      }
    }

    return result;
  }

  return parseValue();
}

function parseSavedVariables(luaContent) {
  // TalentExportData = { ... }
  const match = luaContent.match(/TalentExportData\s*=\s*/);
  if (!match) {
    throw new Error("Could not find TalentExportData in Lua file");
  }

  const startPos = match.index + match[0].length;
  const tableStr = luaContent.substring(startPos);

  let pos = 0;

  function skipWS() {
    while (pos < tableStr.length && /\s/.test(tableStr[pos])) pos++;
  }

  // Use the parser on the remaining string
  const parsed = parseLuaTable(tableStr);
  return parsed;
}

// Convert Lua table (parsed as object or array) to JS array
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  // Object with numeric keys from Lua table
  const keys = Object.keys(val).map(Number).filter(k => !isNaN(k)).sort((a, b) => a - b);
  return keys.map(k => val[k]);
}

function convertClassData(className, rawData) {
  // Map the Lua data structure to our JSON format
  const classData = {
    class: rawData.class || className,
    trees: [],
  };

  const trees = toArray(rawData.trees);
  for (const tree of trees) {
    // GetTalentTabInfo returns fields with swapped semantics on this client:
    //   id = tree name, name = icon path, icon = background, description = points spent
    const treeData = {
      id: 0,
      name: tree.id || "",                     // id field contains the tree name
      description: "",
      icon: normalizeIcon(tree.name || ""),     // name field contains the icon path
      background: tree.icon || "",              // icon field contains the background
      talents: [],
    };

    const talents = toArray(tree.talents);
    for (const talent of talents) {
      // Convert tier/column from 1-indexed (game) to 0-indexed (our app)
      const tier = (talent.tier || 1) - 1;
      const column = (talent.column || 1) - 1;

      // Parse the captured rank from tooltip line 2 ("Rank X/Y")
      const ttLines = toArray(talent.tooltipLines);
      const rankMatch = (ttLines[1] || "").match(/Rank (\d+)\/(\d+)/);
      const capturedRank = rankMatch ? parseInt(rankMatch[1]) : 0;

      treeData.talents.push({
        index: talent.index || 0,
        name: talent.name || "",
        icon: normalizeIcon(talent.icon || ""),
        tier,
        column,
        maxRank: talent.maxRank || 1,
        isExceptional: talent.isExceptional || false,
        prereqs: toArray(talent.prereqs)
          .filter((p) => p.tier && p.tier > 0 && p.column && p.column > 0)
          .map((p) => ({
            tier: (p.tier || 1) - 1,
            column: (p.column || 1) - 1,
          })),
        tooltipLines: ttLines,
        capturedRank,
        rankDescriptions: convertRankDescriptions(talent.rankDescriptions),
      });
    }

    classData.trees.push(treeData);
  }

  return classData;
}

function convertRankDescriptions(raw) {
  if (!raw) return {};
  const result = {};
  // raw is keyed by rank number (1-indexed from Lua)
  for (const key of Object.keys(raw)) {
    const rank = parseInt(key);
    if (!isNaN(rank)) {
      result[rank] = toArray(raw[key]);
    }
  }
  return result;
}

function normalizeIcon(icon) {
  // WoW icon textures come as paths like "Interface\\Icons\\ability_rogue_eviscerate"
  // We need just the filename in lowercase
  return icon
    .replace(/^Interface\\Icons\\/i, "")
    .replace(/^Interface\\ICONS\\/i, "")
    .replace(/\\/g, "")
    .toLowerCase();
}

// Find the SavedVariables file
function findSavedVarsFile() {
  // Set WOW_SAVEDVARS env var to your WTF/Account directory, or pass the .lua file path as an argument
  const basePath = process.env.WOW_SAVEDVARS || "";
  if (!basePath) return null;
  try {
    const accounts = readdirSync(basePath);
    for (const account of accounts) {
      const svPath = join(basePath, account, "SavedVariables", "TalentExport.lua");
      try {
        readFileSync(svPath);
        return svPath;
      } catch {}
    }
  } catch {}
  return null;
}

// Main
const inputPath = process.argv[2] || findSavedVarsFile();
if (!inputPath) {
  console.error("Usage: node scripts/lua-to-json.mjs <path-to-TalentExport.lua>");
  console.error("");
  console.error("Could not auto-detect SavedVariables file.");
  console.error("Run /talentexport in-game on each class first, then /reload.");
  process.exit(1);
}

console.log(`Reading: ${inputPath}`);
const luaContent = readFileSync(inputPath, "utf-8");
const data = parseSavedVariables(luaContent);

const classNames = Object.keys(data);
console.log(`Found ${classNames.length} class(es): ${classNames.join(", ")}`);

for (const className of classNames) {
  const converted = convertClassData(className, data[className]);
  const slug = className.toLowerCase();
  const outPath = join(outputDir, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(converted, null, 2));
  console.log(`  Written: ${outPath} (${converted.trees.length} trees, ${converted.trees.reduce((s, t) => s + t.talents.length, 0)} talents)`);
}

console.log("Done!");
