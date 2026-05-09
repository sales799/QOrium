// ============================================================
// QORIUM WEBSITE REVIEW SYSTEM — APPS SCRIPT
// ============================================================
// HOW TO USE (one-time setup, ~5 minutes):
//
//  1. Open https://script.google.com  (sign in with your Google account)
//  2. Click "New project"
//  3. Delete ALL existing code in the editor
//  4. Paste THIS entire file
//  5. On line 16 below, change the CTO_EMAIL to your real email
//  6. Click the Save icon (💾) or press Ctrl+S
//  7. In the dropdown next to ▶ Run, select:
//        SETUP_CreateQoriumReviewSheet
//  8. Click ▶ Run
//  9. A permissions popup appears → click "Review permissions"
//     → choose your Google account → click "Advanced"
//     → click "Go to Qorium Review System (unsafe)" → click "Allow"
// 10. Wait ~20 seconds (you'll see a spinning icon)
// 11. A popup shows your sheet URL — copy it
//     (also visible in View → Execution log, line starting with SHEET URL:)
// 12. Share that URL with your team — they can fill it immediately
// ============================================================

var CONFIG = {
  CTO_EMAIL:   "bhaskar@qorium.com",     // ← CHANGE THIS to real CTO email
  SHEET_TITLE: "Qorium Website Review — May 2026",
  SUBJECT_TAG: "[Qorium Review]"
};

// ── All 24 pages of qorium.online ──────────────────────────
var PAGES = [
  ["1",  "Homepage",                        "https://qorium.online/"],
  ["2",  "About",                           "https://qorium.online/about"],
  ["3",  "Blog (index)",                    "https://qorium.online/blog"],
  ["4",  "Blog — Leak Problem",             "https://qorium.online/blog/leak-problem"],
  ["5",  "Blog — Role Graph",               "https://qorium.online/blog/role-graph"],
  ["6",  "Blog — Seven Stages",             "https://qorium.online/blog/seven-stages"],
  ["7",  "Changelog",                       "https://qorium.online/changelog"],
  ["8",  "Contact",                         "https://qorium.online/contact"],
  ["9",  "Customers",                       "https://qorium.online/customers"],
  ["10", "Demo",                            "https://qorium.online/demo"],
  ["11", "Data Processing Agreement",       "https://qorium.online/dpa"],
  ["12", "Features (index)",                "https://qorium.online/features"],
  ["13", "Feature — JD-Forge",             "https://qorium.online/features/jd-forge"],
  ["14", "Feature — ReadyBank",            "https://qorium.online/features/readybank"],
  ["15", "Feature — Stack-Vault",          "https://qorium.online/features/stack-vault"],
  ["16", "Press Kit",                       "https://qorium.online/press-kit"],
  ["17", "Pricing",                         "https://qorium.online/pricing"],
  ["18", "Privacy Policy",                  "https://qorium.online/privacy"],
  ["19", "Product (overview)",              "https://qorium.online/product"],
  ["20", "Security",                        "https://qorium.online/security"],
  ["21", "Solution — Enterprises & GCCs",  "https://qorium.online/solutions/enterprises"],
  ["22", "Solution — Platforms",            "https://qorium.online/solutions/platforms"],
  ["23", "Solution — Staffing",             "https://qorium.online/solutions/staffing"],
  ["24", "Terms of Service",               "https://qorium.online/terms"]
];

// ── Column positions (1-indexed) ────────────────────────────
var C = {
  NUM:       1,   // A
  PAGE:      2,   // B
  URL:       3,   // C  clickable link
  VISUAL:    4,   // D  ⭐ Visual Design
  CLARITY:   5,   // E  ⭐ Content Clarity
  NAV:       6,   // F  ⭐ Easy to Navigate
  MOBILE:    7,   // G  ⭐ Mobile Friendly
  SPEED:     8,   // H  ⭐ Loading Speed
  OVERALL:   9,   // I  ⭐ Overall
  LIKED:     10,  // J  What you liked
  IMPROVE:   11,  // K  What needs fixing
  NAME:      12,  // L  Your Name  ← submitting this fires email to CTO
  EMAIL:     13,  // M  Your Email ← so CTO can reply directly to you
  DATE:      14,  // N  Auto-filled on submit
  // ─── CTO ONLY (gold) ────────────────────────────────────
  DECISION:  15,  // O  Dropdown: Approved / Fix / Defer / Escalate
  CTO_NOTES: 16,  // P  CTO free text
  RESPONSE:  17,  // Q  Written here → auto-emails team member
  STATUS:    18,  // R  Auto-updated
  PR_LINK:   19   // S  GitHub PR link (CTO fills after shipping fix)
};

