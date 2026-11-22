import { describe, expect, it } from "vitest";
import { validateExtraction } from "@/lib/job-ai.server";
import { buildSeedRows } from "@/lib/seed-data";

describe("AI job analysis rules", () => {
  it("falls back to the Other category for unknown categories", () => {
    expect(validateExtraction({ category: "Gardening" }).category).toBe("Other");
  });

  it("defaults urgency to medium when the AI returns something unexpected", () => {
    expect(validateExtraction({ urgency: "asap" }).urgency).toBe("medium");
  });

  it("keeps at most 5 lowercase skill tags", () => {
    const info = validateExtraction({ required_skills: ["A", "B", "C", "D", "E", "F"] });
    expect(info.required_skills).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("caps estimated hours at 500", () => {
    expect(validateExtraction({ estimated_hours: 9000 }).estimated_hours).toBe(500);
  });
});

describe("Sample data seeding", () => {
  it("creates 40 workers and 100 open jobs", () => {
    const { workerRows, jobRows } = buildSeedRows(Date.UTC(2026, 0, 1));
    expect(workerRows).toHaveLength(40);
    expect(jobRows).toHaveLength(100);
    expect(workerRows.every((w) => w.role === "worker")).toBe(true);
    expect(jobRows.every((j) => j.status === "open")).toBe(true);
  });
});
