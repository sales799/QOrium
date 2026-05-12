# JDs ready to post

CEO copy-paste destination for hiring posts. Each role has two files:

- `<role>-linkedin.md` — long-form LinkedIn post copy (max ~1300 chars per LinkedIn post body before "see more"; we use the full ~3000 char limit). Paste into LinkedIn's post composer; LinkedIn's editor handles hashtags + line breaks. Image (banner) is optional.
- `<role>-naukri.html` — rich-text HTML for Naukri.com employer posting. Naukri accepts inline HTML in the JD field. Paste into the JD WYSIWYG editor.

| Role | LinkedIn copy | Naukri copy | Source spec |
|---|---|---|---|
| Senior Engineer #1 | [`senior-engineer-1-linkedin.md`](./senior-engineer-1-linkedin.md) | [`senior-engineer-1-naukri.html`](./senior-engineer-1-naukri.html) | `../senior-engineer-1/JD.md` |
| SME Content Lead | [`sme-content-lead-linkedin.md`](./sme-content-lead-linkedin.md) | [`sme-content-lead-naukri.html`](./sme-content-lead-naukri.html) | `../sme-content-lead/JD.md` |
| I/O Psychologist (Contractor) | [`io-psych-contractor-linkedin.md`](./io-psych-contractor-linkedin.md) | [`io-psych-contractor-naukri.html`](./io-psych-contractor-naukri.html) | `../io-psych-contractor/SOW.md` |

Last refreshed: 2026-05-12 (Run #33).

Notes for the CEO before posting:
1. Replace `[DATE TBD]` with today's date in each post.
2. Update the apply-link if a separate ATS workflow exists; for now both files point to `careers@qorium.online` (alias on the live `qorium-mailer` Graph API path).
3. LinkedIn: add the QOrium company page tag and the relevant role hashtags listed at the bottom of each `-linkedin.md`. Use the QOrium logo as the post banner.
4. Naukri: the I/O Psych role is a contractor SOW, not a Naukri staple — skip Naukri for that one and use LinkedIn + direct outreach only.
