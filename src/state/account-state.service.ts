import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  LoanItem,
  MappedRequestItem,
  MappedFineItem,
  MappedInstItem,
  SearchHistoryItem,
} from '../models/account.model';
import { LoadingStatus } from '../models/state.const';
import { StateHelper } from '../utils/state-helper';

/**
 * Read-only service for accessing the Primo account display state.
 * Account data is populated by host effects (ILS API calls) — remotes only read it.
 *
 * This service exposes NO dispatch methods. All account mutations go through
 * the host's account effects and ILS service calls.
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
    return this.helper.select$((state: any) => state.account?.loansCounter);
  }

  selectRequestsCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: any) => state.account?.requestsCounter);
  }

  selectFinesCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: any) => state.account?.finesCounter);
  }

  selectBlocksCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: any) => state.account?.blocksCounter);
  }

  selectFavoritesCounter$(): Observable<number | undefined> {
    return this.helper.select$((state: any) => state.account?.favoritesCounter);
  }

  selectLoansList$(): Observable<LoanItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.loansList);
  }

  selectRequestsList$(): Observable<MappedRequestItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.requestsList);
  }

  selectFinesList$(): Observable<MappedFineItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.finesList);
  }

  selectSavedSearchesList$(): Observable<SearchHistoryItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.savedSearchesList);
  }

  selectSearchHistoryList$(): Observable<SearchHistoryItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.searchHistoryList);
  }

  selectSelectedInstitution$(): Observable<MappedInstItem | undefined> {
    return this.helper.select$((state: any) => state.account?.selectedInstitution);
  }

  selectInstitutionsList$(): Observable<MappedInstItem[] | undefined> {
    return this.helper.select$((state: any) => state.account?.institutionsList);
  }

  selectLoansStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.account?.loansStatus);
  }

  selectRequestsStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.account?.requestsStatus);
  }

  selectFinesStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.account?.finesStatus);
  }

  // ── Promise API (snapshots) ───────────────────────────────────────────────

  async getLoansCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.loansCounter);
  }

  async getRequestsCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.requestsCounter);
  }

  async getFinesCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.finesCounter);
  }

  async getSavedSearchesList(): Promise<SearchHistoryItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.savedSearchesList);
  }

  async getSelectedInstitution(): Promise<MappedInstItem | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.selectedInstitution);
  }

  async getBlocksCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.blocksCounter);
  }

  async getFavoritesCounter(): Promise<number | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.favoritesCounter);
  }

  async getLoansList(): Promise<LoanItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.loansList);
  }

  async getRequestsList(): Promise<MappedRequestItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.requestsList);
  }

  async getFinesList(): Promise<MappedFineItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.finesList);
  }

  async getSearchHistoryList(): Promise<SearchHistoryItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.searchHistoryList);
  }

  async getInstitutionsList(): Promise<MappedInstItem[] | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.institutionsList);
  }

  async getLoansStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.loansStatus);
  }

  async getRequestsStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.requestsStatus);
  }

  async getFinesStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: any) => state.account?.finesStatus);
  }

  // ── Signal API ────────────────────────────────────────────────────────────

  loansCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.loansCounter, undefined);
  }

  requestsCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.requestsCounter, undefined);
  }

  finesCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.finesCounter, undefined);
  }

  blocksCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.blocksCounter, undefined);
  }

  favoritesCounterSignal(): Signal<number | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.favoritesCounter, undefined);
  }

  loansListSignal(): Signal<LoanItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.loansList, undefined);
  }

  requestsListSignal(): Signal<MappedRequestItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.requestsList, undefined);
  }

  finesListSignal(): Signal<MappedFineItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.finesList, undefined);
  }

  savedSearchesListSignal(): Signal<SearchHistoryItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.savedSearchesList, undefined);
  }

  searchHistoryListSignal(): Signal<SearchHistoryItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.searchHistoryList, undefined);
  }

  selectedInstitutionSignal(): Signal<MappedInstItem | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.selectedInstitution, undefined);
  }

  institutionsListSignal(): Signal<MappedInstItem[] | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.institutionsList, undefined);
  }

  loansStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.loansStatus, undefined);
  }

  requestsStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.requestsStatus, undefined);
  }

  finesStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: any) => state.account?.finesStatus, undefined);
  }
}
