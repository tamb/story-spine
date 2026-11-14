import { displayTitle } from "../titles.ts";
import { lengthLabel } from "../spine.ts";
import type { Story } from "../types.ts";

interface LibraryProps {
  stories: Story[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onAskDelete: (id: string) => void;
}

function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function Library({ stories, activeId, onOpen, onCreate, onAskDelete }: LibraryProps) {
  return (
    <aside className="library" aria-label="Saved spines">
      <div className="library-head">
        <h2>Your spines</h2>
        <button type="button" className="primary" onClick={onCreate}>
          New spine
        </button>
      </div>
      {stories.length === 0 ? (
        <p className="empty-copy">Nothing saved yet. A new spine stays in this browser.</p>
      ) : (
        <ul className="story-list">
          {stories.map((story) => {
            const title = displayTitle(story.title);
            const selected = story.id === activeId;
            return (
              <li key={story.id} className={selected ? "is-selected" : undefined}>
                <button
                  type="button"
                  className="story-open"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => onOpen(story.id)}
                >
                  <span className="story-title">{title}</span>
                  <span className="story-meta">
                    {lengthLabel(story.length)}
                    <time dateTime={new Date(story.updatedAt).toISOString()}>
                      {formatWhen(story.updatedAt)}
                    </time>
                  </span>
                </button>
                <button
                  type="button"
                  className="ghost danger"
                  onClick={() => onAskDelete(story.id)}
                >
                  Delete {title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
