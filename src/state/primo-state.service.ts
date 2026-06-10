import { Injectable } from '@angular/core';

import { SearchStateService } from './search-state.service';
import { FilterStateService } from './filter-state.service';
import { UserStateService } from './user-state.service';
import { ViewConfigStateService } from './view-config-state.service';
import { EntityStateService } from './entity-state.service';
import { AccountStateService } from './account-state.service';

/**
 * PrimoStateService — the single entry point for everything this package
 * offers. Inject this one service and reach every state domain through a
 * named property, instead of injecting six individual services:
 *
 * ```ts
 * import { PrimoStateService } from '@libis/primo-shared-state';
 *
 * @Component({ ... })
 * export class MyRemoteComponent {
 *   private primo = inject(PrimoStateService);
 *
 *   docs = this.primo.search.allDocsSignal();        // read (Signal)
 *   jwt$ = this.primo.user.selectJwt$();             // read (Observable)
 *
 *   clear(): void {
 *     this.primo.filters.clearAllFilters();          // write (typed dispatch)
 *   }
 * }
 * ```
 *
 * Each domain exposes the full API of its underlying service — Observable
 * (`selectFoo$()`), Signal (`fooSignal()`), and Promise (`getFoo()`)
 * selector variants plus typed dispatch helpers where the slice is
 * writable:
 *
 * | Domain          | Slice(s)              | Writable? |
 * |-----------------|-----------------------|-----------|
 * | `primo.search`  | `Search`              | yes — search, pagination, sort, UI toggles |
 * | `primo.filters` | `filters`             | yes — include/exclude, multi-select, quick filters |
 * | `primo.user`    | `user`                | yes — settings toggles, decoded JWT, logout reason |
 * | `primo.config`  | `viewConfig`          | read-only (host owns config) |
 * | `primo.entity`  | `linked-data-entity`  | read-only (host owns entity loads) |
 * | `primo.account` | `account`             | read-only (host owns ILS calls) |
 *
 * The individual `*StateService` classes are `@deprecated` for direct
 * injection since 2026.6.1 and will stop being exported in a future
 * regeneration; this facade is the supported surface. (The deprecation
 * targets direct injection by remotes — this facade composing the services
 * internally is the intended use, hence the suppressed warnings below.)
 */
@Injectable({
  providedIn: 'root'
})
export class PrimoStateService {
  // eslint-disable deprecation/deprecation -- the facade is the sanctioned
  // consumer of the deprecated per-domain services; they remain root
  // singletons so code migrating gradually sees identical instances.
  constructor(
    /** Search results, search params, pagination, sort, and search UI toggles. */
    readonly search: SearchStateService,
    /** Active filters, resource-type bar, filter panel UI, quick filters. */
    readonly filters: FilterStateService,
    /** JWT, login status, user settings. */
    readonly user: UserStateService,
    /** View configuration, system configuration, mapping tables, feature flags (read-only). */
    readonly config: ViewConfigStateService,
    /** Linked-data entity, wiki data, related docs/entities (read-only). */
    readonly entity: EntityStateService,
    /** Account counters, loans, requests, fines, search history (read-only). */
    readonly account: AccountStateService,
  ) {}
}
