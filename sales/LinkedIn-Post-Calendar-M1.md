# LinkedIn Post Calendar — QOrium M1 Soft-Launch

**Month:** May 2026 (4 weeks, 12 posts)
**Cadence:** 3 posts/week (Mon, Wed, Fri)
**Publishing:** 9 AM IST (Mon/Wed), 6 PM IST (Fri — higher engagement for founder voice)
**Owner:** CTO Office (QOrium team) + CEO Bhaskar Anand
**Approval:** All posts reviewed by CMO before scheduling
**Engagement:** CEO + CTO commit to first-hour engagement (respond to comments within 60 min of post)

---

## M1 Cadence Overview

| Week | Mon | Wed | Fri |
|---|---|---|---|
| **W1** | CTO: 92-point gate | Bhaskar: Free questions worry | Product: Bosch embedded questions |
| **W2** | CTO: Java leak study (5 methods) | Bhaskar: Quality > Quantity | Product: Customer Zero transparency |
| **W3** | Bhaskar: 7 structural moats | CTO: IRT calibration explainer | Hiring: Jobs JD post |
| **W4** | Bhaskar: Why no platforms first | CTO: Anti-leak rotation deep-dive | Product: Month 1 metrics close |

---

## 12 POSTS (Detailed)

---

### **W1 MON — "We just open-sourced our 92-point quality gate"**

**Format:** CTO Office voice
**Audience:** Engineering leaders, HR tech builders, hiring leaders who think about quality
**Best time:** Mon 9 AM IST

**Hook (3 lines, ~30 words):**
"Every QOrium release passes a 92-point quality gate before shipping to customers. We just published the full methodology. You can use this to audit your hiring questions."

**Body (160 words):**

Before we shipped a single line of code to customers, we wrote a constitution.

Not a business plan. Not a roadmap. A quality gate.

Because QOrium isn't a platform business. It's a content business. And content businesses succeed on one thing: trust.

Every question we ship comes with a promise: this question measures what we claim. This question isn't leaked. This question is unbiased. This question is validated by an I/O psychologist.

If we break that promise once, we break the product.

So we built a 92-point scorecard that every release must pass. 10 pillars cover the basics (security, monitoring, compliance). 12 QOrium-specific items cover the hard stuff (IRT calibration, leak detection, bias audits).

It's unsexy. It's slow. It's also the moat.

