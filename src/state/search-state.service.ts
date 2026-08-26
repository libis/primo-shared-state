import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Doc, Facet, SearchParams, SearchMetaData } from '../models/search.model';
import { LoadingStatus } from '../models/state.const';
import { AppState } from '../models/store.model';
import { StateHelper } from '../utils/state-helper';
import {
  clearSearchAction,
  pageLimitChangedAction,
  pageNumberChangedAction,
  searchAction,
  setSearchNotificationMsg,
  sortByChangedAction,
  updateIsSavedSearch,
  setDisplaySummaryAction,
  setIsSnackBarOpenAction,
  setIsReportAProblemOpenAction,
  setIsResourceRecommenderExpandedAction,
  saveCurrentSearchTermAction,
  updateLastSearchTermsAction,
  updateFullDisplayRecordYouCameFromAction,
  pcAvailabilityToggleChanged,
  searchInFullTextToggleChanged,
  setPresentNotificationAction,
  changePcAvailabilityToggleValue,
  changeSearchInFullTextToggleValue,
} from '../actions/shared-actions';

/**
 * Service for managing search state
 * Provides methods to read and write search-related data in the store
 *
 * @deprecated Since 2026.6.1 — inject {@link PrimoStateService} and use
 * `primo.search` instead. The direct service export will be removed in a
 * future regeneration.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  /**
   * Select all search results (documents)
   */
  selectAllDocs$(): Observable<Doc[]> {
    return this.helper.select$((state: AppState) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    });
  }

  /**
   * Select a specific document by ID
   */
  selectDocById$(id: string): Observable<Doc | undefined> {
    return this.helper.select$((state: AppState) => state.Search?.entities?.[id]);
  }

  /**
   * Select search parameters
   */
  selectSearchParams$(): Observable<SearchParams | null> {
    return this.helper.select$((state: AppState) => state.Search?.searchParams);
  }

  /**
   * Select search metadata (info, facets, etc.)
   */
  selectSearchMetaData$(): Observable<SearchMetaData | null> {
    return this.helper.select$((state: AppState) => state.Search?.searchResultsMetaData);
  }

  /**
   * Select search loading status
   */
  selectSearchStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.Search?.status || 'pending');
  }

  /**
   * Select total number of results
   */
  selectTotalResults$(): Observable<number> {
    return this.helper.select$((state: AppState) => state.Search?.searchResultsMetaData?.info?.total || 0);
  }

  /**
   * Select selected page size
   */
  selectPageSize$(): Observable<number | null> {
    return this.helper.select$((state: AppState) => state.Search?.selectedPageSize);
  }

  /**
   * Check if search is loading
   */
  selectIsLoading$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.status === 'loading');
  }

  selectSearchNotificationMsg$(): Observable<string> {
    return this.helper.select$((state: AppState) => state.Search?.searchNotificationMsg || '');
  }

  selectPcAvailabilityToggleValue$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.pcAvailabilityToggleValue || false);
  }

  selectSearchInFullTextToggleValue$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.searchInFullTextToggleValue || false);
  }

  selectIsSnackBarOpen$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.isSnackBarOpen || false);
  }

  selectDisplaySummary$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.displaySummary || false);
  }

  selectIsReportAProblemOpen$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.isReportAProblemOpen || false);
  }

  selectCurrentSearchTerm$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.Search?.currentSearchTerm);
  }

  selectSelectedSortBy$(): Observable<string | null> {
    return this.helper.select$((state: AppState) => state.Search?.selectedSortBy || null);
  }

  /**
   * Offset of the result page the user last viewed.
   *
   * Read-only: the host writes this on search success from `searchParams.offset`
   * and reads it back when restoring the results page after a full-display
   * record. No exported action writes it, so there is no dispatch helper.
   */
  selectLastViewedOffset$(): Observable<number | null> {
    return this.helper.select$((state: AppState) => state.Search?.lastViewedOffset ?? null);
  }

  selectLastSearchTerms$(): Observable<string[]> {
    return this.helper.select$((state: AppState) => state.Search?.lastSearchTerms || []);
  }

  selectFullDisplayRecordYouCameFrom$(): Observable<string> {
    return this.helper.select$((state: AppState) => state.Search?.fullDisplayRecordYouCameFrom || '');
  }

  selectIsResourceRecommenderExpanded$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.isResourceRecommenderExpanded || false);
  }

  /** Whether the current search is stored as a saved search. Counterpart read for {@link setIsSavedSearch}. */
  selectIsSavedSearch$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.isSavedSearch || false);
  }

  /** Whether the search notification banner is currently shown. Counterpart read for {@link setPresentNotification}. */
  selectPresentNotification$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.presentNotification || false);
  }

  /** Facets attached to the current search, with their own load status. */
  selectFilterFacets$(): Observable<Facet[] | null> {
    return this.helper.select$((state: AppState) => state.Search?.filter?.filters ?? null);
  }

  selectFilterStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.Search?.filter?.status || 'pending');
  }

  /**
   * Get all documents once (snapshot)
   */
  async getAllDocs(): Promise<Doc[]> {
    return this.helper.selectOnce((state: AppState) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    });
  }

  /**
   * Get a specific document by ID once (snapshot)
   */
  async getDocById(id: string): Promise<Doc | undefined> {
    return this.helper.selectOnce((state: AppState) => state.Search?.entities?.[id]);
  }

  /**
   * Get search parameters once (snapshot)
   */
  async getSearchParams(): Promise<SearchParams | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.searchParams);
  }

  async getSearchMetaData(): Promise<SearchMetaData | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.searchResultsMetaData);
  }

  async getSearchStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.Search?.status || 'pending');
  }

  async getTotalResults(): Promise<number> {
    return this.helper.selectOnce((state: AppState) => state.Search?.searchResultsMetaData?.info?.total || 0);
  }

  async getPageSize(): Promise<number | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.selectedPageSize);
  }

  async isLoading(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.status === 'loading');
  }

  async getSearchNotificationMsg(): Promise<string> {
    return this.helper.selectOnce((state: AppState) => state.Search?.searchNotificationMsg || '');
  }

  async getPcAvailabilityToggleValue(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.pcAvailabilityToggleValue || false);
  }

  async getSearchInFullTextToggleValue(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.searchInFullTextToggleValue || false);
  }

  async isSnackBarOpen(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.isSnackBarOpen || false);
  }

  async getDisplaySummary(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.displaySummary || false);
  }

  async isReportAProblemOpen(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.isReportAProblemOpen || false);
  }

  async getCurrentSearchTerm(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.Search?.currentSearchTerm);
  }

  async getSelectedSortBy(): Promise<string | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.selectedSortBy || null);
  }

  async getLastViewedOffset(): Promise<number | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.lastViewedOffset ?? null);
  }

  async getLastSearchTerms(): Promise<string[]> {
    return this.helper.selectOnce((state: AppState) => state.Search?.lastSearchTerms || []);
  }

  async getFullDisplayRecordYouCameFrom(): Promise<string> {
    return this.helper.selectOnce((state: AppState) => state.Search?.fullDisplayRecordYouCameFrom || '');
  }

  async isResourceRecommenderExpanded(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.isResourceRecommenderExpanded || false);
  }

  async isSavedSearch(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.isSavedSearch || false);
  }

  async isPresentNotification(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.presentNotification || false);
  }

  async getFilterFacets(): Promise<Facet[] | null> {
    return this.helper.selectOnce((state: AppState) => state.Search?.filter?.filters ?? null);
  }

  async getFilterStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.Search?.filter?.status || 'pending');
  }

  /**
   * Dispatch an action to update search state
   * Note: You need to import and use actual action creators from the host app
   */
  dispatch(action: any): void {
    this.helper.dispatch(action);
  }

  // ── Signal API ──────────────────────────────────────────────────────────────

  allDocsSignal(): Signal<Doc[]> {
    return this.helper.selectSignal((state: AppState) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    }, [] as Doc[]);
  }

  docByIdSignal(id: string): Signal<Doc | undefined> {
    return this.helper.selectSignal((state: AppState) => state.Search?.entities?.[id], undefined);
  }

  searchParamsSignal(): Signal<SearchParams | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.searchParams, null);
  }

  searchMetaDataSignal(): Signal<SearchMetaData | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.searchResultsMetaData, null);
  }

  searchStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.Search?.status || 'pending', 'pending' as LoadingStatus);
  }

  totalResultsSignal(): Signal<number> {
    return this.helper.selectSignal((state: AppState) => state.Search?.searchResultsMetaData?.info?.total || 0, 0);
  }

  pageSizeSignal(): Signal<number | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.selectedPageSize, null);
  }

  isLoadingSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.status === 'loading', false);
  }

  searchNotificationMsgSignal(): Signal<string> {
    return this.helper.selectSignal((state: AppState) => state.Search?.searchNotificationMsg || '', '');
  }

  pcAvailabilityToggleValueSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.pcAvailabilityToggleValue || false, false);
  }

  searchInFullTextToggleValueSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.searchInFullTextToggleValue || false, false);
  }

  isSnackBarOpenSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.isSnackBarOpen || false, false);
  }

  displaySummarySignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.displaySummary || false, false);
  }

  isReportAProblemOpenSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.isReportAProblemOpen || false, false);
  }

  currentSearchTermSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.Search?.currentSearchTerm, undefined);
  }

  selectedSortBySignal(): Signal<string | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.selectedSortBy || null, null);
  }

  lastViewedOffsetSignal(): Signal<number | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.lastViewedOffset ?? null, null);
  }

  lastSearchTermsSignal(): Signal<string[]> {
    return this.helper.selectSignal((state: AppState) => state.Search?.lastSearchTerms || [], [] as string[]);
  }

  fullDisplayRecordYouCameFromSignal(): Signal<string> {
    return this.helper.selectSignal((state: AppState) => state.Search?.fullDisplayRecordYouCameFrom || '', '');
  }

  isResourceRecommenderExpandedSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.isResourceRecommenderExpanded || false, false);
  }

  isSavedSearchSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.isSavedSearch || false, false);
  }

  presentNotificationSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.presentNotification || false, false);
  }

  filterFacetsSignal(): Signal<Facet[] | null> {
    return this.helper.selectSignal((state: AppState) => state.Search?.filter?.filters ?? null, null);
  }

  filterStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.Search?.filter?.status || 'pending', 'pending' as LoadingStatus);
  }

  // ── Typed dispatch helpers ──────────────────────────────────────────────────

  search(searchParams: SearchParams, searchType?: string): void {
    this.helper.dispatch(searchAction({ searchParams, searchType }));
  }

  clearSearch(): void {
    this.helper.dispatch(clearSearchAction());
  }

  setPageLimit(limit: number): void {
    this.helper.dispatch(pageLimitChangedAction({ limit }));
  }

  setPageNumber(pageNumber: number): void {
    this.helper.dispatch(pageNumberChangedAction({ pageNumber }));
  }

  setSortBy(sort: string): void {
    this.helper.dispatch(sortByChangedAction({ sort }));
  }

  setIsSavedSearch(isSavedSearch: boolean): void {
    this.helper.dispatch(updateIsSavedSearch({ isSavedSearch }));
  }

  setSearchNotificationMessage(msg: string): void {
    this.helper.dispatch(setSearchNotificationMsg({ msg }));
  }

  setDisplaySummary(displaySummary: boolean): void {
    this.helper.dispatch(setDisplaySummaryAction({ displaySummary }));
  }

  setIsSnackBarOpen(isSnackBarOpen: boolean): void {
    this.helper.dispatch(setIsSnackBarOpenAction({ isSnackBarOpen }));
  }

  setIsReportAProblemOpen(isReportAProblemOpen: boolean): void {
    this.helper.dispatch(setIsReportAProblemOpenAction({ isReportAProblemOpen }));
  }

  toggleExpandMyResults(pcAvailabilityToggleValue: boolean): void {
    this.helper.dispatch(pcAvailabilityToggleChanged({ pcAvailabilityToggleValue }));
  }

  toggleSearchInFullText(searchInFullTextToggleValue: boolean): void {
    this.helper.dispatch(searchInFullTextToggleChanged({ searchInFullTextToggleValue }));
  }

  saveCurrentSearchTerm(searchTerm: string): void {
    this.helper.dispatch(saveCurrentSearchTermAction({ searchTerm }));
  }

  addLastSearchTerm(lastSearchTerm: string): void {
    this.helper.dispatch(updateLastSearchTermsAction({ lastSearchTerm }));
  }

  setFullDisplayRecordYouCameFrom(fullDisplayRecordYouCameFrom: string): void {
    this.helper.dispatch(updateFullDisplayRecordYouCameFromAction({ fullDisplayRecordYouCameFrom }));
  }

  setIsResourceRecommenderExpanded(isResourceRecommenderExpanded: boolean): void {
    this.helper.dispatch(setIsResourceRecommenderExpandedAction({ isResourceRecommenderExpanded }));
  }

  /** Shows or hides the search notification banner. Pure UI write — no search is triggered. */
  setPresentNotification(presentNotification: boolean): void {
    this.helper.dispatch(setPresentNotificationAction({ presentNotification }));
  }

  /**
   * Sets the Expand-My-Results toggle **without** running a new search.
   * Use {@link toggleExpandMyResults} when the user flipped the toggle and a
   * fresh search is expected.
   */
  setExpandMyResultsValue(pcAvailabilityToggleValue: boolean): void {
    this.helper.dispatch(changePcAvailabilityToggleValue({ pcAvailabilityToggleValue }));
  }

  /**
   * Sets the search-in-full-text toggle **without** running a new search.
   * Use {@link toggleSearchInFullText} when the user flipped the toggle and a
   * fresh search is expected.
   */
  setSearchInFullTextValue(searchInFullTextToggleValue: boolean): void {
    this.helper.dispatch(changeSearchInFullTextToggleValue({ searchInFullTextToggleValue }));
  }
}
