import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheets 설정
const SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";

// 구글 서비스 계정 인증 정보 (환경 변수에서 로드)
const getGoogleAuth = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("⚠️  GOOGLE_SERVICE_ACCOUNT_JSON 환경 변수가 설정되지 않았습니다.");
    return null;
  }
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error("❌ 구글 서비스 계정 JSON 파싱 오류:", error);
    return null;
  }
};

// 구글 시트 문서 초기화
async function initializeGoogleSheet() {
  const serviceAccount = getGoogleAuth();
  if (!serviceAccount) {
    console.warn("⚠️  구글 시트 초기화 실패: 서비스 계정 정보 없음");
    return null;
  }

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }));

    await doc.loadInfo();
    console.log("✅ 구글 시트 연결 성공:", doc.title);
    return doc;
  } catch (error) {
    console.error("❌ 구글 시트 초기화 오류:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS 설정
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // 구글 시트 초기화
  let googleSheet = await initializeGoogleSheet();

  // ===== API 엔드포인트 =====

  // 1. 이벤트 데이터 조회
  app.get("/api/events", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }

      if (!googleSheet) {
        return res.status(500).json({ error: "구글 시트 연결 실패" });
      }

      // '이벤트' 탭 찾기
      const eventSheet = googleSheet.sheetsByTitle["이벤트"] || googleSheet.sheetsByTitle["Events"];
      if (!eventSheet) {
        console.warn("⚠️  '이벤트' 탭을 찾을 수 없습니다. 사용 가능한 탭:", Object.keys(googleSheet.sheetsByTitle));
        return res.json({ events: [] });
      }

      await eventSheet.loadCells();
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

      console.log(`✅ 이벤트 ${events.length}개 로드됨`);
      res.json({ events });
    } catch (error) {
      console.error("❌ 이벤트 조회 오류:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "이벤트 조회 실패" });
    }
  });

  // 2. 크루 등록 (폼 제출)
  app.post("/api/crew-register", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }

      if (!googleSheet) {
        return res.status(500).json({ error: "구글 시트 연결 실패" });
      }

      const {
        name,
        email,
        phone,
        graduationYear,
        major,
        company,
        position,
        industry,
        motivation,
        referral,
      } = req.body;

      // 필수 필드 검증
      if (!name || !email || !graduationYear || !major) {
        return res.status(400).json({ error: "필수 필드가 누락되었습니다" });
      }

      // '신청현황' 탭 찾기
      const crewSheet = googleSheet.sheetsByTitle["신청현황"] || googleSheet.sheetsByTitle["Crews"];
      if (!crewSheet) {
        console.warn("⚠️  '신청현황' 탭을 찾을 수 없습니다.");
        return res.status(500).json({ error: "신청 탭을 찾을 수 없습니다" });
      }

      // 새로운 행 추가
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

      console.log(`✅ 크루 등록 완료: ${name} (${email})`);
      res.json({ success: true, message: "신청이 완료되었습니다" });
    } catch (error) {
      console.error("❌ 크루 등록 오류:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "크루 등록 실패" });
    }
  });

  // 3. 멤버 검색 (전화번호로)
  app.post("/api/member-search", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }

      if (!googleSheet) {
        return res.status(500).json({ error: "구글 시트 연결 실패" });
      }

      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "전화번호가 필요합니다" });
      }

      // '멤버리스트' 탭 찾기
      const memberSheet = googleSheet.sheetsByTitle["멤버리스트"] || googleSheet.sheetsByTitle["Members"];
      if (!memberSheet) {
        console.warn("⚠️  '멤버리스트' 탭을 찾을 수 없습니다.");
        return res.json({ found: false, member: null });
      }

      const rows = await memberSheet.getRows();
      const member = rows.find((row: any) => {
        const memberPhone = row.get("연락처") || row.get("전화번호") || "";
        return memberPhone.replace(/[^0-9]/g, "") === phone.replace(/[^0-9]/g, "");
      });

      if (member) {
        console.log(`✅ 멤버 찾음: ${member.get("이름")}`);
        res.json({
          found: true,
          member: {
            name: member.get("이름"),
            email: member.get("이메일"),
            phone: member.get("연락처"),
            company: member.get("현재소속"),
            tier: member.get("티어"),
          },
        });
      } else {
        res.json({ found: false, member: null });
      }
    } catch (error) {
      console.error("❌ 멤버 검색 오류:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "멤버 검색 실패" });
    }
  });

  // 4. 이벤트 참가 신청
  app.post("/api/event-register", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }

      if (!googleSheet) {
        return res.status(500).json({ error: "구글 시트 연결 실패" });
      }

      const { eventId, name, email, phone } = req.body;
      if (!eventId || !name || !email) {
        return res.status(400).json({ error: "필수 필드가 누락되었습니다" });
      }

      // '이벤트참가신청' 탭 찾기
      const eventRegSheet = googleSheet.sheetsByTitle["이벤트참가신청"] || googleSheet.sheetsByTitle["EventRegistrations"];
      if (!eventRegSheet) {
        console.warn("⚠️  '이벤트참가신청' 탭을 찾을 수 없습니다.");
        return res.status(500).json({ error: "이벤트 참가 신청 탭을 찾을 수 없습니다" });
      }

      await eventRegSheet.addRow({
        "이벤트회차": eventId,
        "이름": name,
        "이메일": email,
        "연락처": phone,
        "신청일시": new Date().toISOString(),
      });

      console.log(`✅ 이벤트 참가 신청 완료: ${name} (이벤트 ${eventId})`);
      res.json({ success: true, message: "이벤트 참가 신청이 완료되었습니다" });
    } catch (error) {
      console.error("❌ 이벤트 참가 신청 오류:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "이벤트 참가 신청 실패" });
    }
  });

  // 정적 파일 서빙
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // 클라이언트 라우팅 처리
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
