# Wave 1 Extension: Senior React (QOR-REACT-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior React scaling: 80→100 — closes React to 100/100). SME Lead validation pending.

---

## Extension: 20 NEW Questions (QOR-REACT-081..100)

Difficulty: 3E / 9M / 6H / 2VH
Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: Refs vs State (Easy)

**question_id:** QOR-REACT-081
**skill_id:** senior-react-081
**sub_skill_id:** refs-vs-state
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** React docs §useRef

**body:**

When should you reach for `useRef` instead of `useState`?

**options:**

- A) Always — it's faster
- B) When the value should NOT trigger re-render on change (DOM nodes, mutable timers, prev-value tracking, instance-like fields). State triggers re-render; refs do not
- C) Only for DOM elements
- D) Never — `useState` covers all cases

**answer_key:**

B — `useRef` returns `{current}` whose mutation is invisible to React's render scheduling. Use cases: holding a DOM node (`<input ref={ref}>`), timer IDs, previous-value tracking, expensive object that survives renders without triggering them. Reference: React docs §useRef.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-081-seed-7c4a8e9b
**variant_seed:** qorium-react-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

### QUESTION 82: Controlled vs Uncontrolled Inputs (Easy)

**question_id:** QOR-REACT-082
**skill_id:** senior-react-082
**sub_skill_id:** controlled-uncontrolled
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** React docs §Controlled vs Uncontrolled

**body:**

A 30-field form re-renders the entire form on every keystroke, dropping FPS. Likely cause + fix?

**options:**

- A) Forms always re-render; nothing to fix
- B) All inputs are controlled by single root state object → keystroke updates root → all 30 fields re-render. Fix: scope state per field (per-input controlled), use `react-hook-form` (uncontrolled by default), or split form into memoized sections
- C) Need to upgrade React
- D) Use Redux

**answer_key:**

B — Centralized form state is the canonical render-perf anti-pattern. RHF's uncontrolled-by-default model lets the DOM hold the values; only invalid fields trigger re-render. Alternative: per-field controlled state + memoized field components. References: React docs §Forms; react-hook-form docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-082-seed-9b3e2c7a
**variant_seed:** qorium-react-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

### QUESTION 83: useId for Accessible Labels (Easy)

**question_id:** QOR-REACT-083
**skill_id:** senior-react-083
**sub_skill_id:** use-id
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** React 18 docs §useId

**body:**

Why use `useId()` instead of `Math.random()` for `id` on a `<label htmlFor>` linked to `<input id>`?

**options:**

- A) `Math.random()` is slow
- B) `useId` returns a stable, unique, hydration-safe ID. Random IDs differ between server and client, breaking SSR hydration
- C) `useId` is shorter
- D) `useId` works only in dev

**answer_key:**

B — Hydration-safe is the headline. `useId` produces deterministic IDs across server and client renders. Plus stable: same component instance keeps the same ID across renders, which `Math.random()` would not. Reference: React docs §useId.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-083-seed-3a7c5f8e
**variant_seed:** qorium-react-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

### QUESTION 84: Render Prop vs Compound Component (Medium)

**question_id:** QOR-REACT-084
**skill_id:** senior-react-084
**sub_skill_id:** render-prop-compound
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React patterns docs

**body:**

For a complex `<Tabs>` component allowing arbitrary content per tab, which API is most ergonomic?

**options:**

- A) Single `tabs={[{label,content}]}` prop
- B) Compound: `<Tabs><Tabs.List><Tabs.Trigger /></Tabs.List><Tabs.Panel /></Tabs>` — children share state via Context; consumer composes freely; pattern used by Radix, Reach UI
- C) HOC `withTabs(...)`
- D) Render prop `<Tabs render={(state) => ...}>`

**answer_key:**

B — Compound components share implicit state via Context, exposing flexible composition. Each subcomponent is small + named. Used by Radix UI, Reach UI, headlessui. Render-prop (D) works but is less ergonomic than JSX composition for multi-slot UIs. Reference: React patterns; Radix UI source.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-084-seed-8e2f5c3a
**variant_seed:** qorium-react-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

### QUESTION 85: Error Boundary Scope (Medium)

**question_id:** QOR-REACT-085
**skill_id:** senior-react-085
**sub_skill_id:** error-boundary-scope
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React docs §Error Boundaries

**body:**

Where should error boundaries be placed?

**options:**

- A) One root boundary; that's enough
- B) **Multiple boundaries at meaningful UI sections** (each route, each major widget). Localized boundaries let one widget show "failed to load" while the rest of the page works. Root boundary is the last-resort fallback. Class component (or `react-error-boundary` library) — hooks alone can't catch render errors
- C) Inside `useEffect`
- D) Hooks-only via `try/catch` is sufficient

**answer_key:**