var TOTAL_COLS = 19;
var DATA_START  = 2;   // row 1 = header

// ============================================================
// MAIN SETUP — run this once
// ============================================================
function SETUP_CreateQoriumReviewSheet() {
  var ss  = SpreadsheetApp.create(CONFIG.SHEET_TITLE);
  var url = ss.getUrl();

  _buildReviewSheet(ss);
  _buildChatSheet(ss);
  _buildHowToSheet(ss);
  _installTrigger(ss);

  // Remove the blank default sheet Google adds
  var def = ss.getSheetByName("Sheet1");
  if (def) ss.deleteSheet(def);

  ss.setActiveSheet(ss.getSheetByName("📋 Website Review"));

  // Show result
  try {
    SpreadsheetApp.getUi().alert(
      "✅ Sheet Created!",
      "Your Qorium Review Sheet is ready.\n\nURL (copy this):\n" + url +
      "\n\nShare this link with your team — they can start filling it right away.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    // Non-UI context (e.g. triggered run) — log is enough
  }

  Logger.log("SHEET URL: " + url);
  console.log("SHEET URL: " + url);
  return url;
}

// ============================================================
// BUILD: 📋 Website Review sheet
// ============================================================
function _buildReviewSheet(ss) {
  var sheet = ss.insertSheet("📋 Website Review", 0);

  // ── Headers ──────────────────────────────────────────────
  var headers = [
    "#",
    "Page Name",
    "Open Page",
    "⭐ Visual Design\n(1=Poor  5=Excellent)",
    "⭐ Content Clarity\n(1=Confusing  5=Crystal Clear)",
    "⭐ Easy to Navigate\n(1=Lost  5=Effortless)",
    "⭐ Mobile Friendly\n(1=Broken  5=Perfect)",
    "⭐ Loading Speed\n(1=Slow  5=Instant)",
    "⭐ Overall Rating\n(1=Redo  5=Ship it!)",
    "❤️ What Did You LIKE?",
    "🔧 What NEEDS to Change?",
    "Your Name",
    "Your Email",
    "Submitted On",
    "🔒 CTO Decision",
    "🔒 CTO Notes",
    "🔒 Response to Team",
    "Status",
    "🔒 GitHub PR"
  ];

  var headerRange = sheet.getRange(1, 1, 1, TOTAL_COLS);
  headerRange.setValues([headers]);
  headerRange
    .setBackground("#0f172a")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setWrap(true)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 70);

  // CTO column headers — gold
  sheet.getRange(1, C.DECISION, 1, 5)
    .setBackground("#b45309")
    .setFontColor("#ffffff");

  // ── Data rows ─────────────────────────────────────────────
  for (var i = 0; i < PAGES.length; i++) {
    var row = i + DATA_START;
    var p   = PAGES[i];

    sheet.getRange(row, C.NUM).setValue(p[0]).setHorizontalAlignment("center");
    sheet.getRange(row, C.PAGE).setValue(p[1]);
    sheet.getRange(row, C.URL)
      .setFormula('=HYPERLINK("' + p[2] + '","Open ↗")')
      .setHorizontalAlignment("center")
      .setFontColor("#2563eb");
    sheet.getRange(row, C.STATUS)
      .setValue("⏳ Awaiting Review")
      .setHorizontalAlignment("center");

    // Alternate row background (team columns)
    var rowBg = (i % 2 === 0) ? "#f8fafc" : "#ffffff";
    sheet.getRange(row, 1, 1, C.DATE).setBackground(rowBg);

    // CTO columns — always amber tint
    sheet.getRange(row, C.DECISION, 1, 5).setBackground("#fef3c7");
  }

  // ── Dropdowns: ratings ────────────────────────────────────
  var ratingRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["1 ⭐","2 ⭐⭐","3 ⭐⭐⭐","4 ⭐⭐⭐⭐","5 ⭐⭐⭐⭐⭐"], true)
    .setAllowInvalid(false)
    .setHelpText("Pick 1 (worst) to 5 (best)")
    .build();

  [C.VISUAL, C.CLARITY, C.NAV, C.MOBILE, C.SPEED, C.OVERALL].forEach(function(col) {
    sheet.getRange(DATA_START, col, PAGES.length, 1)
      .setDataValidation(ratingRule)
      .setHorizontalAlignment("center");
  });

  // ── Dropdown: CTO Decision ────────────────────────────────
  sheet.getRange(DATA_START, C.DECISION, PAGES.length, 1)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList([
          "✅ Approved — Ship As-Is",
          "🔧 Fix Required",
          "⏳ Defer to Next Sprint",
          "📢 Escalate to Founder"
        ], true)
        .setAllowInvalid(false)
        .build()
    );

  // ── Column widths ─────────────────────────────────────────
  sheet.setColumnWidth(C.NUM, 38);
  sheet.setColumnWidth(C.PAGE, 210);
  sheet.setColumnWidth(C.URL, 85);
  [C.VISUAL,C.CLARITY,C.NAV,C.MOBILE,C.SPEED,C.OVERALL].forEach(function(c){
    sheet.setColumnWidth(c, 115);
  });
  sheet.setColumnWidth(C.LIKED,   260);
  sheet.setColumnWidth(C.IMPROVE, 260);
  sheet.setColumnWidth(C.NAME,    150);
  sheet.setColumnWidth(C.EMAIL,   200);
  sheet.setColumnWidth(C.DATE,    120);
  sheet.setColumnWidth(C.DECISION,  190);
  sheet.setColumnWidth(C.CTO_NOTES, 230);
  sheet.setColumnWidth(C.RESPONSE,  270);
  sheet.setColumnWidth(C.STATUS,    160);
  sheet.setColumnWidth(C.PR_LINK,   150);

  // ── Free-text columns: wrap ───────────────────────────────
  [C.LIKED, C.IMPROVE, C.CTO_NOTES, C.RESPONSE].forEach(function(c) {
    sheet.getRange(DATA_START, c, PAGES.length, 1).setWrap(true);
  });

  // ── Freeze ────────────────────────────────────────────────
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);

  // ── Row heights for data ──────────────────────────────────
  for (var r = DATA_START; r <= PAGES.length + 1; r++) {
    sheet.setRowHeight(r, 50);
  }
}

