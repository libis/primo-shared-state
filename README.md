# @libis/primo-shared-state

Shared state models and Angular services for the Primo module-federation architecture. Remote/client modules use this package to read the host application's NgRx store (user, search, filter slices) and dispatch a curated set of safe actions back to it.

## What's inside

| Layer | Contents |
|---|---|
| **Models** (`src/models/`) | TypeScript interfaces mirroring the host's state shapes: `SearchParams`, `Doc`, `UserState`, `FilterState`, `LoadingStatus`, … |
| **Services** (`src/state/`) | Three `providedIn: 'root'` Angular services — `UserStateService`, `SearchStateService`, `FilterStateService` — each offering Observable streams, one-shot Promise snapshots, Angular Signals, and typed dispatch helpers |
| **Actions** (`src/actions/`) | `shared-actions.ts` — re-exported NgRx action creators whose `type` strings match the host's reducers **byte-for-byte** |
| **Utility** (`src/utils/`) | `StateHelper` — thin wrapper around `Store` used internally by all services |

### Table of contents

- [Peer dependencies](#peer-dependencies)
- [Building & packaging](#building--packaging)
- [Deploying to a module-federation remote client](#deploying-to-a-module-federation-remote-client)
- [Usage](#usage)
  - [Observable API](#observable-api-reactive)
  - [Signal API](#signal-api-angular-17)
  - [Promise snapshots](#one-shot-promise-snapshots-logic-not-templates)
  - [Typed dispatch helpers](#typed-dispatch-helpers)
  - [Low-level dispatch](#low-level-dispatch-escape-hatch)
- [Why not all host actions are exported](#why-not-all-host-actions-are-exported)
- [API reference](#api-reference)
  - [UserStateService](#userstateservice)
  - [SearchStateService](#searchstateservice)
  - [FilterStateService](#filterstateservice)
- [Types & interfaces](#types--interfaces)
  - [Primitives & constants](#primitives--constants)
  - [User types](#user-types)
  - [Search types](#search-types)
    - [SearchParams](#searchparams)
    - [SearchData / SearchMetaData](#searchdata--searchmetadata)
    - [Doc](#doc)
    - [Pnx](#pnx)
    - [DocDelivery](#docdelivery)
    - [Delivery sub-types](#delivery-sub-types)
    - [Search result sub-types](#search-result-sub-types)
    - [Enrichment & citation types](#enrichment--citation-types)
    - [Utility map types](#utility-map-types)
  - [Filter types](#filter-types)
- [Actions reference](#actions-reference)
  - [Search actions](#search-actions-1)
  - [Filter actions](#filter-actions-1)
  - [User actions](#user-actions-1)
- [Troubleshooting](#troubleshooting)
- [Versioning](#versioning)

## Peer dependencies

| Package | Version |
|---|---|
| `@angular/core` | `^19.0.0` |
| `@angular/common` | `^19.0.0` |
| `@angular/platform-browser` | `^19.0.0` |
| `@ngrx/store` | `^19.0.0` |
| `rxjs` | `^7.0.0` |

These must match the host application's singleton versions exactly (enforced via module-federation `strictVersion`).

---

## Building & packaging

```bash
# 1. Install dev dependencies
npm install

# 2. Compile (output → dist/)
npm run build

# 3. Create a distributable tarball
npm pack
# → libis-primo-shared-state-1.0.0.tgz
```

---

## Deploying to a module-federation remote client

### Step 1 — copy the tarball into the remote project

```bash
npm pack
cp libis-primo-shared-state-1.0.0.tgz path/to/NDE_customModule/nde/
```

### Step 2 — add the `file:` dependency to the remote's `package.json`

```json
"dependencies": {
  "@libis/primo-shared-state": "file:nde/libis-primo-shared-state-1.0.0.tgz"
}
```

### Step 3 — install in the remote project

```bash
cd path/to/NDE_customModule_LIBISstyle
npm install
```

### Step 4 — declare the package as **shared** in `webpack.config.js`

This lib wraps `@ngrx/store` and `@angular/core` — both of which the host already bootstrapped as singletons. If you do **not** add it to the shared map, webpack module federation will bundle a private copy of the lib inside the remote's chunk. That private copy resolves its own `Store` injection token, which is completely isolated from the host's `Store`. As a result, all selectors return empty/`undefined` and dispatched actions are silently swallowed — the lib appears to load fine but does nothing.

Add it to the remote's shared map so the remote uses the same instance the host already loaded:

```javascript
// webpack.config.js (remote / client only — the host has no knowledge of this lib)
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'ndeCustomModule',
  exposes: {
    './Module': './src/app/nde/nde.module.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@libis/primo-shared-state': {
      singleton: true,
      strictVersion: false,  // the host does not ship this lib — no version to match against
    },
  },
});
```

> **Why `strictVersion: false`?**
> The host does not ship or share this lib at all — it has no knowledge of it.
> `strictVersion: true` would cause a runtime error because there is no host-provided
> version for webpack to match against. `strictVersion: false` tells module federation
> to use whatever version the remote brings, without demanding a counterpart from the host.

No changes to the host's `webpack.config.js` are needed or possible — the host is a black box.

---

## Usage

### Observable API (reactive)

```typescript
import { Component } from '@angular/core';
import {
  UserStateService,
  SearchStateService,
  FilterStateService,
} from '@libis/primo-shared-state';

@Component({ /* … */ })
export class MyComponent {
  // User
  isLoggedIn$  = this.user.selectIsLoggedIn$();
  userName$    = this.user.selectUserName$();
  userGroup$   = this.user.selectUserGroup$();
  jwt$         = this.user.selectJwt$();
  settings$    = this.user.selectUserSettings$();

  // Search
  docs$         = this.search.selectAllDocs$();
  isLoading$    = this.search.selectIsLoading$();
  totalResults$ = this.search.selectTotalResults$();
  searchParams$ = this.search.selectSearchParams$();
  metaData$     = this.search.selectSearchMetaData$();
  pageSize$     = this.search.selectPageSize$();

  // Filters
  includedFilters$     = this.filter.selectIncludedFilters$();
  excludedFilters$     = this.filter.selectExcludedFilters$();
  multiFilters$        = this.filter.selectMultiSelectedFilters$();
  resourceTypeFilter$  = this.filter.selectResourceTypeFilter$();
  isFiltersOpen$       = this.filter.selectIsFiltersOpen$();

  constructor(
    private user: UserStateService,
    private search: SearchStateService,
    private filter: FilterStateService,
  ) {}
}
```

### Signal API (Angular 17+)

```typescript
import { Component } from '@angular/core';
import { UserStateService, SearchStateService, FilterStateService } from '@libis/primo-shared-state';

@Component({
  template: `
    <p>{{ isLoggedIn() ? 'Logged in as ' + userName() : 'Guest' }}</p>
    <p>{{ totalResults() }} results — status: {{ searchStatus() }}</p>
  `
})
export class MySignalComponent {
  // User signals
  isLoggedIn  = this.user.isLoggedInSignal();
  userName    = this.user.userNameSignal();
  userGroup   = this.user.userGroupSignal();
  jwt         = this.user.jwtSignal();
  userSettings = this.user.userSettingsSignal();
  decodedJwt  = this.user.decodedJwtSignal();

  // Search signals
  docs          = this.search.allDocsSignal();
  searchParams  = this.search.searchParamsSignal();
  metaData      = this.search.searchMetaDataSignal();
  searchStatus  = this.search.searchStatusSignal();
  totalResults  = this.search.totalResultsSignal();
  pageSize      = this.search.pageSizeSignal();
  isLoading     = this.search.isLoadingSignal();

  // Filter signals
  filterState         = this.filter.filterStateSignal();
  includedFilters     = this.filter.includedFiltersSignal();
  excludedFilters     = this.filter.excludedFiltersSignal();
  multiFilters        = this.filter.multiSelectedFiltersSignal();
  resourceTypeFilter  = this.filter.resourceTypeFilterSignal();
  isFiltersOpen       = this.filter.isFiltersOpenSignal();
  isRememberAll       = this.filter.isRememberAllSignal();

  constructor(
    private user: UserStateService,
    private search: SearchStateService,
    private filter: FilterStateService,
  ) {}
}
```

### One-shot Promise snapshots (logic, not templates)

```typescript
const jwt      = await this.user.getJwt();
const loggedIn = await this.user.isLoggedIn();
const settings = await this.user.getUserSettings();

const docs     = await this.search.getAllDocs();
const doc      = await this.search.getDocById('someId');
const params   = await this.search.getSearchParams();

const included = await this.filter.getIncludedFilters();
const excluded = await this.filter.getExcludedFilters();
const multi    = await this.filter.getMultiSelectedFilters();
```

### Typed dispatch helpers

Instead of importing action creators directly, use the convenience methods on each service:

```typescript
// SearchStateService
this.search.search({ q: 'angular', scope: 'Everything' });
this.search.search({ q: 'angular', scope: 'Everything' }, 'blended');
this.search.clearSearch();
this.search.setPageLimit(25);
this.search.setPageNumber(2);
this.search.setSortBy('date');
this.search.setIsSavedSearch(true);
this.search.setSearchNotificationMessage('Saved search loaded');

// FilterStateService
this.filter.loadFilters({ q: 'angular', scope: 'Everything' });
this.filter.updateSortByParam('rank');

// UserStateService — safe settings-only operations
this.user.setLanguage('en');
this.user.setSaveHistory('true');
this.user.setUseHistory('true');
this.user.setAutoExtendMySession('false');
this.user.setAllowSavingRaSearchHistory('true');
this.user.setDecodedJwt(decodedJwtObject);
this.user.setLoginFromState('/search');
this.user.resetLogoutReason();
```

### Low-level dispatch (escape hatch)

All three services expose a `dispatch(action)` method for anything not covered by the helpers:

```typescript
import { resetJwtAction } from '@libis/primo-shared-state';

this.user.dispatch(resetJwtAction({ logoutReason: 'user' }));
```

You can also import action creators directly:

```typescript
import {
  searchAction,
  clearSearchAction,
  pageLimitChangedAction,
  loadFiltersAction,
  setDecodedJwt,
  // …
} from '@libis/primo-shared-state';
```

> ⚠️ **Effects warning** — the host app has NgRx Effects listening to these actions (HTTP calls, etc.). Do **not** register your own `EffectsModule.forFeature()` with effects that re-implement the same actions. Use `Actions` + `ofType` to *listen* without triggering duplicates.

---

## Why not all host actions are exported

`shared-actions.ts` only exports actions that a remote module can **safely dispatch**. Many actions in the host app are deliberately omitted. The decision follows one rule:

> **An action is safe to export only if a remote module can dispatch it without corrupting state or triggering unintended HTTP side-effects.**

### The three categories

#### ✅ Included — commands and UI-state writes

These are actions a remote legitimately wants to *trigger*. They either start a well-defined operation in the host (a search, a filter load) or write a simple scalar to the store with no dangerous side-effects:

| Example | Why safe |
|---|---|
| `[Search] Load search` | Tells the host to run a search — that is the whole point |
| `[Search] Page Limit Changed` | Pure state write, no HTTP call attached |
| `[Search] clear search` | Resets state, no HTTP call |
| `[Filter] Load Filter` | Triggers a filter HTTP call via the host's effect — remote supplies the params |
| `[User-Settings] Done Change User Settings Language` | Writes a string to the user slice, no destructive side-effect |

#### ❌ Excluded — effect outputs (success/failure actions emitted after HTTP calls)

These are actions the host's effects **emit** after an HTTP call completes. They carry real server-response payloads that a remote module cannot construct legitimately. Dispatching them from a remote would corrupt store state and/or re-trigger HTTP effects.

A concrete example is `deliverySuccessAction`. Its action chain looks like this:

```
searchSuccessAction              ← remote CAN dispatch
    └─► [Search] Load delivery   ← DeliveryEffect fires an HTTP call
            └─► deliverySuccessAction   ← effect emits this when HTTP responds
                    │
                    ├─► search.reducer  updates pnx data on every Doc entity
                    └─► DeliveryEffect  triggers a second HTTP call (eDelivery)
```

If a remote dispatched `deliverySuccessAction` with a fabricated or incomplete `Doc[]` payload it would **overwrite `pnx` data** on all current search result entities (blanking display fields, availability, links) and simultaneously fire a real HTTP call to the delivery service as a side-effect.

The same reasoning applies to all other `*SuccessAction` / `*FailedAction` variants: `[Search] Load search success`, `[full-display] load full display success`, `[Search] Load delivery success`, etc. None of these are exported.

#### ❌ Excluded — actions that trigger login/logout HTTP flows

Actions such as `[User] load jwt guest`, `[User] load logged user jwt`, and `[User] reset jwt` kick off OAuth/ILS authentication flows managed entirely by the host. A remote module has no business initiating or short-circuiting those flows.

### Decision table

| Category | Exported | Reason |
|---|---|---|
| Commands — start a search / filter load | ✅ | Remote legitimately triggers these |
| Pure UI-state toggles — pagination, sort, clear | ✅ | No HTTP side-effects |
| Safe settings writes — language, history toggles | ✅ | Only mutate the user settings slice |
| Effect outputs — `*SuccessAction`, `*FailedAction` | ❌ | Cannot produce valid payload; corrupts state and re-triggers HTTP effects |
| Auth flow triggers — JWT load, login, logout | ❌ | Authentication is owned entirely by the host |

### Listening to excluded actions without dispatching them

If you need to *react* to an action that is not exported (e.g. do something after delivery finishes loading), use `Actions` + `ofType` to listen passively — **do not dispatch**:

```typescript
import { inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';

// Inside a service or component constructor:
private actions$ = inject(Actions);

constructor() {
  // React to delivery completing without dispatching anything
  this.actions$.pipe(
    ofType('[Search] Load delivery success')   // use the literal type string
  ).subscribe(({ docsToUpdate }) => {
    // read-only reaction — never re-dispatch this action
  });
}
```

> Do **not** register an `EffectsModule.forFeature()` in the remote with effects that handle the same action type strings as the host — that causes every HTTP call to fire twice.

### ⛔ Anti-pattern: patching PNX data via a local overlay

A tempting workaround when the server returns wrong or missing `pnx` data is to build a client-side overlay service that intercepts the store's docs, applies local patches, and exposes a "corrected" Observable or Signal:

```typescript
// ❌ DO NOT DO THIS
@Injectable({ providedIn: 'root' })
export class DocPatchService {
  private patches$ = new BehaviorSubject<Map<string, Partial<Pnx>>>(new Map());

  patchDocPnx(recordId: string, patch: Partial<Pnx>): void {
    // …merge patch into map…
  }

  selectAllDocsPatched$(): Observable<Doc[]> {
    return combineLatest([storeDocs$, this.patches$]).pipe(
      map(([docs, patches]) => docs.map(doc => applyPatch(doc, patches.get(doc['@id']))))
    );
  }
}
```

**Why this is wrong:**

1. **Split truth** — host components always read the original, unpatched entities from the NgRx store. Your remote component would show corrected data while every host component (search result tiles, full display, availability panel) still shows the wrong data side-by-side. The user sees inconsistent information on the same screen.

2. **Fragile lifecycle** — you must manually track when to clear the patch (new search, navigation, full-display open). Any timing gap means stale overrides bleed across searches.

3. **Invisible to devtools** — because the patches live outside the store, NgRx DevTools shows the original state. Debugging why a component renders something different from what the store contains becomes very confusing.

4. **Symptom, not cause** — if the server consistently returns wrong data, the fix belongs server-side (Primo NUI configuration, normalization rules, or a back-end mapping). A client overlay papers over a data quality issue without fixing it.

**The correct approach** when `pnx` data needs correction:

- Fix the data at source — adjust the Primo NUI/backend configuration so the server returns correct data.
- If you only need to *display* derived or supplemental data (e.g. a cover image from a third-party API), keep that data entirely in your remote component's local state and never mix it with store docs.
- If you need to react to what the server returned, use `selectAllDocs$()` to read the data and apply display-layer transformations in your component's template pipe or view model — without touching or shadowing the store.

---

## API reference

### `UserStateService`

#### Observables
| Method | Returns | Description |
|---|---|---|
| `selectUserState$()` | `Observable<UserState>` | Full user state slice |
| `selectJwt$()` | `Observable<string \| undefined>` | Raw JWT |
| `selectDecodedJwt$()` | `Observable<DecodedJwt \| undefined>` | Decoded JWT payload |
| `selectIsLoggedIn$()` | `Observable<boolean>` | Login status |
| `selectUserSettings$()` | `Observable<UserSettings \| undefined>` | User preferences |
| `selectUserName$()` | `Observable<string \| undefined>` | Username from JWT |
| `selectUserGroup$()` | `Observable<string>` | User group (default `'GUEST'`) |

#### Signals
| Method | Returns | Initial value |
|---|---|---|
| `userStateSignal()` | `Signal<UserState>` | `{}` |
| `jwtSignal()` | `Signal<string \| undefined>` | `undefined` |
| `decodedJwtSignal()` | `Signal<DecodedJwt \| undefined>` | `undefined` |
| `isLoggedInSignal()` | `Signal<boolean>` | `false` |
| `userSettingsSignal()` | `Signal<UserSettings \| undefined>` | `undefined` |
| `userNameSignal()` | `Signal<string \| undefined>` | `undefined` |
| `userGroupSignal()` | `Signal<string>` | `'GUEST'` |

#### Snapshots
| Method | Returns |
|---|---|
| `getJwt()` | `Promise<string \| undefined>` |
| `isLoggedIn()` | `Promise<boolean>` |
| `getUserSettings()` | `Promise<UserSettings \| undefined>` |

#### Dispatch helpers
`setDecodedJwt(jwt)` · `setLoginFromState(v)` · `resetLogoutReason()` · `setLanguage(v)` · `setSaveHistory(v)` · `setUseHistory(v)` · `setAutoExtendMySession(v)` · `setAllowSavingRaSearchHistory(v)` · `dispatch(action)`

---

### `SearchStateService`

#### Observables
| Method | Returns | Description |
|---|---|---|
| `selectAllDocs$()` | `Observable<Doc[]>` | All docs in entity map |
| `selectDocById$(id)` | `Observable<Doc \| undefined>` | Single doc by entity ID |
| `selectSearchParams$()` | `Observable<SearchParams \| null>` | Active search params |
| `selectSearchMetaData$()` | `Observable<SearchMetaData \| null>` | Totals, facets, highlights |
| `selectSearchStatus$()` | `Observable<LoadingStatus>` | `pending/loading/success/fail` |
| `selectTotalResults$()` | `Observable<number>` | `info.total` |
| `selectPageSize$()` | `Observable<number \| null>` | Selected page size |
| `selectIsLoading$()` | `Observable<boolean>` | `status === 'loading'` |

#### Signals
| Method | Returns | Initial value |
|---|---|---|
| `allDocsSignal()` | `Signal<Doc[]>` | `[]` |
| `searchParamsSignal()` | `Signal<SearchParams \| null>` | `null` |
| `searchMetaDataSignal()` | `Signal<SearchMetaData \| null>` | `null` |
| `searchStatusSignal()` | `Signal<LoadingStatus>` | `'pending'` |
| `totalResultsSignal()` | `Signal<number>` | `0` |
| `pageSizeSignal()` | `Signal<number \| null>` | `null` |
| `isLoadingSignal()` | `Signal<boolean>` | `false` |

#### Snapshots
| Method | Returns |
|---|---|
| `getAllDocs()` | `Promise<Doc[]>` |
| `getDocById(id)` | `Promise<Doc \| undefined>` |
| `getSearchParams()` | `Promise<SearchParams \| null>` |

#### Dispatch helpers
`search(params, type?)` · `clearSearch()` · `setPageLimit(n)` · `setPageNumber(n)` · `setSortBy(s)` · `setIsSavedSearch(b)` · `setSearchNotificationMessage(s)` · `dispatch(action)`

---

### `FilterStateService`

#### Observables
| Method | Returns | Description |
|---|---|---|
| `selectFilterState$()` | `Observable<FilterState>` | Full filter slice |
| `selectIncludedFilters$()` | `Observable<selectedFilters[] \| null>` | Include facets |
| `selectExcludedFilters$()` | `Observable<selectedFilters[] \| null>` | Exclude facets |
| `selectMultiSelectedFilters$()` | `Observable<MultiSelectedFilter[] \| null>` | Multi-select facets |
| `selectResourceTypeFilter$()` | `Observable<ResourceTypeFilterModel \| null>` | Resource type bar |
| `selectIsFiltersOpen$()` | `Observable<boolean>` | Filter panel open state |
| `selectIsRememberAll$()` | `Observable<boolean>` | Remember-all toggle |

#### Signals
| Method | Returns | Initial value |
|---|---|---|
| `filterStateSignal()` | `Signal<FilterState>` | `{}` |
| `includedFiltersSignal()` | `Signal<selectedFilters[] \| null>` | `null` |
| `excludedFiltersSignal()` | `Signal<selectedFilters[] \| null>` | `null` |
| `multiSelectedFiltersSignal()` | `Signal<MultiSelectedFilter[] \| null>` | `null` |
| `resourceTypeFilterSignal()` | `Signal<ResourceTypeFilterModel \| null>` | `null` |
| `isFiltersOpenSignal()` | `Signal<boolean>` | `false` |
| `isRememberAllSignal()` | `Signal<boolean>` | `false` |

#### Snapshots
| Method | Returns |
|---|---|
| `getIncludedFilters()` | `Promise<selectedFilters[] \| null>` |
| `getExcludedFilters()` | `Promise<selectedFilters[] \| null>` |
| `getMultiSelectedFilters()` | `Promise<MultiSelectedFilter[] \| null>` |

#### Dispatch helpers
`loadFilters(params)` · `updateSortByParam(s)` · `dispatch(action)`

---

## Types & interfaces

> All types below are exported from the package root and can be imported directly:
> ```typescript
> import { Doc, SearchParams, FilterState, LoadingStatus } from '@libis/primo-shared-state';
> ```

---

### Primitives & constants

Defined in `src/models/state.const.ts`.

```typescript
type LoadingStatus = 'pending' | 'loading' | 'success' | 'fail';
type LogoutReason  = 'user' | 'timeout';
```

| Constant | Value | Description |
|---|---|---|
| `PENDING` | `'pending'` | Initial state — no request started |
| `LOADING` | `'loading'` | HTTP request in flight |
| `SUCCESS` | `'success'` | Request completed successfully |
| `FAIL` | `'fail'` | Request completed with error |
| `USER` | `'user'` | Logout triggered by the user |
| `TIMEOUT` | `'timeout'` | Logout triggered by session timeout |

---

### User types

Defined in `src/models/user.model.ts`.

#### `UserState`

Top-level state slice for the authenticated user.

| Field | Type | Description |
|---|---|---|
| `jwt` | `string \| undefined` | Raw JWT token string |
| `decodedJwt` | `DecodedJwt \| undefined` | Parsed JWT payload |
| `status` | `LoadingStatus` | Current load status of the user/JWT |
| `isLoggedIn` | `boolean` | Whether the user is authenticated |
| `loginFromState` | `string \| undefined` | URL the user was on before login redirect |
| `userSettings` | `UserSettings \| undefined` | Persisted user preferences |
| `userSettingsStatus` | `LoadingStatus` | Load status of `userSettings` |
| `logoutReason` | `LogoutReason \| undefined` | Why the last logout happened |

#### `DecodedJwt`

Parsed claims from the Primo JWT.

| Field | Type | Description |
|---|---|---|
| `userName` | `string` | Login identifier (barcode / username) |
| `displayName` | `string` | Human-readable name |
| `userGroup` | `string` | Primo user group (e.g. `'Staff'`, `'GUEST'`) |
| `onCampus` | `boolean` | Whether the IP is on-campus |
| `signedIn` | `boolean` | Whether the user is actively signed in |
| `authenticationProfile` | `string` | ILS authentication profile identifier |
| `user` | `string` | Raw user field from JWT |

#### `UserSettings`

Key/value map of persisted user preferences. All fields are optional strings.

| Field | Type | Description |
|---|---|---|
| `resultsBulkSize` | `string?` | Number of results per page |
| `language` | `string?` | Preferred UI language code |
| `saveSearchHistory` | `string?` | `'true'`/`'false'` — whether search history is saved |
| `useSearchHistory` | `string?` | `'true'`/`'false'` — whether history is used |
| `autoExtendMySession` | `string?` | `'true'`/`'false'` — auto session extension |
| `allowSavingMyResearchAssistanceSearchHistory` | `string?` | Research assistant history opt-in |
| `email` | `string?` | User's email address |
| `[key: string]` | `string \| undefined` | Index signature for additional settings |

---

### Search types

Defined in `src/models/search.model.ts`.

#### `SearchParams`

Parameters sent to the host search engine. `q` and `scope` are required; all other fields are optional.

| Field | Type | Description |
|---|---|---|
| `q` | `string` | Query string |
| `scope` | `string` | Search scope identifier |
| `skipDelivery` | `stringBoolean?` | Skip delivery enrichment (`'Y'`/`'N'`) |
| `offset` | `number?` | Pagination offset |
| `limit` | `number?` | Results per page |
| `sort` | `string?` | Sort field |
| `inst` | `string?` | Institution code |
| `refEntryActive` | `boolean?` | Enable reference entry mode |
| `disableCache` | `boolean?` | Bypass server-side cache |
| `newspapersActive` | `boolean?` | Include newspaper source |
| `qInclude` | `string[]?` | Facet include filters |
| `qExclude` | `string[]?` | Facet exclude filters |
| `multiFacets` | `string[]?` | Multi-select facet values |
| `isRapido` | `boolean?` | Rapido resource-sharing search |
| `pfilter` | `string?` | Pre-filter string |
| `explain` | `string?` | Debug explain mode |
| `tab` | `string?` | Active search tab |
| `originalNLSquery` | `string?` | Original natural language query |
| `isNLS` | `boolean?` | Natural language search flag |
| `mode` | `string?` | Search mode |
| `isCDSearch` | `boolean?` | Combined digital search flag |
| `pcAvailability` | `boolean?` | Primo Central availability check |
| `searchInFulltextUserSelection` | `boolean?` | Full-text search user preference |
| `newspapersSearch` | `boolean?` | Newspaper-specific search |
| `citationTrailFilterByAvailability` | `boolean?` | Filter citation trail by availability |
| `isRAsearch` | `boolean?` | Research Assistant search |
| `isNaturalLanguageSearch` | `boolean?` | NLS flag (alternative) |
| `featuredNewspapersIssnList` | `string?` | Featured newspaper ISSNs |
| `journals` | `string?` | Journal filter |
| `databases` | `string?` | Database filter |
| `entityName` | `string?` | Named entity filter |
| `lang` | `string?` | Language filter |
| `browseField` | `string?` | Browse field identifier |
| `fn` | `string?` | Function identifier |
| `searchWord` | `string?` | Browse search word |
| `browseParams` | `string?` | Additional browse parameters |
| `isRelatedItems` | `boolean?` | Related items search flag |
| `analyticAction` | `string?` | Analytics event identifier |

#### `SearchParamsWithStrParams`

Same as `SearchParams` but `qInclude`, `qExclude`, and `multiFacets` are pre-serialised as pipe-delimited strings instead of arrays. Used internally when constructing URL query strings.

```typescript
type SearchParamsWithStrParams = Omit<SearchParams, 'qInclude' | 'qExclude' | 'multiFacets'> & {
  qInclude?: string;
  qExclude?: string;
  multiFacets?: string;
}
```

#### `SearchData` / `SearchMetaData`

`SearchData` is the full response returned by the search API.
`SearchMetaData` is `SearchData` without the `docs` array (i.e. `Omit<SearchData, 'docs'>`).

| Field | Type | Description |
|---|---|---|
| `beaconO22` | `string` | Beacon identifier |
| `info` | `Info` | Totals, pagination info |
| `highlights` | `Highlights` | Highlighted term fragments |
| `docs` | `Doc[]` | Array of result documents |
| `facets` | `Facet[]?` | Available facet groups |
| `timelog` | `Timelog` | Server-side performance timings |
| `did_u_mean` | `string?` | Spelling suggestion |
| `expandedSearchAfterZeroResults` | `boolean?` | Search was expanded due to zero results |

#### `Info`

Pagination and result-count metadata.

| Field | Type | Description |
|---|---|---|
| `totalResultsLocal` | `number` | Local index result count |
| `totalResultsPC` | `number` | Primo Central result count |
| `total` | `number` | Combined total |
| `first` | `number` | Index of first returned result |
| `last` | `number` | Index of last returned result |
| `explain` | `Explain` | Error/debug messages |
| `browseGap` | `number?` | Gap for browse navigation |
| `hasMoreResults` | `boolean?` | More results beyond `last` |

#### `Facet` / `FacetValue`

```typescript
interface Facet {
  name:   string;       // e.g. 'rtype', 'creator', 'lang'
  values: FacetValue[];
}

interface FacetValue {
  value:        string;
  count:        number;
  mergedLabel?: string[];
  deiData?:     DeiData;   // Diversity, Equity & Inclusion metadata
}

interface DeiData {
  isDei?:   boolean;
  deiNote?: SafeHtml;
}
```

#### `Doc`

A single search result entity. This is the main object you work with when reading results from the store.

| Field | Type | Description |
|---|---|---|
| `@id` | `string` | Unique entity ID (used as store key) |
| `context` | `Context` | Record context (`L`, `PC`, `SP`, `U`, `NP`) |
| `adaptor` | `Adaptor` | Backend adaptor that produced this record |
| `pnx` | `Pnx` | Normalised record data |
| `extras` | `Extras?` | Citation trail and times-cited data |
| `enrichment` | `Enrichment?` | Virtual-browse enrichment |
| `thumbnailForCD` | `ThumbnailForCD?` | Combined digital thumbnail info |
| `unpaywallStatus` | `LoadingStatus?` | Async load status of Unpaywall links |
| `delivery` | `DocDelivery?` | Delivery/availability data |
| `expired` | `boolean?` | Whether the record is expired |
| `origRecordId` | `string?` | Original record ID before de-duplication |

#### `Context` (enum)

| Value | Description |
|---|---|
| `L` | Local index |
| `PC` | Primo Central |
| `SP` | SP adaptor |
| `U` | Unified |
| `NP` | Newspapers |

#### `Adaptor` (enum)

| Value | Description |
|---|---|
| `LocalSearchEngine` | Local Search Engine |
| `PrimoCentral` | Primo Central |
| `PrimoVEDeepSearch` | Primo VE Deep Search |
| `EbscoLocal` | EBSCO local connector |
| `WorldCatLocal` | WorldCat local connector |
| `SummonLocal` | Summon local connector |
| `SearchWebhook` | Search webhook adaptor |
| `WebHook` | Generic webhook adaptor |

#### `Pnx`

Normalised record data structure. Most fields are string-array dictionaries to accommodate multi-valued MARC fields.

| Field | Type | Description |
|---|---|---|
| `display` | `{ [key: string]: string[] }` | Display fields (title, creator, description, …) |
| `control` | `Control` | Identifiers and system-level control fields |
| `addata` | `{ [key: string]: string[] }` | OpenURL/citation metadata |
| `sort` | `Sort` | Sortable field values |
| `facets` | `{ [key: string]: string[] }` | Facet field values |
| `links` | `Links?` | URLs (full text, thumbnail, OpenURL, …) |
| `search` | `Search?` | Searchable field copies |
| `delivery` | `PnxDelivery?` | Lightweight delivery info (full delivery is on `Doc.delivery`) |

#### `Control`

| Field | Type |
|---|---|
| `sourcerecordid` | `string[]` |
| `recordid` | `string[]` |
| `sourceid` | `string[] \| string` |
| `originalsourceid` | `string[]` |
| `sourcesystem` | `Sourcesystem[]` |
| `sourceformat` | `Sourceformat[]` |
| `score` | `Array<number \| string>` |
| `isDedup` | `boolean?` |
| `recordtype` | `string[]?` |
| `sourcetype` | `string[]?` |
| `addsrcrecordid` | `string[]?` |
| `pqid` | `string[]?` |
| `jstorid` | `string[]?` |
| `galeid` | `string[]?` |
| `gtiid` | `string[]?` |
| `attribute` | `string[]?` |
| `rapidosourcerecordid` | `string[]?` |
| `networklinkedrecordid` | `string[]?` |
| `colldiscovery` | `string[]?` |
| `save_score` | `number[]?` |

#### `Links`

| Field | Type |
|---|---|
| `openurl` | `string[]` |
| `thumbnail` | `string[]` |
| `linktohtml` | `string[]` |
| `openurlfulltext` | `string[]` |
| `linktorsrc` | `string[]?` |
| `linktopdf` | `string[]?` |
| `docinsights` | `string[]?` |
| `backlink` | `string[]?` |
| `linktorsrcadditional` | `string[]?` |
| `openurladditional` | `string[]?` |
| `unpaywalllink` | `string[]?` |

#### `Sort`

| Field | Type |
|---|---|
| `title` | `string[]` |
| `creationdate` | `string[]` |
| `author` | `string[]?` |

#### `Search`

| Field | Type |
|---|---|
| `recordid` | `string[]` |
| `issn` | `string[]` |
| `isbn` | `string[]` |
| `title` | `string[]` |
| `creatorcontrib` | `string[]` |

#### `PnxDelivery`

| Field | Type |
|---|---|
| `fulltext` | `string[]` |
| `delcategory` | `string[]` |
| `availabilityLinkUrl` | `string` |

#### `Sourceformat` (enum)

| Value |
|---|
| `Marc21` = `'MARC21'` |
| `XML` = `'XML'` |
| `ESPLORO` = `'ESPLORO'` |

#### `Sourcesystem` (enum)

| Value |
|---|
| `Ils` = `'ILS'` |
| `Other` = `'Other'` |

---

#### `DocDelivery`

Full delivery/availability record attached to each `Doc` after the delivery enrichment effect runs.

| Field | Type | Description |
|---|---|---|
| `deliveryCategory` | `string[]` | Delivery categories (e.g. `'Alma-E'`) |
| `availability` | `string[]` | Raw availability strings |
| `displayedAvailability` | `string` | Human-readable availability label |
| `displayLocation` | `boolean` | Whether to display location info |
| `additionalLocations` | `boolean` | Whether additional locations exist |
| `physicalItemTextCodes` | `string` | Physical item text code |
| `feDisplayOtherLocations` | `boolean` | Feature flag for "other locations" panel |
| `almaOpenurl` | `string` | OpenURL for Alma |
| `recordInstitutionCode` | `string` | Owning institution code |
| `sharedDigitalCandidates` | `string[]` | CDL candidate identifiers |
| `hideResourceSharing` | `boolean` | Suppress resource-sharing links |
| `GetIt1` | `GetIt1[]` | GetIt link categories |
| `link` | `DeliveryLink[]?` | Additional delivery links |
| `availabilityLinks` | `string[]?` | Availability link labels |
| `availabilityLinksUrl` | `string[]?` | Availability link URLs |
| `holding` | `Location[]?` | Physical holding locations |
| `bestlocation` | `Location?` | Best/primary holding location |
| `electronicServices` | `ElectronicService[]?` | Electronic access services |
| `additionalElectronicServices` | `AdditionalElectronicService?` | Categorised additional services |
| `hasD` | `boolean?` | Has digital representation |
| `digitalAuxiliaryMode` | `boolean?` | Digital auxiliary viewer mode |
| `serviceMode` | `string[]?` | Service mode codes |
| `consolidatedCoverage` | `string?` | Coverage summary string |
| `isFilteredHoldings` | `boolean?` | Holdings filtered by policy |
| `physicalServiceId` | `string?` | Physical service identifier |
| `recordOwner` | `string?` | Record owner code |
| `almaInstitutionsList` | `AlmaInstitutionsList[]?` | Network Zone institution list |
| `filteredByGroupServices` | `GroupServices[]?` | Group-filtered services |
| `hasFilteredServices` | `string?` | Flag for filtered services |
| `electronicContextObjectId` | `string?` | Electronic context object ID |
| `mayAlsoBeFoundAt` | `MayAlsoBeFoundAtItem[]?` | Cross-institution availability |

---

#### Delivery sub-types

##### `Location`

Physical holding location.

| Field | Type |
|---|---|
| `organization` | `string` |
| `libraryCode` | `string` |
| `mainLocation` | `string` |
| `subLocation` | `string` |
| `subLocationCode` | `string` |
| `callNumber` | `string` |
| `availabilityStatus` | `string` |
| `holdId` | `string` |
| `holKey` | `string` |
| `uniqId` | `string` |
| `ilsApiId` | `string?` |
| `isValidUser` | `boolean?` |
| `matchForHoldings` | `MatchForHolding[]?` |
| `stackMapUrl` | `string?` |
| `relatedTitle` | `string?` |

##### `MatchForHolding`

| Field | Type |
|---|---|
| `matchOn` | `string` |
| `holdingRecord` | `string` |

##### `ElectronicService`

One electronic access option (full text, open access, etc.).

| Field | Type |
|---|---|
| `adaptorid` | `string` |
| `ilsApiId` | `string` |
| `serviceUrl` | `string` |
| `licenceExist` | `string` |
| `packageName` | `string` |
| `availiability` | `string` |
| `authNote` | `string` |
| `publicNote` | `string` |
| `hasAccess` | `boolean` |
| `serviceType` | `string` |
| `registrationRequired` | `boolean` |
| `numberOfFiles` | `number` |
| `cdlItemAvailable` | `boolean` |
| `cdl` | `boolean` |
| `parsedAvailability` | `string[]` |
| `licenceUrl` | `string` |
| `relatedTitle` | `string` |
| `serviceDescription` | `string?` |
| `deniedNote` | `string?` |
| `fileType` | `string?` |
| `firstFileSize` | `string?` |
| `representationEntityType` | `string?` |
| `contextServiceId` | `string?` |
| `publicAccessModel` | `string?` |
| `representationViewerServiceCode` | `string?` |
| `fromNetwork` | `boolean?` |
| `filteredByAfGroups` | `string?` |
| `supported` | `boolean?` |

##### `AdditionalElectronicService`

Categorised groups of additional electronic services.

| Field | Type |
|---|---|
| `OpenURL` | `ElectronicService[]` |
| `LinktorsrcOA` | `ElectronicService[]` |
| `LinktorsrcNonOA` | `ElectronicService[]` |
| `RelatedServices` | `ElectronicService[]` |

##### `GetIt1` / `GetItLinks`

```typescript
interface GetIt1 {
  category: string;
  links: GetItLinks[];
}

interface GetItLinks {
  '@id': string;
  adaptorid: string;
  displayText: string | null;
  getItTabText: string;
  ilsApiId: string;
  inst4opac: string;
  isLinktoOnline: boolean;
  link: string;
}
```

##### `DeliveryLink`

| Field | Type |
|---|---|
| `displayLabel` | `string?` |
| `linkType` | `string?` |
| `linkURL` | `string?` |
| `@id` | `string?` |
| `publicNote` | `string?` |

##### `AlmaInstitutionsList`

| Field | Type |
|---|---|
| `availabilityStatus` | `string` |
| `envURL` | `string` |
| `instCode` | `string` |
| `instId` | `string` |
| `instName` | `string` |
| `getitLink` | `getitLink[]` |

##### `getitLink`

| Field | Type |
|---|---|
| `linkRecordId` | `string` |
| `displayText` | `string` |

##### `GroupServices`

| Field | Type |
|---|---|
| `unitName` | `string` |
| `unitType` | `string` |
| `services` | `ElectronicService[]` |
| `serviceStatus` | `LoadingStatus?` |

##### `MayAlsoBeFoundAtItem`

| Field | Type |
|---|---|
| `code` | `string` |
| `displayLabel` | `string` |
| `additionalLabel` | `string` |
| `linkType` | `string` |
| `linkURL` | `string` |
| `computedDisplayLabel` | `string` |
| `computedDisplayWords` | `string[]` |

##### `ThumbnailForCD`

| Field | Type |
|---|---|
| `link` | `DeliveryLink[]?` |
| `hasD` | `boolean?` |

##### `IEDeliveryRecord`

| Field | Type |
|---|---|
| `recId` | `string` |
| `sharedDigitalCandidates` | `string[] \| null` |

##### `MergedDelivery`

| Field | Type |
|---|---|
| `docDelivery` | `DocDelivery` |
| `recordId` | `string` |

---

#### Search result sub-types

##### `Highlights`

Highlighted term fragments returned for each field.

| Field | Type |
|---|---|
| `general` | `string[]` |
| `creator` | `string[]` |
| `contributor` | `string[]` |
| `subject` | `string[]` |
| `title` | `string[]` |
| `addtitle` | `string[]` |
| `alttitle` | `string[]` |
| `vertitle` | `string[]` |
| `termsUnion` | `string[]` |
| `snippet` | `string[]` |

##### `Timelog`

Server-side performance timings (all values are strings or numbers from the API).

| Field | Type |
|---|---|
| `BUILD_RESULTS_RETRIVE_FROM_DB` | `string` |
| `CALL_SOLR_GET_IDS_LIST` | `string` |
| `RETRIVE_FROM_DB_COURSE_INFO` | `string` |
| `RETRIVE_FROM_DB_RECORDS` | `string` |
| `RETRIVE_FROM_DB_RELATIONS` | `string` |
| `PRIMA_LOCAL_INFO_FACETS_BUILD_DOCS_HIGHLIGHTS` | `string` |
| `PRIMA_LOCAL_SEARCH_TOTAL` | `string` |
| `PC_SEARCH_CALL_TIME` | `string` |
| `PC_BUILD_JSON_AND_HIGLIGHTS` | `string` |
| `PC_SEARCH_TIME_TOTAL` | `string` |
| `BUILD_BLEND_AND_CACHE_RESULTS` | `number` |
| `BUILD_COMBINED_RESULTS_MAP` | `number` |
| `COMBINED_SEARCH_TIME` | `number` |
| `PROCESS_COMBINED_RESULTS` | `number` |
| `FEATURED_SEARCH_TIME` | `number` |

##### `Explain`

| Field | Type |
|---|---|
| `errorMessages` | `string[]` |

##### `FullDisplayQueryParams`

URL query parameters for the full-display route.

| Field | Type |
|---|---|
| `docid` | `string` |
| `context` | `Context?` |
| `adaptor` | `Adaptor?` |
| `isFrbr` | `boolean?` |
| `search_scope` | `string?` |
| `isHighlightedRecord` | `boolean?` |
| `tab` | `string?` |
| `vid` | `string?` |
| `state` | `string?` |
| `lang` | `string?` |
| `newspapersSearch` | `boolean?` |

##### `FullDisplayParams`

Internal params for loading a full-display record.

| Field | Type |
|---|---|
| `docid` | `string` |
| `context` | `Context?` |
| `adaptor` | `Adaptor?` |
| `isFrbr` | `boolean?` |
| `scope` | `string?` |
| `isHighlightedRecord` | `boolean?` |

##### `RecordMainDetailsIfc`

| Field | Type |
|---|---|
| `pnx` | `Pnx` |

##### `Facets`

Top-level wrapper returned by the facets API endpoint.

| Field | Type |
|---|---|
| `beaconO22` | `string` |
| `facets` | `Facet[]` |

##### `TopBarSelectedFilter`

A filter chip shown in the search top bar.

| Field | Type |
|---|---|
| `value` | `string` |
| `filterType` | `string?` |
| `mergedLabel` | `string[] \| undefined` |

---

#### Enrichment & citation types

##### `Enrichment`

| Field | Type |
|---|---|
| `virtualBrowseObject` | `VirtualBrowseObject` |
| `bibVirtualBrowseObject` | `VirtualBrowseObject` |

##### `VirtualBrowseObject`

| Field | Type |
|---|---|
| `isVirtualBrowseEnabled` | `boolean` |
| `callNumber` | `string` |
| `callNumberBrowseField` | `string` |

##### `Extras`

| Field | Type |
|---|---|
| `citationTrails` | `CitationTrails` |
| `timesCited` | `TimesCited` |

##### `CitationTrails`

| Field | Type |
|---|---|
| `citing` | `string[]` |
| `citedby` | `string[]` |

##### `CitationTrailsTile`

| Field | Type |
|---|---|
| `recordId` | `string` |
| `title` | `string` |
| `author` | `string` |
| `type` | `string` |
| `frbrgroupid` | `string` |
| `seed_id` | `string` |

##### `SeedsInfo`

| Field | Type |
|---|---|
| `citationType` | `string` |
| `creator` | `string[]` |
| `frbrGroupId` | `string` |
| `pnxId` | `string` |
| `title` | `string` |

##### `TimesCited`

| Field | Type |
|---|---|
| `scopus` | `Scopus?` |
| `wos` | `WebOfScience?` |

##### `Scopus`

| Field | Type |
|---|---|
| `citedRedId` | `string?` |
| `extensionVal` | `string?` |

##### `WebOfScience`

| Field | Type |
|---|---|
| `citedRedId` | `string?` |
| `extensionVal` | `string?` |
| `wosFinalLink` | `string?` |

##### `CitationType` (enum)

| Value |
|---|
| `CITING` = `'citing'` |
| `CITEDBY` = `'citedby'` |

---

#### Utility map types

```typescript
type stringBoolean = 'N' | 'Y';

type IgnoreMapSimpleString  = { [key: string]: string };
type IgnoreMapSimpleBoolean = { [key: string]: boolean };
type IgnoreMapMulti         = { [key: string]: number | string | string[] | undefined | null };

type SearchMetaData = Omit<SearchData, 'docs'>;
```

Constant exported from `search.model.ts`:

```typescript
const SUPPORTED_ELECTRONIC_TYPES_FOR_DIGITAL_VIEWER =
  ['jpg', 'tif', 'tiff', 'gif', 'png', 'pdf', 'jp2', 'jpeg'];
```

---

### Filter types

Defined in `src/models/filter.model.ts`.

#### `FilterState`

| Field | Type | Description |
|---|---|---|
| `status` | `LoadingStatus` | Current load status of the filter slice |
| `isRememberAll` | `boolean` | Whether "Remember All" is toggled on |
| `previousSearchQuery` | `{ searchTerm: string \| undefined; scope: string \| undefined }` | Last search term and scope before filter change |
| `includedFilter` | `selectedFilters[] \| null` | Active include facet filters |
| `excludedFilter` | `selectedFilters[] \| null` | Active exclude facet filters |
| `multiSelectedFilter` | `MultiSelectedFilter[] \| null` | Multi-select facet filters |
| `resourceTypeFilter` | `ResourceTypeFilterModel \| null` | Active resource-type filter |
| `isFiltersOpen` | `boolean` | Whether the filter panel is open |

#### `selectedFilters`

| Field | Type |
|---|---|
| `name` | `string` |
| `values` | `string[]` |

#### `MultiSelectedFilter`

| Field | Type |
|---|---|
| `name` | `string` |
| `values` | `MultiSelectedFilterValue[]` |

#### `MultiSelectedFilterValue`

| Field | Type |
|---|---|
| `value` | `string` |
| `filterType` | `FilterType` |

#### `FilterType` (enum)

| Value |
|---|
| `Include` = `'include'` |
| `Exclude` = `'exclude'` |

#### `ResourceTypeFilterModel`

| Field | Type |
|---|---|
| `resourceType` | `string` |
| `count` | `number` |

---

## Actions reference

All action creators are exported from the package root:

```typescript
import { searchAction, loadFiltersAction, setDecodedJwt } from '@libis/primo-shared-state';
```

### Search actions

| Creator | Action type | Props |
|---|---|---|
| `searchAction` | `[Search] Load search` | `{ searchParams: SearchParams; searchType?: string }` |
| `searchSuccessAction` | `[Search] Load search success` | `{ searchResultsData: SearchData }` |
| `searchFailedAction` | `[Search] Load search failed` | — |
| `clearSearchAction` | `[Search] clear search` | — |
| `pageLimitChangedAction` | `[Search] Page Limit Changed` | `{ limit: number }` |
| `pageNumberChangedAction` | `[Search] Page Number Changed` | `{ pageNumber: number }` |
| `sortByChangedAction` | `[search] Sort By Changed` ¹ | `{ sort: string }` |
| `fetchUnpaywallLinksAction` | `[Search] Fetch unpaywall links` | `{ recordsToUpdate: Doc[] }` |
| `updateIsSavedSearch` | `[Search] Update Is Saved Search` | `{ isSavedSearch: boolean }` |
| `setSearchNotificationMsg` | `[search] Set Search Notification Message` ¹ | `{ msg: string }` |
| `saveCurrentSearchTermAction` | `[Search] save current search term` | `{ searchTerm: string }` |

¹ Note: action type string uses lowercase `[search]`, not `[Search]` — match exactly when using `ofType`.

### Filter actions

| Creator | Action type | Props |
|---|---|---|
| `loadFiltersAction` | `[Filter] Load Filter` | `{ searchParams: SearchParams }` |
| `filtersSuccessAction` | `[Filter] Load Filter Success` | `{ filters: Facet[] }` |
| `filterFailedAction` | `[Filter] Load Filter Failed` | — |
| `updateSortByParam` | `[Filter] Update Sort By Param` | `{ sort: string }` |

### User actions

| Creator | Action type | Props |
|---|---|---|
| `setDecodedJwt` | `[User] Set Decoded Jwt` | `{ decodedJwt: DecodedJwt }` |
| `resetJwtAction` | `[User] reset jwt` | `{ logoutReason: LogoutReason; url?: string }` |
| `loadUserSettingsSuccessAction` | `[User-Settings] save user settings` | `{ userSettings: UserSettings; isNewSession: boolean }` |
| `resetUserSettingsSuccessAction` | `[User-Settings] reset user settings success` | — |
| `doneChangeUserSettingsLanguageAction` | `[User-Settings] Done Change User Settings Language` | `{ value: string }` |
| `doneSaveHistoryToggleAction` | `[User-Settings] Done Update Save history toggle` | `{ value: string }` |
| `doneUseHistoryToggleAction` | `[User-Settings] Done Update Use history toggle` | `{ value: string }` |
| `doneAutoExtendMySessionToggleAction` | `[User-Settings] Done Update Auto Extend My Session toggle` | `{ value: string }` |
| `setLoginFromStateAction` | `[User-Settings] set login from state` | `{ value: string }` |
| `changeRaSaveSearchDoneAction` | `[User-settings] dont update research-Assistant save search toggle` | `{ value: string }` |
| `resetLogoutReason` | `[User-Settings] reset logout reason` | — |

---

## Troubleshooting

### `NullInjectorError: No provider for Store`
The remote module is loading before the host has bootstrapped. Ensure lazy-loaded remote modules are only instantiated after the host's `StoreModule.forRoot()` runs.

### `Cannot read properties of undefined (reading 'user')`
The host store state slice is not yet populated. Use `selectIsLoggedIn$()` as a guard or wait for `status !== 'pending'` before reading.

### Version mismatch errors at runtime
`@angular/core`, `@ngrx/store`, and `rxjs` **must** resolve to a single shared instance. Confirm they are listed as singletons in both the host's and remote's webpack sharing config.

### Signal methods throw `NG0203` (must be called in injection context)
`toSignal` requires an injection context. Signal methods called inside a constructor (or `providedIn: 'root'` service constructor) are fine. If you call them inside a method body, wrap with `runInInjectionContext`.

---

## Versioning

Bump `version` in `package.json` before every `npm pack`:

```bash
npm version patch   # 1.0.0 → 1.0.1  (bug fixes)
npm version minor   # 1.0.0 → 1.1.0  (new methods, backward-compatible)
npm version major   # 1.0.0 → 2.0.0  (breaking changes)
npm run build
npm pack
```

## License

MIT
