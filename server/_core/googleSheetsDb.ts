import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const SHEET_ID = '1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk';
const KEY_FILE_PATH = path.join(process.cwd(), 'server/_core/google-sheets-key.json');

let sheetsApi: any = null;

async function initializeSheets() {
  if (sheetsApi) return sheetsApi;
  try {
    if (!fs.existsSync(KEY_FILE_PATH)) {
      console.warn('[GoogleSheetsDb] Key file not found:', KEY_FILE_PATH);
      return null;
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ],
    });
    sheetsApi = google.sheets({ version: 'v4', auth });
    console.log('[GoogleSheetsDb] API initialized successfully');
    return sheetsApi;
  } catch (error) {
    console.error('[GoogleSheetsDb] Failed to initialize:', error);
    return null;
  }
}

// ===== 헬퍼 함수 =====
/**
 * 시트 탭이 존재하는지 확인하고 없으면 생성
 */
async function ensureSheetTab(tabName: string): Promise<boolean> {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return false;

    // 현재 시트 목록 조회
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (s: any) => s.properties?.title === tabName
    );

    if (!sheetExists) {
      // 탭 생성
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName,
                },
              },
            },
          ],
        },
      });
      console.log(`[GoogleSheetsDb] Created tab: ${tabName}`);
    }
    return true;
  } catch (error) {
    console.error(`[GoogleSheetsDb] Failed to ensure tab ${tabName}:`, error);
    return false;
  }
}

/**
 * 시트 데이터 읽기
 */
export async function getSheetData(tabName: string, range?: string) {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return null;

    const fullRange = range ? `'${tabName}'!${range}` : `'${tabName}'`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: fullRange,
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`[GoogleSheetsDb] Failed to read ${tabName}:`, error);
    return null;
  }
}

/**
 * 시트에 행 추가
 */
export async function appendRow(tabName: string, values: any[]) {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return false;

    await ensureSheetTab(tabName);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${tabName}'!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    console.log(`[GoogleSheetsDb] Row appended to ${tabName}`);
    return true;
  } catch (error) {
    console.error(`[GoogleSheetsDb] Failed to append to ${tabName}:`, error);
    return false;
  }
}

/**
 * 시트 데이터 업데이트 (특정 범위)
 */
export async function updateRange(tabName: string, range: string, values: any[]) {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return false;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${tabName}'!${range}`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`[GoogleSheetsDb] Updated ${tabName}!${range}`);
    return true;
  } catch (error) {
    console.error(`[GoogleSheetsDb] Failed to update ${tabName}:`, error);
    return false;
  }
}

/**
 * 시트 초기화 (헤더 추가)
 */
export async function initializeSheet(tabName: string, headers: string[]) {
  try {
    const sheets = await initializeSheets();
    if (!sheets) return false;

    await ensureSheetTab(tabName);

    // 기존 데이터 확인
    const existing = await getSheetData(tabName, 'A1:Z1');
    if (existing && existing.length > 0 && existing[0].length > 0) {
      console.log(`[GoogleSheetsDb] Tab ${tabName} already has headers`);
      return true;
    }

    // 헤더 추가
    await updateRange(tabName, 'A1:Z1', [headers]);
    console.log(`[GoogleSheetsDb] Initialized tab ${tabName} with headers`);
    return true;
  } catch (error) {
    console.error(`[GoogleSheetsDb] Failed to initialize ${tabName}:`, error);
    return false;
  }
}

// ===== 비즈니스 로직 =====

/**
 * 합류 신청 추가
 */
export async function addApplication(data: {
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
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    now,
    data.name,
    data.email,
    data.phone,
    data.graduationYear || '',
    data.major || '',
    data.company || '',
    data.position || '',
    data.industry || '',
    data.motivation || '',
  ];

  return await appendRow('Applications', row);
}

/**
 * 이벤트 추가
 */
export async function addEvent(data: {
  eventNumber: number;
  title: string;
  date: string;
  location: string;
  theme?: string;
  description?: string;
  capacity?: number;
}) {
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    data.eventNumber,
    data.title,
    data.date,
    data.location,
    data.theme || '',
    data.description || '',
    data.capacity || 0,
    now,
  ];

  return await appendRow('Events', row);
}

/**
 * 이벤트 참가 신청 추가
 */
export async function addEventRegistration(data: {
  eventId: number;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  registrationType: 'existing_member' | 'new_participant';
}) {
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    now,
    data.eventId,
    data.name,
    data.company || '',
    data.phone,
    data.email || '',
    data.registrationType === 'existing_member' ? '기존멤버' : '신규참가자',
  ];

  return await appendRow('EventRegistrations', row);
}

