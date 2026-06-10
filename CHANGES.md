# Changelog

## 2026.6.1 — 2026-06-10

Regenerated from the June 2026 NDE extract (`src_bootstrap_ts.ffc1345247cad134`).

### Added

- **`PrimoStateService` facade** (`src/state/primo-state.service.ts`) — the new single entry point for the package. Inject once and reach every domain: `primo.search`, `primo.filters`, `primo.user`, `primo.config`, `primo.entity`, `primo.account`. Each domain property is the corresponding `*StateService` root singleton, so the existing per-service API applies verbatim. The six individual services are now marked `@deprecated` for direct injection (they remain exported and fully functional; removal will come in a later regeneration after a migration window).
- **New filter actions:** `quickFilterAction` (`[Quick Filters] Quick Filter Clicked`), `addQuickFilterAction` (`[Quick Filters] Add Quick Filter`), `removeQuickFilterAction` (`[Quick Filters] Remove Quick Filter`) — quick-filter commands; host effects run the filtered search. `applyIncludeFilterForHyperTextLikingAction` (`[Hyper text linking facet] Include Filter`) — reducer-only include-filter write.
- **New search actions:** `updateLastSearchTermsAction` (`[Search] Upsert Last Search Term`), `updateFullDisplayRecordYouCameFromAction` (`[Search] Update record you came from`) — pure reducer writes, no host effect listens.
- **`FilterStateService`** — new dispatch helpers `toggleQuickFilter(code)`, `addQuickFilter(code)`, `removeQuickFilter(code)`.
- **`SearchStateService`** — new selectors (all three variants each, API symmetry): `selectLastSearchTerms$()` / `lastSearchTermsSignal()` / `getLastSearchTerms()`, `selectFullDisplayRecordYouCameFrom$()` / `fullDisplayRecordYouCameFromSignal()` / `getFullDisplayRecordYouCameFrom()`, `selectIsResourceRecommenderExpanded$()` / `isResourceRecommenderExpandedSignal()` / `isResourceRecommenderExpanded()`; new dispatch helpers `addLastSearchTerm(s)`, `setFullDisplayRecordYouCameFrom(s)`, `setIsResourceRecommenderExpanded(b)`.
- **Search model** — `ElectronicService.collapse?: boolean`, `ElectronicService.shouldDisplayInDigitalViewer?: boolean`; `Search` (pnx search section) `crsid: string[]`, `cdparentid: string[]`; new "More From the Same" types: `CourseInfo`, `CollectionRecordData`, `RelatedCourse`, `RelatedCollection`, `MORE_FROM_THE_SAME_TYPE`, `MoreFromTheSameType`.
- **View-config model** — `ViewConfigData.is_ip_allow_to_login?: boolean`; `SystemConfiguration.rapido_hide_blank_ill_from_link_menu: boolean`; `MappingTables['Authority Search Operators']: MappingTable[]`.
- **Analytics model** — `EventsNames.MORE_FROM_THE_SAME: 'More From the Same'`.
- **`store.model.ts`** — new host slice `more-from-the-same` added to `AppState` as an opaque `MoreFromTheSameState` stub.

### Changed

