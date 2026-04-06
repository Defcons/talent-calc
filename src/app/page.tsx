import Link from "next/link";
import { CLASS_LIST } from "@/lib/types";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "var(--accent)" }}>
        Choose a class
      </h1>

      <div className="grid grid-cols-3 gap-5 sm:grid-cols-5 md:grid-cols-9">
        {CLASS_LIST.map((cls) => (
          <Link
            key={cls.slug}
            href={`/${cls.slug}`}
            className="class-card flex flex-col items-center gap-2 p-4 rounded-md transition-all"
          >
            <img
              src={`https://wow.zamimg.com/images/wow/icons/large/${cls.icon}.jpg`}
              alt={cls.name}
              width={56}
              height={56}
              className="rounded transition-all"
              style={{ border: "2px solid var(--border-color)" }}
            />
            <span className="text-xs font-medium transition-colors" style={{ color: "var(--accent-dim)" }}>
              {cls.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
