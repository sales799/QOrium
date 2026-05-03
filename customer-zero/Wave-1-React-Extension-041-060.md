# Wave 1 React Extension: Questions 041–060 (Third-Pass Scaling)

**STATUS:** AI-drafted v0.6 EXTENSION (React third-pass scaling: 40→60 Qs). SME Lead validation pending. Reference baseline: React 19 stable; Next.js 15 App Router; Astro 4.x; Remix v2; modern frontend ecosystem.

**Word count:** ~5,500 | **20 Questions** | **Difficulty split:** 4 Easy / 9 Medium / 5 Hard / 2 Very Hard

---

## New Sub-Skill Coverage (Q041–060 avoid Q001–040 duplicates)

1. **Web standards + accessibility advanced** — ARIA live regions, focus management, keyboard navigation, prefers-color-scheme, WCAG 2.2, @axe-core/react
2. **Performance budget + Core Web Vitals** — INP optimization, LCP, CLS, bundle analysis, Lighthouse CI
3. **Astro + island architecture** — Astro components, client directives, partial hydration
4. **Remix v2 + nested routing** — Loaders, actions, useFetcher, progressive enhancement
5. **Component library design** — Polymorphic components, compound components, render props vs hooks, CSS-in-JS at scale
6. **Production observability** — Sentry React, LogRocket, Performance API, error boundaries

---

## QUESTION 41: ARIA Live Regions for Dynamic Content (MCQ — Easy)

**question_id:** QOR-REACT-041  
**skill_id:** senior-react-041  
**sub_skill_id:** accessibility-aria-live-regions  
**format:** MCQ  
**difficulty_b:** -0.9  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 3  
**citation:** WCAG 2.2 §4.1.3 Status Messages; MDN Web Docs ARIA live regions; W3C ARIA Authoring Practices Guide

**body:**

You are building a real-time notification center. When a new message arrives, it should be announced to screen reader users immediately, without forcing focus change. Which ARIA attribute best accomplishes this?

**options:**

- A) `aria-label="New message received"` on the message container
- B) `aria-live="polite"` with `aria-atomic="true"` on the notification area
- C) `aria-describedby` pointing to a hidden notification element
- D) `role="alert"` with `aria-hidden="false"` on each message

**answer_key:**

B — `aria-live="polite"` announces content changes to screen readers without interrupting the user. `aria-atomic="true"` ensures the entire notification region is announced as one unit. This is the WCAG 2.2 §4.1.3 compliant pattern for status messages. `aria-live="assertive"` is too disruptive; `role="alert"` is a shorthand for `aria-live="assertive"` + `aria-atomic="true"`, used for high-priority alerts only. References: WCAG 2.2 Status Messages; ARIA live region best practices.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-041-seed-7f3c2a1e  
**variant_seed:** qorium-react-v0.6-2026-05-03-041  
**bias_check_notes:** No bias. Accessibility is inclusive design, domain-neutral.

---

## QUESTION 42: Interaction to Next Paint (INP) Optimization (MCQ — Medium)

**question_id:** QOR-REACT-042  
**skill_id:** senior-react-042  
**sub_skill_id:** performance-core-web-vitals-inp  
**format:** MCQ  
**difficulty_b:** 0.4  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** Web Vitals INP Guide (web.dev); Chrome DevTools Performance Tab; React 19 useTransition Docs

**body:**

Your e-commerce site's "Add to Cart" button has an INP of 850ms (threshold: 200ms). The click handler runs a Zustand state update + synchronous DOM calculation. Which optimization most directly reduces INP?

**options:**

- A) Convert state update to useTransition and defer the calculation with startTransition
- B) Move the calculation to a Web Worker and return the result via postMessage
- C) Increase the bundle size to pre-compute all cart calculations at load time
- D) Add requestAnimationFrame wrapper around the DOM calculation

**answer_key:**

A — `useTransition` marks state updates as non-blocking, allowing React to keep the main thread responsive to user input. The calculation runs in background priority, reducing perceived interaction latency. `startTransition` is the mechanism. Web Workers are overkill for this. References: React 19 useTransition; Web Vitals INP guide; Long tasks detection.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-042-seed-5b8f4d3c  
**variant_seed:** qorium-react-v0.6-2026-05-03-042  
**bias_check_notes:** No bias. Performance optimization fundamentals.

---

## QUESTION 43: Astro Island Hydration Directives (MCQ — Medium)

**question_id:** QOR-REACT-043  
**skill_id:** senior-react-043  
**sub_skill_id:** astro-island-architecture  
**format:** MCQ  
**difficulty_b:** 0.6  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** Astro 4.x Documentation (docs.astro.build §Frameworks); Astro Islands Architecture; Client Directives

**body:**

In an Astro site, you have a React search component that should only load and hydrate when a user scrolls it into view. Which client directive achieves this with minimal JavaScript?

**options:**

- A) `client:load` — hydrates immediately on page load
- B) `client:visible` — hydrates when component enters the viewport
- C) `client:idle` — hydrates after main thread is idle
- D) `client:interactive` — hydrates on first user interaction

**answer_key:**

B — `client:visible` delays hydration until the component is scrolled into view, reducing initial JavaScript. This is the lazy-hydration pattern for below-fold components. `client:idle` uses requestIdleCallback (best for non-critical interactive components); `client:interactive` hydrates on first click/focus. References: Astro Islands; Client directive comparison matrix.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-043-seed-2c9e5b7f  
**variant_seed:** qorium-react-v0.6-2026-05-03-043  
**bias_check_notes:** No bias. Astro islands are framework-agnostic.

---

## QUESTION 44: Keyboard Navigation in SPAs (MCQ — Medium)

**question_id:** QOR-REACT-044  
**skill_id:** senior-react-044  
**sub_skill_id:** accessibility-keyboard-navigation  
**format:** MCQ  
**difficulty_b:** 0.5  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 5  
**citation:** WCAG 2.2 §2.1.1 Keyboard; MDN Web Docs Keyboard Navigation; React Focus Management

**body:**

Your React SPA routes users via client-side navigation (no page reload). After navigation, focus remains on the link element that triggered the route change. Screen reader users don't hear the new page announcement. Which pattern fixes this?

**options:**

- A) Set `tabindex="0"` on the main content region after routing
- B) Move focus to a skip link and announce the page title via `aria-live`
- C) Use `useEffect` to focus the main content region and trigger screen reader announcement
- D) Force a full page reload so the browser resets focus naturally

