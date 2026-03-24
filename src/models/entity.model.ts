/**
 * Entity / linked-data models from the Primo host application.
 * These are read-only view models — remotes read entity data via
 * EntityStateService selectors but never write to entity state.
 */

import { LoadingStatus } from './state.const';
import { Doc } from './search.model';

/**
 * MapCoordinates — simplified from host's internal map-utils.
 * The host populates this; remotes only read it.
 */
export interface MapCoordinates {
  lat: number;
  lng: number;
}

/**
 * RelatedEntitiesSearchMode — the host uses an internal enum for this.
 * We expose it as a string type so remotes can read the value without
 * coupling to the host's internal enum definition.
 */
export type RelatedEntitiesSearchMode = string;

export enum EntityType {
  person = 'person',
  organization = 'organization',
  location = 'location'
}

export interface DisplayProperty {
  label: string;
  value: string;
  isLink?: boolean;
}

export interface EntityThumbnail {
  imageUrl: string;
  imageName?: string;
  imagePageLink?: string;
  imageArtist?: string;
  licenseText?: string;
  licenseUrl?: string;
  licenseCode?: string;
}

export interface EntityDetails {
  properties: DisplayProperty[];
  name: string | undefined;
  description: string | undefined;
  wikiUrl: string | undefined;
  pageTitle: string | undefined;
}

export interface EntityMultiLangData {
  id: string | undefined;
  entityType: EntityType | undefined;
  details: {
    [lang: string]: EntityDetails;
  };
  thumbnail: EntityThumbnail;
  coordinates?: MapCoordinates[];
}

export interface RelatedEntitiesMultiLangDataList {
  entities: EntityMultiLangData[];
  titleLabel: string;
  entitiesType: EntityType;
}

export interface BasicEntityData {
  id: string | undefined;
  entityType: EntityType | undefined;
  name: string | undefined;
  description: string | undefined;
  properties: DisplayProperty[];
  thumbnail: EntityThumbnail | undefined;
  coordinates?: MapCoordinates[];
}

export interface EntityWikiData {
  wikiUrl: string;
  wikiDescription: string | undefined;
}

export interface EntityViewModel extends BasicEntityData {
  entityStatus: LoadingStatus;
  wikiData: EntityWikiData | undefined;
  wikiDataStatus: LoadingStatus;
  relatedDocs: RelatedDocList[];
  relatedEntities: RelatedEntitiesList[];
  relatedDocsStatus: LoadingStatus;
  relatedEntitiesStatus: LoadingStatus;
}

export interface RelatedDocsDef {
  query: string;
  titleLabel: string;
  showAllLabel: string;
  showAllAriaLabel: string;
  searchMode: RelatedEntitiesSearchMode;
}

export interface RelatedDocList extends RelatedDocsDef {
  docs: Doc[];
}

export interface RelatedEntitiesList {
  entities: BasicEntityData[];
  titleLabel: string;
  entitiesType: EntityType;
}

/* ── API response models ─────────────────────────────────────────────────── */

export type LangStringMap = { [lang: string]: string };

export interface LinkedDataResponse {
  linkedData: BaseEntityResponse[];
}

export interface BaseEntityResponse {
  id: string;
  type: EntityType;
  errorMessage?: string;
}

export interface PersonEntityResponse extends BaseEntityResponse {
  person_name?: EntityValue;
  short_description?: EntityValue;
  birth_date?: EntityValue;
  death_date?: EntityValue;
  death_city?: EntityValue;
  birth_city?: EntityValueArray;
  birth_place?: EntityValue;
  death_place?: EntityValue;
  death_country?: EntityValue;
  birth_country?: EntityValue;
  occupations?: {
    LC: string[];
    wikidata?: WikidataOccupation[];
  };
  image_info?: ImageInfo;
  field_of_work?: {
    LC?: string[];
    wikidata?: WikidataOccupation[];
  };
  link_to_wikipedia?: EntityValue;
}

export interface LocationEntityResponse extends BaseEntityResponse {
  location_name?: EntityValue;
  start_date?: StringEntityValue;
  end_date?: StringEntityValue;
  associated_country?: EntityValue;
  link_to_wikipedia?: EntityValue;
  short_description?: EntityValue;
  image_info?: ImageInfo;
  coordinates?: EntityCoordinates;
  place_of_residence?: EntityValueArray;
}

export interface OrganizationEntityResponse extends BaseEntityResponse {
  organization_name?: EntityValue;
  coordinates?: EntityCoordinates;
  start_date?: StringEntityValue;
  end_date?: StringEntityValue;
  link_to_wikipedia?: EntityValue;
  field_of_work?: {
    LC?: string[];
    wikidata?: WikidataOccupation[];
  };
  image_info?: ImageInfo;
  logo_image?: ImageInfo;
  associated_country?: EntityValue;
  headquarters_location?: EntityValue;
  short_description?: EntityValue;
  official_website?: StringEntityValue;
}

export interface EntityValue {
  LC: string;
  wikidata?: LangStringMap;
}

export interface StringEntityValue {
  LC?: string;
  wikidata?: string;
}

export interface EntityValueArray {
  LC: string[];
  wikidata?: LangStringMap[];
}

export interface WikidataOccupation {
  references: number;
  display: LangStringMap;
  rank: string;
}

export interface ImageInfo {
  image_name?: string;
  link_to_thumbnail?: string;
  image_artist?: string;
  link_to_image_page?: string;
  licensing?: {
    license: string;
    free: boolean;
  };
  link_to_image?: string;
}

export interface EntityCoordinates {
  LC: {
    easternmost_longitude?: string;
    westernmost_longitude?: string;
    northernmost_latitude?: string;
    southernmost_latitude?: string;
  };
  wikidata: {
    latitude?: number;
    longitude?: number;
  };
}

/* ── Autocomplete models ─────────────────────────────────────────────────── */

export type AutoCompleteEntitiesResponse = {
  persons?: AutoCompletePersonEntity[];
  organizations?: AutoCompleteOrganizationEntity[];
  locations?: AutoCompleteLocationEntity[];
};

export interface AutoCompleteBaseEntity {
  id: string;
  short_description?: StringEntityValue;
  image_info?: ImageInfo;
}

export interface AutoCompletePersonEntity extends AutoCompleteBaseEntity {
  person_name?: StringEntityValue;
}

export interface AutoCompleteOrganizationEntity extends AutoCompleteBaseEntity {
  organization_name?: StringEntityValue;
}

export interface AutoCompleteLocationEntity extends AutoCompleteBaseEntity {
  location_name?: StringEntityValue;
}

export type AutoCompletePersonResponse = AutoCompleteEntity[];

export interface AutoCompleteEntity {
  id: string;
  person_name?: StringEntityValue;
  short_description?: StringEntityValue;
  image_info: ImageInfo;
}
