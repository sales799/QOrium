# Decisions

Generated: 2026-06-18

## D1: Keep the locked USP, but flag claim usage

The repo has constitution-backed tests requiring the locked USP in the press kit. Instead of removing it and breaking governance, this patch removes the superlative from the general boilerplate and adds a visible claim-use guardrail beside the locked sentence.

## D2: Use delegated analytics instead of making every CTA a client component

One root `AnalyticsEvents` listener tracks clicks and submits from `data-qorium-event` attributes. This keeps most marketing components server-rendered and avoids a performance-heavy instrumentation pattern.

## D3: Preserve existing user changes to solution canonicalization

The worktree already contained local changes that redirected old solution URLs and removed them from the sitemap. This patch adds tests and audit documentation around those changes rather than replacing them.

## D4: Avoid legal overreach

The legal pages still need counsel approval. The patch does not claim approval; it reframes the public pages as informational review copies and states that signed contracts control transactions.