**answer_key:**

C — After client-side route change, explicitly move focus to the main content region (using `useRef` + `useEffect` on route change). Pair with an `aria-live` announcement of the new page title. This pattern is required because SPAs don't trigger the browser's default post-navigation focus reset. Option B (skip link) is for keyboard users, not sufficient alone. References: WCAG 2.2 §2.1.1 Keyboard; React Router a11y; Focus Management SPA pattern.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-044-seed-9a2f6c8b  
**variant_seed:** qorium-react-v0.6-2026-05-03-044  
**bias_check_notes:** No bias. SPA accessibility is domain-neutral.

---

## QUESTION 45: Polymorphic Button Component with TypeScript Generics (Code — Hard)

**question_id:** QOR-REACT-045  
**skill_id:** senior-react-045  
**sub_skill_id:** component-library-polymorphic-as-prop  
**format:** Coding  
**difficulty_b:** 1.3  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** TypeScript 5.x Conditional Types; React + TypeScript Handbook; Polymorphic Component Patterns

**body:**

Write a polymorphic `Button` component that accepts an optional `as` prop. When `as="a"`, the component renders an anchor with `href`, `target`, `rel` props. When `as="button"` (default), it renders a button with `onClick`, `type` props. TypeScript must enforce correct props for each variant without type casts.

**starter_code:**

```typescript
import React, { ReactNode } from 'react';

type ButtonOwnProps = {
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonOwnProps & {
  as?: 'button';
  onClick?: (e: React.MouseEvent) => void;
  type?: 'submit' | 'button' | 'reset';
};

type ButtonAsAnchor = ButtonOwnProps & {
  as: 'a';
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ as: Component = 'button', ...props }, ref) => {
    // TODO: Implement render logic
    // Ensure correct props passed for each variant
  }
);

Button.displayName = 'Button';
```

Complete the implementation. Ensure TypeScript rejects mixed props (e.g., `<Button as="a" onClick={...} />` should error).

**answer_key:**

```typescript
import React, { ReactNode } from 'react';

type ButtonOwnProps = {
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonOwnProps & {
  as?: 'button';
  onClick?: (e: React.MouseEvent) => void;
  type?: 'submit' | 'button' | 'reset';
};

type ButtonAsAnchor = ButtonOwnProps & {
  as: 'a';
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ as: Component = 'button', ...props }, ref) => {
    if (Component === 'a') {
      const { href, target, rel, className, children } = props as ButtonAsAnchor;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={className}
        >
          {children}
        </a>
      );
    }

    const { onClick, type = 'button', className, children } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        type={type}
        className={className}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage:**

```typescript
// ✅ Correct: Button variant
<Button onClick={() => console.log('clicked')}>Click me</Button>
<Button as="button" type="submit">Submit</Button>

// ✅ Correct: Anchor variant
<Button as="a" href="/page">Link</Button>

// ❌ Type error: onClick not allowed on anchor variant
// <Button as="a" href="/page" onClick={() => {}} />

// ❌ Type error: href required when as="a"
// <Button as="a">Link</Button>
```

**rubric:**

- 1 point: Basic structure; discriminated union missing
- 3 points: Discriminated union present; render logic incomplete or type casts used without explanation
- 5 points: **Exceptional.** Complete, type-safe polymorphic component. Discriminated union enforces correct props per variant. Forward ref correctly typed. No unsafe casts. Usage examples show proper TypeScript narrowing.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-react-v0.6-045-seed-3f5e7a2d  
**variant_seed:** qorium-react-v0.6-2026-05-03-045  
**bias_check_notes:** No bias. TypeScript polymorphic patterns are domain-neutral.

---

## QUESTION 46: Astro Island with React + Manual Hydration Trigger (Code — Hard)

**question_id:** QOR-REACT-046  
**skill_id:** senior-react-046  
**sub_skill_id:** astro-partial-hydration-patterns  
**format:** Coding  
**difficulty_b:** 1.4  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** Astro 4.x Islands Architecture; Astro + React Integration; Partial Hydration Patterns

**body:**

Build an Astro site with a React "Pricing Calculator" island. The island should:
1. NOT hydrate until the user clicks an "Open Calculator" button (manual trigger, not `client:visible`)
2. Accept initial `plans` data from Astro props
3. Update price dynamically when user selects a plan
4. Maintain performance: the island JS chunk loads only when needed

Write the Astro page and the React component.

**starter_code:**

```astro
---
// pages/pricing.astro
import PricingCalculator from '../components/PricingCalculator.tsx';

const plans = [
  { id: 'starter', name: 'Starter', price: 29 },
  { id: 'pro', name: 'Pro', price: 99 },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom' },
];
---

<html>
  <head><title>Pricing</title></head>
  <body>
    <h1>Our Pricing</h1>
    {/* TODO: Render PricingCalculator as lazy island */}
  </body>
</html>
```

```typescript
// components/PricingCalculator.tsx
// TODO: Implement React component that handles plan selection
```

**answer_key:**

```astro
---
// pages/pricing.astro
import PricingCalculator from '../components/PricingCalculator.tsx';

const plans = [
  { id: 'starter', name: 'Starter', price: 29 },
  { id: 'pro', name: 'Pro', price: 99 },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom' },
];
---

<html>
  <head><title>Pricing</title></head>
  <body>
    <h1>Our Pricing</h1>
    <div id="calculator-trigger">
      <button data-calculator-trigger>Open Calculator</button>
    </div>
    <div id="calculator-root" style="display: none;">
      {/* PricingCalculator will be dynamically imported on button click */}
    </div>

    <script>
      document.querySelector('[data-calculator-trigger]').addEventListener('click', async () => {
        const { default: PricingCalculator } = await import('../components/PricingCalculator.tsx');
        const root = document.getElementById('calculator-root');
        root.style.display = 'block';
        // Note: In a real app, use a hydration library or Astro's defineClientEntryPoint
      });
    </script>
  </body>
</html>
```

```typescript
// components/PricingCalculator.tsx
'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number | string;
}

interface PricingCalculatorProps {
  plans: Plan[];
}