// ============================================================
// BUILD: 💬 Chat with CTO sheet
// ============================================================
function _buildChatSheet(ss) {
  var sheet = ss.insertSheet("💬 Chat with CTO", 1);

  // Banner
  sheet.getRange("A1:G1").merge()
    .setValue("💬 CHAT WITH CTO — Ask anything about the website")
    .setBackground("#0f172a").setFontColor("#ffffff")
    .setFontSize(15).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 44);

  // Instruction strip
  sheet.getRange("A2:G2").merge()
    .setValue(
      "HOW IT WORKS → Write your question in Column C, fill your name in Column B, " +
      "fill your email in Column D. CTO gets an email and replies in Column E. " +
      "You get an email when CTO responds."
    )
    .setBackground("#ecfdf5").setWrap(true).setFontSize(11)
    .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 52);

  // Headers
  var chatH = ["#", "Your Name", "Your Question / Comment", "Your Email", "CTO Response", "Status", "Date"];
  sheet.getRange(3, 1, 1, 7).setValues([chatH])
    .setBackground("#0f172a").setFontColor("#ffffff")
    .setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(3, 40);

  // Pre-fill 30 rows
  for (var i = 1; i <= 30; i++) {
    var r = i + 3;
    sheet.getRange(r, 1).setValue(i).setHorizontalAlignment("center");
    sheet.getRange(r, 5, 1, 2).setBackground("#fef3c7"); // CTO cols gold
    sheet.getRange(r, 6).setValue("Open").setHorizontalAlignment("center");
    if (i % 2 === 0) sheet.getRange(r, 1, 1, 4).setBackground("#f8fafc");
  }

  // Widths
  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 420);
  sheet.setColumnWidth(4, 210);
  sheet.setColumnWidth(5, 420);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 130);

  [3,5].forEach(function(c) {
    sheet.getRange(4, c, 30, 1).setWrap(true);
  });

  sheet.setFrozenRows(3);
}

