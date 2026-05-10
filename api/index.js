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
    if (!googleSheet) return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
    const eventSheet = googleSheet.sheetsByTitle["\uC774\uBCA4\uD2B8"] || googleSheet.sheetsByTitle["Events"];
    if (!eventSheet) return res.json({ events: [] });
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
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "\uC774\uBCA4\uD2B8 \uC870\uD68C \uC2E4\uD328" });
  }
});
app.post("/api/crew-register", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
    const { name, email, phone, graduationYear, major, company, position, industry, motivation, referral } = req.body;
    const crewSheet = googleSheet.sheetsByTitle["\uC2E0\uCCAD\uD604\uD669"] || googleSheet.sheetsByTitle["Crews"];
    if (!crewSheet) return res.status(500).json({ error: "\uC2E0\uCCAD \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "\uD06C\uB8E8 \uB4F1\uB85D \uC2E4\uD328" });
  }
});
var index_default = app;
export {
  index_default as default
};
