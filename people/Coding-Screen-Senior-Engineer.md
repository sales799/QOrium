# QOrium — Coding Screen: Senior Engineer
**Role:** Senior Engineer — Content Engine
**Date:** May 2, 2026
**Duration:** 3 hours suggested (max 5 hours)
**Framework:** Node.js + TypeScript + Postgres (or SQLite for take-home)

---

## Brief: Build a Question-Bank Microservice

You are implementing the core **ReadyBank Service** — a REST API that manages a question library, supports flexible searching, and computes difficulty estimates via classical test theory.

### Core Endpoints

```
POST /questions
  Input: { skill_id, sub_skill_id, difficulty, body, answer, choices?, format }
  Output: { question_id, ... } (201 Created)

GET /questions/:id
  Output: { question_id, skill_id, difficulty, body, answer, choices, created_at, updated_at }

GET /questions/search
  Query params: skill_id, sub_skill_id, difficulty_min, difficulty_max, limit, offset, q (full-text search)
  Output: { questions: [...], total_count, limit, offset }

POST /questions/:id/calibrate
  Input: { candidate_responses: [{ candidate_id, is_correct }, ...] }
  Output: { question_id, difficulty_estimate, discrimination_estimate, new_difficulty_b }
```

### Key Requirements

- **Framework:** Express.js or Fastify (TypeScript)
- **Database:** PostgreSQL or SQLite (migrations required)
- **API Spec:** OpenAPI 3.1 (auto-generated preferred)
- **Testing:** vitest; ≥2 test paths per endpoint (happy path + error)
- **Quality bar:**
  - Clean separation: router → service → repository
  - No SQL injection (parameterized queries)
  - API key authentication (header: `x-api-key`)
  - Migrations tracked (migrations/ folder)
  - .env.example included (no secrets in code)
  - README with setup + examples

---

## Tech Stack Expectations

- **Node.js 18+** + TypeScript (strict mode)
- **Database:** Postgres (recommended) OR SQLite for portability
- **ORM/Query:** Prisma, TypeORM, or raw parameterized SQL (not string interpolation)
- **API docs:** OpenAPI 3.1 spec (swagger-jsdoc or equivalent)
- **Testing:** vitest + supertest for HTTP tests
- **Linting:** ESLint, Prettier
- **Deployment:** Docker-ready (Dockerfile + docker-compose.yml optional)

---

## Submission Checklist

- [ ] GitHub private repo (invite: [specified GitHub handle])
- [ ] README with setup instructions (npm install, npm run dev, npm test)
- [ ] .env.example with required vars
- [ ] Database migrations (schema.sql or migrations/ folder)
- [ ] OpenAPI spec (swagger.yaml or endpoint at /api-docs)
- [ ] Test suite (npm test passes, ≥50 test cases across all endpoints)
- [ ] No hardcoded secrets or API keys
- [ ] Code organized (src/routes, src/services, src/repositories)

---

## Evaluation Rubric (1–5 per dimension, 8 dimensions)

| Dimension | Descriptor | 1 | 3 | 5 |
|---|---|---|---|---|
| **Code Organization** | Router/service/repo separation, clear responsibilities | All logic in one file | Clear layers; some mixing | Clean separation; testable layers |
| **API Design** | REST conventions, error codes, pagination, versioning | Ad-hoc endpoints; no error spec | Standard error codes; basic pagination | RFC 7807 errors; cursor pagination; versioning strategy |
| **Data Model + Migrations** | Schema design, indexes, type safety, safe migrations | No schema plan | Basic schema; some indexes | Thoughtful schema; indexes for sub-200ms queries; migration safety |
| **Test Quality** | Coverage, happy path + error cases, no false positives | No tests | 40–50% coverage; 1 error case | 70%+ coverage; happy + 2 error paths; clear test names |
| **Documentation** | README clarity, API docs, code comments | Minimal / missing | Basic README; OpenAPI stub | Clear README; full OpenAPI spec; inline comments where needed |
| **Security Awareness** | Parameterized queries, API key auth, secrets management | SQL injectable; no auth | Parameterized queries; API key check; some env vars | Parameterized queries; validated auth; .env.example; rate limiting |
| **Calibration Logic** | Classical test theory implementation (difficulty estimate) | No calibration logic | Basic difficulty calc (% correct) | Proper CTT: difficulty b, discrimination a, confidence bounds |
| **Production Readiness** | Error handling, logging, graceful degradation, dockerfile | Crashes on error; no logging | Try-catch blocks; basic logging | OpenTelemetry instrumentation; Dockerfile; health checks |

