# Implementation Plan: Life Dashboard

## Overview

Implement a single-page life dashboard using plain HTML, CSS, and JavaScript
with no frameworks or build tools. All state is persisted to Local Storage
under the key `lifeDashboard.v1`. The implementation is split into eight
incremental tasks that each wire their feature into the running page before
moving on.

## Tasks

- [ ] 1. Create project skeleton and Local Storage layer
  - [ ] 1.1 Create `index.html` with semantic landmarks: `<header>`, `<main>`,
    and three `<section>` placeholders (tasks, timer, links)
    - Use a single `<link>` to `css/style.css` and load `js/script.js` with `defer`
    - Add a `<meta name="viewport">` tag for responsive rendering
    - _Requirements: 6.1_
  - [ ] 1.2 Create `css/style.css` with CSS custom properties for light and dark
    theme colour tokens and a basic CSS Grid layout
    - Define `:root` variables for background, surface, text, and accent colours
    - Apply a single-column layout for narrow screens and a multi-column grid
      for wider screens using a media query at 640 px or similar
    - _Requirements: 5.1, 6.4_
  - [ ] 1.3 Create `js/script.js` and implement the `Storage` module
    - Export `load()`: reads `lifeDashboard.v1`, parses JSON inside `try/catch`,
      validates shape and field types, and fills in defaults for missing parts
    - Export `save(data)`: serialises and writes inside `try/catch`; returns
      `true` on success, `false` on failure without throwing
    - Use `{ tasks: [], links: [], preferences: { name: "", theme: "light" } }`
      as the canonical default
    - _Requirements: 3.3, 4.4, 6.2_

- [ ] 2. Implement greeting, clock, and date display
  - [ ] 2.1 In `script.js`, implement a `Clock` module
    - Read the device clock with `new Date()`
    - Format time as HH:MM:SS and date as a localised string using
      `toLocaleDateString`
    - Derive greeting from hour: 05–10 → "Selamat Pagi", 11–14 → "Selamat Siang",
      15–17 → "Selamat Sore", 18–04 → "Selamat Malam"
    - Expose `start(onTick)` that calls `onTick` immediately then every second
      via `setInterval`
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ] 2.2 Wire `Clock` into `index.html`
    - Add DOM elements for greeting, user name, time, and date in `<header>`
    - On each tick, update those elements; do NOT put the clock element inside
      an `aria-live` region
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement the task list feature
  - [ ] 3.1 Add task list HTML inside the tasks `<section>`
    - A labelled text input and "Tambah" button for adding tasks
    - An empty-state message element (hidden when tasks exist)
    - An ordered `<ul>` for task items rendered by JavaScript
    - _Requirements: 3.1, 3.4_
  - [ ] 3.2 Implement `Tasks` module in `script.js`
    - `add(text)`: normalise with `trim()` + collapse internal whitespace;
      reject empty strings with a clear error message; generate a stable unique
      `id` (e.g. `crypto.randomUUID()` or timestamp-based fallback)
    - `toggle(id)`: flip the `completed` flag
    - `remove(id)`: delete by id
    - `edit(id, newText)`: normalise then replace text; reject empty text
    - Each mutation calls `Storage.save()` and shows a non-blocking warning
      if save returns `false`
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 3.3 Render task items and wire events
    - Render each task as a list item with a checkbox, text span, edit button,
      and delete button
    - Toggle `completed` class on checkbox change; call `Tasks.toggle(id)`
    - Delete button calls `Tasks.remove(id)` then re-renders
    - Edit button replaces the text span with an inline input; on submit/blur
      call `Tasks.edit(id, value)` then re-renders
    - Show the empty-state message when the task array is empty
    - _Requirements: 3.1, 3.4_

- [ ] 4. Implement duplicate-task prevention
  - [ ] 4.1 Add duplicate check inside `Tasks.add()` and `Tasks.edit()`
    - Normalise candidate text with `trim()`, collapse whitespace, and
      `toLowerCase()` before comparing
    - In `add()`: reject if any existing task matches after normalisation
    - In `edit()`: reject if any task *other than the one being edited* matches
    - Display a specific error message distinct from the empty-name error
    - _Requirements: 5.3_

