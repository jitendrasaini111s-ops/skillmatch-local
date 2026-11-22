import { describe, expect, it } from "vitest";
import {
  MATCH_WEIGHTS,
  cityBonus,
  finalMatch,
  keywordRanking,
  priceFit,
  ratingScore,
  skillOverlap,
} from "@/lib/match-scoring";

describe("AI match percentage rules", () => {
  it("weights AI 50%, skills 20%, city 15%, price 10%, rating 5%", () => {
    expect(MATCH_WEIGHTS).toEqual({ ai: 0.5, skills: 0.2, city: 0.15, price: 0.1, rating: 0.05 });
    // 0.5*80 + 0.2*50 + 0.15*100 + 0.1*100 + 0.05*60 = 40 + 10 + 15 + 10 + 3 = 78
    expect(finalMatch({ ai: 80, skills: 50, city: 100, price: 100, rating: 60 })).toBe(78);
  });

  it("skill overlap is Jaccard similarity scaled to 100", () => {
    // shared {math} / union {math, tutoring, algebra} = 1/3
    expect(skillOverlap(["Math", "tutoring"], ["math", "algebra"])).toBeCloseTo(33.33, 1);
    expect(skillOverlap(["math"], ["MATH"])).toBe(100);
  });

  it("same-city bonus is 100 for the same city and 0 otherwise", () => {
    expect(cityBonus("Austin", " austin ")).toBe(100);
    expect(cityBonus("Austin", "Denver")).toBe(0);
  });

  it("price fit is 100 within budget and drops as the cost goes over", () => {
    expect(priceFit(20, 100, 4)).toBe(100); // $80 <= $100
    expect(priceFit(30, 100, 4)).toBe(80); // $120 is 20% over
    expect(priceFit(50, 100, 4)).toBe(0); // double the budget or more
  });

  it("rating is scaled from 5 stars to 100", () => {
    expect(ratingScore(4.5)).toBe(90);
    expect(ratingScore(null)).toBe(0);
  });
});

describe("keyword-only comparison ranking", () => {
  it("ranks workers by keyword overlap with the job description", () => {
    const ranked = keywordRanking("Assemble an IKEA wardrobe and mount a TV", [
      { id: "a", full_name: "A", skills: ["painting"], bio: "I paint walls" },
      { id: "b", full_name: "B", skills: ["ikea assembly"], bio: "I mount TVs and assemble wardrobes" },
    ]);
    expect(ranked.map((r) => r.worker_id)).toEqual(["b"]);
    expect(ranked[0]?.matched).toEqual(expect.arrayContaining(["ikea", "wardrobe", "mount"]));
  });
});
