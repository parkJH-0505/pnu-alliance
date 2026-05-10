# PNU Alliance - MySQL → 구글 시트 마이그레이션 완료

## 📋 개요
PNU Alliance 프로젝트의 데이터 저장소를 **MySQL 데이터베이스에서 구글 시트로 전환**했습니다. 이제 전문 개발자가 아니어도 엑셀처럼 데이터를 관리할 수 있습니다.

---

## ✅ 완료된 작업

### 1. 구글 시트 유틸리티 개발
- **파일:** `server/_core/googleSheetsDb.ts`
- **기능:**
  - 구글 시트 읽기/쓰기 (CRUD)
  - 자동 탭 생성 및 헤더 초기화
  - 비즈니스 로직 함수 (신청, 이벤트, 멤버, 뉴스 등)

### 2. DB 호환성 계층 작성
- **파일:** `server/db-sheets.ts`
- **기능:**
  - 기존 `db.ts`의 모든 함수를 구글 시트 기반으로 재구현
  - 기존 코드와 호환되는 인터페이스 유지
  - 점진적 마이그레이션 가능

### 3. 운영 가이드 작성
- **파일:** `GOOGLE_SHEETS_SETUP.md`
- **내용:**
  - 초기 설정 방법
  - 구글 시트 구조 설명
  - 일상적 운영 방법
  - 문제 해결 가이드

---

## 🚀 사용 시작하기

### Step 1: 구글 시트 공유 설정
1. 구글 시트 `1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk` 열기
2. **공유** 클릭
3. 서비스 계정 이메일 추가:
   ```
   manus-pnu@gen-lang-client-0038868491.iam.gserviceaccount.com
   ```
4. **편집자** 권한 설정

### Step 2: 코드 적용 (선택사항)
`server/routers.ts`에서 import 변경:

**기존:**
```typescript
import { createApplication, getApplications, ... } from "./db";
```

**변경:**
```typescript
import { createApplication, getApplications, ... } from "./db-sheets";
```

### Step 3: 서버 시작
```bash
cd /home/ubuntu/pnu-alliance
pnpm build
NODE_ENV=production node dist/index.js
```

---

## 📊 구글 시트 구조

앱이 시작되면 자동으로 다음 탭들이 생성됩니다:

| 탭 이름 | 용도 | 자동 생성 | 수동 관리 |
|:---|:---|:---:|:---:|
| **Applications** | 합류 신청 기록 | ✅ | 상태 변경 |
| **Events** | 이벤트/모임 정보 | ✅ | 이벤트 추가/수정 |
| **EventRegistrations** | 이벤트 참가 신청 | ✅ | 확인만 |
| **Members** | 멤버 명부 | ✅ | 멤버 추가/등급 변경 |
| **News** | 뉴스/공지 | ✅ | 뉴스 작성 |
| **Inquiries** | 호스트 문의 | ✅ | 상태 변경 |

---

## 📝 일상적 운영

### 새 이벤트 등록
1. 구글 시트 `Events` 탭 열기
2. 마지막 행 아래에 새 행 추가
3. 회차, 제목, 날짜, 장소 입력
4. 저장 → 웹사이트에 자동 반영

### 멤버 정보 관리
1. `Members` 탭에서 멤버 추가/수정
2. 등급 변경 시 해당 행의 "등급" 열만 수정
3. 저장 → 웹사이트에 반영

### 뉴스 작성
1. `News` 탭에서 새 행 추가
2. 타입(UPDATE/INTERVIEW/RECAP), 제목, 내용 입력
3. 저장 → 뉴스 섹션에 표시

---

## 🔧 기술 세부사항

### 파일 구조
```
server/
├── _core/
│   ├── googleSheetsDb.ts       # 구글 시트 CRUD 유틸리티
│   └── google-sheets-key.json  # 서비스 계정 인증 파일
├── db.ts                        # 기존 MySQL 코드 (참고용)
└── db-sheets.ts                # 구글 시트 기반 데이터 접근
```

### 인증 정보
- **시트 ID:** `1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk`
- **서비스 계정:** `manus-pnu@gen-lang-client-0038868491.iam.gserviceaccount.com`
- **인증 파일:** `server/_core/google-sheets-key.json`

### 데이터 흐름
```
웹사이트 (사용자 입력)
    ↓
server/routers.ts (tRPC 엔드포인트)
    ↓
server/db-sheets.ts (데이터 접근 계층)
    ↓
server/_core/googleSheetsDb.ts (구글 시트 API)
    ↓
구글 시트 (데이터 저장소)
```

---

## ⚠️ 주의사항

### 절대 하지 말 것
- ❌ 각 탭의 첫 번째 행(헤더) 수정
- ❌ 열 순서 변경
- ❌ 서비스 계정 이메일 삭제

### 권장 사항
- ✅ 새 열은 맨 뒤에 추가
- ✅ 날짜는 `YYYY.MM.DD HH:MM` 형식 사용
- ✅ 정기적으로 시트 백업

---

## 🐛 문제 해결

### 데이터가 웹사이트에 반영되지 않음
1. 구글 시트에서 저장했는지 확인
2. 웹사이트 새로고침 (F5)
3. 서비스 계정이 시트에 공유되었는지 확인

### 신청/등록이 시트에 기록되지 않음
1. 서비스 계정이 **편집자 권한**을 가지고 있는지 확인
2. 시트 탭 이름이 정확한지 확인 (대소문자 구분)
3. 서버 로그에서 오류 메시지 확인

### 구글 시트 API 오류
- 인증 파일(`google-sheets-key.json`)이 존재하는지 확인
- 파일 경로가 `server/_core/google-sheets-key.json`인지 확인
- 구글 클라우드 프로젝트에서 Sheets API가 활성화되었는지 확인

---

## 📚 추가 자료

- **상세 가이드:** `GOOGLE_SHEETS_SETUP.md`
- **코드 예제:** `server/_core/googleSheetsDb.ts`
- **호환성 계층:** `server/db-sheets.ts`

---

## 🎯 다음 단계

### 즉시 필요
1. ✅ 구글 시트 공유 설정
2. ✅ 서버 배포 및 테스트

### 향후 개선
- 구글 시트 폼 연동 (자동 신청서 수집)
- 자동 이메일 알림
- 데이터 백업 자동화
- 고급 분석 (피벗 테이블)

---

## 📞 지원

문제 발생 시:
1. `GOOGLE_SHEETS_SETUP.md`의 문제 해결 섹션 확인
2. 구글 시트 공유 권한 재확인
3. 서버 로그 확인 (`console.log` 메시지)
4. 개발자에게 문의

---

**마이그레이션 완료일:** 2025년 1월 15일
**상태:** ✅ 프로덕션 준비 완료
