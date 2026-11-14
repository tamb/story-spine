import { describe, expect, it } from "vite-plus/test";
import { FULL_BEATS, SHORTENED_BEATS } from "./spine.ts";

describe("Story Spine beats", () => {
  it("lists the shortened spine in Kenn Adams' order", () => {
    expect(SHORTENED_BEATS.map((beat) => beat.prompt)).toEqual([
      "Once upon a time…",
      "Every day…",
      "But, one day…",
      "Because of that…",
      "Because of that…",
      "Because of that…",
      "Until, finally…",
      "And, ever since then…",
      "And the moral of the story is…",
    ]);
    expect(SHORTENED_BEATS[2]?.hint).toBe('Sometimes phrased as "Until one day…"');
    expect(SHORTENED_BEATS[5]?.hint).toBe("An extra beat of rising action/complications");
    expect(SHORTENED_BEATS[8]?.hint).toBe("The central theme or lesson learned");
  });

  it("lists the full-length spine in Kenn Adams' order", () => {
    expect(FULL_BEATS.map((beat) => beat.prompt)).toEqual([
      "Once upon a time…",
      "Every day…",
      "But one day…",
      "Because of that…",
      "Because of that…",
      "Because of that…",
      "And that's when…",
      "Which raised the question…",
      "Because of that…",
      "Because of that…",
      "Because of that…",
      "Until finally…",
      "Because of that…",
      "Because of that…",
      "Because of that…",
      "And ever since then…",
      "And the moral of the story is…",
    ]);
    expect(FULL_BEATS.map((beat) => beat.hint ?? null)).toEqual([
      "Foundation",
      "Foundation",
      "First Significant Event",
      "Foundation Focus",
      "Foundation Focus",
      "Foundation Focus",
      "First Significant Repercussion",
      "Question of the Story",
      "Foundation Funnel",
      "Foundation Funnel",
      "Foundation Funnel",
      "Climax",
      "The End",
      "The End",
      "The End",
      "The End",
      null,
    ]);
    expect(new Set(FULL_BEATS.map((beat) => beat.id)).size).toBe(FULL_BEATS.length);
  });
});