B — Granular boundaries fail-soft: a charts widget crashes, dashboard remains functional. Root boundary catches everything else as a worst-case fallback. Note: error boundaries do NOT catch errors in event handlers (catch with try/catch in handler), async code, or SSR (Next.js has its own error.tsx for this). `react-error-boundary` provides a hook-friendly wrapper. Reference: React docs §Error Boundaries.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-085-seed-1b9c4a7e
**variant_seed:** qorium-react-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Context Performance Pitfall (Medium)

**question_id:** QOR-REACT-086
**skill_id:** senior-react-086
**sub_skill_id:** context-performance
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** React docs §Context; "Why React Context is not a state management tool"

**body:**

`<UserContext.Provider value={{user, setUser}}>` — every keystroke in a profile form re-renders all consumers. Why?

**options:**

- A) Context is always slow
- B) The `value` is a new object literal each render → reference inequality → ALL consumers re-render. Fix: stabilize via `useMemo({user, setUser}, [user])`. For frequent updates, split into multiple narrow contexts (read vs write); for high-fanout state, use a state library (Zustand) which selectors-out by slice
- C) Need `React.memo` on every child
- D) Context can't carry objects

**answer_key:**

B — Context fans out re-renders to all consumers regardless of which slice changed. `useMemo` on the value plus splitting state context from setter context (since setters never change reference if memoized) gets you most of the way. Beyond that, Context is the wrong tool — use Zustand or Jotai with selectors. Reference: React docs §Context.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-086-seed-5e8c3a9b
**variant_seed:** qorium-react-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

### QUESTION 87: Key Prop Stability (Medium)

**question_id:** QOR-REACT-087
**skill_id:** senior-react-087
**sub_skill_id:** key-stability
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React docs §Lists and Keys

**body:**

A reorderable list uses `key={index}`. Drag-and-drop reorders look glitchy: input fields lose focus, animations break. Fix?

**options:**

- A) Add `<Suspense>`
- B) Use a stable per-item ID for the key (`key={item.id}`). Index keys cause React to identify items by position, so a reorder appears as "every item changed type"; component state (focus, animation) follows the position not the item
- C) Add `React.memo`
- D) Remove the key

**answer_key:**

B — Keys are React's identity; stable IDs map state correctly across reorders. Index keys are safe ONLY for static lists. References: React docs §Lists and Keys.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-087-seed-2d9b4c7e
**variant_seed:** qorium-react-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

### QUESTION 88: useDeferredValue vs Throttle (Medium)

**question_id:** QOR-REACT-088
**skill_id:** senior-react-088
**sub_skill_id:** use-deferred-value
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React docs §useDeferredValue

**body:**

A search box with 5K-item filtered list lags on slow devices. Best fix?

**options:**

- A) Throttle the input handler
- B) `const deferred = useDeferredValue(query); useMemo(() => filter(items, deferred), [deferred])` — React renders typed input urgently, defers expensive list re-render. Plus `<Suspense>` if list fetch is async
- C) Reduce list to 100 items
- D) Use Web Worker

**answer_key:**

B — `useDeferredValue` lets React keep the input field responsive while the heavy list catches up. Optionally combine with `[data-stale]` styling on the list. Throttle/debounce help but feel laggier; `useDeferredValue` keeps urgent typing ahead and renders the deferred list in the next idle slot. Reference: React docs §useDeferredValue.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-088-seed-6c4a8e3f
**variant_seed:** qorium-react-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

### QUESTION 89: Server Actions Use Cases (Medium)

**question_id:** QOR-REACT-089
**skill_id:** senior-react-089
**sub_skill_id:** server-actions
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Next.js 15 Server Actions docs

**body:**

Which is the BEST use case for Next.js Server Actions (`"use server"`)?

**options:**

- A) All API logic — they replace `/api` routes entirely
- B) Form submissions and small mutations colocated with the component using them — direct DB access from a function the form posts to. Avoids hand-writing API + client mutation glue. For complex public APIs or webhooks, keep dedicated API routes
- C) Real-time WebSocket
- D) Static asset serving

**answer_key:**

B — Server Actions shine for in-app form posts and lightweight mutations: zero API boilerplate, type safety end-to-end, progressive-enhancement (form works without JS). Public API endpoints / webhooks / external clients still want explicit routes. Reference: Next.js 15 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-089-seed-3b8f5c2a
**variant_seed:** qorium-react-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

### QUESTION 90: Test — RTL + msw (Medium)

**question_id:** QOR-REACT-090
**skill_id:** senior-react-090
**sub_skill_id:** rtl-msw
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React Testing Library docs; Mock Service Worker docs

**body:**

The recommended way to test a component that calls a REST API is:

**options:**

- A) Mock `fetch` directly (`vi.mock('node-fetch', ...)`)
- B) `msw` (Mock Service Worker) intercepts at the network layer; tests don't change implementation; works for fetch/axios/anything; same handlers shareable with Storybook and Cypress
- C) Inject a mock client via Context — only valid pattern
- D) Use `nock`

