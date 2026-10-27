import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, headersMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

import {
  getCurrentSession,
  requireCurrentUser,
} from "@/lib/session";

describe("session", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    headersMock.mockResolvedValue(
      new Headers({
        cookie: "better-auth.session_token=test-session",
      }),
    );
  });

  it("reads the session using headers from the current request", async () => {
    const requestHeaders = new Headers({
      cookie: "better-auth.session_token=session-a",
    });

    headersMock.mockResolvedValue(requestHeaders);

    getSessionMock.mockResolvedValue({
      session: {
        id: "session-a",
        userId: "user-a",
      },
      user: {
        id: "user-a",
        name: "User A",
        email: "user-a@example.com",
      },
    });

    const session = await getCurrentSession();

    expect(headersMock).toHaveBeenCalledOnce();

    expect(getSessionMock).toHaveBeenCalledWith({
      headers: requestHeaders,
    });

    expect(session?.user.id).toBe("user-a");
  });

  it("returns user A from user A session", async () => {
    getSessionMock.mockResolvedValue({
      session: {
        id: "session-a",
        userId: "user-a",
      },
      user: {
        id: "user-a",
        name: "User A",
        email: "user-a@example.com",
      },
    });

    const user = await requireCurrentUser();

    expect(user.id).toBe("user-a");
  });

  it("returns user B from user B session", async () => {
    getSessionMock.mockResolvedValue({
      session: {
        id: "session-b",
        userId: "user-b",
      },
      user: {
        id: "user-b",
        name: "User B",
        email: "user-b@example.com",
      },
    });

    const user = await requireCurrentUser();

    expect(user.id).toBe("user-b");
  });

  it("rejects request without a session", async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("rejects an invalid or expired session", async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toThrow(
      "Unauthorized",
    );
  });
});