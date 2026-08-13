import { describe, expect, it } from "vitest";
import { revealKingdom } from "./initialReveal";

describe("revealKingdom", () => {
  it("moves the shell from loading to ready", () => {
    const classList = new Set(["kingdom-shell", "is-loading"]);
    const shell = {
      classList: {
        add: (...names: string[]) => names.forEach((name) => classList.add(name)),
        remove: (...names: string[]) => names.forEach((name) => classList.delete(name)),
      },
    } as unknown as HTMLElement;

    revealKingdom(shell);

    expect([...classList]).toEqual(["kingdom-shell", "is-ready"]);
  });
});
