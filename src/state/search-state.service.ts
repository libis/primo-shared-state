import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Doc, SearchParams, SearchMetaData } from '../models/search.model';
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
  saveCurrentSearchTermAction,
  pcAvailabilityToggleChanged,
  searchInFullTextToggleChanged,
} from '../actions/shared-actions';

/**
 * Service for managing search state
 * Provides methods to read and write search-related data in the store
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

  selectIsOffsetLimitExceeded$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.Search?.isOffsetLimitExceeded || false);
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

  async isOffsetLimitExceeded(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.Search?.isOffsetLimitExceeded || false);
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

  isOffsetLimitExceededSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.Search?.isOffsetLimitExceeded || false, false);
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
}