We're publishing the full gate on our blog today. If you're building HR tech, assessment platforms, or anything that touches hiring quality, you can adapt it for your product. (We'd be honored if you did.)

Rigorous products compound.

**CTA:**
"Read the full 92-point gate at [blog-link]. Comment 'methodology' for the detailed scoring rubric."

**Hashtags:**
#QOrium #HRTech #AssessmentQuality #QualityGate #CTO #EngineeringLeadership #Transparency

**Engagement plan:**
CTO Office monitors comments for first 2 hours. Respond to any technical questions about IRT, DIF, or audit methodology.

---

### **W1 WED — "An assessment that costs nothing should worry every hiring manager"**

**Format:** Bhaskar founder voice
**Audience:** Hiring leaders, CTOs, talent acquisition professionals
**Best time:** Wed 9 AM IST

**Hook (3 lines, ~35 words):**
"Your 'best' candidate scored 96% on your assessment. But the question they crushed? It's on GitHub. For free. Has been for 6 months."

**Body (175 words):**

This happened to us three weeks ago.

Candidate aced a Java Concurrency question on a Talpro India assessment. Hiring team got excited. Architect scheduled the onsite.

Mid-onsite, the architect asked a follow-up. Candidate froze. Then the architect said: "I think I saw this exact question on Stack Overflow last week."

He was right.

The question had leaked six months prior to a GitHub repo with 50K stars. The candidate memorized the answer. Didn't understand the concept.

We spent ₹75K assessing her. We spent 12 engineering hours on her onsite. We almost made an offer to someone who would fail in 90 days.

Here's what kept me awake: this isn't an edge case. This is the norm. Hiring leaders across India are unknowingly testing question memorization, not technical skill.

And the leaked questions are free. Your leaked questions are competing with free.

That's a broken incentive structure.

So we built something that costs money but guarantees: your questions never leak. Every time one does, we replace it. Per-customer variants. Watermarked. Forensically traceable.

The cost? ₹50K–₹500K/year to license a rotation-protected question bank.

The benefit? You actually know what you're measuring.

**CTA:**
"DM me if you want to audit your current question leakage. We'll scan your bank for free (no strings attached)."

**Hashtags:**
#Hiring #TechnicalAssessment #QuestionLeakage #TalentAcquisition #Quality #FairnessInHiring #India

**Engagement plan:**
Bhaskar engages directly for first 90 minutes. Respond to objections, DM inquiries personally.

---

### **W1 FRI — "QOrium just shipped its first 10 Embedded Automotive sample questions for a Bosch GCC pilot conversation"**

**Format:** Product update voice
**Audience:** GCC hiring leaders, automotive sector, enterprise TA teams
**Best time:** Fri 6 PM IST (founder hour boost)

**Hook (3 lines, ~30 words):**
"Bosch's Bengaluru GCC is piloting 10 bespoke Embedded C questions. Real, Automotive-relevant. Anti-leak-rotated daily. This is the Customer Zero moment."

**Body (180 words):**

Customer Zero isn't Talpro India alone anymore.

This week, we shipped a pilot set of 10 embedded C questions to Bosch GCC Bengaluru, tailored to their tech stack: microcontroller-level concurrency, AUTOSAR concepts, real-time constraints.

No generic coding questions. No "implement Dijkstra's algorithm." Real: "Design a state machine for an EV battery-management system that handles 5 concurrent sensor inputs."

They're currently assessing the first batch. Early feedback: "These feel like our actual hiring problems, not academic exercises."

Here's what matters: each question is watermarked with Bosch's ID. If any question leaks to GitHub or a coaching forum, we'll know it came from Bosch's pipeline. And we'll automatically rotate it within 48 hours.

That guarantee changes the incentive: Bosch can now build a hiring differentiator—unique questions that nobody else in the automotive GCC space is asking.

This is the Stack-Vault thesis working in real time.

5,000 more questions like this in the next 12 months.

**CTA:**
"If you lead a GCC or tech hiring team, comment 'sample' and we'll share a 5-question sample tailored to your domain."

**Hashtags:**
#Automotive #GCC #Hiring #India #EmbeddedC #AUTOSAR #AssessmentQuality #CustomerZero

**Engagement plan:**
Product team monitors, routes inquiries to sales.

---

### **W2 MON — "5 ways we detected leakage in 10 popular Java questions"**

**Format:** CTO Office data/technical
**Audience:** Technical leaders, assessment designers, hiring leaders who love data
**Best time:** Mon 9 AM IST

**Hook (3 lines, ~35 words):**
"We tested 5 leak-detection methods on 10 Java interview questions. 9 of 10 appeared verbatim in the top 3 Google results. Method breakdown inside."

**Body (190 words):**

Every interview question you think is unique might already be on the internet.

This week, we tested 10 popular Java mid-senior questions against 5 leak-detection methods:

1. **Direct text similarity (cosine):** 8/10 detected. Catches near-duplicates.
2. **Fingerprint hashing (MinHash):** 7/10 detected. Robust to minor rewording.
3. **Code AST normalization:** 2/8* detected (code-only). Catches variable renames.
4. **Search engine direct query:** 9/10 detected. Fastest method (47 sec average).
5. **AI plagiarism tools:** 1/10 detected. Worst performer (designed for AI-generated text, not human leaks).

*AST only applies to code questions.

Most striking finding: 9 out of 10 appeared verbatim in Google's first 3 results.

This tells us something important: **the leak problem isn't hidden. It's in plain sight. You just have to know how to look.**

We've open-sourced the full methodology in our latest blog post (link in comments). You can run the same analysis on your question bank.

The economics are grim: 10% leak rate = 3–5 bad hires per 1,000 candidates. Cost per bad senior hire: ₹50 lakh. Math yourself out.

**CTA:**
"Read the full study (with data tables) at [blog-link]. Comment 'methodology' for the detailed breakdown."

**Hashtags:**
#InterviewQuestions #LeakDetection #DataDriven #Java #TechnicalHiring #AssessmentQuality #Research

**Engagement plan:**
CTO Office responds to technical questions about methods, responds to objections about statistical rigor.

---

### **W2 WED — "Why 'question quality > question quantity' is the only thesis that survives an audit"**

**Format:** Bhaskar founder manifesto
**Audience:** Hiring leaders, assessment vendors, product leaders
**Best time:** Wed 9 AM IST

**Hook (3 lines, ~30 words):**
"You can ask 1,000 bad questions or 100 good ones. The 1,000 will leak faster. The 100 will predict performance."

**Body (170 words):**

The conventional wisdom in assessment is: more questions = better coverage.

It's wrong.

Here's why: **bad questions leak faster than good ones.** Why? Because they're more memorable. Because they're easier to pattern-match. Because coaching centers can commoditize them.

So the vendors with 10,000-question banks often have the most leakage. The questions that seemed like an advantage become a liability.

Meanwhile, vendors who maintain a smaller, ruthlessly-validated question bank don't leak. Why? Because each question is so specific, so tailored, so aligned to real hiring outcomes that coaching centers can't mass-produce it. It's not worth their time.

This is the thesis we're betting on at QOrium: **100 validated, IRT-calibrated, regularly-rotated questions will always beat 10,000 public, leaked, unvalidated ones.**

It's not sexy. It's not impressive on a sales sheet. But it's the only thesis that survives an audit.

Every question we ship is treated as an assertion: "This question predicts job performance in this role." If you can't prove that assertion, you have no right to ship the question.

That bar is high. Good. It should be.

**CTA:**
"How many questions are you actually validating per role? Share in comments. (I'm betting it's lower than you want to admit.)"

**Hashtags:**
#AssessmentDesign #QualityOverQuantity #ValidationRigor #TechnicalHiring #HRTech #IRT #TalentAcquisition

**Engagement plan:**
Bhaskar engages for first 2 hours. Respond to philosophical objections, share own hiring stories.

---

### **W2 FRI — "Customer Zero week 4: 27 candidates, 3 false-flag leaks, 1 product change"**

**Format:** Product update / transparency
**Audience:** Customers, early adopters, transparency enthusiasts
**Best time:** Fri 6 PM IST

**Hook (3 lines, ~30 words):**
"Talpro India ran 27 candidates through QOrium this month. Our anti-leak system flagged 3 false positives. We fixed the model in 48 hours."

**Body (165 words):**

Radical transparency is a practice, not a principle.

This week, Talpro India Customer Zero shared their Month 1 data with us. 27 candidates assessed via QOrium ReadyBank. 3 questions flagged as potential leaks by our anti-leak engine. But when we checked? All 3 were false positives—the semantic similarity model was too aggressive.

So we did what you do when you're wrong: we fixed it.

We re-trained the model on 500 new examples, tested it on Q1 data (no data leakage), and pushed an update to production within 48 hours. The false-positive rate dropped from 8% to <2%.

One product outcome: we're now building a "confidence score" for every leak alert, so customers can distinguish between "this is definitely leaked" and "this might be leaked, but I'm only 60% sure."

The meta outcome: we shipped faster because we admitted we were wrong.

Not "fixing it next sprint." Not "filing a ticket." Within 48 hours.

This is how Customer Zero works. This is how products get better.

**CTA:**
"How would you measure the effectiveness of an anti-leak engine? Comment below. (We're building the next version.)"

**Hashtags:**
#CustomerZero #Transparency #ProductDevelopment #Agile #Learning #QOrium #Iteration

**Engagement plan:**
Product team responds to feedback, routes feature ideas to roadmap.

---

### **W3 MON — "The 7 structural moats that make QOrium the only pure-play question-bank service"**

**Format:** Bhaskar positioning
**Audience:** Founders, investors, competitive analysts
**Best time:** Mon 9 AM IST

**Hook (3 lines, ~30 words):**
"QOrium isn't being chased by HackerRank, Codility, or LeetCode. Not because we're better engineers. Because we occupy a different market."

**Body (185 words):**

People ask: "Isn't HackerRank a competitor?"

Not really.

HackerRank is a platform. We're the content layer underneath platforms. It's the difference between Salesforce (platform) and Dun & Bradstreet (data).

Here are the 7 structural moats:

1. **Talpro Customer Zero + 500-firm network.** No other content startup has this distribution from Day 1.

2. **24-hour anti-leak rotation engine.** Takes 6–12 months to build. We've been building it for a year.

3. **I/O Psych validation pipeline.** Hard to copy without hiring I/O psychologists and losing 12 months to process iteration.

4. **Role-graph taxonomy.** Once 5,000 questions are organized by skill-role-context, it becomes a reference. Moving off it is expensive.

5. **Calibration data library.** Years of IRT data from thousands of test-takers. That data doesn't exist for competitors yet.

6. **Per-client variant library.** Accumulated transformations. Forensic leak attribution. Defensible IP claims.

7. **Brand:** "Where do you get your questions?" Answer: "QOrium." (Like SHL for psychometrics, Salesforce for CRM.)

Most of these are invisible. They don't appear on a competitive feature matrix. They'll matter in 3–5 years.

**CTA:**
"Which moat matters most to you as a buyer? Platform security? Leak detection? Bias auditing? Comment."

**Hashtags:**
#QOrium #Moats #CompetitiveAdvantage #TechnicalAssessment #ContentStrategy #MarketDynamics #Strategy

**Engagement plan:**
Bhaskar responds to strategic questions, discusses competitive dynamics openly.

---

### **W3 WED — "How IRT calibration beats raw % score (and why your platform is lying)"**

**Format:** CTO Office educational explainer
**Audience:** Assessment designers, hiring leaders, technical folks who love statistics
**Best time:** Wed 9 AM IST

**Hook (3 lines, ~30 words):**
"Your assessment says 'candidate scored 78%.' But what does that mean? IRT says: 'This question had b=1.8 difficulty; her ability is +2.1 sigma.'"

**Body (195 words):**

Most assessment platforms report scores like: "Candidate scored 78% on Java."

That number is meaningless without context.

What does 78% actually mean?

- Is the test hard or easy?
- Do harder questions count more?
- What does 78% tell you about the candidate's actual ability?

Here's where Item Response Theory (IRT) comes in.

IRT assumes each question has three properties:

- **Difficulty (b):** How hard is this question? Range: -3 (trivial) to +3 (impossible).
- **Discrimination (a):** Does this question separate good candidates from bad ones? Range: 0 (useless) to 2+ (excellent).
- **Guessing (c):** What's the probability a clueless candidate gets it right? For MCQ: c ≥ 0.25 (one-quarter chance); for open-ended: c ≈ 0.

With IRT, a 78% score translates to: "This candidate's ability is +1.2 sigma on the latent trait we're measuring."

You can now compare across different test versions, different question sets, different populations—apples to apples.

Most platforms don't do this. They just report raw %. They're hiding behind a number they don't understand.

We publish IRT parameters for every question. You can see what we're measuring, and how hard it is, and how much your candidate's score reflects their true ability vs. lucky guessing.

Radical transparency on metrics.

**CTA:**
"Does your assessment platform publish IRT parameters? Ask them. (I bet they won't know what that means.)"

**Hashtags:**
#IRT #AssessmentScience #Statistics #TechnicalHiring #Calibration #TransparencyInHiring #Data

**Engagement plan:**
CTO Office responds to statistical questions, shares IRT resources in comments.

---

### **W3 FRI — "Hiring Senior Engineer + SME Content Lead — read 2 pinned JDs in comments"**

**Format:** Hiring / Recruiting post
**Audience:** Engineers, content people, job seekers
**Best time:** Fri 6 PM IST

**Hook (3 lines, ~30 words):**
"We're hiring a Senior Engineer (content engine + API) and an SME Content Lead. Both India-remote. Both equity + salary. JDs pinned below."

**Body (140 words):**

QOrium is growing. We need two people:

**Senior Engineer:** 5+ years full-stack or backend. You've shipped APIs at scale. You care about code quality. You understand CI/CD, monitoring, observability. This is a founding engineer role: you'll build the content engine that powers the entire company.

**SME Content Lead:** 5+ years in assessment design or technical hiring. You know what makes a "good" question. You can spot bias. You understand IRT and psychometrics. You'll manage our SME contractor network and set the quality bar.

Both roles are India-remote, flexible hours, serious equity. We're bootstrapped by founder capital; we're not a VC-funded hype machine. We're profitable-toward in Year 1. If you want to build something that actually matters in hiring, this is it.

Check the pinned JDs for details.

**CTA:**
"Know someone? Refer them (and we'll give you ₹50K + free QOrium subscription for a year if they join)."

**Hashtags:**
#Hiring #Engineering #ContentDesign #RemoteJobs #India #Startups #JoinOurTeam

**Engagement plan:**
Bhaskar / HR responds to inquiries, fast-tracks referrals.

---

### **W4 MON — "Why we said no to selling to assessment platforms first"**

**Format:** Bhaskar strategic decision
**Audience:** Founders, investors, product leaders
**Best time:** Mon 9 AM IST

**Hook (3 lines, ~30 words):**
"Every investor asked: 'Why aren't you selling to HackerRank first?' We said no. Here's why that decision was the right one."

**Body (175 words):**

The obvious go-to-market for QOrium was assessment platforms: HackerRank, Codility, Mettl.

They have $ and volume. They're desperate for fresh questions. They have enterprise relationships. We could raise faster with them as a logo.

Every investor pushed us toward that.

We said no.

Here's the game theory:

If we sell to platforms first, we become a content vendor to them. They own the relationship. They set the price. They can always build internal alternatives or switch to a cheaper vendor.

But if we sell to enterprises and GCCs first, we own the end customer. Platforms become our distribution.

Think about it: if 500 enterprises are buying from QOrium, and each one uses 3 platforms, suddenly those 3 platforms have a business case for integrating with us. We're not selling to them; they're buying from us.

Plus, enterprises pay better. ₹50 lakh for a custom question bank beats $5K/month SaaS with a platform. And they're stickier.

So: recruiter first (cash flow), GCC second (margin), platforms third (distribution).

Counterintuitive? Yes. Correct? We'll know in 12 months.

**CTA:**
"What would YOU do? Sell bottoms-up (platforms) or top-down (enterprises)? Comment."

**Hashtags:**
#GTMStrategy #GoToMarket #Startups #FounderThoughts #Strategy #SalesStrategy

**Engagement plan:**
Bhaskar engages in strategic discussion, shares reasoning.

---

### **W4 WED — "Anti-leak rotation: how 24 hours becomes a moat"**

**Format:** CTO Office engineering deep-dive teaser
**Audience:** Technical leaders, engineers, architecture enthusiasts
**Best time:** Wed 9 AM IST

**Hook (3 lines, ~30 words):**
"Every 24 hours, we scan Reddit, GitHub, LeetCode, Telegram for leaked QOrium questions. If found, we auto-rotate within 48 hours. This is the moat."

**Body (170 words):**

The anti-leak rotation engine is the heart of QOrium.

Here's how it works:

**Hour 0:** N8N workflow triggers. Crawls Reddit (r/leetcode, r/cscareerquestions, r/webdev), GitHub (top interview-prep repos), LeetCode discuss, GeeksforGeeks, Telegram (popular coaching channels), Slack (leaked archives).

**Hour 1–2:** Semantic similarity check. Questions from the crawl are embedded. Each is compared against our entire library.

**Hour 2–3:** Triage. False positives are filtered. True leaks are flagged.

**Hour 3–6:** SME review (async, human-in-loop). Are these *actually* our questions, or just similar ideas?

**Hour 6–24:** Rotation. For confirmed leaks: question is retired. New variant is generated. Per-client variants are distributed. Watermark tracking records which customer saw which version.

**Result:** By hour 48, the leaked question is gone from your system. A new one is live. The person who memorized the leak gets a structurally-equivalent question.

Most vendors rotate manually, once a quarter.

We rotate automatically, daily.

That delta is the moat.

**CTA:**
"What's the timeline on your current question rotation? Hours? Weeks? Months? Comment."

**Hashtags:**
#AntiLeak #Automation #ProductEngineering #N8N #Monitoring #QOrium #TechMoat

**Engagement plan:**
CTO Office responds to technical questions about crawling, embedding, triage.

---

### **W4 FRI — "Month 1 in numbers: questions live, candidates served, NPS, what we learned"**

**Format:** Product transparency / metrics close
**Audience:** Customers, community, transparency followers
**Best time:** Fri 6 PM IST

**Hook (3 lines, ~30 words):**
"QOrium Month 1: 5,000 questions live. 27 candidates assessed. 0 false-negative leaks. NPS 8.2. What surprised us most: SME quality."

**Body (175 words):**

Month 1 of QOrium is done. Here's what the numbers say:

**Volume:**
- 5,000 validated questions live (Wave 1 complete)
- 27 candidates assessed (Customer Zero: Talpro India)
- 3 JD-Forge orders executed
- 12 SME contractors on boarded

**Quality:**
- IRT calibration coverage: 100% of released questions
- Bias audit: 0 questions flagged with effect size >1.0
- Anti-leak accuracy: 98% (up from 92% Week 2)
- Customer NPS: 8.2 (target: 7+; we overshot)

**What surprised us most:**

SME quality is the bottleneck, not technology. We thought: build a great platform, hire great SMEs, ship great questions. Reality: finding 12 qualified assessment designers who are available for contractors work is hard. By Month 3, we need 50. That's the constraint.

**What we'll change in Month 2:**

- Tighter SME onboarding (currently 5 days; target: 2 days)
- Better role-specific templates (reduce authoring time by 30%)
- Expanded reference panel (currently 200 candidates; target: 500)

We'll publish the full Month 1 case study next week.

**CTA:**
"What metrics should we track? What surprised YOU about Month 1? Comment below."

**Hashtags:**
#QOrium #Metrics #Transparency #ProductDevelopment #CustomerZero #M1 #Learnings

**Engagement plan:**
Product team + Bhaskar monitor, respond to all inquiries, share learnings openly.

---

## Measurement & Success Metrics

**Per-post targets (first 24 hours):**
- Impressions: ≥300 (organic reach + founder networks)
- Engagements (likes + comments): ≥5%
- Click-throughs: ≥2% (for posts with links)

**Weekly aggregate (4 posts/week × 4 weeks):**
- Impressions: 12,000+
- Followers gained: +500
- Comments: 100+ (engaged community)
- Demo requests: 5–10 per week from inbound

**Monthly dashboard:** Tracked in `/governance/marketing-metrics/M1-weekly.md`

---

## CEO + CTO Commitment

- **Week 1–2:** Bhaskar responds to ALL founder-voice post comments (W1 Wed, W2 Wed, W3 Mon, W4 Mon) within 60 minutes during 9 AM–5 PM IST.
- **Week 1–4:** CTO Office responds to technical posts (W1 Mon, W2 Mon, W3 Wed, W4 Wed) within 90 minutes.
- **Ongoing:** Product team monitors job posting (W3 Fri), customer update (W2 Fri, W4 Fri) for inquiries.

---

## Brand Voice Rules (Per Brand Asset Spec)

- **Confident, not arrogant:** We know our strengths; we don't oversell.
- **Clear, not verbose:** No jargon unless necessary; explain plainly.
- **India-aware:** Reference local context (tier-2 cities, coaching culture, ₹ costs, GCC challenges).
- **Specific over generic:** Data > opinions. Real examples > hypotheticals.
- **Founder-voice (Bhaskar):** Personal stories, strategic thinking, founder POV, candid.
- **CTO-voice (Team):** Technical rigor, data-driven, educational, explainer threads.
- **Product-voice:** Transparent metrics, customer updates, learnings, asking for feedback.

---

## Linkedin Algo Adjustments (End of M1 Review)

Expect 1–2 algorithm shifts during Q2 2026. At M1 end (May 31), we'll:
- Review engagement trends (which post type resonated most)
- Adjust posting times if early metrics show different peaks
- A/B test post length (some longer deep-dives, some short hooks)
- Monitor whether Bhaskar personal posts outpace corporate voice (likely)

Cadence will remain 3x/week; distribution may shift.

---

**Owner:** CMO (CTO Office)
**Approval:** All posts reviewed before scheduling
**Publication:** Scheduled via LinkedIn Campaign Manager (buffer + native)
**Measurement:** Google Sheets tracked daily; aggregated weekly to `/governance/marketing-metrics/M1-weekly.md`
**Final review:** May 31 (Month 1 end) for Q2 adjustments

---

*End of LinkedIn Post Calendar — M1 Soft-Launch. All 12 posts scheduled for May 2026.*
