/**
 * db-sheets.ts
 * 구글 시트 기반 데이터 관리 (MySQL 대체)
 * 
 * 사용 방법:
 * 1. server/_core/index.ts에서 import { initializeDatabase } from './_core/googleSheetsDb'
 * 2. 앱 시작 시 await initializeDatabase() 호출
 * 3. 기존 db.ts 대신 이 파일의 함수들 사용
 */

import {
  addApplication,
  addEvent,
  addEventRegistration,
  addMember,
  addNews,
  addInquiry,
  getAllEvents,
  getAllMembers,
  getAllNews,
  getAllApplications,
  getSheetData,
} from './_core/googleSheetsDb';

// ===== Applications (합류 신청) =====

export async function createApplication(data: {
  name: string;
  email: string;
  phone: string;
  graduationYear?: string;
  major?: string;
  company?: string;
  position?: string;
  industry?: string;
  motivation?: string;
}) {
  const success = await addApplication(data);
  if (!success) throw new Error('Failed to create application');
  
  return {
    id: Date.now(), // 시트에서는 타임스탬프 사용
    name: data.name,
    email: data.email,
    phone: data.phone,
    graduationYear: data.graduationYear,
    major: data.major,
    company: data.company,
    position: data.position,
    industry: data.industry,
    motivation: data.motivation,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getApplications(status?: string) {
  const apps = await getAllApplications();
  return apps.map((app: any, idx: number) => ({
    id: idx,
    ...app,
    status: 'pending',
    updatedAt: app.createdAt,
  }));
}

export async function updateApplicationStatus(id: number, status: string) {
  // 시트에서 직접 수정하도록 안내
  console.log(`[DB] Application ${id} status update to ${status} - please update in Google Sheet manually`);
  return true;
}

// ===== Events (이벤트) =====

export async function createEvent(data: {
  eventNumber: number;
  title: string;
  date: string;
  location: string;
  theme?: string;
  description?: string;
  capacity?: number;
}) {
  const success = await addEvent(data);
  if (!success) throw new Error('Failed to create event');

  return {
    id: data.eventNumber,
    eventNumber: data.eventNumber,
    title: data.title,
    date: new Date(data.date),
    location: data.location,
    theme: data.theme,
    description: data.description,
    capacity: data.capacity || 0,
    status: 'recruiting',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getEvents() {
  const events = await getAllEvents();
  return events.map((evt: any) => ({
    id: evt.eventNumber,
    ...evt,
    date: new Date(evt.date),
    status: 'recruiting',
    createdAt: new Date(evt.createdAt),
    updatedAt: new Date(evt.createdAt),
  }));
}

export async function getEventsByStatus(status: string) {
  const events = await getEvents();
  return events; // 시트에서는 모든 이벤트 반환 (필터링은 클라이언트에서)
}

export async function getEventWithRegistrationCount(eventId: number) {
  const events = await getEvents();
  const event = events.find((e: any) => e.id === eventId);
  
  if (!event) return null;

  const registrations = await getSheetData('EventRegistrations', 'A2:G');
  const count = registrations?.filter((r: any) => parseInt(r[1]) === eventId).length || 0;

  return {
    ...event,
    registrationCount: count,
  };
}

export async function updateEvent(id: number, data: any) {
  console.log(`[DB] Event ${id} update - please update in Google Sheet manually`);
  return true;
}

export async function deleteEvent(id: number) {
  console.log(`[DB] Event ${id} delete - please delete in Google Sheet manually`);
  return true;
}

export async function updateEventStatus(id: number, status: string) {
  console.log(`[DB] Event ${id} status update to ${status} - please update in Google Sheet manually`);
  return true;
}

// ===== Event Registrations =====

export async function createEventRegistration(data: {
  eventId: number;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  registrationType: 'existing_member' | 'new_participant';
}) {
  const success = await addEventRegistration(data);
  if (!success) throw new Error('Failed to create registration');

  return {
    id: Date.now(),
    eventId: data.eventId,
    name: data.name,
    company: data.company,
    phone: data.phone,
    email: data.email,
    registrationType: data.registrationType,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function checkDuplicateRegistration(eventId: number, phone: string) {
  const registrations = await getSheetData('EventRegistrations', 'A2:G');
  if (!registrations) return false;

  return registrations.some((r: any) => 
    parseInt(r[1]) === eventId && r[4] === phone
  );
}

export async function getRegistrationsByEvent(eventId: number) {
  const registrations = await getSheetData('EventRegistrations', 'A2:G');
  if (!registrations) return [];

  return registrations
    .filter((r: any) => parseInt(r[1]) === eventId)
    .map((r: any) => ({
      id: Math.random(),
      eventId: parseInt(r[1]),
      name: r[2],
      company: r[3],
      phone: r[4],
      email: r[5],
      registrationType: r[6] === '기존멤버' ? 'existing_member' : 'new_participant',
      createdAt: new Date(r[0]),
    }));
}

export async function getRegistrationsByMember(memberId: number) {
  const registrations = await getSheetData('EventRegistrations', 'A2:G');
  return registrations || [];
}

// ===== Members =====

export async function createMemberProfile(data: {
  name: string;
  jobTitle?: string;
  company?: string;
  phone: string;
  bio?: string;
  tier?: string;
}) {
  const success = await addMember(data);
  if (!success) throw new Error('Failed to create member');

  return {
    id: Date.now(),
    userId: 0,
    name: data.name,
    jobTitle: data.jobTitle,
    company: data.company,
    phone: data.phone,
    bio: data.bio,
    tier: data.tier || 'ground-crew',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getMemberProfiles() {
  const members = await getAllMembers();
  return members.map((m: any, idx: number) => ({
    id: idx,
    userId: 0,
    ...m,
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.createdAt),
  }));
}

export async function getMemberProfileByUserId(userId: number) {
  const members = await getMemberProfiles();
  return members.find((m: any) => m.userId === userId);
}

export async function searchMemberByPhone(phone: string) {
  const members = await getMemberProfiles();
  return members.find((m: any) => m.phone === phone);
}

// ===== News =====

export async function createNews(data: {
  type: 'UPDATE' | 'INTERVIEW' | 'RECAP';
  title: string;
  content?: string;
  excerpt?: string;
  author?: string;
  publishedAt: string;
}) {
  const success = await addNews(data);
  if (!success) throw new Error('Failed to create news');

  return {
    id: Date.now(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getNews() {
  const news = await getAllNews();
  return news.map((n: any, idx: number) => ({
    id: idx,
    ...n,
    createdAt: new Date(n.createdAt),
    updatedAt: new Date(n.createdAt),
    publishedAt: new Date(n.publishedAt),
  }));
}

export async function deleteNews(id: number) {
  console.log(`[DB] News ${id} delete - please delete in Google Sheet manually`);
  return true;
}

// ===== Gallery Images =====

export async function createGalleryImage(data: any) {
  console.log('[DB] Gallery image creation - use S3 storage directly');
  return { id: Date.now(), ...data };
}

export async function getGalleryImages() {
  return [];
}

export async function deleteGalleryImage(id: number) {
  console.log(`[DB] Gallery image ${id} delete`);
  return true;
}

// ===== Inquiries =====

export async function createInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  content: string;
}) {
  const success = await addInquiry(data);
  if (!success) throw new Error('Failed to create inquiry');

  return {
    id: Date.now(),
    ...data,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getInquiries() {
  const inquiries = await getSheetData('Inquiries', 'A2:F');
  if (!inquiries) return [];

  return inquiries.map((i: any, idx: number) => ({
    id: idx,
    createdAt: new Date(i[0]),
    name: i[1],
    email: i[2],
    phone: i[3],
    content: i[4],
    status: i[5] || 'pending',
    updatedAt: new Date(i[0]),
  }));
}

export async function updateInquiry(id: number, data: any) {
  console.log(`[DB] Inquiry ${id} update - please update in Google Sheet manually`);
  return true;
}

// ===== Users (인증 관련) =====

export async function upsertUser(user: any) {
  console.log('[DB] User upsert - using OAuth session only');
  return user;
}

export async function getUserByOpenId(openId: string) {
  console.log('[DB] User lookup by OpenId');
  return undefined;
}
