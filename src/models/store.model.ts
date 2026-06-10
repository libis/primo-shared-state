/**
 * Root store shape (`AppState`) and per-slice state interfaces for the
 * Primo host application's NgRx store.
 *
 * This file replaces the `state: any` callbacks that used to appear in every
 * `*StateService` selector. Services now select against `AppState` and get
 * full type-checking on feature-key strings and field names.
 *
 * ── Coverage rules ──────────────────────────────────────────────────────────
 * The six slices consumed by services shipped in this package are declared
 * verbatim from the host reducers:
 *
 *   - Search              (SearchState extends EntityState<Doc>)
 *   - user                (UserState — re-exported from user.model.ts)
 *   - filters             (FilterState — re-exported from filter.model.ts)
 *   - account             (AccountState)
 *   - viewConfig          (ViewConfigState)
 *   - linked-data-entity  (LinkedDataEntityState)
 *
 * The remaining 24 slices are declared as opaque
 * `Record<string, unknown>` aliases. This keeps `AppState` complete (so
 * consumers who write their own selectors against an unused slice still
 * type-check at the slice-access level), without forcing this package to
 * re-declare every host-internal field type (IPhysicalServices,
 * PersonalInfoData, TreeNode, Collection, PickupInformationContainer, …).
 *
 * When a future service targets one of the stubbed slices, replace its
 * `Record<string, unknown>` alias with the full interface from the
 * corresponding host reducer, pulling in only the field types that
 * service actually reads.
 *
 * ── Feature-key rules ───────────────────────────────────────────────────────
 * The key strings on `AppState` mirror what each reducer registers with
 * `StoreModule.forFeature(...)` — **do not normalise them**. The host uses a
 * mix of camelCase (`viewConfig`, `bulkActions`, `collectionDiscovery`,
 * `routerState`), PascalCase (`Search`, `Delivery`), kebab-case
 * (`authority-search`, `browse-search`, `citation-trails`, `database-search`,
 * `full-display`, `journal-search`, `linked-data-entity`, `more-from-the-same`,
 * `natural-language-search`, `newspaper-search`, `ngrs-general`,
 * `ngrs-record-data`, `research-assistant`, `citation-trails`), and lowercase
 * (`account`, `atoz`, `categories`, `citations`, `favorites`, `filters`,
 * `frbr`, `language`, `resourceRecommender`, `router`, `user`).
 * Selectors must match the exact runtime key or they return `undefined`.
 */

import { EntityState } from '@ngrx/entity';

import { Doc, Facet, SearchMetaData, SearchParams } from './search.model';
import { UserState } from './user.model';
import { FilterState } from './filter.model';
import { LoadingStatus } from './state.const';
import { ViewConfigData } from './view-config.model';
import {
  EntityMultiLangData,
  EntityWikiData,
  RelatedDocList,
  RelatedEntitiesMultiLangDataList,
} from './entity.model';
import {
  LoanItem,
  MappedFineItem,
  MappedInstItem,
  MappedRequestItem,
  SearchHistoryItem,
} from './account.model';

/* ── Fully-typed slices ─────────────────────────────────────────────────── */

export interface SearchState extends EntityState<Doc> {
  status: LoadingStatus;
  searchParams: SearchParams | null;
  searchResultsMetaData: SearchMetaData | null;
  selectedPageSize: number | null;
  filter: { status: LoadingStatus; filters: Facet[] | null };
  searchNotificationMsg: string;
  presentNotification: boolean;
  isSearchAndAppendMode?: boolean;
  numOfItemsToAppend?: number;
  pcAvailabilityToggleValue: boolean;
  searchInFullTextToggleValue?: boolean;
  fullDisplayRecordYouCameFrom: string;
  lastSearchTerms?: string[];
  currentSearchTerm?: string;
  selectedSortBy?: string | null;
  isSnackBarOpen: boolean;
  isReportAProblemOpen: boolean;
  displaySummary: boolean;
  isSavedSearch: boolean;
  isResourceRecommenderExpanded: boolean;
}

export interface ViewConfigState {
  status: LoadingStatus;
  config: ViewConfigData | undefined;
  error?: unknown;
}

export interface LinkedDataEntityState {
  entityId?: string;
  entity?: EntityMultiLangData;
  entityStatus: LoadingStatus;
  wikiData?: EntityWikiData;
  wikiDataStatus: LoadingStatus;
  relatedDocs?: RelatedDocList[];
  relatedDocsStatus: LoadingStatus;
  relatedEntities?: RelatedEntitiesMultiLangDataList[];
  relatedEntitiesStatus: LoadingStatus;
}

