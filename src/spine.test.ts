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
      "But, one day…",
      "Which raised the question…",
      "Because of that…",
      "Because of that…",
      "Because of that…",
      "Until, finally…",
      "Which meant that…",
      "And, ever since then…",
      "And the moral of the story is…",
    ]);
    expect(FULL_BEATS[0]?.hint).toBe("Introduce the protagonist and their world");
    expect(FULL_BEATS[3]?.hint).toBe(
      "Establishes the central dramatic question—what the audience is rooting for the protagonist to achieve or resolve",
    );
    expect(FULL_BEATS[8]?.hint).toBe("The immediate fallout or falling action of the climax");
    expect(FULL_BEATS[10]?.hint).toBe("The thematic takeaway");
  });
});