**answer_key:**

B — `msw` intercepts at the network layer (browser via Service Worker, node via undici interceptor). Tests don't depend on the HTTP client choice; handlers reused across RTL, Storybook, e2e. `nock` is the older Node-only equivalent. Reference: msw docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-090-seed-9c4f3a8e
**variant_seed:** qorium-react-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

### QUESTION 91: Accessibility — focus management for SPA route change (Medium)

**question_id:** QOR-REACT-091
**skill_id:** senior-react-091
**sub_skill_id:** a11y-route-focus
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** WCAG 2.1; React Router accessibility docs

**body:**

A SPA route change updates the page content but screen readers don't announce it. WHY and FIX?

**options:**

- A) Screen readers don't support SPAs
- B) Native `<a>` navigation announces the new page; SPA `pushState` does not. Fix: on route change, move focus to the new page's main heading (`document.querySelector('h1').focus()` after setting `tabIndex={-1}`); OR announce via an `aria-live="polite"` region with the new title
- C) Add `<title>`
- D) Refresh the page on every route

**answer_key:**

B — Browsers move focus and announce on full page load; SPAs must do this manually. The standard pattern is focus the new page heading + update `document.title`. Many a11y libraries (`a11y-react-emoji`, `react-a11y-announcer`) provide an announcer. References: WCAG SC 2.4.3, 4.1.3; React Router a11y guide.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-091-seed-7e2c5a9b
**variant_seed:** qorium-react-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

### QUESTION 92: Stale Closure Bug (Hard)

**question_id:** QOR-REACT-092
**skill_id:** senior-react-092
**sub_skill_id:** stale-closure
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** React docs §Synchronizing with Effects

**body:**

```jsx
const [count, setCount] = useState(0);
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id);
}, []);   // empty deps
```

The console always logs `0`. Why?

**options:**

- A) setInterval is broken in React
- B) Empty deps mean the effect runs once at mount; the captured `count` is the initial 0; the interval forever logs that closure's value. Fix options: include `count` in deps (re-creates interval each change — correct but inefficient), OR use a `useRef` to mirror the latest count, OR functional updates `setCount(c => c+1)` for write-side
- C) Need `useCallback`
- D) `setInterval` doesn't fire in production

**answer_key:**

B — Closure-over-stale-value is one of the most common React bugs. Three valid fixes depending on intent. The Ref pattern (`countRef.current = count`) is the lowest-cost; `setCount(c => c+1)` is the cleanest for state-only updates. Reference: React docs §Synchronizing with Effects.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-092-seed-4a8c2e7b
**variant_seed:** qorium-react-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

### QUESTION 93: useReducer with Discriminated Union (Hard - Code)

**question_id:** QOR-REACT-093
**skill_id:** senior-react-093
**sub_skill_id:** reducer-discriminated-union
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** TypeScript handbook §Discriminated Unions

**body:**

Implement a TS-typed `useReducer` for a fetch state machine: states `idle | loading | success | error`. Provide the `Action` discriminated union and a `reducer` with exhaustive switch (TS error if a case is missed).

**options:** []

**answer_key:**

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; data: User[] }
  | { type: "FETCH_ERROR"; error: Error }
  | { type: "RESET" };

function assertNever(x: never): never {
  throw new Error(`unhandled action: ${JSON.stringify(x)}`);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":   return { status: "loading" };
    case "FETCH_SUCCESS": return { status: "success", data: action.data };
    case "FETCH_ERROR":   return { status: "error", error: action.error };
    case "RESET":         return { status: "idle" };
    default:              return assertNever(action);   // exhaustiveness guard
  }
}