- [ ] 5. Implement the Pomodoro focus timer
  - [ ] 5.1 Add timer HTML inside the timer `<section>`
    - A `<time>` or `<output>` element showing MM:SS
    - Three buttons: Mulai, Berhenti, Reset
    - A status element for the session-complete message (hidden by default)
    - _Requirements: 2.1_
  - [ ] 5.2 Implement `Timer` module in `script.js`
    - State: `remainingSeconds = 1500`, `isRunning = false`, `endTime = null`,
      `intervalId = null`
    - `start()`: no-op if `isRunning`; set `endTime = Date.now() +
      remainingSeconds * 1000`; set `isRunning = true`; schedule interval
    - Interval tick: `remainingSeconds = Math.max(0,
      Math.ceil((endTime - Date.now()) / 1000))`; update display; if
      `remainingSeconds === 0` call `_complete()`
    - `stop()`: recalculate `remainingSeconds` from `endTime`; clear interval;
      set `isRunning = false`
    - `reset()`: clear interval; `remainingSeconds = 1500`; `isRunning = false`;
      `endTime = null`; clear complete status; re-enable Mulai
    - `_complete()`: clear interval; `isRunning = false`; show status; disable
      Mulai
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ] 5.3 Wire timer buttons to `Timer` module
    - Mulai button calls `Timer.start()`; Berhenti calls `Timer.stop()`; Reset
      calls `Timer.reset()` then re-renders button states
    - Update MM:SS display on every tick
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 6. Implement favourite links
  - [ ] 6.1 Add links HTML inside the links `<section>`
    - Two labelled inputs (label, URL) and an "Tambah" button
    - An `<ul>` for link items rendered by JavaScript
    - _Requirements: 4.1_
  - [ ] 6.2 Implement `Links` module in `script.js`
    - `add(label, url)`: reject empty label; validate URL with `new URL()` and
      allow only `http:` and `https:` protocols; reject otherwise with a
      clear error message; generate unique `id`; call `Storage.save()`
    - `remove(id)`: delete by id; call `Storage.save()`
    - _Requirements: 4.1, 4.3, 4.4_
  - [ ] 6.3 Render link items and wire events
    - Render each link as `<a href="…" target="_blank"
      rel="noopener noreferrer">label</a>` followed by a delete button
    - Delete button calls `Links.remove(id)` then re-renders
    - _Requirements: 4.2, 4.5_

- [ ] 7. Implement theme toggle and custom greeting name
  - [ ] 7.1 Add theme toggle control to `<header>`
    - A checkbox or button labelled "Tema Gelap / Terang"
    - On toggle, switch the `data-theme` attribute on `<html>` between `"light"`
      and `"dark"`; update `preferences.theme` via `Storage.save()`
    - On page load, apply the stored theme before first render to prevent flash
    - _Requirements: 5.1, 5.2_
  - [ ] 7.2 Add custom name input and save button to `<header>`
    - A text input and "Simpan Nama" button
    - On submit, `trim()` the value; store in `preferences.name` via
      `Storage.save()`; update the greeting display immediately
    - Empty name produces a generic greeting without the name
    - _Requirements: 5.2 (nama sapaan kustom)_

- [ ] 8. Accessibility, security hardening, and cross-browser polish
  - [ ] 8.1 Audit and fix accessibility
    - Add `<label>` elements for every input; add `aria-label` to icon-only buttons
    - Ensure all interactive elements are keyboard-reachable and show a visible
      focus indicator in both themes
    - Add a single `aria-live="polite"` region for validation error messages
      (not the clock)
    - _Requirements: 6.4_
  - [ ] 8.2 Harden text rendering and URL validation
    - Ensure all user-supplied text is inserted via `.textContent` or
      `.innerText`, never `.innerHTML`, to prevent XSS
    - Confirm `Links.add()` rejects `javascript:`, `data:`, and other non-HTTP/S
      protocols via the `new URL()` check
    - _Requirements: 4.3, 6.2_
  - [ ] 8.3 Verify responsive layout at 320 px width
    - Check that no element causes horizontal scroll at 320 px
    - Fix any overflow, fixed-width, or min-width violations in `style.css`
    - _Requirements: 6.4_

- [ ] 9. Final integration checkpoint
  - Wire all modules together in the `DOMContentLoaded` callback:
    load storage → apply theme → render clock, tasks, timer, links → attach
    all event listeners
  - Ensure a single script entry point with no orphaned event listeners or
    duplicate initialisations
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3, 6.1_

## Notes

- Sub-tasks marked `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- There is no build tool; open `index.html` directly in a browser or via a
  simple static server to verify
- The design document has no Correctness Properties section, so no
  property-based tests are included — manual verification covers correctness

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "5.2", "6.2", "7.1", "7.2"] },
    { "id": 3, "tasks": ["3.3", "4.1", "5.3", "6.3"] },
    { "id": 4, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
