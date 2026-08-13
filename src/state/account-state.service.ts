import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  BlockMessage,
  LoanItem,
  MappedRequestItem,
  MappedFineItem,
  MappedInstItem,
  SearchHistoryItem,
} from '../models/account.model';
import { LoadingStatus } from '../models/state.const';
import { AppState } from '../models/store.model';
import { StateHelper } from '../utils/state-helper';

/**
 * Read-only service for accessing the Primo account display state.
 * Account data is populated by host effects (ILS API calls) — remotes only read it.
 *
 * This service exposes NO dispatch methods. All account mutations go through
 * the host's account effects and ILS service calls.
 *
 * @deprecated Since 2026.6.1 — inject {@link PrimoStateService} and use
 * `primo.account` instead. The direct service export will be removed in a
 * future regeneration.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  // ── Observable API ────────────────────────────────────────────────────────

  selectLoansCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.loansCounter);
  }

  selectRequestsCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.requestsCounter);
  }

  selectFinesCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.finesCounter);
  }

  selectBlocksCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.blocksCounter);
  }

  /** Patron block messages loaded from the ILS. Empty until the host has fetched them. */
  selectBlocksList$(): Observable<BlockMessage[]> {
    return this.helper.select$((state: AppState) => state.account?.blocksList || []);
  }

  selectBlocksStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.account?.blocksStatus || 'pending');
  }

  selectFavoritesCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.favoritesCounter);
  }

  selectLoansList$(): Observable<LoanItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.loansList);
  }

  selectRequestsList$(): Observable<MappedRequestItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.requestsList);
  }

  selectFinesList$(): Observable<MappedFineItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.finesList);
  }

  selectSavedSearchesList$(): Observable<SearchHistoryItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.savedSearchesList);
  }

  selectSearchHistoryList$(): Observable<SearchHistoryItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.searchHistoryList);
  }

  selectSelectedInstitution$(): Observable<MappedInstItem | undefined> {
    return this.helper.select$((state: AppState) => state.account?.selectedInstitution);
  }

  selectInstitutionsList$(): Observable<MappedInstItem[] | undefined> {
    return this.helper.select$((state: AppState) => state.account?.institutionsList);
  }

  selectLoansStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: AppState) => state.account?.loansStatus);
  }

  selectRequestsStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: AppState) => state.account?.requestsStatus);
  }

  selectFinesStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: AppState) => state.account?.finesStatus);
  }

  // ── Promise API (snapshots) ───────────────────────────────────────────────

  async getLoansCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.loansCounter);
  }

  async getRequestsCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.requestsCounter);
  }

  async getFinesCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.finesCounter);
  }

  async getSavedSearchesList(): Promise<SearchHistoryItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.savedSearchesList);
  }

  async getSelectedInstitution(): Promise<MappedInstItem | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.selectedInstitution);
  }

  async getBlocksCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.blocksCounter);
  }

  async getBlocksList(): Promise<BlockMessage[]> {
    return this.helper.selectOnce((state: AppState) => state.account?.blocksList || []);
  }

  async getBlocksStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.account?.blocksStatus || 'pending');
  }

  async getFavoritesCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.favoritesCounter);
  }

  async getLoansList(): Promise<LoanItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.loansList);
  }

  async getRequestsList(): Promise<MappedRequestItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.requestsList);
  }

  async getFinesList(): Promise<MappedFineItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.finesList);
  }

  async getSearchHistoryList(): Promise<SearchHistoryItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.searchHistoryList);
  }

  async getInstitutionsList(): Promise<MappedInstItem[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.institutionsList);
  }

  async getLoansStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.loansStatus);
  }

  async getRequestsStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.requestsStatus);
  }

  async getFinesStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.finesStatus);
  }

  // ── Signal API ────────────────────────────────────────────────────────────

  loansCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.loansCounter, undefined);
  }

  requestsCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.requestsCounter, undefined);
  }

  finesCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.finesCounter, undefined);
  }

  blocksCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.blocksCounter, undefined);
  }

  blocksListSignal(): Signal<BlockMessage[]> {
    return this.helper.selectSignal((state: AppState) => state.account?.blocksList || [], [] as BlockMessage[]);
  }

  blocksStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.account?.blocksStatus || 'pending', 'pending' as LoadingStatus);
  }

  favoritesCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.favoritesCounter, undefined);
  }

  loansListSignal(): Signal<LoanItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.loansList, undefined);
  }

  requestsListSignal(): Signal<MappedRequestItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.requestsList, undefined);
  }

  finesListSignal(): Signal<MappedFineItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.finesList, undefined);
  }

  savedSearchesListSignal(): Signal<SearchHistoryItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.savedSearchesList, undefined);
  }

  searchHistoryListSignal(): Signal<SearchHistoryItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.searchHistoryList, undefined);
  }

  selectedInstitutionSignal(): Signal<MappedInstItem | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.selectedInstitution, undefined);
  }

  institutionsListSignal(): Signal<MappedInstItem[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.institutionsList, undefined);
  }

  loansStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.loansStatus, undefined);
  }

  requestsStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.requestsStatus, undefined);
  }

  finesStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.finesStatus, undefined);
  }
}
