import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// 구글시트 API 초기화
let sheetsApi: any = null;
const SHEET_ID = '1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk';
const KEY_FILE_PATH = path.join(process.cwd(), 'gen-lang-client-0038868491-8cd68d6bc4aa.json');

async function initializeSheets() {
  if (sheetsApi) return sheetsApi;

  try {
    if (!fs.existsSync(KEY_FILE_PATH)) {
      console.warn('[GoogleSheets] Key file not found:', KEY_FILE_PATH);
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsApi = google.sheets({ version: 'v4', auth });
    console.log('[GoogleSheets] API initialized successfully');
    return sheetsApi;
  } catch (error) {
    console.error('[GoogleSheets] Failed to initialize:', error);
    return null;
  }
}

/**
 * 새로운 탭 생성
 * @param eventNumber 회차 번호
 * @returns 생성된 탭 ID
 */
export async function createSheetTab(eventNumber: number): Promise<string | null> {
  try {
    const sheets = await initializeSheets();
    if (!sheets) {
      console.warn('[GoogleSheets] API not available');
      return null;
    }

    const tabTitle = `${eventNumber}회차`;

    // 새 탭 생성
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: tabTitle,
              },
            },
          },
        ],
      },
    });

    const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (!sheetId && sheetId !== 0) {
      throw new Error('Failed to get sheet ID from response');
    }

    // 헤더 행 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${tabTitle}'!A1:G1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['신청일시', '이름', '직장명', '전화번호', '이메일', '추가정보', '신청자타입'],
        ],
      },
    });

    console.log(`[GoogleSheets] Tab created: ${tabTitle} (ID: ${sheetId})`);
    return String(sheetId);
  } catch (error) {
    console.error('[GoogleSheets] Failed to create sheet tab:', error);
    return null;
  }
}

/**
 * 신청 정보를 구글시트에 기록
 * @param eventNumber 회차 번호
 * @param data 신청자 정보
 */
export async function appendRegistrationRow(
  eventNumber: number,
  data: {
    name: string;
    company?: string;
    phone: string;
    email?: string;
    additionalInfo?: string;
    registrationType: 'existing_member' | 'new_participant';
  }
): Promise<boolean> {
  try {
    const sheets = await initializeSheets();
    if (!sheets) {
      console.warn('[GoogleSheets] API not available');
      return false;
    }

    const tabTitle = `${eventNumber}회차`;
    const now = new Date().toLocaleString('ko-KR');

    const row = [
      now,
      data.name,
      data.company || '',
      data.phone,
      data.email || '',
      data.additionalInfo || '',
      data.registrationType === 'existing_member' ? '기존멤버' : '신규참가자',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${tabTitle}'!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log(`[GoogleSheets] Row appended to ${tabTitle}`);
    return true;
  } catch (error) {
    console.error('[GoogleSheets] Failed to append row:', error);
    return false;
  }
}

/**
 * 마스터 시트 업데이트
 * @param eventNumber 회차 번호
 * @param eventDate 행사 일시
 * @param location 행사 장소
 * @param theme 행사 테마
 */
export async function updateMasterSheet(
  eventNumber: number,
  eventDate: string,
  location: string,
  theme: string
): Promise<boolean> {
  try {
    const sheets = await initializeSheets();
    if (!sheets) {
      console.warn('[GoogleSheets] API not available');
      return false;
    }

    const now = new Date().toLocaleString('ko-KR');
    const row = [eventNumber, eventDate, location, theme, now];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Master!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log(`[GoogleSheets] Master sheet updated with event ${eventNumber}`);
    return true;
  } catch (error) {
    console.error('[GoogleSheets] Failed to update master sheet:', error);
    return false;
  }
}
