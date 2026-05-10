// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";
var getGoogleAuth = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("\u26A0\uFE0F  GOOGLE_SERVICE_ACCOUNT_JSON \uD658\uACBD \uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
    return null;
  }
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error("\u274C \uAD6C\uAE00 \uC11C\uBE44\uC2A4 \uACC4\uC815 JSON \uD30C\uC2F1 \uC624\uB958:", error);
    return null;
  }
};
async function initializeGoogleSheet() {
  const serviceAccount = getGoogleAuth();
  if (!serviceAccount) {
    console.warn("\u26A0\uFE0F  \uAD6C\uAE00 \uC2DC\uD2B8 \uCD08\uAE30\uD654 \uC2E4\uD328: \uC11C\uBE44\uC2A4 \uACC4\uC815 \uC815\uBCF4 \uC5C6\uC74C");
    return null;
  }
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    }));
    await doc.loadInfo();
    console.log("\u2705 \uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC131\uACF5:", doc.title);
    return doc;
  } catch (error) {
    console.error("\u274C \uAD6C\uAE00 \uC2DC\uD2B8 \uCD08\uAE30\uD654 \uC624\uB958:", error instanceof Error ? error.message : String(error));
    return null;
  }
}
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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
  let googleSheet = await initializeGoogleSheet();
  app.get("/api/events", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }
      if (!googleSheet) {
        return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
      }
      const eventSheet = googleSheet.sheetsByTitle["\uC774\uBCA4\uD2B8"] || googleSheet.sheetsByTitle["Events"];
      if (!eventSheet) {
        console.warn("\u26A0\uFE0F  '\uC774\uBCA4\uD2B8' \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD0ED:", Object.keys(googleSheet.sheetsByTitle));
        return res.json({ events: [] });
      }
      await eventSheet.loadCells();
      const rows = await eventSheet.getRows();
      const events = rows.map((row) => ({
        id: row.get("\uD68C\uCC28") || "",
        title: row.get("\uC81C\uBAA9") || "",
        date: row.get("\uB0A0\uC9DC") || "",
        time: row.get("\uC2DC\uAC04") || "",
        location: row.get("\uC7A5\uC18C") || "",
        description: row.get("\uC124\uBA85") || "",
        capacity: parseInt(row.get("\uC815\uC6D0") || "0"),
        registered: parseInt(row.get("\uC2E0\uCCAD\uC790") || "0")
      })).filter((e) => e.id && e.title);
      console.log(`\u2705 \uC774\uBCA4\uD2B8 ${events.length}\uAC1C \uB85C\uB4DC\uB428`);
      res.json({ events });
    } catch (error) {
      console.error("\u274C \uC774\uBCA4\uD2B8 \uC870\uD68C \uC624\uB958:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "\uC774\uBCA4\uD2B8 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app.post("/api/crew-register", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }
      if (!googleSheet) {
        return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
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
        referral
      } = req.body;
      if (!name || !email || !graduationYear || !major) {
        return res.status(400).json({ error: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
      }
      const crewSheet = googleSheet.sheetsByTitle["\uC2E0\uCCAD\uD604\uD669"] || googleSheet.sheetsByTitle["Crews"];
      if (!crewSheet) {
        console.warn("\u26A0\uFE0F  '\uC2E0\uCCAD\uD604\uD669' \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return res.status(500).json({ error: "\uC2E0\uCCAD \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      await crewSheet.addRow({
        "\uC774\uB984": name,
        "\uC774\uBA54\uC77C": email,
        "\uC5F0\uB77D\uCC98": phone,
        "\uC878\uC5C5\uC5F0\uB3C4": graduationYear,
        "\uC804\uACF5": major,
        "\uD604\uC7AC\uC18C\uC18D": company,
        "\uC9C1\uCC45": position,
        "\uC5C5\uACC4": industry,
        "\uD569\uB958\uB3D9\uAE30": motivation,
        "\uCD94\uCC9C\uC778": referral,
        "\uC2E0\uCCAD\uC77C\uC2DC": (/* @__PURE__ */ new Date()).toISOString(),
        "\uC0C1\uD0DC": "\uAC80\uD1A0\uC911"
      });
      console.log(`\u2705 \uD06C\uB8E8 \uB4F1\uB85D \uC644\uB8CC: ${name} (${email})`);
      res.json({ success: true, message: "\uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    } catch (error) {
      console.error("\u274C \uD06C\uB8E8 \uB4F1\uB85D \uC624\uB958:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "\uD06C\uB8E8 \uB4F1\uB85D \uC2E4\uD328" });
    }
  });
  app.post("/api/member-search", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }
      if (!googleSheet) {
        return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
      }
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "\uC804\uD654\uBC88\uD638\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      const memberSheet = googleSheet.sheetsByTitle["\uBA64\uBC84\uB9AC\uC2A4\uD2B8"] || googleSheet.sheetsByTitle["Members"];
      if (!memberSheet) {
        console.warn("\u26A0\uFE0F  '\uBA64\uBC84\uB9AC\uC2A4\uD2B8' \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return res.json({ found: false, member: null });
      }
      const rows = await memberSheet.getRows();
      const member = rows.find((row) => {
        const memberPhone = row.get("\uC5F0\uB77D\uCC98") || row.get("\uC804\uD654\uBC88\uD638") || "";
        return memberPhone.replace(/[^0-9]/g, "") === phone.replace(/[^0-9]/g, "");
      });
      if (member) {
        console.log(`\u2705 \uBA64\uBC84 \uCC3E\uC74C: ${member.get("\uC774\uB984")}`);
        res.json({
          found: true,
          member: {
            name: member.get("\uC774\uB984"),
            email: member.get("\uC774\uBA54\uC77C"),
            phone: member.get("\uC5F0\uB77D\uCC98"),
            company: member.get("\uD604\uC7AC\uC18C\uC18D"),
            tier: member.get("\uD2F0\uC5B4")
          }
        });
      } else {
        res.json({ found: false, member: null });
      }
    } catch (error) {
      console.error("\u274C \uBA64\uBC84 \uAC80\uC0C9 \uC624\uB958:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "\uBA64\uBC84 \uAC80\uC0C9 \uC2E4\uD328" });
    }
  });
  app.post("/api/event-register", async (req, res) => {
    try {
      if (!googleSheet) {
        googleSheet = await initializeGoogleSheet();
      }
      if (!googleSheet) {
        return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
      }
      const { eventId, name, email, phone } = req.body;
      if (!eventId || !name || !email) {
        return res.status(400).json({ error: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
      }
      const eventRegSheet = googleSheet.sheetsByTitle["\uC774\uBCA4\uD2B8\uCC38\uAC00\uC2E0\uCCAD"] || googleSheet.sheetsByTitle["EventRegistrations"];
      if (!eventRegSheet) {
        console.warn("\u26A0\uFE0F  '\uC774\uBCA4\uD2B8\uCC38\uAC00\uC2E0\uCCAD' \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return res.status(500).json({ error: "\uC774\uBCA4\uD2B8 \uCC38\uAC00 \uC2E0\uCCAD \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      await eventRegSheet.addRow({
        "\uC774\uBCA4\uD2B8\uD68C\uCC28": eventId,
        "\uC774\uB984": name,
        "\uC774\uBA54\uC77C": email,
        "\uC5F0\uB77D\uCC98": phone,
        "\uC2E0\uCCAD\uC77C\uC2DC": (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log(`\u2705 \uC774\uBCA4\uD2B8 \uCC38\uAC00 \uC2E0\uCCAD \uC644\uB8CC: ${name} (\uC774\uBCA4\uD2B8 ${eventId})`);
      res.json({ success: true, message: "\uC774\uBCA4\uD2B8 \uCC38\uAC00 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    } catch (error) {
      console.error("\u274C \uC774\uBCA4\uD2B8 \uCC38\uAC00 \uC2E0\uCCAD \uC624\uB958:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "\uC774\uBCA4\uD2B8 \uCC38\uAC00 \uC2E0\uCCAD \uC2E4\uD328" });
    }
  });
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`\u{1F680} \uC11C\uBC84 \uC2E4\uD589 \uC911: http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
