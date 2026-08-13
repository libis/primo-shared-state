/**
 * SHARED ACTIONS
 *
 * These action creators produce objects whose `type` strings exactly match
 * those handled by the host application's NgRx reducers and effects.
 *
 * EFFECTS WARNING:
 * The host app registers NgRx effects that react to these actions (e.g. HTTP
 * calls). Remote federated modules must NOT register their own effects for
 * the same action types — that would cause duplicate side-effects.
 *
 * To listen for an action without triggering a duplicate effect, use:
 *
 *   import { Actions, ofType } from '@ngrx/effects';
 *   // inject Actions in a service, then:
 *   this.actions$.pipe(ofType(searchSuccessAction)).subscribe(...)
 *
 * Do NOT register EffectsModule.forFeature([]) with effects that re-implement
 * the host's HTTP calls.
 *
 * ACTIONS INTENTIONALLY NOT EXPORTED (unsafe for remote dispatch):
 * - All [Account] Start * actions — trigger HTTP calls to ILS
 * - loadJwtAction — initiates OAuth/authentication flow
 * - loadViewConfigAction — triggers HTTP to load institutional config
 * - deliveryAction — triggers HTTP for delivery data
 * - FavoriteActions.addFavorite / deleteFavorite — trigger HTTP effects
 * - searchAndAppendAction — triggers HTTP for endless scroll
 * - All "done*" account actions that feed downstream effects
 * - Analytics send* actions — trigger analytics HTTP side-effects
 * - triggerExportAllSendEmail — downstream effect fires HTTP email-send call
 * - patronDefaultSortUpdateAction — local mirror of a server-persisted preference.
 *   Correction (2026.8.1): no effect listens to it; search.effects.ts *emits* it after
 *   userSettingsService.saveSelectedPatronDefaultSort() succeeds. Dispatching it from a
 *   remote writes userSettings.patronsDefaultSort in the store without persisting
 *   server-side, desyncing the store from the ILS. Still excluded, for that reason.
 * - selectAllResourceTypeFilterAction — downstream effect in filter.effects.ts triggers a new search
 * - setNewFilterStateAction — replaces the whole applied-filter set in one write; a remote
 *   cannot construct a consistent filterState/multiSelectFilterState/previousSearchQuery triple
 * - handleDeepLinkForFiltersAction / handleDeepLinkForResourceTypeFilterAction —
 *   host-internal bootstrap that reconciles URL state with the filter slice
 * - resourceStatusUpdateAction — writes the resource-type-bar load status; a remote
 *   flipping it desyncs the bar from the in-flight host request
 * - loadFeaturedResultsAction — server-authoritative payload (featured-results bar contents)
 * - clearFeaturedResultsAction — reducer-only, but blanks host-owned data that only
 *   repopulates on the next search; clearSearchAction already clears it as part of a reset
 * - saveSearchHistorySuccessAction, displayFullRecordAnalyticsSuccess/Failure —
 *   terminal markers for host-owned server writes; nothing for a remote to signal
 * - loadJwtFailedAction, saveLoggedJwtAction, loadLoggedUserJwtAction — authentication flow
 * - loadUserSettingsFailedAction, loadPreferLanguageSuccessAction,
 *   restoreLanguageToInterfaceLanguage, removeSearchHistoryInSessionStorageSuccessAction —
 *   terminal steps of host-owned settings/session chains
 * - resetUserSettingsSuccessAction — host effect restoreLanguageToInterfaceLanguage$
 *   navigates the user to /home and resets the interface language (exported until
 *   2026.5.3; removed as a safety correction in 2026.6.1)
 * - simpleSearchResetAction — downstream effect resetAfterSummary$ fires a new search
 * - initPcAvailabilityAndSearchInFtToggles — downstream effect reads config and re-dispatches
 * - clearStateExceptCurrentEntity — entity-collection surgery on server-authoritative
 *   search results; host-internal full-display optimisation
 *
 * REMOVED IN 2026.4.1:
 * - fetchUnpaywallLinksAction — no longer exists in the host; the host
 *   now resolves unpaywall links inline via Doc.pnx.links.linkunpaywall.
 *
 * REMOVED IN 2026.6.1:
 * - resetUserSettingsSuccessAction — see safety note above.
 *
 * 2026.8.1: no actions added or removed. The August extract introduces no new
 * remote-safe actions; the exported set is unchanged at 48. The exclusion list
 * above was expanded to name every unexported action in the Search / filters /
 * user / featured-results slices, so the gate is auditable rather than implicit.
 */

