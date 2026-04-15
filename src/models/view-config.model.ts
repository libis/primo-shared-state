/**
 * View configuration models from the Primo host application.
 * Configuration is set once at bootstrap and read-only thereafter.
 * Remotes read these values via ViewConfigStateService selectors.
 *
 * NOTE: DecodedJwt is intentionally defined in user.model.ts, not here,
 * even though the host source defines it in view-config.model.ts.
 * This avoids duplicate exports.
 */

import { SearchParamsWithStrParams } from './search.model';

export interface ViewConfigData {
  beaconO22:                         string;
  vid:                               string;
  'primo-view':                      PrimoView;
  tiles:                             Tiles;
  'system-configuration':            SystemConfiguration;
  'mapping-tables':                  MappingTables;
  authentication:                    Authentication[];
  backend_system:                    string;
  customization:                     Customization;
  fieldsWithUseTranslation:          string[];
  IsViewNdeEnabled:                  boolean;
  enable_mixpanel:                   boolean;
  patron_default_sort:               boolean;
  enableExtendSession:               boolean;
  enableExtendSessionToMax:          boolean;
  enableUserSettingForExtendSession: boolean;
  UIComponents:                      UIComponents;
  'tab-to-tiles':                    TabToTiles;
  queryTerms:                        QueryTerms;
  advancedSearchConfiguration:       AdvancedSearchConfiguration;
  'country-codes':                   string[];
  'bx-enable':                       boolean;
  'syndeticunbound-enable':          boolean;
  'syndeticunbound-id':              string;
  ndeAddons:                         Record<string, NdeAddonData>;
  collectionDiscoveryFacets:         Facetview[];
  enableLocalFullTextSearch:         boolean;
  localFullTextSearchDefaultValue:   boolean;
  'feature-flags':                   FeatureFlags;
  discovery_services_page:           boolean;
  limited_patrons_in_alma_starter:   boolean;
  limited_patrons_acq_in_alma_starter: boolean;
  searchWithinJournalConfig:         SearchWithinJournal;
}

