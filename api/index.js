// server/index.ts
import express from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
var SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";
var getGoogleAuth = () => {
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
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    }));
    await doc.loadInfo();
    return doc;
  } catch (error) {
    return null;
  }
}
var app = express();
app.use(express.json());
app.get("/api/events", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });
    const eventSheet = googleSheet.sheetsByTitle["이벤트"] || googleSheet.sheetsByTitle["Events"];
    if (!eventSheet) return res.json({ events: [] });
    const rows = await eventSheet.getRows();
    const events = rows.map((row) => ({
      id: row.get("회차") || "",
      title: row.get("제목") || "",
      date: row.get("날짜") || "",
      time: row.get("시간") || "",
      location: row.get("장소") || "",
      description: row.get("설명") || "",
      capacity: parseInt(row.get("정원") || "0"),
      registered: parseInt(row.get("신청자") || "0")
    })).filter((e) => e.id && e.title);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "이벤트 조회 실패" });
  }
});
app.post("/api/crew-register", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "구글 시트 연결 실패" });
    const { name, email, phone, graduationYear, major, company, position, industry, motivation, referral } = req.body;
    const crewSheet = googleSheet.sheetsByTitle["홈페이지_크루 등록"];
    if (!crewSheet) return res.status(500).json({ error: "신청 탭을 찾을 수 없습니다" });
    await crewSheet.addRow({
      "이름": name,
      "이메일": email,
      "연락처": phone,
      "졸업연도": graduationYear,
      "전공": major,
      "소속(회사/학교)": company,
      "직책/역할": position,
      "업계": industry,
      "합류 동기": motivation,
      "추천인": referral,
      "신청일시": new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      "상태": "검토중"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "크루 등록 실패" });
  }
});
var index_default = app;
export {
  index_default as default
};