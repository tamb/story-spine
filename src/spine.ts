import type { BeatDefinition, SpineLength } from "./types.ts";

export const CREDIT = "Story Spine by Kenn Adams";

export const SHORTENED_BEATS: readonly BeatDefinition[] = [
  { id: "once-upon", prompt: "Once upon a time…" },
  { id: "every-day", prompt: "Every day…" },
  {
    id: "but-one-day",
    prompt: "But, one day…",
    hint: 'Sometimes phrased as "Until one day…"',
  },
  { id: "because-1", prompt: "Because of that…" },
  { id: "because-2", prompt: "Because of that…" },
  {
    id: "because-3",
    prompt: "Because of that…",
    hint: "An extra beat of rising action/complications",
  },
  { id: "until-finally", prompt: "Until, finally…" },
  { id: "ever-since", prompt: "And, ever since then…" },
  {
    id: "moral",
    prompt: "And the moral of the story is…",
    hint: "The central theme or lesson learned",
  },
];

export const FULL_BEATS: readonly BeatDefinition[] = [
  { id: "once-upon", prompt: "Once upon a time…", hint: "Foundation" },
  { id: "every-day", prompt: "Every day…", hint: "Foundation" },
  { id: "but-one-day", prompt: "But one day…", hint: "First Significant Event" },
  { id: "because-1", prompt: "Because of that…", hint: "Foundation Focus" },
  { id: "because-2", prompt: "Because of that…", hint: "Foundation Focus" },
  { id: "because-3", prompt: "Because of that…", hint: "Foundation Focus" },
  {
    id: "and-thats-when",
    prompt: "And that's when…",
    hint: "First Significant Repercussion",
  },
  { id: "question", prompt: "Which raised the question…", hint: "Question of the Story" },
  { id: "funnel-1", prompt: "Because of that…", hint: "Foundation Funnel" },
  { id: "funnel-2", prompt: "Because of that…", hint: "Foundation Funnel" },
  { id: "funnel-3", prompt: "Because of that…", hint: "Foundation Funnel" },
  { id: "until-finally", prompt: "Until finally…", hint: "Climax" },
  { id: "end-1", prompt: "Because of that…", hint: "The End" },
  { id: "end-2", prompt: "Because of that…", hint: "The End" },
  { id: "end-3", prompt: "Because of that…", hint: "The End" },
  { id: "ever-since", prompt: "And ever since then…", hint: "The End" },
  { id: "moral", prompt: "And the moral of the story is…" },
];

export function beatsFor(length: SpineLength): readonly BeatDefinition[] {
  return length === "full" ? FULL_BEATS : SHORTENED_BEATS;
}

export function lengthLabel(length: SpineLength): string {
  return length === "full" ? "Full length" : "Shortened";
}
