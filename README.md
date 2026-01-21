# @libis/primo-shared

Shared state models and services for Primo module federation architecture. This package provides TypeScript interfaces and Angular services to access NgRx state shared between the host application and module federation clients.

## Features

- **Type-safe models** - Complete TypeScript interfaces for all state entities
- **Service-based access** - Angular services for reading/writing to NgRx store
- **Module federation ready** - Designed for use in remote/client applications
- **Observable-based** - RxJS Observable streams and snapshot methods
- **Zero runtime overhead** - Only exports types and thin wrappers

## Installation

```bash
npm install @libis/primo-shared
```

## Peer Dependencies

This package requires:
- Angular 16+ (`@angular/core`, `@angular/common`, `@angular/platform-browser`)
- NgRx Store 16+ (`@ngrx/store`)
- RxJS 7+

## Usage

### 1. Import in your Module Federation Client

```typescript
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [
    // The Store should already be initialized in the host app
    // No need to call StoreModule.forRoot() in the client
  ]
})
export class RemoteAppModule { }
```

### 2. Use State Services in Components

#### Reading User State

```typescript
import { Component, OnInit } from '@angular/core';
import { UserStateService } from '@libis/primo-shared';

@Component({
  selector: 'app-user-info',
  template: `
    <div *ngIf="isLoggedIn$ | async">
      <p>Welcome, {{ userName$ | async }}!</p>
      <p>User Group: {{ userGroup$ | async }}</p>
    </div>
  `
})
export class UserInfoComponent implements OnInit {
  isLoggedIn$ = this.userState.selectIsLoggedIn$();
  userName$ = this.userState.selectUserName$();
  userGroup$ = this.userState.selectUserGroup$();

  constructor(private userState: UserStateService) {}

  async ngOnInit() {
    // Get snapshot values
    const jwt = await this.userState.getJwt();
    const settings = await this.userState.getUserSettings();
    console.log('JWT:', jwt);
    console.log('Settings:', settings);
  }
}
```

#### Reading Search State

```typescript
import { Component, OnInit } from '@angular/core';
import { SearchStateService, Doc } from '@libis/primo-shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-results',
  template: `
    <div *ngIf="isLoading$ | async">Loading...</div>

    <div *ngFor="let doc of docs$ | async">
      <h3>{{ doc.pnx.display.title?.[0] }}</h3>
      <p>{{ doc.pnx.display.creator?.[0] }}</p>
    </div>

    <p>Total Results: {{ totalResults$ | async }}</p>
  `
})
export class SearchResultsComponent implements OnInit {
  docs$: Observable<Doc[]>;
  isLoading$: Observable<boolean>;
  totalResults$: Observable<number>;

  constructor(private searchState: SearchStateService) {
    this.docs$ = this.searchState.selectAllDocs$();
    this.isLoading$ = this.searchState.selectIsLoading$();
    this.totalResults$ = this.searchState.selectTotalResults$();
  }

  async ngOnInit() {
    // Get current search parameters
    const params = await this.searchState.getSearchParams();
    console.log('Search params:', params);

    // Get a specific document
    const doc = await this.searchState.getDocById('some-doc-id');
    console.log('Document:', doc);
  }
}
```

#### Reading Filter State

```typescript
import { Component } from '@angular/core';
import { FilterStateService } from '@libis/primo-shared';

@Component({
  selector: 'app-filter-panel',
  template: `
    <div>
      <h3>Applied Filters</h3>
      <div *ngFor="let filter of includedFilters$ | async">
        <strong>{{ filter.name }}:</strong>
        <span *ngFor="let value of filter.values">{{ value }}</span>
      </div>
    </div>
  `
})
export class FilterPanelComponent {
  includedFilters$ = this.filterState.selectIncludedFilters$();
  excludedFilters$ = this.filterState.selectExcludedFilters$();
  isFiltersOpen$ = this.filterState.selectIsFiltersOpen$();

  constructor(private filterState: FilterStateService) {}

  async logFilters() {
    const included = await this.filterState.getIncludedFilters();
    const excluded = await this.filterState.getExcludedFilters();
    console.log('Included:', included);
    console.log('Excluded:', excluded);
  }
}
```

### 3. Dispatching Actions

To update the store, you need to dispatch actions from the host app. Import action creators from the host:

```typescript
import { Component } from '@angular/core';
import { UserStateService } from '@libis/primo-shared';
// Import actions from host app (adjust path as needed)
import * as UserActions from '../../../host-app/state/user/user.actions';

@Component({
  selector: 'app-logout',
  template: `<button (click)="logout()">Logout</button>`
})
export class LogoutComponent {
  constructor(private userState: UserStateService) {}

  logout() {
    // Dispatch action from host
    this.userState.dispatch(
      UserActions.resetJwtAction({ logoutReason: 'user' })
    );
  }
}
```

### 4. Using Models Directly

All TypeScript interfaces are exported for type safety:

```typescript
import {
  Doc,
  SearchParams,
  UserSettings,
  DecodedJwt,
  FilterState,
  LoadingStatus
} from '@libis/primo-shared';

function processDocument(doc: Doc) {
  const title = doc.pnx.display.title?.[0];
  const creator = doc.pnx.display.creator?.[0];
  // Full type safety for all properties
}

function buildSearchParams(): SearchParams {
  return {
    q: 'search term',
    scope: 'Everything',
    limit: 10,
    offset: 0
  };
}
```

