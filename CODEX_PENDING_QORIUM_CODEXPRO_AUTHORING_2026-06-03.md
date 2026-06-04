# CODEX PENDING — QOrium Question Authoring via CODEX PRO (Mac build lane)
**Filed:** 2026-06-03 by Claude (CTO), CEO-directed ("no compromise on quality — use Codex Pro, not free LLM").
**Lane:** KARYA — must run on a Mac (BHIMA `bhaskar@talpro.in` or ARJUN `bhaskar@talproindia.com`) where **Codex Pro 20×** is authenticated. The VPS cannot reach Codex Pro; only a Mac lane can.
**Priority:** HIGH. **Branch:** `codex/qorium-codexpro-authoring`.

## Why this exists
The free-Qwen factory is PAUSED (CEO: quality non-negotiable). Free output had a 33% flaw rate. Live bank holds at the original **986** released. Authoring now runs on **Codex Pro** (flat-rate, already paid, GPT-5-Codex-class) via this lane. The VPS-side loader + structural gate are already built and tested.

## What's already in place (VPS, ready)
- Loader: `/opt/qorium/scripts/load-codex-questions.py` — imports a JSONL batch → `content.questions` as `status='released'`, `authored_by='codex-pro'`, `source_corpus='codex-pro'`. Re-runs the hard structural gate (4 options, valid answer index, no "references unshown code", no dup options) and rejects bad lines.
- Inbound dir: `/opt/qorium/content-inbound/` on talpro-vps (147.93.103.194; SSH alias `qorium-active-origin`/`talpro-vps`).
- Worklist source: skills with <10 questions (deficit ~4,500). Query live (see below).

## The lane's loop (run on the Mac, using Codex Pro)
1. **Get the worklist** (ssh to VPS):
   `ssh talpro-vps "sudo -u postgres psql -d qorium -tAc \"SELECT s.name FROM content.skills s LEFT JOIN content.questions q ON q.skill_id=s.id GROUP BY s.id,s.name HAVING count(q.id)<10 ORDER BY count(q.id) LIMIT 50\""`
2. **Author with Codex Pro** — for each skill, generate ONE high-quality MCQ (or code question with `reference_solution` + `test_cases` where the skill is coding). Codex Pro must SELF-VERIFY each before emitting: (a) solve it and confirm the marked answer is correct and uniquely best; (b) if it references any code/component/snippet, the code MUST be inline; (c) not a verbatim public/LeetCode question; (d) exactly 4 options, no duplicates.
3. **Emit JSONL** — one object per line: `{"skill_name": "...", "format": "mcq|code", "stem": "...", "options": ["..","..","..",".."], "answer_index": 0-3, "difficulty": "medium|hard", "explanation": "...", "reference_solution": "...optional...", "test_cases": [...optional...]}`. Write to `qorium-codexpro-<batch>.jsonl`.
4. **Deliver + load**: `scp qorium-codexpro-<batch>.jsonl talpro-vps:/opt/qorium/content-inbound/` then `ssh talpro-vps "sudo -u postgres python3 /opt/qorium/scripts/load-codex-questions.py /opt/qorium/content-inbound/qorium-codexpro-<batch>.jsonl"`.
5. **Repeat** in batches of ~50 until `skills_under_10 = 0` (≈4,500 questions). Pace to respect the 20× quota shared with coding lanes — batch nightly/off-hours.

## Quality bar (non-negotiable, CEO directive)
Every emitted question must be one Codex Pro would stand behind for a real senior hire: correct + uniquely-best answer, self-contained, original, code-inline where referenced. The loader's structural gate is a backstop, not the bar — the bar is Codex Pro's own verification.

## Verify
After each batch: `ssh talpro-vps "sudo -u postgres psql -d qorium -tAc \"SELECT status,count(*) FROM content.questions WHERE source_corpus='codex-pro' GROUP BY status\""`. CEO dashboard `qorium-question-bank-live` + digest already track totals.

## Open / founder
- None to start beyond a Codex Pro lane actually running this on a Mac. (The VPS side is done.)
- The 8 free questions held in `sme_review` + 4 free drafts can be deleted later or upgraded by Codex Pro; ignore for now.
