# Quick Start Guide

Get up and running with `@libis/primo-shared-state` in 5 minutes.

## Prerequisites

- Angular 16+ application
- NgRx Store configured in your host application
- Module Federation setup (optional but recommended)

## Installation

```bash
npm install @libis/primo-shared-state
```

## Step 1: Basic Setup

No additional setup required! The services use `providedIn: 'root'` and are automatically available.

## Step 2: Create Your First Component

```typescript
// my-search.component.ts
import { Component } from '@angular/core';
import { SearchStateService } from '@libis/primo-shared-state';

@Component({
  selector: 'app-my-search',
  template: `
    <h2>Search Results</h2>
    <div *ngIf="isLoading$ | async">Loading...</div>
    <div *ngFor="let doc of docs$ | async">
      <h3>{{ doc.pnx.display.title?.[0] }}</h3>
    </div>
  `
})
export class MySearchComponent {
  docs$ = this.searchState.selectAllDocs$();
  isLoading$ = this.searchState.selectIsLoading$();

  constructor(private searchState: SearchStateService) {}
}
```

## Step 3: Add to Your Module

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MySearchComponent } from './my-search.component';

@NgModule({
  declarations: [MySearchComponent],
  imports: [BrowserModule],
  bootstrap: [MySearchComponent]
})
export class AppModule { }
```

## Step 4: Run and Test

```bash
ng serve
```

That's it! Your component now has access to the shared state.

## Common Use Cases

### Show User Info

```typescript
import { Component } from '@angular/core';
import { UserStateService } from '@libis/primo-shared-state';

@Component({
  selector: 'app-user-badge',
  template: `
    <div *ngIf="isLoggedIn$ | async">
      Welcome, {{ userName$ | async }}!
    </div>
  `
})
export class UserBadgeComponent {
  isLoggedIn$ = this.userState.selectIsLoggedIn$();
  userName$ = this.userState.selectUserName$();

  constructor(private userState: UserStateService) {}
}
```

### Display Applied Filters

```typescript
import { Component } from '@angular/core';
import { FilterStateService } from '@libis/primo-shared-state';

@Component({
  selector: 'app-active-filters',
  template: `
    <div *ngFor="let filter of filters$ | async">
      {{ filter.name }}: {{ filter.values.join(', ') }}
    </div>
  `
})
export class ActiveFiltersComponent {
  filters$ = this.filterState.selectIncludedFilters$();

  constructor(private filterState: FilterStateService) {}
}
```

### Get Data Once (Snapshot)

```typescript
import { Component, OnInit } from '@angular/core';
import { SearchStateService } from '@libis/primo-shared-state';

@Component({
  selector: 'app-snapshot-example',
  template: `<div>{{ message }}</div>`
})
export class SnapshotExampleComponent implements OnInit {
  message = '';

  constructor(private searchState: SearchStateService) {}

  async ngOnInit() {
    const params = await this.searchState.getSearchParams();
    this.message = `Current query: ${params?.q || 'none'}`;
  }
}
```

## Next Steps

- Read the full [README.md](README.md) for complete API documentation
- Check out [EXAMPLES.md](EXAMPLES.md) for advanced patterns
- Review the TypeScript types for available properties

## Troubleshooting

### "Cannot read property 'user' of undefined"

Make sure the host application has initialized the NgRx store:

```typescript
// In host app.module.ts
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [
    StoreModule.forRoot({ /* your reducers */ })
  ]
})
export class AppModule { }
```

### Types not available

Make sure TypeScript can find the type definitions:

```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Support

For issues, please check:
1. README.md - Full documentation
2. EXAMPLES.md - Code examples
3. GitHub Issues - Report problems
