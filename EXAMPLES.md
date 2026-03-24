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
} from '@libis/primo-shared-state';

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
} from '@libis/primo-shared-state';

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
import { Doc, DocDelivery, ElectronicService } from '@libis/primo-shared-state';

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
import { SearchStateService, Doc, Context, Adaptor } from '@libis/primo-shared-state';
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
import { UserStateService, SearchStateService } from '@libis/primo-shared-state';
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
import { SearchStateService } from '@libis/primo-shared-state';
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

## Reading View Configuration

Access institutional configuration, feature flags, mapping tables, and scopes — all read-only.

```typescript
import { Component, OnInit } from '@angular/core';
import {
  ViewConfigStateService,
  SystemConfiguration,
  FeatureFlags,
  Scope,
} from '@libis/primo-shared-state';

@Component({
  selector: 'app-config-aware-widget',
  template: `
    <div class="config-widget">
      <p>Institution: {{ institutionCode() }} | VID: {{ vid() }}</p>
      <p>Language: {{ interfaceLanguage() }}</p>

      @if (featureFlags(); as flags) {
        <ul class="flags">
          @for (key of flagKeys(flags); track key) {
            <li>{{ key }}: {{ flags[key] ? 'ON' : 'OFF' }}</li>
          }
        </ul>
      }

      <h4>Available Scopes</h4>
      @for (scope of scopes() ?? []; track scope.scopeName) {
        <span class="scope-chip">{{ scope.scopeDisplayName }}</span>
      }
    </div>
  `
})
export class ConfigAwareWidgetComponent implements OnInit {
  // Signal API — reactive, no subscriptions needed
  institutionCode = this.viewConfig.institutionCodeSignal();
  vid             = this.viewConfig.vidSignal();
  interfaceLanguage = this.viewConfig.interfaceLanguageSignal();
  featureFlags    = this.viewConfig.featureFlagsSignal();
  scopes          = this.viewConfig.scopesSignal();

  constructor(private viewConfig: ViewConfigStateService) {}

  async ngOnInit() {
    // Promise API — useful for one-time init logic
    const sysConfig = await this.viewConfig.getSystemConfiguration();
    if (sysConfig) {
      console.log('Search engine:', sysConfig.searchEngine);
      console.log('Default sort:', sysConfig.defaultSearchSortField);
    }

    const tables = await this.viewConfig.getMappingTables();
    if (tables) {
      console.log('Resource type icons:', tables['Resource Type Icons']);
    }
  }

  flagKeys(flags: FeatureFlags): string[] {
    return Object.keys(flags);
  }
}
```

## Displaying Entity / Linked Data

Read-only access to linked-data entity state (person, organisation, location pages).

```typescript
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  EntityStateService,
  EntityViewModel,
  EntityType,
} from '@libis/primo-shared-state';

@Component({
  selector: 'app-entity-card',
  template: `
    @if (entityStatus() === 'success') {
      @if (entity(); as vm) {
        <div class="entity-card">
          @if (vm.entityThumbnail?.url) {
            <img [src]="vm.entityThumbnail.url" [alt]="vm.entityDetails?.name" />
          }

          <h2>{{ vm.entityDetails?.name }}</h2>
          <span class="badge">{{ vm.entityType }}</span>

          @if (vm.entityDetails?.description) {
            <p>{{ vm.entityDetails.description }}</p>
          }

          @if (vm.entityDetails?.properties?.length) {
            <dl>
              @for (prop of vm.entityDetails.properties; track prop.label) {
                <dt>{{ prop.label }}</dt>
                <dd>{{ prop.value }}</dd>
              }
            </dl>
          }
        </div>

        <!-- Related documents -->
        @if (relatedDocs()?.length) {
          <h3>Related Documents</h3>
          @for (group of relatedDocs()!; track group.searchMode) {
            <div class="related-group">
              <h4>{{ group.searchMode }} ({{ group.total }})</h4>
              @for (doc of group.docs; track doc['@id']) {
                <p>{{ doc.pnx.display.title?.[0] }}</p>
              }
            </div>
          }
        }

        <!-- Related entities -->
        @if (relatedEntities()?.length) {
          <h3>Related Entities</h3>
          @for (group of relatedEntities()!; track group.searchMode) {
            <div class="related-group">
              <h4>{{ group.searchMode }} ({{ group.total }})</h4>
              @for (ent of group.entities; track ent.entityDetails?.name) {
                <p>{{ ent.entityDetails?.name }} ({{ ent.entityType }})</p>
              }
            </div>
          }
        }
      }
    } @else if (entityStatus() === 'loading') {
      <p>Loading entity...</p>
    }
  `
})
export class EntityCardComponent {
  entity          = this.entityState.entityViewModelSignal();
  entityStatus    = this.entityState.entityStatusSignal();
  relatedDocs     = this.entityState.relatedDocsSignal();
  relatedEntities = this.entityState.relatedEntitiesSignal();

  constructor(private entityState: EntityStateService) {}
}
```

