# Circle and Square Tools — Design

**Date:** 2026-11-08
**Status:** approved in conversation ("ok go ahead do this")

## Intent

The canvas currently draws rectangles only. Add Circle and Square as
first-class drawing tools, plus a toolbar to switch between the three.
The project owner is learning React and the Canvas API by hand, so the
implementation stays small and readable.

## Goals

- Store rectangles, circles, and squares in one typed collection.
- Let the user pick Rectangle, Circle, or Square from a toolbar.
- Draw any of the three by pressing and dragging on the canvas.
- Render saved shapes in a dark stroke and the in-progress shape in blue.

## Non-goals

- Selection, move, resize, delete, undo/redo.
- Persistence or export.
- Touch/pointer input, keyboard shortcuts.
- Wiring up Tailwind CSS (see Constraints).

## Constraints

- Next.js 16.4.3, React 19, client components only.
- `app/globals.css` is empty and is not imported by `app/layout.tsx`, so
  Tailwind utility classes currently have no effect. The toolbar therefore
  uses inline styles so it is usable today.

## Approaches considered

1. **Tagged `Shape` union in one array (chosen).** One render loop and one
   mouse handler that branch on `shape.type`. TypeScript catches missing
   fields. Easy to add more tools later.
2. **Separate arrays per shape.** Simple typing, but triplicates handlers
   and rendering, and gets worse with every new tool.
3. **One array with optional `width`/`radius` fields.** Works, but loses
   type safety and invites reading fields that do not exist.

## Design

### Types (`types/canvas.ts`)

```ts
export type Shape =
  | ({ type: "Rectangle" } & Rectangle)
  | ({ type: "Circle" } & Circle)
  | ({ type: "Square" } & Square);
```

`Rectangle`, `Circle`, and `Square` already exist. `Circle.x`/`y` are the
center point; `Square.side` is the edge length; `Rectangle` is top-left
plus size.

### State (`Canvas.tsx`)

- `shapes: Shape[]` and `currentShape: Shape | null` replace the
  rectangle-only versions.
- `tool` stays in `Canvas`, which renders `<Toolbar />` so no state needs
  lifting into the server-rendered `page.tsx`.

### Drawing geometry

Given the drag start point and current point:

- Rectangle: bounding box (`x = min`, `y = min`, `width = |dx|`,
  `height = |dy|`).
- Square: `side = max(|dx|, |dy|)`; the top-left corner is shifted by
  `side` in whichever direction the drag went, so the square tracks the
  cursor.
- Circle: bounding box center becomes `x`/`y`; `radius = min(|dx|, |dy|) / 2`.

### Rendering

`draw` takes a helper that switches on `shape.type`: `strokeRect` for
Rectangle and Square, `beginPath` + `arc` + `stroke` for Circle. Saved
shapes use `#1e293b`; the in-progress shape uses `#3b82f6`.

### Toolbar (`Toolbar.tsx`)

Receives `tool` and `onSelectTool`. Renders three buttons
(Rectangle, Circle, Square), highlighted when active, fixed at the
top-left of the viewport above the canvas.

## Decisions left to the builder

- Exact toolbar colors, spacing, and labels (plain tool names are fine).
- Whether to add icons later.
