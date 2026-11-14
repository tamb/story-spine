import { describe, expect, it } from "vite-plus/test";
import { displayTitle, nextUntitled, slugify } from "./titles.ts";

describe("titles", () => {
  it("falls back when a title is blank", () => {
    expect(displayTitle("  ")).toBe("Untitled spine");
    expect(displayTitle(" The Clockmaker ")).toBe("The Clockmaker");
  });

  it("numbers untitled spines", () => {
    expect(nextUntitled([])).toBe("Untitled spine");
    expect(nextUntitled(["Untitled spine", "Untitled spine 2"])).toBe("Untitled spine 3");
  });

  it("builds a filename slug", () => {
    expect(slugify("The Clockmaker!")).toBe("the-clockmaker");
    expect(slugify("   ")).toBe("untitled-spine");
  });
});
