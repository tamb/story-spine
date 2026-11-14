import { useState } from "react";
import { Header } from "./components/Header.tsx";
import { Library } from "./components/Library.tsx";
import { Spine } from "./components/Spine.tsx";
import { downloadText } from "./download.ts";
import { jsonFilename, markdownFilename, storyToJson, storyToMarkdown } from "./export.ts";
import { beatsFor } from "./spine.ts";
import { displayTitle } from "./titles.ts";
import type { SpineLength } from "./types.ts";
import { useLibrary } from "./useLibrary.ts";

export default function App() {
  const library = useLibrary();
  const [length, setLength] = useState<SpineLength>("shortened");
  const [writing, setWriting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (library.status === "loading") {
    return (
      <main className="boot">
        <p>Opening your spines…</p>
      </main>
    );
  }

  if (library.status === "error") {
    return (
      <main className="boot">
        <h1>Story Spine</h1>
        <p>On-device storage could not be opened in this browser.</p>
        <button type="button" className="primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  const active = writing ? library.active : null;
  const beats = beatsFor(length);
  const editable = writing && active !== null;
  const pending = library.stories.find((story) => story.id === pendingDelete) ?? null;

  function chooseLength(next: SpineLength) {
    setLength(next);
    if (writing && library.active) library.setLength(next);
  }

  function chooseWriting(next: boolean) {
    setWriting(next);
    if (!next) return;
    const story = library.active ?? library.stories[0];
    if (!story) return;
    if (!library.active) library.openStory(story.id);
    setLength(story.length);
  }

  function openStory(id: string) {
    const story = library.stories.find((item) => item.id === id);
    library.openStory(id);
    if (story) setLength(story.length);
  }

  async function createSpine() {
    const story = await library.addStory(length);
    if (story) setLength(story.length);
  }

  async function duplicateActive() {
    if (!library.active) return;
    const copy = await library.copyStory(library.active.id);
    if (copy) setLength(copy.length);
  }

  function exportJson() {
    if (!library.active) return;
    downloadText(
      jsonFilename(library.active),
      storyToJson(library.active),
      "application/json;charset=utf-8",
    );
  }

  function exportMarkdown() {
    if (!library.active) return;
    downloadText(
      markdownFilename(library.active),
      storyToMarkdown(library.active),
      "text/markdown;charset=utf-8",
    );
  }

  async function copyMarkdown() {
    if (!library.active) return;
    const markdown = storyToMarkdown(library.active);
    try {
      await navigator.clipboard.writeText(markdown);
      setNotice("Markdown copied.");
    } catch {
      exportMarkdown();
      setNotice("Clipboard unavailable. Markdown downloaded instead.");
    }
    window.setTimeout(() => setNotice(null), 2500);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete;
    setPendingDelete(null);
    const next = await library.removeStory(id);
    if (next) setLength(next.length);
  }

  const saveLabel =
    library.saveState === "saving"
      ? "Saving…"
      : library.saveState === "saved"
        ? "Saved"
        : library.saveState === "error"
          ? "Could not save"
          : "On this device";

  return (
    <>
      <Header length={length} writing={writing} onLength={chooseLength} onWriting={chooseWriting} />
      {library.banner ? (
        <p className="banner" role="status">
          {library.banner}
          <button type="button" className="ghost" onClick={library.dismissBanner}>
            Dismiss
          </button>
        </p>
      ) : null}
      <div className={writing ? "layout writing" : "layout"}>
        {writing ? (
          <Library
            stories={library.stories}
            activeId={library.active?.id ?? null}
            onOpen={openStory}
            onCreate={() => void createSpine()}
            onAskDelete={setPendingDelete}
          />
        ) : null}
        <div className="column">
          {writing && active ? (
            <div className="editor-bar">
              <label className="title-field">
                Title
                <input
                  value={active.title}
                  onChange={(event) => library.setTitle(event.target.value)}
                />
              </label>
              <p className="save-state" aria-live="polite">
                {saveLabel}
              </p>
              <div className="bar-actions">
                <button type="button" onClick={exportJson}>
                  Download JSON
                </button>
                <button type="button" onClick={exportMarkdown}>
                  Download Markdown
                </button>
                <button type="button" onClick={() => void copyMarkdown()}>
                  Copy Markdown
                </button>
                <button type="button" onClick={() => void duplicateActive()}>
                  Duplicate
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => setPendingDelete(active.id)}
                >
                  Delete spine
                </button>
              </div>
              {notice ? (
                <p className="notice" role="status">
                  {notice}
                </p>
              ) : null}
              <p className="export-note">
                Markdown reads as the spine you are viewing. JSON keeps that spine and any text
                still stored from the other length.
              </p>
            </div>
          ) : null}
          {writing && !active ? (
            <p className="empty-stage">
              Start a spine to write each beat. Nothing leaves this browser.
            </p>
          ) : null}
          <Spine
            beats={beats}
            checks={editable && active ? active.checks : library.checklists[length]}
            texts={editable && active ? active.beats : {}}
            editable={editable}
            onCheck={(beatId, checked) => {
              if (editable) library.setBeatChecked(beatId, checked);
              else library.toggleReference(length, beatId);
            }}
            onText={library.setBeatText}
            onClear={library.clearBeat}
          />
        </div>
      </div>
      <footer className="colophon">
        <p>
          The Story Spine was created by Kenn Adams. This independent writing tool keeps your drafts
          in this browser.
        </p>
      </footer>
      {pending ? (
        <div className="modal-back">
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Delete {displayTitle(pending.title)}?</h2>
            <p>This removes the spine from this browser.</p>
            <div className="modal-actions">
              <button type="button" autoFocus onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={() => void confirmDelete()}>
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
