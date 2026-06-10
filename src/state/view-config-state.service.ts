import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  ViewConfigData,
  SystemConfiguration,
  MappingTables,
  Scope,
  FeatureFlags,
  NdeAddonData,
  Tiles,
  PrimoView,
} from '../models/view-config.model';
import { LoadingStatus } from '../models/state.const';
import { AppState } from '../models/store.model';
import { StateHelper } from '../utils/state-helper';

/**
 * Read-only service for accessing the Primo view configuration state.
 * Configuration is set once at bootstrap by the host — remotes only read it.
 *
 * This service exposes NO dispatch methods. The host owns all config writes.
 *
 * @deprecated Since 2026.6.1 — inject {@link PrimoStateService} and use
 * `primo.config` instead. The direct service export will be removed in a
 * future regeneration.
 */
@Injectable({
  providedIn: 'root'
})
export class ViewConfigStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  // ── Observable API ────────────────────────────────────────────────────────

  selectStatus$(): Observable<LoadingStatus> {
    return this.helper.select$((state: AppState) => state.viewConfig?.status || 'pending');
  }

  selectConfig$(): Observable<ViewConfigData | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config);
  }

  selectSystemConfiguration$(): Observable<SystemConfiguration | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['system-configuration']);
  }

  selectMappingTables$(): Observable<MappingTables | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['mapping-tables']);
  }

  selectPrimoView$(): Observable<PrimoView | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']);
  }

  selectScopes$(): Observable<Scope[] | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']?.scopes);
  }

  selectTabs$(): Observable<string[] | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']?.['available-tabs']);
  }

  selectTiles$(): Observable<Tiles | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.tiles);
  }

  selectFeatureFlags$(): Observable<FeatureFlags | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['feature-flags']);
  }

  selectNdeAddons$(): Observable<Record<string, NdeAddonData> | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.ndeAddons);
  }

  selectInstitutionCode$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-code']);
  }

  selectInstitutionName$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-name']);
  }

  selectVid$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.vid);
  }

  selectInterfaceLanguage$(): Observable<string | undefined> {
    return this.helper.select$((state: AppState) => state.viewConfig?.config?.['primo-view']?.['attributes-map']?.interfaceLanguage);
  }

  // ── Promise API (snapshots) ───────────────────────────────────────────────

  async getConfig(): Promise<ViewConfigData | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config);
  }

  async getSystemConfiguration(): Promise<SystemConfiguration | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['system-configuration']);
  }

  async getMappingTables(): Promise<MappingTables | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['mapping-tables']);
  }

  async getFeatureFlags(): Promise<FeatureFlags | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['feature-flags']);
  }

  async getInstitutionCode(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-code']);
  }

  async getVid(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.vid);
  }

  async getStatus(): Promise<LoadingStatus> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.status || 'pending');
  }

  async getPrimoView(): Promise<PrimoView | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']);
  }

  async getScopes(): Promise<Scope[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']?.scopes);
  }

  async getTabs(): Promise<string[] | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']?.['available-tabs']);
  }

  async getTiles(): Promise<Tiles | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.tiles);
  }

  async getNdeAddons(): Promise<Record<string, NdeAddonData> | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.ndeAddons);
  }

  async getInstitutionName(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-name']);
  }

  async getInterfaceLanguage(): Promise<string | undefined> {
    return this.helper.selectOnce((state: AppState) => state.viewConfig?.config?.['primo-view']?.['attributes-map']?.interfaceLanguage);
  }

  // ── Signal API ────────────────────────────────────────────────────────────

  statusSignal(): Signal<LoadingStatus> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.status || 'pending', 'pending' as LoadingStatus);
  }

  configSignal(): Signal<ViewConfigData | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config, undefined);
  }

  systemConfigurationSignal(): Signal<SystemConfiguration | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['system-configuration'], undefined);
  }

  mappingTablesSignal(): Signal<MappingTables | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['mapping-tables'], undefined);
  }

  scopesSignal(): Signal<Scope[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view']?.scopes, undefined);
  }

  tabsSignal(): Signal<string[] | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view']?.['available-tabs'], undefined);
  }

  featureFlagsSignal(): Signal<FeatureFlags | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['feature-flags'], undefined);
  }

  ndeAddonsSignal(): Signal<Record<string, NdeAddonData> | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.ndeAddons, undefined);
  }

  institutionCodeSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-code'], undefined);
  }

  vidSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.vid, undefined);
  }

  interfaceLanguageSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view']?.['attributes-map']?.interfaceLanguage, undefined);
  }

  primoViewSignal(): Signal<PrimoView | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view'], undefined);
  }

  tilesSignal(): Signal<Tiles | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.tiles, undefined);
  }

  institutionNameSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: AppState) => state.viewConfig?.config?.['primo-view']?.institution?.['institution-name'], undefined);
  }
}
