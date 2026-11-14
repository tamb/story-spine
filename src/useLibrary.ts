import { useEffect, useRef, useState } from "react";
import {
  createStory,
  deleteStory,
  duplicateStory,
  getChecklist,
  listStories,
  saveChecklist,
  saveStory,
} from "./storage.ts";
import { nextUntitled } from "./titles.ts";
import type { ChecklistMap, SpineLength, Story } from "./types.ts";

export type LibraryStatus = "loading" | "ready" | "error";
export type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 300;

interface Checklists {
  shortened: ChecklistMap;
  full: ChecklistMap;
}

export function useLibrary() {
  const [status, setStatus] = useState<LibraryStatus>("loading");
  const [stories, setStories] = useState<Story[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<Checklists>({ shortened: {}, full: {} });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const [dirtyId, setDirtyId] = useState<string | null>(null);

  const storiesRef = useRef(stories);
  const checksRef = useRef(checklists);
  const tombstones = useRef(new Set<string>());
  const saveGen = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [loadedStories, shortened, full] = await Promise.all([
          listStories(),
          getChecklist("shortened"),
          getChecklist("full"),
        ]);
        if (cancelled) return;
        const loadedChecks = { shortened, full };
        storiesRef.current = loadedStories;
        checksRef.current = loadedChecks;
        setStories(loadedStories);
        setChecklists(loadedChecks);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(story: Story, generation: number) {
    try {
      if (tombstones.current.has(story.id)) return;
      await saveStory(story);
      if (tombstones.current.has(story.id)) {
        await deleteStory(story.id);
        return;
      }
      if (saveGen.current === generation) setSaveState("saved");
    } catch {
      if (saveGen.current === generation) {
        setSaveState("error");
        setBanner("Could not save on this device.");
      }
    }
  }

  useEffect(() => {
    if (!dirtyId) return;
    const handle = window.setTimeout(() => {
      timerRef.current = null;
      const latest = storiesRef.current.find((story) => story.id === dirtyId);
      if (!latest || tombstones.current.has(latest.id)) return;
      void persist(latest, saveGen.current);
    }, SAVE_DELAY_MS);
    timerRef.current = handle;
    return () => {
      window.clearTimeout(handle);
      if (timerRef.current === handle) timerRef.current = null;
    };
  }, [dirtyId, stories]);

  function patchStory(id: string, recipe: (story: Story) => Story) {
    saveGen.current += 1;
    const next = storiesRef.current.map((story) =>
      story.id === id ? recipe({ ...story, updatedAt: Date.now() }) : story,
    );
    storiesRef.current = next;
    setStories(next);
    setDirtyId(id);
    setSaveState("saving");
  }

  function toggleReference(length: SpineLength, beatId: string) {
    const current = checksRef.current[length];
    const nextChecks = { ...current, [beatId]: current[beatId] !== true };
    const next = { ...checksRef.current, [length]: nextChecks };
    checksRef.current = next;
    setChecklists(next);
    void saveChecklist(length, nextChecks).catch(() => {
      setBanner("Could not save the checklist on this device.");
    });
  }

  async function addStory(length: SpineLength) {
    try {
      const title = nextUntitled(storiesRef.current.map((story) => story.title));
      const story = await createStory({ title, length });
      const next = [story, ...storiesRef.current];
      storiesRef.current = next;
      setStories(next);
      setActiveId(story.id);
      setDirtyId(null);
      setSaveState("idle");
      setBanner(null);
      return story;
    } catch {
      setBanner("Could not create a spine on this device.");
      return null;
    }
  }

  async function copyStory(id: string) {
    const source = storiesRef.current.find((story) => story.id === id);
    if (!source) return null;
    try {
      const copy = await duplicateStory(source);
      const next = [copy, ...storiesRef.current];
      storiesRef.current = next;
      setStories(next);
      setActiveId(copy.id);
      setDirtyId(null);
      setSaveState("idle");
      return copy;
    } catch {
      setBanner("Could not duplicate this spine.");
      return null;
    }
  }

  async function removeStory(id: string): Promise<Story | null> {
    tombstones.current.add(id);
    saveGen.current += 1;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const next = storiesRef.current.filter((story) => story.id !== id);
    const nextId = activeId === id ? (next[0]?.id ?? null) : activeId;
    storiesRef.current = next;
    setStories(next);
    setActiveId(nextId);
    setDirtyId((current) => (current === id ? null : current));
    try {
      await deleteStory(id);
      setBanner(null);
    } catch {
      setBanner("Could not delete this spine.");
    }
    return next.find((story) => story.id === nextId) ?? null;
  }

  function openStory(id: string) {
    const story = storiesRef.current.find((item) => item.id === id);
    if (!story) return;
    setActiveId(story.id);
    setSaveState("idle");
  }

  const active = stories.find((story) => story.id === activeId) ?? null;

  return {
    status,
    stories,
    active,
    checklists,
    saveState,
    banner,
    dismissBanner: () => setBanner(null),
    toggleReference,
    addStory,
    copyStory,
    removeStory,
    openStory,
    setTitle: (title: string) => {
      if (!active) return;
      patchStory(active.id, (story) => ({ ...story, title }));
    },
    setLength: (length: SpineLength) => {
      if (!active) return;
      patchStory(active.id, (story) => ({ ...story, length }));
    },
    setBeatText: (beatId: string, text: string) => {
      if (!active) return;
      patchStory(active.id, (story) => ({
        ...story,
        beats: { ...story.beats, [beatId]: text },
      }));
    },
    setBeatChecked: (beatId: string, checked: boolean) => {
      if (!active) return;
      patchStory(active.id, (story) => ({
        ...story,
        checks: { ...story.checks, [beatId]: checked },
      }));
    },
    clearBeat: (beatId: string) => {
      if (!active) return;
      patchStory(active.id, (story) => ({
        ...story,
        beats: { ...story.beats, [beatId]: "" },
      }));
    },
  };
}
