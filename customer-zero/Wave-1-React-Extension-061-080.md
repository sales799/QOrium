# Wave 1 Extension: Senior React (QOR-REACT-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior React scaling: 60→80 Qs). SME Lead validation pending. Reference baseline: React 19 (use, useTransition, Server Components GA), Next.js 15 (App Router), TanStack Query 5, Vite 5/Rspack, TypeScript 5.x.

---

## Extension: 20 NEW Questions (QOR-REACT-061..080)

Difficulty: 3 Easy / 9 Medium / 6 Hard / 2 Very Hard
Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: React 19 `use()` Hook for Promises (Easy)

**question_id:** QOR-REACT-061
**skill_id:** senior-react-061
**sub_skill_id:** react-19-use
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** React 19 Release Notes; React docs §use

**body:**

What does the new `use(promise)` API in React 19 do?

**options:**

- A) It is a synchronous version of `useEffect`
- B) Inside a Component or Server Component, `use(promise)` suspends the component until the promise resolves; integrates with `<Suspense>` for declarative async data
- C) It replaces `useState` for primitive values
- D) It runs only on the server; throws if called in the client

**answer_key:**

B — `use(promise)` is a first-class way to read resources during render. In a Server Component it awaits inline; in a Client Component it triggers Suspense if the promise hasn't resolved. Unlike hooks, `use` may be called inside conditionals/loops. Reference: React 19 release notes; React docs §use.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-061-seed-3a8c7e1d
**variant_seed:** qorium-react-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

### QUESTION 62: useTransition for Non-Urgent Updates (Easy)

**question_id:** QOR-REACT-062
**skill_id:** senior-react-062
**sub_skill_id:** use-transition
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** React docs §useTransition

**body:**

`startTransition(() => setSearchResults(filtered))` — what's the benefit?

**options:**

- A) Updates run faster
- B) The state update is marked as **non-urgent**; React keeps the previous UI interactive (urgent updates like typing don't lag) and renders the transition state separately. `isPending` flag lets you show a stale-while-revalidating UI
- C) It batches multiple `setState` calls
- D) It replaces `useEffect`

**answer_key:**

B — Transitions are React's mechanism for "this update is deferrable." React keeps high-priority work (typing, clicks) responsive while transitions render in the background. `isPending` = true during transition; show optional spinner or `[data-pending]`. Reference: React docs §useTransition.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-062-seed-9b3e2a7c
**variant_seed:** qorium-react-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

### QUESTION 63: Server Components vs Client Components (Easy)

**question_id:** QOR-REACT-063
**skill_id:** senior-react-063
**sub_skill_id:** rsc-vs-client
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** React Server Components RFC; Next.js 15 docs

**body:**

Which statement about React Server Components (RSC) is TRUE?

**options:**

- A) RSCs run in the browser like normal components
- B) RSCs render on the server, ship NO JS to the client, can directly access DB/file system, and CAN'T use state, effects, or browser APIs. Mark Client Components with `"use client"`
- C) RSCs replace API routes
- D) RSCs require Redux

**answer_key:**

B — RSCs are server-only: zero JS sent to the client for the component itself. Cannot use `useState`/`useEffect` or browser APIs. Compose with Client Components by importing them; the boundary is `"use client"`. Bundle wins are largest for static-content pages with islands of interactivity. Reference: React docs §Server Components.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-063-seed-5c4f8e2a
**variant_seed:** qorium-react-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

### QUESTION 64: TanStack Query staleTime vs gcTime (Medium)

**question_id:** QOR-REACT-064
**skill_id:** senior-react-064
**sub_skill_id:** tanstack-query-cache
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** TanStack Query 5 Documentation

**body:**

In TanStack Query 5, what's the difference between `staleTime` and `gcTime`?

**options:**

- A) They are aliases
- B) `staleTime` = how long data is fresh (no background refetch); `gcTime` (formerly `cacheTime`) = how long inactive data stays in memory before garbage-collection. Defaults: staleTime=0 (always stale), gcTime=5 min
- C) `staleTime` is in ms, `gcTime` is in seconds
- D) `gcTime` only affects mutations

**answer_key:**

B — Two different windows. Default `staleTime: 0` means every mount/focus triggers a refetch (often surprising); `staleTime: 30_000` is a common production setting for read-heavy lists. `gcTime` controls memory cleanup of cache entries with no observers. v5 renamed `cacheTime` → `gcTime`. Reference: TanStack Query 5 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-064-seed-2e7c9a4b
**variant_seed:** qorium-react-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

