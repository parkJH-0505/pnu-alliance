/**
 * 구글 시트에 초기 테스트 데이터를 입력하는 스크립트
 * 
 * 실행 방법:
 * npx tsx scripts/seed-google-sheets.ts
 */

import {
  addEvent,
  addMember,
  addNews,
  getSheetData,
} from '../server/_core/googleSheetsDb';

async function seedData() {
  console.log('🌱 Starting to seed Google Sheets with initial data...\n');

  try {
    // 1. 이벤트 추가
    console.log('📅 Adding events...');
    await addEvent({
      eventNumber: 1,
      title: '첫 번째 모임 - PNU Alliance 출범식',
      date: '2025.01.20 19:00',
      location: '서울 강남구 (상세 위치는 참가자에게 별도 안내)',
      theme: '부산대 동문 네트워킹',
      description: '부산대 출신 동문들이 서울에서 만나 서로를 소개하고 네트워크를 구축하는 첫 번째 정기 모임입니다.',
      capacity: 50,
    });
    console.log('✅ Event 1 added\n');

    await addEvent({
      eventNumber: 2,
      title: '두 번째 모임 - 커리어 토크',
      date: '2025.02.17 19:00',
      location: '서울 강남구',
      theme: '커리어 경험 공유',
      description: '다양한 분야의 선배들이 자신의 커리어 경험을 공유하고 질의응답하는 시간입니다.',
      capacity: 50,
    });
    console.log('✅ Event 2 added\n');

    // 2. 멤버 추가
    console.log('👥 Adding members...');
    await addMember({
      name: '박준홍',
      jobTitle: '대표',
      company: 'PNU Alliance',
      phone: '010-1111-1111',
      bio: 'PNU Alliance 창립자. 부산대 졸업 후 서울에서 커리어를 시작했습니다.',
      tier: 'cosmos',
    });
    console.log('✅ Member: 박준홍 added\n');

    await addMember({
      name: '성현두',
      jobTitle: '공동 호스트',
      company: 'PNU Alliance',
      phone: '010-2222-2222',
      bio: 'PNU Alliance 공동 호스트. 스타트업 생태계에서 활동 중입니다.',
      tier: 'cosmos',
    });
    console.log('✅ Member: 성현두 added\n');

    // 3. 뉴스 추가
    console.log('📰 Adding news...');
    await addNews({
      type: 'UPDATE',
      title: 'PNU Alliance 공식 출범!',
      content: '부산대학교 동문들이 서울에서 만나 네트워크를 구축하는 PNU Alliance가 공식 출범했습니다. 첫 모임은 1월 20일에 개최될 예정입니다.',
      excerpt: 'PNU Alliance가 공식 출범했습니다. 첫 모임은 1월 20일입니다.',
      author: '박준홍',
      publishedAt: '2025.01.15',
    });
    console.log('✅ News 1 added\n');

    await addNews({
      type: 'RECAP',
      title: '첫 모임 후기 - 40명이 함께했습니다',
      content: '1월 20일 첫 모임에는 40명이 넘는 부산대 동문들이 참석했습니다. 많은 분들이 좋은 에너지를 나누었습니다.',
      excerpt: '첫 모임에 40명이 참석했습니다.',
      author: '성현두',
      publishedAt: '2025.01.22',
    });
    console.log('✅ News 2 added\n');

    // 4. 데이터 확인
    console.log('📊 Verifying data...\n');
    const events = await getSheetData('Events', 'A2:H');
    console.log(`✅ Events in sheet: ${events?.length || 0} rows`);

    const members = await getSheetData('Members', 'A2:G');
    console.log(`✅ Members in sheet: ${members?.length || 0} rows`);

    const news = await getSheetData('News', 'A2:G');
    console.log(`✅ News in sheet: ${news?.length || 0} rows`);

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
