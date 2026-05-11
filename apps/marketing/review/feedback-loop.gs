/**
 * QOrium Web Review — Feedback Loop
 * --------------------------------------------------------------------------
 * Apps Script that wires the review sheet into a 2-way conversation:
 *
 *   1. Reviewer fills a row, clicks anywhere outside the cell → onEdit fires.
 *   2. Script detects "submission complete" (overall rating + at least one
 *      free-text column filled) → emails CTO with the row contents.
 *   3. CTO triages: writes "CTO Response" + sets "Status" to one of the
 *      allowed values (In Review / Done / Won't Fix / Needs Discussion).
 *   4. When CTO sets Status = Done OR fills CTO Response, script emails
 *      the reviewer back with the response. They can re-rate if needed.
 *
 * Setup (one-time, ~5 min) — see review/README.md.
 *
 * Script Properties used (Project Settings → Script Properties):
 *   CTO_EMAIL          (required)  e.g. ceo@qorium.online
 *   CTO_NAME           (optional)  default "CTO Office"
 *   SHEET_TAB_NAME     (optional)  default "Reviews"
 *
 * Deferred (cred-bound, Tier 2):
 *   ANTHROPIC_API_KEY  → would let the script auto-draft a CTO response.
 *   Skipped today per CTO Auto-Mode-Remote-Plan stop conditions.
 * --------------------------------------------------------------------------
 */

// ----- column indices (1-based, matches the CSV template) -----
const COL = {
  NUM: 1,
  PAGE_NAME: 2,
  PAGE_URL: 3,
  REVIEWER_NAME: 4,
  REVIEWER_ROLE: 5,
  REVIEW_DATE: 6,
  RATING_VISUAL: 7,
  RATING_COPY: 8,
  RATING_PERF: 9,
  RATING_MOBILE: 10,
  RATING_TRUST: 11,
  RATING_CONVERT: 12,
  RATING_OVERALL: 13,
  WHAT_WORKED: 14,
  WHAT_DIDNT: 15,
  CHANGE_REQUESTED: 16,
  STATUS: 17,
  CTO_RESPONSE: 18,
  PR_LINK: 19,
  RESOLVED_ON: 20,
};

const STATUS_OPTIONS = ['New', 'In Review', 'Done', "Won't Fix", 'Needs Discussion'];

/**
 * Main trigger. Wired via `onEditTrigger()` (run once during setup).
 */
function onEditHandler(e) {
  const sh = e.range.getSheet();
  const props = PropertiesService.getScriptProperties();
  const expectedTab = props.getProperty('SHEET_TAB_NAME') || 'Reviews';
  if (sh.getName() !== expectedTab) return;

  const row = e.range.getRow();
  if (row < 2) return; // skip header

  const editedCol = e.range.getColumn();
  const ctoEmail = props.getProperty('CTO_EMAIL');
  if (!ctoEmail) {
    console.warn('CTO_EMAIL not set in Script Properties — emails skipped.');
    return;
  }
  const ctoName = props.getProperty('CTO_NAME') || 'CTO Office';

  // Branch 1: reviewer just filled a row → notify CTO
  if (isReviewerSubmissionComplete(sh, row) && editedCol < COL.STATUS) {
    notifyCTOOfNewFeedback(sh, row, ctoEmail, ctoName);
    return;
  }

  // Branch 2: CTO filled response or set Status=Done → notify reviewer
  if (editedCol === COL.CTO_RESPONSE || editedCol === COL.STATUS) {
    const status = readCell(sh, row, COL.STATUS);
    const ctoResp = readCell(sh, row, COL.CTO_RESPONSE);
    if (ctoResp && (status === 'Done' || status === "Won't Fix")) {
      notifyReviewerOfResolution(sh, row, ctoName);
      // stamp resolved date if not already set
      if (!readCell(sh, row, COL.RESOLVED_ON)) {
        sh.getRange(row, COL.RESOLVED_ON).setValue(new Date());
      }
    }
  }
}

function isReviewerSubmissionComplete(sh, row) {
  const overall = readCell(sh, row, COL.RATING_OVERALL);
  const reviewer = readCell(sh, row, COL.REVIEWER_NAME);
  const anyFeedback =
    readCell(sh, row, COL.WHAT_WORKED) ||
    readCell(sh, row, COL.WHAT_DIDNT) ||
    readCell(sh, row, COL.CHANGE_REQUESTED);
  return Boolean(overall && reviewer && anyFeedback);
}

function notifyCTOOfNewFeedback(sh, row, ctoEmail, ctoName) {
  const data = readRow(sh, row);
  const subject = `[QOrium Review] ${data.pageName} — ${data.reviewerName} — ${data.overall}/5`;
  const url = sh.getRange(row, 1).getRichTextValue
    ? `${sh.getParent().getUrl()}#gid=${sh.getSheetId()}&range=A${row}`
    : sh.getParent().getUrl();
  const body = [
    `New review submitted on ${data.pageName}.`,
    ``,
    `Reviewer: ${data.reviewerName} (${data.reviewerRole || 'role not given'})`,
    `Page: ${data.pageUrl}`,
    `Overall: ${data.overall}/5`,
    `Ratings: visual ${data.rVisual} · copy ${data.rCopy} · perf ${data.rPerf} · mobile ${data.rMobile} · trust ${data.rTrust} · convert ${data.rConvert}`,
    ``,
    `What worked:`,
    data.whatWorked || '  (none)',
    ``,
    `What didn't work:`,
    data.whatDidnt || '  (none)',
    ``,
    `Specific change requested:`,
    data.changeRequested || '  (none)',
    ``,
    `--`,
    `Open the row to triage:`,
    url,
    ``,
    `Allowed Status values: ${STATUS_OPTIONS.join(' · ')}`,
    `Fill "CTO Response" + set Status=Done — reviewer gets emailed automatically.`,
  ].join('\n');

  MailApp.sendEmail({
    to: ctoEmail,
    subject,
    body,
    name: 'QOrium Review Bot',
  });

  // mark status if still blank
  if (!readCell(sh, row, COL.STATUS)) {
    sh.getRange(row, COL.STATUS).setValue('New');
  }
}

