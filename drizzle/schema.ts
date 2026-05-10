import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 합류 신청 테이블
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  graduationYear: varchar("graduationYear", { length: 4 }),
  major: varchar("major", { length: 255 }),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  motivation: text("motivation"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  tier: mysqlEnum("tier", ["ground-crew", "launcher", "rocket", "orbiter", "galaxy", "cosmos"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * 멤버 프로필 테이블
 */
export const memberProfiles = mysqlTable("memberProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  applicationId: int("applicationId"),
  name: varchar("name", { length: 255 }),
  jobTitle: varchar("jobTitle", { length: 255 }),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 20 }).unique(), // 검증 키
  bio: text("bio"),
  tier: mysqlEnum("tier", ["ground-crew", "launcher", "rocket", "orbiter", "galaxy", "cosmos"]).default("ground-crew").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;

/**
 * 이벤트 테이블 (회차별 이벤트)
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  eventNumber: int("eventNumber").notNull().unique(), // 회차 번호 (1, 2, 3, 4...)
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }).notNull(), // 행사 장소
  theme: varchar("theme", { length: 255 }), // 행사 테마/주제
  description: text("description"), // 상세 설명
  capacity: int("capacity").default(0), // 정원
  status: mysqlEnum("status", ["recruiting", "recruiting_complete", "ongoing", "completed"]).default("recruiting").notNull(), // 모집중/모집완료/진행중/종료
  googleSheetTabId: varchar("googleSheetTabId", { length: 255 }), // 구글시트 탭 ID
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * 이벤트 참가 신청 테이블
 */
export const eventRegistrations = mysqlTable("eventRegistrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  memberId: int("memberId"), // NULL이면 신규 참가자
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  additionalInfo: text("additionalInfo"),
  registrationType: mysqlEnum("registrationType", ["existing_member", "new_participant"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

/**
 * 갤러리 이미지 테이블
 */
export const galleryImages = mysqlTable("galleryImages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

/**
 * 뉴스 테이블
 */
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["UPDATE", "INTERVIEW", "RECAP"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  excerpt: varchar("excerpt", { length: 500 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  imageKey: varchar("imageKey", { length: 255 }),
  author: varchar("author", { length: 255 }),
  publishedAt: timestamp("publishedAt").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

/**
 * 호스트 문의 테이블
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "answered", "closed"]).default("pending").notNull(),
  response: text("response"),
  respondedBy: int("respondedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;