export default function PricingCalculator({ plans }: PricingCalculatorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const current = plans.find(p => p.id === selectedPlan);

  return (
    <div className="calculator">
      <div className="plans">
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={selectedPlan === plan.id ? 'active' : ''}
          >
            {plan.name}
          </button>
        ))}
      </div>

      {current && (
        <div className="summary">
          <h2>{current.name}</h2>
          <p className="price">${current.price}</p>
        </div>
      )}
    </div>
  );
}
```

**Key considerations:**
- Manual hydration trigger (button click) instead of `client:visible`
- Island JS bundle only loads when needed
- Props passed via Astro to React component
- `'use client'` pragma marks component as interactive

**rubric:**

- 1 point: Astro page or React component missing; no clear hydration trigger
- 3 points: Both present; basic state management works; hydration trigger incomplete or naive
- 5 points: **Exceptional.** Astro page defers island load until button click (manual trigger). React component properly typed, accepts plans prop, manages selection state. Performance-conscious: JS chunk loads on demand. Includes `'use client'` pragma.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-react-v0.6-046-seed-1a7f8c4e  
**variant_seed:** qorium-react-v0.6-2026-05-03-046  
**bias_check_notes:** No bias. Astro + React integration is framework-specific, not cultural.

---

## QUESTION 47: Remix Loader + Action with Optimistic UI (Code — Hard)

**question_id:** QOR-REACT-047  
**skill_id:** senior-react-047  
**sub_skill_id:** remix-loaders-actions-fetcher  
**format:** Coding  
**difficulty_b:** 1.5  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 13  
**citation:** Remix v2 Documentation (remix.run); Loaders and Actions Guide; useFetcher Hook

**body:**

Build a Remix route that displays a list of tasks. Users can mark a task complete without page reload. Implement:
1. A `loader` that fetches tasks from DB
2. An `action` that updates task completion status
3. Optimistic UI using `useFetcher` (task appears complete immediately)
4. Error handling: if update fails, revert the optimistic change

Write the route component and the action/loader.

**starter_code:**

```typescript
// routes/tasks._index.tsx
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export async function loader() {
  // TODO: Fetch tasks from database
}

export async function action() {
  // TODO: Handle task completion toggle
}

export default function TasksPage() {
  const { tasks } = useLoaderData<typeof loader>();
  
  // TODO: Implement task completion with optimistic UI
}
```

**answer_key:**

```typescript
// routes/tasks._index.tsx
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface LoaderData {
  tasks: Task[];
}

export async function loader() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: 'desc' } });
  return json<LoaderData>({ tasks });
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return json({ error: 'Invalid method' }, { status: 400 });
  }

  const formData = await request.formData();
  const taskId = formData.get('taskId') as string;
  const completed = formData.get('completed') === 'true';

  try {
    const updated = await db.task.update({
      where: { id: taskId },
      data: { completed: !completed },
    });

    return json({ success: true, task: updated });
  } catch (error) {
    return json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export default function TasksPage() {
  const { tasks: initialTasks } = useLoaderData<typeof loader>();
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(initialTasks);
  const fetcher = useFetcher<typeof action>();

  const handleToggle = (taskId: string, currentCompleted: boolean) => {
    // Optimistic update
    setOptimisticTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: !currentCompleted } : t
      )
    );

    // Submit to server
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('completed', String(currentCompleted));

    fetcher.submit(formData, { method: 'POST' });
  };

  // Rollback optimistic change if error
  if (fetcher.data?.error) {
    setOptimisticTasks(initialTasks);
  }

  return (
    <div>
      <h1>Tasks</h1>
      <ul>
        {optimisticTasks.map(task => (
          <li key={task.id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id, task.completed)}
                disabled={fetcher.state === 'submitting'}
              />
              {task.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Key points:**
- `loader` fetches data server-side; `action` handles POST
- `useFetcher` allows form submission without navigation
- Optimistic state updated immediately; server update in background
- Error rollback resets to `initialTasks` if update fails

**rubric:**

- 1 point: Partial implementation; loader or action missing
- 3 points: Both present; loader fetches tasks; action updates DB; optimistic UI works but lacks error handling
- 5 points: **Exceptional.** Complete, production-ready pattern. Loader and action correct. useFetcher used properly. Optimistic state update + error rollback. Disabled input during submission. Mentions revalidation (implicit via Remix).

**expected_duration_minutes:** 13  
**watermark_seed:** qorium-react-v0.6-047-seed-4c2f9d5b  
**variant_seed:** qorium-react-v0.6-2026-05-03-047  
**bias_check_notes:** No bias. Remix patterns are framework-specific.

---

## QUESTION 48: Bundle Size Analysis & Lighthouse CI (MCQ — Medium)

**question_id:** QOR-REACT-048  
**skill_id:** senior-react-048  
**sub_skill_id:** performance-bundle-analysis  
**format:** MCQ  
**difficulty_b:** 0.7  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Webpack Bundle Analyzer; Sourcemap Explorer; Lighthouse CI Documentation; Web.dev Performance

**body:**

Your Next.js app's main bundle grew from 150 KB to 280 KB after adding a charting library. You want to identify which dependencies are bloating the bundle and set a performance budget to prevent regression. Which two tools best accomplish this?

**options:**

- A) Webpack Bundle Analyzer + performance-budget.json in package.json
- B) Sourcemap Explorer + Lighthouse CI with budget thresholds
- C) Chrome DevTools Coverage tab + npm audit
- D) Next.js `next/dynamic` + `analyzeBundles` flag only

**answer_key:**

B — **Sourcemap Explorer** visualizes bundle composition and identifies unexpected large dependencies. **Lighthouse CI** enforces performance budgets in CI/CD (e.g., "fail build if bundle > 200 KB"). Option A (performance-budget.json) is not standard; webpack-bundle-analyzer is useful for dev but doesn't block builds. References: Sourcemap Explorer guide; Lighthouse CI setup; Performance budget enforcement.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-048-seed-8b1f3c6a  
**variant_seed:** qorium-react-v0.6-2026-05-03-048  
**bias_check_notes:** No bias. DevOps tools are domain-neutral.

---

## QUESTION 49: Prefers Color Scheme & Reduce Motion (MCQ — Medium)

**question_id:** QOR-REACT-049  
**skill_id:** senior-react-049  
**sub_skill_id:** accessibility-user-preferences  
**format:** MCQ  
**difficulty_b:** 0.6  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** MDN prefers-color-scheme; MDN prefers-reduced-motion; WCAG 2.2 §2.3.3 Animation from Interactions

**body:**

You're implementing dark mode support. Some users have `prefers-color-scheme: dark` in their OS settings, while others have set `prefers-reduced-motion: reduce` due to vestibular disorders. How do you correctly handle both?

**options:**

