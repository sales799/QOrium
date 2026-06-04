# Codex Pro — QOrium Question Authoring (NON-STOP / fully autonomous)

Proof run already succeeded: 310 questions loaded, 0 flaws. Now run it hands-off to completion.

## PART A — Put Codex in non-stop mode (do this ONCE)
The task needs network (ssh/scp to the VPS), so Codex must run with no approval prompts AND full access.

**Easiest — launch a fresh session with these flags:**
```
codex --ask-for-approval never --sandbox danger-full-access
```
(or the shorthand YOLO mode: `codex --dangerously-bypass-approvals-and-sandbox`)

**Or inside your current session:** type `/approvals` and choose **Full Access / never ask**.

This is safe here because: it's your own Mac + your own VPS, the work is additive content authoring (no deletes), and the VPS loader re-checks every question before it goes live.

## PART B — Paste this NON-STOP prompt (replaces the old one)
```
CONTINUE FULLY AUTONOMOUS AND NON-STOP. Do NOT ask me to approve, confirm, or "proceed" — ever.
Do NOT stop between batches. Loop until the bank is complete. Report only to Telegram, never to me.

SSH host: talpro-vps (fallback: ssh -p 2244 root@147.93.103.194). Loader:
/opt/qorium/scripts/load-codex-questions.py  Inbound: /opt/qorium/content-inbound/

LOOP (repeat forever until the exit condition):
1. Get the next 50 under-covered skills:
   ssh talpro-vps 'sudo -u postgres psql -d qorium -tAc "SELECT name FROM content.skills s LEFT JOIN content.questions q ON q.skill_id=s.id GROUP BY s.id,s.name HAVING count(q.id)<10 ORDER BY count(q.id) ASC LIMIT 50"'
   EXIT CONDITION: if this returns 0 rows, send a final Telegram "QOrium authoring COMPLETE — every skill has 10+ questions" and STOP.
2. Author 50 questions at the SAME quality bar (self-solve and confirm the marked answer is correct + uniquely best; include code inline if referenced; exactly 4 distinct options; original, senior-level).
3. Write a compact JSONL (keys: skill_name, format, stem, options[4], answer_index, difficulty, explanation, reference_solution|null, test_cases|null), scp it to talpro-vps:/opt/qorium/content-inbound/, then:
   ssh talpro-vps 'sudo -u postgres python3 /opt/qorium/scripts/load-codex-questions.py /opt/qorium/content-inbound/<file>.jsonl'
4. If the loader reports SKIPPED>0, read the reasons, FIX those specific questions yourself, re-emit + re-load. Never ask me — just fix and continue.
5. Report progress to Telegram (NOT to me):
   ssh talpro-vps 'bash /opt/talpro-bot/scripts/talpro-cto-alert.sh "QOrium Codex authoring: +<loaded> this batch, codex-pro total <T>, skills under 10 left <U>" info qorium-codex'
6. Immediately start the next batch. Never wait for human input.

ERROR HANDLING: if any ssh/scp fails, retry 3x with backoff; if still failing, Telegram a warning and keep retrying every 10 minutes. Never halt the loop for human input.
```

## Independent monitoring (already running, server-side — doesn't depend on Codex)
- 30-min watch `qorium-codex-authoring-watch` Telegrams you on first-batch / progress / stall.
- Live dashboard `qorium-question-bank-live` + 3×/day digest count `codex-pro` totals.
So even if the Mac session dies, you'll be told.
