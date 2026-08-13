import {LoadingStatus} from "./state.const";

/**
 * The search term and scope the currently-applied filters were built against.
 * Named so it can be referenced from `FilterStateService` selectors; the host
 * declares it inline on its `FilterState`.
 */
export interface PreviousSearchQuery {
  searchTerm: string | undefined;
  scope: string | undefined;
}

export interface FilterState{
  status: LoadingStatus,
  isRememberAll: boolean,
  previousSearchQuery: PreviousSearchQuery
  includedFilter: selectedFilters[] | null,
  excludedFilter: selectedFilters[] | null,
  multiSelectedFilter: MultiSelectedFilter[] | null,
  resourceTypeFilter:  ResourceTypeFilterModel | null,
  resourceTypeFilterStatus: LoadingStatus,
  isFiltersOpen: boolean
}

export interface  selectedFilters{
  name: string
  values: string[]
}

export interface MultiSelectedFilter{
  name: string
  values: MultiSelectedFilterValue[]
}

export interface MultiSelectedFilterValue{
  value : string
  filterType: FilterType
}

export enum FilterType {
  Include = 'include',
  Exclude = 'exclude',
}

export interface ResourceTypeFilterModel {
  resourceType: string;
  count: number;
}