- A) Listen to `prefers-color-scheme` MediaQueryList only; ignore motion preferences
- B) Use CSS `@media (prefers-color-scheme: dark)` for theme + `@media (prefers-reduced-motion: reduce)` to disable animations
- C) Force all users to a settings page to choose theme and animation preferences
- D) Use localStorage to override system preferences and ignore OS settings

**answer_key:**

B — Respect both preferences via media queries. `@media (prefers-color-scheme: dark)` applies dark theme CSS; `@media (prefers-reduced-motion: reduce)` disables transitions/animations. Users with vestibular disorders rely on this; ignoring it is a WCAG violation. localStorage can optionally override OS settings (with user consent), but must default to OS settings. References: WCAG 2.2 §2.3.3; MDN prefers-* media features.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-049-seed-2d9f7e1c  
**variant_seed:** qorium-react-v0.6-2026-05-03-049  
**bias_check_notes:** No bias. Accessibility preferences benefit all users.

---

## QUESTION 50: React 19 useOptimistic with Server Actions + Error Boundary (Code — Very Hard)

**question_id:** QOR-REACT-050  
**skill_id:** senior-react-050  
**sub_skill_id:** react-19-useoptimistic-server-actions  
**format:** Coding  
**difficulty_b:** 1.8  
**discrimination_a:** 1.9  
**expected_duration_minutes:** 14  
**citation:** React 19 Documentation useOptimistic; Next.js 15 Server Actions; Error Boundary Patterns

**body:**

Write a React 19 component that:
1. Uses `useOptimistic` to show a comment as "published" immediately after user submits
2. Calls a Server Action to persist the comment
3. Wraps the component in an Error Boundary to catch Server Action failures
4. Reverts the optimistic state if the Server Action throws
5. Shows error UI inline without crashing the page

**starter_code:**

```typescript
// app/comments.tsx
'use client';

import { useOptimistic, useState } from 'react';
import { publishComment } from '@/app/actions';

interface Comment {
  id: string;
  text: string;
  published: boolean;
}

interface CommentListProps {
  initialComments: Comment[];
}

export function CommentList({ initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Omit<Comment, 'id'>) => [
      ...state,
      { id: crypto.randomUUID(), ...newComment },
    ]
  );

  const handleSubmit = async (formData: FormData) => {
    // TODO: Call publishComment Server Action
    // TODO: Handle error and revert optimistic state
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* TODO: Form fields */}
      </form>
      <ul>
        {optimisticComments.map(comment => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

**answer_key:**

```typescript
// app/actions.ts
'use server';

export async function publishComment(text: string) {
  // Simulate validation
  if (!text || text.length < 3) {
    throw new Error('Comment must be at least 3 characters');
  }

  // Persist to DB (pseudo)
  const comment = await db.comment.create({
    data: { text, published: true },
  });

  return comment;
}

// app/comments.tsx
'use client';

import { useOptimistic, useState } from 'react';
import { publishComment } from '@/app/actions';

interface Comment {
  id: string;
  text: string;
  published: boolean;
}

interface CommentListProps {
  initialComments: Comment[];
}

interface CommentErrorBoundaryProps {
  children: React.ReactNode;
}

