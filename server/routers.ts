import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createApplication, getApplications, updateApplicationStatus, getMemberProfiles, getEvents, createEvent, updateEvent, deleteEvent, getGalleryImages, createGalleryImage, deleteGalleryImage, createMemberProfile, getMemberProfileByUserId, createEventRegistration, checkDuplicateRegistration, getRegistrationsByEvent, getRegistrationsByMember, searchMemberByPhone, updateEventStatus, getEventWithRegistrationCount, getEventsByStatus, createNews, getNews, deleteNews, createInquiry, getInquiries, updateInquiry } from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { createSheetTab, appendRegistrationRow, updateMasterSheet } from "./_core/googleSheets";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== Applications (합류 신청) =====
  applications: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        graduationYear: z.string().optional(),
        major: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        industry: z.string().optional(),
        motivation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const app = await createApplication(input);
        // 오너에게 알림 발송
        await notifyOwner({
          title: "새로운 PNU Alliance 합류 신청",
          content: `${input.name} (${input.email})님이 합류를 신청했습니다.\n직군: ${input.industry || "미지정"}\n동기: ${input.motivation || "미기입"}`,
        });
        return app;
      }),
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getApplications(input?.status);
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        tier: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        await updateApplicationStatus(input.id, input.status, input.tier);
        return { success: true };
      }),
  }),

  // ===== Member Profiles (멤버 프로필) =====
  members: router({
    list: publicProcedure.query(async () => {
      return getMemberProfiles();
    }),
    generateBio: protectedProcedure
      .input(z.object({
        keywords: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "당신은 전문적이고 자연스러운 한국어 프로필 한줄소개를 작성하는 전문가입니다. 주어진 키워드를 바탕으로 50자 이내의 매력적인 한줄소개를 작성해주세요.",
            },
            {
              role: "user",
              content: `다음 키워드를 바탕으로 한줄소개를 작성해주세요: ${input.keywords}`,
            },
          ],
        });
        const content = (response as any).choices?.[0]?.message?.content || "";
        return { bio: content.trim() };
      }),
  }),

  // ===== Events (이벤트) =====
  events: router({
    list: publicProcedure.query(async () => {
      return getEvents();
    }),
    create: protectedProcedure
      .input(z.object({
        eventNumber: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        date: z.date(),
        location: z.string(),
        theme: z.string().optional(),
        capacity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        
        // 구글시트 탭 생성
        const sheetTabId = await createSheetTab(input.eventNumber);
        
        const event = await createEvent({
          ...input,
          createdBy: ctx.user.id,
          status: "recruiting",
          googleSheetTabId: sheetTabId || undefined,
        });
        
        // 마스터 시트 업데이트
        if (event) {
          await updateMasterSheet(
            input.eventNumber,
            input.date.toISOString().split('T')[0],
            input.location,
            input.theme || ''
          );
        }
        
        return event;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        location: z.string().optional(),
        capacity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const { id, ...data } = input;
        await updateEvent(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        await deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // ===== Gallery Images (갤러리) =====
  gallery: router({
    list: publicProcedure.query(async () => {
      return getGalleryImages();
    }),
    upload: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        imageData: z.string(), // base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const buffer = Buffer.from(input.imageData, "base64");
        const { url, key } = await storagePut(
          `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}`,
          buffer,
          input.mimeType
        );
        return createGalleryImage({
          title: input.title,
          description: input.description,
          imageUrl: url,
          imageKey: key,
          uploadedBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        await deleteGalleryImage(input.id);
        return { success: true };
      }),
  }),
  // ===== News (뉴스) =====
  news: router({
    list: publicProcedure.query(async () => {
      const { getNews } = await import("./db");
      return getNews();
    }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["UPDATE", "INTERVIEW", "RECAP"]),
        title: z.string().min(1),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        publishedAt: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const { createNews } = await import("./db");
        return createNews({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const { deleteNews } = await import("./db");
        await deleteNews(input.id);
        return { success: true };
      }),
  }),
  // ===== Inquiries (호스트 문의) =====
  inquiries: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const { createInquiry } = await import("./db");
        const inquiry = await createInquiry(input);
        // 오너에게 알림 발송
        await notifyOwner({
          title: "새로운 호스트 문의",
          content: `${input.name} (${input.email})님이 문의했습니다.\n내용: ${input.content.substring(0, 100)}...`,
        });
        return inquiry;
      }),
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const { getInquiries } = await import("./db");
        return getInquiries(input?.status);
      }),
    respond: protectedProcedure
      .input(z.object({
        id: z.number(),
        response: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        const { updateInquiry } = await import("./db");
        await updateInquiry(input.id, {
          response: input.response,
          status: "answered",
          respondedBy: ctx.user.id,
        });
        return { success: true };
  }),
      }),


  // ===== Event Registrations (회차별 참가 신청) =====
  eventRegistrations: router({
    create: publicProcedure
      .input(z.object({
        eventId: z.number(),
        memberId: z.number().optional(),
        name: z.string().min(1),
        company: z.string().optional(),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        additionalInfo: z.string().optional(),
        registrationType: z.enum(["existing_member", "new_participant"]),
      }))
      .mutation(async ({ input }) => {
        // 중복 신청 확인
        const isDuplicate = await checkDuplicateRegistration(input.eventId, input.phone, input.memberId);
        if (isDuplicate) {
          throw new Error("이미 이 회차에 신청하셨습니다.");
        }

        // 참가 신청 생성
        const registration = await createEventRegistration({
          eventId: input.eventId,
          memberId: input.memberId,
          name: input.name,
          company: input.company,
          phone: input.phone,
          email: input.email,
          additionalInfo: input.additionalInfo,
          registrationType: input.registrationType,
        });

        if (!registration) {
          throw new Error("참가 신청 생성에 실패했습니다.");
        }

        // 오너 알림 발송
        await notifyOwner({
          title: `새로운 회차 참가 신청 - ${input.name}`,
          content: `회차: ${input.eventId}\n이름: ${input.name}\n연락처: ${input.phone}\n이메일: ${input.email}`,
        });

        return registration;
      }),

    getByEvent: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Admin only");
        return getRegistrationsByEvent(input.eventId);
      }),

    getByMember: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        const profile = await searchMemberByPhone(ctx.user.email || "");
        if (!profile) return [];
        return getRegistrationsByMember(profile.id);
      }),
  }),

  // ===== Member Profiles (멤버 프로필) =====
  memberProfiles: router({
    searchByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return searchMemberByPhone(input.phone);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        company: z.string().optional(),
        phone: z.string().min(1),
        bio: z.string().optional(),
        tier: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        
        const profile = await createMemberProfile({
          userId: ctx.user.id,
          name: input.name,
          company: input.company,
          phone: input.phone,
          bio: input.bio,
          tier: (input.tier as any) || "ground-crew",
        });

        return profile;
      }),

    getMe: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return getMemberProfileByUserId(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