### QUESTION 65: useMemo vs useCallback Real Use Cases (Medium)

**question_id:** QOR-REACT-065
**skill_id:** senior-react-065
**sub_skill_id:** memo-callback
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** React docs §useMemo, §useCallback; "you don't need useMemo" critique

**body:**

When is `useMemo` actually beneficial?

**options:**

- A) Always; wrap every computation
- B) When the computation is genuinely expensive (>1ms) OR the result is a referential dependency for `React.memo` children / hook dependency arrays. Otherwise the memoization overhead exceeds the savings
- C) Only inside `useEffect`
- D) Never; React 19 makes it obsolete (compiler memoizes everything)

**answer_key:**

B — `useMemo` has cost (closure + comparison); only worthwhile for expensive compute or stable references for memoized children. The React Compiler (experimental in 19) auto-memoizes, reducing manual `useMemo` need — but it's not yet default in production for most teams. Reference: React docs §useMemo.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-065-seed-8a3f4c2e
**variant_seed:** qorium-react-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

### QUESTION 66: Zustand vs Redux Toolkit (Medium)

**question_id:** QOR-REACT-066
**skill_id:** senior-react-066
**sub_skill_id:** zustand-redux
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Zustand docs; Redux Toolkit docs

**body:**

For a new mid-size SPA's global state, which is the modern lean choice?

**options:**

- A) Plain Redux with sagas
- B) Zustand — minimal API (a hook returns slice via selector), no Provider needed, no boilerplate; Redux Toolkit is the better-than-classic-Redux choice when DevTools, time-travel, or strict immutability via Immer are required
- C) Context API for everything
- D) MobX

**answer_key:**

B — Zustand's footprint is tiny (~1KB), no Provider, supports devtools middleware, persist middleware, and selectors that auto-bail render unchanged slices. RTK is the right pick when team already invested in Redux patterns or needs the DevTools time-travel UX. Context for global state has render-fan-out drawbacks at scale. References: Zustand and RTK docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-066-seed-4d9b2a7c
**variant_seed:** qorium-react-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

### QUESTION 67: Suspense Waterfalls and Parallel Fetches (Medium)

**question_id:** QOR-REACT-067
**skill_id:** senior-react-067
**sub_skill_id:** suspense-waterfall
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** React docs §Suspense; Next.js 15 data-fetching docs

**body:**

A Server Component fetches user, then sequentially renders a child that fetches user's orders. Both endpoints take 200ms. Total user-visible wait?

**options:**

- A) 200ms — React parallelizes automatically
- B) ~400ms — sequential. Fix: kick off both promises in the parent (`const [user, orders] = await Promise.all([getUser(id), getOrders(id)])`) OR start orders fetch in the child but pass the **promise** down as a prop so React can resolve in parallel via `<Suspense>` + `use(promise)`
- C) ~800ms
- D) Indeterminate

**answer_key:**

B — The classic Suspense waterfall: child suspends only when rendered, by which time parent's fetch already finished. Solutions: (a) start both fetches in the parent, (b) start child fetch via `getOrders(id)` (no await), pass the Promise down, child uses `use(orderPromise)`. References: React docs §Suspense; Next.js fetch deduping.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-067-seed-6c2e8a4f
**variant_seed:** qorium-react-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

### QUESTION 68: React.memo and Reference Equality (Medium)

**question_id:** QOR-REACT-068
**skill_id:** senior-react-068
**sub_skill_id:** react-memo-equality
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React docs §React.memo

**body:**

`<Child onClick={() => save()} />` inside a parent that re-renders. Wrapping `Child` in `React.memo` gives no perf win. Why?

**options:**

- A) `React.memo` doesn't work on event-handler-receiving components
- B) The arrow function `() => save()` is created fresh each render → reference inequality → memo bails out. Wrap in `useCallback` (with proper deps) to stabilize the reference
- C) `React.memo` requires `propsAreEqual` second arg
- D) Children with `onClick` always re-render

**answer_key:**

B — `React.memo` does shallow equality on props; new arrow function = new reference each render. Stabilize with `useCallback(() => save(), [...])`. Same caveat for inline objects/arrays. Reference: React docs §React.memo.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-068-seed-1f8b3a9c
**variant_seed:** qorium-react-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