/**
 * 멤버 추가
 */
export async function addMember(data: {
  name: string;
  jobTitle?: string;
  company?: string;
  phone: string;
  bio?: string;
  tier?: string;
}) {
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    data.name,
    data.jobTitle || '',
    data.company || '',
    data.phone,
    data.bio || '',
    data.tier || 'ground-crew',
    now,
  ];

  return await appendRow('Members', row);
}

/**
 * 뉴스 추가
 */
export async function addNews(data: {
  type: 'UPDATE' | 'INTERVIEW' | 'RECAP';
  title: string;
  content?: string;
  excerpt?: string;
  author?: string;
  publishedAt: string;
}) {
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    now,
    data.type,
    data.title,
    data.content || '',
    data.excerpt || '',
    data.author || '',
    data.publishedAt,
  ];

  return await appendRow('News', row);
}

/**
 * 문의 추가
 */
export async function addInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  content: string;
}) {
  const now = new Date().toLocaleString('ko-KR');
  const row = [
    now,
    data.name,
    data.email,
    data.phone || '',
    data.content,
    'pending',
  ];

  return await appendRow('Inquiries', row);
}

/**
 * 모든 이벤트 조회
 */
export async function getAllEvents() {
  const data = await getSheetData('Events', 'A2:H');
  if (!data) return [];

  return data.map((row: any[]) => ({
    eventNumber: parseInt(row[0]) || 0,
    title: row[1] || '',
    date: row[2] || '',
    location: row[3] || '',
    theme: row[4] || '',
    description: row[5] || '',
    capacity: parseInt(row[6]) || 0,
    createdAt: row[7] || '',
  }));
}

/**
 * 모든 멤버 조회
 */
export async function getAllMembers() {
  const data = await getSheetData('Members', 'A2:G');
  if (!data) return [];

  return data.map((row: any[]) => ({
    name: row[0] || '',
    jobTitle: row[1] || '',
    company: row[2] || '',
    phone: row[3] || '',
    bio: row[4] || '',
    tier: row[5] || 'ground-crew',
    createdAt: row[6] || '',
  }));
}

/**
 * 모든 뉴스 조회
 */
export async function getAllNews() {
  const data = await getSheetData('News', 'A2:G');
  if (!data) return [];

  return data.map((row: any[]) => ({
    createdAt: row[0] || '',
    type: row[1] || '',
    title: row[2] || '',
    content: row[3] || '',
    excerpt: row[4] || '',
    author: row[5] || '',
    publishedAt: row[6] || '',
  }));
}

/**
 * 모든 합류 신청 조회
 */
export async function getAllApplications() {
  const data = await getSheetData('Applications', 'A2:J');
  if (!data) return [];

  return data.map((row: any[]) => ({
    createdAt: row[0] || '',
    name: row[1] || '',
    email: row[2] || '',
    phone: row[3] || '',
    graduationYear: row[4] || '',
    major: row[5] || '',
    company: row[6] || '',
    position: row[7] || '',
    industry: row[8] || '',
    motivation: row[9] || '',
  }));
}

/**
 * 시트 초기 설정 (앱 시작 시 호출)
 */
export async function initializeDatabase() {
  console.log('[GoogleSheetsDb] Initializing database structure...');

  await initializeSheet('Applications', [
    '신청일시',
    '이름',
    '이메일',
    '전화번호',
    '졸업년도',
    '전공',
    '회사',
    '직급',
    '직군',
    '동기',
  ]);

  await initializeSheet('Events', [
    '회차',
    '제목',
    '날짜',
    '장소',
    '테마',
    '설명',
    '정원',
    '생성일시',
  ]);

  await initializeSheet('EventRegistrations', [
    '신청일시',
    '이벤트ID',
    '이름',
    '회사',
    '전화번호',
    '이메일',
    '신청자타입',
  ]);

  await initializeSheet('Members', [
    '이름',
    '직급',
    '회사',
    '전화번호',
    '소개',
    '등급',
    '생성일시',
  ]);

  await initializeSheet('News', [
    '생성일시',
    '타입',
    '제목',
    '내용',
    '요약',
    '작성자',
    '발행일시',
  ]);

  await initializeSheet('Inquiries', [
    '생성일시',
    '이름',
    '이메일',
    '전화번호',
    '내용',
    '상태',
  ]);

  console.log('[GoogleSheetsDb] Database structure initialized');
}
