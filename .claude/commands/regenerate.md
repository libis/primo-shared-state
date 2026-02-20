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

## Scenario A — `src/` is empty or does not exist: generate from scratch

1. Analyse the decompiled source. Identify all NgRx state slices, reducers, effects, and action creators.
2. Generate the full package:
   - `src/models/` — TypeScript interfaces for every relevant state shape.
   - `src/actions/shared-actions.ts` — apply the safety rules above.
   - `src/state/` — one service per state slice (`UserStateService`, `SearchStateService`, `FilterStateService`) each with Observable, Promise, Signal, and typed dispatch APIs.
   - `src/utils/StateHelper` — thin `Store` wrapper used internally by the services.
   - `src/index.ts` — barrel export for all public symbols.
   - `package.json` — name `@libis/primo-shared-state`, version `1.0.0`.
3. Create `CHANGES.md` with an initial `## 1.0.0 — <today's date>` section listing everything generated.

---

## Scenario B — `src/` already contains code: update the existing package

1. Compare the decompiled source against the current package. Identify:
   - **New** actions, state slices, or model fields → add them.
   - **Changed** action type strings, payload shapes, or reducer behaviour → update them.
   - **Removed** actions or state slices → **do not silently delete**. For each removal:
     - Emit a clearly visible `⚠️ BREAKING REMOVAL` warning.
     - List every exported symbol that would be deleted and what consuming code would break.
     - Ask the user for explicit confirmation before removing anything currently exported.

2. Apply all safe additions and updates.

3. Bump the version in `package.json` according to semver:
   - `patch` — non-breaking additions or internal changes only.
   - `minor` — new exported symbols added.
   - `major` — any exported symbol removed or its signature changed in a breaking way.

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
| CHANGES.md | updated | new version entry appended |
| package.json | updated | version bumped to x.y.z |