// ============================================================
// BUILD: 📖 How to Use sheet
// ============================================================
function _buildHowToSheet(ss) {
  var sheet = ss.insertSheet("📖 How to Use", 2);

  var rows = [
    ["QORIUM WEBSITE REVIEW — HOW TO USE", ""],
    ["", ""],
    ["FOR THE TEAM (non-tech guide)", ""],
    ["Step 1", "Click the tab '📋 Website Review' at the bottom of the screen"],
    ["Step 2", "Find a page you've visited (e.g. Homepage, Pricing, Contact)"],
    ["Step 3", "Click the blue 'Open ↗' link in Column C — the page opens in your browser"],
    ["Step 4", "Look at the page for 1-2 minutes. Then come back to the sheet."],
    ["Step 5", "Click on each orange rating cell and pick ⭐1 to ⭐⭐⭐⭐⭐5 from the dropdown"],
    ["Step 6", "In the green column 'What Did You LIKE?' — type anything that impressed you"],
    ["Step 7", "In 'What NEEDS to Change?' — type anything confusing, wrong, or ugly"],
    ["Step 8", "Type YOUR NAME in the 'Your Name' column"],
    ["Step 9", "Type YOUR EMAIL in the 'Your Email' column"],
    ["Done!", "CTO gets an instant email. You'll get an email reply when the fix is live."],
    ["", ""],
    ["RATING SCALE", ""],
    ["1 ⭐",       "Very poor — this page hurts the brand"],
    ["2 ⭐⭐",     "Below average — noticeable problems"],
    ["3 ⭐⭐⭐",   "Average — works but nothing special"],
    ["4 ⭐⭐⭐⭐",  "Good — solid page, minor tweaks only"],
    ["5 ⭐⭐⭐⭐⭐", "Excellent — ship it as-is, no changes needed"],
    ["", ""],
    ["HAVE A QUESTION?", "Go to the '💬 Chat with CTO' tab and ask anything."],
    ["", ""],
    ["FOR THE CTO (Bhaskar)", ""],
    ["When you get an email",     "Open the sheet → go to the row mentioned"],
    ["Pick a decision (Column O)", "✅ Approved / 🔧 Fix Required / ⏳ Defer / 📢 Escalate"],
    ["Add your notes (Column P)",  "Internal notes for yourself"],
    ["Write your reply (Column Q)", "This gets emailed automatically to the reviewer"],
    ["Add PR link (Column S)",      "Paste the GitHub PR link after you push the fix"],
    ["", ""],
    ["CTO RULE", "CTO recommendation wins. Always. No exceptions."]
  ];

  sheet.getRange(1, 1, rows.length, 2).setValues(rows).setWrap(true);

  // Title
  sheet.getRange(1, 1, 1, 2).merge()
    .setBackground("#0f172a").setFontColor("#ffffff")
    .setFontSize(16).setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 50);

  // Section headers
  [3, 15, 22, 24].forEach(function(r) {
    sheet.getRange(r, 1, 1, 2).merge()
      .setBackground("#b45309").setFontColor("#ffffff")
      .setFontWeight("bold").setFontSize(12);
  });

  // CTO rule — emphasise
  var lastRow = rows.length;
  sheet.getRange(lastRow, 1, 1, 2).merge()
    .setBackground("#fef3c7").setFontWeight("bold");

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 480);

  // Row heights
  for (var r = 1; r <= rows.length; r++) sheet.setRowHeight(r, 36);
  sheet.setRowHeight(1, 50);
}

