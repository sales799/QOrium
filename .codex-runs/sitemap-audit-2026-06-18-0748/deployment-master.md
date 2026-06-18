# Deployment Master

Run folder: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/.codex-runs/sitemap-audit-2026-06-18-0748`
Generated: 2026-06-18T02:45:26.181Z
Source sitemap CSV: `/Users/talprouniversepro/Downloads/QOrium Complete Sitemap - 2026-06-17 - Sitemap URLs.csv`

Status: deployed and live-verified for the latest `/try/jd-forge` continuation.

## Deployment Evidence

- Code/design commit: `8fc2a04` (`fix(qorium): polish graded answer proof page`)
- Branch: `codex/qorium-jd-forge-url-audit-20260617`
- GitHub Actions workflow: `Deploy marketing site`
- Deployment run: `27735942871`
- Workflow result: PASS
- Built-in live smoke test: PASS
- Verified URL: `https://qorium.online/try/graded-answer`
- Independent live Playwright: PASS on desktop and mobile

## Remaining Warnings

- GitHub Actions reports the known `actions/checkout@v4` Node 20 deprecation annotation while forcing Node 24.
- Dependency audit remains green at the high threshold; 3 moderate advisories are documented as non-blocking.

## JD-Forge Deployment Evidence

- Code/design commits: `ba35a55` (`fix(qorium): polish jd forge proof page`), `5fc3f97` (`fix(qorium): include analytics helper for jd forge`), `08675b2` (`fix(qorium): improve jd forge proof contrast`)
- Branch: `codex/qorium-jd-forge-url-audit-20260617`
- GitHub Actions workflow: `Deploy marketing site`
- Failed intermediate deployment run: `27737108869` (missing tracked analytics helper; repaired by `5fc3f97`)
- Final deployment run: `27737497276`
- Workflow result: PASS
- Built-in live smoke test: PASS
- Verified URL: `https://qorium.online/try/jd-forge`
- Independent live Playwright: PASS on desktop and mobile