### QUESTION 69: useEffect Dependency Array Pitfalls (Medium)

**question_id:** QOR-REACT-069
**skill_id:** senior-react-069
**sub_skill_id:** useeffect-deps
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** React docs §useEffect; "You Might Not Need an Effect"

**body:**

```jsx
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // <-- bug
  return <div>{user?.name}</div>;
}
```

What's wrong?

**options:**

- A) Nothing — empty deps mean "fetch once"
- B) `userId` is referenced but missing from deps → effect captures the initial `userId` and never re-fetches when prop changes. Fix: include `userId`. Plus add cleanup to abort stale fetch when prop changes mid-flight (AbortController)
- C) `setUser` should be in deps
- D) `useEffect` doesn't accept arrow functions

**answer_key:**

B — Missing dep is the most common React bug. ESLint plugin `react-hooks/exhaustive-deps` catches it. Also need cleanup with `AbortController` to prevent setting state on stale response (unmounted/changed-prop component). React 18 strict mode runs effects twice in dev to surface missing cleanup. Reference: React docs §useEffect.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-069-seed-3e7c5b9a
**variant_seed:** qorium-react-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

### QUESTION 70: Concurrent Rendering and Strict Mode Double Effects (Medium)

**question_id:** QOR-REACT-070
**skill_id:** senior-react-070
**sub_skill_id:** strict-mode-effects
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** React docs §StrictMode

**body:**

In React 18+ Strict Mode (dev only), `useEffect` runs twice on mount. Why?

**options:**

- A) A bug
- B) To surface effects that don't clean up properly — e.g., subscribers that keep adding listeners. Forces developers to write reversible effects (cleanup actually does the inverse of setup)
- C) To cache the first render
- D) It only happens in tests

**answer_key:**

B — Double-invocation in dev catches a real class of bugs (un-cleaned event listeners, doubled subscriptions, doubled API calls without idempotency). Production runs effects once. The "fix" is always to write a proper cleanup function, not to suppress the warning. Reference: React docs §StrictMode.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-070-seed-9b4e2c7a
**variant_seed:** qorium-react-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

### QUESTION 71: Hydration Mismatch Causes (Medium)

**question_id:** QOR-REACT-071
**skill_id:** senior-react-071
**sub_skill_id:** hydration-mismatch
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** React docs §Hydration; Next.js docs §Hydration errors

**body:**

A Next.js app throws "Hydration failed" with a Date.now() text mismatch. Why?

**options:**

- A) Server bug
- B) Server HTML and client first render must match exactly; calling `Date.now()` produces different values on server vs client. Fix: render the dynamic value client-side only via `useEffect` + state, OR use `suppressHydrationWarning` on the leaf (sparingly), OR generate the value at request time and pass as prop
- C) Need to upgrade React
- D) It's a CSP issue

**answer_key:**

B — Hydration is reconciliation of server-rendered DOM with client React tree; any divergence is an error. Common offenders: `Date.now()`, `Math.random()`, `localStorage`, `window.innerWidth`, `navigator.*`, locale-dependent formatting. The proper fix is render-server, then update-client; or pin to a server-stable value. Reference: React docs §Hydration; Next.js debugging hydration errors.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-071-seed-7a2f5c8b
**variant_seed:** qorium-react-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Virtualized List for 100k Rows (Hard - Code)

**question_id:** QOR-REACT-072
**skill_id:** senior-react-072
**sub_skill_id:** virtualization-tanstack
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** TanStack Virtual Documentation

**body:**

Implement a virtualized list rendering 100,000 rows of variable height (40-120px) using `@tanstack/react-virtual`. Each row receives `{ id, content }`. Show only visible rows + a small over-scan; container has fixed height of 600px. Provide TypeScript code.

**options:** []

**answer_key:**

```tsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Row { id: string; content: string }

export function VirtualList({ rows }: { rows: Row[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,    // mid-range estimate
    overscan: 8,                // render N extra items above/below viewport
    measureElement: (el) => el.getBoundingClientRect().height, // dynamic measure
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vItem) => {
          const row = rows[vItem.index];
          return (
            <div
              key={row.id}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vItem.start}px)`,
              }}
            >
              {row.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Key points: `estimateSize` is the initial guess; `measureElement` ref enables variable-height items. `overscan` smooths fast scroll. Total wrapper sets correct scrollbar dimensions. Avoid `key={vItem.index}` — use stable row.id so React can reuse DOM. References: TanStack Virtual docs.

**rubric:** 12-pt: useVirtualizer config (3) + dynamic measureElement for variable height (3) + absolute positioned rows w/ transform (2) + stable keys (2) + overscan + total-size wrapper (2).

**watermark_seed:** qorium-react-v0.6-072-seed-2c8a4e7b
**variant_seed:** qorium-react-v0.6-2026-05-07-072
**bias_check_notes:** No bias.

---

### QUESTION 73: Optimistic Update with TanStack Query (Hard - Code)

**question_id:** QOR-REACT-073
**skill_id:** senior-react-073
**sub_skill_id:** optimistic-update
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** TanStack Query 5 docs §Optimistic Updates

**body:**

Implement a "Like" button using TanStack Query 5 with optimistic updates. Toggle a like on a Post; rollback on error; refetch on success. Provide hook + component.

**options:** []

**answer_key:**

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Post { id: string; liked: boolean; likes: number }

async function toggleLike(postId: string): Promise<Post> {
  const r = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!r.ok) throw new Error("toggle failed");
  return r.json();
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["post", postId] }); // avoid race
      const prev = qc.getQueryData<Post>(["post", postId]);
      qc.setQueryData<Post>(["post", postId], (old) =>
        old ? { ...old, liked: !old.liked, likes: old.likes + (old.liked ? -1 : 1) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post", postId], ctx.prev); // rollback
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["post", postId] }),
  });
}

