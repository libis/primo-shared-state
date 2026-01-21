import {LoadingStatus} from "./state.const";

export interface FilterState{
  status: LoadingStatus,
  isRememberAll: boolean,
  previousSearchQuery: {searchTerm: string | undefined, scope: string | undefined}
  includedFilter: selectedFilters[] | null,
  excludedFilter: selectedFilters[] | null,
  multiSelectedFilter: MultiSelectedFilter[] | null,
  resourceTypeFilter:  ResourceTypeFilterModel | null,
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
