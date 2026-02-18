import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DecodedJwt, UserSettings, UserState } from '../models/user.model';
import { StateHelper } from '../utils/state-helper';
import {
  changeRaSaveSearchDoneAction,
  doneAutoExtendMySessionToggleAction,
  doneChangeUserSettingsLanguageAction,
  doneSaveHistoryToggleAction,
  doneUseHistoryToggleAction,
  resetLogoutReason as resetLogoutReasonAction,
  setDecodedJwt as setDecodedJwtAction,
  setLoginFromStateAction,
} from '../actions/shared-actions';

/**
 * Service for managing user state
 * Provides methods to read and write user-related data in the store
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
    return this.helper.select$((state: any) => state.user);
  }

  /**
   * Select JWT token
   */
  selectJwt$(): Observable<string | undefined> {
    return this.helper.select$((state: any) => state.user?.jwt);
  }

  /**
   * Select decoded JWT
   */
  selectDecodedJwt$(): Observable<DecodedJwt | undefined> {
    return this.helper.select$((state: any) => state.user?.decodedJwt);
  }

  /**
   * Select login status
   */
  selectIsLoggedIn$(): Observable<boolean> {
    return this.helper.select$((state: any) => state.user?.isLoggedIn);
  }

  /**
   * Select user settings
   */
  selectUserSettings$(): Observable<UserSettings | undefined> {
    return this.helper.select$((state: any) => state.user?.userSettings);
  }

  /**
   * Select user name
   */
  selectUserName$(): Observable<string | undefined> {
    return this.helper.select$((state: any) => state.user?.decodedJwt?.userName);
  }

  /**
   * Select user group
   */
  selectUserGroup$(): Observable<string> {
    return this.helper.select$((state: any) => state.user?.decodedJwt?.userGroup || 'GUEST');
  }

  /**
   * Get JWT token once (snapshot)
   */
  async getJwt(): Promise<string | undefined> {
    return this.helper.selectOnce((state: any) => state.user?.jwt);
  }

  /**
   * Get login status once (snapshot)
   */
  async isLoggedIn(): Promise<boolean> {
    return this.helper.selectOnce((state: any) => state.user?.isLoggedIn || false);
  }

  /**
   * Get user settings once (snapshot)
   */
  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.helper.selectOnce((state: any) => state.user?.userSettings);
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
    return this.helper.selectSignal((state: any) => state.user, {} as UserState);
  }

  jwtSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: any) => state.user?.jwt, undefined);
  }

  decodedJwtSignal(): Signal<DecodedJwt | undefined> {
    return this.helper.selectSignal((state: any) => state.user?.decodedJwt, undefined);
  }

  isLoggedInSignal(): Signal<boolean> {
    return this.helper.selectSignal((state: any) => state.user?.isLoggedIn, false);
  }

  userSettingsSignal(): Signal<UserSettings | undefined> {
    return this.helper.selectSignal((state: any) => state.user?.userSettings, undefined);
  }

  userNameSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: any) => state.user?.decodedJwt?.userName, undefined);
  }

  userGroupSignal(): Signal<string> {
    return this.helper.selectSignal((state: any) => state.user?.decodedJwt?.userGroup || 'GUEST', 'GUEST');
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
}