export function LikeButton({ postId }: { postId: string }) {
  const { mutate, isPending } = useToggleLike(postId);
  return <button onClick={() => mutate()} disabled={isPending}>Like</button>;
}
```

Pattern: `onMutate` cancels in-flight refetches, snapshots prev state, applies optimistic mutation; `onError` rolls back; `onSettled` re-syncs with server. Idempotent. References: TanStack Query 5 §Optimistic Updates.

**rubric:** 12-pt: cancelQueries before optimistic write (2) + snapshot for rollback (3) + setQueryData immutable update (3) + onError rollback (2) + invalidate on settled (2).

**watermark_seed:** qorium-react-v0.6-073-seed-4f9c3a8e
**variant_seed:** qorium-react-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

### QUESTION 74: Custom Hook Composition Pattern (Hard)

**question_id:** QOR-REACT-074
**skill_id:** senior-react-074
**sub_skill_id:** custom-hook-composition
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** React docs §Reusing Logic with Custom Hooks

**body:**

Why is `useDebounce(value, ms)` PREFERRED over inlining `setTimeout` in a component?

**options:**

- A) Hooks are faster than setTimeout
- B) The custom hook encapsulates the timer + cleanup logic, returning a stable debounced value. Can be composed with `useEffect` for fetch-on-debounce; tests can mock the hook in isolation; SSR-safe (timer cleared on unmount in cleanup)
- C) `setTimeout` doesn't work in functional components
- D) Required by React Server Components

**answer_key:**

B — Custom hooks isolate behaviour, enabling reuse, testing, and SSR-safety (cleanup cancels stale timers when unmounted or value changes mid-debounce). Composition: pair with `useEffect` reading the debounced value to trigger search. Reference: React docs §Reusing Logic with Custom Hooks.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-074-seed-1e7b3c9a
**variant_seed:** qorium-react-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

### QUESTION 75: Forms — react-hook-form + Zod (Hard)

**question_id:** QOR-REACT-075
**skill_id:** senior-react-075
**sub_skill_id:** rhf-zod
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** react-hook-form docs; zod docs

**body:**

For a complex form (10+ fields, async username uniqueness check, client+server validation parity), the modern stack is:

**options:**

- A) Formik with Yup
- B) react-hook-form with `@hookform/resolvers/zod` schema, sharing the SAME zod schema between client and server (TypeScript types auto-inferred via `z.infer`); uncontrolled inputs minimize re-renders
- C) Native `<form>` with FormData and manual validation
- D) Redux Form

**answer_key:**

B — RHF + zod is the dominant 2024-2025 stack. Single schema source-of-truth shared by client (form validation) and server (API validation, types via `z.infer`). RHF's uncontrolled-input architecture minimizes re-renders. Async validation per field via `mode: "onBlur"` + custom rule. Server returns Zod issues; map back to form fields. References: react-hook-form docs; zod docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-075-seed-8c4a7e2b
**variant_seed:** qorium-react-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

### QUESTION 76: Design — Realtime Collaborative Document Editor (Hard - Design)

**question_id:** QOR-REACT-076
**skill_id:** senior-react-076
**sub_skill_id:** collab-editor-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Yjs docs; Liveblocks docs; Figma's CRDT blog

**body:**

Design a realtime collaborative rich-text editor (think Google Docs Lite) for up to 50 simultaneous users per document. Cover: data model (CRDT vs OT), presence/cursors, persistence, offline support, undo/redo semantics, and one specific failure mode you'd test. (Limit: 800 words.)

**answer_key:**

**Stack: Yjs (CRDT) + ProseMirror (rich-text editor) + y-prosemirror binding + y-websocket (transport) + persistence in Postgres.**

**CRDT vs OT.** Yjs (CRDT) has better merge characteristics under partition than OT and lets clients work offline cleanly; OT (Google Docs original) requires a central authority for transformation. CRDT has higher metadata cost but is the modern 2020s default. Figma uses a custom CRDT; Liveblocks/Linear use Yjs.

**Editor.** ProseMirror (mature, schema-based) with `y-prosemirror` binding. Schema enforces document structure (no broken HTML). Plugins handle paste, links, code blocks.

**Transport.** WebSocket (`y-websocket` server) with binary protocol for Yjs updates. Fallback to long-poll for restrictive networks. Authentication via short-lived JWT.

**Persistence.**
- Server holds the latest Yjs document state in Postgres `documents.state BYTEA`.
- On every K updates or T seconds, server serializes Yjs doc and writes a snapshot to S3 (versioned).
- Update log table for replay/audit. Compact periodically.

**Presence + cursors.** Yjs `awareness` API: each client publishes `{ user, color, cursor: {pos, anchor} }`. Updates propagate via the same WebSocket; not persisted.

**Offline support.** Yjs is CRDT — clients can mutate offline (IndexedDB persistence via `y-indexeddb`). On reconnect, deltas merge. UI shows "Offline — changes will sync."

**Undo/redo.** Yjs `UndoManager` is per-client by default (you only undo your own edits, not collaborators'). Configure scope to a shared transaction group if undo-of-others is desired (rarely is).

**Auth + permissions.** JWT carries `doc_id`, role (`viewer | editor | owner`). Server validates on connect and on every transaction (server can enforce schema-level permissions via Yjs `Awareness` filter).

**Scaling.** Per-document in-memory state on a stateful server pinned by hash(doc_id) → server. Hot-doc fan-out: max 50 users; that's still small. Cross-region: a single primary per doc; viewers in other regions accept slightly higher latency or use a regional read-replica protocol.

**Failure mode I'd game-day.** "Stateful server crash mid-session." Kill the y-websocket server holding 30 active doc sessions. Verify: clients auto-reconnect to a new server; the new server hydrates from Postgres; clients merge any locally-buffered offline edits without data loss. The recovery time and any duplicated/lost characters tell you whether the snapshot cadence is right.

**Honorable mentions (if word budget):** rate limit on awareness updates (cursor spam), abuse handling (block user mid-doc), telemetry (P50/P99 update-to-broadcast latency).

**rubric:** 18-pt: CRDT vs OT decision (3) + ProseMirror+Yjs binding (2) + WebSocket transport (2) + persistence + snapshot strategy (3) + presence/cursor mechanism (2) + offline IndexedDB (2) + UndoManager scope (2) + crash-recovery game-day with concrete recovery test (2).

**watermark_seed:** qorium-react-v0.6-076-seed-3a8b5e9c
**variant_seed:** qorium-react-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

### QUESTION 77: Bundle Splitting and Lazy Loading (Hard)

**question_id:** QOR-REACT-077
**skill_id:** senior-react-077
**sub_skill_id:** bundle-splitting
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** React docs §lazy; Vite/webpack docs

**body:**

A 2.5 MB single-bundle SPA needs to drop initial-load JS to <200 KB. The CORRECT approach combines:

**options:**

- A) Minification only
- B) Route-level `React.lazy(() => import('./RouteX'))` + `<Suspense>` boundaries; vendor-chunk splitting (Vite/webpack); per-route code splits; analyze bundle (`rollup-plugin-visualizer` / webpack-bundle-analyzer) and remove unused dependencies; replace heavy libs (moment → date-fns, lodash → es-toolkit per-method)
- C) Move the entire app to RSC
- D) Disable source maps in production

**answer_key:**

B — Three levers in order of impact: (1) route-based code split (single biggest win for multi-page SPAs), (2) bundle audit + heavy-lib swaps, (3) vendor-chunking + per-route splits. RSC (C) is a bigger architectural shift; useful but not the first lever. Tools: `rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`. References: React docs §lazy; Vite splitting docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-077-seed-7e3c2a9b
**variant_seed:** qorium-react-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

### QUESTION 78: WebSocket Subscription Hook (Hard - Code)

**question_id:** QOR-REACT-078
**skill_id:** senior-react-078
**sub_skill_id:** websocket-hook
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** React docs §useSyncExternalStore; WebSocket API

**body:**

Implement `useWebSocket<T>(url: string)` returning `{ messages: T[], status, send }`. Must: handle reconnect with exponential backoff; clean up on unmount; not double-subscribe in Strict Mode dev. Provide TypeScript code.

**options:** []

**answer_key:**

```tsx
import { useEffect, useRef, useState, useCallback } from "react";

