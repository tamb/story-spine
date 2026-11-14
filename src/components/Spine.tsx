import type { BeatDefinition, ChecklistMap } from "../types.ts";

interface SpineProps {
  beats: readonly BeatDefinition[];
  checks: ChecklistMap;
  texts: Record<string, string>;
  editable: boolean;
  onCheck: (beatId: string, checked: boolean) => void;
  onText: (beatId: string, text: string) => void;
  onClear: (beatId: string) => void;
}

export function Spine({ beats, checks, texts, editable, onCheck, onText, onClear }: SpineProps) {
  const done = editable
    ? beats.filter((beat) => (texts[beat.id] ?? "").trim().length > 0).length
    : beats.filter((beat) => checks[beat.id] === true).length;

  return (
    <section className="stage" id="spine" aria-labelledby="spine-heading">
      <div className="stage-head">
        <h2 id="spine-heading">{editable ? "Beats" : "Checklist"}</h2>
        <p>
          {done} of {beats.length} {editable ? "beats written" : "checked"}
        </p>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${beats.length === 0 ? 0 : (done / beats.length) * 100}%` }} />
        </div>
      </div>
      <ol className="spine">
        {beats.map((beat, index) => {
          const number = index + 1;
          const text = texts[beat.id] ?? "";
          const name = `Beat ${number}. ${beat.prompt}`;
          return (
            <li key={beat.id}>
              <div className="node" aria-hidden="true">
                {number}
              </div>
              <article className="card">
                <div className="beat-head">
                  <label>
                    <input
                      type="checkbox"
                      checked={checks[beat.id] === true}
                      aria-label={name}
                      onChange={(event) => onCheck(beat.id, event.target.checked)}
                    />
                    <span>
                      <span className="prompt">{beat.prompt}</span>
                      {beat.hint ? <span className="hint">{beat.hint}</span> : null}
                    </span>
                  </label>
                  {editable && text.length > 0 ? (
                    <button type="button" className="ghost" onClick={() => onClear(beat.id)}>
                      Clear beat {number}
                    </button>
                  ) : null}
                </div>
                {editable ? (
                  <label className="beat-write">
                    <span className="visually-hidden">{name}</span>
                    <textarea
                      value={text}
                      rows={4}
                      placeholder="Write this beat…"
                      onChange={(event) => onText(beat.id, event.target.value)}
                    />
                  </label>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