// usage
const [state, dispatch] = useReducer(reducer, { status: "idle" } as State);
if (state.status === "success") {
  // TS narrows: state.data is User[]
}
```

Key points: discriminated union on `type` for actions and `status` for state lets TS narrow inside switch; `assertNever` enforces exhaustiveness at compile time — adding a new action without handling it is a TS error. Pattern scales to xstate-like state machines. Reference: TypeScript handbook §Discriminated Unions.

**rubric:** 12-pt: discriminated unions for State + Action (3) + reducer with switch (3) + assertNever exhaustiveness (3) + initial state cast (1) + narrowing usage example (2).

**watermark_seed:** qorium-react-v0.6-093-seed-2c8a5e4f
**variant_seed:** qorium-react-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

### QUESTION 94: Portals + Modal a11y (Hard)

**question_id:** QOR-REACT-094
**skill_id:** senior-react-094
**sub_skill_id:** portal-modal-a11y
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** React docs §createPortal; WAI-ARIA Authoring Practices §Dialog

**body:**

A custom `<Modal>` rendered with `createPortal` to `document.body` works visually but fails a11y audit. Most likely missing items?

**options:**

- A) Z-index issues
- B) Missing: focus trap (focus must stay within modal until close), Escape-key close, `role="dialog" aria-modal="true" aria-labelledby` on dialog, `inert` on background content (or `aria-hidden`), and return focus to invoker on close
- C) Need TypeScript
- D) Add `tabIndex={-1}` to the body

**answer_key:**

B — These are the canonical dialog a11y requirements. Use `react-aria` `useDialog`, Radix UI Dialog, or Reach UI to get all of them out of the box; rolling your own is a common bug source. Reference: WAI-ARIA Authoring Practices §Dialog.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-094-seed-3a8c4b9e
**variant_seed:** qorium-react-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

### QUESTION 95: Concurrent Mode Tearing (Hard)

**question_id:** QOR-REACT-095
**skill_id:** senior-react-095
**sub_skill_id:** concurrent-tearing
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** React 18 docs §useSyncExternalStore

**body:**

When integrating an external store (Zustand, Redux) with React 18 concurrent rendering, why is `useSyncExternalStore` important?

**options:**

- A) It's syntax sugar
- B) Concurrent rendering can pause/resume renders; without `useSyncExternalStore`, two parts of the tree could read different store values during the same render = "tearing." `useSyncExternalStore` opts the subscription into React's tearing-prevention guarantees
- C) It replaces `useEffect`
- D) It's only for SSR

**answer_key:**

B — The hook gives React the snapshot semantics needed to prevent tearing. Modern store libs (Zustand, Redux Toolkit, Jotai) call it internally. Reference: React 18 docs §useSyncExternalStore.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-095-seed-7e2c4a8b
**variant_seed:** qorium-react-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

### QUESTION 96: useEvent / Effect Event Workaround (Hard - Code)

**question_id:** QOR-REACT-096
**skill_id:** senior-react-096
**sub_skill_id:** effect-event-workaround
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** React docs §Separating Events from Effects; useEffectEvent RFC

**body:**

A `useEffect` needs to read the LATEST `theme` (a prop) when a chat-room event arrives, without re-subscribing to the chat each time `theme` changes. Implement an `useEvent`-like pattern that captures latest closure without forcing re-runs of the effect.

**options:** []

**answer_key:**

```tsx
import { useRef, useCallback, useEffect } from "react";

function useEvent<TArgs extends unknown[], TReturn>(handler: (...args: TArgs) => TReturn) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;     // keep latest reference
  });
  return useCallback((...args: TArgs) => ref.current(...args), []);  // stable
}

// usage
function ChatRoom({ roomId, theme }: { roomId: string; theme: "light" | "dark" }) {
  const onMessage = useEvent((msg: string) => {
    showNotification(msg, theme);   // reads latest theme
  });

  useEffect(() => {
    const conn = connect(roomId);
    conn.on("message", onMessage);     // stable ref, no re-subscribe
    return () => conn.disconnect();
  }, [roomId]);   // theme NOT in deps; that's the win
}
```

Key points: `useEvent` returns a stable callback that always calls the latest handler. Lets effects depend only on what should re-trigger them (`roomId`), while still using fresh values (`theme`). React's official `useEffectEvent` (canary as of mid-2024) makes this an opt-in API. Caveat: do not call the returned function during render — only inside effects/handlers. References: React docs §Separating Events from Effects; useEffectEvent RFC.

**rubric:** 12-pt: ref-mirroring of latest handler (3) + ref update inside useEffect / useLayoutEffect (3) + stable returned callback via useCallback (3) + applied to chat-room example with correct deps (3).

**watermark_seed:** qorium-react-v0.6-096-seed-9b3e5a7c
**variant_seed:** qorium-react-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Multi-Tenant Component Library (Hard - Design)

**question_id:** QOR-REACT-097
**skill_id:** senior-react-097
**sub_skill_id:** component-library-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.5
**expected_duration_minutes:** 30
**citation:** Radix UI docs; Tailwind CSS docs; Storybook docs

**body:**

Design an internal React component library used by 12 product teams. Requirements: theme-able per tenant, accessible by default, tree-shakeable, type-safe, visually testable. Cover: package layout, styling strategy, theming, distribution, versioning, testing, and how a consuming team adopts a new version. (Limit: 800 words.)

**answer_key:**

**Stack: TypeScript + Radix UI primitives + Tailwind CSS (with CSS variables for theming) + Storybook + Chromatic for visual tests.**

**Package layout (monorepo, single package).**

```
@acme/ui/
  src/
    primitives/      # Button, Input, Dialog (built on Radix)
    patterns/        # Card, EmptyState (composed primitives)
    hooks/
    icons/
    theme/           # token definitions
  package.json       # exports: ./button, ./input, ... (deep paths for tree-shake)
  stories/
  __tests__/
