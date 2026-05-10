import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, applications, InsertApplication, Application, memberProfiles, InsertMemberProfile, MemberProfile, events, InsertEvent, Event, galleryImages, InsertGalleryImage, GalleryImage, news, InsertNews, News, inquiries, InsertInquiry, Inquiry, eventRegistrations, EventRegistration, InsertEventRegistration } from "../drizzle/schema";
import { ENV } from './_core/env';
import { and } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Applications (합류 신청) =====
export async function createApplication(data: InsertApplication): Promise<Application> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applications).values(data);
  const id = (result as any).insertId;
  const app = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return app[0]!;
}

export async function getApplications(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(applications).where(eq(applications.status, status as any)).orderBy(desc(applications.createdAt));
  }
  return db.select().from(applications).orderBy(desc(applications.createdAt));
}

export async function updateApplicationStatus(id: number, status: string, tier?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { status, updatedAt: new Date() };
  if (tier) updates.tier = tier;
  await db.update(applications).set(updates).where(eq(applications.id, id));
}

// ===== Member Profiles (멤버 프로필) =====
export async function createMemberProfile(data: InsertMemberProfile): Promise<MemberProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memberProfiles).values(data);
  const id = (result as any).insertId;
  const profile = await db.select().from(memberProfiles).where(eq(memberProfiles.id, id)).limit(1);
  return profile[0]!;
}

export async function getMemberProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberProfiles).orderBy(desc(memberProfiles.createdAt));
}

export async function updateMemberProfile(id: number, data: Partial<InsertMemberProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(memberProfiles).set({ ...data, updatedAt: new Date() }).where(eq(memberProfiles.id, id));
}

// ===== Events (이벤트) =====
export async function createEvent(data: InsertEvent): Promise<Event> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  const id = (result as any).insertId;
  const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return event[0]!;
}

export async function getEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.date));
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set({ ...data, updatedAt: new Date() }).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ===== Gallery Images (갤러리 이미지) =====
export async function createGalleryImage(data: InsertGalleryImage): Promise<GalleryImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryImages).values(data);
  const id = (result as any).insertId;
  const image = await db.select().from(galleryImages).where(eq(galleryImages.id, id)).limit(1);
  return image[0]!;
}

export async function getGalleryImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt));
}

export async function deleteGalleryImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
}

// ===== News (뉴스) =====
export async function createNews(data: InsertNews): Promise<News> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(news).values(data);
  const id = (result as any).insertId;
  const newsItem = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return newsItem[0]!;
}

export async function getNews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.publishedAt));
}

export async function getNewsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).where(eq(news.type, type as any)).orderBy(desc(news.publishedAt));
}

export async function updateNews(id: number, data: Partial<InsertNews>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(news).set({ ...data, updatedAt: new Date() }).where(eq(news.id, id));
}

export async function deleteNews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(news).where(eq(news.id, id));
}

// ===== Inquiries (호스트 문의) =====
export async function createInquiry(data: InsertInquiry): Promise<Inquiry> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inquiries).values(data);
  const id = (result as any).insertId;
  const inquiry = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return inquiry[0]!;
}

export async function getInquiries(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(inquiries).where(eq(inquiries.status, status as any)).orderBy(desc(inquiries.createdAt));
  }
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function updateInquiry(id: number, data: Partial<InsertInquiry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inquiries).set({ ...data, updatedAt: new Date() }).where(eq(inquiries.id, id));
}

export async function deleteInquiry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inquiries).where(eq(inquiries.id, id));
}


// ===== Event Registration Helpers (회차별 참가 신청) ====

/**
 * 회차별 참가 신청 생성
 */
export async function createEventRegistration(data: InsertEventRegistration): Promise<EventRegistration | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create event registration: database not available");
    return null;
  }

  try {
    const result = await db.insert(eventRegistrations).values(data);
    const registrations = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, result[0].insertId as unknown as number)).limit(1);
    return registrations.length > 0 ? registrations[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create event registration:", error);
    throw error;
  }
}

/**
 * 중복 신청 확인
 */
export async function checkDuplicateRegistration(eventId: number, phone: string, memberId?: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check duplicate registration: database not available");
    return false;
  }

  try {
    const conditions = [eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.phone, phone)];
    if (memberId) {
      conditions.push(eq(eventRegistrations.memberId, memberId));
    }
    
    const result = await db.select().from(eventRegistrations).where(and(...conditions)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check duplicate registration:", error);
    return false;
  }
}

/**
 * 회차별 참가자 목록 조회
 */
export async function getRegistrationsByEvent(eventId: number): Promise<EventRegistration[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get registrations by event: database not available");
    return [];
  }

  try {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  } catch (error) {
    console.error("[Database] Failed to get registrations by event:", error);
    return [];
  }
}

/**
 * 멤버의 참가 내역 조회
 */
export async function getRegistrationsByMember(memberId: number): Promise<EventRegistration[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get registrations by member: database not available");
    return [];
  }

  try {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.memberId, memberId));
  } catch (error) {
    console.error("[Database] Failed to get registrations by member:", error);
    return [];
  }
}

/**
 * 전화번호로 멤버 프로필 검색
 */
export async function searchMemberByPhone(phone: string): Promise<MemberProfile | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search member by phone: database not available");
    return null;
  }

  try {
    const result = await db.select().from(memberProfiles).where(eq(memberProfiles.phone, phone)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to search member by phone:", error);
    return null;
  }
}

/**
 * 회차 상태 업데이트
 */
export async function updateEventStatus(eventId: number, status: "recruiting" | "recruiting_complete" | "ongoing" | "completed"): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update event status: database not available");
    return;
  }

  try {
    await db.update(events).set({ status }).where(eq(events.id, eventId));
  } catch (error) {
    console.error("[Database] Failed to update event status:", error);
    throw error;
  }
}

/**
 * 회차 정보 + 참가자 수 조회
 */
export async function getEventWithRegistrationCount(eventId: number): Promise<(Event & { registrationCount: number }) | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get event with registration count: database not available");
    return null;
  }

  try {
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (event.length === 0) return null;

    const registrations = await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
    return {
      ...event[0],
      registrationCount: registrations.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get event with registration count:", error);
    return null;
  }
}

/**
 * 상태별 회차 조회
 */
export async function getEventsByStatus(status: "recruiting" | "recruiting_complete" | "ongoing" | "completed"): Promise<Event[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get events by status: database not available");
    return [];
  }

  try {
    return await db.select().from(events).where(eq(events.status, status)).orderBy((e) => e.eventNumber);
  } catch (error) {
    console.error("[Database] Failed to get events by status:", error);
    return [];
  }
}

/**
 * userId로 멤버 프로필 조회
 */
export async function getMemberProfileByUserId(userId: number): Promise<MemberProfile | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get member profile by user id: database not available");
    return null;
  }

  try {
    const result = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get member profile by user id:", error);
    return null;
  }
}