/**
 * `AccountState` is the host account slice. Fields whose value types are
 * not exposed by this package (`PersonalInfoData`, internal
 * `NotificationSource` enum) are typed as `unknown` — no service in this
 * package selects them, and exposing them would require copying private
 * host types.
 */
export interface AccountState {
  institutionsList: MappedInstItem[] | undefined;
  selectedInstitution: MappedInstItem | undefined;
  loansCounter: number | undefined;
  historicLoansCounter: number | undefined;
  isLoansBadgeIndication: boolean | undefined;
  requestsCounter: number | undefined;
  isRequestsBadgeIndication: boolean | undefined;
  finesCounter: number | undefined;
  isFinesBadgeIndication: boolean | undefined;
  blocksCounter: number | undefined;
  isBlocksBadgeIndication: boolean | undefined;
  favoritesCounter: number | undefined;
  searchHistoryCounter: number | undefined;
  savedSearchesCounter: number | undefined;
  savedSearchesList: SearchHistoryItem[];
  savedSearchesOffset: number;
  savedSearchesBulk: number;
  savedSearchesStatus: LoadingStatus;
  loansList: LoanItem[];
  timezone: string | undefined;
  historicLoans: string | undefined;
  loansType: string;
  loansOffset: number;
  loansBulk: number;
  loansStatus: LoadingStatus;
  searchHistoryList: SearchHistoryItem[];
  searchHistoryOffset: number;
  searchHistoryBulk: number;
  searchHistoryStatus: LoadingStatus;
  searchHistoryType: string;
  requestsList: MappedRequestItem[];
  requestsType: string;
  requestsOffset: number;
  requestsBulk: number;
  requestsListCounter: number;
  requestsStatus: LoadingStatus;
  requestsSelectedTypes: string[];
  presentAccountNotification: boolean;
  notificationType: unknown;
  notificationAriaLabel?: string;
  notificationMessage?: string;
  notificationDataQA: string;
  finesList: MappedFineItem[];
  finesType: string;
  finesOffset: number;
  finesBulk: number;
  finesTotalNum: number | undefined;
  finesFilteredListCounter: number;
  finesStatus: LoadingStatus;
  personalDetails: unknown;
}

/* ── Stubbed slices (opaque — flesh out when a service targets them) ────── */

export type AtozState = Record<string, unknown>;
export type AuthoritySearchState = Record<string, unknown>;
export type BrowseSearchState = Record<string, unknown>;
export type BulkActionsState = Record<string, unknown>;
export type CategoryState = Record<string, unknown>;
export type CitationTrailsState = Record<string, unknown>;
export type CitationState = Record<string, unknown>;
export type CollectionDiscoveryState = Record<string, unknown>;
export type DatabaseSearchState = Record<string, unknown>;
export type DeliveryState = Record<string, unknown>;
export type FavoriteState = Record<string, unknown>;
export type FrbrState = Record<string, unknown>;
export type FullDisplayState = Record<string, unknown>;
export type JournalSearchState = Record<string, unknown>;
export type LanguageState = Record<string, unknown>;
export type MoreFromTheSameState = Record<string, unknown>;
export type NaturalLanguageSearchState = Record<string, unknown>;
export type NewspaperSearchState = Record<string, unknown>;
export type NgrsGeneralState = Record<string, unknown>;
export type NgrsRecordDataState = Record<string, unknown>;
export type ResearchAssistantState = Record<string, unknown>;
export type ResourceRecommenderState = Record<string, unknown>;
export type RouterStateReducer = Record<string, unknown>;
export type RouterReducerState = Record<string, unknown>;

/* ── Root store ─────────────────────────────────────────────────────────── */

export interface AppState {
  account: AccountState;
  atoz: AtozState;
  'authority-search': AuthoritySearchState;
  'browse-search': BrowseSearchState;
  bulkActions: BulkActionsState;
  categories: CategoryState;
  'citation-trails': CitationTrailsState;
  citations: CitationState;
  collectionDiscovery: CollectionDiscoveryState;
  'database-search': DatabaseSearchState;
  Delivery: DeliveryState;
  favorites: FavoriteState;
  filters: FilterState;
  frbr: FrbrState;
  'full-display': FullDisplayState;
  'journal-search': JournalSearchState;
  language: LanguageState;
  'linked-data-entity': LinkedDataEntityState;
  'more-from-the-same': MoreFromTheSameState;
  'natural-language-search': NaturalLanguageSearchState;
  'newspaper-search': NewspaperSearchState;
  'ngrs-general': NgrsGeneralState;
  'ngrs-record-data': NgrsRecordDataState;
  'research-assistant': ResearchAssistantState;
  resourceRecommender: ResourceRecommenderState;
  router: RouterReducerState;
  routerState: RouterStateReducer;
  Search: SearchState;
  user: UserState;
  viewConfig: ViewConfigState;
}
