import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  EntityViewModel,
  RelatedDocList,
  RelatedEntitiesList,
} from '../models/entity.model';
import { LoadingStatus } from '../models/state.const';
import { StateHelper } from '../utils/state-helper';

/**
 * Read-only service for accessing the Primo linked-data entity state.
 * Entity data is populated by host effects — remotes only read it.
 *
 * This service exposes NO dispatch methods. The host owns all entity writes.
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

  selectEntityViewModel$(): Observable<EntityViewModel | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel);
  }

  selectEntityStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel?.entityStatus);
  }

  selectRelatedDocs$(): Observable<RelatedDocList[] | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel?.relatedDocs);
  }

  selectRelatedEntities$(): Observable<RelatedEntitiesList[] | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel?.relatedEntities);
  }

  selectRelatedDocsStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel?.relatedDocsStatus);
  }

  selectRelatedEntitiesStatus$(): Observable<LoadingStatus | undefined> {
    return this.helper.select$((state: any) => state.linkedDataEntity?.entityViewModel?.relatedEntitiesStatus);
  }

  // ── Promise API (snapshots) ───────────────────────────────────────────────

  async getEntityViewModel(): Promise<EntityViewModel | undefined> {
    return this.helper.selectOnce((state: any) => state.linkedDataEntity?.entityViewModel);
  }

  async getEntityStatus(): Promise<LoadingStatus | undefined> {
    return this.helper.selectOnce((state: any) => state.linkedDataEntity?.entityViewModel?.entityStatus);
  }

  // ── Signal API ────────────────────────────────────────────────────────────

  entityViewModelSignal(): Signal<EntityViewModel | undefined> {
    return this.helper.selectSignal((state: any) => state.linkedDataEntity?.entityViewModel, undefined);
  }

  entityStatusSignal(): Signal<LoadingStatus | undefined> {
    return this.helper.selectSignal((state: any) => state.linkedDataEntity?.entityViewModel?.entityStatus, undefined);
  }

  relatedDocsSignal(): Signal<RelatedDocList[] | undefined> {
    return this.helper.selectSignal((state: any) => state.linkedDataEntity?.entityViewModel?.relatedDocs, undefined);
  }

  relatedEntitiesSignal(): Signal<RelatedEntitiesList[] | undefined> {
    return this.helper.selectSignal((state: any) => state.linkedDataEntity?.entityViewModel?.relatedEntities, undefined);
  }
}
