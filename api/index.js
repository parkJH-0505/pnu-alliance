// server/index.ts
import express from "express";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
var SHEET_ID = "1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk";
var getGoogleAuth = () => {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let serviceAccountJson;
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
function normalizePrivateKey(pk) {
  return (pk || "").replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
}
async function initializeGoogleSheet() {
  const serviceAccount = getGoogleAuth();
  if (!serviceAccount) return null;
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
      email: serviceAccount.client_email,
      key: normalizePrivateKey(serviceAccount.private_key),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    }));
    await doc.loadInfo();
    return doc;
  } catch (error) {
    return null;
  }
}
function normalizeName(name) {
  return (name || "").trim().replace(/\s+/g, "");
}
function memberToPublic(row) {
  return {
    member_id: row.get("member_id") || "",
    name: row.get("\uC774\uB984") || "",
    graduationYear: row.get("\uD559\uBC88") || "",
    major: row.get("\uC804\uACF5") || "",
    company: row.get("\uD68C\uC0AC") || "",
    position: row.get("\uC9C1\uAE09") || "",
    industry: row.get("\uC9C1\uAD70") || "",
    orbit: row.get("\uD604\uC7AC\uADA4\uB3C4") || "",
    introOneLiner: row.get("\uC790\uAE30\uC18C\uAC1C_\uD55C\uC904") || "",
    region: row.get("\uAC70\uC8FC\uC9C0\uC5ED") || "",
    linkedinUrl: row.get("\uB9C1\uD06C\uB4DC\uC778URL") || ""
  };
}
var EVENT_REG_HEADERS = [
  "registration_id",
  "\uC2E0\uCCAD\uC77C\uC2DC",
  "event_id",
  "member_id",
  "\uC2E0\uCCAD\uC790\uD0C0\uC785",
  "\uC774\uB984",
  "\uD559\uBC88",
  "\uC804\uACF5",
  "\uD68C\uC0AC",
  "\uC9C1\uAE09",
  "\uC9C1\uAD70",
  "\uD604\uC7AC\uADA4\uB3C4",
  "\uAC70\uC8FC\uC9C0\uC5ED",
  "\uC790\uAE30\uC18C\uAC1C_\uD55C\uC904",
  "\uB9C1\uD06C\uB4DC\uC778URL",
  "\uC804\uD654\uBC88\uD638",
  "\uC774\uBA54\uC77C",
  "\uC778\uC2A4\uD0C0ID",
  "\uCD08\uB300\uC790_member_id",
  "\uCD08\uB300\uC790_\uD14D\uC2A4\uD2B8",
  "\uB3D9\uBC18\uCC38\uC11D\uC5EC\uBD80",
  "\uB3D9\uBC18\uC790\uC815\uBCF4",
  "\uAE30\uB300\uC810",
  "\uC758\uACAC",
  "\uC0C1\uD0DC",
  "\uC785\uAE08\uC5EC\uBD80"
];
async function ensureEventRegHeader(sheet) {
  try {
    await sheet.loadHeaderRow();
    if (!sheet.headerValues || sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(EVENT_REG_HEADERS);
    }
  } catch (e) {
    await sheet.setHeaderRow(EVENT_REG_HEADERS);
  }
}
var app = express();
app.use(express.json());
app.get("/api/_diag", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).send("Not Found");
  }
  const envB64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || "";
  let effectiveJson = "";
  let sourceUsed = "";
  if (envB64) {
    try {
      effectiveJson = Buffer.from(envB64, "base64").toString("utf-8");
      sourceUsed = "b64";
    } catch {
      effectiveJson = "";
      sourceUsed = "b64-decode-failed";
    }
  } else if (envRaw) {
    effectiveJson = envRaw;
    sourceUsed = "raw";
  }
  let parsed = null;
  let parseError = "";
  try {
    parsed = JSON.parse(effectiveJson);
  } catch (e) {
    parseError = e?.message || String(e);
  }
  const pk = parsed?.private_key || "";
  const pkNorm = normalizePrivateKey(pk);
  const result = {
    envRawPresent: !!envRaw,
    envRawLength: envRaw.length,
    envB64Present: !!envB64,
    envB64Length: envB64.length,
    sourceUsed,
    effectiveJsonLength: effectiveJson.length,
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
      lineCount: pkNorm.split("\n").length
    }
  };
  if (parsed) {
    try {
      const start = Date.now();
      const doc = new GoogleSpreadsheet(SHEET_ID, new JWT({
        email: parsed.client_email,
        key: pkNorm,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      }));
      await Promise.race([
        doc.loadInfo(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("loadInfo timeout 5s")), 5e3))
      ]);
      result.sheetAccessible = true;
      result.sheetTitle = doc.title;
      result.sheetCount = doc.sheetCount;
      result.loadInfoMs = Date.now() - start;
      result.sheetTitles = Object.keys(doc.sheetsByTitle || {});
      const membersSheet = doc.sheetsByTitle?.["Members"];
      result.membersSheetFound = !!membersSheet;
      if (membersSheet) {
        try {
          const memberRows = await membersSheet.getRows({ limit: 3 });
          result.membersFirstRows = memberRows.map((r) => ({
            id: r.get("member_id"),
            name: r.get("\uC774\uB984"),
            nameNormalized: (r.get("\uC774\uB984") || "").trim().replace(/\s+/g, "")
          }));
          result.membersHeaderValues = membersSheet.headerValues;
        } catch (e) {
          result.membersReadError = e?.message || String(e);
        }
      }
    } catch (e) {
      result.sheetAccessible = false;
      result.sheetError = e?.message || String(e);
    }
  }
  res.json(result);
});
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
app.post("/api/member-search", async (req, res) => {
  const debug = {};
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "\uC774\uB984\uC774 \uD544\uC694\uD569\uB2C8\uB2E4" });
    }
    const normalized = normalizeName(name);
    if (normalized.length < 2) {
      return res.status(400).json({ error: "\uCD5C\uC18C 2\uAE00\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694" });
    }
    debug.normalizedQuery = normalized;
    const googleSheet = await initializeGoogleSheet();
    debug.sheetInitialized = !!googleSheet;
    if (!googleSheet) return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328", debug });
    debug.sheetTitles = Object.keys(googleSheet.sheetsByTitle || {});
    const memberSheet = googleSheet.sheetsByTitle["Members"];
    debug.membersSheetFound = !!memberSheet;
    if (!memberSheet) return res.json({ candidates: [], debug });
    const rows = await memberSheet.getRows();
    debug.totalRows = rows.length;
    if (rows[0]) {
      const firstName = rows[0].get("\uC774\uB984") || "";
      debug.firstRowName = firstName;
      debug.firstRowNormalized = normalizeName(firstName);
      debug.firstRowMatchesQuery = normalizeName(firstName) === normalized;
    }
    const candidates = rows.filter((row) => normalizeName(row.get("\uC774\uB984") || "") === normalized).map(memberToPublic).sort((a, b) => {
      const ya = a.graduationYear === "" ? 99 : parseInt(a.graduationYear);
      const yb = b.graduationYear === "" ? 99 : parseInt(b.graduationYear);
      return ya - yb;
    });
    debug.candidatesCount = candidates.length;
    res.json({ candidates, debug });
  } catch (error) {
    console.error("member-search error:", error);
    res.status(500).json({ error: "\uBA64\uBC84 \uAC80\uC0C9 \uC2E4\uD328", message: error?.message, debug });
  }
});
app.post("/api/event-register", async (req, res) => {
  try {
    const {
      eventId,
      memberId,
      isNewMember,
      isMasterUpdate,
      // 프로필
      name,
      graduationYear,
      major,
      company,
      position,
      industry,
      orbit,
      introOneLiner,
      region,
      linkedinUrl,
      // PII
      phone,
      email,
      // 회차별
      instagramId,
      referrerName,
      referrerMemberId,
      hasCompanion,
      companionInfo,
      expectations,
      comment
    } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "\uC774\uB984\xB7\uC804\uD654\uBC88\uD638\uB294 \uD544\uC218\uC785\uB2C8\uB2E4" });
    }
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
    const memberSheet = googleSheet.sheetsByTitle["Members"];
    const eventRegSheet = googleSheet.sheetsByTitle["EventRegistrations"];
    if (!memberSheet) return res.status(500).json({ error: "Members \uC2DC\uD2B8 \uB204\uB77D" });
    if (!eventRegSheet) return res.status(500).json({ error: "EventRegistrations \uC2DC\uD2B8 \uB204\uB77D" });
    await ensureEventRegHeader(eventRegSheet);
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let resolvedMemberId = memberId || "";
    if (isNewMember) {
      const memberRows = await memberSheet.getRows();
      const maxId = memberRows.reduce((max, row) => {
        const id = (row.get("member_id") || "").replace(/^M/, "");
        const num = parseInt(id);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      resolvedMemberId = `M${String(maxId + 1).padStart(3, "0")}`;
      await memberSheet.addRow({
        "member_id": resolvedMemberId,
        "\uC774\uB984": name,
        "\uD559\uBC88": graduationYear || "",
        "\uC804\uACF5": major || "",
        "\uC131\uBCC4": "",
        "\uD68C\uC0AC": company || "",
        "\uC9C1\uAE09": position || "",
        "\uC9C1\uAD70": industry || "",
        "\uAC70\uC8FC\uC9C0\uC5ED": region || "",
        "\uC790\uAE30\uC18C\uAC1C_\uD55C\uC904": introOneLiner || "",
        "\uD604\uC7AC\uADA4\uB3C4": orbit || "",
        "\uB9C1\uD06C\uB4DC\uC778URL": linkedinUrl || "",
        "\uC804\uD654\uBC88\uD638": phone,
        "\uC774\uBA54\uC77C": email || "",
        "\uC720\uC785\uACBD\uB85C": "\uC6F9\uD3FC-\uD68C\uCC28\uC2E0\uCCAD",
        "\uB808\uD37C\uB7F4_member_id": referrerMemberId || "",
        "\uCF54\uC5B4\uD6C4\uBCF4": "",
        "\uBA54\uBAA8": referrerName ? `\uCD08\uB300\uC790(\uD14D\uC2A4\uD2B8): ${referrerName}` : "",
        "1\uD68C\uCC38\uC11D": "-",
        "2\uD68C\uCC38\uC11D": "-",
        "3\uD68C\uCC38\uC11D": "-",
        "\uCD1D\uCC38\uC11D\uD69F\uC218": "0",
        "\uCCAB\uB4F1\uB85D\uC77C": today,
        "\uB9C8\uC9C0\uB9C9\uCC38\uC5EC\uC77C": "",
        "\uC0C1\uD0DC": "Active"
      });
    } else if (isMasterUpdate && memberId) {
      const memberRows = await memberSheet.getRows();
      const memberRow = memberRows.find((row) => row.get("member_id") === memberId);
      if (memberRow) {
        if (company) memberRow.set("\uD68C\uC0AC", company);
        if (position) memberRow.set("\uC9C1\uAE09", position);
        if (industry) memberRow.set("\uC9C1\uAD70", industry);
        if (orbit) memberRow.set("\uD604\uC7AC\uADA4\uB3C4", orbit);
        if (region) memberRow.set("\uAC70\uC8FC\uC9C0\uC5ED", region);
        if (introOneLiner) memberRow.set("\uC790\uAE30\uC18C\uAC1C_\uD55C\uC904", introOneLiner);
        if (linkedinUrl) memberRow.set("\uB9C1\uD06C\uB4DC\uC778URL", linkedinUrl);
        if (phone) memberRow.set("\uC804\uD654\uBC88\uD638", phone);
        if (email) memberRow.set("\uC774\uBA54\uC77C", email);
        await memberRow.save();
      }
    }
    const eventRegRows = await eventRegSheet.getRows();
    const maxRegId = eventRegRows.reduce((max, row) => {
      const id = (row.get("registration_id") || "").replace(/^R/, "");
      const num = parseInt(id);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newRegId = `R${String(maxRegId + 1).padStart(4, "0")}`;
    await eventRegSheet.addRow({
      "registration_id": newRegId,
      "\uC2E0\uCCAD\uC77C\uC2DC": nowIso,
      "event_id": eventId || "4",
      "member_id": resolvedMemberId,
      "\uC2E0\uCCAD\uC790\uD0C0\uC785": isNewMember ? "\uC2E0\uADDC" : "\uAE30\uC874",
      "\uC774\uB984": name,
      "\uD559\uBC88": graduationYear || "",
      "\uC804\uACF5": major || "",
      "\uD68C\uC0AC": company || "",
      "\uC9C1\uAE09": position || "",
      "\uC9C1\uAD70": industry || "",
      "\uD604\uC7AC\uADA4\uB3C4": orbit || "",
      "\uAC70\uC8FC\uC9C0\uC5ED": region || "",
      "\uC790\uAE30\uC18C\uAC1C_\uD55C\uC904": introOneLiner || "",
      "\uB9C1\uD06C\uB4DC\uC778URL": linkedinUrl || "",
      "\uC804\uD654\uBC88\uD638": phone,
      "\uC774\uBA54\uC77C": email || "",
      "\uC778\uC2A4\uD0C0ID": instagramId || "",
      "\uCD08\uB300\uC790_member_id": referrerMemberId || "",
      "\uCD08\uB300\uC790_\uD14D\uC2A4\uD2B8": referrerName || "",
      "\uB3D9\uBC18\uCC38\uC11D\uC5EC\uBD80": hasCompanion ? "O" : "-",
      "\uB3D9\uBC18\uC790\uC815\uBCF4": companionInfo || "",
      "\uAE30\uB300\uC810": expectations || "",
      "\uC758\uACAC": comment || "",
      "\uC0C1\uD0DC": "\uAC80\uD1A0\uC911",
      "\uC785\uAE08\uC5EC\uBD80": "-"
    });
    res.json({ success: true, registrationId: newRegId, memberId: resolvedMemberId });
  } catch (error) {
    console.error("event-register error:", error);
    res.status(500).json({ error: "\uC2E0\uCCAD \uC2E4\uD328", detail: error?.message || "" });
  }
});
app.post("/api/crew-register", async (req, res) => {
  try {
    const googleSheet = await initializeGoogleSheet();
    if (!googleSheet) return res.status(500).json({ error: "\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328" });
    const { name, email, phone, graduationYear, major, company, position, industry, motivation, referral } = req.body;
    const crewSheet = googleSheet.sheetsByTitle["\uD648\uD398\uC774\uC9C0_\uD06C\uB8E8 \uB4F1\uB85D"];
    if (!crewSheet) return res.status(500).json({ error: "\uC2E0\uCCAD \uD0ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    await crewSheet.addRow({
      "\uC774\uB984": name,
      "\uC774\uBA54\uC77C": email,
      "\uC5F0\uB77D\uCC98": phone,
      "\uC878\uC5C5\uC5F0\uB3C4": graduationYear,
      "\uC804\uACF5": major,
      "\uC18C\uC18D(\uD68C\uC0AC/\uD559\uAD50)": company,
      "\uC9C1\uCC45/\uC5ED\uD560": position,
      "\uC5C5\uACC4": industry,
      "\uD569\uB958 \uB3D9\uAE30": motivation,
      "\uCD94\uCC9C\uC778": referral,
      "\uC2E0\uCCAD\uC77C\uC2DC": (/* @__PURE__ */ new Date()).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
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
