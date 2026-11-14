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
  {
    id: "once-upon",
    prompt: "Once upon a time…",
    hint: "Introduce the protagonist and their world",
  },
  {
    id: "every-day",
    prompt: "Every day…",
    hint: "Establish the routine or status quo",
  },
  {
    id: "but-one-day",
    prompt: "But, one day…",
    hint: "The inciting incident that disrupts the routine",
  },
  {
    id: "question",
    prompt: "Which raised the question…",
    hint: "Establishes the central dramatic question—what the audience is rooting for the protagonist to achieve or resolve",
  },
  {
    id: "because-1",
    prompt: "Because of that…",
    hint: "First consequence or action taken",
  },
  {
    id: "because-2",
    prompt: "Because of that…",
    hint: "Second consequence or escalating complication",
  },
  {
    id: "because-3",
    prompt: "Because of that…",
    hint: "Third consequence or crisis point",
  },
  {
    id: "until-finally",
    prompt: "Until, finally…",
    hint: "The climax that answers the central dramatic question",
  },
  {
    id: "meant",
    prompt: "Which meant that…",
    hint: "The immediate fallout or falling action of the climax",
  },
  {
    id: "ever-since",
    prompt: "And, ever since then…",
    hint: "The new normal",
  },
  {
    id: "moral",
    prompt: "And the moral of the story is…",
    hint: "The thematic takeaway",
  },
];

export function beatsFor(length: SpineLength): readonly BeatDefinition[] {
  return length === "full" ? FULL_BEATS : SHORTENED_BEATS;
}

export function lengthLabel(length: SpineLength): string {
  return length === "full" ? "Full length" : "Shortened";
}
