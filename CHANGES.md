# Changelog

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
