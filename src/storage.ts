import localforage from "localforage";
import type { ChecklistMap, SpineLength, Story } from "./types.ts";

const driver = [localforage.INDEXEDDB, localforage.LOCALSTORAGE];

const stories = localforage.createInstance({
  name: "story-spine",
  storeName: "stories",
  description: "Story Spine writing entries",
  driver,
});

const checklists = localforage.createInstance({
  name: "story-spine",
  storeName: "checklists",
  description: "Story Spine reference checklist",
  driver,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asChecks(value: unknown): ChecklistMap {
  if (!isRecord(value)) return {};
  const checks: ChecklistMap = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "boolean") checks[key] = entry;
  }
  return checks;
}

function asText(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const beats: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") beats[key] = entry;
  }
  return beats;
}

function asStory(value: unknown): Story | null {
  if (!isRecord(value)) return null;
  const { id, title, length, createdAt, updatedAt } = value;
  if (typeof id !== "string" || typeof title !== "string") return null;
  if (length !== "shortened" && length !== "full") return null;
  if (typeof createdAt !== "number" || typeof updatedAt !== "number") return null;
  return {
    id,
    title,
    length,
    beats: asText(value.beats),
    checks: asChecks(value.checks),
    createdAt,
    updatedAt,
  };
}

export async function storageDriver(): Promise<string> {
  await stories.ready();
  return stories.driver();
}

export async function listStories(): Promise<Story[]> {
  const all: Story[] = [];
  await stories.iterate<unknown, void>((value) => {
    const story = asStory(value);
    if (story) all.push(story);
  });
  all.sort((a, b) => b.updatedAt - a.updatedAt || a.title.localeCompare(b.title));
  return all;
}

export async function getStory(id: string): Promise<Story | null> {
  return asStory(await stories.getItem(id));
}

export async function createStory(input: { title: string; length: SpineLength }): Promise<Story> {
  const now = Date.now();
  const story: Story = {
    id: crypto.randomUUID(),
    title: input.title,
    length: input.length,
    beats: {},
    checks: {},
    createdAt: now,
    updatedAt: now,
  };
  await stories.setItem(story.id, story);
  return story;
}

export async function saveStory(story: Story): Promise<void> {
  await stories.setItem(story.id, story);
}

export async function deleteStory(id: string): Promise<void> {
  await stories.removeItem(id);
}

export async function duplicateStory(source: Story): Promise<Story> {
  const now = Date.now();
  const copy: Story = {
    id: crypto.randomUUID(),
    title: `${source.title.trim() || "Untitled spine"} copy`,
    length: source.length,
    beats: { ...source.beats },
    checks: { ...source.checks },
    createdAt: now,
    updatedAt: now,
  };
  await stories.setItem(copy.id, copy);
  return copy;
}

export async function getChecklist(length: SpineLength): Promise<ChecklistMap> {
  return asChecks(await checklists.getItem(length));
}

export async function saveChecklist(length: SpineLength, checks: ChecklistMap): Promise<void> {
  await checklists.setItem(length, checks);
}

export async function clearLibrary(): Promise<void> {
  await stories.ready();
  await checklists.ready();
  await stories.clear();
  await checklists.clear();
}
