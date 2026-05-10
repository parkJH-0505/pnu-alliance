import express from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Google Sheets 설정
const SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";

// 검색·prefill 응답 화이트리스트 — PII(전화·이메일·메모·코어후보·유입경로·레퍼럴·참석기록·LinkedIn·성별)는 절대 노출되지 않음
const MEMBER_PUBLIC_FIELDS = [
  "member_id",
  "이름",
  "학번",
  "전공",
  "회사",
  "직급",
  "직군",
  "현재궤도",
  "거주지역",
  "자기소개_한줄",
];

function normalizeName(s: string): string {
  return (s || "").trim().replace(/\s+/g, "");
}

const getGoogleAuth = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return null;
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    return null;
  }
};

async function initializeGoogleSheet() {
  const serviceAccount = getGoogleAuth();
  if (!serviceAccount) return null;
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }));
    await doc.loadInfo();
    return doc;
  } catch (error) {
    return null;
  }
}

const app = express();
app.use(express.json());

// 1. 이벤트 조회
app.get("/api/events", async (_req, res) => {
  try {
    const doc = await initializeGoogleSheet();
    if (!doc) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const eventSheet = doc.sheetsByTitle["이벤트"] || doc.sheetsByTitle["Events"];
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
  } catch (error: any) {
    res.status(500).json({ error: "이벤트 조회 실패", detail: error?.message });
  }
});

// 2. 멤버 합류 신청 (Applications 시트 — 호스트 검토 큐)
app.post("/api/crew-register", async (req, res) => {
  try {
    const doc = await initializeGoogleSheet();
    if (!doc) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const { name, email, phone, graduationYear, major, company, position, industry, motivation } = req.body;
    if (!name || !email) return res.status(400).json({ error: "이름과 이메일은 필수입니다" });

    const sheet = doc.sheetsByTitle["Applications"];
    if (!sheet) return res.status(500).json({ error: "Applications 시트를 찾을 수 없습니다" });

    await sheet.addRow({
      "신청일시": new Date().toISOString(),
      "이름": name,
      "이메일": email,
      "전화번호": phone || "",
      "졸업년도": graduationYear || "",
      "전공": major || "",
      "회사": company || "",
      "직급": position || "",
      "직군": industry || "",
      "동기": motivation || "",
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "합류 신청 실패", detail: error?.message });
  }
});

// 3. 멤버 검색 (이름 → 카드 후보, 화이트리스트만 응답)
app.post("/api/member-search", async (req, res) => {
  try {
    const doc = await initializeGoogleSheet();
    if (!doc) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "이름을 입력해주세요" });
    }

    const target = normalizeName(name);
    if (target.length < 2) return res.json({ candidates: [] });

    const sheet = doc.sheetsByTitle["Members"];
    if (!sheet) return res.status(500).json({ error: "Members 시트를 찾을 수 없습니다" });

    const rows = await sheet.getRows();
    const candidates = rows
      .filter((row: any) => normalizeName(row.get("이름")) === target)
      .map((row: any) => {
        const o: Record<string, string> = {};
        for (const f of MEMBER_PUBLIC_FIELDS) o[f] = String(row.get(f) || "");
        return o;
      })
      // 학번 빠른 순 (시니어 상단)
      .sort((a, b) => (parseInt(a["학번"]) || 99) - (parseInt(b["학번"]) || 99));

    res.json({ candidates });
  } catch (error: any) {
    res.status(500).json({ error: "멤버 검색 실패", detail: error?.message });
  }
});

// 4. 행사 신청 (EventRegistrations 추가 + 신규면 Members 자동 등록, 갱신 동의 시 Members 동기화)
app.post("/api/event-register", async (req, res) => {
  try {
    const doc = await initializeGoogleSheet();
    if (!doc) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const {
      eventId, memberId, isNew,
      name, graduationYear, major, gender,
      company, position, industry, region, bio, currentTier,
      phone, email,
      instaId, referrerMemberId, companion, expectations,
      updateMaster,
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "이름·전화번호·이메일은 필수입니다" });
    }

    const memSheet = doc.sheetsByTitle["Members"];
    const regSheet = doc.sheetsByTitle["EventRegistrations"];
    if (!memSheet || !regSheet) {
      return res.status(500).json({ error: "필수 시트(Members/EventRegistrations) 없음" });
    }

    const today = new Date().toISOString().slice(0, 10);
    let resolvedMemberId = memberId || "";

    if (isNew || !memberId) {
      // 신규 → Members 자동 추가
      const allRows = await memSheet.getRows();
      const lastN = allRows
        .map((r: any) => String(r.get("member_id") || ""))
        .filter((id: string) => /^M\d+$/.test(id))
        .map((id: string) => parseInt(id.slice(1), 10))
        .reduce((mx: number, n: number) => Math.max(mx, n), 0);
      resolvedMemberId = "M" + String(lastN + 1).padStart(3, "0");

      await memSheet.addRow({
        "member_id": resolvedMemberId,
        "이름": name,
        "학번": String(graduationYear || ""),
        "전공": major || "",
        "성별": gender || "",
        "회사": company || "",
        "직급": position || "",
        "직군": industry || "",
        "거주지역": region || "",
        "자기소개_한줄": bio || "",
        "현재궤도": currentTier || "",
        "전화번호": phone,
        "이메일": email,
        "유입경로": "웹폼",
        "레퍼럴_member_id": referrerMemberId || "",
        "첫등록일": today,
        "마지막참여일": today,
        "상태": "Active",
      });
    } else if (updateMaster) {
      // 기존 + 갱신 동의 → Members 일부 필드 갱신
      const allRows = await memSheet.getRows();
      const target = allRows.find((r: any) => r.get("member_id") === memberId);
      if (target) {
        if (company) target.set("회사", company);
        if (position) target.set("직급", position);
        if (industry) target.set("직군", industry);
        if (currentTier) target.set("현재궤도", currentTier);
        if (region) target.set("거주지역", region);
        if (bio) target.set("자기소개_한줄", bio);
        if (phone) target.set("전화번호", phone);
        if (email) target.set("이메일", email);
        target.set("마지막참여일", today);
        await target.save();
      }
    } else {
      // 기존 + 갱신 미동의 → 마지막참여일만 갱신
      const allRows = await memSheet.getRows();
      const target = allRows.find((r: any) => r.get("member_id") === memberId);
      if (target) {
        target.set("마지막참여일", today);
        await target.save();
      }
    }

    // EventRegistrations 추가
    await regSheet.addRow({
      "신청일시": new Date().toISOString(),
      "이벤트ID": String(eventId || ""),
      "신청자_member_id": resolvedMemberId,
      "이름": name,
      "회사": company || "",
      "전화번호": phone,
      "이메일": email,
      "신청자타입": isNew ? "신규" : "기존",
      "인스타ID": instaId || "",
      "초대자_member_id": referrerMemberId || "",
      "동반자정보": companion || "",
      "기대점": expectations || "",
      "상태": "검토중",
    });

    res.json({ success: true, memberId: resolvedMemberId });
  } catch (error: any) {
    console.error("event-register:", error);
    res.status(500).json({ error: "행사 신청 실패", detail: error?.message });
  }
});

export default app;