---

## Submission Format

```
repo/
├── README.md (setup + examples)
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts (app entry)
│   ├── routes/ (router definitions)
│   ├── services/ (business logic)
│   ├── repositories/ (data access)
│   ├── middleware/ (auth, logging)
│   └── types/ (TypeScript interfaces)
├── tests/ (vitest suite)
├── migrations/ (schema.sql or migration scripts)
├── swagger.yaml (OpenAPI spec)
├── Dockerfile (optional)
└── .gitignore (no .env, node_modules)
```

---

## Time Guidance

- **Initial setup (tooling + schema):** 30 min
- **Router + service skeleton:** 30 min
- **Database + migrations:** 30 min
- **POST /questions endpoint:** 45 min
- **GET /questions/:id + /questions/search endpoints:** 45 min
- **POST /questions/:id/calibrate endpoint:** 45 min
- **Tests + documentation:** 45 min
- **Total:** ~4 hours

**Red flag if:** Candidate takes >5 hours (signals over-engineering or slow execution).

---

## Anti-Cheat Note

**No LLM prohibition.** Per Constitution SO-24, we expect AI-assisted development. You may use Claude, ChatGPT, etc. to generate boilerplate, test scaffolding, or debugging help. **R3 interviewers will specifically ask:** "Walk me through how you used AI in this project. What did the AI do well? What did you have to fix?"

Evaluation focuses on **critical decisions** (schema design, calibration logic, error handling), not on raw code generation speed. If you use AI, be ready to explain your design choices.

---

## Seed Data

Provided as JSON inline. Generate 50 rows following this shape:

```json
[
  {
    "skill_id": 1,
    "sub_skill_id": 101,
    "difficulty": 0.65,
    "format": "mcq",
    "body": "In Node.js, what does the 'require()' function do?",
    "answer": "Loads a module and returns its exports",
    "choices": [
      "Loads a module and returns its exports",
      "Deletes a module from memory",
      "Initializes a new variable scope",
      "Compiles TypeScript to JavaScript"
    ],
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-01T10:00:00Z"
  },
  {
    "skill_id": 1,
    "sub_skill_id": 102,
    "difficulty": 0.45,
    "format": "coding",
    "body": "Write a function that reverses a string without using .reverse().",
    "answer": "function reverseString(s) { let result = ''; for (let i = s.length - 1; i >= 0; i--) { result += s[i]; } return result; }",
    "choices": null,
    "created_at": "2026-05-01T10:05:00Z",
    "updated_at": "2026-05-01T10:05:00Z"
  },
  {
    "skill_id": 2,
    "sub_skill_id": 201,
    "difficulty": 0.72,
    "format": "mcq",
    "body": "In React, what does the useEffect hook with an empty dependency array do?",
    "answer": "Runs once after the component mounts",
    "choices": [
      "Runs once after the component mounts",
      "Runs every time the component re-renders",
      "Runs when a specific dependency changes",
      "Runs before the component unmounts"
    ],
    "created_at": "2026-05-01T10:10:00Z",
    "updated_at": "2026-05-01T10:10:00Z"
  },
  {
    "skill_id": 3,
    "sub_skill_id": 301,
    "difficulty": 0.58,
    "format": "coding",
    "body": "Write a SQL query to find the top 3 departments by number of employees.",
    "answer": "SELECT department_id, COUNT(*) as emp_count FROM employees GROUP BY department_id ORDER BY emp_count DESC LIMIT 3;",
    "choices": null,
    "created_at": "2026-05-01T10:15:00Z",
    "updated_at": "2026-05-01T10:15:00Z"
  },
  {
    "skill_id": 1,
    "sub_skill_id": 103,
    "difficulty": 0.82,
    "format": "design",
    "body": "Design a caching strategy for a high-traffic question API. Assume 40,000 questions, 10K req/min, <200ms latency SLA.",
    "answer": "Use Redis for L1 cache (hot questions, 1hr TTL), PostgreSQL connection pooling (PgBouncer), and query optimization (indexes on skill_id + difficulty).",
    "choices": null,
    "created_at": "2026-05-01T10:20:00Z",
    "updated_at": "2026-05-01T10:20:00Z"
  },
  {
    "skill_id": 2,
    "sub_skill_id": 202,
    "difficulty": 0.40,
    "format": "coding",
    "body": "Implement a debounce function in JavaScript.",
    "answer": "function debounce(fn, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); }; }",
    "choices": null,
    "created_at": "2026-05-01T10:25:00Z",
    "updated_at": "2026-05-01T10:25:00Z"
  }
]

// (Generate 42 more rows following the same shape, varying:
// - skill_id (1-5 for Node, React, SQL, Java, Python)
// - sub_skill_id (unique per skill)
// - difficulty (0.0 to 1.0 distributed across range)
// - format ('mcq', 'coding', 'design')
// - body (realistic hiring questions for each skill)
// - answer (correct answer or reference solution)
// - choices (array for MCQ; null for coding/design)
```

