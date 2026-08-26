/**
 * Account display models from the Primo host application.
 * These are read-only view models — remotes read account data via
 * AccountStateService selectors but never write to account state.
 *
 * EXCLUDED (unsafe for remote access):
 * - RequestOptions — enables ILS mutation path (body/params for ILS calls)
 * - NestedRequestOptions — enables ILS mutation path (nested params)
 * - PersonalDetailsInfo — carries editable personal data (address, phone, email)
 * These interfaces must remain host-only to prevent state corruption.
 */

import { SavedSearchInterface } from './view-config.model';
import { SearchParams } from './search.model';

export interface Counters {
  [key: string]: string;
}

export interface MenuOption {
  optionName: string;
  headerLabel: string;
  ariaLabel: string;
  ariaLabelFoLoginMenu: string;
  ariaLabelForBadge: string;
  iconID: string;
  route: string;
  counterKey: string;
  dataQa: string;
  menuSection: number;
  disabledForGuest: boolean;
  configuredName: string;
}

export interface RequestItem {
  type: string;
  application?: string;
  author?: string;
  available?: string;
  cancel?: string;
  holdstatus: string;
  format?: string;
  materialtype?: string;
  externalrequestid?: string;
  ilsinstitutioncode?: string;
  ilsinstitutionname?: string;
  mmsid?: string;
  requestid: string;
  requeststatus?: string;
  requesttype?: string;
  title: string;
  pickuplocationname?: string;
  preferredpickuplocationname?: string;
  publicationdate?: string;
  statuscode?: string;
  expirationdate?: string;
  journaltitle?: string;
  chaptertitle?: string;
  chapterauthor?: string;
  chapternumber?: string;
  pages?: string;
  opus?: string;
  musicpart?: string;
  songmovement?: string;
  composer?: string;
  requestexternalfileurl?: string;
  maximumviews?: number;
  currentviews?: number;
  deliveryurl?: string;
  downloadexpirydate?: string;
  renewable?: string;
  duedate?: string;
  loanexpired?: string;
  onwaitlist?: string;
  nomorerenewal?: string;
  renewalopen?: string;
  volume?: string;
  renewablerapidosa?: string;
  requestdate?: string;
  bookingstarthour?: string;
  bookingendhour?: string;
  bookingstartdate?: string;
  bookingenddate?: string;
  isExpanded: boolean;
  [key: string]: string | boolean | number | undefined;
  fromNetworkMember?: boolean;   // set on cross-network (consortium) activity
}

export interface FavoriteItem {
  author?: string;
  creationDate?: string;
  labels: string[];
  recordId?: string;
  title?: string;
}

export interface FineItem {
  description?: string;
  finedate: string;
  fineid: string;
  finemainlocation: string;
  finestatus: string;
  finesum: string;
  ilsinstitutioncode?: string;
  ilsinstitutionname?: string;
  isAlert: boolean;
  originalfinesum: string;
  title: string;
  type: string;
  [key: string]: string | boolean | undefined;
  fromNetworkMember?: boolean;   // set on cross-network (consortium) activity
}

export interface RenewStatus {
  renewstatus: string[];
}

export interface LoanItem {
  itemType: 'loan';
  secondarylocationname: string;
  itemcategoryname: string;
  year: string;
  itemcategorycode: string;
  callnumber: string;
  mainlocationcode: string;
  loandate: string;
  mainlocationname: string;
  title: string;
  duehour: string;
  alerts: string[];
  ilsinstitutioncode: string;
  itemid: string;
  itemstatusname: string;
  duedate: string;
  loanstatus: string;
  secondarylocationcode: string;
  ilsinstitutionname: string;
  renewstatuses: RenewStatus;
  renew: string;
  mmsid: string;
  loanid: string;
  itembarcode: string;
  lastrenewdate?: string;
  author?: string;
  fine?: string;
  description?: string;
  returndate: string;
  returnhour: string;
  isExpanded: boolean;
  [key: string]: string | RenewStatus | string[] | boolean | undefined;
  fromNetworkMember?: boolean;   // set on cross-network (consortium) activity
}

export interface ExpandKeyValue {
  data: string;
  label: string;
}

export interface MappedRequestItem {
  itemType: 'request';
  type: string;
  requestId: string;
  mmsid?: string;
  ilsinstitutioncode?: string;
  ilsinstitutionname?: string;
  requestType: string;
  title: string;
  status: string;
  isCancelable: boolean;
  firstLine: string;
  secondLine: string;
  fourthLine: string;
  thirdLine: string;
  isExpanded: boolean;
  expandedDisplay: ExpandKeyValue[];
  illExpandedDisplay: ExpandKeyValue[];
  isAlert: boolean;
  format?: string;
  statusCode?: string;
  expirationDate?: string;
  externalId?: string;
  materialType?: string;
  journalTitle?: string;
  chapterTitle?: string;
  chapterAuthor?: string;
  chapterNumber?: string;
  publicationDate?: string;
  pages?: string;
  opus?: string;
  musicPart?: string;
  songMovement?: string;
  composer?: string;
  isDownloadable: boolean;
  isViewable: boolean;
  requestExternalFileURL?: string;
  maxNumOfViews?: number;
  currNumOfViews?: number;
  deliveryUrl?: string;
  downloadExpiryDate?: string;
  renewable: boolean;
  rsDuedate?: string;
  rapidoDueDate?: string;
  loanExpired: boolean;
  onWaitlist: boolean;
  noMoreRenewal: boolean;
  renewalOpen: boolean;
  volume?: string;
  renewableRapidoSA: boolean;
  requestdate?: string;
  resource?: string;
  requestDates: ExpandKeyValue[] | undefined;
  fromNetworkMember?: boolean;   // set on cross-network (consortium) activity
}

