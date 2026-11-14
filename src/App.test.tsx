import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import App from "./App.tsx";
import { downloadText } from "./download.ts";
import { clearLibrary } from "./storage.ts";

vi.mock("./download.ts", () => ({
  downloadText: vi.fn(),
}));

async function openApp() {
  render(<App />);
  expect(await screen.findByRole("radio", { name: "Shortened" })).toBeChecked();
}

describe("Story Spine app", () => {
  beforeEach(async () => {
    vi.mocked(downloadText).mockReset();
    await clearLibrary();
  });

  it("switches the checklist between shortened and full length", async () => {
    const user = userEvent.setup({ delay: null });
    await openApp();

    expect(screen.getAllByRole("checkbox")).toHaveLength(9);
    expect(screen.getByText('Sometimes phrased as "Until one day…"')).toBeInTheDocument();
    expect(screen.queryByText("Which raised the question…")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Full length" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(11);
    expect(screen.getByText("Which raised the question…")).toBeInTheDocument();
    expect(screen.getByText("Which meant that…")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Establishes the central dramatic question—what the audience is rooting for the protagonist to achieve or resolve",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Shortened" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(9);
    expect(screen.queryByText("Which meant that…")).not.toBeInTheDocument();
  });

  it("remembers reference checks in this browser", async () => {
    const user = userEvent.setup({ delay: null });
    await openApp();
    await user.click(screen.getByRole("checkbox", { name: /Beat 1\. Once upon a time/ }));
    expect(screen.getByRole("checkbox", { name: /Beat 1\. Once upon a time/ })).toBeChecked();

    cleanup();
    render(<App />);
    expect(
      await screen.findByRole("checkbox", { name: /Beat 1\. Once upon a time/ }),
    ).toBeChecked();
  });

  it("creates, edits, exports, duplicates, and deletes a writing-mode spine", async () => {
    const user = userEvent.setup({ delay: null });
    await openApp();
    await user.click(screen.getByRole("switch", { name: "Writing mode" }));
    await user.click(screen.getByRole("button", { name: "New spine" }));

    const title = await screen.findByRole("textbox", { name: "Title" });
    expect(title).toHaveValue("Untitled spine");
    await user.clear(title);
    await user.type(title, "The Clockmaker");
    const opening = screen.getByRole("textbox", { name: /Beat 1\. Once upon a time/ });
    await user.type(opening, "A clockmaker ignored the town clock.");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Full length" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(12);
    expect(screen.getByRole("textbox", { name: /Beat 1\. Once upon a time/ })).toHaveValue(
      "A clockmaker ignored the town clock.",
    );
    const question = screen.getByRole("textbox", { name: /Which raised the question/ });
    await user.type(question, "Would the town notice?");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Shortened" }));
    expect(
      screen.queryByRole("textbox", { name: /Which raised the question/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Full length" }));
    expect(screen.getByRole("textbox", { name: /Which raised the question/ })).toHaveValue(
      "Would the town notice?",
    );

    await user.click(screen.getByRole("button", { name: "Clear beat 4" }));
    expect(screen.getByRole("textbox", { name: /Which raised the question/ })).toHaveValue("");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Download JSON" }));
    const jsonCall = vi.mocked(downloadText).mock.calls.at(-1);
    expect(jsonCall?.[0]).toBe("the-clockmaker.json");
    expect(jsonCall?.[2]).toContain("application/json");
    expect(jsonCall?.[1]).toContain("Story Spine by Kenn Adams");
    expect(jsonCall?.[1]).toContain("A clockmaker ignored the town clock.");

    await user.click(screen.getByRole("button", { name: "Download Markdown" }));
    const markdown = vi.mocked(downloadText).mock.calls.at(-1)?.[1] ?? "";
    expect(markdown).toContain("# The Clockmaker");
    expect(markdown).toContain("A clockmaker ignored the town clock.");
    expect(markdown).toContain("*Story Spine by Kenn Adams · Full length*");

    cleanup();
    render(<App />);
    await user.click(await screen.findByRole("switch", { name: "Writing mode" }));
    expect(await screen.findByRole("textbox", { name: "Title" })).toHaveValue("The Clockmaker");
    expect(screen.getByRole("textbox", { name: /Beat 1\. Once upon a time/ })).toHaveValue(
      "A clockmaker ignored the town clock.",
    );

    await user.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(await screen.findByRole("button", { name: /^The Clockmaker copy/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("The Clockmaker copy");

    await user.click(screen.getByRole("button", { name: "Delete spine" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("The Clockmaker");
    });
    expect(screen.queryByRole("button", { name: /^The Clockmaker copy/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete spine" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: "Title" })).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
  });
});
