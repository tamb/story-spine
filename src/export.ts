import { beatsFor, CREDIT, lengthLabel } from "./spine.ts";
import { displayTitle, slugify } from "./titles.ts";
import type { Story } from "./types.ts";

export interface ExportedBeat {
  index: number;
  id: string;
  prompt: string;
  note: string | null;
  text: string;
  checked: boolean;
}

export interface ExportedKeptBeat {
  id: string;
  text: string;
  checked: boolean;
}

export interface StoryExport {
  format: "story-spine/v1";
  credit: typeof CREDIT;
  id: string;
  title: string;
  length: Story["length"];
  createdAt: string;
  updatedAt: string;
  beats: ExportedBeat[];
  kept: ExportedKeptBeat[];
}

export function storyToExport(story: Story): StoryExport {
  const visible = beatsFor(story.length);
  const visibleIds = new Set(visible.map((beat) => beat.id));
  const kept: ExportedKeptBeat[] = [];

  for (const [id, text] of Object.entries(story.beats)) {
    const checked = story.checks[id] === true;
    if (visibleIds.has(id)) continue;
    if (text.trim().length === 0 && !checked) continue;
    kept.push({ id, text, checked });
  }

  kept.sort((a, b) => a.id.localeCompare(b.id));

  return {
    format: "story-spine/v1",
    credit: CREDIT,
    id: story.id,
    title: story.title,
    length: story.length,
    createdAt: new Date(story.createdAt).toISOString(),
    updatedAt: new Date(story.updatedAt).toISOString(),
    beats: visible.map((beat, index) => ({
      index: index + 1,
      id: beat.id,
      prompt: beat.prompt,
      note: beat.hint ?? null,
      text: story.beats[beat.id] ?? "",
      checked: story.checks[beat.id] === true,
    })),
    kept,
  };
}

export function storyToJson(story: Story): string {
  return `${JSON.stringify(storyToExport(story), null, 2)}\n`;
}

export function storyToMarkdown(story: Story): string {
  const beats = beatsFor(story.length);
  const lines = [
    `# ${displayTitle(story.title)}`,
    "",
    `*${CREDIT} · ${lengthLabel(story.length)}*`,
    "",
  ];

  for (const [index, beat] of beats.entries()) {
    lines.push(`## ${index + 1}. ${beat.prompt}`, "");
    if (beat.hint) lines.push(`*${beat.hint}*`, "");
    const text = (story.beats[beat.id] ?? "").trim();
    if (text.length > 0) lines.push(text, "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function jsonFilename(story: Story): string {
  return `${slugify(story.title)}.json`;
}

export function markdownFilename(story: Story): string {
  return `${slugify(story.title)}.md`;
}