import { createAction, props } from '@ngrx/store';
import { Facet, SearchData, SearchParams } from '../models/search.model';
import { DecodedJwt, UserSettings } from '../models/user.model';
import { LogoutReason } from '../models/state.const';
import { ResourceTypeFilterModel } from '../models/filter.model';

// ─────────────────────────────────────────────────────────────────────────────
// Search actions
// ─────────────────────────────────────────────────────────────────────────────

/** SAFE: Command that starts a well-defined host search operation. The remote legitimately supplies the search parameters. */
export const searchAction = createAction(
  '[Search] Load search',
  props<{ searchParams: SearchParams; searchType?: string }>()
);

/**
 * SAFE (with caveat): Terminal success action whose reducer writes search results to the store.
 * ⚠️ NOTE: The host's delivery effect listens to this action downstream.
 * Dispatching it from a remote with fabricated data could cause inconsistent delivery state.
 * Prefer reading search results via SearchStateService selectors instead of dispatching this.
 */
export const searchSuccessAction = createAction(
  '[Search] Load search success',
  props<{ searchResultsData: SearchData }>()
);

/** SAFE: Terminal failure action. Reducer sets status to FAIL. No downstream effects. */
export const searchFailedAction = createAction('[Search] Load search failed');

/** SAFE: Pure state reset — clears all search results and resets to initial state. */
export const clearSearchAction = createAction('[Search] clear search');

/** SAFE: Pure UI-state write — updates the selected page size. */
export const pageLimitChangedAction = createAction(
  '[Search] Page Limit Changed',
  props<{ limit: number }>()
);

/** SAFE: Pure UI-state write — updates the current page number for pagination. */
export const pageNumberChangedAction = createAction(
  '[Search] Page Number Changed',
  props<{ pageNumber: number }>()
);

/** SAFE: Pure UI-state write — updates sort selection. NOTE: type is lowercase [search]. */
export const sortByChangedAction = createAction(
  '[search] Sort By Changed',
  props<{ sort: string }>()
);

/** SAFE: Pure UI-state write — marks current search as saved. */
export const updateIsSavedSearch = createAction(
  '[Search] Update Is Saved Search',
  props<{ isSavedSearch: boolean }>()
);

/** SAFE: Pure UI-state write — sets the search notification message. NOTE: lowercase [search]. */
export const setSearchNotificationMsg = createAction(
  '[search] Set Search Notification Message',
  props<{ msg: string }>()
);

/** SAFE: Pure UI-state write — saves the current search term for history tracking. */
export const saveCurrentSearchTermAction = createAction(
  '[Search] save current search term',
  props<{ searchTerm: string }>()
);

/** SAFE: Pure UI-state write — upserts a term into the last-search-terms list (used for autocomplete suggestions). Reducer-only; no host effect listens. */
export const updateLastSearchTermsAction = createAction(
  '[Search] Upsert Last Search Term',
  props<{ lastSearchTerm: string }>()
);

/** SAFE: Pure UI-state write — records which full-display record the user navigated from, for back-to-results focus restoration. Reducer-only; no host effect listens. */
export const updateFullDisplayRecordYouCameFromAction = createAction(
  '[Search] Update record you came from',
  props<{ fullDisplayRecordYouCameFrom: string }>()
);

/** SAFE: Pure UI-state write — updates the sort-by parameter in filter state. */
export const updateSortByParam = createAction(
  '[Filter] Update Sort By Param',
  props<{ sort: string }>()
);

/** SAFE: Pure UI toggle — controls the display summary flag. No HTTP side-effects. */
export const setDisplaySummaryAction = createAction(
  '[Search] Set Display Summary',
  props<{ displaySummary: boolean }>()
);

/** SAFE: Pure UI toggle — controls snack bar visibility. NOTE: lowercase [search], trailing space in type string. */
export const setIsSnackBarOpenAction = createAction(
  '[search] Set Is SnackBar Open ',
  props<{ isSnackBarOpen: boolean }>()
);

/** SAFE: Pure UI toggle — controls Report a Problem panel. NOTE: lowercase [search], trailing space in type string. */
export const setIsReportAProblemOpenAction = createAction(
  '[search] Set Is Report A Problem Open ',
  props<{ isReportAProblemOpen: boolean }>()
);

/** SAFE: Pure UI toggle — controls search notification presentation. NOTE: lowercase [search], trailing space. */
export const setPresentNotificationAction = createAction(
  '[search] Set Present Notification ',
  props<{ presentNotification: boolean }>()
);

