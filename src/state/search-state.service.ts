import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Doc, SearchParams, SearchMetaData } from '../models/search.model';
import { LoadingStatus } from '../models/state.const';
import { StateHelper } from '../utils/state-helper';
import {
  clearSearchAction,
  pageLimitChangedAction,
  pageNumberChangedAction,
  searchAction,
  setSearchNotificationMsg,
  sortByChangedAction,
  updateIsSavedSearch,
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
    return this.helper.select$((state: any) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    });
  }

  /**
   * Select a specific document by ID
   */
  selectDocById$(id: string): Observable<Doc | undefined> {
    return this.helper.select$((state: any) => state.Search?.entities?.[id]);
  }

  /**
   * Select search parameters
   */
  selectSearchParams$(): Observable<SearchParams | null> {
    return this.helper.select$((state: any) => state.Search?.searchParams);
  }

  /**
   * Select search metadata (info, facets, etc.)
   */
  selectSearchMetaData$(): Observable<SearchMetaData | null> {
    return this.helper.select$((state: any) => state.Search?.searchResultsMetaData);
  }

  /**
   * Select search loading status
   */
  selectSearchStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: any) => state.Search?.status || 'pending');
  }

  /**
   * Select total number of results
   */
  selectTotalResults$(): Observable<number> {
    return this.helper.select$((state: any) => state.Search?.searchResultsMetaData?.info?.total || 0);
  }

  /**
   * Select selected page size
   */
  selectPageSize$(): Observable<number | null> {
    return this.helper.select$((state: any) => state.Search?.selectedPageSize);
  }

  /**
   * Check if search is loading
   */
  selectIsLoading$(): Observable<boolean> {
    return this.helper.select$((state: any) => state.Search?.status === 'loading');
  }

  /**
   * Get all documents once (snapshot)
   */
  async getAllDocs(): Promise<Doc[]> {
    return this.helper.selectOnce((state: any) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    });
  }

  /**
   * Get a specific document by ID once (snapshot)
   */
  async getDocById(id: string): Promise<Doc | undefined> {
    return this.helper.selectOnce((state: any) => state.Search?.entities?.[id]);
  }

  /**
   * Get search parameters once (snapshot)
   */
  async getSearchParams(): Promise<SearchParams | null> {
    return this.helper.selectOnce((state: any) => state.Search?.searchParams);
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
    return this.helper.selectSignal((state: any) => {
      const searchState = state.Search;
      if (!searchState?.entities) return [];
      return Object.values(searchState.entities).filter((doc): doc is Doc => doc !== undefined);
    }, [] as Doc[]);
  }

  searchParamsSignal(): Signal<SearchParams | null> {
    return this.helper.selectSignal((state: any) => state.Search?.searchParams, null);
  }

  searchMetaDataSignal(): Signal<SearchMetaData | null> {
    return this.helper.selectSignal((state: any) => state.Search?.searchResultsMetaData, null);
  }

  searchStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: any) => state.Search?.status || 'pending', 'pending' as LoadingStatus);
  }

  totalResultsSignal(): Signal<number> {
    return this.helper.selectSignal((state: any) => state.Search?.searchResultsMetaData?.info?.total || 0, 0);
  }

  pageSizeSignal(): Signal<number | null> {
    return this.helper.selectSignal((state: any) => state.Search?.selectedPageSize, null);
  }

  isLoadingSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: any) => state.Search?.status === 'loading', false);
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
}
