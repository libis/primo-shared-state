# /regenerate

Regenerate or update the `@libis/primo-shared-state` package from decompiled Primo host application source code.

## Usage

```
/regenerate [sourceDir]
```

- **`sourceDir`** — path to the directory produced by `primoExtract`. If omitted, Claude will ask for it.

---

## Context

You are an expert Angular and NgRx engineer. This repository contains the `@libis/primo-shared-state` npm package — a curated set of TypeScript models, Angular services, and NgRx action creators that remote module-federation modules use to interact safely with the Primo host application's store.

The package was generated from decompiled Primo host source code extracted with [primo-extract](https://www.npmjs.com/package/primo-extract):

```bash
primoExtract --primo=https://your.primo.instance --outDir=/path/to/extracted/source --nde
```

You must read the extracted source directory supplied by the user (or ask for it if not provided), then follow the instructions below.

---

## Package boundary — what belongs here and what does not

This package is **state-only**. It provides typed, safe access to the Primo host application's NgRx store. Everything in this package must fall into one of these categories:

- TypeScript model interfaces (state shapes, API response types)
- NgRx action creators (guarded by the safety rules below)
- Selector-based state services (Observable / Signal / Promise getters and typed dispatch)
- Internal utilities that support the above (e.g. `StateHelper`)

### What does NOT belong in this package

The decompiled NDE source contains many reusable UI artefacts. **Do not add any of these to `@libis/primo-shared-state`:**

| Category | Examples from NDE source | Why excluded |
|----------|--------------------------|--------------|
| Angular components | `copy-to-clipboard`, `back-to-top`, `skeleton-shimmer`, `carousel`, `highlight`, `paragraph-with-show-more-less-btn` | UI components bring templates, styles, and Material dependencies — different concern, different change cadence |
| Directives | `TooltipIfOverflowDirective`, `FallbackDirective`, `DragHandleDirective`, `IconDirective` | DOM-level enhancers, not state access |
| Pipes | `TrustedInputPipe`, `DateFormatPipe`, `HighlightUntilVarPipe` | Pure display transforms, not state access |
| Pure utility functions | `deepMerge()`, `sanitizeInputForHTMLDomPurify()`, `countVisibleLines()`, `parseCoordinates()` | General-purpose helpers, not state-specific |
| Host-coupled components | `main-menu`, `timeout-dialog`, `language`, `search-contain-dropdown`, `back-to-results` | Tightly bound to host routing, session, or config — cannot be safely extracted |
| Host-coupled services | `jwt.service`, `external-login.service`, `search.service`, `filters.service` | These *are* the host internals — remotes access their data through this package's selectors instead |

If remotes begin duplicating UI utilities (pipes, directives, small standalone components), those should live in a **separate `@libis/primo-shared-ui` package** with its own versioning and dependency tree.

---

## Safety rules for shared-actions.ts

`shared-actions.ts` is the **compile-time safety gate**. It is the only file that exports action creators to the outside world. A remote module can only import and dispatch actions that appear here — TypeScript prevents everything else at compile time.

Apply this checklist to every action found in the decompiled source:

- ✅ **Export** — commands that start a well-defined host operation (search, filter load) where the remote legitimately supplies the parameters.
- ✅ **Export** — pure UI-state writes (pagination, sort, clear) with no HTTP side-effects.
- ✅ **Export** — terminal success/failed actions whose reducer writes to the store **and no host effect listens to them downstream**.
- ❌ **Do not export** — success/failed actions that feed a downstream effect (another effect listens to them and fires an HTTP call).
- ❌ **Do not export** — actions that initiate OAuth/ILS authentication flows.
- ❌ **Do not export** — actions that carry server-authoritative payloads (e.g. full entity lists with pnx data) that a remote cannot construct legitimately.

When in doubt, **exclude**. It is safer to omit an action than to export one that can cause silent state corruption.

Add a JSDoc comment to every exported action explaining why it is safe. Keep the EFFECTS WARNING block at the top of the file.

---

## Safety rules for read-only model access

The host application's NDE models contain server-authoritative data that remotes need to **read** but must never **write**. Expose these via selector-based services (Observable / Signal getters) with no `dispatch()` method for the underlying slices.

### Source models to include

These files from the decompiled source (`app/models/`) define the interfaces to expose:

| Source file | Expose as read-only | Notes |
|-------------|:-------------------:|-------|
| `analytics.model.ts` | ✅ Full | `EventsNames`, `PageNames`, `SearchTypes` — const maps / enums. Zero risk. Useful for remotes firing analytics consistently. |
| `search.model.ts` | ✅ Full | `SearchParams`, `Doc`, `Pnx`, `Facet`, `FacetValue`, `Info`, `SearchData`, `Highlights` — core search results. Remotes read current search state to render contextual UI. |
| `view-config.model.ts` | ✅ Full | `ViewConfigData`, `SystemConfiguration`, `MappingTables`, `Tiles`, `Scopes`, `FeatureFlags` — configuration set once at bootstrap. Remotes need these to adapt behaviour. |
| `entity.model.ts` | ✅ Full | `EntityViewModel`, `BasicEntityData`, `EntityDetails`, `EntityThumbnail`, linked-data response types — pure view models with no mutation surface. |
| `account.model.ts` | ⚠️ Partial | **Include**: `Counters`, `MenuOption`, `accountViewModel`, `LoanItem`, `FineItem`, `RequestItem`, `MappedRequestItem`, `FavoriteItem` (display state). **Exclude**: `RequestOptions`, `NestedRequestOptions`, `PersonalDetailsInfo` — these enable ILS mutations or carry editable personal data. |

### Rules

- ✅ **Export the TypeScript interfaces** in `src/models/` so remotes get compile-time type safety.
- ✅ **Expose via read-only services** — Observable and Signal getters only (e.g. `SearchStateService.docs$`, `ViewConfigService.systemConfiguration$`, `EntityStateService.viewModel$`).
- ❌ **Do not export reducers or actions** for server-authoritative data (search results, config, entity data, account display state). The host owns those writes.
- ❌ **Do not expose interfaces** that enable mutation paths (`RequestOptions`, `NestedRequestOptions`) or carry editable personal data (`PersonalDetailsInfo`).
- When a model file contains a mix of safe and unsafe interfaces, export only the safe subset and add a comment listing what was excluded and why.

---

## State service API symmetry

Every public state-service selector must expose **all three variants** — Observable, Signal, and Promise — unless the underlying selector takes a runtime argument that makes one variant impractical (documented as an exception in the service file).

For a selector over a field `foo`, the three forms are:

| Shape | Name pattern | Returns | Uses |
|-------|--------------|---------|------|
| Observable | `selectFoo$()` / `selectIsFoo$()` | `Observable<T>` | `helper.select$(...)` |
| Signal | `fooSignal()` / `isFooSignal()` | `Signal<T>` | `helper.selectSignal(..., defaultValue)` |
| Promise | `getFoo()` / `isFoo()` | `Promise<T>` (snapshot) | `helper.selectOnce(...)` |

### Rules

- ✅ **Symmetric coverage** — when you add or update a selector, generate all three variants in the same pass. Missing variants are treated as bugs, not omissions.
- ✅ **Consistent naming** — Observables end with `$`, Signals end with `Signal`, Promises use `get…` (or `is…` for boolean snapshots). Keep the same stem across all three forms so remotes can jump between them mechanically.
- ✅ **Parameterised selectors** — when a selector requires a runtime argument (e.g. `docByIdSignal(id: string)`), generate whichever of the three variants makes sense for the call-site and add a JSDoc note explaining any intentionally-missing variants.
- ✅ **Read-only services too** — the symmetry rule applies to selector-based services with no dispatch (e.g. `ViewConfigStateService`, `EntityStateService`, `AccountStateService`). Dispatch helpers are orthogonal and are only added for services that own writable slices.
- ❌ **Do not drop a variant because "nobody uses it yet"** — the package ships all three so remotes can pick whichever fits their call site without touching this package.

### Audit during updates

In **Scenario B**, after applying additions/changes to `src/state/*.ts`, re-read each service file and list every selector with fewer than three public variants. Fill the gaps in the same pass — these additions go under the new version's `### Added` section in `CHANGES.md` (group them under an "API symmetry" bullet). They are **not** breaking changes.

---

## Documentation verification — README.md and EXAMPLES.md

The package ships with two user-facing documentation files that must stay in lock-step with the regenerated `src/`:

- `README.md` — API surface reference: every exported action, state service method, model interface, and Signal/Observable/Promise getter.
- `EXAMPLES.md` — copy-paste snippets that must compile against the current exported symbols.

After regenerating `src/`, verify and correct both files using the regenerated source as the single source of truth.

### Verification checklist

For every regeneration run, walk these checks against `src/index.ts` and the files it re-exports:

1. **Action inventory** — every action exported from `src/actions/shared-actions.ts` appears in README.md with its payload shape; every action documented in README.md still exists. Remove documentation for actions the safety rules now exclude.
2. **State service surface** — for each `*StateService` in `src/state/`, list every public getter (`foo$`, `fooSignal`, `getFoo()`) and every typed dispatch method. README's service tables and EXAMPLES's snippets must match exactly (method name, return type, parameters).
3. **Model interfaces** — every interface re-exported from `src/models/` appears in README.md's models section with its fields. Remove fields that no longer exist; add new ones. Flag renamed fields in the CHANGES entry.
4. **Read-only vs dispatch boundary** — README must clearly mark which services are read-only (no `dispatch()`). If a service flipped from read-write to read-only (or vice versa) since the last version, update both the prose and any example that tries to dispatch to it.
5. **Snippet type-check** — every code block in EXAMPLES.md (and any inline snippets in README.md) imports only symbols that exist in `src/index.ts` and calls them with the current signatures. Correct imports, argument lists, and return-type assumptions.
6. **Version references** — any literal version string in README.md or EXAMPLES.md (install commands, compatibility tables) is updated to the new package version.

### Rules

- ✅ **Correct in place** — do not rewrite the docs wholesale. Preserve the existing structure, tone, and narrative sections (Introduction, Installation, Philosophy, etc.) unless they contradict the regenerated API.
- ✅ **Remove stale content** — if an action, service method, or model is gone from `src/`, remove its documentation. Do not leave "deprecated" stubs unless the user explicitly asks for a deprecation window.
- ✅ **Add new content** — new exports get a documentation entry matching the style of their neighbours (same table columns, same snippet shape).
- ❌ **Do not invent APIs** — if an example requires a helper that does not exist in `src/`, delete the example or rewrite it with existing symbols. Never add a symbol to docs that is not exported.
- ❌ **Do not document internal utilities** — `StateHelper` and other internals stay out of README/EXAMPLES.

### Cross-reference in CHANGES.md

Add a `### Documentation` subsection to the new version entry listing doc-only corrections (separate from `Added` / `Changed` / `Breaking removals`) so readers can tell API drift from code drift.

---

## Scenario A — `src/` is empty or does not exist: generate from scratch

1. Analyse the decompiled source. Identify all NgRx state slices, reducers, effects, and action creators.
2. Generate the full package:
   - `src/models/` — TypeScript interfaces for every relevant state shape. Include read-only model interfaces per the **read-only model access** rules above.
   - `src/actions/shared-actions.ts` — apply the safety rules above.
   - `src/state/` — one service per state slice (`UserStateService`, `SearchStateService`, `FilterStateService`, `ViewConfigStateService`, `EntityStateService`, `AccountStateService`). Every selector must be exposed in all three forms (Observable `selectFoo$()`, Signal `fooSignal()`, Promise `getFoo()` / `isFoo()`) per the **State service API symmetry** rules above. Services for read-only slices expose only selectors (no `dispatch()`); services that own writable slices additionally expose typed dispatch helpers.
   - `src/utils/StateHelper` — thin `Store` wrapper used internally by the services.
   - `src/index.ts` — barrel export for all public symbols.
   - `README.md` and `EXAMPLES.md` — generated to match the full API surface per the **Documentation verification** rules above.
   - `package.json` — name `@libis/primo-shared-state`, version `<YYYY>.<M>.1` (e.g. `2026.3.1`).
3. Create `CHANGES.md` with an initial `## <YYYY>.<M>.1 — <today's date>` section listing everything generated.

---

## Scenario B — `src/` already contains code: update the existing package

1. Compare the decompiled source against the current package. Identify:
   - **New** actions, state slices, model fields, or read-only model interfaces → add them (applying the read-only model access rules).
   - **Changed** action type strings, payload shapes, reducer behaviour, or read-only model shapes → update them.
   - **Removed** actions, state slices, or read-only models → **do not silently delete**. For each removal:
     - Emit a clearly visible `⚠️ BREAKING REMOVAL` warning.
     - List every exported symbol that would be deleted and what consuming code would break.
     - Ask the user for explicit confirmation before removing anything currently exported.

2. Apply all safe additions and updates.

2.5. Verify and correct `README.md` and `EXAMPLES.md` against the updated `src/` using the **Documentation verification** checklist. Doc-only corrections go under a `### Documentation` subsection in the new CHANGES.md entry.

3. Bump the version in `package.json` using `<YYYY>.<M>.<regenerate_count>` format:
   - `<YYYY>` — current four-digit year.
   - `<M>` — current month (no leading zero).
   - `<regenerate_count>` — incremented by 1 from the previous version's regenerate count. If the year or month changed since the last version, reset to `1`.

4. Append a new version entry to `CHANGES.md`:

```markdown
## <new version> — <YYYY-MM-DD>

### Added
- …

### Changed
- …

### ⚠️ Breaking removals (confirmed by user before applying)
- …
```

---

## Output format

- Produce complete, ready-to-use file contents for every file you create or modify.
- For updates, show changed files in full — do not truncate.
- Prefix every file block with its path: `// FILE: src/actions/shared-actions.ts`.
- After all files, print a summary table:

| File | Action | Reason |
|------|--------|--------|
| src/actions/shared-actions.ts | updated | new `fooAction` added; `barSuccessAction` excluded (feeds downstream effect) |
| README.md | updated | `searchRequestAction` payload field `ftsQuery` renamed to `query`; removed stale `personalDetailsAction` row |
| EXAMPLES.md | updated | snippet "Dispatching a filter clear" corrected to match new `FilterStateService.clearFilters()` signature |
| CHANGES.md | updated | new version entry appended |
| package.json | updated | version bumped to YYYY.M.N |