/** SAFE: Pure UI toggle — controls Resource Recommender panel expansion. NOTE: lowercase [search], trailing space in type string. */
export const setIsResourceRecommenderExpandedAction = createAction(
  '[search] Set Is Resource Recommender Expanded ',
  props<{ isResourceRecommenderExpanded: boolean }>()
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter / search-filter actions
// ─────────────────────────────────────────────────────────────────────────────

/** SAFE: Command to load filters for given search params. The host effect performs the HTTP call. Optional `facetsCacheKey` lets the host skip re-fetching facets when the cache is still valid. */
export const loadFiltersAction = createAction(
  '[Filter] Load Filter',
  props<{ searchParams: SearchParams; facetsCacheKey?: number }>()
);

/** SAFE: Terminal success action — reducer stores filters. No downstream effect listens. */
export const filtersSuccessAction = createAction(
  '[Filter] Load Filter Success',
  props<{ filters: Facet[] }>()
);

/** SAFE: Terminal failure action — reducer sets filter status to FAIL. */
export const filterFailedAction = createAction('[Filter] Load Filter Failed');

/** SAFE: Command to apply an include filter. Remote legitimately supplies filter group and value. */
export const IncludeFilterButtonClickedAction = createAction(
  '[Filter Side Bar] Add Include Filter Clicked',
  props<{ filterGroup: string; filterValue: string; mergedLabels: string[] }>()
);

/** SAFE: Command to apply an exclude filter. Remote legitimately supplies filter group and value. */
export const ExcludeFilterButtonClickedAction = createAction(
  '[Filter Side Bar] Add Exclude Filter Clicked',
  props<{ filterGroup: string; filterValue: string; mergedLabels: string[] }>()
);

/** SAFE: Command to remove a previously-applied include filter. Host effect triggers a new search. */
export const removeIncludeFilterAction = createAction(
  '[Filter Group Dropdown] Remove Include Filter',
  props<{ filterValue: string; filterGroup: string; mergedLabels: string[] }>()
);

/** SAFE: Command to remove a previously-applied exclude filter. Host effect triggers a new search. */
export const removeExcludeFilterAction = createAction(
  '[Filter Group Dropdown] Remove Exclude Filter',
  props<{ filterValue: string; filterGroup: string; mergedLabels: string[] }>()
);

/**
 * SAFE: Command to apply multi-select filters.
 * FilterGroupValue shape: { filterGroup: string; filterValue: string }.
 */
export const applyMultiSelectFiltersAction = createAction(
  '[Filter Side Bar] Apply Multi-select Filters',
  props<{ multiSelectedFilters: FilterGroupValue[] }>()
);

/** FilterGroupValue — represents a single filter selection within a group. */
export interface FilterGroupValue {
  filterGroup: string;
  filterValue: string;
}

/**
 * SAFE: Pure UI reset — clears all active filters and optionally triggers new search.
 * `isSideBarFilters` / `isQuickFilters` only tag the analytics event with where the
 * clear originated; omit them when dispatching programmatically.
 */
export const clearAllFiltersAction = createAction(
  '[Filters] Clear All Filter',
  props<{ searchParams?: SearchParams; isSideBarFilters?: boolean; isQuickFilters?: boolean }>()
);

/** SAFE: Command — toggles a quick filter chip (adds it if absent, removes it if active). Host effect triggers the filtered search. */
export const quickFilterAction = createAction(
  '[Quick Filters] Quick Filter Clicked',
  props<{ quickFilterCode: string }>()
);

/** SAFE: Command — adds a quick filter. Host effect triggers the filtered search. */
export const addQuickFilterAction = createAction(
  '[Quick Filters] Add Quick Filter',
  props<{ quickFilterCode: string }>()
);

/** SAFE: Command — removes a quick filter. Host effect triggers the filtered search. */
export const removeQuickFilterAction = createAction(
  '[Quick Filters] Remove Quick Filter',
  props<{ quickFilterCode: string }>()
);

/** SAFE: Pure state write — applies an include filter coming from hypertext-linking facets. Reducer-only; no host effect listens. */
export const applyIncludeFilterForHyperTextLikingAction = createAction(
  '[Hyper text linking facet] Include Filter',
  props<{ filterGroup: string; filterValue: string }>()
);

/**
 * SAFE: Command — selects a resource type filter. Host effect triggers a new search.
 * `index` is the ordinal position of the button in the resource-type bar; the host
 * uses it for accessibility focus management after the search completes. Remotes
 * should pass `0` if the exact button index is not known.
 */
export const resourceTypeFilterSelectedAction = createAction(
  '[Resource Type Filter Bar] Resource Type Filter Bar Selected',
  props<{ selectedResourceType: ResourceTypeFilterModel; index: number }>()
);

/** SAFE: Pure UI toggle — controls whether the filter side bar is open. */
export const setIsFiltersOpenAction = createAction(
  '[Filter Side Bar] Set Is Filters Open',
  props<{ isFiltersOpen: boolean }>()
);

/** SAFE: Pure UI toggle — controls filter persistence across searches (Remember All). */
export const rememberAllChangeValueAction = createAction(
  '[Filter Side Bar] Remember All button change value',
  props<{ newValue: boolean }>()
);

/** SAFE: Command — toggles PC availability (Expand My Results) and triggers a new search. */
export const pcAvailabilityToggleChanged = createAction(
  '[Filter Side Bar] Expand My Results toggle pressed',
  props<{ pcAvailabilityToggleValue: boolean }>()
);

/** SAFE: Pure UI-state write — sets the PC availability toggle value without triggering search. */
export const changePcAvailabilityToggleValue = createAction(
  '[Filter Side Bar] Expand My Results value changed',
  props<{ pcAvailabilityToggleValue: boolean }>()
);

/** SAFE: Command — toggles full-text search and triggers a new search. */
export const searchInFullTextToggleChanged = createAction(
  '[Filter Side Bar] Search In Full Text toggle pressed',
  props<{ searchInFullTextToggleValue: boolean }>()
);

/** SAFE: Pure UI-state write — sets the full-text toggle value without triggering search. */
export const changeSearchInFullTextToggleValue = createAction(
  '[Filter Side Bar] Search In Full Text value changed',
  props<{ searchInFullTextToggleValue: boolean }>()
);

// ─────────────────────────────────────────────────────────────────────────────
// User actions — only those safe for remote modules to dispatch
// ─────────────────────────────────────────────────────────────────────────────

/** SAFE: Pure state write — sets the decoded JWT in user state. No downstream effects. */
export const setDecodedJwt = createAction(
  '[User] Set Decoded Jwt',
  props<{ decodedJwt: DecodedJwt }>()
);

/**
 * SAFE (with caveat): Terminal success action whose reducer stores user settings.
 * ⚠️ NOTE: A host effect listens downstream to sync preferred language.
 * Only dispatch with legitimate user settings data.
 */
export const loadUserSettingsSuccessAction = createAction(
  '[User-Settings] save user settings',
  props<{ userSettings: UserSettings; isNewSession: boolean }>()
);

/** SAFE: Terminal success action — stores the updated language preference. */
export const doneChangeUserSettingsLanguageAction = createAction(
  '[User-Settings] Done Change User Settings Language',
  props<{ value: string }>()
);

/** SAFE: Terminal success action — stores save-history toggle value. NOTE: trailing space in type string. */
export const doneSaveHistoryToggleAction = createAction(
  '[User-Settings] Done Update Save history toggle ',
  props<{ value: string }>()
);

/** SAFE: Terminal success action — stores use-history toggle value. NOTE: trailing space in type string. */
export const doneUseHistoryToggleAction = createAction(
  '[User-Settings] Done Update Use history toggle ',
  props<{ value: string }>()
);

/** SAFE: Terminal success action — stores auto-extend session toggle. NOTE: trailing space in type string. */
export const doneAutoExtendMySessionToggleAction = createAction(
  '[User-Settings] Done Update Auto Extend My Session toggle ',
  props<{ value: string }>()
);

/** SAFE: Pure state write — records where the user was before login for redirect. */
export const setLoginFromStateAction = createAction(
  '[User-Settings] set login from state',
  props<{ value: string }>()
);

/** SAFE: Terminal success action — stores RA search history toggle value. */
export const changeRaSaveSearchDoneAction = createAction(
  '[User-settings] dont update research-Assistant save search toggle',
  props<{ value: string }>()
);

/** SAFE: Pure state reset — clears the logout reason flag. */
export const resetLogoutReason = createAction('[User-Settings] reset logout reason');

/** SAFE: Command to reset the JWT and log out. Remote may legitimately trigger logout. */
export const resetJwtAction = createAction(
  '[User] reset jwt',
  props<{ logoutReason: LogoutReason; url?: string }>()
);