// ============================================================
// INSTALL TRIGGER (runs automatically on sheet edits)
// ============================================================
function _installTrigger(ss) {
  // Remove any stale onEditTrigger to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "onEditTrigger") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("onEditTrigger").forSpreadsheet(ss).onEdit().create();
}

// ============================================================
// ON-EDIT TRIGGER — fires on every cell change
// ============================================================
function onEditTrigger(e) {
  if (!e || !e.range) return;

  var sheet     = e.range.getSheet();
  var sheetName = sheet.getName();
  var row       = e.range.getRow();
  var col       = e.range.getColumn();
  var val       = (e.value || "").toString().trim();

  // ── Review sheet: team fills 'Your Name' → notify CTO ──
  if (sheetName === "📋 Website Review" && col === C.NAME && row >= DATA_START && val) {
    sheet.getRange(row, C.DATE).setValue(_today());
    sheet.getRange(row, C.STATUS).setValue("📥 New — Awaiting CTO");
    _emailCTO_NewReview(sheet, row, val);
  }

  // ── Review sheet: CTO fills 'Response to Team' → email reviewer ──
  if (sheetName === "📋 Website Review" && col === C.RESPONSE && row >= DATA_START && val) {
    sheet.getRange(row, C.STATUS).setValue("✅ CTO Responded");
    _emailReviewer_CTOResponse(sheet, row);
  }

  // ── Review sheet: CTO picks Decision → update status colour ──
  if (sheetName === "📋 Website Review" && col === C.DECISION && row >= DATA_START && val) {
    _applyDecisionStatus(sheet, row, val);
  }

  // ── Chat sheet: team writes a question ──
  if (sheetName === "💬 Chat with CTO" && col === 3 && row >= 4 && val) {
    sheet.getRange(row, 7).setValue(_today());
    sheet.getRange(row, 6).setValue("📥 New");
    var chatName = sheet.getRange(row, 2).getValue() || "Team Member";
    _emailCTO_ChatQuestion(chatName, val, row, sheet);
  }

  // ── Chat sheet: CTO writes a reply ──
  if (sheetName === "💬 Chat with CTO" && col === 5 && row >= 4 && val) {
    sheet.getRange(row, 6).setValue("✅ Replied");
    _emailReviewer_ChatReply(sheet, row);
  }
}

// ============================================================
// EMAIL HELPERS
// ============================================================

function _emailCTO_NewReview(sheet, row, name) {
  var pageName = sheet.getRange(row, C.PAGE).getValue();
  var pageUrl  = PAGES[row - DATA_START] ? PAGES[row - DATA_START][2] : "";
  var ssUrl    = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  var ratings = [
    ["Visual Design",    sheet.getRange(row, C.VISUAL).getValue()],
    ["Content Clarity",  sheet.getRange(row, C.CLARITY).getValue()],
    ["Easy to Navigate", sheet.getRange(row, C.NAV).getValue()],
    ["Mobile Friendly",  sheet.getRange(row, C.MOBILE).getValue()],
    ["Loading Speed",    sheet.getRange(row, C.SPEED).getValue()],
    ["Overall",          sheet.getRange(row, C.OVERALL).getValue()]
  ];

  var liked   = sheet.getRange(row, C.LIKED).getValue()   || "(not filled)";
  var improve = sheet.getRange(row, C.IMPROVE).getValue() || "(not filled)";

  var ratingLines = ratings.map(function(r) {
    return "  " + r[0] + ": " + (r[1] || "—");
  }).join("\n");

  var subject = CONFIG.SUBJECT_TAG + " New Review: " + pageName + " by " + name;
  var body =
    "Hi Bhaskar,\n\n" +
    name + " just reviewed the '" + pageName + "' page.\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "PAGE:   " + pageName + "\n" +
    "URL:    " + pageUrl + "\n\n" +
    "RATINGS:\n" + ratingLines + "\n\n" +
    "WHAT THEY LIKED:\n" + liked + "\n\n" +
    "WHAT NEEDS CHANGE:\n" + improve + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
    "→ Open sheet to respond: " + ssUrl + "\n\n" +
    "Fill Column O (Decision) + Column P (Notes) + Column Q (Response to Team).\n" +
    "As soon as you fill Column Q, an email goes out to " + name + " automatically.\n\n" +
    "— Qorium Review System";

  _sendMail(CONFIG.CTO_EMAIL, subject, body);
}