## API Reference

### Services

#### `UserStateService`

| Method | Return Type | Description |
|--------|-------------|-------------|
| `selectUserState$()` | `Observable<UserState>` | Complete user state |
| `selectJwt$()` | `Observable<string \| undefined>` | JWT token |
| `selectDecodedJwt$()` | `Observable<DecodedJwt \| undefined>` | Decoded JWT |
| `selectIsLoggedIn$()` | `Observable<boolean>` | Login status |
| `selectUserSettings$()` | `Observable<UserSettings \| undefined>` | User settings |
| `selectUserName$()` | `Observable<string \| undefined>` | User name |
| `selectUserGroup$()` | `Observable<string>` | User group |
| `getJwt()` | `Promise<string \| undefined>` | JWT snapshot |
| `isLoggedIn()` | `Promise<boolean>` | Login status snapshot |
| `getUserSettings()` | `Promise<UserSettings \| undefined>` | Settings snapshot |
| `dispatch(action)` | `void` | Dispatch action |

#### `SearchStateService`

| Method | Return Type | Description |
|--------|-------------|-------------|
| `selectAllDocs$()` | `Observable<Doc[]>` | All search documents |
| `selectDocById$(id)` | `Observable<Doc \| undefined>` | Specific document |
| `selectSearchParams$()` | `Observable<SearchParams \| null>` | Search parameters |
| `selectSearchMetaData$()` | `Observable<SearchMetaData \| null>` | Search metadata |
| `selectSearchStatus$()` | `Observable<LoadingStatus>` | Loading status |
| `selectTotalResults$()` | `Observable<number>` | Total result count |
| `selectPageSize$()` | `Observable<number \| null>` | Page size |
| `selectIsLoading$()` | `Observable<boolean>` | Loading state |
| `getAllDocs()` | `Promise<Doc[]>` | Documents snapshot |
| `getDocById(id)` | `Promise<Doc \| undefined>` | Document snapshot |
| `getSearchParams()` | `Promise<SearchParams \| null>` | Params snapshot |
| `dispatch(action)` | `void` | Dispatch action |

#### `FilterStateService`

| Method | Return Type | Description |
|--------|-------------|-------------|
| `selectFilterState$()` | `Observable<FilterState>` | Complete filter state |
| `selectIncludedFilters$()` | `Observable<selectedFilters[] \| null>` | Included filters |
| `selectExcludedFilters$()` | `Observable<selectedFilters[] \| null>` | Excluded filters |
| `selectMultiSelectedFilters$()` | `Observable<MultiSelectedFilter[] \| null>` | Multi-select filters |
| `selectResourceTypeFilter$()` | `Observable<ResourceTypeFilterModel \| null>` | Resource type filter |
| `selectIsFiltersOpen$()` | `Observable<boolean>` | Filter panel state |
| `selectIsRememberAll$()` | `Observable<boolean>` | Remember all setting |
| `getIncludedFilters()` | `Promise<selectedFilters[] \| null>` | Included snapshot |
| `getExcludedFilters()` | `Promise<selectedFilters[] \| null>` | Excluded snapshot |
| `getMultiSelectedFilters()` | `Promise<MultiSelectedFilter[] \| null>` | Multi-select snapshot |
| `dispatch(action)` | `void` | Dispatch action |

### Key Models

#### `Doc` - Search Document
Complete search result document with PNX data, delivery info, and metadata.

#### `SearchParams` - Search Parameters
Query parameters for search operations including filters, pagination, and sorting.

#### `UserState` - User State
Authentication state including JWT, decoded token, login status, and settings.

#### `FilterState` - Filter State
Applied filters including include/exclude filters and resource type selections.

#### `LoadingStatus`
Type: `'pending' | 'loading' | 'success' | 'fail'`

## Module Federation Configuration

### Host Application
Share the NgRx store in your `webpack.config.js`:

```javascript
shared: {
  '@ngrx/store': { singleton: true, strictVersion: true },
  '@libis/primo-shared': { singleton: true }
}
```

### Remote/Client Application
Consume the shared store:

```javascript
shared: {
  '@ngrx/store': { singleton: true, strictVersion: true },
  '@libis/primo-shared': { singleton: true }
}
```

## Development

### Building the Package

```bash
npm install
npm run build
```

### Publishing

```bash
# Update version in package.json first
npm version patch  # or minor, major
npm publish
```

### Local Development

Link the package locally for testing:

```bash
# In this package directory
npm link

# In your client application
npm link @libis/primo-shared
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  }
}
```

## Best Practices

1. **Read-only in Clients** - Remote apps should primarily read state, not write
2. **Use Observables** - Prefer `select*$()` methods for reactive updates
3. **Snapshots for Logic** - Use `get*()` methods for one-time values in logic
4. **Type Safety** - Import and use the TypeScript interfaces
5. **Action Coordination** - Coordinate state updates through the host app

## Troubleshooting

### "Cannot read property 'user' of undefined"
The store may not be initialized. Ensure the host app has initialized the store before the remote app loads.

### "No provider for Store"
Make sure `StoreModule` is imported in your module and the host shares the store.

### Type Errors
Ensure peer dependencies match the host application versions.

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
