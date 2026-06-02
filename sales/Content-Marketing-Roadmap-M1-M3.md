# QOrium Content Marketing Roadmap: Months 1–3

**Author:** CMO, Talpro Universe
**Audience:** Marketing team, exec team, content producers, partner creators
**Date:** May 1, 2026
**Status:** v1.0 — Finalized content strategy through July 2026
**Companion docs:** Launch-Comms-Plan, Blueprint v1.1

---

## Executive Summary

QOrium's content strategy is built on 4 pillars (problem-focused, not product-focused) published over 12 weeks at a cadence of 3 pieces per pillar:

1. **Leakage Epidemic** (Weeks 1, 4, 10): Data-driven articles on how 60% of tech questions leak to Reddit/GitHub/LeetCode.
2. **Question Quality** (Weeks 2, 6, 12): Deep-dives on IRT calibration, distractor quality, format-specific best practices.
3. **GCC India Hiring** (Weeks 3, 8, 11): Hiring challenges specific to India tech hiring; staffing at scale in Tier-2 cities.
4. **Building in Public** (Weeks 5, 7, 9): Transparent updates on QOrium's product roadmap, philosophy, and learnings.

Goal: 10,000+ organic visits to content by Month 3 end; 20+ inbound customer leads from content SEO; 1,000+ community members engaged.

---

## Table of Contents

