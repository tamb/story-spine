export function displayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Untitled spine";
}

export function nextUntitled(titles: readonly string[]): string {
  const taken = new Set(titles);
  const base = "Untitled spine";
  if (!taken.has(base)) return base;
  let count = 2;
  while (taken.has(`${base} ${count}`)) count += 1;
  return `${base} ${count}`;
}

export function slugify(title: string): string {
  const slug = displayTitle(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug.length > 0 ? slug : "story-spine";
}