## Account Dashboard (Patron Data)

Read-only access to account counters, loans, requests, fines, and search history.

```typescript
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AccountStateService,
  UserStateService,
  LoanItem,
  MappedRequestItem,
  MappedFineItem,
  SearchHistoryItem,
} from '@libis/primo-shared-state';

@Component({
  selector: 'app-account-dashboard',
  template: `
    <div class="account-dashboard">
      <h2>My Account</h2>

      <!-- Counters -->
      <div class="counters">
        <div class="counter-card">
          <span class="count">{{ loansCounter() ?? 0 }}</span>
          <span class="label">Loans</span>
        </div>
        <div class="counter-card">
          <span class="count">{{ requestsCounter() ?? 0 }}</span>
          <span class="label">Requests</span>
        </div>
        <div class="counter-card">
          <span class="count">{{ finesCounter() ?? 0 }}</span>
          <span class="label">Fines</span>
        </div>
      </div>

      <!-- Active Loans -->
      @if (loansList(); as loans) {
        <h3>Active Loans</h3>
        @for (loan of loans; track loan.loanid) {
          <div class="loan-item" [class.overdue]="isOverdue(loan)">
            <strong>{{ loan.title }}</strong>
            <p>Due: {{ loan.duedate }} {{ loan.duehour }}</p>
            <p>Library: {{ loan.mainlocationname }}</p>
            @if (loan.alerts?.length) {
              <span class="alert-badge">{{ loan.alerts.length }} alert(s)</span>
            }
          </div>
        }
      }

      <!-- Requests -->
      @if (requestsList(); as requests) {
        <h3>Active Requests</h3>
        @for (req of requests; track req.requestId) {
          <div class="request-item">
            <strong>{{ req.title }}</strong>
            <p>{{ req.firstLine }}</p>
            <p>Status: {{ req.status }}</p>
            @if (req.isCancelable) {
              <span class="cancelable">Can be cancelled</span>
            }
          </div>
        }
      }

      <!-- Saved Searches -->
      @if (savedSearches(); as searches) {
        <h3>Saved Searches ({{ searches.length }})</h3>
        @for (item of searches; track item.title) {
          <div class="saved-search">
            <strong>{{ item.title }}</strong>
            <span class="date">{{ item.date }}</span>
          </div>
        }
      }

      <!-- Institution selector -->
      @if (institutions(); as insts) {
        @if (insts.length > 1) {
          <h3>Switch Institution</h3>
          @for (inst of insts; track inst.value.institutionCode) {
            <button (click)="onSelectInstitution(inst)">
              {{ inst.label }}
            </button>
          }
        }
      }
    </div>
  `
})
export class AccountDashboardComponent {
  loansCounter    = this.account.loansCounterSignal();
  requestsCounter = this.account.requestsCounterSignal();
  finesCounter    = this.account.finesCounterSignal();
  loansList       = this.account.loansListSignal();
  requestsList    = this.account.requestsListSignal();
  savedSearches   = this.account.savedSearchesListSignal();
  institutions    = this.account.institutionsListSignal();

  constructor(private account: AccountStateService) {}

  isOverdue(loan: LoanItem): boolean {
    return loan.loanstatus === 'OVERDUE' || loan.alerts?.length > 0;
  }

  onSelectInstitution(inst: any): void {
    // Account service is read-only — institution switching is handled
    // by the host. Use the Actions + ofType pattern to listen for
    // institution change events if needed.
    console.log('Selected institution:', inst.value.institutionCode);
  }
}
```

## Using Analytics Constants

Consistent event and page-name tracking across remotes using the shared analytics const maps.

```typescript
import { Injectable } from '@angular/core';
import { EventsNames, PageNames, SearchTypes } from '@libis/primo-shared-state';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackEvent(eventName: string, data: Record<string, any>): void {
    // Send to your analytics backend
    console.log('Analytics event:', eventName, data);
  }

  trackSearchExecuted(query: string, scope: string): void {
    this.trackEvent(EventsNames.SearchExecuted, {
      query,
      scope,
      searchType: SearchTypes.Simple,
    });
  }

  trackPageView(pageName: string): void {
    this.trackEvent('pageView', {
      page: pageName,
    });
  }

  // Example: track when user views full display
  trackFullDisplayView(recordId: string): void {
    this.trackEvent(EventsNames.FullDisplayView, {
      page: PageNames.FullDisplay,
      recordId,
    });
  }
}
```

## Filter Dispatch Helpers

Using the new filter dispatch helpers added in v2026.3.1.

