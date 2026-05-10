// trigger redeploy 2026-05-11
import express from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Google Sheets 설정
const SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";

// 구글 서비스 계정 인증 정보
const getGoogleAuth = () => {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let serviceAccountJson: string | undefined;
  if (b64) {
    try {
      serviceAccountJson = Buffer.from(b64, "base64").toString("utf-8");
    } catch {
      return null;
    }
  } else {
    serviceAccountJson = raw;
  }
  if (!serviceAccountJson) return null;
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    return null;
  }
};

// private_key normalization: \\n → \n, \r 제거
function normalizePrivateKey(pk: string | undefined): string {
  return (pk || "")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");
}

// 구글 시트 문서 초기화
async function initializeGoogleSheet() {
  const serviceAccount = getGoogleAuth();
  if (!serviceAccount) return null;
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
      email: serviceAccount.client_email,
      key: normalizePrivateKey(serviceAccount.private_key),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }));
    await doc.loadInfo();
    return doc;
  } catch (error) {
    return null;
  }
}

// 한글/공백 정규화
function normalizeName(name: string): string {
  return (name || "").trim().replace(/\s+/g, "");
}

// 카드 응답 화이트리스트 — PII는 절대 미포함
function memberToPublic(row: any) {
  return {
    member_id: row.get("member_id") || "",
    name: row.get("이름") || "",
    graduationYear: row.get("학번") || "",
    major: row.get("전공") || "",
    company: row.get("회사") || "",
    position: row.get("직급") || "",
    industry: row.get("직군") || "",
    orbit: row.get("현재궤도") || "",
    introOneLiner: row.get("자기소개_한줄") || "",
    region: row.get("거주지역") || "",
    linkedinUrl: row.get("링크드인URL") || "",
  };
}

// EventRegistrations 시트 헤더 lazy init
const EVENT_REG_HEADERS = [
  "registration_id", "신청일시", "event_id", "member_id", "이름",
  "전화번호", "이메일", "인스타ID", "초대자_member_id", "초대자_텍스트",
  "동반참석여부", "동반자정보", "기대점", "의견", "상태", "입금여부",
];

async function ensureEventRegHeader(sheet: any) {
  try {
    await sheet.loadHeaderRow();
    if (!sheet.headerValues || sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(EVENT_REG_HEADERS);
    }
  } catch (e) {
    // 헤더 행 자체가 없는 경우
    await sheet.setHeaderRow(EVENT_REG_HEADERS);
  }
}

const app = express();
app.use(express.json());

// =============================================================================
// DIAG (임시): 환경변수 / 서비스 계정 / 시트 접근 단계별 진단
// =============================================================================
app.get("/api/_diag", async (req, res) => {
  const envRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";
  let parsed: any = null;
  let parseError = "";
  try { parsed = JSON.parse(envRaw); } catch (e: any) { parseError = e?.message || String(e); }

  const pk: string = parsed?.private_key || "";
  const pkNorm = normalizePrivateKey(pk);
  const result: any = {
    envPresent: !!envRaw,
    envLength: envRaw.length,
    envSourceB64: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64,
    parseable: !!parsed,
    parseError,
    serviceAccountEmail: parsed?.client_email || null,
    nodeVersion: process.version,
    pk: {
      origLength: pk.length,
      normLength: pkNorm.length,
      hasLiteralBackslashN: pk.includes("\\n"),
      hasRealNewline: pk.includes("\n"),
      hasCarriageReturn: pk.includes("\r"),
      startsWithBegin: pkNorm.startsWith("-----BEGIN"),
      endsWithEnd: pkNorm.trimEnd().endsWith("-----END PRIVATE KEY-----"),
      lineCount: pkNorm.split("\n").length,
    },
  };

  if (parsed) {
    try {
      const start = Date.now();
      const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
        email: parsed.client_email,
        key: pkNorm,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      }));
      await Promise.race([
        doc.loadInfo(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("loadInfo timeout 5s")), 5000)),
      ]);
      result.sheetAccessible = true;
      result.sheetTitle = (doc as any).title;
      result.sheetCount = (doc as any).sheetCount;
      result.loadInfoMs = Date.now() - start;
    } catch (e: any) {
      result.sheetAccessible = false;
      result.sheetError = e?.message || String(e);
    }
  }

  res.json(result);
});


