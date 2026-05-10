import express from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Google Sheets 설정
const SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";

// 구글 서비스 계정 인증 정보
const getGoogleAuth = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return null;
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    return null;
  }
};

// 구글 시트 문서 초기화
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

// 1. 이벤트 데이터 조회
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

// 2. 크루 등록
app.post("/api/crew-register", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });

    const { name, email, phone, graduationYear, major, company, position, industry, motivation, referral } = req.body;

    const crewSheet = googleSheet.sheetsByTitle["신청현황"] || googleSheet.sheetsByTitle["Crews"];
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
