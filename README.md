# @libis/primo-shared-state

Shared state models and Angular services for the Primo module-federation architecture. Remote/client modules use this package to read the host application's NgRx store (user, search, filter slices) and dispatch a curated set of safe actions back to it.

## What's inside

| Layer | Contents |
|---|---|
| **Models** (`src/models/`) | TypeScript interfaces mirroring the host's state shapes: `SearchParams`, `Doc`, `UserState`, `FilterState`, `LoadingStatus`, … |
| **Services** (`src/state/`) | Three `providedIn: 'root'` Angular services — `UserStateService`, `SearchStateService`, `FilterStateService` — each offering Observable streams, one-shot Promise snapshots, Angular Signals, and typed dispatch helpers |
| **Actions** (`src/actions/`) | `shared-actions.ts` — re-exported NgRx action creators whose `type` strings match the host's reducers **byte-for-byte** |
| **Utility** (`src/utils/`) | `StateHelper` — thin wrapper around `Store` used internally by all services |

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
cp libis-primo-shared-state-1.0.0.tgz path/to/NDE_customModule_LIBISstyle/nde/
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

### Step 4 — declare the package as a **singleton shared** in `webpack.config.js`

The remote must consume the same singleton instances of Angular and NgRx that the host already loaded. Add `@libis/primo-shared-state` to the shared map:

```javascript
// webpack.config.js (remote / client)
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'ndeCustomModule',
  exposes: {
    './Module': './src/app/nde/nde.module.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    // Override the shared-state lib to be a singleton but NOT strict —
    // the host owns it; the remote just consumes what the host provides.
    '@libis/primo-shared-state': {
      singleton: true,
      strictVersion: false,
    },
  },
});
```

> **Why `strictVersion: false` for this lib?**
> The tarball version in your remote may lag one patch behind the host copy.
> `strictVersion: false` prevents a runtime version-mismatch error while still
> ensuring only one instance is loaded (from the host).

The host's `webpack.config.js` needs no changes — it already shares Angular and NgRx as singletons.

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

## Key types

```typescript
// Loading status
type LoadingStatus = 'pending' | 'loading' | 'success' | 'fail';

// Logout cause
type LogoutReason = 'user' | 'timeout';

// Decoded JWT payload
interface DecodedJwt {
  userName: string;
  displayName: string;
  userGroup: string;
  onCampus: boolean;
  signedIn: boolean;
  authenticationProfile: string;
  user: string;
}

// User preferences
interface UserSettings {
  resultsBulkSize?: string;
  language?: string;
  saveSearchHistory?: string;
  useSearchHistory?: string;
  autoExtendMySession?: string;
  allowSavingMyResearchAssistanceSearchHistory?: string;
  email?: string;
  [key: string]: string | undefined;
}

// Search parameters (all fields)
interface SearchParams {
  q: string;
  scope: string;
  offset?: number;
  limit?: number;
  sort?: string;
  tab?: string;
  lang?: string;
  // … see search.model.ts for the full list
}
```

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
