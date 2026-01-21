# Usage Examples

## Complete Remote Component Example

Here's a complete example of a remote component that reads from the shared state:

```typescript
// remote-search-widget.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SearchStateService,
  UserStateService,
  FilterStateService,
  Doc,
  SearchParams
} from '@libis/primo-shared';

@Component({
  selector: 'app-remote-search-widget',
  template: `
    <div class="search-widget">
      <!-- User Info -->
      <div class="user-section" *ngIf="isLoggedIn">
        <p>Welcome, {{ userName }}!</p>
        <p>Group: {{ userGroup }}</p>
      </div>

      <!-- Search Results -->
      <div class="results-section">
        <h2>Search Results ({{ totalResults }} found)</h2>

        <div *ngIf="isLoading" class="loading">
          Loading...
        </div>

        <div *ngIf="!isLoading && documents.length > 0">
          <div *ngFor="let doc of documents" class="result-item">
            <h3>{{ getTitle(doc) }}</h3>
            <p class="creator">{{ getCreator(doc) }}</p>
            <p class="type">{{ getResourceType(doc) }}</p>

            <!-- Delivery Info -->
            <div *ngIf="doc.delivery" class="delivery">
              <span *ngFor="let cat of doc.delivery.deliveryCategory">
                {{ cat }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading && documents.length === 0">
          No results found
        </div>
      </div>

      <!-- Active Filters -->
      <div class="filters-section" *ngIf="hasActiveFilters">
        <h3>Active Filters</h3>
        <div *ngFor="let filter of includedFilters">
          <strong>{{ filter.name }}:</strong>
          <span *ngFor="let value of filter.values" class="filter-tag">
            {{ value }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-widget {
      padding: 20px;
    }
    .result-item {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px 0;
    }
    .filter-tag {
      background: #e0e0e0;
      padding: 5px 10px;
      margin: 0 5px;
      border-radius: 3px;
    }
  `]
})
export class RemoteSearchWidgetComponent implements OnInit, OnDestroy {
  // User state
  isLoggedIn = false;
  userName = '';
  userGroup = '';

  // Search state
  documents: Doc[] = [];
  isLoading = false;
  totalResults = 0;
  searchParams: SearchParams | null = null;

  // Filter state
  includedFilters: any[] = [];
  hasActiveFilters = false;

  private destroy$ = new Subject<void>();

  constructor(
    private searchState: SearchStateService,
    private userState: UserStateService,
    private filterState: FilterStateService
  ) {}

  ngOnInit() {
    this.subscribeToUserState();
    this.subscribeToSearchState();
    this.subscribeToFilterState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToUserState() {
    // Login status
    this.userState.selectIsLoggedIn$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });

    // User name
    this.userState.selectUserName$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(userName => {
        this.userName = userName || 'Guest';
      });

    // User group
    this.userState.selectUserGroup$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(group => {
        this.userGroup = group;
      });
  }

  private subscribeToSearchState() {
    // Documents
    this.searchState.selectAllDocs$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(docs => {
        this.documents = docs;
      });

    // Loading status
    this.searchState.selectIsLoading$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Total results
    this.searchState.selectTotalResults$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(total => {
        this.totalResults = total;
      });

    // Search params
    this.searchState.selectSearchParams$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchParams = params;
      });
  }

  private subscribeToFilterState() {
    // Included filters
    this.filterState.selectIncludedFilters$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.includedFilters = filters || [];
        this.hasActiveFilters = this.includedFilters.some(f => f.values.length > 0);
      });
  }

  // Helper methods
  getTitle(doc: Doc): string {
    return doc.pnx.display.title?.[0] || 'No title';
  }

  getCreator(doc: Doc): string {
    return doc.pnx.display.creator?.[0] || 'Unknown';
  }

  getResourceType(doc: Doc): string {
    return doc.pnx.display.type?.[0] || 'Unknown type';
  }
}
```

## Module Configuration

```typescript
// remote-app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

// Services are providedIn: 'root', so no need to add to providers
import { RemoteSearchWidgetComponent } from './remote-search-widget.component';

@NgModule({
  declarations: [
    RemoteSearchWidgetComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  exports: [
    RemoteSearchWidgetComponent
  ]
})
export class RemoteAppModule { }
```

## Advanced: Custom State Reader Service

Create a facade service that combines multiple state sources:

```typescript
// search-facade.service.ts
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SearchStateService,
  UserStateService,
  FilterStateService,
  Doc
} from '@libis/primo-shared';

export interface EnrichedSearchResult {
  documents: Doc[];
  totalResults: number;
  isLoading: boolean;
  isLoggedIn: boolean;
  activeFiltersCount: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchFacadeService {
  constructor(
    private searchState: SearchStateService,
    private userState: UserStateService,
    private filterState: FilterStateService
  ) {}

  getEnrichedSearchResults$(): Observable<EnrichedSearchResult> {
    return combineLatest([
      this.searchState.selectAllDocs$(),
      this.searchState.selectTotalResults$(),
      this.searchState.selectIsLoading$(),
      this.userState.selectIsLoggedIn$(),
      this.filterState.selectIncludedFilters$(),
      this.searchState.selectSearchParams$()
    ]).pipe(
      map(([docs, total, loading, loggedIn, filters, params]) => ({
        documents: docs,
        totalResults: total,
        isLoading: loading,
        isLoggedIn: loggedIn,
        activeFiltersCount: this.countActiveFilters(filters),
        currentPage: this.calculateCurrentPage(params)
      }))
    );
  }

  private countActiveFilters(filters: any[] | null): number {
    if (!filters) return 0;
    return filters.reduce((count, filter) =>
      count + (filter.values?.length || 0), 0
    );
  }

  private calculateCurrentPage(params: any): number {
    if (!params?.offset || !params?.limit) return 1;
    return Math.floor(params.offset / params.limit) + 1;
  }
}

// Usage in component:
@Component({
  selector: 'app-enriched-search',
  template: `
    <div *ngIf="enrichedResults$ | async as results">
      <p>Page {{ results.currentPage }} of {{ results.totalResults }} results</p>
      <p>{{ results.activeFiltersCount }} filters applied</p>
      <div *ngIf="results.isLoggedIn">Personalized for you</div>

      <div *ngFor="let doc of results.documents">
        <!-- Display doc -->
      </div>
    </div>
  `
})
export class EnrichedSearchComponent {
  enrichedResults$ = this.facade.getEnrichedSearchResults$();

  constructor(private facade: SearchFacadeService) {}
}
```

## Working with Delivery Information

```typescript
import { Component, Input } from '@angular/core';
import { Doc, DocDelivery, ElectronicService } from '@libis/primo-shared';

@Component({
  selector: 'app-delivery-info',
  template: `
    <div class="delivery-info" *ngIf="doc.delivery">
      <!-- Availability -->
      <div class="availability">
        <span *ngFor="let avail of doc.delivery.availability">
          {{ avail }}
        </span>
      </div>

      <!-- Electronic Services -->
      <div class="electronic-services"
           *ngIf="doc.delivery.electronicServices?.length">
        <h4>Available Online</h4>
        <div *ngFor="let service of doc.delivery.electronicServices">
          <a [href]="service.serviceUrl" target="_blank">
            {{ service.publicNote || 'Access Online' }}
          </a>
        </div>
      </div>

      <!-- Physical Holdings -->
      <div class="holdings" *ngIf="doc.delivery.holding?.length">
        <h4>Physical Copies</h4>
        <div *ngFor="let location of doc.delivery.holding">
          <p><strong>{{ location.mainLocation }}</strong></p>
          <p>Call Number: {{ location.callNumber }}</p>
          <p>Status: {{ location.availabilityStatus }}</p>
        </div>
      </div>
    </div>
  `
})
export class DeliveryInfoComponent {
  @Input() doc!: Doc;
}
```

## Filtering Documents by Criteria

```typescript
import { Component, OnInit } from '@angular/core';
import { SearchStateService, Doc, Context, Adaptor } from '@libis/primo-shared';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-filtered-results',
  template: `
    <div>
      <h3>Local Results Only</h3>
      <div *ngFor="let doc of localResults$ | async">
        {{ doc.pnx.display.title?.[0] }}
      </div>

      <h3>Primo Central Results</h3>
      <div *ngFor="let doc of centralResults$ | async">
        {{ doc.pnx.display.title?.[0] }}
      </div>

      <h3>Available Online</h3>
      <div *ngFor="let doc of onlineResults$ | async">
        {{ doc.pnx.display.title?.[0] }}
      </div>
    </div>
  `
})
export class FilteredResultsComponent implements OnInit {
  localResults$!: Observable<Doc[]>;
  centralResults$!: Observable<Doc[]>;
  onlineResults$!: Observable<Doc[]>;

  constructor(private searchState: SearchStateService) {}

  ngOnInit() {
    const allDocs$ = this.searchState.selectAllDocs$();

    // Filter by context
    this.localResults$ = allDocs$.pipe(
      map(docs => docs.filter(doc => doc.context === Context.L))
    );

    this.centralResults$ = allDocs$.pipe(
      map(docs => docs.filter(doc =>
        doc.context === Context.PC &&
        doc.adaptor === Adaptor.PrimoCentral
      ))
    );

    // Filter by availability
    this.onlineResults$ = allDocs$.pipe(
      map(docs => docs.filter(doc =>
        doc.delivery?.deliveryCategory?.includes('Alma-E') ||
        doc.delivery?.electronicServices?.length
      ))
    );
  }
}
```

## Monitoring State Changes

```typescript
import { Component, OnInit } from '@angular/core';
import { UserStateService, SearchStateService } from '@libis/primo-shared';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-state-monitor',
  template: `<div>State Monitor - Check console</div>`
})
export class StateMonitorComponent implements OnInit {
  constructor(
    private userState: UserStateService,
    private searchState: SearchStateService
  ) {}

  ngOnInit() {
    // Monitor login/logout
    this.userState.selectIsLoggedIn$()
      .pipe(distinctUntilChanged())
      .subscribe(isLoggedIn => {
        console.log('Login status changed:', isLoggedIn);
        if (isLoggedIn) {
          console.log('User logged in');
        } else {
          console.log('User logged out');
        }
      });

    // Monitor search execution
    this.searchState.selectSearchParams$()
      .pipe(
        filter(params => params !== null),
        distinctUntilChanged((prev, curr) =>
          JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(params => {
        console.log('New search executed:', params);
      });

    // Monitor when search completes
    this.searchState.selectSearchStatus$()
      .pipe(distinctUntilChanged())
      .subscribe(status => {
        if (status === 'success') {
          console.log('Search completed successfully');
        } else if (status === 'fail') {
          console.log('Search failed');
        }
      });
  }
}
```

## Error Handling

```typescript
import { Component } from '@angular/core';
import { SearchStateService } from '@libis/primo-shared';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-safe-search',
  template: `
    <div *ngIf="docs$ | async as docs; else error">
      <div *ngFor="let doc of docs">
        {{ doc.pnx.display.title?.[0] }}
      </div>
    </div>
    <ng-template #error>
      <p>Unable to load search results</p>
    </ng-template>
  `
})
export class SafeSearchComponent {
  docs$ = this.searchState.selectAllDocs$().pipe(
    catchError(error => {
      console.error('Error loading docs:', error);
      return of([]);
    })
  );

  constructor(private searchState: SearchStateService) {}
}
```
