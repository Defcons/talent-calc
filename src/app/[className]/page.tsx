import { notFound } from "next/navigation";
import { CLASS_LIST, ClassTalentData } from "@/lib/types";
import Calculator from "@/components/Calculator";
import fs from "fs";
import path from "path";

async function getClassData(
  className: string
): Promise<ClassTalentData | null> {
  const filePath = path.join(process.cwd(), "public", "data", `${className}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ className: string }>;
}) {
  const { className } = await params;
  const classInfo = CLASS_LIST.find((c) => c.slug === className);
  return {
    title: classInfo
      ? `${classInfo.name} - Talent Calculator`
      : "Talent Calculator",
  };
}

export default async function ClassPage({
  params,
}: {
  params: Promise<{ className: string }>;
}) {
  const { className } = await params;

  const classInfo = CLASS_LIST.find((c) => c.slug === className);
  if (!classInfo) notFound();

  const classData = await getClassData(className);
  if (!classData) notFound();

  return <Calculator classData={classData} className={className} />;
}
