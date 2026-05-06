import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FilterState, selectedFilters, MultiSelectedFilter, ResourceTypeFilterModel } from '../models/filter.model';
import { LoadingStatus } from '../models/state.const';
import { AppState } from '../models/store.model';
import { StateHelper } from '../utils/state-helper';
import { SearchParams } from '../models/search.model';
import {
  loadFiltersAction,
  updateSortByParam as updateSortByParamAction,
  IncludeFilterButtonClickedAction,
  ExcludeFilterButtonClickedAction,
  applyMultiSelectFiltersAction,
  clearAllFiltersAction,
  resourceTypeFilterSelectedAction,
  setIsFiltersOpenAction,
  rememberAllChangeValueAction,
  FilterGroupValue,
} from '../actions/shared-actions';

/**
 * Service for managing filter state
 * Provides methods to read and write filter-related data in the store
 */
@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  /**
   * Select the entire filter state
   */
  selectFilterState$(): Observable<FilterState> {
    return this.helper.select$((state: AppState) => state.filters);
  }

  /**
   * Select included filters
   */
  selectIncludedFilters$(): Observable<selectedFilters[] | null> {
    return this.helper.select$((state: AppState) => state.filters?.includedFilter);
  }

  /**
   * Select excluded filters
   */
  selectExcludedFilters$(): Observable<selectedFilters[] | null> {
    return this.helper.select$((state: AppState) => state.filters?.excludedFilter);
  }

  /**
   * Select multi-selected filters
   */
  selectMultiSelectedFilters$(): Observable<MultiSelectedFilter[] | null> {
    return this.helper.select$((state: AppState) => state.filters?.multiSelectedFilter);
  }

  /**
   * Select resource type filter
   */
  selectResourceTypeFilter$(): Observable<ResourceTypeFilterModel | null> {
    return this.helper.select$((state: AppState) => state.filters?.resourceTypeFilter);
  }

  /**
   * Select if filters panel is open
   */
  selectIsFiltersOpen$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.filters?.isFiltersOpen || false);
  }

  /**
   * Select if "Remember All" is enabled
   */
  selectIsRememberAll$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.filters?.isRememberAll || false);
  }

  selectResourceTypeFilterStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.filters?.resourceTypeFilterStatus || 'pending');
  }

  /**
   * Get included filters once (snapshot)
   */
  async getIncludedFilters(): Promise<selectedFilters[] | null> {
    return this.helper.selectOnce((state: AppState) => state.filters?.includedFilter);
  }

  /**
   * Get excluded filters once (snapshot)
   */
  async getExcludedFilters(): Promise<selectedFilters[] | null> {
    return this.helper.selectOnce((state: AppState) => state.filters?.excludedFilter);
  }

  /**
   * Get multi-selected filters once (snapshot)
   */
  async getMultiSelectedFilters(): Promise<MultiSelectedFilter[] | null> {
    return this.helper.selectOnce((state: AppState) => state.filters?.multiSelectedFilter);
  }

  async getFilterState(): Promise<FilterState> {
    return this.helper.selectOnce((state: AppState) => state.filters);
  }

  async getResourceTypeFilter(): Promise<ResourceTypeFilterModel | null> {
    return this.helper.selectOnce((state: AppState) => state.filters?.resourceTypeFilter);
  }

  async isFiltersOpen(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.filters?.isFiltersOpen || false);
  }

  async isRememberAll(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.filters?.isRememberAll || false);
  }

  async getResourceTypeFilterStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.filters?.resourceTypeFilterStatus || 'pending');
  }

  /**
   * Dispatch an action to update filter state
   * Note: You need to import and use actual action creators from the host app
   */
  dispatch(action: any): void {
    this.helper.dispatch(action);
  }

  // ── Signal API ──────────────────────────────────────────────────────────────

  filterStateSignal(): Signal<FilterState> {
    return this.helper.selectSignal((state: AppState) => state.filters, {} as FilterState);
  }

  includedFiltersSignal(): Signal<selectedFilters[] | null> {
    return this.helper.selectSignal((state: AppState) => state.filters?.includedFilter, null);
  }

  excludedFiltersSignal(): Signal<selectedFilters[] | null> {
    return this.helper.selectSignal((state: AppState) => state.filters?.excludedFilter, null);
  }

  multiSelectedFiltersSignal(): Signal<MultiSelectedFilter[] | null> {
    return this.helper.selectSignal((state: AppState) => state.filters?.multiSelectedFilter, null);
  }

  resourceTypeFilterSignal(): Signal<ResourceTypeFilterModel | null> {
    return this.helper.selectSignal((state: AppState) => state.filters?.resourceTypeFilter, null);
  }

  isFiltersOpenSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.filters?.isFiltersOpen || false, false);
  }

  isRememberAllSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.filters?.isRememberAll || false, false);
  }

  resourceTypeFilterStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.filters?.resourceTypeFilterStatus || 'pending', 'pending' as LoadingStatus);
  }

  // ── Typed dispatch helpers ──────────────────────────────────────────────────

  loadFilters(searchParams: SearchParams, facetsCacheKey?: number): void {
    this.helper.dispatch(loadFiltersAction({ searchParams, facetsCacheKey }));
  }

  updateSortByParam(sort: string): void {
    this.helper.dispatch(updateSortByParamAction({ sort }));
  }

  includeFilter(filterGroup: string, filterValue: string, mergedLabels: string[] = []): void {
    this.helper.dispatch(IncludeFilterButtonClickedAction({ filterGroup, filterValue, mergedLabels }));
  }

  excludeFilter(filterGroup: string, filterValue: string, mergedLabels: string[] = []): void {
    this.helper.dispatch(ExcludeFilterButtonClickedAction({ filterGroup, filterValue, mergedLabels }));
  }

  applyMultiSelectFilters(multiSelectedFilters: FilterGroupValue[]): void {
    this.helper.dispatch(applyMultiSelectFiltersAction({ multiSelectedFilters }));
  }

  clearAllFilters(searchParams?: SearchParams): void {
    this.helper.dispatch(clearAllFiltersAction({ searchParams }));
  }

  selectResourceType(selectedResourceType: ResourceTypeFilterModel, index = 0): void {
    this.helper.dispatch(resourceTypeFilterSelectedAction({ selectedResourceType, index }));
  }

  setFiltersOpen(isFiltersOpen: boolean): void {
    this.helper.dispatch(setIsFiltersOpenAction({ isFiltersOpen }));
  }

  setRememberAll(newValue: boolean): void {
    this.helper.dispatch(rememberAllChangeValueAction({ newValue }));
  }
}
