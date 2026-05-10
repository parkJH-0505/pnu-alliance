/**
 * 구글 시트 초기화 스크립트
 * 앱 시작 시 한 번만 실행되어 필요한 탭과 헤더를 생성합니다.
 */

import { initializeDatabase } from './googleSheetsDb';

export async function initializeGoogleSheetsOnStartup() {
  console.log('[Init] Starting Google Sheets initialization...');
  try {
    await initializeDatabase();
    console.log('[Init] ✅ Google Sheets initialized successfully');
  } catch (error) {
    console.error('[Init] ❌ Failed to initialize Google Sheets:', error);
    // 초기화 실패해도 서버는 계속 실행 (시트가 이미 있을 수 있음)
  }
}
