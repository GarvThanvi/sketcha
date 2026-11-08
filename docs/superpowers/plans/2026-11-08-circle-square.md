# Circle and Square Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Circle and Square drawing tools with a toolbar, alongside the existing Rectangle tool.

**Architecture:** One tagged `Shape` union stored in a single array. `Canvas` owns the active tool and renders a `Toolbar`, then branches on the tool while dragging and on `shape.type` while rendering.

**Tech Stack:** Next.js 16.4.3, React 19, TypeScript, HTML Canvas 2D.

**Spec:** `docs/superpowers/specs/2026-11-08-circle-square-design.md`

## Global Constraints

- Every touched component is a client component (`"use client"`).
- No test runner is configured in this project. Verification is `npm run lint`, `npm run build`, and a manual drag test with `npm run dev`.
- Toolbar styling is inline because Tailwind is not wired up (`app/globals.css` is empty and not imported).

## Review Focus

- Releasing the mouse outside the canvas must not leave a ghost shape or a stuck drawing state.
- Switching tools must not mix shape types.
- Zero-size drags (a click without movement) must not save a shape.
- A square dragged up or left must stay attached to the cursor.
- A circle must use the smaller drag dimension so it stays inside the drag box.

---

### Task 1: Add the tagged Shape union

**Files:**
- Modify: `types/canvas.ts`

**Interfaces:**
- Consumes: existing `Rectangle`, `Circle`, `Square` interfaces.
- Produces: `Shape` union with `type: "Rectangle" | "Circle" | "Square"`.

- [ ] **Step 1: Add `Shape` below the three interfaces**

```ts
export type Shape =
  | ({ type: "Rectangle" } & Rectangle)
  | ({ type: "Circle" } & Circle)
  | ({ type: "Square" } & Square);
```

- [ ] **Step 2: Run `npm run lint`**

Expected: PASS (no new errors).

- [ ] **Step 3: Commit**

```bash
git add types/canvas.ts
git commit -m "feat: add tagged Shape union"
```

---

### Task 2: Build the Toolbar

**Files:**
- Create: `components/canvas/Toolbar.tsx`

**Interfaces:**
- Consumes: `Tool` from `types/canvas`.
- Produces: default React component `Toolbar({ tool, onSelectTool })` where `tool: Tool` and `onSelectTool: (tool: Tool) => void`.

- [ ] **Step 1: Create the component**

Render a `position: fixed` bar at top-left (`16px`) with three buttons for
`"Rectangle"`, `"Circle"`, and `"Square"`. On click call
`onSelectTool(value)`. Highlight the active button with a blue background
and white text; inactive buttons are slate text on white. Use
`aria-pressed={tool === value}`.

- [ ] **Step 2: Run `npm run lint`**

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/Toolbar.tsx
git commit -m "feat: add shape toolbar"
```

---

### Task 3: Wire tools and mixed-shape drawing into Canvas

**Files:**
- Modify: `components/canvas/Canvas.tsx`

**Interfaces:**
- Consumes: `Shape` from Task 1, `Toolbar` from Task 2.
- Produces: working Rectangle/Circle/Square drawing.

- [ ] **Step 1: Update imports and state types**

Import `Shape` and `Toolbar`; change `shapes` to `Shape[]` and
`currentShape` to `Shape | null`.

- [ ] **Step 2: Gate mouse-down on a drawable tool**

Return early only when `tool === "selection"`. Otherwise record the start
point and set `isDrawing` to true.

- [ ] **Step 3: Build the right shape in `handleMouseMove`**

Compute `width = Math.abs(dx)`, `height = Math.abs(dy)`, and the bounding
box top-left. Branch on `tool`:

- Rectangle: `{ type: "Rectangle", id, x: left, y: top, width, height }`.
- Square: `side = Math.max(width, height)`; `x = dx < 0 ? startX - side : startX`,
  `y = dy < 0 ? startY - side : startY`.
- Circle: `radius = Math.min(width, height) / 2`; `x = left + width / 2`,
  `y = top + height / 2`.

- [ ] **Step 4: Render all three shapes**

Replace the rectangle-only draw loop with a helper `drawShape(shape, color)`
that switches on `shape.type`. Draw saved shapes in `#1e293b` and the
current shape in `#3b82f6`. Keep `width = 2`.

- [ ] **Step 5: Render the toolbar**

Return a fragment with `<Toolbar tool={tool} onSelectTool={setTool} />`
before the `<canvas>`.

- [ ] **Step 6: Run lint and build**

Run: `npm run lint && npm run build`
Expected: both PASS.

- [ ] **Step 7: Manual check**

Run `npm run dev`, open the app, and verify: each toolbar button selects
its tool; rectangle, circle, and square all draw; the in-progress shape is
blue and saved shapes are dark; dragging outside the canvas does not leave
a stuck shape.

- [ ] **Step 8: Commit**

```bash
git add components/canvas/Canvas.tsx
git commit -m "feat: draw circles and squares"
```
