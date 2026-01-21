import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FilterState, selectedFilters, MultiSelectedFilter, ResourceTypeFilterModel } from '../models/filter.model';
import { StateHelper } from '../utils/state-helper';

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
    return this.helper.select$((state: any) => state.filters);
  }

  /**
   * Select included filters
   */
  selectIncludedFilters$(): Observable<selectedFilters[] | null> {
    return this.helper.select$((state: any) => state.filters?.includedFilter);
  }

  /**
   * Select excluded filters
   */
  selectExcludedFilters$(): Observable<selectedFilters[] | null> {
    return this.helper.select$((state: any) => state.filters?.excludedFilter);
  }

  /**
   * Select multi-selected filters
   */
  selectMultiSelectedFilters$(): Observable<MultiSelectedFilter[] | null> {
    return this.helper.select$((state: any) => state.filters?.multiSelectedFilter);
  }

  /**
   * Select resource type filter
   */
  selectResourceTypeFilter$(): Observable<ResourceTypeFilterModel | null> {
    return this.helper.select$((state: any) => state.filters?.resourceTypeFilter);
  }

  /**
   * Select if filters panel is open
   */
  selectIsFiltersOpen$(): Observable<boolean> {
    return this.helper.select$((state: any) => state.filters?.isFiltersOpen || false);
  }

  /**
   * Select if "Remember All" is enabled
   */
  selectIsRememberAll$(): Observable<boolean> {
    return this.helper.select$((state: any) => state.filters?.isRememberAll || false);
  }

  /**
   * Get included filters once (snapshot)
   */
  async getIncludedFilters(): Promise<selectedFilters[] | null> {
    return this.helper.selectOnce((state: any) => state.filters?.includedFilter);
  }

  /**
   * Get excluded filters once (snapshot)
   */
  async getExcludedFilters(): Promise<selectedFilters[] | null> {
    return this.helper.selectOnce((state: any) => state.filters?.excludedFilter);
  }

  /**
   * Get multi-selected filters once (snapshot)
   */
  async getMultiSelectedFilters(): Promise<MultiSelectedFilter[] | null> {
    return this.helper.selectOnce((state: any) => state.filters?.multiSelectedFilter);
  }

  /**
   * Dispatch an action to update filter state
   * Note: You need to import and use actual action creators from the host app
   */
  dispatch(action: any): void {
    this.helper.dispatch(action);
  }
}