type Status = "connecting" | "open" | "closed";

export function useWebSocket<T>(url: string) {
  const [messages, setMessages] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);

  const connect = useCallback(() => {
    if (cancelledRef.current) return;
    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptsRef.current = 0;
      setStatus("open");
    };
    ws.onmessage = (e) => {
      try {
        setMessages((prev) => [...prev, JSON.parse(e.data) as T]);
      } catch {
        /* swallow parse errors at boundary */
      }
    };
    ws.onclose = () => {
      setStatus("closed");
      if (cancelledRef.current) return;
      const backoff = Math.min(30_000, 500 * 2 ** attemptsRef.current++);
      const jitter = Math.random() * backoff;
      setTimeout(connect, jitter);
    };
    ws.onerror = () => ws.close();
  }, [url]);

  useEffect(() => {
    cancelledRef.current = false;
    connect();
    return () => {
      cancelledRef.current = true;          // cancel future reconnects
      wsRef.current?.close();                // unmount cleanup
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { messages, status, send };
}
```

Key points: `cancelledRef` prevents reconnect storm after unmount (Strict Mode double-effect safe — second cleanup sets cancelled = true). Full-jitter backoff. `send` no-op when not OPEN. References: React useEffect cleanup; WebSocket API.

**rubric:** 12-pt: reconnect with exponential + jitter (3) + cancellation flag for unmount-safety (3) + readyState guard on send (2) + clean message ingestion (2) + status state machine (2).

**watermark_seed:** qorium-react-v0.6-078-seed-9b5c4f3e
**variant_seed:** qorium-react-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — TTI Regression on E-commerce (Very Hard - Casestudy)

**question_id:** QOR-REACT-079
**skill_id:** senior-react-079
**sub_skill_id:** tti-regression-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Original-authored; Web Vitals docs; Next.js performance guide

**body:**

A B2C ecommerce SPA's Lighthouse TTI (Time-to-Interactive) jumped from 2.1s → 5.3s after the last 4-week sprint. PM reports a 12% drop in mobile checkout conversion. You have 2 weeks to recover. Walk through your investigation, the most likely culprits, mitigation order, and how you'd prevent regression. (Limit: 1000 words.)

**answer_key:**

**Step 1 — quantify, don't guess.** Pull RUM (real-user monitoring) data: TTI / LCP / INP percentiles by device class (mobile cellular vs desktop) for the past 60 days. The Lighthouse number is a synthetic snapshot; RUM shows real users. Confirm the regression is real for your bottom-quartile devices (likely the bulk of mobile cellular traffic in India: low-end Androids on 3G/4G).

**Step 2 — bisect via release versions.** Sprint had ~40 PRs. RUM tags each release; chart TTI per release. Most likely the regression is concentrated in 1-2 releases. Target those PRs for review.

**Most likely culprits (in order of frequency):**

1. **A new third-party SDK loaded synchronously.** Chat widget, analytics, A/B testing, ad tags. Each one adds 50-300 KB and blocks main thread on parse. Fix: lazy-load on user intent, OR async/defer the script tag, OR use a Tag Manager that lazy-loads.
2. **A heavy dependency added (e.g., `moment`, `lodash` full-bundle, charts lib).** Fix: tree-shake or replace (`date-fns`, `es-toolkit`, lazy-load chart on dashboard route only).
3. **A useEffect that fetches non-critical data on mount, blocking with Suspense or contributing to long task.** Fix: lower priority, fetch after first paint, or render placeholder.
4. **An image or font that's render-blocking.** Fix: `font-display: swap`, preload critical fonts, lazy-load below-fold images, use AVIF/WebP.
5. **A SSR/hydration regression** — Next.js page rendered as client component instead of server, increasing JS payload. Fix: convert leaf to RSC.
6. **Bundle splitting accidentally undone** — a shared util now imports the dashboard chunk, dragging it into the homepage bundle.

**Investigation order (in 1-2 days):**

- Open production-build bundle visualizer; compare to a 30-day-old build. The single biggest size delta is the smoking gun in 70% of cases.
- Run Lighthouse + WebPageTest on a real low-end Android (Moto G4 emulation in Lighthouse; real device is better). Look at Long Tasks; they identify which scripts are eating main-thread time.
- Filter Chrome DevTools Performance trace to "JS execution" — top entries by self time identify the heavy library.

**Mitigation order (week 1):**

1. Defer third-party scripts (1-day fix; most leverage). Move from `<script>` in `<head>` to `<script defer>` in `<body>` or load post-load via a loader.
2. Lazy-load the heavy lib found in step 2 to the route that actually uses it (1-day fix).
3. Re-enable any accidentally-broken bundle splits (1-day fix).
4. Convert candidate Client Components to Server Components if Next.js (2-day fix).

Expected gain: 5.3s → 3.0s within week 1.

**Mitigation week 2:** font/image optimizations, replace heavy lib with lighter alternative, tighter useEffect priorities. Aim 3.0 → 2.2s.

**Prevention.**

- Add a CI gate: bundle-size check on PR diff; fail build if `index.js` grows by >10 KB without override label. `bundlewatch` or `size-limit` configures per-route caps.
- Add Lighthouse CI on a synthetic mobile profile, gating PRs on TTI / LCP regression.
- Add a "third-party audit" — keep a registry of every external script + its size + its owner. Quarterly review.
- RUM dashboard with named-release annotations so the next regression is identifiable in 5 minutes.

**Stakeholder comms.**

PM cares about conversion. Frame each fix in PM units: "deferring chat widget recovers ~0.6s TTI which historically corresponds to ~3% checkout conversion." Track a single graph with conversion overlaid on TTI; commit to weekly check-ins until back to baseline.

**Lessons (postmortem material).**

- The team didn't have bundle-size CI guards; 4 weeks of small additions silently summed.
- Synthetic Lighthouse in PR was insufficient; RUM is the source of truth.
- One owner per third-party script (don't let "marketing" install scripts via GTM without engineering review).

**rubric:** 25-pt: RUM-first quantification (3) + bisect via releases (3) + correctly identifies common regression patterns (5) + prioritizes mitigations by impact-per-day (4) + concrete bundle-size CI gate prevention (3) + Lighthouse CI gate (2) + RUM with release annotations (2) + PM comms in conversion units (3).

**watermark_seed:** qorium-react-v0.6-079-seed-2c9a8b4e
**variant_seed:** qorium-react-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

### QUESTION 80: Casestudy — Migrating a CRA App to Next.js 15 with App Router (Very Hard - Casestudy)

**question_id:** QOR-REACT-080
**skill_id:** senior-react-080
**sub_skill_id:** cra-to-nextjs-migration
**format:** casestudy
**difficulty_b:** 1.7
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Next.js docs; "Move from CRA to Next" official guide

**body:**

A 5-year-old CRA (Create React App) admin dashboard (~120k LOC, 80 screens, React Router v5, Redux + sagas) needs migration. CRA is unmaintained; the team wants Next.js 15 + App Router for better DX and performance. Plan the migration: timeline, sequencing, risk, and how you'd avoid a feature freeze. (Limit: 1000 words.)

**answer_key:**

**Recommendation: Adapter pattern + parallel routes; 4-month phased migration; do NOT freeze features.**

**Phase 0 (Week 1-2) — Set up the parallel target.**

- Bootstrap a new Next.js 15 (App Router) project alongside the CRA app.
- Identify the shared layer: design system, hooks, API client, types. Move these to a `packages/ui-kit`, `packages/api-client`, etc., consumed by BOTH apps. Use pnpm workspaces or a turborepo. This is the most leveraged single move — both apps now share the source of truth.
- Set up a reverse proxy (NGINX or Vercel rewrites) so a small slice of traffic (e.g., `/admin/v2/*`) is served by Next; everything else stays on CRA. Production traffic mostly unaffected.

**Phase 1 (Week 3-6) — Migrate leaves first.**

- Identify 5-10 simple, low-risk screens (read-only views, settings pages). Port to Next.js App Router. Each port:
  - Replace `<Route>` with file-based routing (`app/admin/v2/users/page.tsx`).
  - For server-only data (admin logs, etc.) use Server Components with direct DB / API access.
  - Keep Redux logic working via a Client Component boundary (`"use client"` in Redux Provider wrapper).
  - Reuse design-system components from the shared package.
- Each migrated screen rolls out behind a feature flag; a canary fraction of admins lands on `/admin/v2/<screen>`. RUM compares perf; if regression, flip back instantly.

**Phase 2 (Week 7-10) — Migrate Redux/saga-heavy screens.**

- This is the hardest part. Two strategies coexist:
  - For screens that benefit from server-state colocation, replace Redux + sagas with TanStack Query for server data and Zustand/Context for true UI state. Rewrite the screen.
  - For screens where a rewrite is too risky, port AS-IS into a Next.js Client Component; Redux + sagas continue to work. Migrate in a future cycle.
- The pragma: don't let "perfect" rewrite bottleneck migration. Per-screen judgment.

**Phase 3 (Week 11-14) — Complete + retire CRA.**

- Migrate remaining screens (often the long-tail ones with esoteric edge cases). Maintain the proxy until Next.js serves >90% routes.
- Cut over: change DNS / proxy default to Next.js. CRA app retired.
- Decommission: delete CRA build pipeline, repo dirs.

**Why no feature freeze.**

- Shared packages mean a feature touching `ui-kit` benefits both apps.
- New screens written in Next.js from day 1.
- Routes split by URL prefix means the team can ship feature work to either app without conflict.

**Risk surfaces.**

- **Auth.** Cookie-based session must be readable by both apps; ensure session middleware is in the shared package. Most common bug class.
- **CSP / CORS.** Next.js ships its own headers; mirror CRA's CSP carefully.
- **State after navigation.** Redux is per-app; navigating between CRA and Next loses Redux state. Mitigate with sticky URLs and minimal cross-app navigation.
- **CSS strategy.** CRA likely uses CSS Modules or styled-components; pick one for Next and document. If switching, do it via the shared package, not big-bang.
- **SEO.** Admin dashboards usually don't need it, but if any pages are public, watch noindex/robots.

**Specific Next.js 15 features to lean on.**

- `app/` directory + nested layouts (kills shared chrome boilerplate).
- Server Components for admin data fetching (eliminates a chunk of API routes).
- `<Link>` prefetching for sub-100ms route transitions.
- Server Actions for form submits (replaces a portion of admin API endpoints).
- Streaming with Suspense for slow data.

**Metrics to track per migration step.**

- TTI / LCP per migrated route vs CRA baseline (RUM).
- Bundle size delta.
- Bug rate per migrated screen in week 1 post-launch.
- Engineering velocity (PRs merged per week) — should NOT drop during migration.

**Rollback plan.**

Per route: a single env-var toggle reverts to CRA serving that path. Test the rollback in staging before each canary.

**Final state.**

100% Next.js 15. 6-month follow-up: revisit screens that were "ported as-is" and modernize Redux→TanStack Query opportunistically in regular feature work, not a separate project.

**rubric:** 25-pt: shared-packages-first (3) + parallel deployment + URL-prefix routing (4) + canary per screen via feature flag (3) + leaves-first sequencing (3) + Redux pragmatism (rewrite where useful, port-as-is where risky) (3) + 12-week timeline that doesn't freeze features (3) + auth/CSS/SEO risks called out (3) + RUM-tracked perf gates per cutover (3).

**watermark_seed:** qorium-react-v0.6-080-seed-5e8b3a7c
**variant_seed:** qorium-react-v0.6-2026-05-07-080
**bias_check_notes:** No bias.

---

## End of Senior React QOR-REACT-061..080 Extension (Wave-1, v0.6)

**Distribution:** 12 MCQ + 4 code + 2 design + 2 casestudy.
**Difficulty mix:** 3 Easy + 9 Medium + 6 Hard + 2 Very Hard.
**Status:** AI-drafted. Awaiting SME Lead validation per Constitution v0.6.
