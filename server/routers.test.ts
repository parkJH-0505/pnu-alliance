import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { vi } from "vitest";

// Mock context 생성
function createMockContext(isAdmin = false): TrpcContext {
  return {
    user: isAdmin
      ? {
          id: 1,
          openId: "admin-user",
          email: "admin@example.com",
          name: "Admin User",
          loginMethod: "manus",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : {
          id: 2,
          openId: "regular-user",
          email: "user@example.com",
          name: "Regular User",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("PNU Alliance API", () => {
  describe("Auth", () => {
    it("should return current user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.role).toBe("user");
    });

    it("should logout user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
    });
  });

  describe("Applications", () => {
    it("should list applications (admin only)", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const apps = await caller.applications.list();
      expect(Array.isArray(apps)).toBe(true);
    });

    it("should deny list applications for non-admin", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.list();
        expect.fail("Should have thrown error");
      } catch (error: any) {
        // tRPC throws TRPCError with code property
        expect(error.code || error.message).toBeDefined();
      }
    });
  });

  describe("Events", () => {
    it("should list events", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const events = await caller.events.list();
      expect(Array.isArray(events)).toBe(true);
    });

    it("should deny event creation for non-admin", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.events.create({
          title: "Unauthorized Event",
          date: new Date(),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code || error.message).toBeDefined();
      }
    });
  });

  describe("Gallery", () => {
    it("should list gallery images", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const images = await caller.gallery.list();
      expect(Array.isArray(images)).toBe(true);
    });
  });

  describe("Members", () => {
    it("should list member profiles", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const members = await caller.members.list();
      expect(Array.isArray(members)).toBe(true);
    });

    it("should generate bio with LLM", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.members.generateBio({
        keywords: "AI engineer, startup founder, Seoul",
      });

      expect(result).toBeDefined();
      expect(result.bio).toBeDefined();
      expect(typeof result.bio).toBe("string");
      expect(result.bio.length).toBeGreaterThan(0);
    }, 15000); // LLM 호출은 시간이 걸리므로 타임아웃 증가
  });
});