- **`clearAllFiltersAction` payload** gained optional `isSideBarFilters?: boolean` and `isQuickFilters?: boolean` (the host uses them only to tag the analytics event with the clear's origin). `FilterStateService.clearAllFilters(searchParams?, isSideBarFilters?, isQuickFilters?)` updated accordingly — backwards-compatible.
- **`filtersSuccessAction` JSDoc/README corrected** — the host's `updateFilterStateForNewSearch$` effect does listen to it, but performs pure state derivation (no HTTP); the action remains exported.
- Host behaviour note (no package change): `loadViewConfigSuccessAction` is now only emitted when `viewConfig.IsViewNdeEnabled` is true; otherwise the host dispatches `loadViewConfigFailedAction`.
- Host's search-header interface gained `searchOperator` support; not applicable here — this package deliberately ships `SearchHeaderType` as a plain string union (the host interface carries Angular `Signal` UI fields, out of the state-only scope).

### ⚠️ Breaking removals (confirmed by user before applying)

- **`SearchState.isOffsetLimitExceeded` and the three `SearchStateService` methods** `selectIsOffsetLimitExceeded$()`, `isOffsetLimitExceededSignal()`, `isOffsetLimitExceeded()` — the host removed the field and `offsetLimitExceededAction` entirely (the offset-cap error path was dropped from `search.effects.ts`). The selector was already dead (always `false`) against the June host.
- **`ElectronicService.supported?: boolean`** — field removed from the host model (superseded by `collapse?` / `shouldDisplayInDigitalViewer?`).
- **`resetUserSettingsSuccessAction`** — safety correction, not host drift: the host effect `restoreLanguageToInterfaceLanguage$` listens to it and **navigates to `/home` and resets the interface language**. The previous JSDoc ("no downstream effects") was wrong; per the safety gate the action may not be exported. Listen passively via `ofType('[User-Settings] reset user settings success')` if you need to react to it.

### Documentation

- **README.md** — new "The facade: PrimoStateService" usage section and facade entry at the top of the API reference; "What's inside" table updated (facade row, deprecation note, action count corrected from the stale "37" to 48); `SearchStateService` / `FilterStateService` reference tables updated for the additions and removals above; action catalog tables updated (quick filters, hypertext include, last-search-terms, record-you-came-from; `clearAllFiltersAction` payload; `resetUserSettingsSuccessAction` row removed with an explanatory note in the safety section); `ElectronicService`, `Search` (pnx), `ViewConfigData`, `SystemConfiguration`, `MappingTables`, `EventsNames` model tables updated; new "More From the Same" types documented; opaque-slice count 23 → 24; install/pack version strings bumped to `2026.6.1`.
- **EXAMPLES.md** — new leading example showing the facade as the recommended injection point, with a note that the existing per-service examples still compile unchanged.

## 2026.5.3 — 2026-05-06

### Added

- **`SearchState.isOffsetLimitExceeded: boolean`** (`store.model.ts`) — new field set by the host when a search request exceeds the pagination offset cap. Previously missing from the exported interface.
- **`FilterState.resourceTypeFilterStatus: LoadingStatus`** (`filter.model.ts`) — new field tracking the load status of the resource-type filter bar. Previously missing from the exported interface.
- **`SearchStateService`** — three new selectors for `isOffsetLimitExceeded`:
  - `selectIsOffsetLimitExceeded$()` → `Observable<boolean>`
  - `isOffsetLimitExceededSignal()` → `Signal<boolean>` (initial `false`)
  - `isOffsetLimitExceeded()` → `Promise<boolean>`
- **`FilterStateService`** — three new selectors for `resourceTypeFilterStatus`:
  - `selectResourceTypeFilterStatus$()` → `Observable<LoadingStatus>`
  - `resourceTypeFilterStatusSignal()` → `Signal<LoadingStatus>` (initial `'pending'`)
  - `getResourceTypeFilterStatus()` → `Promise<LoadingStatus>`

### Changed

- **`resourceTypeFilterSelectedAction` — added required `index: number` prop** — the host effect uses `index` to focus the selected resource-type button for accessibility. Existing callers that dispatched without `index` must add it; pass `0` if the button position is not known. `FilterStateService.selectResourceType(model, index?)` defaults `index` to `0` — the typed dispatch helper is backwards-compatible.
- **`TopBarSelectedFilter.filterType`** typed as `FilterType?` (was `string?`) — aligns with the source model's use of the `FilterType` enum.

### ⚠️ Breaking change (no removal — payload addition)

- **`resourceTypeFilterSelectedAction`**: the `index: number` prop is now required in the TypeScript type. Any remote code that dispatches this action directly (not via `FilterStateService.selectResourceType()`) must pass `index`.

### Documentation

- README.md: `SearchStateService` Observables/Signals/Snapshots tables — added `isOffsetLimitExceeded` rows; `FilterStateService` tables — added `resourceTypeFilterStatus` rows and updated `selectResourceType` signature to `selectResourceType(model, index?)`; `FilterState` fields table — added `resourceTypeFilterStatus` row; `TopBarSelectedFilter.filterType` corrected to `FilterType?`; `resourceTypeFilterSelectedAction` props updated; version tarball references bumped to `2026.5.3`.
- EXAMPLES.md: `selectResourceType` call updated to pass `index`.

## 2026.5.2 -- prerelease

### Added

- **`src/models/store.model.ts`** — new file exporting `AppState` (the root NgRx store shape) plus slice state interfaces keyed by each reducer's exact feature-key string. Six slices consumed by the services in this package (`Search`, `user`, `filters`, `account`, `viewConfig`, `linked-data-entity`) are fully typed; the remaining 23 slices are declared as opaque `Record<string, unknown>` so `AppState` stays complete without pulling host-internal field types into the public API.
- **`AppState` re-exported from the package barrel** (`src/index.ts`) so consumer remotes can write their own typed selectors.

### Changed

- **`StateHelper` selector methods are now generic over `AppState`.** `select$`, `selectOnce`, and `selectSignal` signatures changed from `selector: any` to `selector: (state: AppState) => T`. The internal `Store` is cast to `Store<AppState>` so `store.select(selector)` type-checks.
- **All six state services retyped** (`search-state`, `user-state`, `filter-state`, `account-state`, `view-config-state`, `entity-state`). Every `(state: any) => state.Foo?.bar` selector callback now reads `(state: AppState) => state.Foo?.bar` and is fully type-checked at compile time — a typo in a feature-key string or a renamed field is now a `tsc` error instead of a silent runtime `undefined`.
- `AccountState` status fields (`loansStatus`, `requestsStatus`, `finesStatus`, `savedSearchesStatus`, `searchHistoryStatus`) are typed as `LoadingStatus` (not `string`) so service selectors returning `Observable<LoadingStatus | undefined>` type-check correctly.
- `package.json` — added `@ngrx/entity ^19.0.0` as a peer dependency (already transitively required — now declared explicitly because `SearchState extends EntityState<Doc>` is part of the public surface).

### Documentation

- README.md — new "Typed store access" subsection noting that `AppState` is exported and selector callbacks are fully typed.

## 2026.5.1 -- prerelease

### Added

- **Analytics model — new `EventsNames` keys:** `TOPIC_OVERVIEW` (`'Topic Overview'`), `LEGANTO_COURSE_INFO` (`'Leganto Course Info'`), `EXPORT_ALL` (`'Export All'`)
- **Search model — new `SearchData.facetsCacheKey?: number`** — host uses this to skip re-fetching facets when the cache is still valid
- **Search model — new `ElectronicService.displayInEmbedViewer?: boolean`** — indicates the service can be shown in the embedded viewer
- **Search model — new `SearchWithinJournalContext` interface** — `{ recordId: string; recordTitle: string }` used for journal search context
- **View-config model — new `SystemConfiguration` fields:** `expand_results_toggles_visible: boolean`, `export_all_for_user_email_only: boolean`
- **View-config model — new `MappingTables` entry:** `'Resource Sharing Additional Information': MappingTable[]`
- **View-config model — new `ResultFullTileInterface.authorityitemview: Resultitemview[]`**
- **Account model — new `PageType` type alias:** `'loans' | 'requests' | 'fines' | 'searchHistory' | 'savedSearches'`
- **`loadFiltersAction` — added optional `facetsCacheKey?: number` prop** — allows callers to pass the cache key to the host's filter effect
- **`FilterStateService.loadFilters()` — added optional `facetsCacheKey?: number` parameter**

### Changed

- `shared-actions.ts` header comment extended to document three new excluded actions: `triggerExportAllSendEmail` (downstream HTTP email effect), `patronDefaultSortUpdateAction` (downstream sort-save HTTP effect), `selectAllResourceTypeFilterAction` (downstream search-trigger effect)

### Documentation

- README.md: `EventsNames` count updated to ~53; `SearchData` table — added `facetsCacheKey` row; `ElectronicService` table — added `displayInEmbedViewer` row; `SystemConfiguration` section — added `expand_results_toggles_visible` and `export_all_for_user_email_only` fields table; `MappingTables` section — noted new `'Resource Sharing Additional Information'` entry; added `SearchWithinJournalContext` interface block; added `PageType` type block; `loadFiltersAction` props updated with `facetsCacheKey?`; `FilterStateService` dispatch helpers updated `loadFilters(params, facetsCacheKey?)`; version tarball references bumped to `2026.5.1`

## 2026.4.1 — 2026-04-15

### Added

- **Search model — new `SearchParams` fields:** `conVoc`, `authorityQuery`, `originatingSystem`, `originatingSystemId`
- **Search model — new `Info.controlledVocabulary`** of new interface `ControlledVocabulary { errorMessages: string[] }`
- **Search model — new `Doc.registerUser`** (string flag)
- **Search model — new `Control` fields:** `originatingSystem`, `originatingSystemId`
- **Search model — new `DocDelivery.titleRequestableAtItemLevel`**
- **Search model — new `ElectronicService` fields:** `serviceNotAvailable`, `serviceNotAvailableReason`, `researchFileList`, `researchLinksList`
- **Search model — new interfaces:** `EsploroResearchFile`, `EsploroResearchLink` (Esploro research-output records attached to electronic services)
- **Search model — new `FullDisplayQueryParams.authfulldisplay` and `FullDisplayParams.authfulldisplay`**
- **User model — new `DecodedJwt` fields:** `selfRegistered: boolean`, `restrictedUser: boolean`
- **Entity model — new `AutoCompleteBaseEntity.score?: number`**
- **View-config model — new `ViewConfigData.patron_default_sort: boolean`**
- **View-config model — new `ViewConfigData.searchWithinJournalConfig`** of new interface `SearchWithinJournal { tab?, scope?, summonUrl? }`
- **View-config model — new `SystemConfiguration` fields:** `enable_search_inside_journal: boolean`, `display_register_button_by_restricted_user_groups: boolean`, `primo_loan_list_sorting: string`
- **New filter actions:** `removeIncludeFilterAction` (`[Filter Group Dropdown] Remove Include Filter`), `removeExcludeFilterAction` (`[Filter Group Dropdown] Remove Exclude Filter`)
- **New search UI action:** `setIsResourceRecommenderExpandedAction` (`[search] Set Is Resource Recommender Expanded ` — trailing space)
- **`EntityStateService` — new flat-field selectors:** `selectEntityId$`, `selectEntity$`, `selectWikiData$`, `selectWikiDataStatus$`, `selectRelatedDocsStatus$`, `selectRelatedEntitiesStatus$` plus Signal and Promise equivalents where applicable
- **API symmetry — every selector now has all three variants (Observable / Signal / Promise).** Added missing Signals and Promises across every state service so remotes can pick the shape that fits the call site:
  - `UserStateService`: `getUserState`, `getDecodedJwt`, `getUserName`, `getUserGroup`
  - `SearchStateService`: `docByIdSignal(id)` + Promises `getSearchMetaData`, `getSearchStatus`, `getTotalResults`, `getPageSize`, `isLoading`, `getSearchNotificationMsg`, `getPcAvailabilityToggleValue`, `getSearchInFullTextToggleValue`, `isSnackBarOpen`, `getDisplaySummary`, `isReportAProblemOpen`, `getCurrentSearchTerm`, `getSelectedSortBy`
  - `FilterStateService`: Promises `getFilterState`, `getResourceTypeFilter`, `isFiltersOpen`, `isRememberAll`
  - `ViewConfigStateService`: Signals `primoViewSignal`, `tilesSignal`, `institutionNameSignal` + Promises `getStatus`, `getPrimoView`, `getScopes`, `getTabs`, `getTiles`, `getNdeAddons`, `getInstitutionName`, `getInterfaceLanguage`
  - `EntityStateService`: Signals `wikiDataStatusSignal`, `relatedDocsStatusSignal`, `relatedEntitiesStatusSignal` + Promises `getWikiData`, `getWikiDataStatus`, `getRelatedDocsStatus`, `getRelatedEntitiesStatus`
  - `AccountStateService`: Signals `loansStatusSignal`, `requestsStatusSignal`, `finesStatusSignal` + Promises `getBlocksCounter`, `getFavoritesCounter`, `getLoansList`, `getRequestsList`, `getFinesList`, `getSearchHistoryList`, `getInstitutionsList`, `getLoansStatus`, `getRequestsStatus`, `getFinesStatus`

### Changed

- **`Doc.pnx.links.unpaywalllink`** renamed to **`linkunpaywall`** to match the host's current field name
- **`EntityStateService` rewritten to use the correct feature key** `state['linked-data-entity']` (was previously `state.linkedDataEntity` — latent bug since 2026.3.1)
- `EntityStateService.selectRelatedEntities$()` now returns `RelatedEntitiesMultiLangDataList[]` (host flattened state — entities are multi-language; remotes compose a language projection themselves)

### ⚠️ Breaking removals (confirmed by user before applying)

- **Removed `fetchUnpaywallLinksAction`** — the host no longer loads Unpaywall links asynchronously. The URL is now read inline from `Doc.pnx.links.linkunpaywall`.
- **Removed `Doc.unpaywallStatus`** — no async load happens, so there is no status to track.
- **Removed `EntityStateService.selectEntityViewModel$()`, `entityViewModelSignal()`, and `getEntityViewModel()`** — the host's linked-data-entity state was flattened; the composite `entityViewModel` field no longer exists as raw state. Remotes that need a language-mapped projection must compose it themselves from `selectEntity$`/`selectRelatedEntities$`/`selectWikiData$` using their own language selector.

### Documentation

- **README.md:** `EntityStateService` tables rewritten to reflect the new flat API; stale `entityViewModel` fields removed from `Quick start` snippets; SearchParams table updated with 4 new fields; Doc table shows `linkunpaywall` rename and removal of `unpaywallStatus`; Control table updated with `originatingSystem`/`originatingSystemId`; DecodedJwt updated with `selfRegistered`/`restrictedUser`; new `ControlledVocabulary`, `EsploroResearchFile`, `EsploroResearchLink`, `SearchWithinJournal` interfaces documented; ViewConfigData / SystemConfiguration additions documented; `EntityViewModel` / `BasicEntityData` / `EntityDetails` / `RelatedDocList` / `RelatedEntitiesMultiLangDataList` tables corrected to match the actual source shapes (previous entries had fabricated field names); Filter and Search UI actions tables updated with the three new actions; install-command version strings bumped to `2026.4.1`.
- **EXAMPLES.md:** Entity card example rewritten to use the new flat API and multi-language `EntityMultiLangData` shape, showing how to pick a language via `ViewConfigService.interfaceLanguageSignal()`.
- **README.md — API reference tables** for every `*StateService` updated to list the new Signal and Promise methods added by the symmetry pass.

## 2026.3.1 — 2026-03-24

### Added

- **New model: `analytics.model.ts`** — `EventsNames`, `PageNames`, `SearchTypes` const maps for consistent analytics tracking across remotes
- **New model: `entity.model.ts`** — `EntityType`, `EntityViewModel`, `EntityDetails`, `EntityThumbnail`, `BasicEntityData`, `EntityMultiLangData`, `RelatedDocList`, `RelatedEntitiesList`, linked-data API response types, AutoComplete entity models
- **New model: `view-config.model.ts`** — `ViewConfigData`, `SystemConfiguration` (140+ properties), `MappingTables` (50+ tables), `PrimoView`, `Scope`, `Tiles`, `FeatureFlags`, `NdeAddonData`, `SavedSearchInterface`, `AtozLanguage`, `SearchHeaderType`, and all supporting sub-interfaces
- **New model: `account.model.ts`** (partial) — `Counters`, `MenuOption`, `accountViewModel`, `LoanItem`, `FineItem`, `RequestItem`, `MappedRequestItem`, `MappedFineItem`, `FavoriteItem`, `MappedInstItem`, `SearchHistoryItem`, `CrossNetworkResponse` (excluded: `RequestOptions`, `NestedRequestOptions`, `PersonalDetailsInfo`)
- **New service: `ViewConfigStateService`** — read-only selectors for config, systemConfiguration, mappingTables, scopes, tabs, featureFlags, ndeAddons, institutionCode, vid, interfaceLanguage (Observable + Signal + Promise APIs)
- **New service: `EntityStateService`** — read-only selectors for entity view model, status, related docs, related entities (Observable + Signal + Promise APIs)
- **New service: `AccountStateService`** — read-only selectors for counters, loans, requests, fines, saved searches, search history, institutions (Observable + Signal + Promise APIs)
- **New filter actions:** `IncludeFilterButtonClickedAction`, `ExcludeFilterButtonClickedAction`, `applyMultiSelectFiltersAction`, `clearAllFiltersAction`, `resourceTypeFilterSelectedAction`, `setIsFiltersOpenAction`, `rememberAllChangeValueAction`
- **New search UI actions:** `setDisplaySummaryAction`, `setIsSnackBarOpenAction`, `setIsReportAProblemOpenAction`, `setPresentNotificationAction`, `pcAvailabilityToggleChanged`, `changePcAvailabilityToggleValue`, `searchInFullTextToggleChanged`, `changeSearchInFullTextToggleValue`
- **New `FilterGroupValue` interface** — exported from `shared-actions.ts` for multi-select filter dispatch
- **FilterStateService:** 7 new typed dispatch helpers — `includeFilter()`, `excludeFilter()`, `applyMultiSelectFilters()`, `clearAllFilters()`, `selectResourceType()`, `setFiltersOpen()`, `setRememberAll()`
- **SearchStateService:** 8 new Observable selectors, 8 new Signal selectors, 6 new typed dispatch helpers — `setDisplaySummary()`, `setIsSnackBarOpen()`, `setIsReportAProblemOpen()`, `toggleExpandMyResults()`, `toggleSearchInFullText()`, `saveCurrentSearchTerm()`

### Changed

- `SearchParams`: added optional `searchTerm` field
- `shared-actions.ts`: JSDoc safety comments added to all 37 exported action creators
- `shared-actions.ts`: added header comment block listing all intentionally excluded (unsafe) actions
- Version scheme changed from semver (`1.0.0`) to `YYYY.M.regenerateCount` (`2026.3.1`)

## 1.0.0

Initial release with Search, Filter, and User state slices.