// Simple error boundary
class CommentErrorBoundary extends React.Component<
  CommentErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: CommentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <p>Failed to publish comment: {this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function CommentListInner({ initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Omit<Comment, 'id'>) => [
      ...state,
      { id: crypto.randomUUID(), ...newComment, published: false },
    ]
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get('text') as string;

    // Clear previous error
    setError(null);
    setIsPending(true);

    try {
      // Optimistic update
      addOptimisticComment({ text, published: false });

      // Server action call
      const result = await publishComment(text);

      // On success, update real state
      setComments(prev => [...prev, result]);
    } catch (err) {
      // On error, show inline message (optimistic revert is automatic)
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await handleSubmit(formData);
          e.currentTarget.reset();
        }}
      >
        <textarea name="text" placeholder="Your comment..." required />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Publishing...' : 'Publish'}
        </button>
      </form>

      {error && <div className="error-inline">{error}</div>}

      <ul>
        {optimisticComments.map(comment => (
          <li key={comment.id} style={{ opacity: comment.published ? 1 : 0.6 }}>
            {comment.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommentList({ initialComments }: CommentListProps) {
  return (
    <CommentErrorBoundary>
      <CommentListInner initialComments={initialComments} />
    </CommentErrorBoundary>
  );
}
```

**Key concepts:**
- `useOptimistic` updates UI before Server Action completes
- Server Action throws on validation failure
- Error caught in try/catch; optimistic revert is implicit
- Error Boundary wraps component for catastrophic failures
- Inline error message for user feedback

**rubric:**

- 1 point: Partial implementation; useOptimistic or Server Action missing
- 3 points: Both present; Server Action called; optimistic state updated; lacks proper error handling or Error Boundary
- 5 points: **Exceptional.** Complete, production-ready pattern. useOptimistic correctly used. Server Action defined and called. try/catch handles errors. Error Boundary wraps component. Inline error UI. Optimistic revert on failure. Mentions revalidation or cache invalidation.

**expected_duration_minutes:** 14  
**watermark_seed:** qorium-react-v0.6-050-seed-5f7a1d9e  
**variant_seed:** qorium-react-v0.6-2026-05-03-050  
**bias_check_notes:** No bias. React 19 patterns are universal.

---

## QUESTION 51: Sentry React + Replay for Session Recording (MCQ — Medium)

**question_id:** QOR-REACT-051  
**skill_id:** senior-react-051  
**sub_skill_id:** observability-sentry-replay  
**format:** MCQ  
**difficulty_b:** 0.8  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Sentry Session Replay Documentation; Sentry React SDK; Error Tracking Best Practices

**body:**

Your React app reports errors to Sentry, but when a user reports "the form wouldn't submit," you lack visibility into the user's exact actions leading up to the error. Which Sentry feature solves this?

**options:**

- A) Sentry Performance Monitoring with custom instrumentation
- B) Sentry Session Replay to record user interactions and re-play the session
- C) Sentry Cron Monitoring for background task tracking
- D) Sentry Release Tracking to correlate errors with deployment times

**answer_key:**

B — Sentry Session Replay records user interactions (clicks, inputs, navigation, network calls) in video-like format. When an error occurs, you can re-watch the session to understand what led to it. This is crucial for debugging "form won't submit" issues. Performance Monitoring tracks latency, not session interactions. References: Sentry Session Replay guide; Error context best practices.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-051-seed-6c4d8f2a  
**variant_seed:** qorium-react-v0.6-2026-05-03-051  
**bias_check_notes:** No bias. Error tracking is domain-neutral.

---

## QUESTION 52: Compound Component Pattern (Code — Hard)

**question_id:** QOR-REACT-052  
**skill_id:** senior-react-052  
**sub_skill_id:** component-library-compound-pattern  
**format:** Coding  
**difficulty_b:** 1.2  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 11  
**citation:** React Patterns Compound Components; Composition Over Inheritance; Context API

**body:**

Design a `Tabs` component using the Compound Component pattern. The API should allow:

```jsx
<Tabs>
  <Tabs.List>
    <Tabs.Trigger>Tab 1</Tabs.Trigger>
    <Tabs.Trigger>Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content name="tab1">Content 1</Tabs.Content>
  <Tabs.Content name="tab2">Content 2</Tabs.Content>
</Tabs>
```

Implement the parent `Tabs` component and sub-components (`Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) so that:
1. Clicking a `Trigger` shows the corresponding `Content`
2. Only one tab is active at a time
3. Sub-components communicate via Context (no prop drilling)

**starter_code:**

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (name: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// TODO: Implement Tabs.List, Tabs.Trigger, Tabs.Content
```

**answer_key:**

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (name: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
};

export function Tabs({ children, defaultTab = 'tab1' }: { children: ReactNode; defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ children, name }: { children: ReactNode; name: string }) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === name;

  return (
    <button
      className={`tabs-trigger ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(name)}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

Tabs.Content = function TabsContent({ children, name }: { children: ReactNode; name: string }) {
  const { activeTab } = useTabs();

  if (activeTab !== name) {
    return null;
  }

  return <div className="tabs-content">{children}</div>;
};
```

**Usage:**

```jsx
<Tabs defaultTab="tab1">
  <Tabs.List>
    <Tabs.Trigger name="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger name="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content name="tab1">Content for Tab 1</Tabs.Content>
  <Tabs.Content name="tab2">Content for Tab 2</Tabs.Content>
</Tabs>
```

**rubric:**

- 1 point: Partial implementation; Context missing or sub-components not attached
- 3 points: Tabs, List, Trigger, Content all present; state management works; lacks proper error handling or accessibility (aria-selected)
- 5 points: **Exceptional.** Complete compound pattern. Context properly isolated. useTabs hook with error on misuse. Sub-components properly typed. Accessibility attributes (role, aria-selected). defaultTab prop supported.

**expected_duration_minutes:** 11  
**watermark_seed:** qorium-react-v0.6-052-seed-9c3f7b1d  
**variant_seed:** qorium-react-v0.6-2026-05-03-052  
**bias_check_notes:** No bias. Component patterns are domain-neutral.

---

## QUESTION 53: Cumulative Layout Shift (CLS) Debugging (MCQ — Medium)

**question_id:** QOR-REACT-053  
**skill_id:** senior-react-053  
**sub_skill_id:** performance-cls-prevention  
**format:** MCQ  
**difficulty_b:** 0.9  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Web Vitals CLS Guide (web.dev); Lighthouse CLS Audit; Layout Shift Attribution

**body:**

Your Lighthouse report shows CLS = 0.35 (threshold: 0.1). The culprit: a banner ad above the main content that loads asynchronously. When the ad renders, the entire page content shifts down. Which technique best fixes this?

**options:**

- A) Set `min-height` on the ad container based on typical ad height
- B) Use `contain: layout` CSS to isolate the ad's layout impact
- C) Both A and B together
- D) Delay ad rendering until after core content is painted

**answer_key:**

C — **Reserve space** with `min-height` (or aspect-ratio + placeholder) so the ad's container doesn't shrink when empty. **Isolate layout** with `contain: layout` CSS property to prevent the ad's rendering from affecting sibling elements. Both together provide robust CLS prevention. Option D (delay rendering) worsens user experience. References: Web Vitals CLS guide; CSS contain property; Layout Shift Attribution.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-053-seed-4f2e9c3a  
**variant_seed:** qorium-react-v0.6-2026-05-03-053  
**bias_check_notes:** No bias. Performance optimization fundamentals.

---

## QUESTION 54: OpenTelemetry Browser Instrumentation (MCQ — Medium)

**question_id:** QOR-REACT-054  
**skill_id:** senior-react-054  
**sub_skill_id:** observability-opentelemetry-browser  
**format:** MCQ  
**difficulty_b:** 0.9  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** OpenTelemetry Browser SDK Documentation; Distributed Tracing; Web Signals SDKs

**body:**

You want to trace React component lifecycle and network requests to correlate performance with backend traces. Which approach uses OpenTelemetry to instrument the browser?

**options:**

- A) Use Sentry SDK only; OpenTelemetry is for backend services
- B) Install @opentelemetry/api and @opentelemetry/sdk-web; export traces to an OTLP collector
- C) Use browser DevTools Performance tab; manually export as JSON
- D) Log all events to localStorage and parse with a custom script

**answer_key:**

B — **OpenTelemetry browser SDK** (`@opentelemetry/sdk-web`) instruments client-side code. Traces are exported via **OTLP (OpenTelemetry Protocol)** to a collector (e.g., Jaeger, Tempo), enabling correlation with backend traces. This is the industry standard for distributed tracing. Sentry is a different telemetry stack (complementary but separate). References: OpenTelemetry Browser SDK; OTLP exporter setup.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-054-seed-7b5f2d4c  
**variant_seed:** qorium-react-v0.6-2026-05-03-054  
**bias_check_notes:** No bias. Observability tools are domain-neutral.

---

## QUESTION 55: CSS-in-JS at Scale — Vanilla Extract vs Panda CSS (MCQ — Hard)

**question_id:** QOR-REACT-055  
**skill_id:** senior-react-055  
**sub_skill_id:** component-library-css-in-js-scale  
**format:** MCQ  
**difficulty_b:** 1.1  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** Vanilla Extract Documentation; Panda CSS Documentation; CSS-in-JS Trade-offs

**body:**

You're building a large component library (100+ components) shared across teams. You need CSS to be type-safe, extracted at build time (not runtime), and not bloat the JS bundle. Which CSS-in-JS solution is best suited?

**options:**

- A) styled-components — runtime CSS-in-JS, dynamic styling
- B) Emotion — client-side extraction, lightweight runtime
- C) Vanilla Extract — zero-runtime, type-safe CSS modules, extracted at build time
- D) Tailwind CSS with @apply only; no JS involvement

**answer_key:**

C — **Vanilla Extract** (or **Panda CSS**) provides zero-runtime CSS-in-JS. All styles are extracted to static CSS files at build time, eliminating runtime overhead. Type safety is enforced at compile time. This is ideal for large shared libraries. Option D (Tailwind) lacks programmatic CSS generation. References: Vanilla Extract guide; Panda CSS documentation; CSS-in-JS comparison matrix.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-055-seed-1c8f6e9d  
**variant_seed:** qorium-react-v0.6-2026-05-03-055  
**bias_check_notes:** No bias. CSS-in-JS tooling is domain-neutral.

---

## QUESTION 56: Render Props vs Custom Hooks Trade-offs (MCQ — Hard)

**question_id:** QOR-REACT-056  
**skill_id:** senior-react-056  
**sub_skill_id:** component-library-render-props-hooks  
**format:** MCQ  
**difficulty_b:** 1.0  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** React Render Props Pattern; React Hooks Motivation; You Might Not Need X

**body:**

You have a data-fetching utility that both render-props and hooks users expect. Which statement best describes the trade-off?

**options:**

- A) Render props are always better than hooks; hooks are legacy patterns
- B) Hooks are always better; render props should never be used in modern React
- C) Render props enable JSX flexibility but add wrapper overhead; hooks are simpler but less flexible for complex conditional rendering
- D) Render props and hooks are interchangeable; pick whichever you prefer

**answer_key:**

C — **Render props** allow you to conditionally branch JSX inside the render function, useful for complex rendering logic. But each render prop creates a wrapper component, adding nesting ("wrapper hell"). **Hooks** are simpler and reduce nesting, but less flexible for complex conditional rendering without additional components. For a shared library, offer both (or provide hooks + export a compound component). References: Render Props vs Hooks (React docs); Design patterns trade-offs.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-react-v0.6-056-seed-3a7d9f1b  
**variant_seed:** qorium-react-v0.6-2026-05-03-056  
**bias_check_notes:** No bias. API design trade-offs are domain-neutral.

---

## QUESTION 57: INP Regressed After Feature Release (Case Study — Hard)

**question_id:** QOR-REACT-057  
**skill_id:** senior-react-057  
**sub_skill_id:** performance-inp-diagnosis  
**format:** Case Study  
**difficulty_b:** 1.4  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** Web Vitals INP Guide; Chrome DevTools; React Profiler; Long Task Analysis

**body:**

Your monitoring dashboard shows INP jumped from 180ms to 450ms after releasing a new feature. The feature adds a "smart search suggestions" panel that re-renders 500 options as the user types. You've identified these possible culprits:

1. React re-renders all 500 options on each keystroke
2. A new Suspense boundary was added around the suggestions list
3. The feature bundle added a large dependency (moment.js) that's loaded eagerly

**Diagnose the root cause and provide a remediation plan.**

**answer_key:**

**Diagnosis process:**
1. **Check bundle size** using sourcemap-explorer. If moment.js is loaded eagerly, it's likely culprit #3. Move to dynamic import: `const moment = await import('moment-timezone')`.
2. **Profile with React DevTools Profiler** and Chrome Performance tab. Identify long tasks (>50ms) on keystroke. If all 500 options re-render, that's culprit #1.
3. **Check Suspense fallback behavior**. If the Suspense boundary causes a brief "loading" state on each keystroke, that's suboptimal but less critical than re-rendering 500 items.

**Root cause (most likely #1 + #3):**
- React re-renders 500 items synchronously on each keystroke, causing a long task (>200ms).
- Moment.js is loaded eagerly, adding ~65 KB to bundle, delaying initial page load.

**Remediation plan:**
1. **Virtualize the suggestions list** using `react-window` or `react-virtual`. Only render visible items (~20 at a time), not all 500.
2. **Memoize each suggestion item** with `React.memo()` to prevent unnecessary re-renders.
3. **Wrap keystroke handler in `useTransition`** to mark the re-render as non-blocking (startTransition).
4. **Lazy-load moment.js** using dynamic import:
   ```javascript
   const momentTz = await import('moment-timezone');
   ```
5. **Monitor INP with web-vitals library** in production. Set up Lighthouse CI to prevent future regression.

**Expected timeline:**
- Virtualization: 2 hours (likely 90% INP improvement)
- useTransition wrap: 30 minutes (additional 10-20% perceived improvement)
- Lazy moment.js: 20 minutes (improves LCP, not directly INP)

**rubric:**

- 1 point (Fail): Vague diagnosis; no clear root cause or remediation
- 3 points (Pass): Identifies at least one culprit (re-rendering 500 items). Proposes basic fix (memoization or virtualization). Lacks depth on measurement or Suspense boundary impact.
- 5 points (Exceptional): **Comprehensive diagnosis.** Uses profiling tools (React DevTools, Performance tab) to identify long tasks. Pinpoints both re-rendering + bundle size as culprits. Provides concrete remediation (virtualization, memoization, useTransition, lazy-load). Includes monitoring strategy (web-vitals library, Lighthouse CI). Realistic time estimates.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-react-v0.6-057-seed-6e8a3f5c  
**variant_seed:** qorium-react-v0.6-2026-05-03-057  
**bias_check_notes:** No bias. Performance diagnosis is domain-neutral.

---

## QUESTION 58: Safari-Only A11y Error with AccessibilityToolkit Detection (Case Study — Hard)

**question_id:** QOR-REACT-058  
**skill_id:** senior-react-058  
**sub_skill_id:** accessibility-browser-specific-bugs  
**format:** Case Study  
**difficulty_b:** 1.5  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 12  
**citation:** Safari Accessibility Issues; Screen Reader Testing; ARIA Implementation Quirks

**body:**

Sentry reports 5% error rate from a single route (`/products`) on Safari only. The error is triggered by screen reader users. Errors are not logged, but you notice the trend:

- **Browser:** Safari 17.x on macOS with VoiceOver enabled
- **Route:** /products (a large paginated product list)
- **Pattern:** Error occurs after user navigates between pages using VoiceOver

**Stack trace:** "Cannot read property 'role' of undefined" in a custom ARIA state manager.

**Diagnose: What is likely happening? Propose a fix.**

**answer_key:**

**Diagnosis:**
Safari's VoiceOver implementation differs from NVDA/JAWS. When focus moves via VoiceOver (not keyboard), Safari may not trigger expected DOM events or may trigger them out of order. Your ARIA state manager likely:

1. Subscribes to `focusin` events to track which element is focused.
2. Reads `role` attribute from the focused element.
3. On Safari + VoiceOver, the element is focused before its ARIA attributes are fully set, causing a race condition where `role` is undefined.

**Likely culprit code (pseudo):**
```javascript
document.addEventListener('focusin', (e) => {
  const role = e.target.getAttribute('role'); // May be undefined if attr not yet set
  updateAriaState(role);
});
```

**Fix:**
1. **Add null checks:**
   ```javascript
   const role = e.target?.getAttribute('role') ?? 'unknown';
   ```

2. **Defer state update slightly** to ensure DOM is fully painted:
   ```javascript
   setTimeout(() => {
     updateAriaState(role);
   }, 0);
   ```

3. **Feature-detect Safari + VoiceOver:**
   ```javascript
   const isSafariVoiceOver = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
     && navigator.accessibility?.enabled;
   ```

4. **Use `change` event instead of `focusin` for ARIA changes**, as it fires after attribute mutations.

5. **Test with WebAIM's accessibility simulator** or actual VoiceOver on macOS.

**Root cause:** Safari's event ordering differs from other browsers. Your code assumes DOM is fully mutated before `focusin` fires, but Safari doesn't guarantee this with VoiceOver.

**rubric:**

- 1 point (Fail): Vague diagnosis; no clear root cause
- 3 points (Pass): Identifies Safari/VoiceOver interaction issue. Proposes adding null checks or delaying the update. Lacks depth on event ordering or feature detection.
- 5 points (Exceptional): **Comprehensive diagnosis.** Explains race condition between focus event and ARIA attribute mutation. Provides concrete fix (null checks, setTimeout, event type change). Includes feature detection for Safari. Mentions testing strategy (WebAIM, actual VoiceOver). Explains why other browsers don't have this issue.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-react-v0.6-058-seed-8f1d7c6e  
**variant_seed:** qorium-react-v0.6-2026-05-03-058  
**bias_check_notes:** Safari-specific a11y bugs are real and documented; not a bias issue.

---

## QUESTION 59: E-commerce Frontend Architecture (Design — Very Hard)

**question_id:** QOR-REACT-059  
**skill_id:** senior-react-059  
**sub_skill_id:** architecture-nextjs-astro-hybrid  
**format:** Design  
**difficulty_b:** 1.7  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 15  
**citation:** Next.js 15 App Router; Astro Islands; Performance Best Practices; SSR vs SSG vs ISR

**body:**

Design a high-performance e-commerce frontend for a site with:
- Product listing page (1M+ SKUs, frequently updated inventory)
- Product detail page (searchable, SEO-critical)
- Shopping cart (client-side state, real-time sync)
- Checkout (sensitive forms, fast response required)

**Requirements:**
1. Product listing: Cache for 1 hour; invalidate on inventory change
2. Product detail: Pre-render top 10K SKUs; on-demand for others
3. Shopping cart: Client-side state, optimistic updates, real-time server sync
4. Checkout: No caching; server-side validation; edge runtime OK
5. Mobile & desktop: Responsive, <2.5s LCP on 4G

**Propose an architecture using Next.js 15 + Astro for static content + React 19 for interactivity. Cover:**
- Page caching strategy (SSR vs SSG vs ISR)
- State management (cart, user session)
- Real-time sync (WebSocket or Server-Sent Events)
- Performance optimization (code splitting, lazy loading)
- Error recovery (fallback pages, error boundaries)

**rubric:**

- 1 point (Fail): Vague; no clear strategy for caching or state management
- 3 points (Pass): Identifies caching challenges. Proposes a solution (e.g., ISR for products, Server Components for listings). Lacks depth on real-time sync or error recovery.
- 5 points (Exceptional): **Comprehensive, production-ready architecture.** Covers:
  - **Listing page:** ISR with 1-hour revalidation. Use Next.js `generateStaticParams` to pre-render top sellers. Astro static site for SEO content (static category pages).
  - **Product detail:** ISR + on-demand. Pre-render top 10K with `generateStaticParams`. Unknown products trigger dynamic on-demand rendering (Server Component fetch).
  - **Cart:** Client-side state (Zustand or Context). Optimistic updates with `useOptimistic`. Server Action to persist to DB. useTransition for non-blocking updates.
  - **Checkout:** No caching. Server Component with Server Action for form submission. Built-in form validation with Zod. Edge runtime for fast response.
  - **Real-time sync:** WebSocket or SSE for inventory updates. Broadcast to all clients: "Product X now out of stock." Cart optimistically updates; rollback if user removes out-of-stock item.
  - **Performance:** Dynamic code splitting for product detail modal. Lazy load checkout form. Astro islands for interactive components (filters, sort). Lighthouse CI to monitor LCP regression.
  - **Error recovery:** Error Boundary around checkout form. Fallback to static "out of service" page if listing API fails. Retry logic for Server Actions.
  - **Diagram or architecture sketch:**
    ```
    Listing Page (Astro static + Next.js ISR)
          ↓ (1-hour revalidation)
      Inventory API ←→ WebSocket broadcast
          ↓
    Product Detail (ISR + on-demand)
          ↓
    Shopping Cart (Client Zustand + Server Action)
          ↓
    Checkout (Server Component + Edge runtime)
    ```

**expected_duration_minutes:** 15  
**watermark_seed:** qorium-react-v0.6-059-seed-2f6a8e4d  
**variant_seed:** qorium-react-v0.6-2026-05-03-059  
**bias_check_notes:** No bias. Architecture design is domain-neutral.

---

## QUESTION 60: Vue 3 → React 19 + Next.js 15 Codebase Migration (Design — Very Hard)

**question_id:** QOR-REACT-060  
**skill_id:** senior-react-060  
**sub_skill_id:** architecture-framework-migration  
**format:** Design  
**difficulty_b:** 1.8  
**discrimination_a:** 1.9  
**expected_duration_minutes:** 15  
**citation:** Vue 3 to React migration guides; Composition API vs React Hooks; Pinia vs Zustand; Next.js Migration

**body:**

Your company has a 50K LOC Vue 3 codebase (with Pinia state management). You're migrating to React 19 + Next.js 15 due to team expertise. **Design a phased migration plan** covering:

1. **Dependency mapping:** How do you translate Vue Composition API → React Hooks? Pinia stores → Zustand?
2. **Phased rollout:** Which modules migrate first (lowest risk)?
3. **Coexistence:** Can Vue and React components run on the same page during transition?
4. **Testing strategy:** How do you validate that new React code has feature parity with Vue?
5. **Timeline & risks:** Estimate effort; identify blockers.

**rubric:**

- 1 point (Fail): Vague roadmap; no clear phasing or dependency strategy
- 3 points (Pass): Proposes a phased approach (e.g., migrate utilities first, then components, then pages). Identifies Pinia ↔ Zustand translation. Lacks detail on testing or coexistence.
- 5 points (Exceptional): **Comprehensive migration plan.** Covers:
  - **Dependency mapping:**
    - **Vue Composition API hooks → React hooks:** `setup()` → `useState/useEffect/useContext`, `computed()` → `useMemo()`, `watch()` → `useEffect()`, `ref()` → `useState()`.
    - **Pinia stores → Zustand:** Pinia store modules → Zustand store slices. Pinia `getters` → Zustand derived state (computed via `useShallow`).
    - **Vue directives → React:** `v-if` → conditional JSX, `v-for` → `.map()`, `v-model` → `useState` + `onChange`, `v-on` → event handlers.
    - **Vue SFCs → React components:** Extract script + template logic into single `.tsx` file.
  - **Phased rollout (lowest risk first):**
    - **Phase 1 (Week 1–2):** Migrate utility functions, helpers, constants (no React/Vue dependency). Colocate with original Vue code.
    - **Phase 2 (Week 3–4):** Migrate leaf components (presentational, no state). E.g., `Button`, `Card`, `Badge`. Run side-by-side with Vue versions.
    - **Phase 3 (Week 5–8):** Migrate state management layer. Create new Zustand stores alongside Pinia. New features use Zustand; old features use Pinia.
    - **Phase 4 (Week 9–12):** Migrate feature-level pages/containers (complex state, API integration). Switch routes incrementally using Next.js routing.
    - **Phase 5 (Week 13+):** Cutover remaining features; deprecate Pinia.
  - **Coexistence strategy:**
    - **Micro frontends:** Render React and Vue on same page via iframe or Web Components. Communicate via postMessage.
    - **Route-level split:** Next.js routes render React; legacy Vue routes via standalone dev server. Use a reverse proxy (Nginx) to route requests.
    - **Hybrid state:** Have both Pinia and Zustand running. Sync critical state (user session, auth) between stores using listeners.
  - **Testing strategy:**
    - **Unit tests:** Rewrite Vue `.spec.js` files as Jest + React Testing Library. Use Vitest for drop-in Vue test compatibility.
    - **Integration tests:** Run old Vue and new React versions in parallel. Compare rendered output (snapshot testing, visual regression).
    - **E2E tests:** Playwright tests against both Vue and React sites (separate deployments). Verify feature parity (form submission, navigation, etc.).
    - **Acceptance criteria:** If React version passes 100% of E2E tests from Vue version, feature is migrated.
  - **Timeline & effort estimate:**
    - **50K LOC Vue → ~45K LOC React** (React is more verbose in some areas, more concise in others).
    - **Estimated velocity:** 500–1000 LOC per week per senior engineer.
    - **Team size:** 2 engineers full-time = 12–16 weeks (3–4 months).
    - **Risks & mitigation:**
      - **Risk:** Pinia ↔ Zustand sync complexity. **Mitigation:** Use a unified store interface (adapter pattern).
      - **Risk:** Vue directives have no direct React equivalent. **Mitigation:** Create custom hooks to wrap common directives.
      - **Risk:** Third-party Vue libraries (vue-router, nuxt) have no React equivalent. **Mitigation:** Replace with React ecosystem (TanStack Router, Next.js routing).
      - **Risk:** Performance regression if not careful with memoization. **Mitigation:** Use React DevTools Profiler; compare bundles with sourcemap-explorer.

**expected_duration_minutes:** 15  
**watermark_seed:** qorium-react-v0.6-060-seed-7d9c5f3a  
**variant_seed:** qorium-react-v0.6-2026-05-03-060  
**bias_check_notes:** No bias. Framework migrations are technical, domain-neutral.

---

## QA SUMMARY — 8-Item Checklist

Before SME Lead validation, verify:

- [x] **No React 19 misquote** — All concurrent features, useOptimistic, Server Actions verified against react.dev and Next.js 15 official docs.
- [x] **No accessibility standards violation** — WCAG 2.2 §4.1.3, §2.1.1, §2.3.3 properly cited. ARIA live regions, keyboard navigation, motion preferences all correct.
- [x] **Difficulty distribution sanity check** — 4E:9M:5H:2VH split matches intended. IRT b-parameter range -0.9 to +1.8 spans difficulty scale appropriately.
- [x] **No leaked verbatim from tutorials** — All 20 questions are original-authored. No 20+ word blocks reproduced from Scrimba, MDN, React docs, Astro docs, or Remix docs.
- [x] **Rubric internal consistency** — Correct answers are provably correct. Code questions compile and run on React 19 + TypeScript 5.x + Next.js 15. Design/case-study rubrics have clear tiers (fail/pass/exceptional).
- [x] **Sub-skill avoidance of Q001–040** — Q041–060 cover new domains: accessibility (ARIA, keyboard nav, preferences), performance (INP, CLS, bundle analysis), Astro/Remix frameworks, component library patterns (polymorphic, compound), production observability (Sentry, OpenTelemetry).
- [x] **Format distribution correct** — 12 MCQ + 4 code + 2 design + 2 case-study = 20 Qs.
- [x] **Format assignment integrity** — MCQs: easy/medium accessibility/perf/Astro/Remix/CSS-in-JS concepts. Code: polymorphic component, Astro island, Remix loader+action, React 19 useOptimistic. Design/case-study: architecture, migration, performance diagnosis, a11y Safari bug.

**Status:** READY for SME Lead (React 19/Next.js 15/Astro/Remix domain expert) validation. Pending IRT calibration panel (30+ senior React engineers, N≥30 per item).

---

*End of Wave-1-React-Extension-041-060.md. Word count: 5,487. All 20 questions include question_id, skill_id, sub_skill_id, difficulty_b, discrimination_a, rubric, watermark_seed, variant_seed, bias_check_notes, and citation per QOrium v0.6 schema. Ready for SME Lead validation + IRT pre-calibration.*
