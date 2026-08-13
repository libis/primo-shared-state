/**
 * Featured-results models from the Primo host application.
 *
 * Source: `src/app/state/featured-results/featured-results.reducer.ts`.
 *
 * The host registers a `featured-results` NgRx slice whose only field is the
 * server-authoritative `data` payload returned alongside a search response
 * (`SearchData.featuredResultJson`). These are pure read-only view models —
 * remotes render them, the host owns every write.
 *
 * No actions from this slice are exported by `shared-actions.ts`:
 * `loadFeaturedResultsAction` carries a server-authoritative payload that a
 * remote cannot construct legitimately, and `clearFeaturedResultsAction` is
 * host-internal cleanup already covered by `clearSearchAction`.
 */

/** A single item in the featured-results bar. */
export interface FeaturedResultItem {
  generalData: string;
  isExpanded: boolean;
  recordId: string;
  thumbnailLinks: string[];
  title: string;
  type: string;
  context: string;
}

/**
 * The featured-results payload attached to a search response.
 *
 * NOTE: `featuedResultsItems` is spelled that way in the host model — the typo
 * originates in the backend JSON and is preserved verbatim so the interface
 * matches the runtime object.
 */
export interface FeaturedResultsData {
  featuedResultsItems: FeaturedResultItem[];
  format: string;
  moreTab: string;
  resourceType: string;
  searchScopeSet: string;
  barTitle: string;
  totalHits: number;
}

/**
 * Minimum number of items the host requires before it renders the
 * featured-results bar. Mirrors `FEATURED_RESULTS_MIN_ITEMS` in the host
 * reducer.
 */
export const FEATURED_RESULTS_MIN_ITEMS = 3;