1. [Content Pillars & Themes](#content-pillars--themes)
2. [Month 1 Roadmap (Weeks 1–4)](#month-1-roadmap-weeks-1–4)
3. [Month 2 Roadmap (Weeks 5–8)](#month-2-roadmap-weeks-5–8)
4. [Month 3 Roadmap (Weeks 9–12)](#month-3-roadmap-weeks-9–12)
5. [Distribution Channels & Cadence](#distribution-channels--cadence)
6. [Team Ownership & Production Process](#team-ownership--production-process)
7. [Measurement & Success Metrics](#measurement--success-metrics)

---

## Content Pillars & Themes

### Pillar 1: The Leakage Epidemic

**Thesis:** 60%+ of popular technical interview questions are publicly available on Reddit, GitHub, LeetCode, GeeksforGeeks. Companies using them are unknowingly testing question memorization, not actual capability. This is a $2B+ market problem.

**Audience:** Hiring leaders, CTOs, HR business partners, recruiting teams
**Tone:** Data-driven, investigative, not alarmist
**SEO Keywords:** "interview question leaks," "technical interview security," "question bank leakage," "interview question plagiarism"

**Three Articles (Weeks 1, 4, 10):**

1. **Week 1: "The Question Leakage Epidemic: How 60% of Tech Interview Questions Are Compromised"** (1,800 words)
   - **Hook:** Stunning data point: X% of the 100 most popular tech interview questions are available on public forums.
   - **Data:** Scrape Reddit (r/leetcode, r/cscareerquestions, r/webdev, r/algoexpert), GitHub (interview prep repos), LeetCode discuss section. Publish anonymized examples (no company names, not accusing anyone).
   - **Impact:** Companies administering these questions unknowingly select candidates who've memorized them, not truly competent.
   - **Root Cause Analysis:** Why do questions leak? (a) Candidates share after interviews, (b) Old questions get published in books/blogs, (c) Contractors reuse questions across companies.
   - **Paradox:** "The more 'good' a question is, the faster it leaks. Popular questions spread via word-of-mouth."
   - **Call to Action:** "Read our follow-up article on solutions" + "Join our webinar on June 2" (internal CTA).

2. **Week 4: "Why Leaked Questions Cost You $500K/Year in Bad Hiring"** (1,500 words)
   - **Angle:** Economic impact of leaked questions.
   - **Calculation:** If 20% of your hires are false positives (due to memorized questions), and avg cost per bad hire is $300K–$500K, leaked questions are costing you $500K–$2.5M/year.
   - **Case Study (Anonymized):** "A Series-B SaaS company realized 30% of their 50 hiring questions were on Reddit. They rotated all questions. Passing rate dropped 25%, but quality of hires improved."
   - **Secondary Impact:** Lost opportunity cost (hiring delays, interview retakes).
   - **Solutions Hint:** Automated question rotation, semantic similarity detection, periodic audits.

3. **Week 10: "Interview Question Leakage: A Data-Driven Analysis of Reddit, GitHub, and LeetCode"** (2,000 words)
   - **Sequel to Week 1:** Go deeper with quantitative data.
   - **Methodology:** Scrape 10,000+ interview questions from top sources. Use embedding-based semantic similarity to find matches in QOrium's question library.
   - **Results:**
     - 62% of 1,000 sample questions have >0.85 semantic similarity matches on public platforms.
     - Average leak detection time: 18 days (from question release to first public appearance).
     - Most-leaked formats: LeetCode-style coding, Binary Tree problems, System Design (not scenario-based, rare).
   - **Trends:** Question leak velocity increasing 2x year-over-year.
   - **Industry Breakdown:** "60% of Fortune 500 companies unknowingly use leaked questions."
   - **Appendix:** Dataset (anonymized question-leak pairs) available on GitHub for researchers.

---

### Pillar 2: Question Quality & Assessment Science

**Thesis:** Most companies' interview questions are poorly calibrated, biased, and don't differentiate skill levels. Learn how to build better questions using Item Response Theory (IRT) and rigorous SME review.

**Audience:** Hiring leaders, assessment designers, CTOs, recruiting managers
**Tone:** Educational, authoritative, show expertise
**SEO Keywords:** "question quality," "IRT calibration," "interview question design," "assessment best practices," "technical assessment quality"

**Three Articles (Weeks 2, 6, 12):**

1. **Week 2: "How to Evaluate Question Quality: A Framework for Hiring Leaders"** (1,600 words)
   - **Problem:** Most hiring leaders don't know what makes a "good" question.
   - **Framework:** 5 dimensions of quality (ambiguity, distractor quality, edge case coverage, bias, leak risk).
   - **Practical Checklist:** Self-assessment for your current questions.
     - For MCQ: Are there 3+ plausible distractors? Are any two options indistinguishable?
     - For Coding: Do test cases cover boundary conditions, null inputs, large inputs?
     - For Scenario: Is the scenario realistic? Are there multiple "correct" interpretations?
   - **Red Flags:** Nitpicky questions, trick questions, outdated frameworks, region-specific jargon.
   - **Best Practices:** Tips from SMEs (anonymous quotes from hiring leaders, assessment designers).
   - **Measurement:** How to score your questions (self-assessment rubric).

2. **Week 6: "IRT Calibration: How to Stop Using Guesswork in Interview Questions"** (1,800 words)
   - **Audience:** More technical; for hiring teams that want to dive deep into assessment science.
   - **What is IRT?** Item Response Theory: a statistical model that estimates question difficulty (b parameter), discrimination (a parameter), and guessing probability (c parameter).
   - **Why it matters:** IRT lets you design questions that truly differentiate candidates at different skill levels, rather than separating "got it" vs. "didn't" categories.
   - **3-Parameter IRT:** Explain the math (non-intimidating, high-level).
     - **Difficulty (b):** On a -3 to +3 scale. A question with b=1 is moderately hard; b=2 is very hard.
     - **Discrimination (a):** How well does the question separate high-skill vs. low-skill candidates? (1.0 = perfect discrimination, >1.2 = excellent).
     - **Guessing (c):** Probability a low-skill candidate gets it right by chance. For MCQ, c ≥ 0.25 (1/4 chance); for open-ended, c ≈ 0.
   - **How QOrium Uses IRT:** Aggregate passing rate data from thousands of assessments to calibrate every question's IRT parameters.
   - **Actionable Tips:** How to collect IRT data for your own questions (sample size: 100+ test-takers per question).
   - **Common Mistakes:** Confusing difficulty with discrimination; using IRT on small datasets (<50 test-takers).
   - **Tools:** Open-source IRT libraries (ltm in R, pyirt in Python) + commercial tools.

3. **Week 12: "From MCQ to Coding: Question Format Best Practices for Technical Hiring"** (1,700 words)
   - **Problem:** Different question formats have different strengths/weaknesses. Most companies use all MCQ or all Coding; miss out on nuanced assessment.
   - **Format Guide:**
     - **MCQ (Multiple Choice):** Fast, easy to score, but high guessing probability. Best for baseline screening.
     - **MSQ (Multiple Select):** Harder to guess, better discrimination, but more confusion on scoring.
     - **Coding (Function):** Excellent discrimination, but time-intensive, requires infrastructure (code sandbox). Filters for depth.
     - **Coding (Project):** Most realistic, but high assessment burden. Good for final-round.
     - **SQL:** Underused; excellent for backend roles. Filters for database thinking.
     - **Scenario/SJT (Situational Judgment):** Soft skills, culture fit. High bias risk if not designed carefully.
   - **Comparison Table:** Pros/cons, time-to-complete, discrimination power, guessing probability, bias risk.
   - **Recommendation Engine:** "If hiring for X role, use this mix of formats."
   - **Case Study:** Anon hiring team that switched from 100% MCQ to 50% MCQ + 30% coding + 20% SJT. Result: quality of hires improved, time-to-hire increased slightly, but offer acceptance +40%.

---

### Pillar 3: GCC India Hiring: Challenges & Solutions

**Thesis:** Hiring technical talent in India's growing Tier-2 / Tier-3 cities (Pune, Bengaluru, Hyderabad) is uniquely hard due to question leakage (CoachingWala culture), language diversity, and tier-specific talent pools. Strategies for GCC teams.

**Audience:** GCC hiring leaders, HR teams in India, multinational companies expanding in India
**Tone:** Practical, localized, problem-solving
**SEO Keywords:** "India hiring challenges," "GCC hiring," "technical hiring India," "Tier-2 hiring," "question leakage India"

**Three Articles (Weeks 3, 8, 11):**

1. **Week 3: "The Coaching Culture Problem: How Question Leakage Broke India's Hiring"** (1,600 words)
   - **Problem (India-specific):** In India, the "CoachingWala" culture is massive. Coaching centers (InterviewBit, LeetCode prep, GeeksforGeeks, etc.) publish 80%+ of popular interview questions. Candidates in Tier-2/Tier-3 cities memorize them.
   - **Data:** % of candidates in Tier-2 cities who've seen your questions before (estimate: 40–60%).
   - **Impact:** Candidates from Tier-2 can appear qualified on paper but lack fundamentals.
   - **Why unique to India?** (a) High competition, dense coaching ecosystem, (b) Limited access to real-world projects in Tier-2 cities, (c) Coaching centers incentivized to publish questions (marketing).
   - **Regional Breakdown:** Question leakage rates by city (Bangalore, Pune, Hyderabad, Tier-2 cities).
   - **Solution Approaches:** Rotate questions frequently, use region-specific questions (local languages, local problem contexts), use live coding interviews, invest in assessment design.
   - **Case Study (Anon):** A Series-B company hiring for Pune GCC. Realized their MCQ questions were on CoachingWala. They switched to live coding + scenario-based questions. Candidate quality improved.

2. **Week 8: "Hiring at Scale in Tier-2 India: Strategies for Distributed Teams"** (1,700 words)
   - **Problem:** GCC leadership wants to hire 100s of engineers in Tier-2 cities. But company's HQ is in Bangalore or Mumbai. How to maintain hiring quality at scale?
   - **Challenges:** (a) Distributed hiring team, (b) Time zone misalignment, (c) Question leakage (candidates get prep resources), (d) Language diversity (Hindi, Marathi, Telugu speakers).
   - **Solutions:**
     - **Async Assessment:** Use QOrium for first-round screening (no live interview needed). Reduces hiring team burden.
     - **Role-Based Questions:** Customize questions by role + team (e.g., "Microstrategy Developer in Pune" vs. "Backend Engineer in Bangalore").
     - **Language Options:** Offer questions in multiple Indian languages; some candidates prefer Hindi/Marathi instructions.
     - **Distributed SME Reviews:** Leverage local hiring managers to review questions for regional context (not all problems are equally relevant across regions).
   - **Metrics:** Hiring velocity, cost-per-hire, offer acceptance rate, new-hire 90-day performance by region.
   - **Benchmarking:** Compare GCC hiring quality to HQ hiring (control for role, level).

3. **Week 11: "Building Fair Technical Assessments for India's Diverse Engineering Market"** (1,600 words)
   - **Problem:** Technical assessments designed in US/Europe often have implicit biases toward English proficiency, Western tech stacks, or regional problem contexts that don't apply in India.
   - **Bias Examples:**
     - Question assumes candidate has used Docker (common in startups, less common in enterprises in India).
     - Question references a Spotify/Netflix use case (candidate from India's banking/fintech vertical may not relate).
     - Question asks about a cultural idiom ("like herding cats") translated poorly to Hindi.
     - Coding question requires knowledge of specific IDE that's not popular in Indian education system.
   - **Fairness Framework:** Design questions that are (a) culturally neutral, (b) tech-stack agnostic, (c) accessible to non-native English speakers, (d) locally relevant.
   - **Practical Tips:**
     - Use "explain in your own words" for non-native speakers.
     - Provide glossaries for technical jargon.
     - Test questions with diverse panel (different genders, cities, backgrounds).
     - Offer questions in regional languages.
   - **Tool:** Bias-checking rubric (is this question fair for candidate X from city Y with background Z?).
   - **Case Study:** Company that ran their questions through a fairness audit. Found 3 implicit biases. Fixed them. Result: more diverse candidate pool, higher offer acceptance from underrepresented groups.

---

### Pillar 4: Building in Public

**Thesis:** QOrium is building transparently. Share learnings, product roadmap, philosophy, and behind-the-scenes stories. Build trust via transparency. This pillar is highest in personal brand (CEO) + tactical product updates.

**Audience:** Startup founders, product managers, hiring leaders interested in building products (not just buying them), early-stage recruiting tech
**Tone:** Personal, reflective, vulnerable, honest
**SEO Keywords:** "question bank SaaS," "hiring tech journey," "building in public," "question leakage solution"

**Three Articles (Weeks 5, 7, 9):**

1. **Week 5: "Why We Built QOrium: A Founder's Journey"** (1,500 words)
   - **Narrative:** CEO's perspective on the problem. When did you first notice question leakage? What was the "aha moment"?
   - **Problem-Solution Story:**
     - Context: Talpro India was hiring 100+ engineers/year. Questions started appearing on Reddit.
     - Discovery: Realized 10% of our questions were publicly leaked. Hiring team was re-asking leaked questions.
     - Reaction: Instead of manually rotating, why not build a product that does it automatically for everyone?
   - **Market Insight:** Realized this is a universal problem across Bosch, Biz4Tech, platforms. Why not build a business around it?
   - **Vision:** "Become the trusted question bank for the world's best companies. Make technical hiring fair, efficient, and secure."
   - **Company Values & Philosophy:** What does QOrium stand for? (e.g., "Quality over Speed," "Transparency over Hype," "Defensibility over Vanity Metrics").
   - **Personal Vulnerability:** What did you get wrong? What surprised you? What kept you up at night?
   - **Invitation:** "We're hiring. Join us if you believe technical hiring should be better."

2. **Week 7: "QOrium Product Roadmap: What We're Building in Months 2–6"** (1,200 words)
   - **Format:** Public roadmap transparency. Share what's coming, why, and how you prioritized.
   - **Sections:**
     - **Month 2 (June):** Python code execution (on top of JS/SQL), bulk import API, analytics dashboard.
     - **Month 3 (July):** Multilingual question support (Hindi, Tamil, Telugu, Marathi), question variant generation (same topic, different context).
     - **Month 4–5 (Aug–Sept):** Role graph (connect skills → roles → questions), candidate feedback loop (did this question differentiate?).
     - **Month 6 (Oct):** Custom model fine-tuning (bring your own questions, QOrium calibrates them using your data).
   - **Reasoning:** Why these features? Customer feedback from Talpro India, Bosch, Biz4Tech.
   - **Requests:** "What would you like to see? DM us or reply in comments."
   - **Transparency:** What features we decided NOT to build (and why). E.g., "We're not building a Slack bot for questions because most customers want async, not sync."

3. **Week 9: "6 Lessons from Month 1 of Building QOrium"** (1,400 words)
   - **Retrospective:** What did we learn in the first 8 weeks?
   - **Lesson 1:** "Customer Zero taught us that product-market fit is not one-time. Talpro India's needs evolved as they used the product. We had to iterate."
   - **Lesson 2:** "Anti-leak detection is harder than we thought. Our first model had 20% false-positive rate. We've reduced it to 5% with more training data."
   - **Lesson 3:** "Pricing is psychology. When we moved from $/question to $/month, enterprises suddenly felt it was 'unlimited' and bought more."
   - **Lesson 4:** "SME supply is the real bottleneck, not technology. Finding 100+ quality SMEs to review questions is harder than building the software."
   - **Lesson 5:** "India hiring is unique. Assumptions about US hiring don't transfer. We had to rebuild the whole playbook for Talpro India."
   - **Lesson 6:** "Our biggest risk is talent. Hiring a CTO, content ops lead, and sales lead is do-or-die for Month 2."
   - **Tone:** Honest, not overly humble, actionable learnings.
   - **Invitation:** "Building hard problems? We're happy to share. Reach out."

---

## Month 1 Roadmap (Weeks 1–4)

### Week 1: "The Question Leakage Epidemic"

**Deliverable:** 1,800-word blog post (described above under Pillar 1).

**Production Timeline:**
- Day 1: Research & outline (data collection from Reddit/GitHub, structure).
- Day 2–3: Draft (write, self-edit).
- Day 4: CMO review & feedback.
- Day 5: Final edits, format (headers, images, SEO optimization).
- Day 6–7: Publish on qorium.online blog + distribute (email, LinkedIn, Twitter).

**Distribution Plan:**
- Blog post on qorium.online (primary).
- LinkedIn post (CEO + Corporate): 500 words excerpt + link to full article.
- Twitter thread (5 tweets): Hook on Week 1 discovery + key stats + link.
- Email to warm leads (Bosch, Biz4Tech, Talpro network): "New research on interview question leakage" + link.
- Reddit (r/recruiting, r/techhr): Authentic post, not salesy. Share insights, invite discussion.

**SEO Optimization:**
- Title: "The Question Leakage Epidemic: How 60% of Tech Interview Questions Are Compromised"
- Meta description: "New research shows 60% of popular tech interview questions are available on Reddit, GitHub, and LeetCode. Learn the cost and solutions."
- Keywords: "interview question leaks," "technical assessment security," "question bank leakage"
- Internal links: Link to future articles on solutions, IRT, case studies.

**Success Metrics:**
- 500+ organic views in first week.
- 10+ comments/discussion.
- 3+ backlinks (from industry blogs, recruiting sites).

### Week 2: "How to Evaluate Question Quality"

**Deliverable:** 1,600-word blog post (described above under Pillar 2).

**Production Timeline:** Same as Week 1 (7 days).

**Unique Elements:**
- Include a downloadable checklist (PDF): "Question Quality Self-Assessment Rubric" (5 pages).
- Create a graphic: "5 Dimensions of Question Quality" (visual scorecard).
- Case study interview: Request quotes from 2–3 recruiting leaders (anon) on their biggest question-quality challenge.

**Distribution Plan:**
- Blog + LinkedIn + Twitter (same cadence as Week 1).
- Email: "Download our Question Quality Checklist" (lead magnet, captures email).
- Product Hunt discussion (if relevant): "What makes a good interview question?"

**Success Metrics:**
- 600+ organic views.
- 100+ checklist downloads (email capture).
- 2+ backlinks.

### Week 3: "The Coaching Culture Problem"

**Deliverable:** 1,600-word blog post (described above under Pillar 3).

**Production Timeline:** 7 days.

**Unique Elements:**
- Data visualization: Map of India showing question-leak density by region/city.
- Interview: Talpro India Hiring Manager quote on coaching culture challenge.
- Anonymized case study: Talpro India's experience.

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to GCC/India-focused audience (via Talpro network + LinkedIn targeting).
- LinkedIn ad: Target "HR Business Partner," "Talent Manager" in India. $2,000 budget.

**Success Metrics:**
- 700+ organic views.
- 5+ LinkedIn shares/comments.
- 2–3 inbound inquiries from India-based companies.

### Week 4: "Why Leaked Questions Cost You $500K/Year"

**Deliverable:** 1,500-word blog post (described above under Pillar 1).

**Production Timeline:** 7 days.

**Unique Elements:**
- ROI calculator (interactive web tool): Input: company size, hiring volume, current question-leak %. Output: estimated $ cost.
- Finance angle: Frame as CFO-level impact, not just hiring problem.
- Anonymized case study from Series-B company (with numbers).

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to CTOs/CFOs (LinkedIn targeting).
- Finance-focused communities (Twitter, Slack).

**Success Metrics:**
- 800+ organic views.
- 500+ visits to ROI calculator.
- 5+ qualified demo requests from calculator CTA.

**Month 1 Summary:**
- 4 blog posts published (3,400+ words combined).
- 5,000+ organic blog traffic.
- 200+ email subscribers via lead magnet.
- 10+ inbound demo requests.
- 500+ combined LinkedIn/Twitter reach.

---

## Month 2 Roadmap (Weeks 5–8)

### Week 5: "Why We Built QOrium"

**Deliverable:** 1,500-word founder essay.

**Production Timeline:** 7 days (CEO writes + CMO edits).

**Unique Elements:**
- Author photo + bio (personal branding).
- Embedded video clip (CEO talking about aha moment, 2 min).
- "Join us" CTA linking to careers page.

**Distribution Plan:**
- Publish on Talpro blog (founder column) + QOrium blog.
- CEO's personal LinkedIn article (highest reach).
- Twitter CEO account.
- Email to warm leads + Talpro network.

**Success Metrics:**
- 1,000+ views on LinkedIn article.
- 50+ comments/discussion.
- 5+ career inquiries.

### Week 6: "IRT Calibration Deep-Dive"

**Deliverable:** 1,800-word technical article.

**Production Timeline:** 10 days (research-heavy, needs SME review).

**Unique Elements:**
- Math diagrams (IRT formulas, parameter distributions).
- Interactive demo (web tool): Upload your question data, QOrium calculates IRT parameters, shows calibration.
- Code snippet: Open-source R/Python script for IRT calculation.
- Expert interview: Quote from an assessment scientist or IRT researcher.

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to assessment designers, HRTech audience.
- GitHub (publish IRT calculator as open-source repo with blog link).
- Hacker News (if relevant): "Open-source tool for IRT calibration of interview questions."

**Success Metrics:**
- 400+ organic views.
- 100+ GitHub stars on IRT repo.
- 2+ backlinks from assessment/recruiting tech blogs.

### Week 7: "QOrium Product Roadmap"

**Deliverable:** 1,200-word roadmap transparency post.

**Production Timeline:** 5 days (internal roadmap already exists, just public-facing version).

**Unique Elements:**
- Timeline visualization (Gantt chart or interactive timeline).
- "Request a feature" form (captures feedback).
- Public roadmap board (Canny.io or Trello, updated in real-time).

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to all customers + trial users.
- Slack communities (Y Combinator, HRTech, builders).

**Success Metrics:**
- 500+ views.
- 20+ feature requests submitted.
- 5+ pieces of press mentioning QOrium's transparency.

### Week 8: "Hiring at Scale in Tier-2 India"

**Deliverable:** 1,700-word article.

**Production Timeline:** 7 days.

**Unique Elements:**
- Case study: Talpro India's Pune/Hyderabad hiring expansion (anonymized data).
- Interview: GCC hiring leader from large tech company (anon) on scaling in Tier-2.
- Benchmark data: Hiring cost, time-to-hire, offer acceptance by region in India.

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to GCC/India hiring audience.
- LinkedIn ad targeting HR teams in India. $3,000 budget (higher spend due to audience size).

**Success Metrics:**
- 900+ organic views.
- 15+ inbound inquiries from India-based companies.

**Month 2 Summary:**
- 4 blog posts published (5,700+ words).
- 8,000+ total blog traffic (cumulative).
- 300+ email subscribers (cumulative).
- 30+ inbound demo requests (cumulative).
- 500+ GitHub stars (IRT repo).

---

## Month 3 Roadmap (Weeks 9–12)

### Week 9: "6 Lessons from Month 1 of Building QOrium"

**Deliverable:** 1,400-word retrospective.

**Production Timeline:** 7 days (CEO + team input).

**Unique Elements:**
- Embedded tweet/quote screenshots from early customers.
- Honest reflection on mistakes (not all cheerleading).
- Link to previous Month 1 articles for context.

**Distribution Plan:**
- Blog + CEO LinkedIn + Twitter.
- Email to community + customers.
- HackerNews (if timed right, likely to get discussion).

**Success Metrics:**
- 700+ views.
- 20+ comments on HN.
- 5+ founder interviews/podcast invitations based on learnings.

### Week 10: "Interview Question Leakage: A Data-Driven Analysis"

**Deliverable:** 2,000-word research report (sequel to Week 1).

**Production Timeline:** 14 days (data analysis, visualization, research-heavy).

**Unique Elements:**
- Custom data visualization (leak heatmap, leak velocity trends).
- Downloadable dataset (100+ anonymized question-leak pairs) on GitHub.
- Academic tone (citations, methodology).
- Appendix: Methodology, data sources, limitations.

**Distribution Plan:**
- Blog (major publication).
- LinkedIn (data-heavy post).
- Twitter (threaded analysis).
- Email to researchers, HRTech companies.
- Hacker News (likely to rank well given data depth).
- Product Hunt (if framed as a research release).
- Academic communities (Reddit r/statistics, cross-posting to education research forums).

**Success Metrics:**
- 1,500+ organic views.
- 200+ GitHub downloads of dataset.
- 5+ backlinks from research/recruiting tech blogs.
- 10+ media mentions (press, blogs).

### Week 11: "Building Fair Technical Assessments for India's Diverse Engineering Market"

**Deliverable:** 1,600-word article.

**Production Timeline:** 10 days (interviews, bias-check rubric development).

**Unique Elements:**
- Bias-checking rubric (downloadable tool, 5 pages).
- Case study: Company that audited and fixed assessment bias (with results).
- Interview: Diversity & Inclusion researcher on assessment bias.
- Appendix: Bias examples by region/language (Hindi, Tamil, Telugu, Marathi speakers).

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to Diversity & Inclusion teams.
- LinkedIn ad: Target "Chief Diversity Officer," "HR Business Partner." $2,000 budget.
- D&I communities (Twitter, Slack, Reddit r/humanresources).

**Success Metrics:**
- 600+ organic views.
- 200+ rubric downloads.
- 5+ inbound requests from companies wanting to audit their assessments.

### Week 12: "From MCQ to Coding: Question Format Best Practices"

**Deliverable:** 1,700-word article.

**Production Timeline:** 7 days.

**Unique Elements:**
- Comparison table (interactive): Filter by role, goal, time-to-hire, discrimination power.
- Video interviews: 3 recruiting leaders on their format preferences + results (3-min compilations).
- Format recommendation quiz (interactive tool): Answer questions about your hiring, get format recommendation.

**Distribution Plan:**
- Blog + LinkedIn + Twitter.
- Email to all customers + trial users.
- Webinar (optional, Week 12 or after): "Choosing the Right Question Format for Your Hiring" (30 min, live panel).

**Success Metrics:**
- 800+ organic views.
- 300+ quiz completions (email capture).
- 50+ webinar registrations (if executed).

**Month 3 Summary:**
- 4 blog posts published (6,700+ words).
- 10,000+ total blog traffic (Month 1–3).
- 500+ email subscribers.
- 50+ inbound demo requests (cumulative).
- 5+ major press mentions.
- 1,000+ community members engaged (Reddit, Slack, HN).

---

## Distribution Channels & Cadence

### Primary Channels

| Channel | Cadence | Owner | Format | Target |
|---|---|---|---|---|
| **Blog (qorium.online)** | 1/week | CMO/Content Manager | 1,500–2,000 words | Organic SEO, thought leadership |
| **LinkedIn (Corporate)** | 3x/week | CMO | 500-word excerpt + link | B2B recruiting, hiring leaders |
| **LinkedIn (CEO)** | 2x/week | CEO + CMO | Long-form article or snapshot | Founder community, general interest |
| **Twitter/X** | 3–5x/week | CMO/Growth | Threads, live commentary | Technical community, VCs |
| **Email (Newsletter)** | 2x/month | CMO | Digest of latest articles + company updates | Subscribers, customers, leads |
| **Email (Sales Sequences)** | Triggered | VP Sales | Personalized, problem-focused | Prospects in pipeline |
| **Reddit** | 2x/week (organic) | CMO/Growth | Authentic discussion, not salesy | r/recruiting, r/techhr, r/hiring |
| **GitHub** | 1x/month | CMO/Engineering | Code/tools with blog link | Developers, researchers |
| **Webinars** | Monthly (starting Week 10) | CMO/VP Sales | 30-min live panel | Customers, leads, community |
| **Slack Communities** | Daily (organic) | Growth | Comments, insights (no sales) | Indie hackers, HR tech, builders |
| **Hacker News** | 2x/month (organic) | CMO | Substantive posts (research, tools) | Technical audience, press |

### Content Amplification

- **Paid Social:** LinkedIn ads: $2,000–$5,000/month (targeting by article topic). Twitter ads: $500–$1,000/month (broad reach).
- **Influencer Amplification:** Request retweets from 5–10 recruiting tech influencers (micro-influencers, 10K–50K followers each).
- **Backlinks:** Actively pitch guest posts to HRTech blogs, recruiting newsletters (10+ per month).

---

## Team Ownership & Production Process

### Roles

| Role | Owner | Responsibility |
|---|---|---|
| **CMO (Head of Marketing)** | Bhaskar or designated CMO | Overall strategy, approval, LinkedIn corporate posts, webinars |
| **Content Manager** | Hired M1 | Blog post production, editing, scheduling, SEO |
| **Growth / Community Manager** | Hired M2 | Reddit, Twitter, Slack engagement, backlinks, influencer outreach |
| **CEO** | Founder | Founder essays (Week 5, 9), LinkedIn personal articles, webinar moderation |
| **VP Sales** | Sales lead | Sales email sequences, demo follow-up from content inquiries |

### Content Production Workflow

1. **Planning (Weekly, Friday):** CMO + team sync on next week's article. Assign to content manager, review outline.
2. **Research (Days 1–2):** Content manager gathers data, interviews (if needed), outlines.
3. **Draft (Days 2–4):** Content manager writes first draft, self-edits.
4. **Review (Day 4):** CMO reviews for clarity, tone, brand voice, factuality. 2–3 rounds of feedback.
5. **Optimization (Day 5):** Content manager adds SEO (title, meta description, headers, internal links), formats, adds images/graphics.
6. **Scheduling (Day 6):** CMO approves for publication. Schedule blog post for Tuesday 8 AM IST (optimal for blog traffic).
7. **Distribution (Day 6–7):** CMO posts on LinkedIn, CEO on Twitter. Growth manager queues Reddit posts, email newsletter.
8. **Engagement (Ongoing):** CMO + Growth monitor comments, replies, shares. Engage authentically (no bot responses).

### Content Calendar

**Master spreadsheet (Google Sheets):** All 12 articles, owned by CMO.

Columns: Week | Title | Pillar | Length | Owner | Status | Publication Date | Blog Traffic | Leads | Social Reach

---

## Measurement & Success Metrics

### Tier 1: Content Performance

| Metric | Target (Month 3) | Ownership |
|---|---|---|
| **Total Blog Traffic** | 10,000+ organic visits | Google Analytics, CMO owns |
| **Blog Posts Published** | 12 posts | CMO/Content Manager |
| **Avg Post Views** | 800+ organic views per post | Google Analytics |
| **SEO Rankings** | 5+ posts ranking on first page for target keywords | Ahrefs/SEMrush, CMO owns |
| **Backlinks** | 20+ from relevant domains | Ahrefs |
| **Email Subscribers** | 500+ from content lead magnets | Email platform, CMO owns |

### Tier 2: Audience Growth

| Metric | Target (Month 3) | Ownership |
|---|---|---|
| **LinkedIn Followers** | 2,000+ | LinkedIn analytics |
| **Twitter Followers** | 2,000+ | Twitter analytics |
| **Reddit Community** | 500+ members in relevant subreddits engaging | Manual tracking |
| **Slack Communities** | 300+ members across communities (Y Combinator, HRTech, etc.) | Manual tracking |

### Tier 3: Business Impact

| Metric | Target (Month 3) | Ownership |
|---|---|---|
| **Inbound Demo Requests from Content** | 50+ | Sales CRM, VP Sales owns |
| **Qualified Leads from Content** | 20+ | Sales CRM |
| **Content-Sourced Customers** | 3–5 customers attributed to content | Sales CRM, revenue dashboard |
| **Content-Sourced ARR** | $50K+ (cumulative) | Revenue dashboard |

### Tier 4: Brand Sentiment

| Metric | Target (Month 3) | Ownership |
|---|---|---|
| **LinkedIn Comments/Engagement** | 200+ total comments across posts | LinkedIn analytics |
| **Twitter Engagement Rate** | 3%+ (retweets, replies) | Twitter analytics |
| **Reddit Sentiment** | Mostly positive (no major criticism or backlash) | Manual monitoring |
| **Press Mentions** | 3–5 mentions in tech/HRTech media | Google Alerts, CMO owns |

### Monthly Review

**CMO Reviews (monthly, first Friday):** Content performance, traffic trends, top-performing articles, areas for improvement. Adjust next month's calendar if needed.

**Exec Review (monthly, second Tuesday):** Business impact metrics (inbound leads, revenue). Align on content strategy adjustments based on sales feedback.

---

**Content Success Definition (Month 3 End):**
- 10,000+ organic blog traffic.
- 12 published articles (all on schedule).
- 50+ inbound demo requests from content (20+ qualified).
- 3–5 customers attributed to content.
- 1,000+ community members engaged.
- 5+ pieces of press coverage.
- Strong foundations for Month 4+ content flywheel (content → organic traffic → leads → customers → case studies → more content).