function notifyReviewerOfResolution(sh, row, ctoName) {
  const data = readRow(sh, row);
  const reviewerEmail = guessReviewerEmail(data.reviewerName);
  if (!reviewerEmail) {
    console.warn(`No email guessable for reviewer "${data.reviewerName}"; skipping.`);
    return;
  }
  const subject = `[QOrium] Your review on ${data.pageName} — ${data.status}`;
  const body = [
    `Hi ${data.reviewerName.split(' ')[0]},`,
    ``,
    `Thanks for the review on ${data.pageName} (${data.pageUrl}).`,
    ``,
    `Status: ${data.status}`,
    ``,
    `Response from ${ctoName}:`,
    data.ctoResponse,
    ``,
    data.prLink ? `Linked commit/PR: ${data.prLink}` : '',
    ``,
    `If you want to re-review the page after the change, open the sheet and add a new row — or update your existing row's ratings.`,
    ``,
    `— QOrium ${ctoName}`,
  ]
    .filter(Boolean)
    .join('\n');

  MailApp.sendEmail({
    to: reviewerEmail,
    subject,
    body,
    name: 'QOrium Review Bot',
  });
}

/**
 * Reviewer email guess. Override here if you maintain a name→email lookup
 * elsewhere. Default: assumes `firstname.lastname@qorium.online`.
 */
function guessReviewerEmail(name) {
  if (!name) return null;
  const parts = String(name).trim().toLowerCase().split(/\s+/);
  if (parts.length < 1) return null;
  const handle = parts.length === 1 ? parts[0] : `${parts[0]}.${parts[parts.length - 1]}`;
  return `${handle}@qorium.online`;
}

function readCell(sh, row, col) {
  const v = sh.getRange(row, col).getValue();
  return v === '' || v === null || v === undefined ? null : v;
}

function readRow(sh, row) {
  return {
    num: readCell(sh, row, COL.NUM),
    pageName: readCell(sh, row, COL.PAGE_NAME),
    pageUrl: readCell(sh, row, COL.PAGE_URL),
    reviewerName: readCell(sh, row, COL.REVIEWER_NAME),
    reviewerRole: readCell(sh, row, COL.REVIEWER_ROLE),
    reviewDate: readCell(sh, row, COL.REVIEW_DATE),
    rVisual: readCell(sh, row, COL.RATING_VISUAL),
    rCopy: readCell(sh, row, COL.RATING_COPY),
    rPerf: readCell(sh, row, COL.RATING_PERF),
    rMobile: readCell(sh, row, COL.RATING_MOBILE),
    rTrust: readCell(sh, row, COL.RATING_TRUST),
    rConvert: readCell(sh, row, COL.RATING_CONVERT),
    overall: readCell(sh, row, COL.RATING_OVERALL),
    whatWorked: readCell(sh, row, COL.WHAT_WORKED),
    whatDidnt: readCell(sh, row, COL.WHAT_DIDNT),
    changeRequested: readCell(sh, row, COL.CHANGE_REQUESTED),
    status: readCell(sh, row, COL.STATUS),
    ctoResponse: readCell(sh, row, COL.CTO_RESPONSE),
    prLink: readCell(sh, row, COL.PR_LINK),
    resolvedOn: readCell(sh, row, COL.RESOLVED_ON),
  };
}

/**
 * Run ONCE from the Apps Script editor to install the trigger.
 * Apps Script editor → choose function "installOnEditTrigger" → click ▶ Run.
 * Grant the requested permissions (gmail.send + spreadsheet read/write).
 */
function installOnEditTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Remove existing onEdit triggers for this script to avoid duplicates
  const existing = ScriptApp.getProjectTriggers();
  existing.forEach((t) => {
    if (t.getHandlerFunction() === 'onEditHandler') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('onEditHandler').forSpreadsheet(ss).onEdit().create();
  SpreadsheetApp.getUi().alert(
    'QOrium Review Bot trigger installed. CTO will receive an email on every new submission. Reviewers receive a reply when CTO marks Status=Done with a response.',
  );
}

/**
 * Convenience: print current Script Properties so CTO can verify config
 * without opening Project Settings. Run from the editor.
 */
function showConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const ui = SpreadsheetApp.getUi();
  const lines = Object.keys(props).length
    ? Object.entries(props)
        .map(([k, v]) => `${k}: ${k === 'ANTHROPIC_API_KEY' ? '<redacted>' : v}`)
        .join('\n')
    : '(no Script Properties set yet — see review/README.md step 5)';
  ui.alert('Script Properties', lines, ui.ButtonSet.OK);
}
