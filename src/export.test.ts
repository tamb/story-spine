import { describe, expect, it } from "vite-plus/test";
import { storyToExport, storyToJson, storyToMarkdown } from "./export.ts";
import type { Story } from "./types.ts";

const story: Story = {
  id: "spine-1",
  title: "The Clockmaker",
  length: "full",
  beats: {
    "once-upon": "A clockmaker ignored the town clock.",
    question: "Would anyone notice the lost hour?",
    "because-1": "He hid the key.",
  },
  checks: { moral: true, question: true },
  createdAt: Date.UTC(2026, 0, 2, 3, 4, 5),
  updatedAt: Date.UTC(2026, 0, 3, 4, 5, 6),
};

describe("export", () => {
  it("writes markdown for the visible spine and credits Kenn Adams", () => {
    const markdown = storyToMarkdown(story);
    expect(markdown).toContain("# The Clockmaker");
    expect(markdown).toContain("*Story Spine by Kenn Adams · Full length*");
    expect(markdown).toContain("## 1. Once upon a time…");
    expect(markdown).toContain("*Foundation*");
    expect(markdown).toContain("A clockmaker ignored the town clock.");
    expect(markdown).toContain("## 4. Because of that…\n\n*Foundation Focus*\n\nHe hid the key.");
    expect(markdown).toContain("## 7. And that's when…");
    expect(markdown).toContain("## 8. Which raised the question…\n\n*Question of the Story*");
    expect(markdown).toContain("Would anyone notice the lost hour?");
    expect(markdown).toContain("## 12. Until finally…\n\n*Climax*");
    expect(markdown).toContain("## 16. And ever since then…\n\n*The End*");
    expect(markdown).toContain("## 17. And the moral of the story is…");
    expect(markdown).not.toContain("Which meant that…");
    expect(markdown).not.toContain("Sometimes phrased as");
  });

  it("exports the active spine as JSON and keeps text from the other length", () => {
    const shortened: Story = { ...story, length: "shortened" };
    const exported = storyToExport(shortened);
    expect(exported.format).toBe("story-spine/v1");
    expect(exported.credit).toBe("Story Spine by Kenn Adams");
    expect(exported.beats).toHaveLength(9);
    expect(exported.beats[0]).toMatchObject({
      index: 1,
      id: "once-upon",
      text: "A clockmaker ignored the town clock.",
    });
    expect(exported.beats.map((beat) => beat.prompt)).not.toContain("Which raised the question…");
    expect(exported.kept).toEqual([
      {
        id: "question",
        text: "Would anyone notice the lost hour?",
        checked: true,
      },
    ]);

    const parsed = JSON.parse(storyToJson(shortened)) as { credit: string; kept: unknown[] };
    expect(parsed.credit).toBe("Story Spine by Kenn Adams");
    expect(parsed.kept).toHaveLength(1);
  });
});
