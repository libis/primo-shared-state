import {LoadingStatus, LogoutReason} from "./state.const";

export const GUEST = 'GUEST';

export interface DecodedJwt {
  userName: string,
  displayName: string,
  userGroup: string,
  onCampus: boolean,
  signedIn: boolean,
  authenticationProfile: string,
  user: string
}

export interface UserSettings {
  resultsBulkSize?: string;
  language?: string;
  saveSearchHistory?: string;
  useSearchHistory?: string;
  autoExtendMySession?: string;
  allowSavingMyResearchAssistanceSearchHistory?: string;
  email?: string;
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
