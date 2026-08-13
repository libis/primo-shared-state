import {LoadingStatus, LogoutReason} from "./state.const";

export const GUEST = 'GUEST';

export interface DecodedJwt {
  userName: string,
  displayName: string,
  userGroup: string,
  onCampus: boolean,
  signedIn: boolean,
  authenticationProfile: string,
  user: string,
  selfRegistered: boolean,
  restrictedUser: boolean
}

/**
 * Server-persisted user preferences, mirrored into the `user` slice.
 *
 * Every field is optional because the host only populates the keys the ILS
 * actually returned; the index signature keeps forward compatibility with
 * settings this package does not yet name.
 */
export interface UserSettings {
  resultsBulkSize?: string;
  language?: string;
  saveSearchHistory?: string;
  useSearchHistory?: string;
  autoExtendMySession?: string;
  allowSavingMyResearchAssistanceSearchHistory?: string;
  email?: string;
  advanced_mode?: string;
  beacon022?: string;
  pr_discipline?: string;
  pr_enabled?: string;
  pr_recentness?: string;
  smsnumber?: string;
  /**
   * The patron's saved default sort. Written server-side by the host when the
   * `patrons_default_sort_nde` feature flag is on — read only; see the
   * `patronDefaultSortUpdateAction` exclusion note in `shared-actions.ts`.
   */
  patronsDefaultSort?: string;
  [key: string]: string | undefined;
}

export interface UserState {
  jwt: string | undefined,
  decodedJwt: DecodedJwt | undefined,
  status: LoadingStatus,
  isLoggedIn: boolean,
  loginFromState: string | undefined,
  userSettings: UserSettings | undefined;
  userSettingsStatus: LoadingStatus,
  logoutReason: LogoutReason | undefined
}
