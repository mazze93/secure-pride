import { expect, it, vi } from "vitest";
import { onRequestPost } from "./contact";
it("retires the contact relay without logging or forwarding messages", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const fetch = vi.spyOn(globalThis, "fetch");
  try {
    const response = await onRequestPost();
    expect(response.status).toBe(410);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(log).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
    fetch.mockRestore();
  }
});
