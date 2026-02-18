/**
 * SHARED ACTIONS
 *
 * These action creators produce objects whose `type` strings exactly match
 * those handled by the host application's NgRx reducers and effects.
 *
 * EFFECTS WARNING:
 * The host app registers NgRx effects that react to these actions (e.g. HTTP
 * calls). Remote federated modules must NOT register their own effects for
 * the same action types — that would cause duplicate side-effects.
 *
 * To listen for an action without triggering a duplicate effect, use:
 *
 *   import { Actions, ofType } from '@ngrx/effects';
 *   // inject Actions in a service, then:
 *   this.actions$.pipe(ofType(searchSuccessAction)).subscribe(...)
 *
 * Do NOT register EffectsModule.forFeature([]) with effects that re-implement
 * the host's HTTP calls.
 */

import { createAction, props } from '@ngrx/store';
import { Doc, Facet, SearchData, SearchMetaData, SearchParams } from '../models/search.model';
import { DecodedJwt, UserSettings } from '../models/user.model';
import { LogoutReason } from '../models/state.const';

// ─────────────────────────────────────────────────────────────────────────────
// Search actions
// ─────────────────────────────────────────────────────────────────────────────

export const searchAction = createAction(
  '[Search] Load search',
  props<{ searchParams: SearchParams; searchType?: string }>()
);

export const searchSuccessAction = createAction(
  '[Search] Load search success',
  props<{ searchResultsData: SearchData }>()
);

export const searchFailedAction = createAction('[Search] Load search failed');

export const clearSearchAction = createAction('[Search] clear search');

export const pageLimitChangedAction = createAction(
  '[Search] Page Limit Changed',
  props<{ limit: number }>()
);

export const pageNumberChangedAction = createAction(
  '[Search] Page Number Changed',
  props<{ pageNumber: number }>()
);

/** NOTE: action type is lowercase [search], not [Search] — match exactly */
export const sortByChangedAction = createAction(
  '[search] Sort By Changed',
  props<{ sort: string }>()
);

export const fetchUnpaywallLinksAction = createAction(
  '[Search] Fetch unpaywall links',
  props<{ recordsToUpdate: Doc[] }>()
);

export const updateIsSavedSearch = createAction(
  '[Search] Update Is Saved Search',
  props<{ isSavedSearch: boolean }>()
);

/** NOTE: action type is lowercase [search], not [Search] — match exactly */
export const setSearchNotificationMsg = createAction(
  '[search] Set Search Notification Message',
  props<{ msg: string }>()
);

export const saveCurrentSearchTermAction = createAction(
  '[Search] save current search term',
  props<{ searchTerm: string }>()
);

export const updateSortByParam = createAction(
  '[Filter] Update Sort By Param',
  props<{ sort: string }>()
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter / search-filter actions
// ─────────────────────────────────────────────────────────────────────────────

export const loadFiltersAction = createAction(
  '[Filter] Load Filter',
  props<{ searchParams: SearchParams }>()
);

export const filtersSuccessAction = createAction(
  '[Filter] Load Filter Success',
  props<{ filters: Facet[] }>()
);

export const filterFailedAction = createAction('[Filter] Load Filter Failed');

// ─────────────────────────────────────────────────────────────────────────────
// User actions — only those safe for remote modules to dispatch
// ─────────────────────────────────────────────────────────────────────────────

export const setDecodedJwt = createAction(
  '[User] Set Decoded Jwt',
  props<{ decodedJwt: DecodedJwt }>()
);

export const loadUserSettingsSuccessAction = createAction(
  '[User-Settings] save user settings',
  props<{ userSettings: UserSettings; isNewSession: boolean }>()
);

export const resetUserSettingsSuccessAction = createAction(
  '[User-Settings] reset user settings success'
);

export const doneChangeUserSettingsLanguageAction = createAction(
  '[User-Settings] Done Change User Settings Language',
  props<{ value: string }>()
);

export const doneSaveHistoryToggleAction = createAction(
  '[User-Settings] Done Update Save history toggle ',
  props<{ value: string }>()
);

export const doneUseHistoryToggleAction = createAction(
  '[User-Settings] Done Update Use history toggle ',
  props<{ value: string }>()
);

export const doneAutoExtendMySessionToggleAction = createAction(
  '[User-Settings] Done Update Auto Extend My Session toggle ',
  props<{ value: string }>()
);

export const setLoginFromStateAction = createAction(
  '[User-Settings] set login from state',
  props<{ value: string }>()
);

export const changeRaSaveSearchDoneAction = createAction(
  '[User-settings] dont update research-Assistant save search toggle',
  props<{ value: string }>()
);

export const resetLogoutReason = createAction('[User-Settings] reset logout reason');

export const resetJwtAction = createAction(
  '[User] reset jwt',
  props<{ logoutReason: LogoutReason; url?: string }>()
);
