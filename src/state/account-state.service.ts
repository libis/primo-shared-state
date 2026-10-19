import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  BlockMessage,
  LoanItem,
  MappedDepositItem,
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

  /** Number of research deposits. Set by the host's counters load and again when the deposits list loads. */
  selectDepositsCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.depositsCounter);
  }

  /** Mapped deposits for the "My Deposits" account section. Empty until the host has fetched them. */
  selectDepositsList$(): Observable<MappedDepositItem[]> {
    return this.helper.select$((state: AppState) => state.account?.depositsList ?? []);
  }

  /** Upper-case host status string: `"PENDING"`, `"LOADING"`, `"SUCCESS"` or `"FAILURE"`. */
  selectDepositsStatus$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.account?.depositsStatus);
  }

  selectDepositsOffset$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.depositsOffset);
  }

  selectDepositsBulk$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.depositsBulk);
  }

  selectDepositsListCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: AppState) => state.account?.depositsListCounter);
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

  async getDepositsCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsCounter);
  }

  async getDepositsList(): Promise<MappedDepositItem[]> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsList ?? []);
  }

  async getDepositsStatus(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsStatus);
  }

  async getDepositsOffset(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsOffset);
  }

  async getDepositsBulk(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsBulk);
  }

  async getDepositsListCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: AppState) => state.account?.depositsListCounter);
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

  depositsCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsCounter, undefined);
  }

  depositsListSignal(): Signal<MappedDepositItem[]> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsList ?? [], [] as MappedDepositItem[]);
  }

  depositsStatusSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsStatus, undefined);
  }

  depositsOffsetSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsOffset, undefined);
  }

  depositsBulkSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsBulk, undefined);
  }

  depositsListCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: AppState) => state.account?.depositsListCounter, undefined);
  }
}
