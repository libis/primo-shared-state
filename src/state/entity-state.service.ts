import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  EntityMultiLangData,
  EntityWikiData,
  RelatedDocList,
  RelatedEntitiesMultiLangDataList,
} from '../models/entity.model';
import { LoadingStatus } from '../models/state.const';
import { StateHelper } from '../utils/state-helper';

/**
 * Read-only service for accessing the Primo linked-data entity state.
 * Entity data is populated by host effects — remotes only read it.
 *
 * This service exposes NO dispatch methods. The host owns all entity writes.
 *
 * ⚠️ 2026.4.1 — the host's linked-data-entity state was flattened.
 * The composite `entityViewModel` field (previously at
 * `state.linkedDataEntity.entityViewModel`) no longer exists as raw state;
 * the host now computes it inside a language-aware selector that remotes
 * cannot reach. This service was rewritten to expose the raw flat pieces
 * (`entity`, `wikiData`, `relatedDocs`, `relatedEntities` and their
 * statuses). Remotes that need a language-mapped projection must compose
 * it themselves using their own language selector.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityStateService {
  private helper: StateHelper;

  constructor(store: Store) {
    this.helper = new StateHelper(store);
  }

  // ── Observable API ────────────────────────────────────────────────────────

  selectEntityId$(): Observable<string | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.entityId);
  }

  selectEntity$(): Observable<EntityMultiLangData | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.entity);
  }

  selectEntityStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.entityStatus);
  }

  selectWikiData$(): Observable<EntityWikiData | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.wikiData);
  }

  selectWikiDataStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.wikiDataStatus);
  }

  selectRelatedDocs$(): Observable<RelatedDocList[] | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.relatedDocs);
  }

  selectRelatedDocsStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.relatedDocsStatus);
  }

  selectRelatedEntities$(): Observable<RelatedEntitiesMultiLangDataList[] | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.relatedEntities);
  }

  selectRelatedEntitiesStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state['linked-data-entity']?.relatedEntitiesStatus);
  }

  // ── Promise API (snapshots) ───────────────────────────────────────────────

  async getEntityId(): Promise<string | undefined> {
    return this.helper.selectOnce((state: any) => state['linked-data-entity']?.entityId);
  }

  async getEntity(): Promise<EntityMultiLangData | undefined> {
    return this.helper.selectOnce((state: any) => state['linked-data-entity']?.entity);
  }

  async getEntityStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: any) => state['linked-data-entity']?.entityStatus);
  }

  async getRelatedDocs(): Promise<RelatedDocList[] | undefined> {
    return this.helper.selectOnce((state: any) => state['linked-data-entity']?.relatedDocs);
  }

  async getRelatedEntities(): Promise<RelatedEntitiesMultiLangDataList[] | undefined> {
    return this.helper.selectOnce((state: any) => state['linked-data-entity']?.relatedEntities);
  }

  // ── Signal API ────────────────────────────────────────────────────────────

  entityIdSignal(): Signal<string | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.entityId, undefined);
  }

  entitySignal(): Signal<EntityMultiLangData | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.entity, undefined);
  }

  entityStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.entityStatus, undefined);
  }

  wikiDataSignal(): Signal<EntityWikiData | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.wikiData, undefined);
  }

  relatedDocsSignal(): Signal<RelatedDocList[] | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.relatedDocs, undefined);
  }

  relatedEntitiesSignal(): Signal<RelatedEntitiesMultiLangDataList[] | undefined> {
    return this.helper.selectSignal((state: any) => state['linked-data-entity']?.relatedEntities, undefined);
  }
}
