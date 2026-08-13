import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DecodedJwt, UserSettings, UserState } from '../models/user.model';
import { LoadingStatus, LogoutReason } from '../models/state.const';
import { AppState } from '../models/store.model';
import { StateHelper } from '../utils/state-helper';
import {
  changeRaSaveSearchDoneAction,
  doneAutoExtendMySessionToggleAction,
  doneChangeUserSettingsLanguageAction,
  doneSaveHistoryToggleAction,
  doneUseHistoryToggleAction,
  resetJwtAction,
  resetLogoutReason as resetLogoutReasonAction,
  setDecodedJwt as setDecodedJwtAction,
  setLoginFromStateAction,
} from '../actions/shared-actions';

/**
 * Service for managing user state
 * Provides methods to read and write user-related data in the store
 *
 * @deprecated Since 2026.6.1 — inject {@link PrimoStateService} and use
 * `primo.user` instead. The direct service export will be removed in a
 * future regeneration.
 */
@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  /**
   * Select the entire user state
   */
  selectUserState$(): Observable<UserState> {
    return this.helper.select$((state: AppState) => state.user);
  }

  /**
   * Select JWT token
   */
  selectJwt$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.user?.jwt);
  }

  /**
   * Select decoded JWT
   */
  selectDecodedJwt$(): Observable<DecodedJwt | undefined> {
    return this.helper.select$((state: AppState) => state.user?.decodedJwt);
  }

  /**
   * Select login status
   */
  selectIsLoggedIn$(): Observable<boolean> {
    return this.helper.select$((state: AppState) => state.user?.isLoggedIn);
  }

  /**
   * Select user settings
   */
  selectUserSettings$(): Observable<UserSettings | undefined> {
    return this.helper.select$((state: AppState) => state.user?.userSettings);
  }

  /**
   * Select user name
   */
  selectUserName$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.user?.decodedJwt?.userName);
  }

  /**
   * Select user group
   */
  selectUserGroup$(): Observable<string> {
    return this.helper.select$((state: AppState) => state.user?.decodedJwt?.userGroup || 'GUEST');
  }

  /**
   * Why the last logout happened (`'user'` or `'timeout'`), or `undefined` when
   * it has been cleared. Counterpart read for {@link resetLogoutReason}.
   */
  selectLogoutReason$(): Observable<LogoutReason | undefined> {
    return this.helper.select$((state: AppState) => state.user?.logoutReason);
  }

  /** The route the user was on before login, used for post-login redirect. Counterpart read for {@link setLoginFromState}. */
  selectLoginFromState$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.user?.loginFromState);
  }

  /** Load status of the user slice (JWT resolution). */
  selectStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.user?.status || 'pending');
  }

  /** Load status of the user-settings fetch. */
  selectUserSettingsStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.user?.userSettingsStatus || 'pending');
  }

  /**
   * Get JWT token once (snapshot)
   */
  async getJwt(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.jwt);
  }

  /**
   * Get login status once (snapshot)
   */
  async isLoggedIn(): Promise<boolean> {
    return this.helper.selectOnce((state: AppState) => state.user?.isLoggedIn || false);
  }

  /**
   * Get user settings once (snapshot)
   */
  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.userSettings);
  }

  async getUserState(): Promise<UserState> {
    return this.helper.selectOnce((state: AppState) => state.user);
  }

  async getDecodedJwt(): Promise<DecodedJwt | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.decodedJwt);
  }

  async getUserName(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.decodedJwt?.userName);
  }

  async getUserGroup(): Promise<string> {
    return this.helper.selectOnce((state: AppState) => state.user?.decodedJwt?.userGroup || 'GUEST');
  }

  async getLogoutReason(): Promise<LogoutReason | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.logoutReason);
  }

  async getLoginFromState(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.user?.loginFromState);
  }

  async getStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.user?.status || 'pending');
  }

  async getUserSettingsStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.user?.userSettingsStatus || 'pending');
  }

  /**
   * Dispatch an action to update user state
   * Note: You need to import and use actual action creators from the host app
   */
  dispatch(action: any): void {
    this.helper.dispatch(action);
  }

  // ── Signal API ──────────────────────────────────────────────────────────────

  userStateSignal(): Signal<UserState> {
    return this.helper.selectSignal((state: AppState) => state.user, {} as UserState);
  }

  jwtSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.jwt, undefined);
  }

  decodedJwtSignal(): Signal<DecodedJwt | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.decodedJwt, undefined);
  }

  isLoggedInSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: AppState) => state.user?.isLoggedIn, false);
  }

  userSettingsSignal(): Signal<UserSettings | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.userSettings, undefined);
  }

  userNameSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.decodedJwt?.userName, undefined);
  }

  userGroupSignal(): Signal<string> {
    return this.helper.selectSignal((state: AppState) => state.user?.decodedJwt?.userGroup || 'GUEST', 'GUEST');
  }

  logoutReasonSignal(): Signal<LogoutReason | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.logoutReason, undefined);
  }

  loginFromStateSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.user?.loginFromState, undefined);
  }

  statusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.user?.status || 'pending', 'pending' as LoadingStatus);
  }

  userSettingsStatusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.user?.userSettingsStatus || 'pending', 'pending' as LoadingStatus);
  }

  // ── Typed dispatch helpers ──────────────────────────────────────────────────

  setDecodedJwt(decodedJwt: DecodedJwt): void {
    this.helper.dispatch(setDecodedJwtAction({ decodedJwt }));
  }

  setLoginFromState(value: string): void {
    this.helper.dispatch(setLoginFromStateAction({ value }));
  }

  resetLogoutReason(): void {
    this.helper.dispatch(resetLogoutReasonAction());
  }

  setLanguage(value: string): void {
    this.helper.dispatch(doneChangeUserSettingsLanguageAction({ value }));
  }

  setSaveHistory(value: string): void {
    this.helper.dispatch(doneSaveHistoryToggleAction({ value }));
  }

  setUseHistory(value: string): void {
    this.helper.dispatch(doneUseHistoryToggleAction({ value }));
  }

  setAutoExtendMySession(value: string): void {
    this.helper.dispatch(doneAutoExtendMySessionToggleAction({ value }));
  }

  setAllowSavingRaSearchHistory(value: string): void {
    this.helper.dispatch(changeRaSaveSearchDoneAction({ value }));
  }

  /**
   * Clears the JWT and logs the user out. `reason` distinguishes a deliberate
   * sign-out (`'user'`) from a session expiry (`'timeout'`); `url` optionally
   * records where to return after re-authentication.
   */
  logout(reason: LogoutReason, url?: string): void {
    this.helper.dispatch(resetJwtAction({ logoutReason: reason, url }));
  }
}
