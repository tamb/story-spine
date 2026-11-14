import type { SpineLength } from "../types.ts";

interface HeaderProps {
  length: SpineLength;
  writing: boolean;
  onLength: (length: SpineLength) => void;
  onWriting: (writing: boolean) => void;
}

export function Header({ length, writing, onLength, onWriting }: HeaderProps) {
  return (
    <header className="mast">
      <a className="skip" href="#spine">
        Skip to the spine
      </a>
      <div className="brand">
        <p className="kicker">A writing tool</p>
        <h1>Story Spine</h1>
        <p className="byline">
          by <strong>Kenn Adams</strong>
        </p>
      </div>
      <div className="controls">
        <fieldset className="segment">
          <legend>Spine length</legend>
          <label>
            <input
              type="radio"
              name="spine-length"
              value="shortened"
              checked={length === "shortened"}
              onChange={() => onLength("shortened")}
            />
            Shortened
          </label>
          <label>
            <input
              type="radio"
              name="spine-length"
              value="full"
              checked={length === "full"}
              onChange={() => onLength("full")}
            />
            Full length
          </label>
        </fieldset>
        <label className="mode">
          <input
            type="checkbox"
            role="switch"
            checked={writing}
            onChange={(event) => onWriting(event.target.checked)}
          />
          <span className="mode-track" aria-hidden="true" />
          Writing mode
        </label>
      </div>
      <p className="lede">
        {length === "shortened"
          ? "Nine beats, from the world as it is to the moral."
          : "Seventeen beats, from the foundation to the moral."}
      </p>
    </header>
  );
}