```

ESM with proper `exports` map, `sideEffects: false` for tree-shaking. Typings ship alongside JS.

**Styling.** Tailwind. Theme tokens (colors, spacing, radii) defined as CSS custom properties; `tailwind.config.js` reads them via `var(...)`. Each tenant gets a `<ThemeProvider tokens={{...}}>` wrapper that sets its CSS variables on a root `data-theme` attribute. Switching tenants = switching attribute. No JS theming runtime overhead.

**Primitives.** Built on Radix UI primitives — accessibility (focus trap, keyboard, ARIA) handled out of the box. Library composes Radix + adds visual styling. `<Button asChild>` pattern from Radix lets consumers swap rendered element while keeping styles + behaviour.

**Type safety.** Variant API typed via `cva` (class-variance-authority) for compile-time prop type generation. `<Button variant="primary" size="md">` produces autocomplete + invalid-variant errors.

**Testing.**

- Unit: Vitest + RTL for behaviour. Coverage gate at 90% on `primitives/`.
- Visual regression: Storybook + Chromatic. Each story is auto-screenshotted on PR; visual diff against baseline. Catches accidental visual breakage.
- A11y: `jest-axe` runs on every Storybook story in CI.

**Distribution.**

- Published to internal npm registry. SemVer.
- Each release accompanied by Chromatic build + Storybook docs deployed to internal portal.
- `CHANGELOG.md` maintained via Changesets (PR-level changeset markdown auto-aggregated on release).

**Versioning + adoption.**

- Major bumps (breaking) get a written migration guide + codemod when feasible (jscodeshift).
- Deprecations stay one major; consumers see `@deprecated` JSDoc and runtime `console.warn` (dev-only) before they're removed.
- Adoption: each consuming team pins via dependable. Library renovate-bot opens PRs to consumer repos; CI catches regressions.

**Storybook + design ↔ engineering.**

Storybook is the canonical contract with design. Each component has stories for every variant; designers review in Storybook, not Figma. Eliminates the "designed in Figma but not implemented" drift.

**Consumer flow when a new version drops.**

- Renovate opens PR.
- Storybook diff (Chromatic) preview attached.
- If no breaking change: auto-merge after CI green.
- If major: read the migration guide; apply codemod; update; PR review.

**Failure mode I'd test in CI:** "Tree-shake regression." A canary app imports a single component; bundle size measured; alarm if >5% growth. Catches accidental side-effects (deeply imported global CSS, bare imports of icon registry, etc.) — the most common library-side perf regression.

**rubric:** 18-pt: TS + Radix + Tailwind stack (3) + tree-shakeable exports + sideEffects (2) + theme via CSS variables + ThemeProvider (3) + cva for variant types (2) + Storybook + Chromatic visual regression (3) + jest-axe a11y gate (2) + Changesets-driven versioning + migration guides (3) + tree-shake-regression CI gate (1).

**watermark_seed:** qorium-react-v0.6-097-seed-2b8e4a7c
**variant_seed:** qorium-react-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — INP Crisis Post Chrome 119 (Very Hard - Casestudy)

**question_id:** QOR-REACT-098
**skill_id:** senior-react-098
**sub_skill_id:** inp-crisis-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Original-authored; Web Vitals docs §INP

**body:**

In March 2024 Google made INP (Interaction-to-Next-Paint) a Core Web Vital. Your B2C SPA's INP at p75 went from "Good" (≤200ms) to "Poor" (>500ms) overnight in CrUX data, with lighthouse giving the site a ~30-point hit. Conversion dropped 4%. Investigate, mitigate, and prevent regression. (Limit: 1000 words.)

**answer_key:**

**Key insight:** INP did not change overnight on the site; the metric definition shifted (FID → INP). Your INP was always >500ms, just unmeasured. Don't blame the team for "regression" — orient on what's actually causing slow interactions.

**Step 1 — measure properly.** Add `web-vitals` library reporting INP per page per interaction. RUM dashboard breaks down by interaction type (click, keypress, tap), device class (mobile vs desktop), and connection type. Mobile cellular on low-end Android usually dominates the p75.

**Step 2 — identify worst interactions.** INP attribution data points to specific elements. Look for the top 3 click targets contributing to the p75 tail. Likely candidates: "Add to cart," "Apply filter," "Search submit."

**Step 3 — root-cause the long tasks.** For each top interaction, run a Performance trace:
- **Long task during event handler.** Common: synchronous heavy work (filtering 5K items, parsing large JSON, formatting all dates).
- **Render blocking.** A state change triggers a 150ms reconciliation pass.
- **Third-party SDK on click.** Analytics fires synchronously.
- **Layout thrashing.** Reading then writing to DOM in a loop.

**Mitigations (in priority order):**

1. **Move heavy work off the main thread.** Filter 5K items? `useDeferredValue` to render the heavy result async. Or move to a Web Worker via `comlink`.
2. **Defer work after first paint.** Use `requestIdleCallback` or `scheduler.postTask({priority:"background"})` for non-critical work.
3. **Yield to the main thread.** Long handlers split into chunks via `await scheduler.yield()` (or `await new Promise(r=>setTimeout(r,0))`). React 18+ `startTransition` for state updates that aren't urgent.
4. **Break up React reconciliation.** Memoize heavy children (`React.memo`); split tree into smaller subtrees with their own state; lift only state that truly needs to be at root.
5. **Defer third-party scripts.** Analytics on click → fire-and-forget; don't await.
6. **Optimize INP for the specific device.** Test on a Moto G4 with 4x CPU throttling — that's roughly the p75 of mobile cellular.

**Specific React patterns:**

- `useTransition` for filter changes — keep input urgent, render filtered list in background.
- `useDeferredValue` for expensive derived state.
- Move expensive computation OUT of render into a memoized worker-backed hook.
- Virtualize long lists (TanStack Virtual). 5K DOM nodes is the killer for INP under interaction.

**Quantitative target.**

p75 INP < 200ms (Good). Path to it:
- Remove blocking analytics: −150ms
- Yield within filter: −200ms
- Virtualize cart list: −100ms

Most sites in this scenario can recover to Good in 4-6 weeks with the above.

**Prevention.**

- **CI gate.** Lighthouse-CI on synthetic mobile profile. Fail PR if INP regresses > 50ms vs main.
- **RUM-based regression alarm.** Daily alert on p75 INP > 200ms by route.
- **Long-task observer in dev.** A Performance Observer logging tasks > 50ms during dev surfaces issues before prod.
- **Engineering bar.** Every new event handler reviewed against the rule: "Does this do > 50ms of work synchronously?" If yes, redesign.

**Stakeholder comms.**

PM cares about conversion. Frame in conversion units: "p75 INP from 500 → 200 ms historically corresponds to ~5% checkout conversion uplift." Track INP and conversion on the same dashboard.

**Lessons (postmortem).**

- The team lacked RUM-based vitals; reactive (Lighthouse synthetic) tooling missed real-user pain.
- Heavy handlers had been accepted as "fast enough" because FID is forgiving; INP measures the right thing (overall interaction latency, not just first one).
- Third-party scripts owned by marketing escaped engineering review. Process change: scripts go through engineering tag-management with size budget gates.

**rubric:** 25-pt: re-frames as "always-existing latency, just-measured" (3) + RUM-first measurement (3) + attribution to specific interactions (3) + identifies common long-task root causes (4) + concrete mitigations: useTransition / useDeferredValue / yield / virtualize (5) + CI Lighthouse + RUM regression alarms (3) + PM comms in conversion units (2) + process change for third-party scripts (2).

**watermark_seed:** qorium-react-v0.6-098-seed-4d8c2a7b
**variant_seed:** qorium-react-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Casestudy — Migrating Class Components to Hooks (Hard - Casestudy)

**question_id:** QOR-REACT-099
**skill_id:** senior-react-099
**sub_skill_id:** class-to-hooks-migration
**format:** casestudy
**difficulty_b:** 1.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 30
**citation:** React docs §Hooks Migration

**body:**

A 200K-LOC React app, 60% class components, 40% hooks. Engineering wants 100% hooks for consistency, easier testing, and bundle size. Class components also block React 19 features (e.g., `use()`). Plan the migration: scope, sequencing, when NOT to migrate, automated tooling. (Limit: 800 words.)

**answer_key:**

**Recommendation.** Opportunistic migration over 9-12 months, NOT a dedicated rewrite project. Migrate when the file is touched anyway; bulk-migrate only the simplest cases via codemod.

**Scope first.**

- `react-codemod` (Facebook's tool) handles the mechanical bulk: `class C extends React.Component` with no lifecycle complexity → function component. Run dry-run; quantify hits.
- Categorize remaining classes:
  - **Simple state + render** (60%) → codemod or manual; trivial.
  - **`componentDidMount` + `componentWillUnmount`** (20%) → migrate to `useEffect` with cleanup. Watch for `componentDidUpdate` — those become `useEffect` with dependency arrays; this is where most bugs creep in.
  - **`getDerivedStateFromProps` / `componentDidUpdate` cross-talk** (10%) → re-think. Often the right answer is "remove derived state; compute on render with `useMemo`."
  - **Class-based Error Boundaries** (5%) → KEEP as classes (hooks can't catch render errors). Or use `react-error-boundary`.
  - **HOCs / decorators / reflective metadata** (5%) → Hardest cases; convert HOC to custom hook where possible; decorator-heavy code may need thoughtful redesign.

**Sequencing.**

- **Month 0:** Set up codemod CI. Add lint rule `react/prefer-function-component` (warning, not error initially) so new classes don't get added.
- **Month 1-3:** Run codemod on the simple class bucket; one PR per ~50 components for reviewability. Each PR: codemod output + manual smoke test + Storybook visual diff (no regression).
- **Month 3-9:** Migrate the lifecycle-heavy bucket as part of regular feature work. When a developer touches a class file, they migrate it. Adds ~30 minutes per touched file; tracked as part of the feature.
- **Month 9-12:** Long tail. Pair sessions for the trickiest 20 components.
- **Steady state:** ESLint upgraded to `error` on new classes; legacy class boundaries documented as exempt.

**When NOT to migrate.**

- **Error boundaries.** Hooks don't catch render errors (yet — there's an experimental hook-based RFC, but not stable). Either keep the class or use `react-error-boundary` library.
- **Code that uses old context API or `static contextTypes`.** Migrate context first, then component.
- **Third-party libraries that expect class instances.** Rare in modern React; if so, wrap.

**Automated tooling.**

- `react-codemod` for the bulk transform.
- Custom codemod for project-specific patterns (e.g., your Redux `connect()` wrapper → hooks). Use jscodeshift; spec the AST transform on a sample file first.
- Grep for `componentWillReceiveProps` / `componentWillMount` / `componentWillUpdate` (deprecated) — these need bigger changes.

**Risks.**

- **Stale-closure bugs from `componentDidUpdate` → `useEffect` translation.** Mitigation: test coverage on every migrated file before merge; if no tests, write a smoke test first.
- **Refs.** `createRef` in class → `useRef` in hook; if the class held an instance method as a ref pattern, redesign.
- **Performance.** Function components re-create handlers each render; if perf-sensitive use `useCallback`. (Same as before; the migration doesn't introduce this — but it surfaces it.)

**Validation.**

- Unit + integration test suite must stay green after each PR.
- Storybook visual regression catches CSS-coupling regressions.
- Bundle-size monitor — function components are typically slightly smaller; alert on >2% growth.

**Outcome target.**

100% function components except a deliberately retained handful of error boundaries (documented). React 19 features (`use()`, etc.) unlocked. Onboarding of new engineers simpler (one mental model). Hooks-friendly devtools and React Compiler now applicable.

**rubric:** 18-pt: opportunistic-not-project-rewrite framing (3) + bucket categorization (3) + codemod for simple bulk (2) + when-not-to-migrate exclusions called out (3) + ESLint ratchet (1) + risks (stale-closure, refs) (3) + validation strategy (3).

**watermark_seed:** qorium-react-v0.6-099-seed-7c2a8e4b
**variant_seed:** qorium-react-v0.6-2026-05-07-099
**bias_check_notes:** No bias.

---

### QUESTION 100: Casestudy — Architecting a Headless Frontend Platform (Very Hard - Casestudy)

**question_id:** QOR-REACT-100
**skill_id:** senior-react-100
**sub_skill_id:** headless-frontend-platform
**format:** casestudy
**difficulty_b:** 1.7
**discrimination_a:** 1.7
**expected_duration_minutes:** 40
**citation:** Original-authored; micro-frontend patterns

**body:**

You're CTO of a SaaS company with 12 product surfaces (web admin, customer portal, partner portal, marketplace, mobile-web, etc.). Each surface is built independently today; teams duplicate auth, design system, and analytics. You want a "platform" approach: shared primitives, fast onboarding for new surfaces, but no monolith. Architect this. Cover: monorepo vs polyrepo, micro-frontends or shared packages, deployment, design system distribution, auth + telemetry, governance. (Limit: 1200 words.)

**answer_key:**

**Recommendation: pnpm monorepo + shared packages (NOT module federation micro-frontends). 12 product surfaces is small enough that the operational cost of micro-frontends outweighs benefits.**

**Why monorepo + shared packages.**

- 12 surfaces × small teams: monorepo's atomic-change-across-packages benefit is high.
- Module Federation (Webpack 5) micro-frontends introduce runtime composition complexity, version-skew bugs, and shared-dependency hazards. Worth it only at much larger scale (50+ surfaces, multi-team / multi-org).
- Shared packages give 80% of the benefit (single design-system source) at 10% of the operational cost.
- Caveat: if a surface needs independent deploy cadence outside the platform (legal/regulatory hold), Module Federation for THAT surface only, as an exception.

**Repo structure.**

```
acme-frontend/
  apps/
    admin/             # Next.js 15 App Router
    customer-portal/   # Next.js
    marketplace/       # Vite SPA
    ...
  packages/
    ui/                # design system (Radix + Tailwind + cva)
    auth/              # OIDC client, hooks, route guards
    api-clients/       # generated TS clients per service
    analytics/         # OpenTelemetry + product analytics
    feature-flags/     # OpenFeature wrapper
    types/             # cross-cutting types (User, Tenant)
    eslint-config/
    tsconfig/
  turbo.json           # task pipeline
  pnpm-workspace.yaml
  .changeset/