export interface MappedFineItem {
  itemType: 'fine';
  fineId: string;
  isAlert: boolean;
  fineDate: string;
  title: string;
  firstLine: string;
  thirdLineLabel: string;
  secondLine: string;
  fourthLine: string;
  isExpanded: boolean;
  fineType: string;
  sumToDisplay: string;
  expandedDisplay: ExpandKeyValue[];
  /** ILS institution the fine belongs to; set for cross-network fines. */
  ilsinstitutioncode?: string;
  fromNetworkMember?: boolean;   // set on cross-network (consortium) activity
}

/**
 * A single patron block message, as stored in `AccountState.blocksList`.
 *
 * Pure display data — the host's account effects populate it from the ILS
 * blocks response. Read it via `AccountStateService.selectBlocksList$()`;
 * remotes never write it.
 */
export interface BlockMessage {
  ilsinstitutioncode: string;
  ilsinstitutionname: string;
  text: string;
  type: string;
}

export interface accountViewModel {
  loansCounter: number | undefined;
  requestsCounter: number | undefined;
  finesCounter: number | undefined;
  blocksCounter: number | undefined;
  favoritesCounter: number | undefined;
  searchHistoryCounter: number | undefined;
  savedSearchesCounter: number | undefined;
  menuOptionsForFirstSection: MenuOption[];
  menuOptionsForSecondSection: MenuOption[];
  isLoansBadgeIndication: boolean | undefined;
  isRequestsBadgeIndication: boolean | undefined;
  isFinesBadgeIndication: boolean | undefined;
  isBlocksBadgeIndication: boolean | undefined;
  finesCurrency: string | undefined;
  [key: string]: number | undefined | MenuOption[] | boolean | string;
}

export interface accountGuestViewModel {
  favoritesCounter: number | undefined;
  searchHistoryCounter: number | undefined;
  menuOptionsForSecondSection: MenuOption[];
  [key: string]: number | undefined | MenuOption[];
}

export interface MappedInstItem {
  label: string;
  value: {
    institutionCode: string;
    patronId: string | undefined;
  };
}

export type ItemType = 'searchHistory' | 'savedSearches';

export interface MapSearchParams extends Omit<SearchParams, 'q' | 'multiFacets' | 'qInclude' | 'qExclude'> {
  query: string;
  mfacet?: string;
  facet?: string;
}

export interface SearchHistoryItem extends SavedSearchInterface, Omit<MapSearchParams, 'lang'> {
  itemType: ItemType;
  title: string;
}

export interface RequestStep {
  label: string;
  completed: boolean;
  date: string | undefined;
}

export interface Loans {
  loan: LoanItem[];
  historicloans: string;
  timezone: string;
  hasAlerts: boolean;
  showmore: string[];
}

export interface CrossNetworkResponse {
  data: CrossNetworkData;
}

/**
 * Fines section of a cross-network activity response.
 *
 * NOTE (2026.9.1): `CrossNetworkData.fines` was previously typed as
 * `CounterListOfActions` (`{ action: CounterAction[] }`). That never matched
 * the host — `account.model.ts` in the NDE source has always declared this
 * section as `{ fine?, finesTotalSum? }`, so reading `.fines.action` returned
 * `undefined` at runtime. The type is corrected here; `CounterListOfActions`
 * itself is still exported and unchanged.
 */
export interface CrossNetworkFines {
  fine?: FineItem[];
  finesTotalSum?: number;
}

export interface CrossNetworkData {
  requests: RequestsData;
  loans: Loans;
  fines: CrossNetworkFines;
}

export interface RequestsData {
  holds: { hold: RequestItem[] };
  photocopies: { photocopy: RequestItem[] };
  acqs: { acq: RequestItem[] };
  ills: { ill: RequestItem[] };
  bookings: { booking: RequestItem[] };
  cdls: { cdl: RequestItem[] };
  shortloans: { shortloan: RequestItem[] };
  callslips: { callslip: RequestItem[] };
}

export interface CounterAction {
  type: string;
  value: string;
}

export interface CounterListOfActions {
  action: CounterAction[];
}

export type PageType = 'loans' | 'requests' | 'fines' | 'searchHistory' | 'savedSearches';

export const ActionTypes = {
  SideMenuNavigation: 'Side Menu Navigation',
  BoxNavigation: 'Box Navigation',
  InstitutionSelection: 'Institution Selection'
} as const;
