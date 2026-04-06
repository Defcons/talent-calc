"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ClassTalentData,
  TalentState,
  MAX_POINTS,
  CLASS_LIST,
} from "@/lib/types";
import { getTotalPoints, getTreePoints } from "@/lib/validation";
import { encodeBuild, decodeBuild } from "@/lib/encoding";
import TalentTree from "./TalentTree";

interface CalculatorProps {
  classData: ClassTalentData;
  className: string;
  initialBuild?: string;
}

export default function Calculator({
  classData,
  className,
  initialBuild,
}: CalculatorProps) {
  const [state, setState] = useState<TalentState>(() => {
    if (initialBuild) {
      return decodeBuild(classData, initialBuild);
    }
    return {};
  });

  const [copied, setCopied] = useState(false);
  const totalPoints = useMemo(() => getTotalPoints(state), [state]);
  const remainingPoints = MAX_POINTS - totalPoints;

  // Update URL when state changes
  useEffect(() => {
    const encoded = encodeBuild(classData, state);
    if (encoded) {
      window.history.replaceState(null, "", `/${className}/${encoded}`);
    } else {
      window.history.replaceState(null, "", `/${className}`);
    }
  }, [state, classData, className]);

  const handleAddPoint = useCallback(
    (treeIdx: number, tier: number, column: number) => {
      setState((prev) => {
        const key = `${tier}-${column}`;
        const newState = structuredClone(prev);
        if (!newState[treeIdx]) newState[treeIdx] = {};
        const current = newState[treeIdx][key] || 0;
        newState[treeIdx][key] = current + 1;
        return newState;
      });
    },
    []
  );

  const handleRemovePoint = useCallback(
    (treeIdx: number, tier: number, column: number) => {
      setState((prev) => {
        const key = `${tier}-${column}`;
        const newState = structuredClone(prev);
        if (!newState[treeIdx]) return prev;
        const current = newState[treeIdx][key] || 0;
        if (current <= 1) {
          delete newState[treeIdx][key];
        } else {
          newState[treeIdx][key] = current - 1;
        }
        return newState;
      });
    },
    []
  );

  const handleResetTree = useCallback((treeIdx: number) => {
    setState((prev) => {
      const newState = structuredClone(prev);
      delete newState[treeIdx];
      return newState;
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setState({});
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const classInfo = CLASS_LIST.find((c) => c.slug === className);

  return (
    <div className="flex flex-col items-center flex-1 px-6 py-5">
      {/* Class header + controls bar */}
      <div
        className="flex items-center justify-between w-full max-w-6xl mb-5 px-5 py-3 rounded-md"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "var(--accent-dim)" }}
          >
            &larr; Classes
          </Link>
          {classInfo && (
            <div className="flex items-center gap-3">
              <img
                src={`https://wow.zamimg.com/images/wow/icons/large/${classInfo.icon}.jpg`}
                alt={classInfo.name}
                width={36}
                height={36}
                className="rounded"
                style={{ border: "1px solid var(--border-color)" }}
              />
              <h1 className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
                {classInfo.name}
              </h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 text-sm">
          <span style={{ color: "var(--foreground)" }}>
            Points:{" "}
            <span className="font-bold" style={{ color: "var(--accent)" }}>
              {totalPoints}
            </span>{" "}
            / {MAX_POINTS}
          </span>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <span style={{ color: "var(--foreground)" }}>
            Remaining:{" "}
            <span
              className="font-bold"
              style={{ color: remainingPoints > 0 ? "#1e9e5e" : "#c44" }}
            >
              {remainingPoints}
            </span>
          </span>
          {totalPoints > 0 && (
            <>
              <span style={{ color: "var(--border-color)" }}>|</span>
              <button
                onClick={handleResetAll}
                className="transition-colors"
                style={{ color: "#c44" }}
              >
                Reset All
              </button>
            </>
          )}
          <span style={{ color: "var(--border-color)" }}>|</span>
          <button
            onClick={handleCopyLink}
            className="transition-colors"
            style={{ color: "var(--accent-dim)" }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Talent trees */}
      <div className="flex gap-3 flex-wrap justify-center">
        {classData.trees.map((tree, idx) => (
          <TalentTree
            key={tree.id}
            tree={tree}
            treeIdx={idx}
            state={state}
            treePoints={getTreePoints(state, idx)}
            onAddPoint={handleAddPoint}
            onRemovePoint={handleRemovePoint}
            onReset={handleResetTree}
          />
        ))}
      </div>
    </div>
  );
}
