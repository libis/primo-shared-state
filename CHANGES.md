# Changelog

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