---

## Calibration Logic: Classical Test Theory

When `POST /questions/:id/calibrate` is called with candidate responses, compute:

```
difficulty_b = (# correct) / (# responses)
discrimination_a = point-biserial correlation(correct/incorrect, overall_score)
  = simplified: count(correct_from_high_scorers) - count(correct_from_low_scorers)
```

**Example:**
- 100 candidates take this question
- 60 get it right → difficulty_b = 0.60 (moderately hard)
- Top 25 scorers: 22 correct (88%)
- Bottom 25 scorers: 10 correct (40%)
- Discrimination = 88% - 40% = 0.48 (good signal)

**Update `questions.difficulty_b` with the computed value.**

---

## Bonus Challenges (Optional)

1. **Anti-leak rotation logic:** Variant generation with watermark seed. Given a question ID + watermark seed, generate a variant (rephrase key terms, reorder options). Useful for leak detection.

2. **IRT 3PL fit:** Use a small library (e.g., `irt-js` or custom implementation) to fit 3PL parameters (difficulty b, discrimination a, guessing c) for MCQ questions. Report discrimination as a key metric.

3. **Rate limiting:** Add middleware to rate-limit by API key (e.g., 100 req/min per key).

---

## Interpretation Guide: Rubric Scores → Hire/No-Hire Signal

**Score 4–5 on most dimensions:**
- Strong hire. Demonstrates IC4 capability. Code is production-ready, well-tested, thoughtfully architected. Ship with confidence.

**Score 3–4 (mixed):**
- Hire with mentoring. Code works; may have gaps in one area (e.g., test coverage is 50% not 70%, or security could be tighter). Mentee will level up quickly with guidance.

**Score 2–3:**
- Marginal. Significant gaps. Works locally but not production-ready. Missing security, insufficient tests, or poor architecture. Consider additional pairing before final decision.

**Score <2 on any dimension:**
- No-hire. Critical gap. Either logic is broken, SQL injection risk, or code is unmaintainable. Move on.

---

## Reference Solution Grading

**CTO Office should grade 1 reference solution before first candidate takes the test.** This ensures:
- Rubric calibration (what does 5/5 mean for Code Organization?).
- Test integrity (no trick questions in data or spec).
- Time estimate is realistic (does it take 3 hours or 6?).

**Reference solution should:**
- Clean TypeScript (no `any` without justification)
- Parameterized SQL (no injection)
- 70%+ test coverage
- OpenAPI spec generated
- README with setup + examples
- Target 3.5–4 hours of work (leaving 30 min buffer for edge cases)

---

## Calibration Checklist (Before First Candidate)

- [ ] Reference solution built + timed (CTO builds it or witnesses build)
- [ ] Reference solution tests pass (npm test 100% pass)
- [ ] Reference solution graded on rubric (CTO assigns scores 1–5 per dimension)
- [ ] GitHub repo template created (candidate invites tested)
- [ ] Seed data JSON validated (no syntax errors)
- [ ] Postman collection provided to candidate (optional but helpful)
- [ ] Time estimate reviewed (3 hours? 5 hours max?)

---

## Post-Submission Grading Flow

1. **Candidate submits GitHub repo link.**
2. **CTO clones, installs, runs npm test.**
3. **If tests fail:** Return to candidate: "Tests are failing on [endpoint]. Debug and resubmit within 24h." (One resubmit allowed.)
4. **If tests pass:** Grade rubric (Code Organization, API Design, etc.). Assign 1–5 per dimension. Average for final score.
5. **If score 4+:** Move to R3 (cross-functional round). Prepare to discuss: "Walk me through your calibration logic" + "What would you change if you had 8 hours instead of 3?"
6. **If score 3:** Schedule R3; flag as "needs mentoring" in notes.
7. **If score <3:** No-hire. Send feedback: "Your code works, but [gap] needs strengthening. Good luck with your next opportunity."

---

**End of Coding Screen. Last updated: May 2, 2026.**