```typescript
import { Component } from '@angular/core';
import {
  FilterStateService,
  SearchStateService,
  FilterGroupValue,
} from '@libis/primo-shared-state';

@Component({
  selector: 'app-custom-filters',
  template: `
    <div class="custom-filters">
      <!-- Quick filter buttons -->
      <button (click)="showOnlyBooks()">Books Only</button>
      <button (click)="excludeNewspapers()">Exclude Newspapers</button>
      <button (click)="applyMultipleAuthors()">Filter by Authors</button>
      <button (click)="clearFilters()">Clear All</button>

      <!-- Filter panel toggle -->
      <button (click)="toggleFilterPanel()">
        {{ isFiltersOpen() ? 'Hide' : 'Show' }} Filters
      </button>

      <!-- Remember filters toggle -->
      <label>
        <input type="checkbox"
               [checked]="isRememberAll()"
               (change)="toggleRememberAll($event)" />
        Remember filters across searches
      </label>

      <!-- Expand My Results toggle -->
      <label>
        <input type="checkbox"
               [checked]="expandMyResults()"
               (change)="toggleExpandResults($event)" />
        Expand My Results
      </label>
    </div>
  `
})
export class CustomFiltersComponent {
  isFiltersOpen  = this.filter.isFiltersOpenSignal();
  isRememberAll  = this.filter.isRememberAllSignal();
  expandMyResults = this.search.pcAvailabilityToggleValueSignal();

  constructor(
    private filter: FilterStateService,
    private search: SearchStateService,
  ) {}

  showOnlyBooks(): void {
    this.filter.selectResourceType({ resourceType: 'books', count: 0 });
  }

  excludeNewspapers(): void {
    this.filter.excludeFilter('rtype', 'newspapers');
  }

  applyMultipleAuthors(): void {
    const filters: FilterGroupValue[] = [
      { filterGroup: 'creator', filterValue: 'Smith, John' },
      { filterGroup: 'creator', filterValue: 'Doe, Jane' },
    ];
    this.filter.applyMultiSelectFilters(filters);
  }

  async clearFilters(): Promise<void> {
    const params = await this.search.getSearchParams();
    if (params) {
      this.filter.clearAllFilters(params);
    }
  }

  toggleFilterPanel(): void {
    this.filter.setFiltersOpen(!this.isFiltersOpen());
  }

  toggleRememberAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filter.setRememberAll(checked);
  }

  toggleExpandResults(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.search.toggleExpandMyResults(checked);
  }
}
```

## Combining View Config with Search

Adapt remote behaviour based on institutional configuration.

```typescript
import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  ViewConfigStateService,
  SearchStateService,
  AccountStateService,
  UserStateService,
} from '@libis/primo-shared-state';

@Component({
  selector: 'app-smart-dashboard',
  template: `
    @if (dashboardData$ | async; as data) {
      <h2>{{ data.institutionName }} — {{ data.vid }}</h2>

      @if (data.isLoggedIn) {
        <div class="patron-summary">
          <p>Welcome, {{ data.userName }}!</p>
          @if (data.loansCount) {
            <p>You have {{ data.loansCount }} active loan(s)</p>
          }
          @if (data.finesCount) {
            <p class="alert">{{ data.finesCount }} outstanding fine(s)</p>
          }
        </div>
      }

      <div class="search-summary">
        <p>{{ data.totalResults }} results for "{{ data.searchQuery }}"</p>
        <p>Scopes available: {{ data.scopeNames.join(', ') }}</p>
      </div>
    }
  `
})
export class SmartDashboardComponent implements OnInit {
  dashboardData$ = combineLatest([
    this.viewConfig.selectVid$(),
    this.viewConfig.selectInstitutionName$(),
    this.viewConfig.selectScopes$(),
    this.user.selectIsLoggedIn$(),
    this.user.selectUserName$(),
    this.search.selectTotalResults$(),
    this.search.selectSearchParams$(),
    this.account.selectLoansCounter$(),
    this.account.selectFinesCounter$(),
  ]).pipe(
    map(([vid, instName, scopes, loggedIn, userName, total, params, loans, fines]) => ({
      vid: vid ?? 'unknown',
      institutionName: instName ?? 'Unknown Institution',
      scopeNames: (scopes ?? []).map(s => s.scopeDisplayName),
      isLoggedIn: loggedIn,
      userName: userName ?? 'Guest',
      totalResults: total,
      searchQuery: params?.q ?? '',
      loansCount: loans,
      finesCount: fines,
    }))
  );

  constructor(
    private viewConfig: ViewConfigStateService,
    private search: SearchStateService,
    private account: AccountStateService,
    private user: UserStateService,
  ) {}

  ngOnInit() {}
}
```