function _emailReviewer_CTOResponse(sheet, row) {
  var pageName     = sheet.getRange(row, C.PAGE).getValue();
  var reviewerName = sheet.getRange(row, C.NAME).getValue();
  var reviewerEmail = sheet.getRange(row, C.EMAIL).getValue();
  var decision     = sheet.getRange(row, C.DECISION).getValue();
  var response     = sheet.getRange(row, C.RESPONSE).getValue();
  var prLink       = sheet.getRange(row, C.PR_LINK).getValue();

  var subject = CONFIG.SUBJECT_TAG + " CTO Response — " + pageName;
  var body =
    "Hi " + reviewerName + ",\n\n" +
    "Thank you for reviewing the '" + pageName + "' page!\n\n" +
    "CTO Decision: " + decision + "\n\n" +
    response +
    (prLink ? "\n\nChanges are live — see: " + prLink : "") +
    "\n\n— Qorium CTO Office";

  // Email reviewer if they left their email; always CC the CTO
  var to = (reviewerEmail && reviewerEmail.indexOf("@") > 0) ? reviewerEmail : CONFIG.CTO_EMAIL;
  _sendMail(to, subject, body, CONFIG.CTO_EMAIL);
}

function _emailCTO_ChatQuestion(name, question, row, sheet) {
  var ssUrl   = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var subject = CONFIG.SUBJECT_TAG + " Question from " + name;
  var body =
    name + " posted a question in the Chat sheet (row " + row + "):\n\n" +
    '"' + question + '"\n\n' +
    "→ Open the sheet to reply: " + ssUrl + "\n" +
    "Go to tab '💬 Chat with CTO' → Row " + row + " → fill Column E (CTO Response).\n" +
    "They'll get an email the moment you type your reply.\n\n" +
    "— Qorium Review System";
  _sendMail(CONFIG.CTO_EMAIL, subject, body);
}

function _emailReviewer_ChatReply(sheet, row) {
  var name     = sheet.getRange(row, 2).getValue() || "Team Member";
  var email    = sheet.getRange(row, 4).getValue();
  var question = sheet.getRange(row, 3).getValue();
  var reply    = sheet.getRange(row, 5).getValue();

  var subject = CONFIG.SUBJECT_TAG + " CTO replied to your question";
  var body =
    "Hi " + name + ",\n\n" +
    "CTO has replied to your question:\n\n" +
    "YOUR QUESTION:\n" + question + "\n\n" +
    "CTO RESPONSE:\n" + reply + "\n\n" +
    "— Qorium Review System";

  var to = (email && email.indexOf("@") > 0) ? email : CONFIG.CTO_EMAIL;
  _sendMail(to, subject, body, CONFIG.CTO_EMAIL);
}

function _sendMail(to, subject, body, cc) {
  try {
    var opts = { name: "Qorium Review System" };
    if (cc) opts.cc = cc;
    MailApp.sendEmail(to, subject, body, opts);
  } catch (err) {
    console.log("Email error: " + err.message);
  }
}

// ============================================================
// HELPERS
// ============================================================

function _today() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMM yyyy, HH:mm");
}

function _applyDecisionStatus(sheet, row, decision) {
  var map = {
    "✅ Approved — Ship As-Is": { text: "✅ Approved",   bg: "#d1fae5" },
    "🔧 Fix Required":          { text: "🔧 Fix Needed",  bg: "#fef3c7" },
    "⏳ Defer to Next Sprint":  { text: "⏳ Deferred",    bg: "#ede9fe" },
    "📢 Escalate to Founder":   { text: "📢 Escalated",   bg: "#fee2e2" }
  };
  var entry = map[decision];
  if (!entry) return;
  var cell = sheet.getRange(row, C.STATUS);
  cell.setValue(entry.text).setBackground(entry.bg).setHorizontalAlignment("center");
}
