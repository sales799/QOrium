# QOrium Phase D — Integration Depth (CTO 2026-06-03)
_M13 JD-Forge roles · M19 ATS · M20 Public API + SDK/Postman_

## M13 — JD-Forge roles: **SEEDED ✅ (done, live in DB)**
`content.roles` = 15 roles, `content.role_skills` = 120 weighted role→sub-skill links (top 8 sub-skills per role, weight normalised 0–1 by question coverage). Roles map 1:1 to the 15 canonical launch skills (Java, AWS, DevOps, React, Python, SQL/Data, SQL, Salesforce CPQ/Dev/Admin, SAP ABAP, Oracle HCM, Embedded Automotive, Finacle/Flexcube, AI Prompt Engineer). JD-Forge can now compose a role-based assessment instead of returning thin output.
**Lane tuning (active origin):** verify JD-Forge reads `role_skills.weight` for section weighting; expose role picker in the builder; "paste JD → match to nearest seeded role → compose" path. Exit: JD→assessment ≤60s, ≥70% human-accept.

## M20 — Public API: SDK examples + Postman (deploy-ready)
Auth: `Authorization: Bearer <api_key>` (app.api_keys; prefix + hashed_key; scopes; rate_limit_per_min). Base: `https://api.qorium.online/v1`. Finalize paths against the openapi spec once restored.

### Node (fetch)
```js
const QORIUM = "https://api.qorium.online/v1";
const KEY = process.env.QORIUM_API_KEY;
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// list skills
const skills = await (await fetch(`${QORIUM}/skills`, { headers: h })).json();

// create an assessment pack for a role
const pack = await (await fetch(`${QORIUM}/packs`, {
  method: "POST", headers: h,
  body: JSON.stringify({ role: "senior-java-developer", question_count: 25 })
})).json();

// invite a candidate
const invite = await (await fetch(`${QORIUM}/candidates`, {
  method: "POST", headers: h,
  body: JSON.stringify({ pack_id: pack.id, email: "candidate@example.com" })
})).json();
console.log(invite.assessment_url);
```

### Python (requests)
```python
import os, requests
B="https://api.qorium.online/v1"; H={"Authorization":f"Bearer {os.environ['QORIUM_API_KEY']}"}
skills = requests.get(f"{B}/skills", headers=H).json()
pack = requests.post(f"{B}/packs", headers=H, json={"role":"senior-java-developer","question_count":25}).json()
invite = requests.post(f"{B}/candidates", headers=H, json={"pack_id":pack["id"],"email":"candidate@example.com"}).json()
results = requests.get(f"{B}/results", headers=H, params={"pack_id":pack["id"]}).json()
```

### Webhook (HMAC-signed)
```
POST <your endpoint>   X-QOrium-Signature: sha256=<hmac(body, signing_secret)>
{ "event":"assessment.completed", "candidate_id":"...", "pack_id":"...", "score":0.82,
  "reasoning_trace_ref":"...", "irt_status":"model-estimated" }
```
Verify: `hmac.compare_digest(sig, hmac_sha256(secret, raw_body))`. Errors: RFC 7807 Problem Details.

### Postman collection (skeleton → `/docs`)
Folders: Auth · Skills (GET /skills) · Packs (POST /packs, GET /packs/:id) · Candidates (POST /candidates, GET /candidates/:id) · Results (GET /results) · Webhooks (config + test). Collection variable `{{base}}` + `{{api_key}}`. Ship downloadable from `/resources/docs`.

## DISPATCH (lanes)
- **active origin/ARJUN:** finalize JD-Forge role weighting + builder picker; restore openapi.json (Phase B B3) then publish SDK pages + Postman download at `/resources/docs`; RFC 7807 errors on all endpoints.
- **M19 ATS smoke (BHIMA):** test ats-bridge round-trip against **2 real ATS sandboxes** (Greenhouse + Lever or Naukri RMS): create-candidate from ATS → assessment auto-sent → result pushed back to `ats_candidate_links.assessment_score`. Exit: 2 sandboxes green.
- **Guardrail:** webhook/result payloads carry `irt_status:"model-estimated"` until empirical; never claim "calibrated". Cross-account review.