// =============================================================================
// 1. Events 조회 (기존)
// =============================================================================
app.get("/api/events", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const eventSheet = googleSheet.sheetsByTitle["이벤트"] || googleSheet.sheetsByTitle["Events"];
    if (!eventSheet) return res.json({ events: [] });

    const rows = await eventSheet.getRows();
    const events = rows.map((row: any) => ({
      id: row.get("회차") || "",
      title: row.get("제목") || "",
      date: row.get("날짜") || "",
      time: row.get("시간") || "",
      location: row.get("장소") || "",
      description: row.get("설명") || "",
      capacity: parseInt(row.get("정원") || "0"),
      registered: parseInt(row.get("신청자") || "0"),
    })).filter((e: any) => e.id && e.title);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "이벤트 조회 실패" });
  }
});

// =============================================================================
// 2. 멤버 검색 (이름 정확 일치 → 카드 후보, 학번 빠른순)
// =============================================================================
app.post("/api/member-search", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "이름이 필요합니다" });
    }
    const normalized = normalizeName(name);
    if (normalized.length < 2) {
      return res.status(400).json({ error: "최소 2글자 이상 입력해주세요" });
    }

    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const memberSheet = googleSheet.sheetsByTitle["Members"];
    if (!memberSheet) return res.json({ candidates: [] });

    const rows = await memberSheet.getRows();
    const candidates = rows
      .filter((row: any) => normalizeName(row.get("이름") || "") === normalized)
      .map(memberToPublic)
      .sort((a: any, b: any) => {
        const ya = a.graduationYear === "" ? 99 : parseInt(a.graduationYear);
        const yb = b.graduationYear === "" ? 99 : parseInt(b.graduationYear);
        return ya - yb;
      });

    res.json({ candidates });
  } catch (error) {
    console.error("member-search error:", error);
    res.status(500).json({ error: "멤버 검색 실패" });
  }
});