export interface SearchWithinJournal {
  tab?: string;
  scope?: string;
  summonUrl?: string;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface NdeAddonData {
  url: string;
  properties: Record<string, string>;
}

export interface AdvancedSearchConfiguration {
  [key: string]: AdvancedSearchConfigurationOperators;
}

export interface AdvancedSearchConfigurationOperators {
  boolOperators: AdvancedSearchConfigurationValue;
  fields: AdvancedSearchConfigurationValue;
  languages: AdvancedSearchConfigurationValue;
  materialTypes: AdvancedSearchConfigurationValue;
  operators: AdvancedSearchConfigurationValue;
}

export interface AdvancedSearchConfigurationValue {
  options: string[];
  defaultOption: string;
  isSort?: boolean;
}

export interface QueryTerms {
  [key: string]: string[];
}

export interface UIComponents {
  [key: string]: UIComponentEntry | FreeText;
}

export interface UIComponentEntry {
  indexFields: string[];
  type: { _string: string };
  defaultOption: string;
  displayOptions: string[];
  options: string[];
}

export interface FreeText {
  indexFields: string[];
  type: AdditionalLocationIcons;
  defaultOption: string;
  displayOptions: any[];
  options: any[];
}

export interface AdditionalLocationIcons {
  homepage?: Record<string, string>;
  [code: string]: string | Record<string, string> | undefined;
}

export interface Authentication {
  'profile-name': string;
  'authentication-system': string;
  'silent-login-enabled': string;
}

export interface Customization {
  resourceIcons: Record<string, string>;
  additionalLocationIcons: AdditionalLocationIcons;
  libraryLogo?: string;
  customizedColorTheme?: string;
  homepage?: HomepageCustomization;
  assets: Assets;
}

export interface Assets {
  images: Record<string, string>;
}

export interface HomepageCustomization {
  homepageBGImage: string;
  html: Record<string, string>;
}

export interface MappingTables {
  'Citation Linker Definitions':                         MappingTable[];
  'Request (Hold and Booking) Optional Parameters':      MappingTable[];
  'Prima Direct Login To Other Institutions':            any[];
  'Library Level List':                                  AlmaViewItConfig[];
  'Personalize Your Results Disciplines Fields':         MappingTable[];
  'Personal Setting Fields':                             MappingTable[];
  'Photocopy Request Detailed Display':                  MappingTable[];
  'Call Slip Optional Request Parameters':               MappingTable[];
  'Requests Brief Display':                              MappingTable[];
  'My Account Menu Configuration - OvP':                 MappingTable[];
  'Report a Problem':                                    MappingTable[];
  'Resource Recommender Config':                         MappingTable[];
  'Alma ViewIt Config':                                  AlmaViewItConfig[];
  'My Account Links':                                    any[];
  sort_fields_config:                                    MappingTable[];
  'Institution Properties':                              AlmaViewItConfig[];
  'View Properties':                                     MappingTable[];
  'Resource Sharing Request Parameters':                 MappingTable[];
  'Featured newspapers':                                 MappingTable[];
  'Controlled Digital Lending Request Detailed Display': MappingTable[];
  'Digitization Optional Request Parameters':            MappingTable[];
  'Purchase Request Optional Parameters':                MappingTable[];
  'Loans Detailed Display':                              MappingTable[];
  'Actions List':                                        MappingTable[];
  'Nde otb Actions List':                                MappingTable[];
  'Share Action Configuration':                          AlmaViewItConfig[];
  'NDE Quick Filters':                                   AlmaViewItConfig[];
  'Nde Export Actions':                                  AlmaViewItConfig[];
  'Nde Share Actions':                                   AlmaViewItConfig[];
  'Recent Searches Configuration':                       AlmaViewItConfig[];
  'Hypertext Linking Definitions':                       MappingTable[];
  'Browse Lists':                                        MappingTable[];
  'Holdings Display In Locations List':                  HoldingsDisplayInLocationsList[];
  'Loans Brief Display':                                 MappingTable[];
  'ILL Optional Request Parameters':                     MappingTable[];
  'Voice Languages':                                     MappingTable[];
  'Bulk Definition':                                     AlmaViewItConfig[];
  'Items Brief Display':                                 MappingTable[];
  'Photocopy Optional Request Parameters':               MappingTable[];
  'User Login Links':                                    UserLoginLink[];
  'Acquisition Request Detailed Display':                MappingTable[];
  primo_central_institutions_unique_ids:                  AlmaViewItConfig[];
  'Fines Detailed Display':                              MappingTable[];
  'ILL Request Detailed Display':                        MappingTable[];
  'Personal Details Configuration':                      AlmaViewItConfig[];
  'Prima Filter Bar Resource Types':                     MappingTable[];
  'Call Slip Request Detailed Display':                   MappingTable[];
  'Featured Results':                                    MappingTable[];
  'Fines Brief Display':                                 MappingTable[];
  'Hold Optional Request Parameters':                    MappingTable[];
  'Location Item content':                               MappingTable[];
  'Short Loan and Booking Request Detailed Display':     MappingTable[];
  'Voice Search Languages Activation':                   any[];
  'General Configuration':                               AlmaViewItConfig[];
  'consortia member codes':                              any[];
  'get it prefilter locations':                          any[];
  'Auto Complete Configuration':                         MappingTable[];
  'Main Menu URLs for the New UI':                       any[];
  'direct linking config':                               MappingTable[];
  'Citation styles':                                     AlmaViewItConfig[];
  'Export RIS encodings':                                AlmaViewItConfig[];
  'Recall Optional Request Parameters':                  MappingTable[];
  'Hold/Recall Request Detailed Display':                MappingTable[];
  'Holdings Record Configuration':                       MappingTable[];
  'Institution Base URLs':                               MappingTable[];
  'User Dashboard Configuration':                        MappingTable[];
  'Full Record Services':                                MappingTable[];
  'Currency Subset':                                     MappingTable[];
  'User Area Links':                                     MappingTable[];
  'Alma To Rapido Request Status Mapping':               MappingTable[];
  'Rapido Request Optional Parameters':                  MappingTable[];
  'Primo VE A-Z Languages':                              MappingTable[];
  'DEI Term Configuration':                              MappingTable[];
  'May Also Be Found At':                                MappingTable[];
  'Authority Search Scopes':                             MappingTable[];
  'Authority Search Sort':                               MappingTable[];
}

export interface MappingTable {
  target: string;
  source1: string;
  source2?: string;
  source3?: string;
  source4?: string;
  source5?: string;
  source6?: string;
}

export interface AlmaViewItConfig {
  target: string;
  source1: string;
}

export interface HoldingsDisplayInLocationsList {
  target: string;
  source2: string;
}

export interface UserLoginLink {
  source1: string;
  source2?: string;
}

export interface PrimoView {
  'available-tabs': string[];
  institution: Institution;
  'pc-availability-tab-scopes-map': TabScopesMap;
  'view-org-level': ViewOrgLevel;
  'attributes-map': AttributesMap;
  'auto-complete-enabled-map': AutoCompleteEnabledMap;
  scopes: Scope[];
  'cdi-ft-search-tab-scopes-map': TabScopesMap;
  timeout: Timeout;
  'is-union-catalog-view': boolean;
  'display-unpaywall-links': boolean;
  display_quick_links: string;
}

export interface AttributesMap {
  tabsRemote: string;
  css: string;
  sessionTimeoutURL: string;
  interfaceLanguageOptions: string;
  threeLettersLanguagesOptions: string;
  libCard: string;
  defaultUserInstitution: string;
  customerCode: string;
  layout: string;
  bulkSizeOptions: string;
  institution: string;
  bulkSize: string;
  supportedDocumentsLanguageOptions: string;
  interfaceLanguage: string;
  institutionCode: string;
  mobileCss: string;
  ownerInstituionCode: string;
  citationTrailsEnabled: boolean;
  citationTrailsFilterByAvailability: boolean;
  selectedFacetLocation: string;
  personalizationEnabled: boolean;
  moreLikeCourse: boolean;
  moreLikeCollection: boolean;
  collectionDiscoveryEnabled: boolean;
  displayNewspapersLink: boolean;
  displayFeaturedNewspapers: boolean;
  refEntryActive: boolean;
  relatedItemsActive: boolean;
  legantoURLTemplate: string;
  multilingualConfigurationEnabled: boolean;
  journalCategoriesTree: boolean;
  newspaperSearchFilterByAvailability: boolean;
  displayVoiceSearch: boolean;
  displayLibraryNameLocationFacet: boolean;
  virtualBrowseType: string;
  editMyLibraryCard: boolean;
  mayAlsoBeHeldByEnabled: boolean;
}

export interface AutoCompleteEnabledMap {
  CentralIndex: boolean;
  MyInst_and_CI: boolean;
  DeepSearch: boolean;
  WorldCat: boolean;
  jsearch_scope: boolean;
  Ebsco: boolean;
  Webhook: boolean;
  Research: boolean;
  MyInstitution: boolean;
}

export interface TabScopesMap {
  Everything: { [key: string]: string };
  CentralIndex: { [key: string]: string };
}

export interface Institution {
  description: string;
  id: number;
  'org-fields': ViewOrgLevel;
  'is-org-fields-set': boolean;
  'institution-code': string;
  'institution-name': string;
  'last-modified-time-stamp': string;
  'updated-by': string;
  'newspapers-search': boolean;
}

export interface ViewOrgLevel {
  'customer-code': string;
  'customer-id': number;
  'institution-id': number;
  'institution-code': string;
  'network-zone-code': string;
}

export interface Scope {
  'scope-id': string;
  locations: string;
  types: string;
  tab: string;
  'tab-id-for-scope-matching': string;
  'contains-central-index-scope': boolean;
}

export interface Timeout {
  'guest-ui-timeout': string;
}

export interface SystemConfiguration {
  'Session Timeout': string;
  Auto_Complete_Server_URL: string;
  'FE UI - Scrolling Threshold': string;
  Auto_Complete_Feature_Enabled: string;
  'Use local fields 30-39 as lateral links': string;
  showICPLicenseFooter: string;
  manualAlternativeEmailRS: boolean;
  GATHER_SEARCH_STAT: string;
  GATHER_PAGE_STAT: string;
  'Show More (replaces scrolling) Threshold': string;
  RUM_URL: string;
  Alma_Version: string;
  disable_cache: boolean;
  skip_delivery: boolean;
  skip_delivery_for_collection_discovery: boolean;
  skip_relations_delivery: boolean;
  split_mms_query: boolean;
  split_facets_max_wait: number;
  split_facets_wait_interval: number;
  Proxy_Server: string;
  'Show ICP License Footer': string;
  'request item availability check timeout': string;
  hostLB: string;
  unionViewScopeSuffix: string;
  ngrs_enabled: boolean;
  ngrs_implementation_mode: boolean;
  temp_rs_stop_using_rapido_delivery_in_discovery: boolean;
  cdi_enable_global_title_catalog: boolean;
  ngrs_pickup_anywhere: boolean;
  rapido_allow_physical_request_for_eBook_offer: boolean;
  temp_rapido_locate_serial_multivolume_offers: boolean;
  rapido_lender_supply_directly_to_patron: boolean;
  request_it_enabled: boolean;
  activeAccessModelEnabled: boolean;
  number_of_representations: string;
  use_facet_in_creator_hyperlink: boolean;
  tmp_enable_results_per_page: boolean;
  number_of_results_per_page_series: string;
  activate_suspend_watchers_for_browser: string;
  disable_suspend_watchers_for_x_results: string;
  rapido_hide_how_to_get_it_section: boolean;
  delivery_bulk_from_brief: boolean;
  brief_results_journal_coverage: boolean;
  view_it_show_all_results: boolean;
  facet_alphanumeric_icelandic_sort: boolean;
  use_expanded_db_label: boolean;
  use_rapido_functionality: boolean;
  allow_self_registration: boolean;
  self_registration_types: string;
  hide_rapido_expand_link_map: HideRapidoExpandLinkMap;
  subjects_alphabetical_sort_fullDisplay: boolean;
  'Activate Captcha [Y/N]': string;
  'Public Captcha Key': string;
  async_brief_result_delivery: boolean;
  display_holdings_without_waiting: boolean;
  enable_direct_linking_in_record_full_view: boolean;
  hide_rapido_offers_tiles: boolean;
  rapido_hide_section_when_user_not_logged_in: boolean;
  rapido_hide_blank_form_link_when_user_not_logged_in: boolean;
  hide_rapido_section_for_hide_service_rs: boolean;
  rapido_SA_rapidill_mode: boolean;
  rapido_SA_enabled: boolean;
  rapido_hide_get_it_user_groups: AdditionalLocationIcons;
  rapido_hide_blank_form_link_user_groups: AdditionalLocationIcons;
  default_user_search_history_off: boolean;
  equals_search_operator_hypertext_linking_enabled: boolean;
  allow_start_with_for_call_number: boolean;
  allow_activity_on_transferred_finesfees: boolean;
  display_entity_info_card: boolean;
  primoVE_remove_duplicate_records_in_virtual_browse: boolean;
  rapido_show_physical_journal_offer: boolean;
  primo_ve_enable_browse_search_paging: boolean;
  direct_login_transfer_all_parameters: boolean;
  default_sort_newspaper_by_date_newest: boolean;
  alphabetical_sort_pickup_inst_lib: boolean;
  primoVE_my_account_number_of_requests: string;
  nde_number_of_services_to_display_view_it: string;
  NDE_number_of_email_signed_in_user_allow_to_send: number;
  display_location_level_in_getIt_single_location: boolean;
  enable_nde_feedback: boolean;
  primoVE_is_supposed_to_calc_physical_service_id_for_external_record: boolean;
  allow_emails_for_signed_in_users_only: boolean;
  display_sms_wanted: boolean;
  primo_patron_info_updatable: boolean;
  currency_symbol: string;
  auto_switch_quicklinks: boolean;
  equals_search_operator_hypertext_linking_enabled_title_field: boolean;
  equals_search_operator_hypertext_linking_enabled_author_field: boolean;
  equals_search_operator_hypertext_linking_enabled_subject_field: boolean;
  view_for_digital_viewer: string;
  enable_entity_autocomplete: boolean;
  default_hold_request_type: string;
  booking_hour_format: string;
  booking_request_minutes_policy: string;
  syndetics_unbound_url: string;
  logo_url: string;
  show_researcher_assistant_by_widget: boolean;
  show_researcher_assistant_by_icon: boolean;
  enable_research_assistant_for: 'users' | 'on_campus' | 'everyone';
  save_users_ra_search_history: boolean;
  enable_natural_language_search: boolean;
  display_hypertext_linking_journalAndDB_search: boolean;
  display_embedded_viewer_nde: boolean;
  person_entity_autocomplete_server_url: string;
  multi_entity_server_url: string;
  consortia_library_card_default_display: string;
  esploro_enabled: boolean;
  special_collections_enable: boolean;
  enforce_strong_password: boolean;
  enable_search_inside_journal: boolean;
  display_register_button_by_restricted_user_groups: boolean;
  primo_loan_list_sorting: string;
}

export interface HideRapidoExpandLinkMap {
  Everything: boolean;
  CentralIndex: boolean;
  SearchWebhook: boolean;
  DeepSearch: boolean;
  WorldCat: boolean;
  Ebsco: boolean;
  Research: boolean;
  CourseReserves: boolean;
  LibraryCatalog: boolean;
}

export interface TabToTiles {
  Everything: string[];
  CentralIndex: string[];
  jsearch_slot: string[];
  SearchWebhook: string[];
  DeepSearch: string[];
  WorldCat: string[];
  Ebsco: string[];
  Research: string[];
  LibraryCatalog: string[];
}

export interface Tiles {
  FacetTileInterface: { [key: string]: FacetTileInterface };
  MainMenuTileInterface: Record<string, MainMenuTileInterface>;
  ResultFullTileInterface: { [key: string]: ResultFullTileInterface };
  ResultTileInterface: { [key: string]: ResultTileInterface };
  LocationsTileInterface: { [key: string]: LocationsTileInterface };
  SearchTileInterface: { [key: string]: SearchTileInterface };
}

export interface FacetTileInterface {
  toplevelfacet: boolean;
  toplevelsidefacet: boolean;
  generalpageactions: boolean;
  facetview: Facetview[];
  relatedfacetview: AdditionalLocationIcons;
  id: string;
}

export interface Facetview {
  display: boolean;
  viewinstsort: boolean;
  instsort: boolean;
  valid: boolean;
  count: number;
  sort: FacetSort;
  id: string;
  useTranslations: boolean;
}

export interface FacetSort {
  _string: string;
  _int: number;
}

export interface LocationsTileInterface {
  viewinstsort: boolean;
  rta: string;
  displayholdingsfilters: boolean;
  filtersop: string;
  instsort: boolean;
  id: string;
}

export interface MainMenuTileInterface {
  mainview: Mainview[];
  id: string;
}

export interface Mainview {
  url: string;
  label: string;
  target: string;
  authRequired: boolean;
  isExternal: boolean;
}

export interface ResultFullTileInterface {
  eshelf: boolean;
  delimiter: string;
  getitbutton: boolean;
  resultlinks: Resultlink[];
  resultitemview: Resultitemview[];
  id: string;
}

export interface Resultitemview {
  items: string;
  displayInViewer: boolean;
}

export interface Resultlink {
  links: string;
}

export interface ResultTileInterface {
  ilsapi: boolean;
  bulksize: number;
  eshelf: boolean;
  showsnip: boolean;
  resultview: Resultview[];
  facebookenabled: boolean;
  linkabletitle: string;
  sortby: string;
  frbrdisplay: number;
  frbrsortby: string;
  tabsorder: Tabsorder;
  getall: boolean;
  showsnipifnotfound: boolean;
  boostinst: boolean;
  numofresults: number;
  id: string;
  displaysigninmsg: boolean;
  groupmessage: number;
}

export interface Resultview {
  items: string;
  delimiter: string;
}

export interface Tabsorder {
  items: string;
}

export interface SearchTileInterface {
  qtvinstance: Qtvinstance[];
  prefiltersenable: boolean;
  indexedPrefiltersenable: boolean;
  resourcetypePrefiltersenable: boolean;
  alphabeticLanguagesSort: boolean;
}

export interface Qtvinstance {
  qtvid: string;
}

export type SearchHeaderType = 'journal' | 'newspaper' | 'database' | 'authority' | 'browse';

export interface SavedSearchInterface {
  ID?: string;
  alert: boolean;
  creationDate: string;
  deepLink: string;
  searchParams?: SearchParamsWithStrParams;
  vid: string | undefined;
  lang: string;
  email?: string;
  notificationName?: string;
  mode?: string | undefined;
  tab?: string;
  sr: string;
  encCtxt: string;
  rsscreated: boolean;
  syncedWithDB: boolean;
  searchAsGuestId?: string;
}

export interface AtozLanguage {
  order: number;
  languageCode: string;
  languageLabel: string;
  letters: string[];
  include_0_9: boolean;
}