```

Tooling: pnpm workspaces, Turborepo for caching, Changesets for versioning of internal packages.

**Design system (`packages/ui`).**

Internal-only npm. Versioned via Changesets. Storybook + Chromatic. Tailwind tokens via CSS variables (per-surface theming). a11y via Radix primitives. Same as Q97 above.

**Auth (`packages/auth`).**

OIDC provider with per-surface redirect URIs. Single React provider + hooks (`useUser`, `useRequireAuth`). Token refresh shared. Session cookie strategy unified (SameSite=Lax; CSRF for write requests). Server-side: middleware in each Next app re-uses a shared `validateSession` from `packages/auth/server`.

**API clients.**

OpenAPI specs per service → generate TS clients into `packages/api-clients` (codegen via `openapi-typescript-codegen` or `kubb`). Each client is independently versioned via Changesets — when a service ships a breaking change, the client major-bumps and consuming surfaces update at their own pace.

**Telemetry.**

`packages/analytics` wraps OpenTelemetry web SDK + product analytics (Amplitude/Mixpanel). Single tag (`init({surface: "admin", tenantId, userId})`). All surfaces emit identically; dashboards filter by `surface`. Eliminates the "every team rolls its own" anti-pattern.

**Feature flags.**

`packages/feature-flags` wraps OpenFeature + a vendor (LaunchDarkly, GrowthBook, or in-house). Targeting keys: `tenantId`, `userId`, `surface`. Cached for ~30s.

**Deployment.**

- Each app independently buildable + deployable. Turborepo's affected-files graph means CI builds only changed apps.
- Per-surface deploy pipeline (Vercel/Netlify/internal K8s — pick per app's needs).
- Versioning: apps use git SHA; packages use Changesets-driven SemVer.

**Governance.**

- **Design system PRs:** require design lead + a11y reviewer.
- **Auth/security packages:** require security review.
- **Breaking package changes:** Changeset markdown describes migration; surface owners auto-tagged. 30-day deprecation window before a major.
- **API contracts:** OpenAPI spec PRs require backend service owner approval. CI runs contract tests.
- **No fork-and-modify of shared packages.** If a surface needs custom behaviour, contribute upstream or use a documented extension API.

**Onboarding new surface (target: < 1 day).**

```
pnpm exec acme-cli new-surface my-surface
```

Generates: Next.js scaffold using `packages/ui`, pre-wired auth, telemetry, feature flags. Pulls vault secrets via `dotenv-vault`. Produces a working "hello world" app with the shared chrome and a single demo route.

**Cross-cutting telemetry dashboard.**

Single Grafana per-surface tile: TTI, INP, error rate, conversion (where applicable). Single source of truth keeps PMs and engineers honest about cross-surface health.

**Risks.**

- **Monorepo CI time.** Mitigation: Turborepo remote cache; CI runs only affected apps' tests.
- **Shared-package breakage cascades.** Mitigation: Chromatic visual diff + canary deploys per consuming app.
- **Design-system PR queue.** Mitigation: clear ownership, dedicated maintainers, response SLA.
- **Migration from existing 12 standalone apps.** Mitigation: 6-month opportunistic migration; new surfaces ship in monorepo; existing surfaces migrate one at a time as part of regular feature work.

**Anti-pattern to avoid.**

"Single global app shell with iframe surfaces." Iframes are a UX wreck (no shared state, poor a11y, confusing routing). Module Federation handles the same use case more cleanly when the scale demands it.

**Outcome target (12 months).**

- All 12 surfaces consume `packages/ui` (no more design drift).
- New surface stand-up: < 1 day to "hello world."
- Engineering velocity: surface team feature ship time -25% (shared infra, no auth/telemetry rebuilds).
- Cross-surface UX consistency measurable via design-system component-coverage metric.

**Final note.**

The 12-surface scale is the sweet spot for monorepo + shared packages. At 5 it's overkill; at 50 it's not enough (then evaluate Module Federation, OOTB micro-frontends like single-spa, or organizational repo splits). Right-sizing the platform to the scale matters more than picking the trendiest pattern.

**rubric:** 30-pt: monorepo+shared-packages choice over Module Federation with reasoning (4) + per-package separation (UI, auth, api-clients, analytics, feature-flags) (5) + Turborepo + pnpm + Changesets toolchain (3) + per-surface independent deploy (2) + onboarding flow (3) + governance: design / security / breaking-change processes (4) + risks + mitigations (3) + 6-month migration plan opportunistic (3) + cross-surface telemetry consistency (3).

**watermark_seed:** qorium-react-v0.6-100-seed-2c8a4e7b
**variant_seed:** qorium-react-v0.6-2026-05-07-100
**bias_check_notes:** No bias.

---

## End of Senior React QOR-REACT-081..100 Extension (Wave-1, v0.6)

**Distribution:** 12 MCQ + 4 code + 2 design + 2 casestudy.
**Difficulty mix:** 3 Easy + 9 Medium + 6 Hard + 2 Very Hard.
**Status:** AI-drafted. Awaiting SME Lead validation per Constitution v0.6.
**Cumulative:** Senior React now at 100/100 ✅. Wave-1 status: Java 100, Python 100, React 100 (3 of 8 sub-skills).