// =============================================================================
// 3. 회차 참가 신청 (신규 멤버 자동 추가 + 마스터 갱신 옵션)
// =============================================================================
app.post("/api/event-register", async (req, res) => {
  try {
    const {
      eventId,
      memberId,
      isNewMember,
      isMasterUpdate,
      // 프로필
      name, graduationYear, major, company, position, industry,
      orbit, introOneLiner, region, linkedinUrl,
      // PII
      phone, email,
      // 회차별
      instagramId, referrerName, referrerMemberId,
      hasCompanion, companionInfo,
      expectations, comment,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "이름·전화번호는 필수입니다" });
    }

    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const memberSheet = googleSheet.sheetsByTitle["Members"];
    const eventRegSheet = googleSheet.sheetsByTitle["EventRegistrations"];
    if (!memberSheet) return res.status(500).json({ error: "Members 시트 누락" });
    if (!eventRegSheet) return res.status(500).json({ error: "EventRegistrations 시트 누락" });

    await ensureEventRegHeader(eventRegSheet);

    const today = new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();
    let resolvedMemberId = memberId || "";

    // 신규 → Members에 행 추가
    if (isNewMember) {
      const memberRows = await memberSheet.getRows();
      const maxId = memberRows.reduce((max: number, row: any) => {
        const id = (row.get("member_id") || "").replace(/^M/, "");
        const num = parseInt(id);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      resolvedMemberId = `M${String(maxId + 1).padStart(3, "0")}`;

      await memberSheet.addRow({
        "member_id": resolvedMemberId,
        "이름": name,
        "학번": graduationYear || "",
        "전공": major || "",
        "성별": "",
        "회사": company || "",
        "직급": position || "",
        "직군": industry || "",
        "거주지역": region || "",
        "자기소개_한줄": introOneLiner || "",
        "현재궤도": orbit || "",
        "링크드인URL": linkedinUrl || "",
        "전화번호": phone,
        "이메일": email || "",
        "유입경로": "웹폼-회차신청",
        "레퍼럴_member_id": referrerMemberId || "",
        "코어후보": "",
        "메모": referrerName ? `초대자(텍스트): ${referrerName}` : "",
        "1회참석": "-",
        "2회참석": "-",
        "3회참석": "-",
        "총참석횟수": "0",
        "첫등록일": today,
        "마지막참여일": "",
        "상태": "Active",
      });
    }
    // 기존 멤버 + 마스터 갱신 동의 → 빈 값으로 덮어쓰지 않고 변경 필드만
    else if (isMasterUpdate && memberId) {
      const memberRows = await memberSheet.getRows();
      const memberRow = memberRows.find((row: any) => row.get("member_id") === memberId);
      if (memberRow) {
        if (company) memberRow.set("회사", company);
        if (position) memberRow.set("직급", position);
        if (industry) memberRow.set("직군", industry);
        if (orbit) memberRow.set("현재궤도", orbit);
        if (region) memberRow.set("거주지역", region);
        if (introOneLiner) memberRow.set("자기소개_한줄", introOneLiner);
        if (linkedinUrl) memberRow.set("링크드인URL", linkedinUrl);
        if (phone) memberRow.set("전화번호", phone);
        if (email) memberRow.set("이메일", email);
        await memberRow.save();
      }
    }

    // EventRegistrations에 신청 추가
    const eventRegRows = await eventRegSheet.getRows();
    const maxRegId = eventRegRows.reduce((max: number, row: any) => {
      const id = (row.get("registration_id") || "").replace(/^R/, "");
      const num = parseInt(id);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newRegId = `R${String(maxRegId + 1).padStart(4, "0")}`;

    await eventRegSheet.addRow({
      "registration_id": newRegId,
      "신청일시": nowIso,
      "event_id": eventId || "4",
      "member_id": resolvedMemberId,
      "이름": name,
      "전화번호": phone,
      "이메일": email || "",
      "인스타ID": instagramId || "",
      "초대자_member_id": referrerMemberId || "",
      "초대자_텍스트": referrerName || "",
      "동반참석여부": hasCompanion ? "O" : "-",
      "동반자정보": companionInfo || "",
      "기대점": expectations || "",
      "의견": comment || "",
      "상태": "검토중",
      "입금여부": "-",
    });

    res.json({ success: true, registrationId: newRegId, memberId: resolvedMemberId });
  } catch (error: any) {
    console.error("event-register error:", error);
    res.status(500).json({ error: "신청 실패", detail: error?.message || "" });
  }
});

// =============================================================================
// 4. 크루 등록 (기존 - 멤버 합류 신청)
// =============================================================================
app.post("/api/crew-register", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const { name, email, phone, graduationYear, major, company, position, industry, motivation, referral } = req.body;

    const crewSheet =
      googleSheet.sheetsByTitle["크루 등록"] ||
      googleSheet.sheetsByTitle["신청현황"] ||
      googleSheet.sheetsByTitle["Crews"];
    if (!crewSheet) return res.status(500).json({ error: "신청 탭을 찾을 수 없습니다" });

    await crewSheet.addRow({
      "이름": name,
      "이메일": email,
      "연락처": phone,
      "졸업연도": graduationYear,
      "전공": major,
      "현재소속": company,
      "직책": position,
      "업계": industry,
      "합류동기": motivation,
      "추천인": referral,
      "신청일시": new Date().toISOString(),
      "상태": "검토중",
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "크루 등록 실패" });
  }
});

export default app;
