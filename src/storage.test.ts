import localforage from "localforage";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  clearLibrary,
  createStory,
  deleteStory,
  duplicateStory,
  getChecklist,
  getStory,
  listStories,
  saveChecklist,
  saveStory,
  storageDriver,
} from "./storage.ts";

describe("story storage", () => {
  beforeEach(async () => {
    await clearLibrary();
  });

  it("uses IndexedDB through localforage", async () => {
    expect(await storageDriver()).toBe(localforage.INDEXEDDB);
  });

  it("creates, reads, updates, and deletes spines", async () => {
    const created = await createStory({ title: "Untitled spine", length: "shortened" });
    expect(created.id).toBeTruthy();
    expect(await getStory(created.id)).toMatchObject({
      title: "Untitled spine",
      length: "shortened",
    });

    const edited = {
      ...created,
      title: "The Clockmaker",
      length: "full" as const,
      beats: { "once-upon": "A clockmaker." },
      checks: { "once-upon": true },
      updatedAt: created.updatedAt + 10,
    };
    await saveStory(edited);
    expect(await getStory(created.id)).toMatchObject({
      title: "The Clockmaker",
      beats: { "once-upon": "A clockmaker." },
      checks: { "once-upon": true },
    });

    const copy = await duplicateStory(edited);
    const titles = (await listStories()).map((story) => story.title).sort();
    expect(titles).toEqual(["The Clockmaker", "The Clockmaker copy"]);

    await deleteStory(copy.id);
    expect(await getStory(copy.id)).toBeNull();
    expect(await listStories()).toHaveLength(1);
  });

  it("saves reference checklist progress separately for each length", async () => {
    await saveChecklist("shortened", { "once-upon": true });
    await saveChecklist("full", { question: true });
    expect(await getChecklist("shortened")).toEqual({ "once-upon": true });
    expect(await getChecklist("full")).toEqual({ question: true });
  });
});
